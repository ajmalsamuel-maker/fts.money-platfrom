import { execute, closeConnection } from './db/postgresClient.js';

const SCENARIO_CONFIGS = {
    successful_payment: { response_code: '00', status: 'approved', risk_score: 10 },
    declined_card: { response_code: '05', status: 'declined', risk_score: 30 },
    insufficient_funds: { response_code: '51', status: 'declined', risk_score: 20 },
    fraud_detected: { response_code: '59', status: 'declined', risk_score: 95 },
    '3ds_required': { response_code: '3DS', status: 'pending_auth', risk_score: 40 },
    expired_card: { response_code: '54', status: 'declined', risk_score: 15 },
    invalid_cvv: { response_code: 'N7', status: 'declined', risk_score: 50 },
    timeout: { response_code: '68', status: 'error', risk_score: 25 },
    velocity_limit: { response_code: '65', status: 'declined', risk_score: 70 },
    network_error: { response_code: '91', status: 'error', risk_score: 10 }
};

/**
 * Enhanced Load Test Orchestrator
 * Generates realistic payment scenarios with industry-standard test cases
 */
Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const { 
            merchant_ids = [],
            psp_code,
            target_tps = 10,
            duration_seconds = 60,
            payment_methods = ['visa', 'mastercard'],
            transaction_types = ['sale'],
            amount_range = { min: 10, max: 1000 },
            test_scenarios = ['successful_payment'],
            scenario_distribution = { successful_payment: 100 },
            chaos_scenarios = [],
            chaos_intensity = 0,
            chaos_outage_duration = 10
        } = payload;

        if (!merchant_ids || merchant_ids.length === 0) {
            await closeConnection();
            return Response.json({ error: 'At least one merchant required' }, { status: 400 });
        }

        const startTime = Date.now();
        let transactionsGenerated = 0;
        let successful = 0;
        let failed = 0;
        const batchSize = Math.min(target_tps, 50);
        const results = [];
        const scenarioResults = {};
        const chaosInjections = { latency_injected: 0, outages_simulated: 0, errors_forced: 0 };

        const getScenario = () => {
            const rand = Math.random() * 100;
            let cumulative = 0;
            for (const [scenario, percentage] of Object.entries(scenario_distribution)) {
                cumulative += percentage;
                if (rand <= cumulative) return scenario;
            }
            return test_scenarios[0];
        };

        // Chaos: simulate outage
        if (chaos_scenarios.includes('service_outage') && Math.random() * 100 < chaos_intensity) {
            console.log(`[CHAOS] Simulating service outage for ${chaos_outage_duration}s`);
            await new Promise(resolve => setTimeout(resolve, chaos_outage_duration * 1000));
            chaosInjections.outages_simulated++;
        }

        for (let i = 0; i < batchSize; i++) {
            const amount = Math.floor(Math.random() * (amount_range.max - amount_range.min) + amount_range.min);
            const paymentMethod = payment_methods[Math.floor(Math.random() * payment_methods.length)];
            const transactionType = transaction_types[Math.floor(Math.random() * transaction_types.length)];
            const selectedMerchantId = merchant_ids[Math.floor(Math.random() * merchant_ids.length)];
            
            let scenario = getScenario();
            if (chaos_scenarios.includes('increased_errors') && Math.random() * 100 < chaos_intensity) {
                scenario = 'network_error';
                chaosInjections.errors_forced++;
            }
            
            const config = SCENARIO_CONFIGS[scenario] || SCENARIO_CONFIGS.successful_payment;
            scenarioResults[scenario] = (scenarioResults[scenario] || 0) + 1;

            try {
                await execute(
                    `INSERT INTO transaction (psp_code, merchant_id, type, amount, currency, payment_method, card_last_four, customer_email, status, response_code, risk_score)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [psp_code, selectedMerchantId, transactionType, amount, 'USD', paymentMethod, '4242', `test${i}@loadtest.com`, config.status, config.response_code, config.risk_score]
                );
                transactionsGenerated++;
                successful++;
                results.push({ status: 'created' });
            } catch (error) {
                failed++;
                results.push({ error: error.message, status: 'failed' });
            }
        }

        const endTime = Date.now();
        const actualTPS = (transactionsGenerated / ((endTime - startTime) / 1000)).toFixed(2);

        await closeConnection();
        return Response.json({
            success: true,
            summary: {
                target_tps, actual_tps: actualTPS, duration_ms: endTime - startTime,
                transactions_generated: transactionsGenerated, successful, failed,
                success_rate: ((successful / transactionsGenerated) * 100).toFixed(2) + '%',
                scenario_breakdown: scenarioResults,
                chaos_injections: chaos_scenarios.length > 0 ? chaosInjections : undefined
            },
            results: results.slice(0, 10),
            message: `Generated ${transactionsGenerated} transactions in ${((endTime - startTime) / 1000).toFixed(2)}s`
        });

    } catch (error) {
        await closeConnection();
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});