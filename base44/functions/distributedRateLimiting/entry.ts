import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, service_id, request_id } = await req.json();

        if (action === 'checkCircuitBreaker') {
            const failure_rate = await queryOne(
                `SELECT COUNT(CASE WHEN status = 'failed' THEN 1 END)::float / COUNT(*) as rate
                 FROM service_request WHERE service_id = $1 AND recorded_at >= NOW() - INTERVAL '5 minutes'`,
                [service_id]
            );

            const breaker_status = failure_rate.rate > 0.5 ? 'open' : 'closed';

            await closeConnection();
            return Response.json({
                success: true,
                breaker_status,
                failure_rate: failure_rate.rate
            });
        }

        if (action === 'enforceQuota') {
            const quota = await queryOne(
                `SELECT quota_limit FROM service_quota WHERE service_id = $1 AND psp_code = $2`,
                [service_id, psp_code]
            );

            const used = await queryOne(
                `SELECT COUNT(*) as count FROM service_request WHERE service_id = $1 AND recorded_at >= NOW() - INTERVAL '1 minute'`,
                [service_id]
            );

            const allowed = used.count < (quota?.quota_limit || 100);

            await closeConnection();
            return Response.json({
                success: true,
                allowed,
                usage: used.count,
                limit: quota?.quota_limit || 100
            });
        }

        if (action === 'recordRequest') {
            const status = req.json().status || 'success';
            
            await execute(
                `INSERT INTO service_request (request_id, service_id, psp_code, status, recorded_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [request_id, service_id, psp_code, status]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Distributed rate limiting error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});