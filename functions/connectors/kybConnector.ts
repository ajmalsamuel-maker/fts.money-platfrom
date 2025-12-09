import { BaseConnector } from './baseConnector.js';

/**
 * KYB Verification Connector (TheKYB)
 */
export class KYBConnector extends BaseConnector {
    constructor(apiKey) {
        super({
            baseURL: 'https://api.thekyb.com/v1',
            apiKey: apiKey,
            timeout: 45000, // KYB can be slow
            maxRetries: 2
        });
    }

    /**
     * Verify business
     */
    async verifyBusiness(data) {
        return this.post('/verify', {
            business_name: data.business_name,
            registration_number: data.registration_number,
            country: data.country,
            callback_url: data.callback_url
        });
    }

    /**
     * Get verification status
     */
    async getStatus(verificationId) {
        return this.get(`/verify/${verificationId}`);
    }

    /**
     * Get business details
     */
    async getBusinessDetails(registrationNumber, country) {
        return this.get('/business', {
            registration_number: registrationNumber,
            country: country
        });
    }
}