import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, flag_name, user_id, percentage } = await req.json();

        if (action === 'createFlag') {
            const flag_id = `FLAG-${Date.now()}`;
            
            await execute(
                `INSERT INTO feature_flag (flag_id, psp_code, name, enabled, rollout_percentage, created_date)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [flag_id, psp_code, flag_name, req.json().enabled || false, percentage || 0]
            );

            await closeConnection();
            return Response.json({ success: true, flag_id });
        }

        if (action === 'isEnabled') {
            const flag = await queryOne(
                `SELECT * FROM feature_flag WHERE psp_code = $1 AND name = $2 AND enabled = true`,
                [psp_code, flag_name]
            );

            if (!flag) {
                await closeConnection();
                return Response.json({ success: true, enabled: false });
            }

            // Check rollout percentage
            const hash = (user_id || Math.random()).toString().charCodeAt(0) % 100;
            const enabled = hash < (flag.rollout_percentage || 100);

            await closeConnection();
            return Response.json({ success: true, enabled });
        }

        if (action === 'enableFlag') {
            await execute(
                `UPDATE feature_flag SET enabled = true WHERE psp_code = $1 AND name = $2`,
                [psp_code, flag_name]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'gradualRollout') {
            await execute(
                `UPDATE feature_flag SET rollout_percentage = $1 WHERE psp_code = $2 AND name = $3`,
                [percentage, psp_code, flag_name]
            );

            await closeConnection();
            return Response.json({ success: true, rollout_percentage: percentage });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Feature flags error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});