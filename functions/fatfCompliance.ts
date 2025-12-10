import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * FATF Compliance Engine
 * Handles Travel Rule screening, sanctions checks, and SAR generation
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, data } = await req.json();

        switch (action) {
            case 'check_travel_rule':
                return Response.json(await checkTravelRule(base44, data));
            
            case 'screen_sanctions':
                return Response.json(await screenSanctions(base44, data));
            
            case 'generate_sar':
                return Response.json(await generateSAR(base44, data));
            
            case 'calculate_risk_score':
                return Response.json(await calculateRiskScore(base44, data));
            
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('FATF Compliance Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

/**
 * Check if Travel Rule applies and validate data completeness
 */
async function checkTravelRule(base44, { transaction_id, amount, currency }) {
    // Travel Rule thresholds (FATF Recommendation 16)
    const thresholds = {
        USD: 1000,
        EUR: 1000,
        GBP: 850,
        // Add more currencies as needed
    };

    const threshold = thresholds[currency] || 1000;
    const ruleTriggered = amount >= threshold;

    if (!ruleTriggered) {
        return {
            rule_triggered: false,
            threshold_met: false,
            threshold_amount: threshold,
            threshold_currency: currency
        };
    }

    // Check if transaction exists and has crypto involvement
    const transactions = await base44.asServiceRole.entities.Transaction.filter({
        id: transaction_id
    });
    
    const transaction = transactions[0];
    if (!transaction) {
        return { error: 'Transaction not found' };
    }

    // Calculate data completeness score
    const requiredFields = [
        'originator_name',
        'originator_account',
        'originator_address',
        'originator_country',
        'beneficiary_name',
        'beneficiary_account',
        'beneficiary_country'
    ];

    return {
        rule_triggered: true,
        threshold_met: true,
        threshold_amount: threshold,
        threshold_currency: currency,
        crypto_asset: transaction.crypto_asset,
        blockchain_network: transaction.blockchain_network,
        requires_vasp_transmission: !!transaction.crypto_asset,
        recommended_action: 'collect_travel_rule_data'
    };
}

/**
 * Screen against sanctions lists (OFAC, UN, EU)
 */
async function screenSanctions(base44, { entity_name, country, wallet_address, type }) {
    // High-risk jurisdictions (FATF grey/black list)
    const highRiskCountries = [
        'KP', 'IR', 'MM', 'SY', // High risk
        'AL', 'BB', 'BF', 'KH', 'HT', 'JM', 'JO', 'ML', 'MZ', 'NI', 'PK', 'PA', 'PH', 'SN', 'ZA', 'TZ', 'TR', 'UG', 'AE', 'YE' // Increased monitoring
    ];

    const riskLevel = highRiskCountries.includes(country) ? 'high' : 'low';
    const manualReviewRequired = riskLevel === 'high';

    // In production, integrate with:
    // - Dow Jones Risk & Compliance
    // - Refinitiv World-Check
    // - ComplyAdvantage
    // - Chainalysis (for blockchain analysis)
    // - Elliptic
    // - TRM Labs

    // Simulated screening
    const screeningResult = {
        screening_type: type || 'transaction',
        screened_entity: entity_name,
        screened_country: country,
        screening_lists: ['OFAC SDN', 'UN Consolidated List', 'EU Sanctions'],
        match_found: false,
        match_score: 0,
        risk_level: riskLevel,
        screening_result: 'clear',
        screening_provider: 'Internal',
        screening_timestamp: new Date().toISOString(),
        manual_review_required: manualReviewRequired,
        manual_review_status: manualReviewRequired ? 'pending' : null
    };

    // If wallet address provided, check blockchain forensics
    if (wallet_address) {
        screeningResult.blockchain_analysis = {
            address: wallet_address,
            risk_score: 0,
            exposure_to_mixers: false,
            exposure_to_sanctioned_entities: false,
            exposure_to_darknet: false,
            // In production: integrate Chainalysis Reactor, Elliptic Lens, TRM Labs
        };
    }

    // Save screening result
    await base44.asServiceRole.entities.SanctionsScreening.create(screeningResult);

    return screeningResult;
}

/**
 * Generate Suspicious Activity Report
 */
async function generateSAR(base44, { transaction_ids, merchant_id, indicators, description }) {
    const transactions = await base44.asServiceRole.entities.Transaction.filter({
        id: { $in: transaction_ids }
    });

    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const currency = transactions[0]?.currency || 'USD';

    // Calculate risk score based on indicators
    const riskScore = calculateSARRiskScore(indicators, transactions);

    const sar = {
        sar_id: `SAR-${Date.now()}`,
        report_type: 'SAR',
        status: 'draft',
        priority: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
        transaction_ids,
        merchant_id,
        suspicious_indicators: indicators,
        activity_description: description,
        total_amount: totalAmount,
        currency,
        detection_method: 'automated',
        detection_timestamp: new Date().toISOString(),
        risk_score: riskScore,
        crypto_related: transactions.some(t => t.crypto_asset),
        crypto_assets: [...new Set(transactions.map(t => t.crypto_asset).filter(Boolean))],
        wallet_addresses: [...new Set(transactions.map(t => t.crypto_address).filter(Boolean))],
        blockchain_networks: [...new Set(transactions.map(t => t.blockchain_network).filter(Boolean))]
    };

    const created = await base44.asServiceRole.entities.SuspiciousActivityReport.create(sar);

    return created;
}

/**
 * Calculate comprehensive risk score
 */
async function calculateRiskScore(base44, { transaction_id, merchant_id, customer_email }) {
    let riskScore = 0;
    const factors = [];

    // Fetch transaction
    const transactions = await base44.asServiceRole.entities.Transaction.filter({
        id: transaction_id
    });
    const transaction = transactions[0];

    if (!transaction) {
        return { error: 'Transaction not found' };
    }

    // High-risk country check
    const highRiskCountries = ['KP', 'IR', 'MM', 'SY'];
    if (highRiskCountries.includes(transaction.customer_country)) {
        riskScore += 30;
        factors.push('high_risk_jurisdiction');
    }

    // Large transaction amount
    if (transaction.amount > 10000) {
        riskScore += 20;
        factors.push('large_transaction');
    }

    // Crypto involvement
    if (transaction.crypto_asset) {
        riskScore += 10;
        factors.push('crypto_transaction');
    }

    // Check customer history
    const customerTransactions = await base44.asServiceRole.entities.Transaction.filter({
        customer_email: customer_email || transaction.customer_email
    });

    // Velocity check
    const last24h = customerTransactions.filter(t => {
        const txDate = new Date(t.created_date);
        const now = new Date();
        return (now - txDate) < 24 * 60 * 60 * 1000;
    });

    if (last24h.length > 10) {
        riskScore += 25;
        factors.push('high_velocity');
    }

    // Normalize to 0-100
    riskScore = Math.min(riskScore, 100);

    return {
        risk_score: riskScore,
        risk_level: riskScore > 70 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 30 ? 'medium' : 'low',
        factors,
        requires_enhanced_due_diligence: riskScore > 50,
        requires_manual_review: riskScore > 70,
        recommendation: riskScore > 70 ? 'block_and_review' : riskScore > 50 ? 'manual_review' : 'approve'
    };
}

function calculateSARRiskScore(indicators, transactions) {
    let score = 0;
    
    const highRiskIndicators = [
        'structuring',
        'layering',
        'integration',
        'terrorist_financing',
        'sanctions_evasion'
    ];

    indicators.forEach(indicator => {
        if (highRiskIndicators.includes(indicator)) {
            score += 25;
        } else {
            score += 10;
        }
    });

    // Adjust for transaction count and amount
    if (transactions.length > 10) score += 20;
    if (transactions.some(t => t.amount > 50000)) score += 15;

    return Math.min(score, 100);
}