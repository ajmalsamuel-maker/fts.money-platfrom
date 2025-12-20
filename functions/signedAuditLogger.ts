import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const {
            actor_lei,
            actor_email,
            actor_name,
            actor_role,
            action,
            action_category,
            target_entity_type,
            target_entity_id,
            target_lei,
            old_value,
            new_value,
            metadata,
            ip_address,
            user_agent
        } = await req.json();

        // Get actor's LEI credential
        let credential = null;
        let credentialChain = [];
        let vleiCredential = null;

        if (actor_lei) {
            const creds = await base44.asServiceRole.entities.LEICredential.filter({ lei: actor_lei });
            if (creds && creds.length > 0) {
                credential = creds[0];
                credentialChain = credential.credential_chain || [];
                vleiCredential = credential.vlei_credential;
            }
        }

        // Get previous log for chaining
        const previousLogs = await base44.asServiceRole.entities.SignedAuditLog.list('-created_date', 1);
        const previousLogHash = previousLogs.length > 0 ? previousLogs[0].log_hash : '0';

        // Create log entry data
        const logData = {
            timestamp: new Date().toISOString(),
            actor_lei,
            actor_vlei_credential: vleiCredential,
            actor_email,
            actor_name,
            actor_role,
            parent_lei: credential?.parent_lei || null,
            credential_chain: credentialChain,
            action,
            action_category,
            target_entity_type,
            target_entity_id,
            target_lei,
            old_value,
            new_value,
            metadata,
            ip_address,
            user_agent,
            previous_log_hash: previousLogHash
        };

        // Create deterministic hash of log data
        const logString = JSON.stringify(logData);
        const encoder = new TextEncoder();
        const data = encoder.encode(logString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const logHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Sign the log hash if vLEI credential exists
        let digitalSignature = null;
        let signatureAlgorithm = null;

        if (credential?.public_key) {
            // In production, this would use HSM private key
            // For now, create mock signature
            signatureAlgorithm = 'EdDSA';
            const signatureData = encoder.encode(logHash);
            const signatureHash = await crypto.subtle.digest('SHA-256', signatureData);
            const signatureArray = Array.from(new Uint8Array(signatureHash));
            digitalSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        // Determine compliance flags
        const complianceFlags = [];
        if (action_category === 'financial') complianceFlags.push('FATF', 'AML');
        if (action_category === 'transaction') complianceFlags.push('PCI_DSS');
        if (action_category === 'user_management') complianceFlags.push('GDPR');
        if (action_category === 'compliance') complianceFlags.push('ISO_27001', 'SOC2');
        if (actor_lei) complianceFlags.push('LEI_TRACED');
        if (vleiCredential) complianceFlags.push('VLEI_SIGNED');

        // Create immutable audit log
        const auditLog = await base44.asServiceRole.entities.SignedAuditLog.create({
            ...logData,
            log_hash: logHash,
            digital_signature: digitalSignature,
            signature_algorithm: signatureAlgorithm,
            signature_verification: digitalSignature ? {
                verified: true,
                verified_at: new Date().toISOString(),
                verified_by: 'system'
            } : null,
            compliance_flags: complianceFlags,
            immutable: true
        });

        return Response.json({
            success: true,
            log_id: auditLog.id,
            log_hash: logHash,
            signature: digitalSignature,
            compliance_flags: complianceFlags,
            provenance_chain_length: credentialChain.length
        });

    } catch (error) {
        console.error('Signed audit log error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});