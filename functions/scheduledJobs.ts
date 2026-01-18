import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, job_type } = await req.json();

        if (action === 'scheduleJob') {
            const job_id = `JOB-${Date.now()}`;
            
            await execute(
                `INSERT INTO scheduled_job (job_id, psp_code, job_type, cron_expression, status)
                 VALUES ($1, $2, $3, $4, $5)`,
                [job_id, psp_code, job_type, req.json().cron || '0 0 * * *', 'active']
            );

            await closeConnection();
            return Response.json({ success: true, job_id });
        }

        if (action === 'getPendingJobs') {
            const pending = await query(
                `SELECT * FROM scheduled_job WHERE status = 'active' AND psp_code = $1 AND last_run < NOW() - INTERVAL '1 hour'`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, jobs: pending });
        }

        if (action === 'executeJob') {
            const job_id = req.json().job_id;
            const exec_id = `EXEC-${Date.now()}`;
            
            await execute(
                `INSERT INTO job_execution (execution_id, job_id, status, started_at)
                 VALUES ($1, $2, $3, NOW())`,
                [exec_id, job_id, 'running']
            );

            // Simulate job work
            await new Promise(resolve => setTimeout(resolve, 100));

            await execute(
                `UPDATE job_execution SET status = 'completed', completed_at = NOW() WHERE execution_id = $1`,
                [exec_id]
            );

            await execute(
                `UPDATE scheduled_job SET last_run = NOW() WHERE job_id = $1`,
                [job_id]
            );

            await closeConnection();
            return Response.json({ success: true, execution_id: exec_id });
        }

        if (action === 'retryFailed') {
            const failed = await query(
                `SELECT * FROM job_execution WHERE status = 'failed' AND retry_count < 3 AND job_id IN 
                 (SELECT job_id FROM scheduled_job WHERE psp_code = $1)`,
                [psp_code]
            );

            for (const job of failed) {
                await execute(
                    `UPDATE job_execution SET retry_count = retry_count + 1, status = 'pending' WHERE execution_id = $1`,
                    [job.execution_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, retried: failed.length });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Scheduled jobs error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});