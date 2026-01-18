import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, test_config } = await req.json();

        if (action === 'runLoadTest') {
            const runId = `LT-${Date.now()}`;
            const { target_tps, duration_seconds, transaction_count } = test_config;

            await execute(
                `INSERT INTO load_test_run (run_id, psp_code, target_tps, duration_seconds, status)
                 VALUES ($1, $2, $3, $4, $5)`,
                [runId, psp_code, target_tps, duration_seconds, 'running']
            );

            // Simulate transactions
            let successful = 0;
            for (let i = 0; i < transaction_count; i++) {
                const success = Math.random() > 0.05; // 95% success
                if (success) successful++;

                await execute(
                    `INSERT INTO load_test_transaction (run_id, transaction_num, success, latency_ms)
                     VALUES ($1, $2, $3, $4)`,
                    [runId, i, success, Math.random() * 500]
                );
            }

            // Calculate metrics
            const metrics = await queryOne(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
                    AVG(latency_ms) as avg_latency,
                    MAX(latency_ms) as max_latency
                 FROM load_test_transaction WHERE run_id = $1`,
                [runId]
            );

            await execute(
                `UPDATE load_test_run SET status = 'completed', total_transactions = $1, successful_transactions = $2, avg_latency_ms = $3
                 WHERE run_id = $4`,
                [metrics.total, metrics.successful, metrics.avg_latency, runId]
            );

            await closeConnection();
            return Response.json({
                success: true,
                run_id: runId,
                metrics: {
                    total: metrics.total,
                    successful: metrics.successful,
                    success_rate: ((metrics.successful / metrics.total) * 100).toFixed(2) + '%',
                    avg_latency: Math.round(metrics.avg_latency),
                    max_latency: Math.round(metrics.max_latency)
                }
            });
        }

        if (action === 'getResults') {
            const run = await queryOne(
                `SELECT * FROM load_test_run WHERE run_id = $1`,
                [test_config.run_id]
            );

            await closeConnection();
            return Response.json({ success: true, results: run });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Load test error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});