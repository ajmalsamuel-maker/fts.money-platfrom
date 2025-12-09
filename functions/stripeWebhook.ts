import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey || !webhookSecret) {
        return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    try {
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();
        
        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        
        // Process event
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(base44, event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(base44, event.data.object);
                break;
            case 'charge.dispute.created':
                await handleDisputeCreated(base44, event.data.object);
                break;
            case 'charge.refunded':
                await handleRefund(base44, event.data.object);
                break;
        }
        
        return Response.json({ received: true });
        
    } catch (error) {
        console.error('Stripe webhook error:', error);
        return Response.json({ error: error.message }, { status: 400 });
    }
});

async function handlePaymentSuccess(base44, paymentIntent) {
    const metadata = paymentIntent.metadata || {};
    
    await base44.asServiceRole.entities.Transaction.create({
        transaction_id: paymentIntent.id,
        merchant_id: metadata.merchant_id,
        merchant_name: metadata.merchant_name,
        type: 'sale',
        status: 'approved',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        payment_method: 'card',
        card_last_four: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4,
        card_brand: paymentIntent.charges?.data[0]?.payment_method_details?.card?.brand,
        customer_email: paymentIntent.receipt_email,
        description: paymentIntent.description,
        auth_code: paymentIntent.charges?.data[0]?.id
    });
}

async function handlePaymentFailure(base44, paymentIntent) {
    const metadata = paymentIntent.metadata || {};
    
    await base44.asServiceRole.entities.Transaction.create({
        transaction_id: paymentIntent.id,
        merchant_id: metadata.merchant_id,
        merchant_name: metadata.merchant_name,
        type: 'sale',
        status: 'declined',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        response_message: paymentIntent.last_payment_error?.message
    });
}

async function handleDisputeCreated(base44, dispute) {
    const charge = dispute.charge;
    
    await base44.asServiceRole.entities.Dispute.create({
        dispute_id: dispute.id,
        transaction_id: charge,
        amount: dispute.amount / 100,
        currency: dispute.currency.toUpperCase(),
        reason_code: dispute.reason,
        reason_category: 'consumer_dispute',
        status: 'open',
        dispute_date: new Date(dispute.created * 1000).toISOString()
    });
}

async function handleRefund(base44, charge) {
    await base44.asServiceRole.entities.Transaction.create({
        transaction_id: charge.id + '_refund',
        type: 'refund',
        status: 'approved',
        amount: charge.amount_refunded / 100,
        currency: charge.currency.toUpperCase()
    });
}