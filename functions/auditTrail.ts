import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, user_id, entity_type, entity_id, action_type, changes } = await req.json();

        if (action === 'logAction') {
            const audit_id = `AUDIT-${Date.now()}`;
            
            await execute(
                `INSERT INTO audit_trail (audit_id, psp_code, user_id, entity_type, entity_id, action_type, changes, ip_address, created_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                [audit_id, psp_code, user_id, entity_type, entity_id, action_type, JSON.stringify(changes), req.json().ip_address]
            );

            await closeConnection();
            return Response.json({ success: true, audit_id });
        }

        if (action === 'getHistory') {
            const history = await query(
                `SELECT * FROM audit_trail WHERE psp_code = $1 AND entity_id = $2 ORDER BY created_date DESC LIMIT 100`,
                [psp_code, entity_id]
            );

            await closeConnection();
            return Response.json({ success: true, history });
        }

        if (action === 'getUserActivity') {
            const activity = await query(
                `SELECT * FROM audit_trail WHERE psp_code = $1 AND user_id = $2 AND created_date >= NOW() - INTERVAL '7 days'
                 ORDER BY created_date DESC LIMIT 100`,
                [psp_code, user_id]
            );

            await closeConnection();
            return Response.json({ success: true, activity });
        }

        if (action === 'detectAnomalies') {
            const unusual = await query(
                `SELECT user_id, COUNT(*) as action_count FROM audit_trail WHERE psp_code = $1 AND created_date >= NOW() - INTERVAL '1 hour'
                 GROUP BY user_id HAVING COUNT(*) > 100 ORDER BY action_count DESC`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, anomalies: unusual });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Audit trail error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});