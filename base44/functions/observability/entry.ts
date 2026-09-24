import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, service, metric_name, value } = await req.json();

        if (action === 'recordMetric') {
            const metric_id = `METRIC-${Date.now()}`;
            
            await execute(
                `INSERT INTO observability_metric (metric_id, psp_code, service, metric_name, value, recorded_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [metric_id, psp_code, service, metric_name, value]
            );

            await closeConnection();
            return Response.json({ success: true, metric_id });
        }

        if (action === 'recordLog') {
            const log_id = `LOG-${Date.now()}`;
            
            await execute(
                `INSERT INTO structured_log (log_id, psp_code, level, message, context, recorded_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [log_id, psp_code, req.json().level, req.json().message, JSON.stringify(req.json().context), ]
            );

            await closeConnection();
            return Response.json({ success: true, log_id });
        }

        if (action === 'healthCheck') {
            const db_healthy = await queryOne(`SELECT 1 as status`);
            const txn_health = await queryOne(`SELECT COUNT(*) as count FROM transaction WHERE created_date >= NOW() - INTERVAL '5 minutes'`, []);
            const error_rate = await queryOne(`SELECT COUNT(*) as errors FROM structured_log WHERE psp_code = $1 AND level = 'error' AND recorded_at >= NOW() - INTERVAL '5 minutes'`, [psp_code]);

            await closeConnection();
            return Response.json({
                success: true,
                status: 'healthy',
                checks: {
                    database: !!db_healthy,
                    transactions: txn_health.count > 0,
                    error_rate: error_rate.errors < 10
                }
            });
        }

        if (action === 'getMetrics') {
            const metrics = await query(
                `SELECT * FROM observability_metric WHERE psp_code = $1 AND recorded_at >= NOW() - INTERVAL '1 hour'
                 ORDER BY recorded_at DESC LIMIT 1000`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, metrics });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Observability error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});