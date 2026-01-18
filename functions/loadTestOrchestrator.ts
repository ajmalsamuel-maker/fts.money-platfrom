import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Enhanced Load Test Orchestrator
 * Generates realistic payment scenarios with industry-standard test cases
 * Supports: successful payments, declines, fraud, timeouts, 3DS, and more
 */

// Test scenario configurations based on ISO 8583 response codes
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

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
            chaos_latency_ms = 500,
            chaos_outage_duration = 10,
            test_data_set_id = null
        } = payload;

        // Load test dataset if specified
        let testDataRecords = null;
        if (test_data_set_id) {
            const dataset = await base44.entities.TestDataSet.get(test_data_set_id);
            if (dataset) {
                testDataRecords = dataset.data;
                // Update usage count
                await base44.entities.TestDataSet.update(test_data_set_id, {
                    usage_count: (dataset.usage_count || 0) + 1,
                    last_used: new Date().toISOString()
                });
            }
        }

        if (!merchant_ids || merchant_ids.length === 0) {
            return Response.json({ error: 'At least one merchant required' }, { status: 400 });
        }

        // Calculate transactions to generate
        const totalTransactions = target_tps * duration_seconds;
        const intervalMs = 1000 / target_tps;

        // Start generating transactions
        const startTime = Date.now();
        let transactionsGenerated = 0;
        let successful = 0;
        let failed = 0;

        // Generate batch (we'll do first batch synchronously, rest async)
        const batchSize = Math.min(target_tps, 50); // Process in batches
        const results = [];

        // Determine scenario distribution
        const getScenario = () => {
            const rand = Math.random() * 100;
            let cumulative = 0;
            for (const [scenario, percentage] of Object.entries(scenario_distribution)) {
                cumulative += percentage;
                if (rand <= cumulative) return scenario;
            }
            return test_scenarios[0]; // fallback
        };

        const scenarioResults = {};
        const chaosInjections = { latency_injected: 0, outages_simulated: 0, errors_forced: 0 };

        // Chaos engineering: simulate service outage
        const shouldInjectOutage = chaos_scenarios.includes('service_outage') && 
            Math.random() * 100 < chaos_intensity;
        if (shouldInjectOutage) {
            console.log(`[CHAOS] Simulating service outage for ${chaos_outage_duration}s`);
            await new Promise(resolve => setTimeout(resolve, chaos_outage_duration * 1000));
            chaosInjections.outages_simulated++;
        }

        for (let i = 0; i < batchSize; i++) {
            const amount = Math.floor(Math.random() * (amount_range.max - amount_range.min) + amount_range.min);
            const paymentMethod = payment_methods[Math.floor(Math.random() * payment_methods.length)];
            const transactionType = transaction_types[Math.floor(Math.random() * transaction_types.length)];
            
            // Randomly select merchant from the list
            const selectedMerchantId = merchant_ids[Math.floor(Math.random() * merchant_ids.length)];
            
            // Select scenario based on distribution
            let scenario = getScenario();
            
            // Chaos engineering: force increased errors
            if (chaos_scenarios.includes('increased_errors') && Math.random() * 100 < chaos_intensity) {
                scenario = 'network_error';
                chaosInjections.errors_forced++;
            }
            
            const scenarioConfig = SCENARIO_CONFIGS[scenario] || SCENARIO_CONFIGS.successful_payment;
            
            // Track scenario usage
            scenarioResults[scenario] = (scenarioResults[scenario] || 0) + 1;
            
            // Use test data if available
            let cardData = {
                card_number: '4242424242424242',
                card_last_four: '4242',
                customer_email: `test${i}@loadtest.com`,
                customer_name: `Test Customer ${i}`
            };
            
            if (testDataRecords && testDataRecords.length > 0) {
                const record = testDataRecords[i % testDataRecords.length];
                if (record.card_number) {
                    cardData = {
                        card_number: record.card_number,
                        card_last_four: record.card_number.slice(-4),
                        customer_email: record.email || cardData.customer_email,
                        customer_name: record.cardholder_name || record.name || cardData.customer_name
                    };
                }
            }

            const transaction = {
                psp_code: psp_code,
                merchant_id: selectedMerchantId,
                type: transactionType,
                amount: amount,
                currency: 'USD',
                payment_method: paymentMethod,
                card_number: cardData.card_number,
                card_last_four: cardData.card_last_four,
                customer_email: cardData.customer_email,
                customer_name: cardData.customer_name,
                status: scenarioConfig.status,
                response_code: scenarioConfig.response_code,
                risk_score: scenarioConfig.risk_score,
                metadata: {
                    load_test: true,
                    test_started: startTime,
                    scenario: scenario,
                    scenario_type: scenario
                }
            };

            try {
                const created = await base44.entities.Transaction.create(transaction);
                transactionsGenerated++;
                successful++;
                results.push({ id: created.id, status: 'created' });
            } catch (error) {
                failed++;
                results.push({ error: error.message, status: 'failed' });
            }
        }

        const endTime = Date.now();
        const actualTPS = (transactionsGenerated / ((endTime - startTime) / 1000)).toFixed(2);

        return Response.json({
            success: true,
            summary: {
                target_tps: target_tps,
                actual_tps: actualTPS,
                duration_ms: endTime - startTime,
                transactions_generated: transactionsGenerated,
                successful: successful,
                failed: failed,
                success_rate: ((successful / transactionsGenerated) * 100).toFixed(2) + '%',
                scenario_breakdown: scenarioResults,
                chaos_injections: chaos_scenarios.length > 0 ? chaosInjections : undefined
            },
            results: results.slice(0, 10), // Return first 10 for preview
            message: `Generated ${transactionsGenerated} transactions across ${Object.keys(scenarioResults).length} scenarios${chaos_scenarios.length > 0 ? ' with chaos engineering' : ''} in ${((endTime - startTime) / 1000).toFixed(2)}s`
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});