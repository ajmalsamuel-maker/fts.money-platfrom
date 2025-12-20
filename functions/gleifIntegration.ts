import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GLEIF_API_BASE = 'https://api.gleif.org/api/v1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, lei, entity_type, entity_id } = await req.json();

        // Verify LEI with GLEIF API
        if (action === 'verify_lei') {
            const response = await fetch(`${GLEIF_API_BASE}/lei-records/${lei}`);
            
            if (!response.ok) {
                return Response.json({
                    success: false,
                    error: 'LEI not found in GLEIF registry',
                    lei_status: 'invalid'
                });
            }

            const data = await response.json();
            const leiData = data.data.attributes;
            const entity = leiData.entity;

            // Check if LEI is active
            const isActive = entity.status === 'ACTIVE';
            const expiryDate = new Date(leiData.registration.nextRenewalDate);
            const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

            // Store credential
            const credential = await base44.asServiceRole.entities.LEICredential.create({
                entity_type,
                entity_id,
                entity_name: entity.legalName?.name || 'Unknown',
                lei,
                lei_status: isActive ? 'active' : 'lapsed',
                verification_method: 'gleif_api',
                issued_date: new Date().toISOString(),
                expiry_date: leiData.registration.nextRenewalDate,
                last_verified: new Date().toISOString(),
                gleif_data: {
                    legal_name: entity.legalName?.name || 'Unknown',
                    legal_address: entity.legalAddress,
                    registration_authority: typeof entity.registeredAs === 'string' ? entity.registeredAs : (entity.registeredAs?.id || 'N/A'),
                    registration_number: typeof entity.registeredAt === 'string' ? entity.registeredAt : (entity.registeredAt?.id || 'N/A'),
                    jurisdiction: entity.jurisdiction || 'N/A',
                    category: entity.category || 'N/A',
                    status: entity.status || 'ACTIVE'
                },
                compliance_status: {
                    lei_compliant: isActive && daysUntilExpiry > 30,
                    vlei_compliant: false,
                    days_remaining: daysUntilExpiry
                }
            });

            return Response.json({
                success: true,
                lei_valid: isActive,
                credential_id: credential.id,
                days_until_expiry: daysUntilExpiry,
                legal_name: leiData.entity.legalName.name,
                jurisdiction: leiData.entity.jurisdiction,
                status: leiData.entity.status
            });
        }

        // Issue vLEI credential (mock for now - real implementation needs GLEIF vLEI API)
        if (action === 'issue_vlei') {
            const credential = await base44.asServiceRole.entities.LEICredential.filter({ lei, entity_id });
            
            if (!credential || credential.length === 0) {
                return Response.json({
                    success: false,
                    error: 'LEI must be verified before issuing vLEI'
                }, { status: 400 });
            }

            const leiCred = credential[0];

            // Generate keypair (in production, use HSM)
            const keyPair = await crypto.subtle.generateKey(
                {
                    name: "ECDSA",
                    namedCurve: "P-256"
                },
                true,
                ["sign", "verify"]
            );

            const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

            // Create W3C Verifiable Credential (simplified)
            const vleiCredential = {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiableCredential", "LEICredential"],
                "issuer": "did:web:fts.money",
                "issuanceDate": new Date().toISOString(),
                "expirationDate": leiCred.expiry_date,
                "credentialSubject": {
                    "id": `did:lei:${lei}`,
                    "lei": lei,
                    "legalName": leiCred.entity_name,
                    "entityType": entity_type
                },
                "proof": {
                    "type": "EcdsaSecp256k1Signature2019",
                    "created": new Date().toISOString(),
                    "verificationMethod": `did:web:fts.money#key-1`,
                    "publicKey": publicKeyJwk
                }
            };

            // Update credential with vLEI
            await base44.asServiceRole.entities.LEICredential.update(leiCred.id, {
                vlei_credential: JSON.stringify(vleiCredential),
                vlei_status: 'active',
                public_key: JSON.stringify(publicKeyJwk),
                private_key_ref: `hsm://key-${leiCred.id}`,
                compliance_status: {
                    ...leiCred.compliance_status,
                    vlei_compliant: true
                }
            });

            return Response.json({
                success: true,
                vlei_credential: vleiCredential,
                credential_id: leiCred.id
            });
        }

        // Verify credential chain
        if (action === 'verify_chain') {
            const { credential_chain } = await req.json();
            
            // Verify each LEI in chain exists and is active
            const verifications = await Promise.all(
                credential_chain.map(async (chainLei) => {
                    const response = await fetch(`${GLEIF_API_BASE}/lei-records/${chainLei}`);
                    return {
                        lei: chainLei,
                        valid: response.ok,
                        status: response.ok ? (await response.json()).data.attributes.entity.status : 'INVALID'
                    };
                })
            );

            const allValid = verifications.every(v => v.valid && v.status === 'ACTIVE');

            return Response.json({
                success: true,
                chain_valid: allValid,
                verifications
            });
        }

        // Check compliance status for entity
        if (action === 'check_compliance') {
            const credentials = await base44.asServiceRole.entities.LEICredential.filter({ entity_id });
            
            if (!credentials || credentials.length === 0) {
                // Calculate grace period (6 months from entity creation)
                const entity = await base44.asServiceRole.entities.ProvisionedPSP.filter({ id: entity_id });
                const createdDate = new Date(entity[0]?.created_date || Date.now());
                const gracePeriodEnd = new Date(createdDate.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months
                const daysRemaining = Math.floor((gracePeriodEnd - new Date()) / (1000 * 60 * 60 * 24));

                return Response.json({
                    success: true,
                    compliant: false,
                    in_grace_period: daysRemaining > 0,
                    days_remaining: daysRemaining,
                    grace_period_end: gracePeriodEnd.toISOString(),
                    action_required: daysRemaining < 30 ? 'urgent' : 'required'
                });
            }

            const cred = credentials[0];
            const expiryDate = new Date(cred.expiry_date);
            const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

            return Response.json({
                success: true,
                compliant: cred.compliance_status.lei_compliant && cred.compliance_status.vlei_compliant,
                lei_status: cred.lei_status,
                vlei_status: cred.vlei_status,
                days_until_expiry: daysUntilExpiry,
                credential_chain: cred.credential_chain
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('GLEIF integration error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});