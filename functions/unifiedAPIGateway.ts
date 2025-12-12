import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

// Rate limiting in-memory store (use Redis in production)
const rateLimitStore = new Map();

// Sanitize sensitive data from logs
function sanitizeData(data) {
    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveFields = ['card_number', 'cvv', 'password', 'api_key', 'secret'];
    
    function recursiveSanitize(obj) {
        for (const key in obj) {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                obj[key] = '***REDACTED***';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                recursiveSanitize(obj[key]);
            }
        }
    }
    
    recursiveSanitize(sanitized);
    return sanitized;
}

// Check rate limit
function checkRateLimit(apiKeyId, limit) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    
    if (!rateLimitStore.has(apiKeyId)) {
        rateLimitStore.set(apiKeyId, []);
    }
    
    const requests = rateLimitStore.get(apiKeyId);
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (recentRequests.length >= limit) {
        return false;
    }
    
    recentRequests.push(now);
    rateLimitStore.set(apiKeyId, recentRequests);
    return true;
}

// Stripe integration
async function processStripePayment(gateway, payload) {
    const stripe = new Stripe(gateway.api_key);
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(payload.amount * 100),
        currency: payload.currency || 'usd',
        payment_method: payload.payment_method,
        confirm: payload.confirm || false,
        description: payload.description,
        metadata: payload.metadata || {}
    });
    
    return {
        success: true,
        transaction_id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        gateway: 'stripe',
        raw_response: paymentIntent
    };
}

// PayPal integration
async function processPayPalPayment(gateway, payload) {
    const auth = btoa(`${gateway.api_key}:${gateway.api_secret}`);
    
    // Get access token
    const tokenResponse = await fetch(`https://api-m.${gateway.gateway_mode === 'live' ? '' : 'sandbox.'}paypal.com/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    
    const { access_token } = await tokenResponse.json();
    
    // Create order
    const orderResponse = await fetch(`https://api-m.${gateway.gateway_mode === 'live' ? '' : 'sandbox.'}paypal.com/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: payload.currency || 'USD',
                    value: payload.amount.toFixed(2)
                },
                description: payload.description
            }]
        })
    });
    
    const order = await orderResponse.json();
    
    return {
        success: true,
        transaction_id: order.id,
        status: order.status,
        amount: payload.amount,
        currency: payload.currency || 'USD',
        gateway: 'paypal',
        approval_url: order.links.find(l => l.rel === 'approve')?.href,
        raw_response: order
    };
}

