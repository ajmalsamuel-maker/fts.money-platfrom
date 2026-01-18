import { query, queryOne, closeConnection } from './db/postgresClient.js';

/**
 * Advanced Risk Scoring for Transactions
 * Calculates fraud risk, AML flags, velocity patterns
 */
Deno.serve(async (req) => {
    try {
        const {
            merchant_id,
            psp_code,
            amount,
            customer_email,
            customer_country,
            payment_method,
            card_last_four
        } = await req.json();

        let score = 0;
        const flags = [];

        const now = new Date();
        const fiveMinutesAgo = new Date(now - 5 * 60000);
        const oneHourAgo = new Date(now - 60 * 60000);

        // 1. VELOCITY CHECKS - rapid transactions
        const rapid = await query(
            `SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND status = 'approved' AND created_date > $3`,
            [merchant_id, psp_code, fiveMinutesAgo.toISOString()]
        );

        const rapidCount = rapid[0]?.count || 0;
        if (rapidCount > 5) {
            score += 30;
            flags.push('HIGH_VELOCITY_5MIN');
        } else if (rapidCount > 3) {
            score += 15;
            flags.push('MODERATE_VELOCITY_5MIN');
        }

        // 2. CARD TESTING DETECTION
        const smallAmounts = await query(
            `SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND amount < 5 AND created_date > $3`,
            [merchant_id, psp_code, oneHourAgo.toISOString()]
        );

        const smallCount = smallAmounts[0]?.count || 0;
        if (smallCount > 10) {
            score += 40;
            flags.push('CARD_TESTING_PATTERN');
        }

        // 3. AMOUNT ANOMALIES
        const avgResult = await query(
            `SELECT AVG(amount) as avg_amount FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND status = 'approved'`,
            [merchant_id, psp_code]
        );

        const avgAmount = avgResult[0]?.avg_amount || 0;
        if (amount > avgAmount * 5) {
            score += 20;
            flags.push('AMOUNT_SPIKE');
        }

        // 4. Get merchant for geographic & risk checks
        const merchant = await queryOne(
            `SELECT * FROM merchant WHERE id = $1 AND psp_code = $2`,
            [merchant_id, psp_code]
        );

        if (merchant && customer_country && customer_country !== merchant.country) {
            score += 10;
            flags.push('CROSS_BORDER');

            // Check if previous transaction from different country
            const lastTxn = await queryOne(
                `SELECT customer_country, created_date FROM transaction WHERE merchant_id = $1 AND psp_code = $2 ORDER BY created_date DESC LIMIT 1`,
                [merchant_id, psp_code]
            );

            if (lastTxn && lastTxn.customer_country !== customer_country &&
                new Date(lastTxn.created_date) > new Date(now - 60000)) {
                score += 20;
                flags.push('RAPID_COUNTRY_CHANGE');
            }
        }

        // 5. PAYMENT METHOD PATTERNS
        const methodPatterns = await query(
            `SELECT payment_method, COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND psp_code = $2 ORDER BY created_date DESC LIMIT 20 GROUP BY payment_method`,
            [merchant_id, psp_code]
        );

        const methodCount = methodPatterns.find(m => m.payment_method === payment_method)?.count || 0;
        if (payment_method && methodCount > 8) {
            score += 15;
            flags.push('REPEATED_PAYMENT_METHOD');
        }

        // 6. NEW CUSTOMER
        const customerCount = await query(
            `SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND customer_email = $3`,
            [merchant_id, psp_code, customer_email]
        );

        if (customerCount[0]?.count === 0) {
            score += 10;
            flags.push('NEW_CUSTOMER');
        }

        // 7. BIN/CARD PATTERNS
        if (card_last_four) {
            const declinedCard = await query(
                `SELECT COUNT(*) as count FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND card_last_four = $3 AND status = 'declined'`,
                [merchant_id, psp_code, card_last_four]
            );

            if (declinedCard[0]?.count > 3) {
                score += 25;
                flags.push('REPEATED_DECLINED_CARD');
            }
        }

        // 8. MERCHANT RISK LEVEL
        if (merchant) {
            if (merchant.risk_level === 'high') {
                score += 15;
                flags.push('HIGH_RISK_MERCHANT');
            }

            if (merchant.aml_status === 'flagged') {
                score += 30;
                flags.push('MERCHANT_AML_FLAGGED');
            }

            if (merchant.kyb_status !== 'approved') {
                score += 15;
                flags.push('MERCHANT_KYB_INCOMPLETE');
            }
        }

        score = Math.min(score, 100);

        let risk_level = 'low';
        if (score > 70) risk_level = 'critical';
        else if (score > 50) risk_level = 'high';
        else if (score > 30) risk_level = 'medium';

        await closeConnection();
        console.log(`🎲 Risk Score: ${score} - ${risk_level} - Flags: ${flags.join(', ')}`);

        return Response.json({
            score,
            risk_level,
            flags,
            recommendation: risk_level === 'critical' ? 'block' : (risk_level === 'high' ? 'review' : 'approve'),
            velocity_check: {
                rapid_5min: rapidCount,
                small_amount_1hr: smallCount
            },
            merchant_risk: merchant?.risk_level,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        await closeConnection();
        console.error('Risk scoring error:', error);
        return Response.json({
            score: 0,
            risk_level: 'unknown',
            error: error.message,
            recommendation: 'review'
        }, { status: 500 });
    }
});