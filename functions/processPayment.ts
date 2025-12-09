import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            merchant_id,
            amount,
            currency = 'USD',
            payment_method,
            customer_email,
            description,
            metadata = {}
        } = await req.json();

        if (!merchant_id || !amount || !payment_method) {
            return Response.json({ 
                error: 'Missing required fields: merchant_id, amount, payment_method' 
            }, { status: 400 });
        }

        // Get merchant details
        const merchants = await base44.entities.Merchant.filter({ id: merchant_id });
        if (!merchants || merchants.length === 0) {
            return Response.json({ error: 'Merchant not found' }, { status: 404 });
        }
        const merchant = merchants[0];

        // Determine routing via routing engine
        const routingResult = await base44.functions.invoke('routingEngine', {
            merchant_id: merchant_id,
            amount: amount,
            currency: currency,
            card_type: metadata.card_type || 'visa',
            country: merchant.country
        });

        // For now, use Stripe as primary processor
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            return Response.json({ error: 'Payment processor not configured' }, { status: 500 });
        }

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            payment_method: payment_method,
            confirm: true,
            receipt_email: customer_email,
            description: description,
            metadata: {
                merchant_id: merchant_id,
                merchant_name: merchant.business_name,
                ...metadata
            }
        });

        // Create transaction record
        const transaction = await base44.entities.Transaction.create({
            transaction_id: paymentIntent.id,
            merchant_id: merchant_id,
            merchant_name: merchant.business_name,
            type: 'sale',
            status: paymentIntent.status === 'succeeded' ? 'approved' : 'pending',
            amount: amount,
            currency: currency,
            payment_method: 'card',
            customer_email: customer_email,
            description: description,
            auth_code: paymentIntent.charges?.data[0]?.id,
            response_code: paymentIntent.status
        });

        return Response.json({
            success: true,
            transaction_id: transaction.id,
            payment_intent_id: paymentIntent.id,
            status: paymentIntent.status,
            amount: amount,
            currency: currency
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        return Response.json({ 
            error: 'Payment processing failed',
            details: error.message 
        }, { status: 500 });
    }
});