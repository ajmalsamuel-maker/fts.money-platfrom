import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
        const base44 = createClientFromRequest(req);
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
        const validationResult = await base44.functions.invoke('validateTransaction', {
            merchant_id,
            psp_code,
            amount,
            currency,
            payment_method,
            customer_email,
            customer_country
        });

        if (!validationResult.data.valid) {
            console.log('❌ Validation failed:', validationResult.data.errors);
            
            // Create failed transaction record
            await base44.asServiceRole.entities.Transaction.create({
                transaction_id: `FAILED-${Date.now()}`,
                merchant_id,
                psp_code,
                amount,
                currency,
                payment_method,
                status: 'failed',
                response_code: 'VALIDATION_FAILED',
                response_message: validationResult.data.errors[0],
                customer_email,
                customer_name,
                description
            });

            return Response.json({
                success: false,
                error: 'Transaction validation failed',
                errors: validationResult.data.errors,
                warnings: validationResult.data.warnings
            }, { status: 400 });
        }

        console.log('✓ Validation passed');

        // STEP 2: Get merchant details for later
        const merchants = await base44.asServiceRole.entities.Merchant.filter({
            id: merchant_id,
            psp_code: psp_code
        });
        const merchant = merchants?.[0];

        if (!merchant) {
            return Response.json({
                success: false,
                error: 'Merchant not found'
            }, { status: 404 });
        }

        // STEP 3: Calculate risk score (basic)
        console.log('🎲 Step 2: Calculating risk score...');
        let risk_score = 0;

        // Cross-border adds risk
        if (customer_country && merchant.country && customer_country !== merchant.country) {
            risk_score += 15;
        }

        // High risk merchant
        if (merchant.risk_level === 'high') {
            risk_score += 20;
        }

        // Card not verified
        if (!card_token) {
            risk_score += 10;
        }

        // Amount spike (simplified)
        if (amount > 5000) {
            risk_score += 10;
        }

        console.log(`Risk score: ${risk_score}/100`);

        // STEP 4: Route through orchestrator
        console.log('🎯 Step 3: Orchestrating connector selection...');
        const orchestrationResult = await base44.functions.invoke('paymentOrchestrator', {
            merchant_id,
            psp_code,
            amount,
            currency,
            payment_method
        });

        if (!orchestrationResult.data.success) {
            console.log('❌ Orchestration failed');
            return Response.json({
                success: false,
                error: orchestrationResult.data.error
            }, { status: 400 });
        }

        const selectedConnector = orchestrationResult.data.selected_connector;
        const connectorId = orchestrationResult.data.connector_id;

        console.log(`✓ Connector selected: ${selectedConnector}`);

        // STEP 5: Process payment via selected connector
        console.log(`🔌 Step 4: Processing via ${selectedConnector}...`);
        const processingResult = await base44.functions.invoke('connectorAdapter', {
            connector_name: selectedConnector,
            action: 'charge',
            amount,
            currency,
            payment_method,
            card_token,
            customer_email,
            customer_name,
            description
        });

        const connectorResponse = processingResult.data;

        console.log(`Connector response:`, connectorResponse);

        // STEP 6: Create transaction record
        console.log('💾 Step 5: Recording transaction...');
        
        const transactionData = {
            transaction_id: connectorResponse.transaction_id || `TXN-${Date.now()}`,
            merchant_id,
            merchant_name: merchant.business_name,
            psp_code,
            type: 'sale',
            status: connectorResponse.success ? 'approved' : 'declined',
            amount,
            currency,
            payment_method,
            customer_email,
            customer_name,
            customer_country,
            description,
            order_id,
            risk_score,
            auth_code: connectorResponse.reference_id,
            response_code: connectorResponse.processor_response?.code || connectorResponse.processor_response?.resultCode || 'UNKNOWN',
            response_message: connectorResponse.processor_response?.message || connectorResponse.processor_response?.status || 'No message',
            connector_response_code: connectorResponse.psp_reference || connectorResponse.status,
            connector_txn_no: connectorResponse.reference_id,
            metadata: {
                ...metadata,
                connector_used: selectedConnector,
                connector_mode: orchestrationResult.data.mode,
                fallback_available: orchestrationResult.data.fallback_connectors?.length > 0
            }
        };

        const transaction = await base44.asServiceRole.entities.Transaction.create(transactionData);

        console.log(`✓ Transaction recorded: ${transaction.id}`);

        // STEP 7: Return result
        if (connectorResponse.success) {
            console.log(`✅ Payment successful: ${transaction.transaction_id}`);

            return Response.json({
                success: true,
                transaction_id: transaction.transaction_id,
                reference_id: connectorResponse.reference_id,
                status: 'approved',
                amount,
                currency,
                connector: selectedConnector,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log(`❌ Payment declined by ${selectedConnector}`);

            return Response.json({
                success: false,
                transaction_id: transaction.transaction_id,
                status: 'declined',
                error: connectorResponse.processor_response?.message || 'Payment declined',
                amount,
                currency,
                connector: selectedConnector,
                timestamp: new Date().toISOString()
            }, { status: 402 }); // 402 Payment Required
        }

    } catch (error) {
        console.error('❌ Payment processing error:', error);
        return Response.json({
            success: false,
            error: error.message,
            type: 'system_error'
        }, { status: 500 });
    }
});