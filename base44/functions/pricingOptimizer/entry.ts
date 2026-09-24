import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, pricing_id, market_data } = await req.json();

        if (action === 'analyze') {
            // Fetch pricing item
            const pricing = await base44.asServiceRole.entities.MasterPricing.filter({ id: pricing_id });
            if (!pricing || pricing.length === 0) {
                return Response.json({ error: 'Pricing not found' }, { status: 404 });
            }

            const item = pricing[0];
            const suggestions = [];

            // Analyze margin
            const margin = item.margin_percentage || 0;
            if (margin < 10) {
                suggestions.push({
                    priority: 'high',
                    category: 'margin',
                    message: 'Margin below 10% threshold',
                    recommendation: `Increase sell rate from ${item.sell_rate_percentage}% to ${(item.sell_rate_percentage * 1.15).toFixed(2)}%`,
                    impact: {
                        revenue_increase: '+15%',
                        margin_increase: '+5%'
                    }
                });
            }

            // Check for market benchmarks
            if (market_data) {
                const avgMarketRate = market_data.average_rate || item.sell_rate_percentage * 1.1;
                const competitivePosition = item.sell_rate_percentage < avgMarketRate * 0.95 ? 'below_market' :
                                           item.sell_rate_percentage > avgMarketRate * 1.05 ? 'above_market' : 'at_market';

                if (competitivePosition === 'below_market') {
                    suggestions.push({
                        priority: 'medium',
                        category: 'market_position',
                        message: 'Pricing below market average',
                        recommendation: `Market average is ${avgMarketRate.toFixed(2)}%. Consider increasing to match market.`,
                        impact: {
                            revenue_increase: `+${((avgMarketRate - item.sell_rate_percentage) / item.sell_rate_percentage * 100).toFixed(1)}%`
                        }
                    });
                }

                // Update benchmark data
                await base44.asServiceRole.entities.MasterPricing.update(pricing_id, {
                    market_benchmark: {
                        average_market_rate: avgMarketRate,
                        competitive_position: competitivePosition,
                        last_updated: new Date().toISOString()
                    }
                });
            }

            // Check for tiered pricing opportunity
            if (!item.sell_rate_tiers || item.sell_rate_tiers.length === 0) {
                suggestions.push({
                    priority: 'low',
                    category: 'structure',
                    message: 'Volume-based pricing could increase retention',
                    recommendation: 'Implement tiered pricing: 0-10k (current rate), 10k-100k (-5%), 100k+ (-10%)',
                    impact: {
                        volume_increase: '+20%',
                        customer_retention: '+15%'
                    }
                });
            }

            // Calculate optimization score
            let score = 100;
            if (margin < 10) score -= 30;
            else if (margin < 15) score -= 15;
            if (market_data && competitivePosition === 'below_market') score -= 20;
            if (market_data && competitivePosition === 'above_market') score -= 10;
            if (!item.sell_rate_tiers || item.sell_rate_tiers.length === 0) score -= 15;

            // Update pricing with suggestions
            await base44.asServiceRole.entities.MasterPricing.update(pricing_id, {
                optimization_score: score,
                optimization_suggestions: suggestions.map(s => s.message)
            });

            return Response.json({
                success: true,
                optimization_score: score,
                suggestions,
                current_pricing: {
                    sell_rate: item.sell_rate_percentage,
                    margin: item.margin_percentage,
                    competitive_position: item.market_benchmark?.competitive_position || 'unknown'
                }
            });

        } else if (action === 'apply_suggestion') {
            const { suggestion_type, new_values } = await req.json();

            await base44.asServiceRole.entities.MasterPricing.update(pricing_id, {
                ...new_values,
                version: `v${Date.now()}`,
                notes: `Optimized based on ${suggestion_type} recommendation`
            });

            return Response.json({
                success: true,
                message: 'Pricing optimized successfully'
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Pricing optimization error:', error);
        return Response.json({ 
            error: 'Optimization failed', 
            details: error.message 
        }, { status: 500 });
    }
});