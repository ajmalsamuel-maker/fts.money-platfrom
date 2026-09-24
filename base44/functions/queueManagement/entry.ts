import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, queue_name, payload, priority } = await req.json();

        if (action === 'enqueue') {
            const queue_id = `QUE-${Date.now()}`;
            
            await execute(
                `INSERT INTO message_queue (queue_id, psp_code, queue_name, payload, priority, status, created_date)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [queue_id, psp_code, queue_name, JSON.stringify(payload), priority || 5, 'queued']
            );

            await closeConnection();
            return Response.json({ success: true, queue_id });
        }

        if (action === 'dequeue') {
            const message = await queryOne(
                `SELECT * FROM message_queue WHERE psp_code = $1 AND queue_name = $2 AND status = 'queued'
                 ORDER BY priority DESC, created_date ASC LIMIT 1`,
                [psp_code, queue_name]
            );

            if (message) {
                await execute(
                    `UPDATE message_queue SET status = 'processing' WHERE queue_id = $1`,
                    [message.queue_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, message });
        }

        if (action === 'markComplete') {
            await execute(
                `UPDATE message_queue SET status = 'completed', completed_at = NOW() WHERE queue_id = $1`,
                [req.json().queue_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'getQueueStats') {
            const stats = await queryOne(
                `SELECT 
                    COUNT(CASE WHEN status = 'queued' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
                 FROM message_queue WHERE psp_code = $1 AND queue_name = $2`,
                [psp_code, queue_name]
            );

            await closeConnection();
            return Response.json({ success: true, stats });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Queue management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});