// Adyen integration
async function processAdyenPayment(gateway, payload) {
    const response = await fetch(`https://checkout-test.adyen.com/v70/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': gateway.api_key
        },
        body: JSON.stringify({
            amount: {
                currency: payload.currency || 'USD',
                value: Math.round(payload.amount * 100)
            },
            reference: payload.reference || `order_${Date.now()}`,
            merchantAccount: gateway.merchant_account_id,
            paymentMethod: payload.payment_method,
            returnUrl: payload.return_url
        })
    });
    
    const result = await response.json();
    
    return {
        success: result.resultCode === 'Authorised',
        transaction_id: result.pspReference,
        status: result.resultCode,
        amount: payload.amount,
        currency: payload.currency || 'USD',
        gateway: 'adyen',
        raw_response: result
    };
}

// Main gateway handler
Deno.serve(async (req) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
        const base44 = createClientFromRequest(req);
        
        // Extract API key from Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ 
                error: 'Missing or invalid authorization header',
                request_id: requestId
            }, { status: 401 });
        }
        
        const apiKey = authHeader.replace('Bearer ', '');
        
        // Find API key in database
        const apiKeys = await base44.asServiceRole.entities.APIKey.filter({ 
            api_key: apiKey, 
            status: 'active' 
        });
        
        if (!apiKeys || apiKeys.length === 0) {
            return Response.json({ 
                error: 'Invalid API key',
                request_id: requestId
            }, { status: 401 });
        }
        
        const apiKeyRecord = apiKeys[0];
        
        // Check if key is expired
        if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
            return Response.json({ 
                error: 'API key has expired',
                request_id: requestId
            }, { status: 401 });
        }
        
        // Check IP whitelist
        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (apiKeyRecord.allowed_ips && apiKeyRecord.allowed_ips.length > 0) {
            if (!apiKeyRecord.allowed_ips.includes(clientIp)) {
                return Response.json({ 
                    error: 'IP address not whitelisted',
                    request_id: requestId
                }, { status: 403 });
            }
        }
        
        // Rate limiting
        if (!checkRateLimit(apiKeyRecord.id, apiKeyRecord.rate_limit)) {
            await base44.asServiceRole.entities.APIRequestLog.create({
                merchant_id: apiKeyRecord.merchant_id,
                api_key_id: apiKeyRecord.id,
                request_id: requestId,
                endpoint: new URL(req.url).pathname,
                method: req.method,
                status_code: 429,
                ip_address: clientIp,
                user_agent: req.headers.get('user-agent'),
                response_time_ms: Date.now() - startTime,
                rate_limited: true,
                error_message: 'Rate limit exceeded'
            });
            
            return Response.json({ 
                error: 'Rate limit exceeded. Please try again later.',
                request_id: requestId,
                rate_limit: apiKeyRecord.rate_limit,
                rate_limit_window: '1 minute'
            }, { status: 429 });
        }
        
        // Parse request body
        const body = await req.json();
        const { action, ...payload } = body;
        
        // Check permissions
        if (!apiKeyRecord.permissions.includes(action)) {
            return Response.json({ 
                error: `API key does not have permission for action: ${action}`,
                request_id: requestId
            }, { status: 403 });
        }
        
        let result;
        let gatewayUsed;
        
        // Route based on action
        switch (action) {
            case 'create_payment':
                // Get merchant's active payment gateway
                const gateways = await base44.asServiceRole.entities.PaymentGateway.filter({
                    merchant_id: apiKeyRecord.merchant_id,
                    status: 'active',
                    is_default: true
                });
                
                if (!gateways || gateways.length === 0) {
                    throw new Error('No active payment gateway configured');
                }
                
                const gateway = gateways[0];
                gatewayUsed = gateway.gateway_name;
                
                // Route to appropriate gateway
                if (gateway.gateway_name === 'stripe') {
                    result = await processStripePayment(gateway, payload);
                } else if (gateway.gateway_name === 'paypal') {
                    result = await processPayPalPayment(gateway, payload);
                } else if (gateway.gateway_name === 'adyen') {
                    result = await processAdyenPayment(gateway, payload);
                } else {
                    throw new Error(`Unsupported gateway: ${gateway.gateway_name}`);
                }
                break;
                
            case 'tokenize_card':
                // Tokenization logic (can be implemented with specific tokenization service)
                result = { 
                    success: true, 
                    message: 'Tokenization endpoint - implementation pending',
                    token: `tok_${crypto.randomUUID()}`
                };
                gatewayUsed = 'internal';
                break;
                
            case 'get_transaction':
                // Retrieve transaction data
                const transactions = await base44.asServiceRole.entities.Transaction.filter({
                    merchant_id: apiKeyRecord.merchant_id,
                    transaction_id: payload.transaction_id
                });
                
                result = {
                    success: true,
                    transaction: transactions[0] || null
                };
                gatewayUsed = 'internal';
                break;
                
            case 'list_transactions':
                // List transactions with pagination
                const allTransactions = await base44.asServiceRole.entities.Transaction.filter({
                    merchant_id: apiKeyRecord.merchant_id
                }, '-created_date', payload.limit || 50);
                
                result = {
                    success: true,
                    transactions: allTransactions,
                    count: allTransactions.length
                };
                gatewayUsed = 'internal';
                break;
                
            default:
                throw new Error(`Unknown action: ${action}`);
        }
        
        // Update API key usage
        await base44.asServiceRole.entities.APIKey.update(apiKeyRecord.id, {
            last_used: new Date().toISOString(),
            usage_count: (apiKeyRecord.usage_count || 0) + 1
        });
        
        // Log request
        await base44.asServiceRole.entities.APIRequestLog.create({
            merchant_id: apiKeyRecord.merchant_id,
            api_key_id: apiKeyRecord.id,
            request_id: requestId,
            endpoint: action,
            method: req.method,
            request_body: JSON.stringify(sanitizeData(payload)),
            response_body: JSON.stringify(sanitizeData(result)),
            status_code: 200,
            gateway_used: gatewayUsed,
            gateway_request_id: result.transaction_id,
            ip_address: clientIp,
            user_agent: req.headers.get('user-agent'),
            response_time_ms: Date.now() - startTime
        });
        
        return Response.json({
            ...result,
            request_id: requestId,
            response_time_ms: Date.now() - startTime
        });
        
    } catch (error) {
        console.error('API Gateway error:', error);
        
        return Response.json({ 
            error: error.message,
            request_id: requestId,
            response_time_ms: Date.now() - startTime
        }, { status: 500 });
    }
});