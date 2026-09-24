import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

// Calculate total cost for a route
function calculateRouteCost(route, amount) {
    return (amount * (route.cost_percentage / 100)) + (route.cost_fixed || 0);
}

// Score routes based on cost, speed, and success rate
function scoreRoute(route, amount, criteria) {
    const { prioritize = 'balanced' } = criteria;
    
    const cost = calculateRouteCost(route, amount);
    const costScore = 100 - (cost / amount * 100); // Lower cost = higher score
    
    const speedScores = {
        instant: 100,
        same_day: 80,
        next_day: 60,
        '2_3_days': 40,
        '3_5_days': 20
    };
    const speedScore = speedScores[route.speed] || 50;
    
    const reliabilityScore = route.success_rate || 90;
    
    // Weight scores based on priority
    const weights = {
        cost: prioritize === 'cost' ? 0.6 : prioritize === 'speed' ? 0.2 : 0.4,
        speed: prioritize === 'speed' ? 0.6 : prioritize === 'cost' ? 0.2 : 0.4,
        reliability: 0.2
    };
    
    return (costScore * weights.cost) + (speedScore * weights.speed) + (reliabilityScore * weights.reliability);
}

// Select best route
function selectBestRoute(routes, amount, currency, country, criteria = {}) {
    // Filter applicable routes
    const applicableRoutes = routes.filter(route => {
        if (route.status !== 'active') return false;
        if (!route.supported_currencies?.includes(currency)) return false;
        if (route.countries?.length > 0 && !route.countries.includes(country)) return false;
        if (route.min_amount && amount < route.min_amount) return false;
        if (route.max_amount && amount > route.max_amount) return false;
        return true;
    });
    
    if (applicableRoutes.length === 0) {
        throw new Error('No applicable payout routes found');
    }
    
    // Score and sort routes
    const scoredRoutes = applicableRoutes.map(route => ({
        ...route,
        score: scoreRoute(route, amount, criteria),
        estimated_cost: calculateRouteCost(route, amount)
    }));
    
    scoredRoutes.sort((a, b) => b.score - a.score);
    
    return scoredRoutes[0];
}

Deno.serve(async (req) => {
    try {
        const { action, ...payload } = await req.json();
        
        switch (action) {
            case 'calculate_routes': {
                const { amount, currency, country } = payload;
                
                const routes = await query(
                    `SELECT * FROM payout_route WHERE status = 'active'`,
                    []
                );
                
                const applicableRoutes = routes.filter(route => {
                    const supportedCurrencies = route.supported_currencies || [];
                    const routeCountries = route.countries || [];
                    
                    if (!supportedCurrencies.includes(currency)) return false;
                    if (routeCountries.length > 0 && !routeCountries.includes(country)) return false;
                    if (route.min_amount && amount < route.min_amount) return false;
                    if (route.max_amount && amount > route.max_amount) return false;
                    return true;
                });
                
                const routesWithCosts = applicableRoutes.map(route => ({
                    ...route,
                    estimated_cost: calculateRouteCost(route, amount),
                    estimated_net: amount - calculateRouteCost(route, amount)
                }));
                
                await closeConnection();
                return Response.json({ 
                    success: true, 
                    routes: routesWithCosts.sort((a, b) => a.estimated_cost - b.estimated_cost)
                });
            }
            
            case 'process_payout': {
                const { merchant_id, amount, currency, country, beneficiary, criteria } = payload;
                
                const routes = await query(
                    `SELECT * FROM payout_route WHERE status = 'active'`,
                    []
                );
                
                const selectedRoute = selectBestRoute(routes, amount, currency, country, criteria);
                const payoutId = `PAYOUT-${Date.now()}`;
                const estimatedCost = calculateRouteCost(selectedRoute, amount);

                await execute(
                    `INSERT INTO payout (merchant_id, amount, currency, route_id, route_name, channel_type, provider, estimated_cost, status, beneficiary_name, beneficiary_account, country)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [merchant_id, amount, currency, selectedRoute.id, selectedRoute.route_name, selectedRoute.channel_type, selectedRoute.provider, estimatedCost, 'processing', beneficiary?.name, beneficiary?.account, country]
                );

                // Simulate completion after 2 seconds
                setTimeout(async () => {
                    await execute(
                        `UPDATE payout SET status = 'completed', completed_date = NOW() WHERE id = $1`,
                        [payoutId]
                    );
                }, 2000);
                
                await closeConnection();
                return Response.json({ 
                    success: true, 
                    payout_id: payoutId,
                    amount,
                    status: 'processing',
                    selected_route: selectedRoute
                });
            }
            
            case 'reconcile_payouts': {
                const { merchant_id } = payload;
                
                const payouts = await query(
                    `SELECT * FROM payout WHERE merchant_id = $1 AND status = 'completed'`,
                    [merchant_id]
                );
                
                const transactions = await query(
                    `SELECT * FROM transaction WHERE merchant_id = $1 AND type = 'payout'`,
                    [merchant_id]
                );
                
                const reconciled = [];
                const unmatched = [];
                
                payouts.forEach(payout => {
                    const match = transactions.find(t => 
                        t.amount === payout.amount && 
                        Math.abs(new Date(t.created_date) - new Date(payout.created_date)) < 86400000
                    );
                    
                    if (match) {
                        reconciled.push({ payout, transaction: match });
                    } else {
                        unmatched.push(payout);
                    }
                });
                
                await closeConnection();
                return Response.json({
                    success: true,
                    reconciled: reconciled.length,
                    unmatched: unmatched.length
                });
            }
            
            case 'get_balance': {
                const { merchant_id } = payload;
                
                const balances = await query(
                    `SELECT * FROM merchant_balance WHERE merchant_id = $1`,
                    [merchant_id]
                );
                
                const total = balances.reduce((sum, b) => sum + (b.available_balance || 0), 0);
                const pending = balances.reduce((sum, b) => sum + (b.pending_balance || 0), 0);
                
                await closeConnection();
                return Response.json({
                    success: true,
                    total_available: total,
                    total_pending: pending,
                    by_currency: balances
                });
            }
            
            default:
                await closeConnection();
                return Response.json({ error: 'Unknown action' }, { status: 400 });
        }
        
    } catch (error) {
        await closeConnection();
        console.error('Payout orchestrator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});