import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, event_type, endpoint_url } = await req.json();

        if (action === 'registerEndpoint') {
            const endpoint_id = `WEBHOOK-${Date.now()}`;
            const secret = `secret_${Math.random().toString(36).slice(2)}`;
            
            await execute(
                `INSERT INTO webhook_endpoint (endpoint_id, merchant_id, psp_code, url, event_types, secret, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [endpoint_id, merchant_id, psp_code, endpoint_url, JSON.stringify([event_type]), secret, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, endpoint_id, secret });
        }

        if (action === 'deliverWebhook') {
            const event_id = `EVT-${Date.now()}`;
            
            await execute(
                `INSERT INTO webhook_delivery (delivery_id, event_id, endpoint_id, psp_code, payload, status)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [event_id, req.json().event_id, req.json().endpoint_id, psp_code, JSON.stringify(req.json().payload), 'pending']
            );

            await closeConnection();
            return Response.json({ success: true, delivery_id: event_id });
        }

        if (action === 'retryFailed') {
            const failed = await query(
                `SELECT * FROM webhook_delivery WHERE psp_code = $1 AND status = 'failed' AND retry_count < 5`,
                [psp_code]
            );

            for (const delivery of failed) {
                await execute(
                    `UPDATE webhook_delivery SET retry_count = retry_count + 1, status = 'pending', next_retry = NOW() + INTERVAL '5 minutes' WHERE delivery_id = $1`,
                    [delivery.delivery_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, retried: failed.length });
        }

        if (action === 'listEndpoints') {
            const endpoints = await query(
                `SELECT * FROM webhook_endpoint WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, endpoints });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Webhook management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});