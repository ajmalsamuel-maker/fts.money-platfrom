import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Mock Adyen Payment Gateway
 * Simulates Adyen API responses for testing
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
            simulate_delay = 150,
            simulate_success_rate = 93
        } = payload;

        // Simulate network delay
        if (simulate_delay > 0) {
            await new Promise(resolve => setTimeout(resolve, simulate_delay));
        }

        // Simulate success/failure
        const random = Math.random() * 100;
        const isSuccess = random <= simulate_success_rate;

        if (isSuccess) {
            return Response.json({
                status: 'success',
                transaction_id: `mock_adyen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount: amount,
                currency: currency,
                payment_method: payment_method,
                gateway_response: {
                    pspReference: `${Date.now()}${Math.floor(Math.random() * 1000000000)}`,
                    resultCode: 'Authorised',
                    amount: {
                        currency: currency,
                        value: amount * 100
                    },
                    merchantReference: `ref_${Date.now()}`,
                    paymentMethod: payment_method,
                    additionalData: {
                        cardSummary: '4242',
                        expiryDate: '12/2025'
                    }
                },
                processing_time_ms: simulate_delay,
                provider: 'mock_adyen'
            });
        } else {
            const errorTypes = [
                { code: 'Refused', message: 'Transaction refused' },
                { code: 'Error', message: 'Technical error' },
                { code: 'Cancelled', message: 'Transaction cancelled' }
            ];
            
            const error = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            
            return Response.json({
                status: 'failed',
                error_code: error.code,
                error_message: error.message,
                transaction_id: `mock_adyen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                provider: 'mock_adyen',
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