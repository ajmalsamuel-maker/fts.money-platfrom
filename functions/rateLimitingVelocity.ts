import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, customer_email, ip_address } = await req.json();

        if (action === 'checkVelocity') {
            const hour_count = await queryOne(
                `SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND created_date >= NOW() - INTERVAL '1 hour'`,
                [merchant_id]
            );

            const day_count = await queryOne(
                `SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND created_date >= NOW() - INTERVAL '1 day'`,
                [merchant_id]
            );

            const email_hour = await queryOne(
                `SELECT COUNT(*) as count FROM transaction WHERE customer_email = $1 AND created_date >= NOW() - INTERVAL '1 hour'`,
                [customer_email]
            );

            const allowed = hour_count.count < 100 && day_count.count < 1000 && email_hour.count < 50;

            await closeConnection();
            return Response.json({
                success: true,
                allowed,
                hourly_count: hour_count.count,
                daily_count: day_count.count,
                email_hourly: email_hour.count
            });
        }

        if (action === 'checkIPVelocity') {
            const ip_txns = await queryOne(
                `SELECT COUNT(*) as count, COUNT(DISTINCT merchant_id) as merchants FROM transaction WHERE ip_address = $1 AND created_date >= NOW() - INTERVAL '1 hour'`,
                [ip_address]
            );

            const flagged = ip_txns.count > 50 || ip_txns.merchants > 10;

            await closeConnection();
            return Response.json({
                success: true,
                flagged,
                transaction_count: ip_txns.count,
                unique_merchants: ip_txns.merchants
            });
        }

        if (action === 'setLimit') {
            await execute(
                `INSERT INTO velocity_limit (merchant_id, psp_code, hourly_limit, daily_limit)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (merchant_id) DO UPDATE SET hourly_limit = $3, daily_limit = $4`,
                [merchant_id, psp_code, req.json().hourly || 100, req.json().daily || 1000]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Velocity check error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});