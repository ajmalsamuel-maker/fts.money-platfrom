import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, dispute_id, transaction_id, psp_code, reason_code, evidence_urls, status } = await req.json();

        if (action === 'create') {
            const txn = await queryOne(
                `SELECT * FROM transaction WHERE transaction_id = $1 AND psp_code = $2`,
                [transaction_id, psp_code]
            );

            if (!txn) {
                await closeConnection();
                return Response.json({ error: 'Transaction not found' }, { status: 404 });
            }

            const newDisputeId = `DISPUTE-${Date.now()}`;
            await execute(
                `INSERT INTO dispute (dispute_id, transaction_id, merchant_id, psp_code, amount, currency, reason_code, status, evidence_documents)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [newDisputeId, transaction_id, txn.merchant_id, psp_code, txn.amount, txn.currency, reason_code, 'open', JSON.stringify(evidence_urls || [])]
            );

            await closeConnection();
            return Response.json({ success: true, dispute_id: newDisputeId });
        }

        if (action === 'updateStatus') {
            await execute(
                `UPDATE dispute SET status = $1, updated_date = NOW() WHERE dispute_id = $2`,
                [status, dispute_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'list') {
            const disputes = await query(
                `SELECT * FROM dispute WHERE psp_code = $1 ORDER BY created_date DESC`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, disputes });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Dispute error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});