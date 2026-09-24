import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Mock Stripe Payment Gateway
 * Simulates Stripe API responses for testing
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        
        const { 
            amount, 
            currency, 
            payment_method,
            merchant_id,
            simulate_delay = 100,
            simulate_success_rate = 95 
        } = payload;

        // Simulate network delay
        if (simulate_delay > 0) {
            await new Promise(resolve => setTimeout(resolve, simulate_delay));
        }

        // Simulate success/failure based on success rate
        const random = Math.random() * 100;
        const isSuccess = random <= simulate_success_rate;

        if (isSuccess) {
            return Response.json({
                status: 'success',
                transaction_id: `mock_stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount: amount,
                currency: currency,
                payment_method: payment_method,
                gateway_response: {
                    id: `ch_${Math.random().toString(36).substr(2, 24)}`,
                    object: 'charge',
                    amount: amount * 100, // Stripe uses cents
                    currency: currency.toLowerCase(),
                    status: 'succeeded',
                    payment_method_details: {
                        type: payment_method,
                        card: {
                            brand: 'visa',
                            last4: '4242',
                            exp_month: 12,
                            exp_year: 2025
                        }
                    },
                    created: Math.floor(Date.now() / 1000)
                },
                processing_time_ms: simulate_delay,
                provider: 'mock_stripe'
            });
        } else {
            // Simulate various failure scenarios
            const errorTypes = [
                { code: 'card_declined', message: 'Your card was declined' },
                { code: 'insufficient_funds', message: 'Insufficient funds' },
                { code: 'expired_card', message: 'Your card has expired' },
                { code: 'processing_error', message: 'An error occurred while processing your card' }
            ];
            
            const error = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            
            return Response.json({
                status: 'failed',
                error_code: error.code,
                error_message: error.message,
                transaction_id: `mock_stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                provider: 'mock_stripe',
                processing_time_ms: simulate_delay
            });
        }
    } catch (error) {
        return Response.json({ 
            status: 'error',
            error: error.message 
        }, { status: 500 });
    }
});