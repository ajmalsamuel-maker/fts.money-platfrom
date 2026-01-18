import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, webhook_url, events, delivery_id } = await req.json();

        if (action === 'register') {
            const webhookId = `WH-${Date.now()}`;
            await execute(
                `INSERT INTO webhook (webhook_id, merchant_id, url, events, status, psp_code)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [webhookId, merchant_id, webhook_url, JSON.stringify(events), 'active', psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, webhook_id: webhookId });
        }

        if (action === 'retryDelivery') {
            const delivery = await queryOne(
                `SELECT * FROM webhook_delivery WHERE delivery_id = $1`,
                [delivery_id]
            );

            if (!delivery) {
                await closeConnection();
                return Response.json({ error: 'Delivery not found' }, { status: 404 });
            }

            const webhook = await queryOne(
                `SELECT * FROM webhook WHERE id = $1`,
                [delivery.webhook_id]
            );

            if (delivery.retry_count < 3) {
                // Retry webhook delivery
                await execute(
                    `UPDATE webhook_delivery SET retry_count = retry_count + 1, updated_date = NOW() WHERE delivery_id = $1`,
                    [delivery_id]
                );

                await closeConnection();
                return Response.json({ success: true, retrying: true });
            }

            await closeConnection();
            return Response.json({ success: false, error: 'Max retries exceeded' }, { status: 400 });
        }

        if (action === 'listWebhooks') {
            const webhooks = await query(
                `SELECT * FROM webhook WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, webhooks });
        }

        if (action === 'getDeliveries') {
            const deliveries = await query(
                `SELECT * FROM webhook_delivery WHERE webhook_id IN (SELECT id FROM webhook WHERE merchant_id = $1) ORDER BY created_date DESC LIMIT 100`,
                [merchant_id]
            );

            await closeConnection();
            return Response.json({ success: true, deliveries });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Webhook manager error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});