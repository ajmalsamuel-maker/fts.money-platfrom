import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, event_type, event_data, user_id } = await req.json();

        if (action === 'trackEvent') {
            const event_id = `EVT-${Date.now()}`;
            
            await execute(
                `INSERT INTO analytics_event (event_id, psp_code, event_type, user_id, data, recorded_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [event_id, psp_code, event_type, user_id, JSON.stringify(event_data)]
            );

            await closeConnection();
            return Response.json({ success: true, event_id });
        }

        if (action === 'aggregateEvents') {
            const aggregated = await query(
                `SELECT event_type, COUNT(*) as count, DATE(recorded_at) as date
                 FROM analytics_event WHERE psp_code = $1 AND recorded_at >= NOW() - INTERVAL '7 days'
                 GROUP BY event_type, DATE(recorded_at) ORDER BY date DESC`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, aggregations: aggregated });
        }

        if (action === 'getUserJourney') {
            const journey = await query(
                `SELECT event_type, recorded_at FROM analytics_event WHERE psp_code = $1 AND user_id = $2
                 ORDER BY recorded_at ASC LIMIT 100`,
                [psp_code, user_id]
            );

            await closeConnection();
            return Response.json({ success: true, journey });
        }

        if (action === 'getConversion') {
            const conversions = await query(
                `SELECT COUNT(DISTINCT user_id) as converters FROM analytics_event 
                 WHERE psp_code = $1 AND event_type = 'transaction_completed' AND recorded_at >= NOW() - INTERVAL '30 days'`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, conversions: conversions[0]?.converters || 0 });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Analytics error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});