import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, dispute_id, file_url, evidence_type } = await req.json();

        if (action === 'uploadEvidence') {
            const ev_id = `EV-${Date.now()}`;
            
            await execute(
                `INSERT INTO dispute_evidence (evidence_id, dispute_id, psp_code, file_url, evidence_type, status, uploaded_date)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [ev_id, dispute_id, psp_code, file_url, evidence_type, 'uploaded']
            );

            await closeConnection();
            return Response.json({ success: true, evidence_id: ev_id });
        }

        if (action === 'analyzeEvidence') {
            const evidence = await queryOne(
                `SELECT * FROM dispute_evidence WHERE evidence_id = $1`,
                [req.json().evidence_id]
            );

            // AI analysis
            let strength = 50;
            if (evidence.evidence_type === 'invoice') strength += 20;
            if (evidence.evidence_type === 'shipping_proof') strength += 25;
            if (evidence.evidence_type === 'signature') strength += 15;

            await execute(
                `UPDATE dispute_evidence SET strength_score = $1, analysis_status = 'completed' WHERE evidence_id = $2`,
                [strength, req.json().evidence_id]
            );

            await closeConnection();
            return Response.json({ success: true, strength_score: strength });
        }

        if (action === 'listEvidence') {
            const evidence = await query(
                `SELECT * FROM dispute_evidence WHERE dispute_id = $1 AND psp_code = $2 ORDER BY uploaded_date DESC`,
                [dispute_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, evidence });
        }

        if (action === 'retentionCheck') {
            // Mark for deletion after 7 years
            await execute(
                `UPDATE dispute_evidence SET status = 'scheduled_deletion' WHERE psp_code = $1 AND uploaded_date < NOW() - INTERVAL '7 years'`,
                [psp_code]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Evidence management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});