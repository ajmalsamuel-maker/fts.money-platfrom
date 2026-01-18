import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, report_type, time_range } = await req.json();

        if (action === 'buildDataWarehouse') {
            // Aggregate transaction data
            await execute(
                `INSERT INTO bi_transaction_summary (psp_code, transaction_date, merchant_count, transaction_count, total_volume, avg_ticket)
                 SELECT $1, DATE(created_date), COUNT(DISTINCT merchant_id), COUNT(*), SUM(amount), AVG(amount)
                 FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '30 days'
                 GROUP BY DATE(created_date)
                 ON CONFLICT DO NOTHING`,
                [psp_code]
            );

            // Aggregate merchant data
            await execute(
                `INSERT INTO bi_merchant_summary (psp_code, merchant_id, total_volume, transaction_count, success_rate)
                 SELECT $1, merchant_id, SUM(amount), COUNT(*), 
                        COUNT(CASE WHEN status = 'approved' THEN 1 END)::float / COUNT(*)
                 FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '30 days'
                 GROUP BY merchant_id
                 ON CONFLICT DO NOTHING`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, warehouse_updated: true });
        }

        if (action === 'generateReport') {
            const report = await query(
                `SELECT * FROM bi_transaction_summary WHERE psp_code = $1 ORDER BY transaction_date DESC LIMIT 30`,
                [psp_code]
            );

            const summary = await queryOne(
                `SELECT 
                    SUM(transaction_count) as total_txn,
                    SUM(total_volume) as total_vol,
                    AVG(avg_ticket) as avg_ticket
                 FROM bi_transaction_summary WHERE psp_code = $1`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({
                success: true,
                report_type,
                summary,
                daily_data: report
            });
        }

        if (action === 'getMerchantAnalytics') {
            const top_merchants = await query(
                `SELECT merchant_id, total_volume, transaction_count, success_rate 
                 FROM bi_merchant_summary WHERE psp_code = $1
                 ORDER BY total_volume DESC LIMIT 20`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, top_merchants });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('BI error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});