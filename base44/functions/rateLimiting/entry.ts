import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, merchant_id, api_key, request_count = 1, psp_code } = await req.json();

        if (action === 'checkLimit') {
            const now = new Date();
            const windowStart = new Date(now.getTime() - 60000); // 1 minute window

            const recent = await queryOne(
                `SELECT COUNT(*) as count FROM api_request_log WHERE merchant_id = $1 AND created_date >= $2`,
                [merchant_id, windowStart.toISOString()]
            );

            const limit = 1000; // requests per minute
            const allowed = (recent?.count || 0) < limit;

            if (allowed) {
                await execute(
                    `INSERT INTO api_request_log (merchant_id, psp_code, endpoint, status)
                     VALUES ($1, $2, $3, $4)`,
                    [merchant_id, psp_code, 'api_call', 'allowed']
                );
            } else {
                await execute(
                    `INSERT INTO api_request_log (merchant_id, psp_code, endpoint, status)
                     VALUES ($1, $2, $3, $4)`,
                    [merchant_id, psp_code, 'api_call', 'rate_limited']
                );
            }

            await closeConnection();
            return Response.json({
                success: true,
                allowed,
                remaining: Math.max(0, limit - (recent?.count || 0)),
                limit,
                reset_in_seconds: 60
            });
        }

        if (action === 'getUsage') {
            const now = new Date();
            const hourAgo = new Date(now.getTime() - 3600000);

            const usage = await query(
                `SELECT status, COUNT(*) as count FROM api_request_log WHERE merchant_id = $1 AND created_date >= $2
                 GROUP BY status`,
                [merchant_id, hourAgo.toISOString()]
            );

            await closeConnection();
            return Response.json({ success: true, usage, period: '1 hour' });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Rate limiting error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});