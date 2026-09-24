import { queryOne, execute, closeConnection } from './db/postgresClient.js';

/**
 * Main Payment Processing Function
 * Coordinates entire payment flow:
 * 1. Validate transaction
 * 2. Check risk score
 * 3. Route through orchestrator
 * 4. Process via selected connector
 * 5. Store transaction record
 * 6. Return result
 */
Deno.serve(async (req) => {
    try {
        const body = await req.json();

        const {
            merchant_id,
            psp_code,
            amount,
            currency,
            payment_method,
            card_token,
            customer_email,
            customer_name,
            customer_country,
            description,
            order_id,
            metadata
        } = body;

        console.log(`💳 processPayment: Starting for merchant ${merchant_id}`);

        // STEP 1: Validate transaction
        console.log('📋 Step 1: Validating transaction...');
        const validationResult = await fetch(`${Deno.env.get('BASE44_FUNCTION_URL')}/validateTransaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchant_id,
                psp_code,
                amount,
                currency,
                payment_method,
                customer_email,
                customer_country
            })
        }).then(r => r.json());

        if (!validationResult.valid) {
            console.log('❌ Validation failed:', validationResult.errors);
            
            // Create failed transaction record
            await execute(
                `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, currency, payment_method, status, response_code, response_message, customer_email, customer_name, description, type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [`FAILED-${Date.now()}`, merchant_id, psp_code, amount, currency, payment_method, 'failed', 'VALIDATION_FAILED', validationResult.errors[0], customer_email, customer_name, description, 'sale']
            );

            return Response.json({
                success: false,
                error: 'Transaction validation failed',
                errors: validationResult.errors,
                warnings: validationResult.warnings
            }, { status: 400 });
        }

        console.log('✓ Validation passed');

        // STEP 2: Get merchant details
        const merchant = await queryOne(
            `SELECT * FROM merchant WHERE id = $1 AND psp_code = $2`,
            [merchant_id, psp_code]
        );

        if (!merchant) {
            await closeConnection();
            return Response.json({
                success: false,
                error: 'Merchant not found'
            }, { status: 404 });
        }

        // STEP 3: Calculate risk score
        console.log('🎲 Step 2: Calculating risk score...');
        let risk_score = 0;

        if (customer_country && merchant.country && customer_country !== merchant.country) {
            risk_score += 15;
        }

        if (merchant.risk_level === 'high') {
            risk_score += 20;
        }

        if (!card_token) {
            risk_score += 10;
        }

        if (amount > 5000) {
            risk_score += 10;
        }

        console.log(`Risk score: ${risk_score}/100`);

        // STEP 4: Route through orchestrator
        console.log('🎯 Step 3: Orchestrating connector selection...');
        const orchestrationResult = await fetch(`${Deno.env.get('BASE44_FUNCTION_URL')}/paymentOrchestrator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchant_id,
                psp_code,
                amount,
                currency,
                payment_method
            })
        }).then(r => r.json());

        if (!orchestrationResult.success) {
            console.log('❌ Orchestration failed');
            await closeConnection();
            return Response.json({
                success: false,
                error: orchestrationResult.error
            }, { status: 400 });
        }

        const selectedConnector = orchestrationResult.selected_connector;
        console.log(`✓ Connector selected: ${selectedConnector}`);

        // STEP 5: Process payment via selected connector
        console.log(`🔌 Step 4: Processing via ${selectedConnector}...`);
        const processingResult = await fetch(`${Deno.env.get('BASE44_FUNCTION_URL')}/connectorAdapter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                connector_name: selectedConnector,
                action: 'charge',
                amount,
                currency,
                payment_method,
                card_token,
                customer_email,
                customer_name,
                description
            })
        }).then(r => r.json());

        console.log(`Connector response:`, processingResult);

        // STEP 6: Create transaction record
        console.log('💾 Step 5: Recording transaction...');
        
        const txnId = processingResult.transaction_id || `TXN-${Date.now()}`;
        const metadataJson = JSON.stringify({
            ...metadata,
            connector_used: selectedConnector,
            connector_mode: orchestrationResult.mode,
            fallback_available: orchestrationResult.fallback_connectors?.length > 0
        });

        await execute(
            `INSERT INTO transaction (transaction_id, merchant_id, merchant_name, psp_code, type, status, amount, currency, payment_method, customer_email, customer_name, customer_country, description, order_id, risk_score, auth_code, response_code, response_message, connector_response_code, connector_txn_no, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
            [
                txnId,
                merchant_id,
                merchant.business_name,
                psp_code,
                'sale',
                processingResult.success ? 'approved' : 'declined',
                amount,
                currency,
                payment_method,
                customer_email,
                customer_name,
                customer_country,
                description,
                order_id,
                risk_score,
                processingResult.reference_id,
                processingResult.processor_response?.code || processingResult.processor_response?.resultCode || 'UNKNOWN',
                processingResult.processor_response?.message || processingResult.processor_response?.status || 'No message',
                processingResult.psp_reference || processingResult.status,
                processingResult.reference_id,
                metadataJson
            ]
        );

        console.log(`✓ Transaction recorded: ${txnId}`);

        // STEP 7: Return result
        if (processingResult.success) {
            console.log(`✅ Payment successful: ${txnId}`);
            await closeConnection();

            return Response.json({
                success: true,
                transaction_id: txnId,
                reference_id: processingResult.reference_id,
                status: 'approved',
                amount,
                currency,
                connector: selectedConnector,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log(`❌ Payment declined by ${selectedConnector}`);
            await closeConnection();

            return Response.json({
                success: false,
                transaction_id: txnId,
                status: 'declined',
                error: processingResult.processor_response?.message || 'Payment declined',
                amount,
                currency,
                connector: selectedConnector,
                timestamp: new Date().toISOString()
            }, { status: 402 });
        }

    } catch (error) {
        await closeConnection();
        console.error('❌ Payment processing error:', error);
        return Response.json({
            success: false,
            error: error.message,
            type: 'system_error'
        }, { status: 500 });
    }
});