import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, event_type, merchant_id, transaction_id, psp_code, payload } = await req.json();

        if (action === 'sendWebhook') {
            // Get merchant webhooks
            const webhooks = await query(
                `SELECT * FROM webhook WHERE merchant_id = $1 AND status = 'active' AND $2 = ANY(events)`,
                [merchant_id, event_type]
            );

            const results = [];
            for (const webhook of webhooks) {
                try {
                    const response = await fetch(webhook.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Signature': generateSignature(JSON.stringify(payload), webhook.secret)
                        },
                        body: JSON.stringify(payload)
                    });

                    const deliveryId = `WH-${Date.now()}`;
                    await execute(
                        `INSERT INTO webhook_delivery (webhook_id, event_type, status, response_status, psp_code)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [webhook.id, event_type, response.ok ? 'success' : 'failed', response.status, psp_code]
                    );

                    results.push({ webhook_url: webhook.url, delivered: response.ok });
                } catch (err) {
                    console.error(`Webhook delivery failed for ${webhook.url}:`, err);
                }
            }

            await closeConnection();
            return Response.json({ success: true, webhooks_sent: results.length, results });
        }

        if (action === 'sendEmail') {
            // Queue email notification
            const merchant = await queryOne(
                `SELECT contact_email FROM merchant WHERE id = $1`,
                [merchant_id]
            );

            if (!merchant?.contact_email) {
                await closeConnection();
                return Response.json({ error: 'Merchant email not found' }, { status: 400 });
            }

            // Log email notification
            await execute(
                `INSERT INTO notification_log (merchant_id, type, recipient, event_type, status, psp_code)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [merchant_id, 'email', merchant.contact_email, event_type, 'queued', psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, email_queued: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Notification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateSignature(payload, secret) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + secret);
    return crypto.subtle.digest('SHA-256', data).then(hash => {
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    });
}