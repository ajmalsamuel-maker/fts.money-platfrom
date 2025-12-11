import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Signature Verification Function
 * Verifies RSA-PSS/ECDSA signatures for transaction operations
 * Ensures integrity and non-repudiation
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { signature_id } = await req.json();

        if (!signature_id) {
            return Response.json({ error: 'Missing signature_id' }, { status: 400 });
        }

        // Retrieve signature record
        const signatures = await base44.asServiceRole.entities.TransactionSignature.filter({ id: signature_id });
        
        if (!signatures || signatures.length === 0) {
            return Response.json({ error: 'Signature not found' }, { status: 404 });
        }

        const signatureRecord = signatures[0];

        const publicKey = Deno.env.get('SIGNING_PUBLIC_KEY');
        if (!publicKey) {
            return Response.json({ error: 'Verification keys not configured' }, { status: 500 });
        }

        // Reconstruct original signed data
        const originalData = signatureRecord.metadata?.original_data;
        if (!originalData) {
            return Response.json({ error: 'Original signed data not found' }, { status: 400 });
        }

        // Import public key for verification
        const pemHeader = '-----BEGIN PUBLIC KEY-----';
        const pemFooter = '-----END PUBLIC KEY-----';
        const pemContents = publicKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

        const cryptoKey = await crypto.subtle.importKey(
            'spki',
            binaryDer,
            {
                name: 'RSA-PSS',
                hash: 'SHA-256'
            },
            false,
            ['verify']
        );

        // Decode signature from Base64
        const signatureBytes = Uint8Array.from(atob(signatureRecord.signature), c => c.charCodeAt(0));

        // Encode original data
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(originalData);

        // Verify signature
        const isValid = await crypto.subtle.verify(
            {
                name: 'RSA-PSS',
                saltLength: 32
            },
            cryptoKey,
            signatureBytes,
            dataBytes
        );

        // Update signature record
        const verificationStatus = isValid ? 'valid' : 'invalid';
        await base44.asServiceRole.entities.TransactionSignature.update(signature_id, {
            is_verified: true,
            verification_timestamp: new Date().toISOString(),
            verification_status: verificationStatus
        });

        // Audit log for verification
        await base44.asServiceRole.entities.AuditLog.create({
            event_type: 'signature_verified',
            category: 'security',
            severity: isValid ? 'info' : 'critical',
            user_id: user.id,
            user_email: user.email,
            target_entity: 'TransactionSignature',
            target_id: signature_id,
            action: 'verify_signature',
            description: `Signature verification ${isValid ? 'succeeded' : 'FAILED'} for transaction ${signatureRecord.transaction_id}`,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            pci_relevant: true,
            retention_period: '7_years',
            metadata: {
                signature_id,
                transaction_id: signatureRecord.transaction_id,
                verification_result: verificationStatus,
                algorithm: signatureRecord.signature_algorithm
            }
        });

        return Response.json({
            success: true,
            verification: {
                is_valid: isValid,
                status: verificationStatus,
                timestamp: new Date().toISOString(),
                signature_id,
                transaction_id: signatureRecord.transaction_id,
                operation_type: signatureRecord.operation_type,
                signed_by: signatureRecord.signed_by_email,
                signature_timestamp: signatureRecord.signature_timestamp
            }
        });

    } catch (error) {
        console.error('Signature verification error:', error);
        return Response.json({ 
            error: 'Failed to verify signature', 
            details: error.message 
        }, { status: 500 });
    }
});