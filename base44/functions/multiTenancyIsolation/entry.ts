import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, tenant_id, resource_id, resource_type } = await req.json();

        if (action === 'checkIsolation') {
            const record = await queryOne(
                `SELECT * FROM ${resource_type} WHERE id = $1 AND psp_code = $2`,
                [resource_id, psp_code]
            );

            if (!record) {
                await closeConnection();
                return Response.json({ error: 'Access denied' }, { status: 403 });
            }

            await closeConnection();
            return Response.json({ success: true, isolated: true });
        }

        if (action === 'enforcePartition') {
            await execute(
                `ALTER TABLE transaction ADD CONSTRAINT tenant_isolation_${psp_code} 
                 CHECK (psp_code = '${psp_code}')`,
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'listTenantResources') {
            const resources = await query(
                `SELECT id, resource_type FROM (
                    SELECT id, 'transaction' as resource_type, psp_code FROM transaction WHERE psp_code = $1
                    UNION ALL
                    SELECT id, 'merchant' as resource_type, psp_code FROM merchant WHERE psp_code = $1
                ) t ORDER BY id DESC LIMIT 1000`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, resources });
        }

        if (action === 'auditCrossTenant') {
            const violations = await query(
                `SELECT * FROM audit_trail WHERE psp_code != $1 AND created_date >= NOW() - INTERVAL '1 hour'`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, violations: violations.length });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Multi-tenancy error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});