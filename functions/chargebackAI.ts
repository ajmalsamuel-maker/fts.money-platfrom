import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, chargeback_id, psp_code, evidence_urls } = await req.json();

        if (action === 'analyzeChargeback') {
            const chargeback = await queryOne(
                `SELECT * FROM chargeback WHERE chargeback_id = $1`,
                [chargeback_id]
            );

            if (!chargeback) {
                await closeConnection();
                return Response.json({ error: 'Chargeback not found' }, { status: 404 });
            }

            const txn = await queryOne(
                `SELECT * FROM transaction WHERE transaction_id = $1`,
                [chargeback.transaction_id]
            );

            // AI scoring
            let win_score = 50;
            if (chargeback.is_3ds) win_score += 30;
            if (txn?.auth_code) win_score += 15;
            if (evidence_urls?.length > 0) win_score += 20;

            await execute(
                `UPDATE chargeback SET merchant_response = $1, win_probability = $2 WHERE chargeback_id = $3`,
                [JSON.stringify({ evidence: evidence_urls }), win_score, chargeback_id]
            );

            await closeConnection();
            return Response.json({
                success: true,
                win_probability: win_score,
                recommendation: win_score > 70 ? 'dispute' : win_score > 40 ? 'review' : 'accept'
            });
        }

        if (action === 'submitEvidence') {
            const evidence_id = `EV-${Date.now()}`;
            
            await execute(
                `INSERT INTO chargeback_evidence (evidence_id, chargeback_id, file_urls, status)
                 VALUES ($1, $2, $3, $4)`,
                [evidence_id, chargeback_id, JSON.stringify(evidence_urls), 'submitted']
            );

            await closeConnection();
            return Response.json({ success: true, evidence_id });
        }

        if (action === 'predictOutcome') {
            const chargeback = await queryOne(
                `SELECT * FROM chargeback WHERE chargeback_id = $1`,
                [chargeback_id]
            );

            // Historical prediction
            const similar = await query(
                `SELECT outcome FROM chargeback WHERE reason_code = $1 AND outcome IS NOT NULL LIMIT 100`,
                [chargeback.reason_code]
            );

            const wins = similar.filter(c => c.outcome === 'merchant_favor').length;
            const win_rate = similar.length > 0 ? (wins / similar.length * 100).toFixed(2) : 50;

            await closeConnection();
            return Response.json({
                success: true,
                predicted_outcome: win_rate > 60 ? 'merchant_favor' : 'issuer_favor',
                confidence: win_rate
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Chargeback AI error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});