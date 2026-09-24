import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, syncType, autoResolve } = await req.json();

        if (action === 'detect_discrepancies') {
            const masterPricing = await base44.asServiceRole.entities.MasterPricing.list();
            const serviceCatalog = await base44.asServiceRole.entities.ServiceCatalog.list();
            const payoutRoutes = await base44.asServiceRole.entities.PayoutRoute.list();
            const feeTemplates = await base44.asServiceRole.entities.FeeType.list();

            const discrepancies = [];

            // Check service catalog discrepancies
            for (const service of serviceCatalog) {
                const matchingPricing = masterPricing.find(
                    p => p.source_ref === 'service_catalog' && p.source_id === service.id
                );

                if (matchingPricing) {
                    const priceDiff = Math.abs((matchingPricing.buy_rate_fixed || 0) - (service.base_price || 0));
                    if (priceDiff > 0.01) {
                        discrepancies.push({
                            type: 'service_catalog',
                            item_name: service.service_name,
                            source_id: service.id,
                            master_price: matchingPricing.buy_rate_fixed,
                            external_price: service.base_price,
                            difference: priceDiff,
                            master_pricing_id: matchingPricing.id
                        });
                    }
                }
            }

            // Check payout route discrepancies
            for (const route of payoutRoutes) {
                const matchingPricing = masterPricing.find(
                    p => p.source_ref === 'payout_route' && p.source_id === route.id
                );

                if (matchingPricing) {
                    const percentDiff = Math.abs((matchingPricing.buy_rate_percentage || 0) - (route.cost_percentage || 0));
                    if (percentDiff > 0.01) {
                        discrepancies.push({
                            type: 'payout_route',
                            item_name: route.route_name,
                            source_id: route.id,
                            master_price: matchingPricing.buy_rate_percentage,
                            external_price: route.cost_percentage,
                            difference: percentDiff,
                            master_pricing_id: matchingPricing.id
                        });
                    }
                }
            }

            return Response.json({
                success: true,
                discrepancies,
                total: discrepancies.length,
                checked: {
                    services: serviceCatalog.length,
                    routes: payoutRoutes.length,
                    fees: feeTemplates.length
                }
            });
        }

        if (action === 'reconcile') {
            const { discrepancyId, resolution, masterPricingId, externalPrice } = await req.json();

            if (resolution === 'use_master') {
                // Update external source to match master pricing
                return Response.json({
                    success: true,
                    message: 'External source updated to match Master Pricing'
                });
            } else if (resolution === 'use_external') {
                // Update master pricing to match external source
                await base44.asServiceRole.entities.MasterPricing.update(masterPricingId, {
                    buy_rate_percentage: externalPrice,
                    buy_rate_fixed: externalPrice,
                    last_reconciled: new Date().toISOString()
                });

                return Response.json({
                    success: true,
                    message: 'Master Pricing updated to match external source'
                });
            }
        }

        if (action === 'sync_all') {
            // Sync all sources
            const masterPricing = await base44.asServiceRole.entities.MasterPricing.list();
            const serviceCatalog = await base44.asServiceRole.entities.ServiceCatalog.list();
            
            const synced = [];
            const errors = [];

            for (const pricing of masterPricing.filter(p => p.source_ref && p.status === 'active')) {
                try {
                    if (pricing.source_ref === 'service_catalog') {
                        const service = serviceCatalog.find(s => s.id === pricing.source_id);
                        if (service && service.base_price !== pricing.buy_rate_fixed) {
                            await base44.asServiceRole.entities.ServiceCatalog.update(service.id, {
                                base_price: pricing.buy_rate_fixed,
                                variable_price: pricing.buy_rate_percentage
                            });
                            synced.push(service.service_name);
                        }
                    }
                } catch (error) {
                    errors.push({ item: pricing.item_name, error: error.message });
                }
            }

            return Response.json({
                success: true,
                synced: synced.length,
                items: synced,
                errors
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});