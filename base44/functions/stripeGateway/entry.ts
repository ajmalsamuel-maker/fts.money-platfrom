import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Stripe Gateway Integration
 * Process payments via Stripe API
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, gateway_id, payment_data } = await req.json();

        // Retrieve gateway configuration
        const gateways = await base44.asServiceRole.entities.PaymentGateway.filter({ id: gateway_id });
        
        if (!gateways || gateways.length === 0) {
            return Response.json({ error: 'Gateway not found' }, { status: 404 });
        }

        const gateway = gateways[0];

        if (gateway.gateway_name !== 'stripe') {
            return Response.json({ error: 'Invalid gateway type' }, { status: 400 });
        }

        const stripeKey = gateway.api_key;

        if (action === 'test_connection') {
            // Test Stripe connection
            const response = await fetch('https://api.stripe.com/v1/balance', {
                headers: {
                    'Authorization': `Bearer ${stripeKey}`,
                }
            });

            if (!response.ok) {
                return Response.json({ 
                    success: false, 
                    error: 'Connection test failed' 
                }, { status: 500 });
            }

            // Update gateway
            await base44.asServiceRole.entities.PaymentGateway.update(gateway_id, {
                ...gateway,
                connection_verified: true,
                last_verified: new Date().toISOString()
            });

            return Response.json({ success: true, message: 'Stripe connection verified' });
        }

        if (action === 'process_payment') {
            const { amount, currency, customer_email, payment_method, description } = payment_data;

            // Create payment intent
            const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stripeKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    amount: Math.round(amount * 100).toString(), // Stripe uses cents
                    currency: currency.toLowerCase(),
                    'payment_method': payment_method,
                    'receipt_email': customer_email,
                    description: description || 'Payment',
                    'confirm': 'true',
                    'automatic_payment_methods[enabled]': 'true',
                })
            });

            const paymentIntent = await paymentIntentResponse.json();

            if (!paymentIntentResponse.ok) {
                return Response.json({ 
                    success: false, 
                    error: paymentIntent.error?.message || 'Payment failed' 
                }, { status: 400 });
            }

            // Update gateway stats
            await base44.asServiceRole.entities.PaymentGateway.update(gateway_id, {
                ...gateway,
                total_volume: (gateway.total_volume || 0) + amount,
                total_transactions: (gateway.total_transactions || 0) + 1
            });

            return Response.json({
                success: true,
                payment_id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency.toUpperCase(),
                client_secret: paymentIntent.client_secret
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Stripe gateway error:', error);
        return Response.json({ 
            error: 'Gateway operation failed', 
            details: error.message 
        }, { status: 500 });
    }
});