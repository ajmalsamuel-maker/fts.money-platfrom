/**
 * W3C Payment Request API Standard
 * https://www.w3.org/TR/payment-request/
 * 
 * Standard payment method identifiers supported by browsers
 */

export const W3C_PAYMENT_METHODS = {
    basic_card: {
        id: 'basic-card',
        name: 'Basic Card',
        description: 'W3C standard card payment',
        supported_card_networks: [
            'visa', 'mastercard', 'amex', 'discover', 
            'diners', 'jcb', 'unionpay', 'mir'
        ],
        standard: 'W3C Payment Request API'
    },
    payment_method_identifiers: [
        // Standardized payment method identifiers
        { id: 'https://apple.com/apple-pay', name: 'Apple Pay', category: 'wallet' },
        { id: 'https://google.com/pay', name: 'Google Pay', category: 'wallet' },
        { id: 'https://samsung.com/samsung-pay', name: 'Samsung Pay', category: 'wallet' },
        { id: 'https://w3.org/basic-card', name: 'Basic Card', category: 'card_network' },
        
        // Regional identifiers
        { id: 'https://bobpay.example.com/pay', name: 'Bob Pay', category: 'wallet' },
        { id: 'interledger', name: 'Interledger Protocol', category: 'crypto' }
    ]
};

/**
 * Check if a payment method is supported by the browser
 */
export const isPaymentMethodSupported = async (methodId) => {
    if (!window.PaymentRequest) {
        return false;
    }

    try {
        const request = new PaymentRequest(
            [{ supportedMethods: methodId }],
            { total: { label: 'Test', amount: { currency: 'USD', value: '0.01' } } }
        );
        
        const result = await request.canMakePayment();
        return result;
    } catch (error) {
        console.warn(`Payment method ${methodId} check failed:`, error);
        return false;
    }
};

/**
 * Get all W3C standard payment methods
 */
export const getW3CPaymentMethods = () => {
    return W3C_PAYMENT_METHODS.payment_method_identifiers;
};

/**
 * Map W3C payment method to FTS internal format
 */
export const mapW3CToFTSFormat = (w3cMethod) => {
    return {
        id: w3cMethod.id.replace('https://', '').replace(/\//g, '_'),
        name: w3cMethod.name,
        category: w3cMethod.category,
        standard: 'W3C Payment Request API',
        w3c_identifier: w3cMethod.id
    };
};