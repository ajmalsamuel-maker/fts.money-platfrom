import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Transaction Signing Function
 * Signs critical transaction operations (refund, void, settlement) using RSA-PSS/ECDSA
 * Implements non-repudiation for PCI DSS compliance
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            transaction_id, 
            operation_type, 
            transaction_data 
        } = await req.json();

        if (!transaction_id || !operation_type || !transaction_data) {
            return Response.json({ 
                error: 'Missing required fields: transaction_id, operation_type, transaction_data' 
            }, { status: 400 });
        }

        // Validate operation type
        const validOperations = ['refund', 'void', 'capture', 'settlement', 'chargeback'];
        if (!validOperations.includes(operation_type)) {
            return Response.json({ 
                error: `Invalid operation_type. Must be one of: ${validOperations.join(', ')}` 
            }, { status: 400 });
        }

        const privateKey = Deno.env.get('SIGNING_PRIVATE_KEY');
        if (!privateKey) {
            return Response.json({ error: 'Signing keys not configured' }, { status: 500 });
        }

        // Prepare data to sign (canonical JSON representation)
        const dataToSign = JSON.stringify({
            transaction_id,
            operation_type,
            merchant_id: transaction_data.merchant_id,
            amount: transaction_data.amount,
            currency: transaction_data.currency,
            timestamp: new Date().toISOString(),
            user_id: user.id,
            user_email: user.email
        });

        // Create hash of data
        const encoder = new TextEncoder();
        const data = encoder.encode(dataToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signedDataHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Import private key for signing
        const pemHeader = '-----BEGIN PRIVATE KEY-----';
        const pemFooter = '-----END PRIVATE KEY-----';
        const pemContents = privateKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

        const cryptoKey = await crypto.subtle.importKey(
            'pkcs8',
            binaryDer,
            {
                name: 'RSA-PSS',
                hash: 'SHA-256'
            },
            false,
            ['sign']
        );

        // Sign the data
        const signatureBuffer = await crypto.subtle.sign(
            {
                name: 'RSA-PSS',
                saltLength: 32
            },
            cryptoKey,
            data
        );

        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const signature = btoa(String.fromCharCode(...signatureArray));

        // Generate certificate fingerprint (SHA-256 of public key)
        const publicKey = Deno.env.get('SIGNING_PUBLIC_KEY');
        const pubKeyData = encoder.encode(publicKey);
        const fingerprintBuffer = await crypto.subtle.digest('SHA-256', pubKeyData);
        const fingerprintArray = Array.from(new Uint8Array(fingerprintBuffer));
        const certificateFingerprint = fingerprintArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Store transaction signature
        const transactionSignature = await base44.asServiceRole.entities.TransactionSignature.create({
            transaction_id,
            operation_type,
            signature,
            signature_algorithm: 'RSA-PSS-SHA256',
            signed_data: signedDataHash,
            signed_by: user.id,
            signed_by_email: user.email,
            signature_timestamp: new Date().toISOString(),
            certificate_fingerprint: certificateFingerprint,
            merchant_id: transaction_data.merchant_id,
            amount: transaction_data.amount,
            currency: transaction_data.currency,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            is_verified: false,
            metadata: {
                original_data: dataToSign
            }
        });

        // Create signed audit log
        await base44.asServiceRole.entities.AuditLog.create({
            event_type: 'transaction_signed',
            category: 'transaction',
            severity: 'info',
            user_id: user.id,
            user_email: user.email,
            target_entity: 'Transaction',
            target_id: transaction_id,
            action: `sign_${operation_type}`,
            description: `Transaction ${operation_type} operation signed by ${user.email}`,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            pci_relevant: true,
            retention_period: '7_years',
            signature,
            signature_algorithm: 'RSA-PSS-SHA256',
            signature_timestamp: new Date().toISOString(),
            signature_fingerprint: certificateFingerprint,
            metadata: {
                transaction_id,
                operation_type,
                amount: transaction_data.amount,
                currency: transaction_data.currency
            }
        });

        return Response.json({
            success: true,
            signature: {
                id: transactionSignature.id,
                signature,
                signature_algorithm: 'RSA-PSS-SHA256',
                signed_data_hash: signedDataHash,
                certificate_fingerprint: certificateFingerprint,
                timestamp: transactionSignature.signature_timestamp
            }
        });

    } catch (error) {
        console.error('Transaction signing error:', error);
        return Response.json({ 
            error: 'Failed to sign transaction', 
            details: error.message 
        }, { status: 500 });
    }
});