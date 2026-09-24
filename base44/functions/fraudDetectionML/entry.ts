import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, merchant_id, transaction_data, psp_code } = await req.json();

        if (action === 'analyzeTransaction') {
            const patterns = await query(
                `SELECT payment_method, COUNT(*) as freq, AVG(amount) as avg_amount 
                 FROM transaction WHERE merchant_id = $1 AND created_date >= NOW() - INTERVAL '30 days'
                 GROUP BY payment_method`,
                [merchant_id]
            );

            let fraud_score = 0;
            const { amount, payment_method, customer_email, ip_address } = transaction_data;

            // Pattern deviation
            const method_pattern = patterns.find(p => p.payment_method === payment_method);
            if (method_pattern && amount > method_pattern.avg_amount * 3) fraud_score += 30;

            // Velocity spike
            const hour_txns = await queryOne(
                `SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND created_date >= NOW() - INTERVAL '1 hour'`,
                [merchant_id]
            );
            if (hour_txns.count > 50) fraud_score += 25;

            // Email frequency
            const email_freq = await queryOne(
                `SELECT COUNT(*) as count FROM transaction WHERE customer_email = $1 AND created_date >= NOW() - INTERVAL '24 hours'`,
                [customer_email]
            );
            if (email_freq.count > 10) fraud_score += 20;

            // Log ML prediction
            await execute(
                `INSERT INTO fraud_detection_log (merchant_id, transaction_id, fraud_score, psp_code, detection_method)
                 VALUES ($1, $2, $3, $4, $5)`,
                [merchant_id, transaction_data.transaction_id || 'pending', fraud_score, psp_code, 'ml_pattern_analysis']
            );

            await closeConnection();
            return Response.json({
                success: true,
                fraud_score,
                fraud_risk: fraud_score > 70 ? 'high' : fraud_score > 40 ? 'medium' : 'low',
                patterns_detected: patterns.length
            });
        }

        if (action === 'getMerchantProfile') {
            const profile = await queryOne(
                `SELECT * FROM merchant_fraud_profile WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, profile });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Fraud detection error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});