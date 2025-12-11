import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Adyen Gateway Integration
 * Process payments via Adyen API
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, gateway_id, payment_data } = await req.json();

        const gateways = await base44.asServiceRole.entities.PaymentGateway.filter({ id: gateway_id });
        
        if (!gateways || gateways.length === 0) {
            return Response.json({ error: 'Gateway not found' }, { status: 404 });
        }

        const gateway = gateways[0];

        if (gateway.gateway_name !== 'adyen') {
            return Response.json({ error: 'Invalid gateway type' }, { status: 400 });
        }

        const baseURL = gateway.gateway_mode === 'live' 
            ? `https://${gateway.merchant_account_id}-checkout-live.adyenpayments.com/checkout` 
            : 'https://checkout-test.adyen.com/checkout';

        if (action === 'test_connection') {
            const response = await fetch(`${baseURL}/v70/paymentMethods`, {
                method: 'POST',
                headers: {
                    'x-API-key': gateway.api_key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    merchantAccount: gateway.merchant_account_id,
                    countryCode: 'US',
                    amount: {
                        currency: 'USD',
                        value: 1000
                    }
                })
            });

            if (!response.ok) {
                return Response.json({ 
                    success: false, 
                    error: 'Connection test failed' 
                }, { status: 500 });
            }

            await base44.asServiceRole.entities.PaymentGateway.update(gateway_id, {
                ...gateway,
                connection_verified: true,
                last_verified: new Date().toISOString()
            });

            return Response.json({ success: true, message: 'Adyen connection verified' });
        }

        if (action === 'process_payment') {
            const { amount, currency, payment_method, customer_email, return_url } = payment_data;

            const paymentResponse = await fetch(`${baseURL}/v70/payments`, {
                method: 'POST',
                headers: {
                    'x-API-key': gateway.api_key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    merchantAccount: gateway.merchant_account_id,
                    amount: {
                        currency: currency,
                        value: Math.round(amount * 100) // Adyen uses minor units
                    },
                    reference: `PAY-${Date.now()}`,
                    paymentMethod: payment_method,
                    shopperEmail: customer_email,
                    returnUrl: return_url,
                    shopperInteraction: 'Ecommerce',
                    recurringProcessingModel: 'CardOnFile'
                })
            });

            const payment = await paymentResponse.json();

            if (!paymentResponse.ok) {
                return Response.json({ 
                    success: false, 
                    error: payment.message || 'Payment failed' 
                }, { status: 400 });
            }

            await base44.asServiceRole.entities.PaymentGateway.update(gateway_id, {
                ...gateway,
                total_volume: (gateway.total_volume || 0) + amount,
                total_transactions: (gateway.total_transactions || 0) + 1
            });

            return Response.json({
                success: true,
                payment_id: payment.pspReference,
                status: payment.resultCode,
                amount,
                currency,
                action: payment.action
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Adyen gateway error:', error);
        return Response.json({ 
            error: 'Gateway operation failed', 
            details: error.message 
        }, { status: 500 });
    }
});