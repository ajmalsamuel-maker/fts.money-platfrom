import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action } = await req.json();

        // Monitor all PSPs and Merchants for LEI compliance
        if (action === 'check_all_compliance') {
            const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
            const merchants = await base44.asServiceRole.entities.Merchant.list();
            
            const results = {
                psps: [],
                merchants: [],
                summary: {
                    total_entities: psps.length + merchants.length,
                    compliant: 0,
                    in_grace_period: 0,
                    non_compliant: 0,
                    warnings_sent: 0,
                    suspensions_scheduled: 0
                }
            };

            // Check PSPs
            for (const psp of psps) {
                const credentials = await base44.asServiceRole.entities.LEICredential.filter({
                    entity_type: 'psp',
                    entity_id: psp.id
                });

                const createdDate = new Date(psp.created_date);
                const gracePeriodEnd = new Date(createdDate.getTime() + 180 * 24 * 60 * 60 * 1000);
                const daysRemaining = Math.floor((gracePeriodEnd - new Date()) / (1000 * 60 * 60 * 24));

                if (credentials.length === 0) {
                    // No LEI credential
                    const inGracePeriod = daysRemaining > 0;
                    
                    const status = {
                        psp_code: psp.psp_code,
                        psp_name: psp.psp_name,
                        status: inGracePeriod ? 'grace_period' : 'non_compliant',
                        days_remaining: daysRemaining,
                        grace_period_end: gracePeriodEnd.toISOString(),
                        action_required: daysRemaining < 0 ? 'suspend' : daysRemaining < 30 ? 'urgent' : 'required'
                    };

                    results.psps.push(status);
                    
                    if (inGracePeriod) {
                        results.summary.in_grace_period++;
                        
                        // Send warning at 30, 14, 7, 1 days remaining
                        if ([30, 14, 7, 1].includes(daysRemaining)) {
                            await base44.integrations.Core.SendEmail({
                                to: psp.owner_email,
                                subject: `LEI Compliance Required - ${daysRemaining} Days Remaining`,
                                body: `Your PSP "${psp.psp_name}" must obtain a Legal Entity Identifier (LEI) within ${daysRemaining} days to remain compliant. Visit https://www.gleif.org to register.`
                            });
                            results.summary.warnings_sent++;
                        }
                    } else {
                        results.summary.non_compliant++;
                        results.summary.suspensions_scheduled++;
                        
                        // Schedule suspension
                        await base44.asServiceRole.entities.ProvisionedPSP.update(psp.id, {
                            status: 'suspended',
                            lei_status: 'expired'
                        });
                    }
                } else {
                    const cred = credentials[0];
                    const expiryDate = new Date(cred.expiry_date);
                    const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

                    if (cred.lei_status === 'active' && daysUntilExpiry > 30) {
                        results.summary.compliant++;
                        results.psps.push({
                            psp_code: psp.psp_code,
                            psp_name: psp.psp_name,
                            status: 'compliant',
                            lei: cred.lei,
                            vlei_status: cred.vlei_status,
                            days_until_expiry: daysUntilExpiry
                        });
                    } else {
                        results.summary.in_grace_period++;
                        results.psps.push({
                            psp_code: psp.psp_code,
                            psp_name: psp.psp_name,
                            status: 'expiring_soon',
                            lei: cred.lei,
                            days_until_expiry: daysUntilExpiry,
                            action_required: 'renew_lei'
                        });

                        // Send renewal reminder
                        if ([30, 14, 7].includes(daysUntilExpiry)) {
                            await base44.integrations.Core.SendEmail({
                                to: psp.owner_email,
                                subject: `LEI Renewal Required - ${daysUntilExpiry} Days Until Expiry`,
                                body: `Your LEI ${cred.lei} expires in ${daysUntilExpiry} days. Please renew via your LEI provider to maintain compliance.`
                            });
                            results.summary.warnings_sent++;
                        }
                    }
                }
            }

            // Check Merchants (similar logic)
            for (const merchant of merchants) {
                const credentials = await base44.asServiceRole.entities.LEICredential.filter({
                    entity_type: 'merchant',
                    entity_id: merchant.id
                });

                const createdDate = new Date(merchant.created_date);
                const gracePeriodEnd = new Date(createdDate.getTime() + 180 * 24 * 60 * 60 * 1000);
                const daysRemaining = Math.floor((gracePeriodEnd - new Date()) / (1000 * 60 * 60 * 24));

                if (credentials.length === 0) {
                    const inGracePeriod = daysRemaining > 0;
                    
                    results.merchants.push({
                        merchant_code: merchant.merchant_code,
                        business_name: merchant.business_name,
                        status: inGracePeriod ? 'grace_period' : 'non_compliant',
                        days_remaining: daysRemaining,
                        action_required: daysRemaining < 0 ? 'suspend' : daysRemaining < 30 ? 'urgent' : 'required'
                    });

                    if (inGracePeriod) {
                        results.summary.in_grace_period++;
                        
                        if ([30, 14, 7, 1].includes(daysRemaining)) {
                            await base44.integrations.Core.SendEmail({
                                to: merchant.email,
                                subject: `LEI Compliance Required - ${daysRemaining} Days Remaining`,
                                body: `Your merchant account "${merchant.business_name}" requires an LEI within ${daysRemaining} days.`
                            });
                            results.summary.warnings_sent++;
                        }
                    } else {
                        results.summary.non_compliant++;
                        results.summary.suspensions_scheduled++;
                        
                        // Suspend merchant
                        await base44.asServiceRole.entities.Merchant.update(merchant.id, {
                            status: 'suspended',
                            onboarding_status: 'suspended_lei_required'
                        });
                    }
                } else {
                    results.summary.compliant++;
                    results.merchants.push({
                        merchant_code: merchant.merchant_code,
                        business_name: merchant.business_name,
                        status: 'compliant',
                        lei: credentials[0].lei
                    });
                }
            }

            return Response.json({
                success: true,
                results,
                checked_at: new Date().toISOString()
            });
        }

        // Get compliance dashboard data
        if (action === 'get_dashboard') {
            const allCredentials = await base44.asServiceRole.entities.LEICredential.list();
            const allPSPs = await base44.asServiceRole.entities.ProvisionedPSP.list();
            const allMerchants = await base44.asServiceRole.entities.Merchant.list();

            const dashboard = {
                global_stats: {
                    total_leis_issued: allCredentials.length,
                    active_vleis: allCredentials.filter(c => c.vlei_status === 'active').length,
                    compliance_rate: (allCredentials.length / (allPSPs.length + allMerchants.length) * 100).toFixed(1),
                    entities_in_grace_period: 0,
                    entities_at_risk: 0
                },
                by_entity_type: {
                    psps: {
                        total: allPSPs.length,
                        with_lei: allCredentials.filter(c => c.entity_type === 'psp').length,
                        with_vlei: allCredentials.filter(c => c.entity_type === 'psp' && c.vlei_status === 'active').length
                    },
                    merchants: {
                        total: allMerchants.length,
                        with_lei: allCredentials.filter(c => c.entity_type === 'merchant').length,
                        with_vlei: allCredentials.filter(c => c.entity_type === 'merchant' && c.vlei_status === 'active').length
                    }
                },
                upcoming_expirations: allCredentials
                    .filter(c => {
                        const daysUntilExpiry = Math.floor((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                        return daysUntilExpiry < 60 && daysUntilExpiry > 0;
                    })
                    .map(c => ({
                        lei: c.lei,
                        entity_name: c.entity_name,
                        entity_type: c.entity_type,
                        days_remaining: Math.floor((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
                    }))
            };

            return Response.json({
                success: true,
                dashboard
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('Compliance monitor error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});