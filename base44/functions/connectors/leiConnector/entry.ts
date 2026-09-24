import { BaseConnector } from './baseConnector.js';

/**
 * LEI Verification Connector (GLEIF)
 */
export class LEIConnector extends BaseConnector {
    constructor() {
        super({
            baseURL: 'https://api.gleif.org/api/v1',
            apiKey: '', // GLEIF API is public, no key needed
            timeout: 20000,
            maxRetries: 3
        });
    }

    /**
     * Override request to not send Authorization header
     */
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        delete headers.Authorization; // GLEIF doesn't need auth
        
        return super.request(endpoint, { ...options, headers });
    }

    /**
     * Search LEI by company name or registration number
     */
    async searchLEI(query) {
        return this.get('/lei-records', {
            'filter[entity.legalName]': query
        });
    }

    /**
     * Get LEI details
     */
    async getLEI(lei) {
        return this.get(`/lei-records/${lei}`);
    }

    /**
     * Verify LEI status
     */
    async verifyLEI(lei) {
        const data = await this.getLEI(lei);
        
        return {
            lei: lei,
            status: data.data?.attributes?.registration?.registrationStatus,
            legal_name: data.data?.attributes?.entity?.legalName?.name,
            jurisdiction: data.data?.attributes?.entity?.legalAddress?.country,
            verified: data.data?.attributes?.registration?.registrationStatus === 'ISSUED',
            expiry_date: data.data?.attributes?.registration?.nextRenewalDate
        };
    }
}