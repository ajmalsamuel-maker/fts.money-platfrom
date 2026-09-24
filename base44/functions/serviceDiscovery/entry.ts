import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, service_name, instance_id, health_check_url } = await req.json();

        if (action === 'registerService') {
            await execute(
                `INSERT INTO service_instance (instance_id, psp_code, service_name, health_check_url, status, registered_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [instance_id, psp_code, service_name, health_check_url, 'healthy']
            );

            await closeConnection();
            return Response.json({ success: true, registered: true });
        }

        if (action === 'discoverServices') {
            const instances = await query(
                `SELECT * FROM service_instance WHERE psp_code = $1 AND service_name = $2 AND status = 'healthy'`,
                [psp_code, service_name]
            );

            await closeConnection();
            return Response.json({ success: true, instances });
        }

        if (action === 'healthCheck') {
            const instance = await queryOne(
                `SELECT * FROM service_instance WHERE instance_id = $1`,
                [instance_id]
            );

            if (!instance) {
                await closeConnection();
                return Response.json({ error: 'Instance not found' }, { status: 404 });
            }

            // Mock health check
            const healthy = true;

            if (!healthy) {
                await execute(
                    `UPDATE service_instance SET status = 'unhealthy' WHERE instance_id = $1`,
                    [instance_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, healthy });
        }

        if (action === 'loadBalance') {
            const instance = await queryOne(
                `SELECT * FROM service_instance WHERE psp_code = $1 AND service_name = $2 AND status = 'healthy'
                 ORDER BY RANDOM() LIMIT 1`,
                [psp_code, service_name]
            );

            await closeConnection();
            return Response.json({ success: true, selected_instance: instance });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Service discovery error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});