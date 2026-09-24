import { query, execute, closeConnection } from './db/postgresClient.js';

// Fetch LEI data from GLEIF API
async function fetchGLEIFData(lei) {
    try {
        const response = await fetch(`https://api.gleif.org/api/v1/lei-records/${lei}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        const record = data.data;
        const attributes = record.attributes;
        
        return {
            lei: attributes.lei,
            legal_name: attributes.entity.legalName.name,
            legal_jurisdiction: attributes.entity.legalAddress.country,
            registration_authority: attributes.entity.registeredAs,
            registration_date: attributes.registration.initialRegistrationDate,
            last_updated: attributes.registration.lastUpdateDate,
            next_renewal: attributes.registration.nextRenewalDate,
            status: attributes.registration.status,
            managing_lou: attributes.registration.managingLou,
            raw_data: attributes
        };
    } catch (error) {
        console.error('GLEIF API error:', error);
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        const { action, lei } = await req.json();

        // Verify and enrich LEI data from GLEIF
        if (action === 'verify_lei') {
            const gleifData = await fetchGLEIFData(lei);
            
            if (!gleifData) {
                return Response.json({
                    success: false,
                    verified: false,
                    error: 'LEI not found in GLEIF database'
                });
            }

            return Response.json({
                success: true,
                verified: true,
                data: gleifData
            });
        }

        // Monitor all entities for LEI compliance
        if (action === 'check_all_compliance') {
            const [psps, merchants] = await Promise.all([
                query(`SELECT * FROM provisioned_psp`, []),
                query(`SELECT * FROM merchant`, [])
            ]);
            
            const results = { psps: [], merchants: [], summary: { compliant: 0, in_grace_period: 0, non_compliant: 0 } };
            
            // Quick compliance check
            for (const psp of psps) {
                const credentials = await query(`SELECT * FROM lei_credential WHERE entity_type = 'psp' AND entity_id = $1`, [psp.id]);
                const created = new Date(psp.created_date);
                const gracePeriodEnd = new Date(created.getTime() + 180 * 24 * 60 * 60 * 1000);
                const daysRemaining = Math.floor((gracePeriodEnd - new Date()) / (1000 * 60 * 60 * 24));

                if (credentials.length === 0) {
                    results.summary[daysRemaining > 0 ? 'in_grace_period' : 'non_compliant']++;
                    if (daysRemaining < 0) {
                        await execute(`UPDATE provisioned_psp SET status = 'suspended' WHERE id = $1`, [psp.id]);
                    }
                } else {
                    results.summary.compliant++;
                }
                results.psps.push({ psp_code: psp.psp_code, status: credentials.length > 0 ? 'compliant' : 'non_compliant' });
            }

            for (const merchant of merchants) {
                const credentials = await query(`SELECT * FROM lei_credential WHERE entity_type = 'merchant' AND entity_id = $1`, [merchant.id]);
                results.merchants.push({ merchant_code: merchant.merchant_code, status: credentials.length > 0 ? 'compliant' : 'non_compliant' });
                if (credentials.length > 0) results.summary.compliant++;
                else results.summary.in_grace_period++;
            }

            await closeConnection();
            return Response.json({ success: true, results, checked_at: new Date().toISOString() });
        }

        if (action === 'get_dashboard') {
            const [allCredentials, allPSPs, allMerchants] = await Promise.all([
                query(`SELECT * FROM lei_credential`, []),
                query(`SELECT * FROM provisioned_psp`, []),
                query(`SELECT * FROM merchant`, [])
            ]);

            const dashboard = {
                global_stats: {
                    total_leis_issued: allCredentials.length,
                    compliance_rate: allPSPs.length > 0 ? (allCredentials.filter(c => c.entity_type === 'psp').length / allPSPs.length * 100).toFixed(1) : '0.0',
                    last_gleif_sync: new Date().toISOString(),
                    total_entities: allPSPs.length + allMerchants.length
                },
                by_entity_type: {
                    psps: { total: allPSPs.length, with_lei: allCredentials.filter(c => c.entity_type === 'psp').length },
                    merchants: { total: allMerchants.length, with_lei: allCredentials.filter(c => c.entity_type === 'merchant').length }
                }
            };

            await closeConnection();
            return Response.json({ success: true, dashboard });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Compliance error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});