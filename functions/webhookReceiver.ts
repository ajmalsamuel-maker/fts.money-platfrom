import { queryOne, execute, closeConnection } from './db/postgresClient.js';

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
        const connector = identifyConnector(req.headers);

        console.log(`🪝 Webhook received from: ${connector}`);

        // Route to appropriate handler
        let result;
        switch (connector) {
            case 'stripe':
                result = await handleStripeWebhook(body);
                break;
            case 'adyen':
                result = await handleAdyenWebhook(body);
                break;
            case 'paypal':
                result = await handlePayPalWebhook(body);
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
async function handleStripeWebhook(body) {
    console.log('📱 Processing Stripe webhook');

    const event = JSON.parse(body);

    if (event.type === 'charge.succeeded') {
        const charge = event.data.object;

        const txn = await queryOne(
            `SELECT * FROM transaction WHERE connector_txn_no = $1`,
            [charge.id]
        );

        if (txn) {
            await execute(
                `UPDATE transaction SET status = 'approved', auth_code = $1, response_code = '00', response_message = 'Charge succeeded' WHERE id = $2`,
                [charge.id, txn.id]
            );
            console.log(`✓ Stripe transaction updated: ${txn.transaction_id}`);
        }

        await closeConnection();
        return { received: true, processed: true };
    }

    if (event.type === 'charge.failed') {
        const charge = event.data.object;

        const txn = await queryOne(
            `SELECT * FROM transaction WHERE connector_txn_no = $1`,
            [charge.id]
        );

        if (txn) {
            await execute(
                `UPDATE transaction SET status = 'declined', response_message = $1 WHERE id = $2`,
                [charge.failure_message || 'Charge failed', txn.id]
            );
            console.log(`❌ Stripe transaction failed: ${txn.transaction_id}`);
        }

        await closeConnection();
        return { received: true, processed: true };
    }

    await closeConnection();
    console.log(`⏭️ Stripe event type not handled: ${event.type}`);
    return { received: true, processed: false, event_type: event.type };
}

/**
 * ADYEN WEBHOOK HANDLER
 */
async function handleAdyenWebhook(body) {
    console.log('🔷 Processing Adyen webhook');

    const event = JSON.parse(body);

    if (event.eventType === 'AUTHORISATION') {
        const pspRef = event.pspReference;
        const success = event.success === 'true';

        const txn = await queryOne(
            `SELECT * FROM transaction WHERE connector_response_code = $1`,
            [pspRef]
        );

        if (txn) {
            await execute(
                `UPDATE transaction SET status = $1, response_code = $2 WHERE id = $3`,
                [success ? 'approved' : 'declined', success ? '00' : '05', txn.id]
            );
            console.log(`✓ Adyen transaction ${success ? 'approved' : 'declined'}: ${pspRef}`);
        }

        await closeConnection();
        return { received: true, processed: true };
    }

    await closeConnection();
    console.log(`⏭️ Adyen event not handled: ${event.eventType}`);
    return { received: true, processed: false, event_type: event.eventType };
}

/**
 * PAYPAL WEBHOOK HANDLER
 */
async function handlePayPalWebhook(body) {
    console.log('🅿️ Processing PayPal webhook');

    const event = JSON.parse(body);

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const captureId = event.resource?.id;

        const txn = await queryOne(
            `SELECT * FROM transaction WHERE connector_txn_no = $1`,
            [captureId]
        );

        if (txn) {
            await execute(
                `UPDATE transaction SET status = 'approved', response_message = 'Capture completed' WHERE id = $1`,
                [txn.id]
            );
            console.log(`✓ PayPal transaction completed: ${captureId}`);
        }

        await closeConnection();
        return { received: true, processed: true };
    }

    await closeConnection();
    console.log(`⏭️ PayPal event not handled: ${event.event_type}`);
    return { received: true, processed: false, event_type: event.event_type };
}