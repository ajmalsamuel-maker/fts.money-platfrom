import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, channel, event_type, data } = await req.json();

        if (action === 'publishEvent') {
            const event_id = `EVT-${Date.now()}`;
            
            await execute(
                `INSERT INTO realtime_event (event_id, psp_code, channel, event_type, payload, created_date)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [event_id, psp_code, channel, event_type, JSON.stringify(data)]
            );

            await closeConnection();
            return Response.json({ success: true, event_id });
        }

        if (action === 'subscribeChannel') {
            const sub_id = `SUB-${Date.now()}`;
            
            await execute(
                `INSERT INTO realtime_subscription (subscription_id, psp_code, channel, user_id, created_date)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [sub_id, psp_code, channel, req.json().user_id]
            );

            await closeConnection();
            return Response.json({ success: true, subscription_id: sub_id });
        }

        if (action === 'getChannelUpdates') {
            const events = await query(
                `SELECT * FROM realtime_event WHERE psp_code = $1 AND channel = $2 AND created_date >= NOW() - INTERVAL '1 minute'
                 ORDER BY created_date DESC`,
                [psp_code, channel]
            );

            await closeConnection();
            return Response.json({ success: true, events });
        }

        if (action === 'broadcastDashboard') {
            // Get latest metrics
            const metrics = await queryOne(
                `SELECT COUNT(*) as txn_count, COALESCE(SUM(amount), 0) as volume FROM transaction WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '1 minute'`,
                [psp_code]
            );

            await execute(
                `INSERT INTO realtime_event (event_id, psp_code, channel, event_type, payload, created_date)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [`EVT-${Date.now()}`, psp_code, 'dashboard', 'metrics_update', JSON.stringify(metrics)]
            );

            await closeConnection();
            return Response.json({ success: true, metrics });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Realtime updates error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});