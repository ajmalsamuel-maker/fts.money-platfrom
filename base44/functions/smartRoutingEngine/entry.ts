import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, transaction_data } = await req.json();

        if (action === 'selectProcessor') {
            const { amount, payment_method, country } = transaction_data;

            // Get active routing rules
            const rules = await query(
                `SELECT * FROM routing_rule WHERE status = 'active' AND psp_code = $1
                 ORDER BY priority ASC`,
                [psp_code]
            );

            let selectedProcessor = null;
            for (const rule of rules) {
                const matches = evaluateRule(rule, { amount, payment_method, country, merchant_id });
                if (matches) {
                    selectedProcessor = rule.primary_processor;
                    break;
                }
            }

            // Fallback to health-check based selection
            if (!selectedProcessor) {
                const healthyProcessors = await query(
                    `SELECT * FROM processor_connector_config WHERE psp_code = $1 AND status = 'active' AND health_check_status = 'healthy'
                     ORDER BY success_rate_percent DESC LIMIT 1`,
                    [psp_code]
                );

                selectedProcessor = healthyProcessors[0]?.connector_name || 'stripe';
            }

            await closeConnection();
            return Response.json({ success: true, selected_processor: selectedProcessor });
        }

        if (action === 'createRule') {
            const rule_id = `RULE-${Date.now()}`;
            await execute(
                `INSERT INTO routing_rule (rule_id, psp_code, name, priority, primary_processor, status)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [rule_id, psp_code, req.json().name, 100, req.json().processor, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, rule_id });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Routing error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function evaluateRule(rule, context) {
    if (rule.min_amount && context.amount < rule.min_amount) return false;
    if (rule.max_amount && context.amount > rule.max_amount) return false;
    return true;
}