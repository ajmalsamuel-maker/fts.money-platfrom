import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, user_id, role_id, permission } = await req.json();

        if (action === 'createRole') {
            const r_id = `ROLE-${Date.now()}`;
            
            await execute(
                `INSERT INTO rbac_role (role_id, psp_code, name, description)
                 VALUES ($1, $2, $3, $4)`,
                [r_id, psp_code, req.json().name, req.json().description]
            );

            await closeConnection();
            return Response.json({ success: true, role_id: r_id });
        }

        if (action === 'grantPermission') {
            await execute(
                `INSERT INTO rbac_permission (role_id, permission, psp_code)
                 VALUES ($1, $2, $3)
                 ON CONFLICT DO NOTHING`,
                [role_id, permission, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'assignRole') {
            await execute(
                `INSERT INTO user_role (user_id, role_id, psp_code)
                 VALUES ($1, $2, $3)
                 ON CONFLICT DO NOTHING`,
                [user_id, role_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'checkPermission') {
            const has_perm = await queryOne(
                `SELECT COUNT(*) as count FROM rbac_permission p
                 JOIN user_role ur ON p.role_id = ur.role_id
                 WHERE ur.user_id = $1 AND p.permission = $2 AND p.psp_code = $3`,
                [user_id, permission, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, has_permission: has_perm.count > 0 });
        }

        if (action === 'getUserRoles') {
            const roles = await query(
                `SELECT DISTINCT r.* FROM rbac_role r
                 JOIN user_role ur ON r.role_id = ur.role_id
                 WHERE ur.user_id = $1 AND r.psp_code = $2`,
                [user_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, roles });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('RBAC error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});