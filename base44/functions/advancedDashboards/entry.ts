import { query, queryOne, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, time_period } = await req.json();

        if (action === 'getRealTimeMetrics') {
            const [txn_count, volume, active_merchants, processor_status] = await Promise.all([
                query(`SELECT COUNT(*) as count FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '1 hour'`, [psp_code]),
                query(`SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '1 hour'`, [psp_code]),
                query(`SELECT COUNT(DISTINCT merchant_id) as count FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '1 hour'`, [psp_code]),
                query(`SELECT status, COUNT(*) as count FROM processor_connector_config WHERE psp_code = $1 GROUP BY status`, [psp_code])
            ]);

            await closeConnection();
            return Response.json({
                success: true,
                metrics: {
                    txn_last_hour: txn_count[0]?.count || 0,
                    volume_last_hour: volume[0]?.total || 0,
                    active_merchants: active_merchants[0]?.count || 0,
                    processors: processor_status
                }
            });
        }

        if (action === 'getPredictiveInsights') {
            // Forecast volume
            const recent_avg = await queryOne(
                `SELECT AVG(daily_vol) as avg FROM (
                    SELECT SUM(amount) as daily_vol FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '7 days'
                    GROUP BY DATE(created_date)
                ) AS daily`,
                [psp_code]
            );

            const forecast = recent_avg.avg ? recent_avg.avg * 1.1 : 0; // 10% growth prediction

            // Risk prediction
            const risk_trend = await queryOne(
                `SELECT AVG(fraud_score) as avg_risk FROM fraud_detection_log WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '7 days'`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({
                success: true,
                predictions: {
                    volume_forecast: Math.round(forecast),
                    risk_trend: risk_trend?.avg_risk || 0,
                    recommendation: risk_trend?.avg_risk > 50 ? 'increase_monitoring' : 'normal'
                }
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Dashboard error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});