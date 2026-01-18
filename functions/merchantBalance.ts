import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, merchant_id, psp_code } = await req.json();

        if (action === 'getBalance') {
            // Calculate balance from transactions
            const approved = await queryOne(
                `SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE merchant_id = $1 AND status = 'approved'`,
                [merchant_id]
            );

            const refunded = await queryOne(
                `SELECT COALESCE(SUM(amount), 0) as total FROM refund WHERE merchant_id = $1`,
                [merchant_id]
            );

            const fees = await queryOne(
                `SELECT COALESCE(SUM(fee), 0) as total FROM transaction WHERE merchant_id = $1`,
                [merchant_id]
            );

            const balance = approved.total - refunded.total - fees.total;

            await closeConnection();
            return Response.json({
                success: true,
                merchant_id,
                approved_volume: approved.total,
                refunded_volume: refunded.total,
                total_fees: fees.total,
                available_balance: balance
            });
        }

        if (action === 'updateBalance') {
            const merchant = await queryOne(
                `SELECT * FROM merchant WHERE id = $1`,
                [merchant_id]
            );

            if (!merchant) {
                await closeConnection();
                return Response.json({ error: 'Merchant not found' }, { status: 404 });
            }

            // Recalculate and update merchant balance record
            const approved = await queryOne(
                `SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE merchant_id = $1 AND status = 'approved'`,
                [merchant_id]
            );

            const refunded = await queryOne(
                `SELECT COALESCE(SUM(amount), 0) as total FROM refund WHERE merchant_id = $1`,
                [merchant_id]
            );

            const fees = await queryOne(
                `SELECT COALESCE(SUM(fee), 0) as total FROM transaction WHERE merchant_id = $1`,
                [merchant_id]
            );

            await execute(
                `UPDATE merchant_balance SET total_volume = $1, total_fees = $2, available_balance = $3, updated_date = NOW()
                 WHERE merchant_id = $4 AND psp_code = $5`,
                [approved.total, fees.total, approved.total - refunded.total - fees.total, merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, balance_updated: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Balance error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});