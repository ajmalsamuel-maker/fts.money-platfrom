import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, processor, event_type, event_data, psp_code } = await req.json();

        if (action === 'syncWebhook') {
            const txn = await queryOne(
                `SELECT * FROM transaction WHERE connector_txn_no = $1 AND psp_code = $2`,
                [event_data.transaction_id, psp_code]
            );

            if (!txn) {
                await closeConnection();
                return Response.json({ success: false, error: 'Transaction not found' }, { status: 404 });
            }

            const status = event_data.success ? 'approved' : 'declined';
            await execute(
                `UPDATE transaction SET status = $1, response_code = $2, response_message = $3, connector_response_code = $4, updated_date = NOW()
                 WHERE id = $5`,
                [status, event_data.code || '00', event_data.message || 'Synced', event_data.ref || '', txn.id]
            );

            // Log webhook delivery
            await execute(
                `INSERT INTO webhook_delivery (processor, event_type, transaction_id, status, psp_code)
                 VALUES ($1, $2, $3, $4, $5)`,
                [processor, event_type, txn.transaction_id, 'processed', psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, transaction_id: txn.transaction_id });
        }

        if (action === 'listProcessors') {
            const processors = await query(
                `SELECT * FROM payment_processor WHERE psp_code = $1 AND status = 'active'`,
                [psp_code]
            );
            await closeConnection();
            return Response.json({ success: true, processors });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Processor integration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});