import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,
            lei,
            legal_name,
            organizational_roles
        } = await req.json();

        if (action === 'initialize') {
            // Check if platform LEI already exists
            const existing = await base44.asServiceRole.entities.PlatformLEI.list();
            
            if (existing && existing.length > 0) {
                return Response.json({
                    success: false,
                    error: 'Platform LEI already initialized',
                    existing_lei: existing[0].lei
                }, { status: 400 });
            }

            // Verify LEI with GLEIF
            const GLEIF_API_BASE = 'https://api.gleif.org/api/v1';
            let gleifData = null;
            let leiStatus = 'pending_verification';

            try {
                const response = await fetch(`${GLEIF_API_BASE}/lei-records/${lei}`);
                if (response.ok) {
                    const data = await response.json();
                    const entity = data.data.attributes.entity;
                    
                    gleifData = {
                        legal_name: entity.legalName?.name || legal_name,
                        legal_address: entity.legalAddress,
                        registration_authority: typeof entity.registeredAs === 'string' ? entity.registeredAs : (entity.registeredAs?.id || 'N/A'),
                        registration_number: typeof entity.registeredAt === 'string' ? entity.registeredAt : (entity.registeredAt?.id || 'N/A'),
                        jurisdiction: entity.jurisdiction || 'N/A',
                        category: entity.category || 'N/A',
                        status: entity.status || 'ACTIVE'
                    };
                    leiStatus = entity.status === 'ACTIVE' ? 'active' : 'pending_verification';
                }
            } catch (error) {
                console.warn('GLEIF verification failed, proceeding with manual entry:', error.message);
            }

            // Generate platform keypair (in production, use HSM)
            const publicKey = await generatePublicKey();

            // Calculate 6-month grace periods for vLEI, OOR, and ECR
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

            // Create platform LEI record
            const platformLEI = await base44.asServiceRole.entities.PlatformLEI.create({
                lei,
                legal_name,
                lei_status: leiStatus,
                vlei_status: 'not_issued',
                vlei_grace_period_end: sixMonthsFromNow.toISOString().split('T')[0],
                oor_grace_period_end: sixMonthsFromNow.toISOString().split('T')[0],
                ecr_grace_period_end: sixMonthsFromNow.toISOString().split('T')[0],
                public_key: publicKey,
                issuer_lei: 'GLEIF_ROOT',
                issued_date: new Date().toISOString(),
                expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                last_verified: new Date().toISOString(),
                gleif_data: gleifData,
                organizational_roles: organizational_roles || [],
                downstream_entities: {
                    total_psps: 0,
                    lei_compliant_psps: 0,
                    total_merchants: 0,
                    lei_compliant_merchants: 0
                }
            });

            // Create platform LEI credential in LEICredential entity for chain validation
            await base44.asServiceRole.entities.LEICredential.create({
                credential_id: `PLATFORM-${lei}`,
                entity_type: 'platform',
                entity_id: 'FTS_PLATFORM',
                entity_name: legal_name,
                lei,
                lei_status: leiStatus,
                vlei_status: 'not_issued',
                parent_lei: null, // Root of chain
                credential_chain: [lei],
                public_key: publicKey,
                issuer_lei: 'GLEIF_ROOT',
                issued_date: new Date().toISOString(),
                expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                last_verified: new Date().toISOString(),
                gleif_data: gleifData,
                auto_renewal: true
            });

            // Create signed audit log
            await base44.asServiceRole.functions.invoke('signedAuditLogger', {
                actor_lei: lei,
                actor_email: user.email,
                actor_name: legal_name,
                actor_role: 'platform_admin',
                action: 'platform_lei_initialized',
                action_category: 'compliance',
                target_entity_type: 'PlatformLEI',
                target_entity_id: lei,
                metadata: {
                    legal_name,
                    lei_status: leiStatus,
                    gleif_verified: !!gleifData
                }
            });

            return Response.json({
                success: true,
                platform_lei: platformLEI,
                message: 'Platform LEI initialized successfully'
            });
        }

        if (action === 'get') {
            const platformLEIs = await base44.asServiceRole.entities.PlatformLEI.list();
            return Response.json({
                success: true,
                platform_lei: platformLEIs[0] || null
            });
        }

        if (action === 'update_roles') {
            const platformLEIs = await base44.asServiceRole.entities.PlatformLEI.list();
            if (!platformLEIs || platformLEIs.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Platform LEI not initialized'
                }, { status: 400 });
            }

            const updated = await base44.asServiceRole.entities.PlatformLEI.update(platformLEIs[0].id, {
                organizational_roles
            });

            return Response.json({
                success: true,
                platform_lei: updated
            });
        }

        if (action === 'issue_vlei') {
            const platformLEIs = await base44.asServiceRole.entities.PlatformLEI.list();
            if (!platformLEIs || platformLEIs.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Platform LEI not initialized'
                }, { status: 400 });
            }

            const platformLEI = platformLEIs[0];

            // Create simplified vLEI credential
            const vleiCredential = {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiableCredential", "LegalEntityCredential"],
                "issuer": "did:lei:GLEIF_ROOT",
                "issuanceDate": new Date().toISOString(),
                "credentialSubject": {
                    "id": `did:lei:${platformLEI.lei}`,
                    "legalName": platformLEI.legal_name,
                    "lei": platformLEI.lei,
                    "leiStatus": platformLEI.lei_status
                },
                "proof": {
                    "type": "Ed25519Signature2020",
                    "created": new Date().toISOString(),
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": `did:lei:${platformLEI.lei}#key-1`
                }
            };

            const updated = await base44.asServiceRole.entities.PlatformLEI.update(platformLEI.id, {
                vlei_credential: JSON.stringify(vleiCredential),
                vlei_status: 'active'
            });

            // Update LEICredential as well
            const leiCreds = await base44.asServiceRole.entities.LEICredential.filter({
                entity_type: 'platform',
                lei: platformLEI.lei
            });

            if (leiCreds && leiCreds.length > 0) {
                await base44.asServiceRole.entities.LEICredential.update(leiCreds[0].id, {
                    vlei_credential: JSON.stringify(vleiCredential),
                    vlei_status: 'active'
                });
            }

            return Response.json({
                success: true,
                platform_lei: updated,
                vlei_credential: vleiCredential
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('Platform LEI initialization error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});

async function generatePublicKey() {
    const keyData = crypto.getRandomValues(new Uint8Array(32));
    const keyArray = Array.from(keyData);
    return keyArray.map(b => b.toString(16).padStart(2, '0')).join('');
}