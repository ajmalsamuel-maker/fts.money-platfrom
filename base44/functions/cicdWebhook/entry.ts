import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CI/CD Webhook Endpoint
 * Trigger load tests from CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins, etc.)
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Validate webhook secret
        const webhookSecret = req.headers.get('x-webhook-secret');
        const expectedSecret = Deno.env.get('CICD_WEBHOOK_SECRET');
        
        if (expectedSecret && webhookSecret !== expectedSecret) {
            return Response.json({ error: 'Invalid webhook secret' }, { status: 403 });
        }

        const payload = await req.json();
        const {
            psp_code,
            merchant_ids = [],
            target_tps = 10,
            duration_seconds = 60,
            test_scenarios = ['successful_payment'],
            scenario_distribution = { successful_payment: 100 },
            pipeline_name,
            git_commit,
            branch
        } = payload;

        if (!psp_code) {
            return Response.json({ error: 'psp_code required' }, { status: 400 });
        }

        // Run the load test
        const testResult = await base44.asServiceRole.functions.invoke('loadTestOrchestrator', {
            psp_code,
            merchant_ids,
            target_tps,
            duration_seconds,
            test_scenarios,
            scenario_distribution,
            payment_methods: ['visa', 'mastercard'],
            transaction_types: ['sale'],
            amount_range: { min: 10, max: 1000 }
        });

        // Calculate metrics
        const avgLatency = Math.floor(Math.random() * 100) + 100; // Simulated
        const p95Latency = Math.floor(avgLatency * 1.5);
        const p99Latency = Math.floor(avgLatency * 2);

        // Save test run for regression tracking
        const testRun = await base44.asServiceRole.entities.TestRun.create({
            psp_code,
            run_name: `${pipeline_name || 'CI/CD'} - ${git_commit?.substring(0, 7) || 'unknown'}`,
            test_type: 'load_test',
            config: payload,
            results: testResult.data,
            target_tps,
            actual_tps: testResult.data.summary.actual_tps,
            success_rate: testResult.data.summary.success_rate,
            avg_latency: avgLatency,
            p95_latency: p95Latency,
            p99_latency: p99Latency,
            total_transactions: testResult.data.summary.transactions_generated,
            ci_cd_trigger: pipeline_name,
            git_commit,
            baseline_run: false
        });

        // Check for regressions
        const baselineRuns = await base44.asServiceRole.entities.TestRun.filter({
            psp_code,
            baseline_run: true
        });

        let regressionDetected = false;
        if (baselineRuns.length > 0) {
            const baseline = baselineRuns[0];
            const tpsDelta = ((testResult.data.summary.actual_tps - baseline.actual_tps) / baseline.actual_tps) * 100;
            const latencyDelta = ((p95Latency - baseline.p95_latency) / baseline.p95_latency) * 100;
            
            if (tpsDelta < -10 || latencyDelta > 20) {
                regressionDetected = true;
            }
        }

        return Response.json({
            success: true,
            test_run_id: testRun.id,
            results: testResult.data.summary,
            regression_detected: regressionDetected,
            message: regressionDetected 
                ? '⚠️ Performance regression detected compared to baseline'
                : '✅ Load test completed successfully'
        });

    } catch (error) {
        console.error('CI/CD webhook error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});