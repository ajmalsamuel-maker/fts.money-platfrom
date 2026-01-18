import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, merchant_id, transaction_data, psp_code } = await req.json();

        if (action === 'scoreTransaction') {
            const { amount, payment_method, customer_country, card_country } = transaction_data;
            let score = 0;

            // Velocity check
            const lastHour = await queryOne(
                `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as volume FROM transaction 
                 WHERE merchant_id = $1 AND created_date >= NOW() - INTERVAL '1 hour'`,
                [merchant_id]
            );

            if (lastHour.count > 100) score += 25;
            if (lastHour.volume > 50000) score += 25;

            // Geographic mismatch
            if (card_country && customer_country && card_country !== customer_country) {
                score += 15;
            }

            // Card testing
            const last24h = await queryOne(
                `SELECT COUNT(*) as declined FROM transaction 
                 WHERE merchant_id = $1 AND status = 'declined' AND created_date >= NOW() - INTERVAL '24 hours'`,
                [merchant_id]
            );

            if (last24h.declined > 10) score += 20;

            // High amount check
            if (amount > 5000) score += 10;

            // Log risk assessment
            await execute(
                `INSERT INTO risk_assessment (merchant_id, transaction_id, risk_score, psp_code, assessment_type)
                 VALUES ($1, $2, $3, $4, $5)`,
                [merchant_id, transaction_data.transaction_id || 'pending', score, psp_code, 'automatic']
            );

            await closeConnection();
            return Response.json({
                success: true,
                risk_score: score,
                risk_level: score < 30 ? 'low' : score < 60 ? 'medium' : 'high',
                recommendation: score > 60 ? 'block' : score > 30 ? 'review' : 'approve'
            });
        }

        if (action === 'getMerchantRiskProfile') {
            const profile = await queryOne(
                `SELECT * FROM merchant WHERE id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            const recentDisputes = await query(
                `SELECT COUNT(*) as count FROM dispute WHERE merchant_id = $1 AND created_date >= NOW() - INTERVAL '30 days'`,
                [merchant_id]
            );

            await closeConnection();
            return Response.json({
                success: true,
                risk_level: profile?.risk_level || 'medium',
                disputes_30d: recentDisputes[0]?.count || 0
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Risk scoring error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});