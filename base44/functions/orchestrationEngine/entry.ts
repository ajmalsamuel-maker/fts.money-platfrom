import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Orchestration Engine - Core routing logic
 * Used by PSP and ISO Gateway verticals
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, owner_type, owner_id, transaction_data } = await req.json();

        if (action === 'route') {
            // Find matching rules
            const rules = await base44.entities.OrchestrationRule.filter({
                owner_type,
                owner_id,
                status: 'active'
            }, 'priority');

            // Match first applicable rule
            let matchedRule = null;
            for (const rule of rules) {
                if (matchesConditions(transaction_data, rule.conditions)) {
                    matchedRule = rule;
                    break;
                }
            }

            if (!matchedRule) {
                return Response.json({
                    success: false,
                    error: 'No matching routing rule found'
                });
            }

            // Get routes
            const routes = await base44.entities.OrchestrationRoute.filter({
                status: 'active'
            });

            // Select route based on strategy
            const selectedRoute = selectRoute(matchedRule, routes, transaction_data);

            // Log execution
            const execution = await base44.entities.OrchestrationExecution.create({
                execution_id: `exec_${Date.now()}`,
                owner_type,
                owner_id,
                transaction_id: transaction_data.transaction_id || transaction_data.message_id,
                rule_id: matchedRule.id,
                rule_name: matchedRule.rule_name,
                route_id: selectedRoute?.id,
                route_name: selectedRoute?.route_name,
                routing_strategy: matchedRule.routing_strategy,
                amount: transaction_data.amount,
                currency: transaction_data.currency,
                status: 'executed',
                attempts: [{
                    route_id: selectedRoute?.id,
                    route_name: selectedRoute?.route_name,
                    attempt_number: 1,
                    status: 'pending',
                    timestamp: new Date().toISOString()
                }]
            });

            // Update rule stats
            await base44.entities.OrchestrationRule.update(matchedRule.id, {
                success_count: (matchedRule.success_count || 0) + 1,
                last_executed: new Date().toISOString()
            });

            return Response.json({
                success: true,
                matched_rule: matchedRule,
                selected_route: selectedRoute,
                execution_id: execution.id
            });
        }

        if (action === 'update_execution') {
            const { execution_id, status, error_message } = await req.json();
            await base44.entities.OrchestrationExecution.update(execution_id, {
                status,
                error_message
            });
            return Response.json({ success: true });
        }

        return Response.json({ success: false, error: 'Invalid action' });

    } catch (error) {
        console.error('Orchestration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function matchesConditions(data, conditions) {
    if (!conditions) return true;

    // Amount check
    if (conditions.amount_min && data.amount < conditions.amount_min) return false;
    if (conditions.amount_max && data.amount > conditions.amount_max) return false;

    // Currency check
    if (conditions.currencies?.length > 0 && !conditions.currencies.includes(data.currency)) {
        return false;
    }

    // Country check
    if (conditions.countries?.length > 0 && !conditions.countries.includes(data.country)) {
        return false;
    }

    // Payment method check
    if (conditions.payment_methods?.length > 0 && !conditions.payment_methods.includes(data.payment_method)) {
        return false;
    }

    return true;
}

function selectRoute(rule, allRoutes, transaction_data) {
    if (!rule.target_routes || rule.target_routes.length === 0) {
        return null;
    }

    const availableRoutes = rule.target_routes
        .map(tr => allRoutes.find(r => r.id === tr.route_id))
        .filter(r => r && r.status === 'active' && r.health_status === 'healthy');

    if (availableRoutes.length === 0) {
        return null;
    }

    switch (rule.routing_strategy) {
        case 'single':
            return availableRoutes[0];

        case 'failover':
            // Return first healthy route (already sorted by priority)
            return availableRoutes[0];

        case 'load_balance':
            // Simple round-robin based on current usage
            return availableRoutes.reduce((min, route) => 
                (route.total_transactions || 0) < (min.total_transactions || 0) ? route : min
            );

        case 'cost_optimize':
            // Select cheapest route
            return availableRoutes.reduce((min, route) => {
                const routeCost = (route.cost_per_transaction || 0) + 
                    ((route.cost_percentage || 0) * transaction_data.amount / 100);
                const minCost = (min.cost_per_transaction || 0) + 
                    ((min.cost_percentage || 0) * transaction_data.amount / 100);
                return routeCost < minCost ? route : min;
            });

        default:
            return availableRoutes[0];
    }
}