import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Advanced Risk Scoring for Transactions
 * Calculates fraud risk, AML flags, velocity patterns
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
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

        // 1. VELOCITY CHECKS - rapid transactions
        const recentTransactions = await base44.asServiceRole.entities.Transaction.filter({
            merchant_id,
            psp_code,
            status: 'approved'
        });

        const now = new Date();
        const fiveMinutesAgo = new Date(now - 5 * 60000);

        const rapid = recentTransactions.filter(t => {
            const txnTime = new Date(t.created_date);
            return txnTime > fiveMinutesAgo;
        });

        if (rapid.length > 5) {
            score += 30;
            flags.push('HIGH_VELOCITY_5MIN');
        } else if (rapid.length > 3) {
            score += 15;
            flags.push('MODERATE_VELOCITY_5MIN');
        }

        // 2. CARD TESTING DETECTION - small amounts repeatedly
        const smallAmounts = recentTransactions.filter(t => 
            t.amount < 5 && 
            new Date(t.created_date) > new Date(now - 60 * 60000) // Last hour
        );

        if (smallAmounts.length > 10) {
            score += 40;
            flags.push('CARD_TESTING_PATTERN');
        }

        // 3. AMOUNT ANOMALIES
        const avgAmount = recentTransactions.length > 0 
            ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length
            : 0;

        if (amount > avgAmount * 5) {
            score += 20;
            flags.push('AMOUNT_SPIKE');
        }

        // 4. GEOGRAPHIC ANOMALIES
        const merchant = (await base44.asServiceRole.entities.Merchant.filter({
            id: merchant_id,
            psp_code
        }))?.[0];

        if (merchant && customer_country && customer_country !== merchant.country) {
            score += 10;
            flags.push('CROSS_BORDER');

            // Check if previous transaction from different country
            const lastTxn = recentTransactions[0];
            if (lastTxn && lastTxn.customer_country && 
                lastTxn.customer_country !== customer_country &&
                lastTxn.created_date > new Date(now - 60000)) { // Within 1 minute
                score += 20;
                flags.push('RAPID_COUNTRY_CHANGE');
            }
        }

        // 5. PAYMENT METHOD PATTERNS
        const methodCounts = {};
        recentTransactions.slice(0, 20).forEach(t => {
            methodCounts[t.payment_method] = (methodCounts[t.payment_method] || 0) + 1;
        });

        if (payment_method && methodCounts[payment_method] > 8) {
            score += 15;
            flags.push('REPEATED_PAYMENT_METHOD');
        }

        // 6. NEW CUSTOMER
        const customerTxns = recentTransactions.filter(t => 
            t.customer_email === customer_email
        );

        if (customerTxns.length === 0) {
            score += 10;
            flags.push('NEW_CUSTOMER');
        }

        // 7. BIN/CARD PATTERNS
        if (card_last_four) {
            const sameCard = recentTransactions.filter(t => 
                t.card_last_four === card_last_four &&
                t.status === 'declined'
            );

            if (sameCard.length > 3) {
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

        // Cap score at 100
        score = Math.min(score, 100);

        // Determine risk level
        let risk_level = 'low';
        if (score > 70) risk_level = 'critical';
        else if (score > 50) risk_level = 'high';
        else if (score > 30) risk_level = 'medium';

        console.log(`🎲 Risk Score: ${score} - ${risk_level} - Flags: ${flags.join(', ')}`);

        return Response.json({
            score,
            risk_level,
            flags,
            recommendation: risk_level === 'critical' ? 'block' : (risk_level === 'high' ? 'review' : 'approve'),
            velocity_check: {
                rapid_5min: rapid.length,
                small_amount_1hr: smallAmounts.length
            },
            merchant_risk: merchant?.risk_level,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Risk scoring error:', error);
        return Response.json({
            score: 0,
            risk_level: 'unknown',
            error: error.message,
            recommendation: 'review'
        }, { status: 500 });
    }
});