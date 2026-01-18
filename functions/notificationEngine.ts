import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, template_id, recipient, context } = await req.json();

        if (action === 'sendNotification') {
            const notification_id = `NOTIF-${Date.now()}`;
            
            const template = await queryOne(
                `SELECT * FROM notification_template WHERE template_id = $1 AND psp_code = $2`,
                [template_id, psp_code]
            );

            let body = template.body;
            if (context) {
                Object.entries(context).forEach(([key, value]) => {
                    body = body.replace(`{{${key}}}`, value);
                });
            }

            await execute(
                `INSERT INTO notification (notification_id, merchant_id, psp_code, type, recipient, body, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [notification_id, merchant_id, psp_code, template.type, recipient, body, 'queued']
            );

            await closeConnection();
            return Response.json({ success: true, notification_id });
        }

        if (action === 'createTemplate') {
            const tmpl_id = `TMPL-${Date.now()}`;
            
            await execute(
                `INSERT INTO notification_template (template_id, psp_code, name, type, subject, body)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [tmpl_id, psp_code, req.json().name, req.json().type, req.json().subject, req.json().body]
            );

            await closeConnection();
            return Response.json({ success: true, template_id: tmpl_id });
        }

        if (action === 'getQueuedNotifications') {
            const queued = await query(
                `SELECT * FROM notification WHERE psp_code = $1 AND status = 'queued' LIMIT 100`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, notifications: queued });
        }

        if (action === 'markSent') {
            await execute(
                `UPDATE notification SET status = 'sent', sent_date = NOW() WHERE notification_id = $1`,
                [req.json().notification_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Notification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});