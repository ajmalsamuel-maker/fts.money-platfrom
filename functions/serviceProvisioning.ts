import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, services, service_type } = await req.json();

        if (action === 'provisionServices') {
            const services_array = Array.isArray(services) ? services : [services];

            let provisioned = 0;
            for (const service of services_array) {
                try {
                    const subscription_id = `SVC-SUB-${Date.now()}`;
                    await execute(
                        `INSERT INTO service_subscription (subscription_id, merchant_id, psp_code, service_type, status)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [subscription_id, merchant_id, psp_code, service, 'active']
                    );

                    // Log provisioning
                    await execute(
                        `INSERT INTO service_request (merchant_id, psp_code, service_type, status, request_type)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [merchant_id, psp_code, service, 'completed', 'provision']
                    );

                    provisioned++;
                } catch (err) {
                    console.error(`Service provisioning error for ${service}:`, err);
                }
            }

            await closeConnection();
            return Response.json({ success: true, services_provisioned: provisioned });
        }

        if (action === 'listServices') {
            const merchant_services = await query(
                `SELECT DISTINCT service_type FROM service_subscription WHERE merchant_id = $1 AND psp_code = $2 AND status = 'active'`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, services: merchant_services });
        }

        if (action === 'getServiceCatalog') {
            const catalog = await query(
                `SELECT * FROM service_catalog WHERE psp_code = $1 AND status = 'active'`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, catalog });
        }

        if (action === 'updateServiceConfig') {
            const config_id = `SVC-CFG-${Date.now()}`;
            await execute(
                `INSERT INTO service_configuration (config_id, merchant_id, psp_code, service_type, configuration)
                 VALUES ($1, $2, $3, $4, $5)`,
                [config_id, merchant_id, psp_code, service_type, JSON.stringify({})]
            );

            await closeConnection();
            return Response.json({ success: true, config_id });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Service provisioning error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});