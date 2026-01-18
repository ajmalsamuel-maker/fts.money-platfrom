import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, doc_type, file_url } = await req.json();

        if (action === 'uploadDocument') {
            const doc_id = `DOC-${Date.now()}`;
            
            await execute(
                `INSERT INTO document (doc_id, merchant_id, psp_code, doc_type, file_url, status, created_date)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [doc_id, merchant_id, psp_code, doc_type, file_url, 'pending']
            );

            await closeConnection();
            return Response.json({ success: true, doc_id });
        }

        if (action === 'verifyDocument') {
            await execute(
                `UPDATE document SET status = $1, verified_date = NOW() WHERE doc_id = $2`,
                ['verified', req.json().doc_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'listDocuments') {
            const docs = await query(
                `SELECT * FROM document WHERE merchant_id = $1 AND psp_code = $2 ORDER BY created_date DESC`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, documents: docs });
        }

        if (action === 'expireDocument') {
            await execute(
                `UPDATE document SET status = 'expired' WHERE doc_id = $1`,
                [req.json().doc_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Document management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});