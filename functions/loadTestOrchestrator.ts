import { query, execute, closeConnection } from './db/postgresClient.js';

/**
 * Load Test Orchestrator
 * Coordinates load testing across merchants with transaction test suite integration
 */
Deno.serve(async (req) => {
    try {
        const {
            merchant_ids = [],
            psp_code,
            target_tps = 10,
            duration_seconds = 60,
            test_scenarios = ['successful_payment'],
            scenario_distribution = {},
            chaos_scenarios = [],
            chaos_intensity = 0,
            payment_methods = ['visa', 'mastercard'],
            amount_range = { min: 10, max: 1000 }
        } = await req.json();

        const run_id = `LOAD-${Date.now()}`;
        const start_time = Date.now();
        const end_time = start_time + (duration_seconds * 1000);

        // Create test run record
        await execute(
            `INSERT INTO load_test_run (run_id, psp_code, test_type, status, started_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [run_id, psp_code, 'load_test', 'running']
        );

        let successful = 0;
        let failed = 0;
        let total_generated = 0;
        const latencies = [];
        const scenario_breakdown = {};

        // Initialize scenario breakdown
        test_scenarios.forEach(s => scenario_breakdown[s] = 0);

        // Generate load for the specified duration
        while (Date.now() < end_time) {
            for (let i = 0; i < merchant_ids.length && Date.now() < end_time; i++) {
                const merchant_id = merchant_ids[i];
                
                // Select scenario based on distribution
                const scenario = selectScenario(test_scenarios, scenario_distribution);
                scenario_breakdown[scenario] = (scenario_breakdown[scenario] || 0) + 1;

                const txn_start = Date.now();

                try {
                    // Execute transaction based on scenario
                    const result = await executeTransaction(
                        scenario,
                        psp_code,
                        merchant_id,
                        payment_methods,
                        amount_range
                    );

                    if (result.success) {
                        successful++;
                    } else {
                        failed++;
                    }

                    total_generated++;
                } catch (e) {
                    failed++;
                    total_generated++;
                    console.error(`Transaction failed:`, e);
                }

                const latency = Date.now() - txn_start;
                latencies.push(latency);

                // Rate limiting to achieve target TPS
                const elapsed_ms = Date.now() - start_time;
                const target_requests = (elapsed_ms / 1000) * target_tps * merchant_ids.length;
                if (total_generated > target_requests) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
        }

        // Calculate metrics
        const duration_ms = Date.now() - start_time;
        const actual_tps = (total_generated / (duration_ms / 1000)).toFixed(2);
        const success_rate = ((successful / total_generated) * 100).toFixed(2);

        latencies.sort((a, b) => a - b);
        const p50 = latencies[Math.floor(latencies.length * 0.5)];
        const p95 = latencies[Math.floor(latencies.length * 0.95)];
        const p99 = latencies[Math.floor(latencies.length * 0.99)];
        const avg_latency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

        // Update test run with results
        await execute(
            `UPDATE load_test_run 
             SET status = $1, completed_at = NOW(), 
                 successful = $2, failed = $3, total_requests = $4,
                 avg_latency = $5, p50_latency = $6, p95_latency = $7, p99_latency = $8,
                 actual_tps = $9, success_rate = $10, scenario_breakdown = $11
             WHERE run_id = $12`,
            [
                'completed',
                successful,
                failed,
                total_generated,
                avg_latency,
                p50,
                p95,
                p99,
                parseFloat(actual_tps),
                parseFloat(success_rate),
                JSON.stringify(scenario_breakdown),
                run_id
            ]
        );

        await closeConnection();

        return Response.json({
            success: true,
            message: `Load test completed: ${successful} successful, ${failed} failed`,
            run_id,
            summary: {
                target_tps,
                actual_tps: parseFloat(actual_tps),
                successful,
                failed,
                transactions_generated: total_generated,
                success_rate: `${success_rate}%`,
                duration_ms,
                scenario_breakdown,
                latency: {
                    avg: avg_latency,
                    p50,
                    p95,
                    p99
                }
            }
        });

    } catch (error) {
        await closeConnection();
        console.error('Load test orchestrator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function selectScenario(scenarios, distribution) {
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const scenario of scenarios) {
        cumulative += distribution[scenario] || 0;
        if (rand <= cumulative) {
            return scenario;
        }
    }

    return scenarios[0];
}

async function executeTransaction(scenario, psp_code, merchant_id, payment_methods, amount_range) {
    const txn_id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const amount = Math.random() * (amount_range.max - amount_range.min) + amount_range.min;
    const payment_method = payment_methods[Math.floor(Math.random() * payment_methods.length)];

    try {
        switch (scenario) {
            case 'successful_payment':
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                    [txn_id, merchant_id, psp_code, amount, 'sale', 'approved', payment_method]
                );
                return { success: true };

            case 'declined_card':
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, response_code, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [txn_id, merchant_id, psp_code, amount, 'sale', 'declined', '05', payment_method]
                );
                return { success: true };

            case 'insufficient_funds':
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, response_code, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [txn_id, merchant_id, psp_code, 9999, 'sale', 'declined', '51', payment_method]
                );
                return { success: true };

            case 'fraud_detected':
                const risk_score = 85;
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, risk_score, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [txn_id, merchant_id, psp_code, amount, 'sale', 'pending', risk_score, payment_method]
                );
                return { success: true };

            case '3ds_required':
                const challenge_id = `3DS-${Date.now()}`;
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                    [txn_id, merchant_id, psp_code, amount, 'sale', 'pending', payment_method]
                );
                await execute(
                    `INSERT INTO three_ds_challenge (challenge_id, transaction_id, psp_code, status, created_date)
                     VALUES ($1, $2, $3, $4, NOW())`,
                    [challenge_id, txn_id, psp_code, 'initiated']
                );
                return { success: true };

            case 'timeout':
                // Simulate timeout delay
                await new Promise(resolve => setTimeout(resolve, 5000));
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, response_code, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [txn_id, merchant_id, psp_code, amount, 'sale', 'error', '99', payment_method]
                );
                return { success: false };

            case 'network_error':
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, response_message, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [txn_id, merchant_id, psp_code, amount, 'sale', 'error', 'Network connection failed', payment_method]
                );
                return { success: false };

            case 'duplicate':
                // Insert same transaction twice
                await execute(
                    `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, payment_method, created_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                    [txn_id, merchant_id, psp_code, amount, 'sale', 'approved', payment_method]
                );
                return { success: true };

            default:
                return { success: false };
        }
    } catch (error) {
        console.error(`Error executing transaction ${scenario}:`, error);
        return { success: false };
    }
}