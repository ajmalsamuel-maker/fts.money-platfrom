import { BaseConnector } from './baseConnector.js';

/**
 * Generic Payment Processor Connector
 * Can be extended for specific processors (Stripe, Adyen, etc.)
 */
export class PaymentProcessorConnector extends BaseConnector {
    constructor(config) {
        super({
            baseURL: config.baseURL,
            apiKey: config.apiKey,
            timeout: config.timeout || 10000, // Payment APIs should be fast
            maxRetries: config.maxRetries || 2
        });
        this.processorType = config.processorType;
    }

    /**
     * Process payment
     */
    async processPayment(data) {
        return this.post('/payments', {
            amount: data.amount,
            currency: data.currency,
            card: data.card,
            metadata: data.metadata
        });
    }

    /**
     * Refund payment
     */
    async refund(transactionId, amount) {
        return this.post(`/payments/${transactionId}/refund`, {
            amount: amount
        });
    }

    /**
     * Get transaction status
     */
    async getTransactionStatus(transactionId) {
        return this.get(`/payments/${transactionId}`);
    }

    /**
     * Void transaction
     */
    async voidTransaction(transactionId) {
        return this.post(`/payments/${transactionId}/void`, {});
    }
}

/**
 * Stripe-specific connector
 */
export class StripeConnector extends PaymentProcessorConnector {
    constructor(apiKey) {
        super({
            baseURL: 'https://api.stripe.com/v1',
            apiKey: apiKey,
            processorType: 'stripe',
            timeout: 8000
        });
    }

    // Override request to use Stripe's auth format
    async request(endpoint, options = {}) {
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            ...options.headers
        };
        return super.request(endpoint, { ...options, headers });
    }
}

/**
 * Adyen-specific connector
 */
export class AdyenConnector extends PaymentProcessorConnector {
    constructor(apiKey, merchantAccount) {
        super({
            baseURL: 'https://checkout-test.adyen.com/v70',
            apiKey: apiKey,
            processorType: 'adyen',
            timeout: 10000
        });
        this.merchantAccount = merchantAccount;
    }

    async request(endpoint, options = {}) {
        const headers = {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
            ...options.headers
        };
        return super.request(endpoint, { ...options, headers });
    }
}