import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, subscription_id } = await req.json();

        if (action === 'createSubscription') {
            const sub_id = `SUB-${Date.now()}`;
            
            await execute(
                `INSERT INTO subscription (subscription_id, merchant_id, psp_code, amount, frequency, status, next_billing_date)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '1 month')`,
                [sub_id, merchant_id, psp_code, req.json().amount, req.json().frequency, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, subscription_id: sub_id });
        }

        if (action === 'processDue') {
            const due = await query(
                `SELECT * FROM subscription WHERE psp_code = $1 AND status = 'active' AND next_billing_date <= NOW()`,
                [psp_code]
            );

            for (const sub of due) {
                const invoice_id = `INV-${Date.now()}`;
                await execute(
                    `INSERT INTO subscription_invoice (invoice_id, subscription_id, amount, status)
                     VALUES ($1, $2, $3, $4)`,
                    [invoice_id, sub.subscription_id, sub.amount, 'pending']
                );

                await execute(
                    `UPDATE subscription SET next_billing_date = next_billing_date + INTERVAL '1 month' WHERE subscription_id = $1`,
                    [sub.subscription_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, processed: due.length });
        }

        if (action === 'applyDunning') {
            const failed = await query(
                `SELECT * FROM subscription_invoice WHERE status = 'failed' AND retry_count < 3 AND subscription_id IN 
                 (SELECT subscription_id FROM subscription WHERE psp_code = $1)`,
                [psp_code]
            );

            for (const invoice of failed) {
                await execute(
                    `UPDATE subscription_invoice SET retry_count = retry_count + 1, status = 'retrying' WHERE invoice_id = $1`,
                    [invoice.invoice_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, dunned: failed.length });
        }

        if (action === 'cancelSubscription') {
            await execute(
                `UPDATE subscription SET status = 'cancelled', cancelled_date = NOW() WHERE subscription_id = $1`,
                [subscription_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Recurring billing error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});