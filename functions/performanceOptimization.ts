import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code } = await req.json();

        if (action === 'analyzeQueryPerformance') {
            const slow_queries = await query(
                `SELECT query, calls, mean_exec_time, max_exec_time 
                 FROM pg_stat_statements WHERE mean_exec_time > 1000 
                 ORDER BY mean_exec_time DESC LIMIT 10`
            );

            await closeConnection();
            return Response.json({ success: true, slow_queries });
        }

        if (action === 'getConnPoolStats') {
            const stats = await query(
                `SELECT datname, count(*) as connections FROM pg_stat_activity GROUP BY datname`
            );

            await closeConnection();
            return Response.json({ success: true, pool_stats: stats });
        }

        if (action === 'enableIndexing') {
            // Create missing indexes
            const indexes = [
                `CREATE INDEX IF NOT EXISTS idx_transaction_merchant_status ON transaction(merchant_id, status)`,
                `CREATE INDEX IF NOT EXISTS idx_transaction_psp_date ON transaction(psp_code, created_date)`,
                `CREATE INDEX IF NOT EXISTS idx_merchant_psp_status ON merchant(psp_code, status)`,
                `CREATE INDEX IF NOT EXISTS idx_settlement_merchant_date ON reconciliation_batch(merchant_id, settlement_date)`
            ];

            for (const idx of indexes) {
                try {
                    await execute(idx);
                } catch (err) {
                    console.log(`Index already exists: ${err.message}`);
                }
            }

            await closeConnection();
            return Response.json({ success: true, indexes_created: indexes.length });
        }

        if (action === 'analyzeTableStats') {
            await execute(`ANALYZE transaction`);
            await execute(`ANALYZE merchant`);
            await execute(`ANALYZE reconciliation_batch`);

            await closeConnection();
            return Response.json({ success: true, tables_analyzed: 3 });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Performance optimization error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});