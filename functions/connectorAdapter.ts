import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Connector Adapter - Base class for processor integrations
 * Routes to specific adapter based on connector_name
 * All adapters normalize responses to standard format
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const {
            connector_name,
            action, // 'charge', 'refund', 'verify', 'test'
            amount,
            currency,
            payment_method,
            card_token,
            customer_email,
            customer_name,
            description,
            merchant_id,
            psp_code,
            webhook_secret
        } = await req.json();

        console.log(`🔌 Adapter: Processing ${action} via ${connector_name}`);

        // Route to appropriate adapter
        let result;

        switch (connector_name.toLowerCase()) {
            case 'stripe':
                result = await stripeAdapter({
                    action,
                    amount,
                    currency,
                    payment_method,
                    card_token,
                    customer_email,
                    description,
                    webhook_secret
                });
                break;

            case 'adyen':
                result = await adyenAdapter({
                    action,
                    amount,
                    currency,
                    payment_method,
                    card_token,
                    customer_email,
                    description,
                    webhook_secret
                });
                break;

            case 'paypal':
                result = await paypalAdapter({
                    action,
                    amount,
                    currency,
                    payment_method,
                    customer_email,
                    description,
                    webhook_secret
                });
                break;

            case 'mock':
                // For testing without real connector
                result = await mockAdapter({
                    action,
                    amount,
                    currency,
                    payment_method,
                    customer_email,
                    description
                });
                break;

            default:
                return Response.json({
                    success: false,
                    error: `Unknown connector: ${connector_name}`
                }, { status: 400 });
        }

        return Response.json(result);

    } catch (error) {
        console.error('Adapter error:', error);
        return Response.json({
            success: false,
            error: error.message,
            connector_error: true
        }, { status: 500 });
    }
});

/**
 * STRIPE ADAPTER
 */
async function stripeAdapter({ action, amount, currency, payment_method, card_token, customer_email, description, webhook_secret }) {
    // TODO: Implement actual Stripe API calls
    // For now, return mock successful response
    
    console.log(`📱 Stripe Adapter: ${action} - $${amount} ${currency}`);

    if (action === 'test') {
        return {
            success: true,
            connector: 'stripe',
            status: 'connected',
            supported_methods: ['card', 'bank_transfer', 'wallet']
        };
    }

    if (action === 'charge') {
        return {
            success: true,
            connector: 'stripe',
            transaction_id: `stripe_${Date.now()}`,
            reference_id: `ch_${Math.random().toString(36).substr(2, 9)}`,
            status: 'approved',
            amount,
            currency,
            payment_method,
            customer_email,
            timestamp: new Date().toISOString(),
            processor_response: {
                code: '00',
                message: 'Transaction Approved'
            }
        };
    }

    return {
        success: false,
        error: `Unknown action: ${action}`
    };
}

/**
 * ADYEN ADAPTER
 */
async function adyenAdapter({ action, amount, currency, payment_method, card_token, customer_email, description, webhook_secret }) {
    console.log(`🔷 Adyen Adapter: ${action} - $${amount} ${currency}`);

    if (action === 'test') {
        return {
            success: true,
            connector: 'adyen',
            status: 'connected',
            supported_methods: ['card', 'bank_transfer', 'wallet', 'crypto']
        };
    }

    if (action === 'charge') {
        return {
            success: true,
            connector: 'adyen',
            transaction_id: `adyen_${Date.now()}`,
            psp_reference: `${Math.random().toString(36).substr(2, 13).toUpperCase()}`,
            status: 'approved',
            amount,
            currency,
            payment_method,
            customer_email,
            timestamp: new Date().toISOString(),
            processor_response: {
                resultCode: 'Authorised',
                message: 'Transaction approved'
            }
        };
    }

    return {
        success: false,
        error: `Unknown action: ${action}`
    };
}

/**
 * PAYPAL ADAPTER
 */
async function paypalAdapter({ action, amount, currency, payment_method, customer_email, description, webhook_secret }) {
    console.log(`🅿️ PayPal Adapter: ${action} - $${amount} ${currency}`);

    if (action === 'test') {
        return {
            success: true,
            connector: 'paypal',
            status: 'connected',
            supported_methods: ['paypal_wallet', 'card', 'bank_transfer']
        };
    }

    if (action === 'charge') {
        return {
            success: true,
            connector: 'paypal',
            transaction_id: `paypal_${Date.now()}`,
            order_id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            status: 'approved',
            amount,
            currency,
            payment_method,
            customer_email,
            timestamp: new Date().toISOString(),
            processor_response: {
                status: 'APPROVED',
                message: 'Order confirmed'
            }
        };
    }

    return {
        success: false,
        error: `Unknown action: ${action}`
    };
}

/**
 * MOCK ADAPTER - For testing
 */
async function mockAdapter({ action, amount, currency, payment_method, customer_email, description }) {
    console.log(`🧪 Mock Adapter: ${action} - $${amount} ${currency}`);

    if (action === 'test') {
        return {
            success: true,
            connector: 'mock',
            status: 'connected',
            supported_methods: ['card', 'bank_transfer', 'wallet']
        };
    }

    if (action === 'charge') {
        // Randomly succeed or fail for testing failover
        const shouldSucceed = Math.random() > 0.1; // 90% success rate

        return {
            success: shouldSucceed,
            connector: 'mock',
            transaction_id: `mock_${Date.now()}`,
            reference_id: `TEST-${Math.random().toString(36).substr(2, 9)}`,
            status: shouldSucceed ? 'approved' : 'declined',
            amount,
            currency,
            payment_method,
            customer_email,
            timestamp: new Date().toISOString(),
            processor_response: {
                code: shouldSucceed ? '00' : '05',
                message: shouldSucceed ? 'Transaction Approved' : 'Transaction Declined'
            }
        };
    }

    return {
        success: false,
        error: `Unknown action: ${action}`
    };
}