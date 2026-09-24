import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, merchant_id, psp_code, billing_cycle, amount, status } = await req.json();

        if (action === 'create') {
            const subscriptionId = `SUB-${Date.now()}`;
            const nextBillingDate = new Date();
            
            if (billing_cycle === 'monthly') nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            if (billing_cycle === 'annual') nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

            await execute(
                `INSERT INTO subscription (subscription_id, merchant_id, psp_code, amount, billing_cycle, status, next_billing_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [subscriptionId, merchant_id, psp_code, amount, billing_cycle, 'active', nextBillingDate.toISOString()]
            );

            await closeConnection();
            return Response.json({ success: true, subscription_id: subscriptionId });
        }

        if (action === 'processBilling') {
            const subs = await query(
                `SELECT * FROM subscription WHERE psp_code = $1 AND status = 'active' AND next_billing_date <= NOW()`,
                [psp_code]
            );

            let processed = 0;
            for (const sub of subs) {
                try {
                    // Create invoice
                    const invoiceId = `INV-SUB-${Date.now()}`;
                    await execute(
                        `INSERT INTO invoice (invoice_number, merchant_id, psp_code, total_amount, status)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [invoiceId, sub.merchant_id, psp_code, sub.amount, 'issued']
                    );

                    // Update next billing date
                    const nextDate = new Date(sub.next_billing_date);
                    if (sub.billing_cycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                    if (sub.billing_cycle === 'annual') nextDate.setFullYear(nextDate.getFullYear() + 1);

                    await execute(
                        `UPDATE subscription SET next_billing_date = $1 WHERE id = $2`,
                        [nextDate.toISOString(), sub.id]
                    );

                    processed++;
                } catch (err) {
                    console.error(`Failed to process subscription ${sub.subscription_id}:`, err);
                }
            }

            await closeConnection();
            return Response.json({ success: true, processed });
        }

        if (action === 'cancel') {
            const sub = await queryOne(
                `SELECT * FROM subscription WHERE subscription_id = $1`,
                [action]
            );

            if (!sub) {
                await closeConnection();
                return Response.json({ error: 'Subscription not found' }, { status: 404 });
            }

            await execute(
                `UPDATE subscription SET status = 'cancelled' WHERE subscription_id = $1`,
                [action]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Subscription error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});