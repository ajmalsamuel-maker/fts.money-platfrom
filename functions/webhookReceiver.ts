import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generic Webhook Receiver for Payment Processors
 * Routes webhooks from Stripe, Adyen, PayPal, etc.
 * Updates transaction status and creates settlements
 */
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature, X-Adyen-Signature'
                }
            });
        }

        const body = await req.text();
        const signature = req.headers.get('stripe-signature') || 
                         req.headers.get('x-adyen-signature') ||
                         req.headers.get('x-paypal-signature');

        const connector = identifyConnector(req.headers);

        console.log(`🪝 Webhook received from: ${connector}`);

        const base44 = createClientFromRequest(req);

        // Route to appropriate handler
        let result;
        switch (connector) {
            case 'stripe':
                result = await handleStripeWebhook(body, signature, base44);
                break;
            case 'adyen':
                result = await handleAdyenWebhook(body, signature, base44);
                break;
            case 'paypal':
                result = await handlePayPalWebhook(body, signature, base44);
                break;
            default:
                return Response.json({ received: false, error: 'Unknown connector' }, { status: 400 });
        }

        return Response.json(result);

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ received: false, error: error.message }, { status: 500 });
    }
});

function identifyConnector(headers) {
    if (headers.get('stripe-signature')) return 'stripe';
    if (headers.get('x-adyen-signature')) return 'adyen';
    if (headers.get('x-paypal-signature')) return 'paypal';
    return 'unknown';
}

/**
 * STRIPE WEBHOOK HANDLER
 */
async function handleStripeWebhook(body, signature, base44) {
    console.log('📱 Processing Stripe webhook');

    const event = JSON.parse(body);

    // TODO: Verify signature
    // const verified = verifyStripeSignature(body, signature, webhookSecret);

    if (event.type === 'charge.succeeded') {
        const charge = event.data.object;

        // Find transaction and update
        const transactions = await base44.asServiceRole.entities.Transaction.filter({
            connector_txn_no: charge.id
        });

        if (transactions && transactions.length > 0) {
            const txn = transactions[0];
            await base44.asServiceRole.entities.Transaction.update(txn.id, {
                status: 'approved',
                auth_code: charge.id,
                response_code: '00',
                response_message: 'Charge succeeded'
            });

            console.log(`✓ Stripe transaction updated: ${txn.transaction_id}`);
        }

        return { received: true, processed: true };
    }

    if (event.type === 'charge.failed') {
        const charge = event.data.object;

        const transactions = await base44.asServiceRole.entities.Transaction.filter({
            connector_txn_no: charge.id
        });

        if (transactions && transactions.length > 0) {
            const txn = transactions[0];
            await base44.asServiceRole.entities.Transaction.update(txn.id, {
                status: 'declined',
                response_message: charge.failure_message || 'Charge failed'
            });

            console.log(`❌ Stripe transaction failed: ${txn.transaction_id}`);
        }

        return { received: true, processed: true };
    }

    console.log(`⏭️ Stripe event type not handled: ${event.type}`);
    return { received: true, processed: false, event_type: event.type };
}

/**
 * ADYEN WEBHOOK HANDLER
 */
async function handleAdyenWebhook(body, signature, base44) {
    console.log('🔷 Processing Adyen webhook');

    const event = JSON.parse(body);

    // TODO: Verify signature

    if (event.eventType === 'AUTHORISATION') {
        const pspRef = event.pspReference;
        const success = event.success === 'true';

        const transactions = await base44.asServiceRole.entities.Transaction.filter({
            connector_response_code: pspRef
        });

        if (transactions && transactions.length > 0) {
            const txn = transactions[0];
            await base44.asServiceRole.entities.Transaction.update(txn.id, {
                status: success ? 'approved' : 'declined',
                response_code: success ? '00' : '05'
            });

            console.log(`✓ Adyen transaction ${success ? 'approved' : 'declined'}: ${pspRef}`);
        }

        return { received: true, processed: true };
    }

    console.log(`⏭️ Adyen event not handled: ${event.eventType}`);
    return { received: true, processed: false, event_type: event.eventType };
}

/**
 * PAYPAL WEBHOOK HANDLER
 */
async function handlePayPalWebhook(body, signature, base44) {
    console.log('🅿️ Processing PayPal webhook');

    const event = JSON.parse(body);

    // TODO: Verify signature

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const captureId = event.resource?.id;

        const transactions = await base44.asServiceRole.entities.Transaction.filter({
            connector_txn_no: captureId
        });

        if (transactions && transactions.length > 0) {
            const txn = transactions[0];
            await base44.asServiceRole.entities.Transaction.update(txn.id, {
                status: 'approved',
                response_message: 'Capture completed'
            });

            console.log(`✓ PayPal transaction completed: ${captureId}`);
        }

        return { received: true, processed: true };
    }

    console.log(`⏭️ PayPal event not handled: ${event.event_type}`);
    return { received: true, processed: false, event_type: event.event_type };
}