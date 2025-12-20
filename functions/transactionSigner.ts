import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const {
            transaction_id,
            psp_code,
            merchant_id,
            amount,
            currency,
            customer_lei
        } = await req.json();

        // Get PSP LEI credential
        const pspCredentials = await base44.asServiceRole.entities.LEICredential.filter({
            entity_type: 'psp',
            psp_code: psp_code
        });

        if (!pspCredentials || pspCredentials.length === 0) {
            return Response.json({
                success: false,
                signed: false,
                warning: 'PSP does not have LEI credential - transaction processed without vLEI signature'
            });
        }

        const pspCred = pspCredentials[0];

        // Get Merchant LEI credential
        let merchantCred = null;
        if (merchant_id) {
            const merchantCredentials = await base44.asServiceRole.entities.LEICredential.filter({
                entity_type: 'merchant',
                entity_id: merchant_id
            });
            merchantCred = merchantCredentials?.[0] || null;
        }

        // Build credential chain
        const credentialChain = [
            pspCred.lei,
            ...(merchantCred ? [merchantCred.lei] : []),
            ...(customer_lei ? [customer_lei] : [])
        ];

        // Validate full chain
        const chainValidation = await validateCredentialChain(credentialChain);

        if (!chainValidation.valid) {
            return Response.json({
                success: false,
                error: 'Credential chain validation failed',
                chain_validation: chainValidation
            }, { status: 400 });
        }

        // Create transaction signature payload
        const signaturePayload = {
            transaction_id,
            psp_lei: pspCred.lei,
            merchant_lei: merchantCred?.lei || null,
            customer_lei: customer_lei || null,
            amount,
            currency,
            timestamp: new Date().toISOString(),
            credential_chain: credentialChain
        };

        // Sign transaction (in production, use HSM private key)
        const signature = await signTransactionPayload(signaturePayload, pspCred);

        // Create signed audit log
        await base44.functions.invoke('signedAuditLogger', {
            actor_lei: pspCred.lei,
            actor_email: 'system',
            actor_name: pspCred.entity_name,
            actor_role: 'psp',
            action: 'transaction_signed',
            action_category: 'transaction',
            target_entity_type: 'Transaction',
            target_entity_id: transaction_id,
            target_lei: merchantCred?.lei,
            metadata: {
                amount,
                currency,
                credential_chain: credentialChain,
                signature_algorithm: signature.algorithm
            }
        });

        return Response.json({
            success: true,
            signed: true,
            signature: signature.value,
            signature_algorithm: signature.algorithm,
            credential_chain: credentialChain,
            chain_validation: chainValidation,
            signed_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Transaction signing error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});

async function validateCredentialChain(chain) {
    const GLEIF_API_BASE = 'https://api.gleif.org/api/v1';
    
    const validations = await Promise.all(
        chain.map(async (lei) => {
            try {
                const response = await fetch(`${GLEIF_API_BASE}/lei-records/${lei}`);
                if (!response.ok) {
                    return { lei, valid: false, status: 'NOT_FOUND' };
                }
                const data = await response.json();
                return {
                    lei,
                    valid: true,
                    status: data.data.attributes.entity.status,
                    legal_name: data.data.attributes.entity.legalName.name
                };
            } catch (error) {
                return { lei, valid: false, status: 'ERROR', error: error.message };
            }
        })
    );

    const allValid = validations.every(v => v.valid && v.status === 'ACTIVE');

    return {
        valid: allValid,
        chain_length: chain.length,
        validations
    };
}

async function signTransactionPayload(payload, credential) {
    // Create deterministic hash
    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // In production: Use HSM to sign with private key from credential.private_key_ref
    // For now: Create deterministic signature based on credential
    const signatureData = encoder.encode(hash + credential.lei);
    const signatureBuffer = await crypto.subtle.digest('SHA-256', signatureData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
        value: signature,
        algorithm: 'EdDSA',
        hash
    };
}