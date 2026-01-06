import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
            const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
            const merchants = await base44.asServiceRole.entities.Merchant.list();
            const isoCustomers = await base44.asServiceRole.entities.ISOGatewayCustomer.list();
            const orchCustomers = await base44.asServiceRole.entities.OrchestrationCustomer.list();
            const cryptoCustomers = await base44.asServiceRole.entities.CryptoGatewayCustomer.list();
            const rwaProviders = await base44.asServiceRole.entities.RWAWhiteLabelCustomer.list();
            const assetIssuers = await base44.asServiceRole.entities.AssetIssuer.list();
            
            const results = {
                psps: [],
                merchants: [],
                iso_gateway: [],
                orchestration: [],
                crypto_banking: [],
                rwa_providers: [],
                asset_issuers: [],
                summary: {
                    total_entities: psps.length + merchants.length + isoCustomers.length + 
                                   orchCustomers.length + cryptoCustomers.length + 
                                   rwaProviders.length + assetIssuers.length,
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

                // If LEI exists, verify against GLEIF
                if (credentials.length > 0) {
                    const cred = credentials[0];
                    const gleifData = await fetchGLEIFData(cred.lei);
                    
                    if (gleifData) {
                        // Update credential with live GLEIF data
                        await base44.asServiceRole.entities.LEICredential.update(cred.id, {
                            lei_status: gleifData.status === 'ISSUED' ? 'active' : 
                                       gleifData.status === 'LAPSED' ? 'expired' : 'pending',
                            entity_name: gleifData.legal_name,
                            issuer: gleifData.managing_lou,
                            renewal_date: gleifData.next_renewal,
                            last_verified_date: new Date().toISOString(),
                            gleif_data: gleifData.raw_data,
                            verification_status: 'verified'
                        });
                    }
                }

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

            // Check ISO Gateway Customers
            for (const customer of isoCustomers) {
                const credentials = await base44.asServiceRole.entities.LEICredential.filter({
                    entity_type: 'iso_gateway',
                    entity_id: customer.id
                });

                if (credentials.length > 0) {
                    const gleifData = await fetchGLEIFData(credentials[0].lei);
                    if (gleifData) {
                        await base44.asServiceRole.entities.LEICredential.update(credentials[0].id, {
                            lei_status: gleifData.status === 'ISSUED' ? 'active' : 'expired',
                            entity_name: gleifData.legal_name,
                            last_verified_date: new Date().toISOString()
                        });
                    }
                    results.summary.compliant++;
                    results.iso_gateway.push({
                        customer_name: customer.company_name,
                        status: 'compliant',
                        lei: credentials[0].lei
                    });
                } else {
                    results.summary.in_grace_period++;
                    results.iso_gateway.push({
                        customer_name: customer.company_name,
                        status: 'grace_period'
                    });
                }
            }

            // Check Orchestration Customers
            for (const customer of orchCustomers) {
                const credentials = await base44.asServiceRole.entities.LEICredential.filter({
                    entity_type: 'orchestration',
                    entity_id: customer.id
                });

                if (credentials.length > 0) {
                    results.summary.compliant++;
                    results.orchestration.push({
                        customer_name: customer.company_name,
                        status: 'compliant',
                        lei: credentials[0].lei
                    });
                } else {
                    results.summary.in_grace_period++;
                }
            }

            // Check Crypto Banking Customers
            for (const customer of cryptoCustomers) {
                const credentials = await base44.asServiceRole.entities.LEICredential.filter({
                    entity_type: 'crypto_banking',
                    entity_id: customer.id
                });

                if (credentials.length > 0) {
                    const gleifData = await fetchGLEIFData(credentials[0].lei);
                    if (gleifData) {
                        await base44.asServiceRole.entities.LEICredential.update(credentials[0].id, {
                            lei_status: gleifData.status === 'ISSUED' ? 'active' : 'expired',
                            last_verified_date: new Date().toISOString()
                        });
                    }
                    results.summary.compliant++;
                    results.crypto_banking.push({
                        customer_name: customer.company_name,
                        status: 'compliant',
                        lei: credentials[0].lei
                    });
                } else {
                    results.summary.in_grace_period++;
                }
            }

            // Check RWA Platform Providers
            for (const provider of rwaProviders) {
                const credentials = await base44.asServiceRole.entities.LEICredential.filter({
                    entity_type: 'rwa_provider',
                    entity_id: provider.id
                });

                if (credentials.length > 0) {
                    results.summary.compliant++;
                    results.rwa_providers.push({
                        provider_name: provider.company_name,
                        status: 'compliant',
                        lei: credentials[0].lei
                    });
                } else {
                    results.summary.in_grace_period++;
                }
            }

            // Check Asset Issuers
            for (const issuer of assetIssuers) {
                const credentials = await base44.asServiceRole.entities.LEICredential.filter({
                    entity_type: 'asset_issuer',
                    entity_id: issuer.id
                });

                if (credentials.length > 0) {
                    results.summary.compliant++;
                    results.asset_issuers.push({
                        issuer_name: issuer.company_name,
                        status: 'compliant',
                        lei: credentials[0].lei
                    });
                } else {
                    results.summary.in_grace_period++;
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
            const isoCustomers = await base44.asServiceRole.entities.ISOGatewayCustomer.list();
            const orchCustomers = await base44.asServiceRole.entities.OrchestrationCustomer.list();
            const cryptoCustomers = await base44.asServiceRole.entities.CryptoGatewayCustomer.list();
            const rwaProviders = await base44.asServiceRole.entities.RWAWhiteLabelCustomer.list();
            const assetIssuers = await base44.asServiceRole.entities.AssetIssuer.list();

            // Refresh GLEIF data for all credentials (background update)
            for (const cred of allCredentials) {
                const gleifData = await fetchGLEIFData(cred.lei);
                if (gleifData) {
                    await base44.asServiceRole.entities.LEICredential.update(cred.id, {
                        lei_status: gleifData.status === 'ISSUED' ? 'active' : 
                                   gleifData.status === 'LAPSED' ? 'expired' : 'pending',
                        entity_name: gleifData.legal_name,
                        renewal_date: gleifData.next_renewal,
                        last_verified_date: new Date().toISOString(),
                        gleif_data: gleifData.raw_data
                    });
                }
            }

            const totalEntities = allPSPs.length + allMerchants.length + isoCustomers.length + 
                                 orchCustomers.length + cryptoCustomers.length + 
                                 rwaProviders.length + assetIssuers.length;

            const dashboard = {
                global_stats: {
                    total_leis_issued: allCredentials.length,
                    active_vleis: allCredentials.filter(c => c.vlei_status === 'active').length,
                    compliance_rate: totalEntities > 0 ? (allCredentials.length / totalEntities * 100).toFixed(1) : '0.0',
                    entities_in_grace_period: 0,
                    entities_at_risk: 0,
                    last_gleif_sync: new Date().toISOString(),
                    total_entities: totalEntities
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
                    },
                    iso_gateway: {
                        total: isoCustomers.length,
                        with_lei: allCredentials.filter(c => c.entity_type === 'iso_gateway').length,
                        with_vlei: allCredentials.filter(c => c.entity_type === 'iso_gateway' && c.vlei_status === 'active').length
                    },
                    orchestration: {
                        total: orchCustomers.length,
                        with_lei: allCredentials.filter(c => c.entity_type === 'orchestration').length,
                        with_vlei: allCredentials.filter(c => c.entity_type === 'orchestration' && c.vlei_status === 'active').length
                    },
                    crypto_banking: {
                        total: cryptoCustomers.length,
                        with_lei: allCredentials.filter(c => c.entity_type === 'crypto_banking').length,
                        with_vlei: allCredentials.filter(c => c.entity_type === 'crypto_banking' && c.vlei_status === 'active').length
                    },
                    rwa_providers: {
                        total: rwaProviders.length,
                        with_lei: allCredentials.filter(c => c.entity_type === 'rwa_provider').length,
                        with_vlei: allCredentials.filter(c => c.entity_type === 'rwa_provider' && c.vlei_status === 'active').length
                    },
                    asset_issuers: {
                        total: assetIssuers.length,
                        with_lei: allCredentials.filter(c => c.entity_type === 'asset_issuer').length,
                        with_vlei: allCredentials.filter(c => c.entity_type === 'asset_issuer' && c.vlei_status === 'active').length
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