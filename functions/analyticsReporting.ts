import { query, queryOne, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, start_date, end_date } = await req.json();

        if (action === 'getPSPMetrics') {
            const [transactions, volume, refunds, disputes] = await Promise.all([
                query(`SELECT COUNT(*) as count FROM transaction WHERE psp_code = $1 AND created_date >= $2 AND created_date <= $3`, [psp_code, start_date, end_date]),
                query(`SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE psp_code = $1 AND status = 'approved' AND created_date >= $2 AND created_date <= $3`, [psp_code, start_date, end_date]),
                query(`SELECT COALESCE(SUM(amount), 0) as total FROM refund WHERE psp_code = $1 AND created_date >= $2 AND created_date <= $3`, [psp_code, start_date, end_date]),
                query(`SELECT COUNT(*) as count FROM dispute WHERE psp_code = $1 AND created_date >= $2 AND created_date <= $3`, [psp_code, start_date, end_date])
            ]);

            await closeConnection();
            return Response.json({
                success: true,
                psp_code,
                period: { start: start_date, end: end_date },
                metrics: {
                    total_transactions: transactions[0]?.count || 0,
                    total_volume: volume[0]?.total || 0,
                    refunded_amount: refunds[0]?.total || 0,
                    dispute_count: disputes[0]?.count || 0
                }
            });
        }

        if (action === 'getMerchantMetrics') {
            const [transactions, volume, success_rate] = await Promise.all([
                query(`SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND created_date >= $2 AND created_date <= $3`, [merchant_id, start_date, end_date]),
                query(`SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE merchant_id = $1 AND status = 'approved' AND created_date >= $2 AND created_date <= $3`, [merchant_id, start_date, end_date]),
                query(`SELECT COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved, COUNT(*) as total FROM transaction WHERE merchant_id = $1 AND created_date >= $2 AND created_date <= $3`, [merchant_id, start_date, end_date])
            ]);

            const rate = success_rate[0]?.total > 0 ? (success_rate[0]?.approved / success_rate[0]?.total * 100).toFixed(2) : 0;

            await closeConnection();
            return Response.json({
                success: true,
                merchant_id,
                period: { start: start_date, end: end_date },
                metrics: {
                    total_transactions: transactions[0]?.count || 0,
                    total_volume: volume[0]?.total || 0,
                    success_rate: parseFloat(rate)
                }
            });
        }

        if (action === 'getPaymentMethodBreakdown') {
            const breakdown = await query(
                `SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount), 0) as volume
                 FROM transaction WHERE psp_code = $1 AND created_date >= $2 AND created_date <= $3
                 GROUP BY payment_method ORDER BY volume DESC`,
                [psp_code, start_date, end_date]
            );

            await closeConnection();
            return Response.json({ success: true, breakdown });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Analytics error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});