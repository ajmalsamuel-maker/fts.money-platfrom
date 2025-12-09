/**
 * Connector Factory
 * Central place to instantiate connectors with proper configuration
 */

import { KYBConnector } from './kybConnector.js';
import { AMLConnector } from './amlConnector.js';
import { LEIConnector } from './leiConnector.js';
import { StripeConnector, AdyenConnector } from './paymentProcessorConnector.js';

export class ConnectorFactory {
    /**
     * Get KYB connector
     */
    static getKYBConnector() {
        const apiKey = Deno.env.get('THEKYB_API_KEY');
        if (!apiKey) {
            throw new Error('THEKYB_API_KEY not configured');
        }
        return new KYBConnector(apiKey);
    }

    /**
     * Get AML connector
     */
    static getAMLConnector() {
        const apiKey = Deno.env.get('AMLWATCHER_API_KEY');
        if (!apiKey) {
            throw new Error('AMLWATCHER_API_KEY not configured');
        }
        return new AMLConnector(apiKey);
    }

    /**
     * Get LEI connector
     */
    static getLEIConnector() {
        return new LEIConnector();
    }

    /**
     * Get payment processor connector
     */
    static getPaymentProcessorConnector(processor, config = {}) {
        switch (processor.toLowerCase()) {
            case 'stripe':
                const stripeKey = config.apiKey || Deno.env.get('STRIPE_API_KEY');
                if (!stripeKey) throw new Error('STRIPE_API_KEY not configured');
                return new StripeConnector(stripeKey);

            case 'adyen':
                const adyenKey = config.apiKey || Deno.env.get('ADYEN_API_KEY');
                const merchantAccount = config.merchantAccount || Deno.env.get('ADYEN_MERCHANT_ACCOUNT');
                if (!adyenKey) throw new Error('ADYEN_API_KEY not configured');
                return new AdyenConnector(adyenKey, merchantAccount);

            default:
                throw new Error(`Unsupported processor: ${processor}`);
        }
    }
}

// Export all connectors
export { KYBConnector } from './kybConnector.js';
export { AMLConnector } from './amlConnector.js';
export { LEIConnector } from './leiConnector.js';
export { StripeConnector, AdyenConnector } from './paymentProcessorConnector.js';