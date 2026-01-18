import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Load Test Orchestrator
 * Generates merchant transactions at specified TPS rate
 */
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
            amount_range = { min: 10, max: 1000 }
        } = payload;

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

        for (let i = 0; i < batchSize; i++) {
            const amount = Math.floor(Math.random() * (amount_range.max - amount_range.min) + amount_range.min);
            const paymentMethod = payment_methods[Math.floor(Math.random() * payment_methods.length)];
            const transactionType = transaction_types[Math.floor(Math.random() * transaction_types.length)];
            
            // Randomly select merchant from the list
            const selectedMerchantId = merchant_ids[Math.floor(Math.random() * merchant_ids.length)];

            const transaction = {
                psp_code: psp_code,
                merchant_id: selectedMerchantId,
                type: transactionType,
                amount: amount,
                currency: 'USD',
                payment_method: paymentMethod,
                card_number: '4242424242424242',
                card_last_four: '4242',
                customer_email: `test${i}@loadtest.com`,
                customer_name: `Test Customer ${i}`,
                status: 'pending',
                metadata: {
                    load_test: true,
                    test_started: startTime
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
                success_rate: ((successful / transactionsGenerated) * 100).toFixed(2) + '%'
            },
            results: results.slice(0, 10), // Return first 10 for preview
            message: `Generated ${transactionsGenerated} transactions in ${((endTime - startTime) / 1000).toFixed(2)}s`
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});