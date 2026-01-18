import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, cache_key, value, ttl } = await req.json();

        if (action === 'setCache') {
            await execute(
                `INSERT INTO cache_store (cache_key, psp_code, value, expires_at, created_date)
                 VALUES ($1, $2, $3, NOW() + INTERVAL '${ttl || 3600} seconds', NOW())
                 ON CONFLICT (cache_key) DO UPDATE SET value = $3, expires_at = NOW() + INTERVAL '${ttl || 3600} seconds'`,
                [cache_key, psp_code, JSON.stringify(value)]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'getCache') {
            const cached = await queryOne(
                `SELECT value FROM cache_store WHERE cache_key = $1 AND psp_code = $2 AND expires_at > NOW()`,
                [cache_key, psp_code]
            );

            await closeConnection();
            return Response.json({
                success: true,
                hit: !!cached,
                value: cached ? JSON.parse(cached.value) : null
            });
        }

        if (action === 'invalidate') {
            await execute(
                `DELETE FROM cache_store WHERE cache_key = $1 AND psp_code = $2`,
                [cache_key, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'purgeExpired') {
            const result = await execute(
                `DELETE FROM cache_store WHERE psp_code = $1 AND expires_at < NOW()`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Cache management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});