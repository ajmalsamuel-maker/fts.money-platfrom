import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, snapshot_name, backup_date } = await req.json();

        if (action === 'createSnapshot') {
            const snapshot_id = `SNAP-${Date.now()}`;
            
            await execute(
                `INSERT INTO database_snapshot (snapshot_id, psp_code, snapshot_name, status, created_date)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [snapshot_id, psp_code, snapshot_name, 'in_progress']
            );

            // Simulate snapshot creation
            await new Promise(resolve => setTimeout(resolve, 100));

            await execute(
                `UPDATE database_snapshot SET status = 'completed', completed_date = NOW() WHERE snapshot_id = $1`,
                [snapshot_id]
            );

            await closeConnection();
            return Response.json({ success: true, snapshot_id });
        }

        if (action === 'listSnapshots') {
            const snapshots = await query(
                `SELECT * FROM database_snapshot WHERE psp_code = $1 ORDER BY created_date DESC LIMIT 50`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, snapshots });
        }

        if (action === 'restoreSnapshot') {
            const snapshot = await queryOne(
                `SELECT * FROM database_snapshot WHERE snapshot_id = $1 AND psp_code = $2`,
                [req.json().snapshot_id, psp_code]
            );

            if (!snapshot) {
                await closeConnection();
                return Response.json({ error: 'Snapshot not found' }, { status: 404 });
            }

            await execute(
                `INSERT INTO restore_job (job_id, snapshot_id, psp_code, status, started_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [`RESTORE-${Date.now()}`, snapshot.snapshot_id, psp_code, 'in_progress']
            );

            await closeConnection();
            return Response.json({ success: true, restore_started: true });
        }

        if (action === 'enableReplication') {
            await execute(
                `INSERT INTO replication_config (psp_code, replica_url, status, created_date)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (psp_code) DO UPDATE SET replica_url = $2, status = $3`,
                [psp_code, req.json().replica_url, 'active']
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Backup/recovery error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});