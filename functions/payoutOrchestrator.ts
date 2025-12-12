import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { action, ...payload } = await req.json();
        
        switch (action) {
            case 'calculate_routes': {
                const { amount, currency, country } = payload;
                
                const routes = await base44.asServiceRole.entities.PayoutRoute.filter({ 
                    status: 'active' 
                });
                
                const applicableRoutes = routes.filter(route => {
                    if (!route.supported_currencies?.includes(currency)) return false;
                    if (route.countries?.length > 0 && !route.countries.includes(country)) return false;
                    if (route.min_amount && amount < route.min_amount) return false;
                    if (route.max_amount && amount > route.max_amount) return false;
                    return true;
                });
                
                const routesWithCosts = applicableRoutes.map(route => ({
                    ...route,
                    estimated_cost: calculateRouteCost(route, amount),
                    estimated_net: amount - calculateRouteCost(route, amount)
                }));
                
                return Response.json({ 
                    success: true, 
                    routes: routesWithCosts.sort((a, b) => a.estimated_cost - b.estimated_cost)
                });
            }
            
            case 'process_payout': {
                const { merchant_id, amount, currency, country, beneficiary, criteria } = payload;
                
                // Get available routes
                const routes = await base44.asServiceRole.entities.PayoutRoute.filter({ 
                    status: 'active' 
                });
                
                // Select best route
                const selectedRoute = selectBestRoute(routes, amount, currency, country, criteria);
                
                // Create payout record
                const payout = await base44.asServiceRole.entities.Payout.create({
                    merchant_id,
                    amount,
                    currency,
                    route_id: selectedRoute.id,
                    route_name: selectedRoute.route_name,
                    channel_type: selectedRoute.channel_type,
                    provider: selectedRoute.provider,
                    estimated_cost: selectedRoute.estimated_cost,
                    status: 'processing',
                    beneficiary_name: beneficiary?.name,
                    beneficiary_account: beneficiary?.account,
                    country
                });
                
                // In production, integrate with actual provider APIs
                // For now, simulate processing
                setTimeout(async () => {
                    await base44.asServiceRole.entities.Payout.update(payout.id, {
                        status: 'completed',
                        completed_date: new Date().toISOString()
                    });
                }, 2000);
                
                return Response.json({ 
                    success: true, 
                    payout,
                    selected_route: selectedRoute
                });
            }
            
            case 'reconcile_payouts': {
                const { merchant_id, date_from, date_to } = payload;
                
                const payouts = await base44.asServiceRole.entities.Payout.filter({
                    merchant_id,
                    status: 'completed'
                });
                
                const transactions = await base44.asServiceRole.entities.Transaction.filter({
                    merchant_id,
                    type: 'payout'
                });
                
                // Match payouts with transactions
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
                
                return Response.json({
                    success: true,
                    reconciled: reconciled.length,
                    unmatched: unmatched.length,
                    details: { reconciled, unmatched }
                });
            }
            
            case 'get_balance': {
                const { merchant_id } = payload;
                
                const balances = await base44.asServiceRole.entities.MerchantBalance.filter({ 
                    merchant_id 
                });
                
                const total = balances.reduce((sum, b) => sum + (b.available_balance || 0), 0);
                const pending = balances.reduce((sum, b) => sum + (b.pending_balance || 0), 0);
                
                return Response.json({
                    success: true,
                    total_available: total,
                    total_pending: pending,
                    by_currency: balances
                });
            }
            
            default:
                return Response.json({ error: 'Unknown action' }, { status: 400 });
        }
        
    } catch (error) {
        console.error('Payout orchestrator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});