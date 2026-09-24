import { query, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { test_type, duration_seconds = 60, rps = 100, psp_code, merchant_id } = await req.json();
        
        if (!psp_code) {
            return Response.json({ error: 'psp_code is required' }, { status: 400 });
        }
        
        if (!merchant_id) {
            return Response.json({ error: 'merchant_id is required' }, { status: 400 });
        }

        if (test_type === 'run_load_test') {
            const run_id = `LOAD-${Date.now()}`;
            let success_count = 0;
            let error_count = 0;
            const latencies = [];

            await execute(
                `INSERT INTO load_test_run (run_id, psp_code, test_type, status, started_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [run_id, psp_code, 'ramp_up', 'running']
            );

            const start_time = Date.now();
            const end_time = start_time + (duration_seconds * 1000);
            let request_count = 0;

            while (Date.now() < end_time) {
                const txn_start = Date.now();

                try {
                    const txnId = `TXN-LOAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const amount = parseFloat((Math.random() * 500 + 10).toFixed(2));
                    
                    // Insert directly to PostgreSQL isolated schema
                    await execute(
                        `INSERT INTO "${psp_code}".transaction (transaction_id, merchant_id, psp_code, amount, currency, type, status, payment_method, card_last_four, created_date)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
                        [txnId, merchant_id, psp_code, amount, 'USD', 'sale', 'approved', 'visa', Math.floor(1000 + Math.random() * 9000).toString()]
                    );

                    success_count++;
                } catch (e) {
                    console.error('Transaction creation error:', e);
                    error_count++;
                }

                const latency = Date.now() - txn_start;
                latencies.push(latency);
                request_count++;

                // Rate limiting
                const elapsed = Date.now() - start_time;
                const expected_requests = (elapsed / 1000) * rps;
                if (request_count > expected_requests) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

            // Calculate statistics
            latencies.sort((a, b) => a - b);
            const p50 = latencies[Math.floor(latencies.length * 0.5)];
            const p95 = latencies[Math.floor(latencies.length * 0.95)];
            const p99 = latencies[Math.floor(latencies.length * 0.99)];
            const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

            await execute(
                `UPDATE load_test_run SET status = $1, completed_at = NOW(), 
                 success_count = $2, error_count = $3, total_requests = $4,
                 avg_latency = $5, p50_latency = $6, p95_latency = $7, p99_latency = $8
                 WHERE run_id = $9`,
                [
                    'completed',
                    success_count,
                    error_count,
                    request_count,
                    Math.round(avg),
                    p50,
                    p95,
                    p99,
                    run_id
                ]
            );

            await closeConnection();
            return Response.json({
                success: true,
                run_id,
                duration: duration_seconds,
                total_requests: request_count,
                successful: success_count,
                failed: error_count,
                success_rate: `${((success_count / request_count) * 100).toFixed(2)}%`,
                rps: `${(request_count / duration_seconds).toFixed(2)}`,
                latency: {
                    avg: `${Math.round(avg)}ms`,
                    p50: `${p50}ms`,
                    p95: `${p95}ms`,
                    p99: `${p99}ms`
                }
            });
        }

        if (test_type === 'spike_test') {
            const run_id = `SPIKE-${Date.now()}`;
            
            // Ramp up 0-100% over 30s, hold 30s, ramp down
            let spike_success = 0;
            const spike_start = Date.now();

            for (let i = 0; i < 100; i++) {
                try {
                    const txnId = `TXN-SPIKE-${Date.now()}-${i}`;
                    const amount = parseFloat((Math.random() * 500 + 10).toFixed(2));
                    
                    await execute(
                        `INSERT INTO "${psp_code}".transaction (transaction_id, merchant_id, psp_code, amount, currency, type, status, payment_method, card_last_four, created_date)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
                        [txnId, merchant_id, psp_code, amount, 'USD', 'sale', 'approved', 'mastercard', Math.floor(1000 + Math.random() * 9000).toString()]
                    );
                    spike_success++;
                } catch (e) {
                    console.error('Spike transaction error:', e);
                }
            }

            await closeConnection();
            return Response.json({
                success: true,
                run_id,
                spike_requests: spike_success,
                duration_ms: Date.now() - spike_start
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid test_type' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Load test error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});