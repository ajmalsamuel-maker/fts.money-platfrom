import { BaseConnector } from './baseConnector.js';

/**
 * AML Screening Connector (AMLWatcher)
 */
export class AMLConnector extends BaseConnector {
    constructor(apiKey) {
        super({
            baseURL: 'https://api.amlwatcher.com/v2',
            apiKey: apiKey,
            timeout: 30000,
            maxRetries: 2
        });
    }

    /**
     * Screen entity (person or business)
     */
    async screenEntity(data) {
        return this.post('/screen', {
            entity_type: data.entity_type, // 'individual' or 'business'
            name: data.name,
            date_of_birth: data.date_of_birth,
            country: data.country,
            additional_info: data.additional_info
        });
    }

    /**
     * Get screening result
     */
    async getScreeningResult(screeningId) {
        return this.get(`/screen/${screeningId}`);
    }

    /**
     * Ongoing monitoring
     */
    async enableMonitoring(entityId) {
        return this.post(`/monitor/${entityId}/enable`, {});
    }

    /**
     * Check for alerts
     */
    async getAlerts(entityId) {
        return this.get(`/monitor/${entityId}/alerts`);
    }
}