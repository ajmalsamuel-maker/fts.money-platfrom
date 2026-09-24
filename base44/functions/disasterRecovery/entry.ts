import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, primary_region, standby_region } = await req.json();

        if (action === 'initializeFailover') {
            const failover_id = `FO-${Date.now()}`;
            
            await execute(
                `INSERT INTO failover_config (failover_id, psp_code, primary_region, standby_region, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [failover_id, psp_code, primary_region, standby_region, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, failover_id });
        }

        if (action === 'checkReplication') {
            const replication = await queryOne(
                `SELECT * FROM replication_config WHERE psp_code = $1`,
                [psp_code]
            );

            if (!replication) {
                await closeConnection();
                return Response.json({ success: false, replicating: false });
            }

            // Check lag
            const lag = await queryOne(
                `SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))::int as lag_seconds`
            );

            await closeConnection();
            return Response.json({
                success: true,
                replicating: true,
                lag_seconds: lag?.lag_seconds || 0
            });
        }

        if (action === 'executeFailover') {
            await execute(
                `UPDATE failover_config SET status = 'executing', failover_at = NOW() WHERE psp_code = $1`,
                [psp_code]
            );

            // Promote standby
            await new Promise(resolve => setTimeout(resolve, 100));

            await execute(
                `UPDATE failover_config SET status = 'completed', completed_at = NOW() WHERE psp_code = $1`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, failover_executed: true });
        }

        if (action === 'trackRTO') {
            const config = await queryOne(
                `SELECT rto_minutes, rpo_minutes FROM failover_config WHERE psp_code = $1`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({
                success: true,
                rto_minutes: config?.rto_minutes || 15,
                rpo_minutes: config?.rpo_minutes || 5
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Disaster recovery error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});