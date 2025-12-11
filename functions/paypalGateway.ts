import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * PayPal Gateway Integration
 * Process payments via PayPal REST API
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

        if (gateway.gateway_name !== 'paypal') {
            return Response.json({ error: 'Invalid gateway type' }, { status: 400 });
        }

        const baseURL = gateway.gateway_mode === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';

        // Get OAuth token
        const getAccessToken = async () => {
            const authResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${gateway.api_key}:${gateway.api_secret}`)}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials'
            });

            const authData = await authResponse.json();
            return authData.access_token;
        };

        if (action === 'test_connection') {
            const accessToken = await getAccessToken();
            
            if (!accessToken) {
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

            return Response.json({ success: true, message: 'PayPal connection verified' });
        }

        if (action === 'process_payment') {
            const { amount, currency, description } = payment_data;
            const accessToken = await getAccessToken();

            // Create order
            const orderResponse = await fetch(`${baseURL}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{
                        amount: {
                            currency_code: currency,
                            value: amount.toFixed(2)
                        },
                        description: description || 'Payment'
                    }]
                })
            });

            const order = await orderResponse.json();

            if (!orderResponse.ok) {
                return Response.json({ 
                    success: false, 
                    error: order.message || 'Payment failed' 
                }, { status: 400 });
            }

            await base44.asServiceRole.entities.PaymentGateway.update(gateway_id, {
                ...gateway,
                total_volume: (gateway.total_volume || 0) + amount,
                total_transactions: (gateway.total_transactions || 0) + 1
            });

            return Response.json({
                success: true,
                payment_id: order.id,
                status: order.status,
                amount,
                currency,
                approval_url: order.links.find(link => link.rel === 'approve')?.href
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('PayPal gateway error:', error);
        return Response.json({ 
            error: 'Gateway operation failed', 
            details: error.message 
        }, { status: 500 });
    }
});