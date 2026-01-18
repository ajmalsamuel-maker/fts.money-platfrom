import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, transaction_id, refund_amount, psp_code, reason } = await req.json();

        if (action === 'initiate') {
            const txn = await queryOne(
                `SELECT * FROM transaction WHERE transaction_id = $1 AND psp_code = $2`,
                [transaction_id, psp_code]
            );

            if (!txn) {
                await closeConnection();
                return Response.json({ error: 'Transaction not found' }, { status: 404 });
            }

            if (txn.status !== 'approved' && txn.status !== 'settled') {
                await closeConnection();
                return Response.json({ error: 'Can only refund approved/settled transactions' }, { status: 400 });
            }

            const amount = refund_amount || txn.amount;
            const refundId = `REFUND-${Date.now()}`;

            await execute(
                `INSERT INTO refund (refund_id, transaction_id, merchant_id, amount, currency, status, reason, psp_code)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [refundId, transaction_id, txn.merchant_id, amount, txn.currency, 'pending', reason || 'Manual refund', psp_code]
            );

            // Update transaction status
            await execute(
                `UPDATE transaction SET status = 'refunded', updated_date = NOW() WHERE transaction_id = $1`,
                [transaction_id]
            );

            await closeConnection();
            return Response.json({ success: true, refund_id: refundId });
        }

        if (action === 'list') {
            const refunds = await query(
                `SELECT * FROM refund WHERE psp_code = $1 ORDER BY created_date DESC`,
                [psp_code]
            );
            await closeConnection();
            return Response.json({ success: true, refunds });
        }

        if (action === 'getStatus') {
            const refund = await queryOne(
                `SELECT * FROM refund WHERE refund_id = $1`,
                [transaction_id]
            );
            await closeConnection();
            return Response.json({ success: true, refund });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Refund error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});