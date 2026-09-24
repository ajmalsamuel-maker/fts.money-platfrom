import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pricing_id, scenario } = await req.json();

        // Fetch the master pricing
        const pricing = await base44.asServiceRole.entities.MasterPricing.filter({ id: pricing_id });
        if (!pricing || pricing.length === 0) {
            return Response.json({ error: 'Pricing not found' }, { status: 404 });
        }

        const masterPricing = pricing[0];

        // Simulation scenarios
        const scenarios = scenario || {
            monthly_volumes: [10000, 50000, 100000, 500000, 1000000],
            avg_transaction_size: 100,
            psp_count: 10
        };

        const results = {
            pricing_item: masterPricing.item_name,
            simulations: []
        };

        // Simulate for each volume level
        for (const volume of scenarios.monthly_volumes) {
            const transactionCount = volume / scenarios.avg_transaction_size;
            
            // Calculate costs
            let buyRate = 0;
            if (masterPricing.buy_rate_type === 'percentage') {
                buyRate = (volume * (masterPricing.buy_rate_percentage / 100)) + 
                         (transactionCount * (masterPricing.buy_rate_fixed || 0));
            } else if (masterPricing.buy_rate_type === 'fixed') {
                buyRate = transactionCount * (masterPricing.buy_rate_fixed || 0);
            }

            // Calculate revenue
            let sellRate = 0;
            if (masterPricing.sell_rate_type === 'percentage') {
                sellRate = (volume * (masterPricing.sell_rate_percentage / 100)) + 
                          (transactionCount * (masterPricing.sell_rate_fixed || 0));
            } else if (masterPricing.sell_rate_type === 'fixed') {
                sellRate = transactionCount * (masterPricing.sell_rate_fixed || 0);
            }

            // Calculate margin
            const margin = sellRate - buyRate;
            const marginPercentage = (margin / sellRate) * 100;

            // Per PSP calculations
            const perPSP = {
                cost: buyRate / scenarios.psp_count,
                revenue: sellRate / scenarios.psp_count,
                margin: margin / scenarios.psp_count
            };

            results.simulations.push({
                monthly_volume: volume,
                transaction_count: transactionCount,
                total_cost: buyRate.toFixed(2),
                total_revenue: sellRate.toFixed(2),
                total_margin: margin.toFixed(2),
                margin_percentage: marginPercentage.toFixed(2),
                per_psp_cost: perPSP.cost.toFixed(2),
                per_psp_revenue: perPSP.revenue.toFixed(2),
                per_psp_margin: perPSP.margin.toFixed(2)
            });
        }

        // Add recommendations
        const recommendations = [];
        
        // Check if margin is too low
        const avgMargin = results.simulations.reduce((sum, s) => sum + parseFloat(s.margin_percentage), 0) / results.simulations.length;
        if (avgMargin < 10) {
            recommendations.push({
                type: 'warning',
                message: `Average margin (${avgMargin.toFixed(2)}%) is below 10%. Consider increasing sell rate.`,
                suggested_sell_rate_percentage: (masterPricing.sell_rate_percentage * 1.15).toFixed(2),
                impact: 'Would increase margin by approximately 5%'
            });
        }

        // Check for volume-based optimization
        const highVolumeMargin = parseFloat(results.simulations[results.simulations.length - 1].margin_percentage);
        const lowVolumeMargin = parseFloat(results.simulations[0].margin_percentage);
        if (highVolumeMargin > lowVolumeMargin + 5) {
            recommendations.push({
                type: 'optimization',
                message: 'Consider implementing tiered pricing to optimize margins across volume ranges',
                suggested_action: 'Create volume-based pricing tiers'
            });
        }

        results.recommendations = recommendations;
        results.optimization_score = avgMargin > 20 ? 90 : avgMargin > 15 ? 75 : avgMargin > 10 ? 60 : 40;

        return Response.json({ 
            success: true,
            results 
        });

    } catch (error) {
        console.error('Pricing simulation error:', error);
        return Response.json({ 
            error: 'Simulation failed', 
            details: error.message 
        }, { status: 500 });
    }
});