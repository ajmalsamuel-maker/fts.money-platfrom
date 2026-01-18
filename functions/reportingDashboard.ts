import { query, queryOne, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, report_type, date_range } = await req.json();

        if (action === 'getDashboard') {
            const [totalTxn, totalVolume, avgTicket, successRate] = await Promise.all([
                query(`SELECT COUNT(*) as count FROM transaction WHERE psp_code = $1`, [psp_code]),
                query(`SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE psp_code = $1 AND status = 'approved'`, [psp_code]),
                query(`SELECT AVG(amount) as avg FROM transaction WHERE psp_code = $1 AND status = 'approved'`, [psp_code]),
                query(`SELECT COUNT(CASE WHEN status = 'approved' THEN 1 END)::float / COUNT(*) as rate FROM transaction WHERE psp_code = $1`, [psp_code])
            ]);

            await closeConnection();
            return Response.json({
                success: true,
                metrics: {
                    total_transactions: totalTxn[0]?.count || 0,
                    total_volume: totalVolume[0]?.total || 0,
                    avg_ticket: avgTicket[0]?.avg || 0,
                    success_rate: (successRate[0]?.rate * 100).toFixed(2) + '%'
                }
            });
        }

        if (action === 'getMerchantReport') {
            const [txns, volume, disputes, chargebacks] = await Promise.all([
                query(`SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1`, [merchant_id]),
                query(`SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE merchant_id = $1 AND status = 'approved'`, [merchant_id]),
                query(`SELECT COUNT(*) as count FROM dispute WHERE merchant_id = $1`, [merchant_id]),
                query(`SELECT COUNT(*) as count FROM chargeback WHERE merchant_id = $1`, [merchant_id])
            ]);

            await closeConnection();
            return Response.json({
                success: true,
                merchant_report: {
                    transactions: txns[0]?.count || 0,
                    volume: volume[0]?.total || 0,
                    disputes: disputes[0]?.count || 0,
                    chargebacks: chargebacks[0]?.count || 0
                }
            });
        }

        if (action === 'exportReport') {
            const transactions = await query(
                `SELECT * FROM transaction WHERE psp_code = $1 ORDER BY created_date DESC LIMIT 10000`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({
                success: true,
                export_format: 'csv',
                record_count: transactions.length,
                data: transactions
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Reporting error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});