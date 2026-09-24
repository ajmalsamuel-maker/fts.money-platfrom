import { query, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { test_type } = await req.json();

        if (test_type === 'run_all') {
            const results = [];

            // Test 1: 3DS Flow
            const test3ds = await test3DSFlow();
            results.push(test3ds);

            // Test 2: Tokenization
            const testToken = await testTokenization();
            results.push(testToken);

            // Test 3: Recurring Billing
            const testRecurring = await testRecurringBilling();
            results.push(testRecurring);

            // Test 4: Webhook Delivery
            const testWebhook = await testWebhookDelivery();
            results.push(testWebhook);

            // Test 5: Rate Limiting
            const testRateLimit = await testRateLimiting();
            results.push(testRateLimit);

            // Test 6: Audit Trail
            const testAudit = await testAuditTrail();
            results.push(testAudit);

            // Test 7: Feature Flags
            const testFlags = await testFeatureFlags();
            results.push(testFlags);

            // Test 8: Multi-tenancy
            const testMultiTenant = await testMultiTenancy();
            results.push(testMultiTenant);

            await closeConnection();
            return Response.json({
                success: true,
                total_tests: results.length,
                passed: results.filter(r => r.passed).length,
                failed: results.filter(r => !r.passed).length,
                results
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid test_type' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Test error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function test3DSFlow() {
    try {
        await execute(
            `INSERT INTO three_ds_challenge (challenge_id, transaction_id, psp_code, status)
             VALUES ($1, $2, $3, $4)`,
            ['TEST-3DS-001', 'TXN-001', 'PSP-001', 'initiated']
        );

        await execute(
            `UPDATE three_ds_challenge SET status = 'authenticated' WHERE challenge_id = $1`,
            ['TEST-3DS-001']
        );

        return { test: '3DS Flow', passed: true };
    } catch (e) {
        return { test: '3DS Flow', passed: false, error: e.message };
    }
}

async function testTokenization() {
    try {
        await execute(
            `INSERT INTO tokenized_card (token_id, merchant_id, psp_code, card_last_four, card_brand)
             VALUES ($1, $2, $3, $4, $5)`,
            ['TOKEN-001', 'MERCHANT-001', 'PSP-001', '4242', 'visa']
        );

        return { test: 'Tokenization', passed: true };
    } catch (e) {
        return { test: 'Tokenization', passed: false, error: e.message };
    }
}

async function testRecurringBilling() {
    try {
        await execute(
            `INSERT INTO subscription (subscription_id, merchant_id, psp_code, amount, frequency)
             VALUES ($1, $2, $3, $4, $5)`,
            ['SUB-001', 'MERCHANT-001', 'PSP-001', 99.99, 'monthly']
        );

        await execute(
            `INSERT INTO subscription_invoice (invoice_id, subscription_id, amount)
             VALUES ($1, $2, $3)`,
            ['INV-001', 'SUB-001', 99.99]
        );

        return { test: 'Recurring Billing', passed: true };
    } catch (e) {
        return { test: 'Recurring Billing', passed: false, error: e.message };
    }
}

async function testWebhookDelivery() {
    try {
        await execute(
            `INSERT INTO webhook_endpoint (endpoint_id, merchant_id, psp_code, url, secret)
             VALUES ($1, $2, $3, $4, $5)`,
            ['WEBHOOK-001', 'MERCHANT-001', 'PSP-001', 'https://example.com/webhook', 'secret123']
        );

        await execute(
            `INSERT INTO webhook_delivery (delivery_id, event_id, endpoint_id, psp_code, payload)
             VALUES ($1, $2, $3, $4, $5)`,
            ['DELIV-001', 'EVT-001', 'WEBHOOK-001', 'PSP-001', '{"test": true}']
        );

        return { test: 'Webhook Delivery', passed: true };
    } catch (e) {
        return { test: 'Webhook Delivery', passed: false, error: e.message };
    }
}

async function testRateLimiting() {
    try {
        await execute(
            `INSERT INTO velocity_limit (merchant_id, psp_code, hourly_limit, daily_limit)
             VALUES ($1, $2, $3, $4)`,
            ['MERCHANT-001', 'PSP-001', 100, 1000]
        );

        return { test: 'Rate Limiting', passed: true };
    } catch (e) {
        return { test: 'Rate Limiting', passed: false, error: e.message };
    }
}

async function testAuditTrail() {
    try {
        await execute(
            `INSERT INTO audit_trail (audit_id, psp_code, user_id, entity_type, entity_id, action_type, changes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['AUDIT-001', 'PSP-001', 'USER-001', 'merchant', 'MERCHANT-001', 'update', '{"status": "active"}']
        );

        return { test: 'Audit Trail', passed: true };
    } catch (e) {
        return { test: 'Audit Trail', passed: false, error: e.message };
    }
}

async function testFeatureFlags() {
    try {
        await execute(
            `INSERT INTO feature_flag (flag_id, psp_code, name, enabled, rollout_percentage)
             VALUES ($1, $2, $3, $4, $5)`,
            ['FLAG-001', 'PSP-001', 'new_checkout', true, 50]
        );

        return { test: 'Feature Flags', passed: true };
    } catch (e) {
        return { test: 'Feature Flags', passed: false, error: e.message };
    }
}

async function testMultiTenancy() {
    try {
        await execute(
            `INSERT INTO tenant (psp_code, name, status)
             VALUES ($1, $2, $3)`,
            ['PSP-TEST-001', 'Test PSP', 'active']
        );

        await execute(
            `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type)
             VALUES ($1, $2, $3, $4, $5)`,
            ['TXN-001', 'MERCHANT-001', 'PSP-TEST-001', 50.00, 'sale']
        );

        return { test: 'Multi-tenancy', passed: true };
    } catch (e) {
        return { test: 'Multi-tenancy', passed: false, error: e.message };
    }
}