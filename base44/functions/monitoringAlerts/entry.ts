import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code } = await req.json();

        if (action === 'healthCheck') {
            const [db_status, processor_status, settlement_status] = await Promise.all([
                query(`SELECT 1 as status`),
                query(`SELECT status, COUNT(*) as count FROM processor_connector_config GROUP BY status`),
                query(`SELECT status, COUNT(*) as count FROM reconciliation_batch WHERE status != 'completed' GROUP BY status`)
            ]);

            const health = {
                database: db_status.length > 0 ? 'healthy' : 'down',
                processors: processor_status,
                pending_settlements: settlement_status
            };

            await closeConnection();
            return Response.json({ success: true, health });
        }

        if (action === 'detectAnomalies') {
            // High chargeback rate
            const chargeback_rate = await queryOne(
                `SELECT COUNT(CASE WHEN type = 'chargeback' THEN 1 END)::float / COUNT(*) as rate 
                 FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '1 day'`,
                [psp_code]
            );

            // Unusual volume spike
            const volume_avg = await queryOne(
                `SELECT AVG(daily_vol) as avg FROM (
                    SELECT DATE(created_date), SUM(amount) as daily_vol 
                    FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '30 days'
                    GROUP BY DATE(created_date)
                ) AS daily`,
                [psp_code]
            );

            const today_vol = await queryOne(
                `SELECT COALESCE(SUM(amount), 0) as total FROM transaction 
                 WHERE psp_code = $1 AND DATE(created_date) = CURRENT_DATE`,
                [psp_code]
            );

            const anomalies = [];
            if (chargeback_rate.rate > 0.05) anomalies.push('High chargeback rate');
            if (volume_avg.avg && today_vol.total > volume_avg.avg * 2) anomalies.push('Volume spike detected');

            if (anomalies.length > 0) {
                await execute(
                    `INSERT INTO system_alert (psp_code, alert_type, severity, message)
                     VALUES ($1, $2, $3, $4)`,
                    [psp_code, 'anomaly', 'high', anomalies.join(', ')]
                );
            }

            await closeConnection();
            return Response.json({ success: true, anomalies });
        }

        if (action === 'listAlerts') {
            const alerts = await query(
                `SELECT * FROM system_alert WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '7 days'
                 ORDER BY created_date DESC`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, alerts });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Monitoring error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});