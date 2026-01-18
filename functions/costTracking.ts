import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, usage_type, quantity } = await req.json();

        if (action === 'recordUsage') {
            const usage_id = `USAGE-${Date.now()}`;
            
            await execute(
                `INSERT INTO usage_meter (usage_id, merchant_id, psp_code, usage_type, quantity, recorded_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [usage_id, merchant_id, psp_code, usage_type, quantity]
            );

            await closeConnection();
            return Response.json({ success: true, usage_id });
        }

        if (action === 'calculateCost') {
            const usage = await queryOne(
                `SELECT SUM(quantity) as total FROM usage_meter WHERE merchant_id = $1 AND psp_code = $2 AND usage_type = $3 AND recorded_at >= NOW() - INTERVAL '1 month'`,
                [merchant_id, psp_code, usage_type]
            );

            const rate = await queryOne(
                `SELECT price_per_unit FROM usage_pricing WHERE psp_code = $1 AND usage_type = $2`,
                [psp_code, usage_type]
            );

            const cost = (usage.total || 0) * (rate?.price_per_unit || 0);

            await closeConnection();
            return Response.json({
                success: true,
                usage_quantity: usage.total || 0,
                unit_price: rate?.price_per_unit || 0,
                total_cost: Math.round(cost * 100) / 100
            });
        }

        if (action === 'getMerchantCostAttribution') {
            const costs = await query(
                `SELECT usage_type, SUM(quantity) as quantity, recorded_at FROM usage_meter
                 WHERE merchant_id = $1 AND psp_code = $2 AND recorded_at >= NOW() - INTERVAL '1 month'
                 GROUP BY usage_type, DATE(recorded_at)`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, costs });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Cost tracking error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});