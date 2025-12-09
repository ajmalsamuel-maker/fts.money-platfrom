/**
 * Base Connector Class
 * Provides: retry logic, circuit breaker, rate limiting, error handling, logging
 */

export class BaseConnector {
    constructor(config) {
        this.baseURL = config.baseURL;
        this.apiKey = config.apiKey;
        this.timeout = config.timeout || 30000;
        this.maxRetries = config.maxRetries || 3;
        this.retryDelay = config.retryDelay || 1000;
        
        // Circuit breaker state
        this.failures = 0;
        this.failureThreshold = 5;
        this.resetTimeout = 60000; // 1 minute
        this.circuitOpen = false;
        this.lastFailureTime = null;
    }

    /**
     * Main request method with retry and circuit breaker
     */
    async request(endpoint, options = {}) {
        // Check circuit breaker
        if (this.circuitOpen) {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                console.log(`[${this.constructor.name}] Circuit breaker reset, attempting request`);
                this.circuitOpen = false;
                this.failures = 0;
            } else {
                throw new Error(`Circuit breaker open for ${this.constructor.name}`);
            }
        }

        const url = `${this.baseURL}${endpoint}`;
        const method = options.method || 'GET';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...options.headers
        };

        let lastError;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`[${this.constructor.name}] Request attempt ${attempt + 1}/${this.maxRetries + 1}: ${method} ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    method,
                    headers,
                    body: options.body ? JSON.stringify(options.body) : undefined,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Success - reset circuit breaker
                this.failures = 0;

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                console.log(`[${this.constructor.name}] Request succeeded`);
                return data;

            } catch (error) {
                lastError = error;
                console.error(`[${this.constructor.name}] Request failed (attempt ${attempt + 1}):`, error.message);

                // Don't retry on certain errors
                if (error.message.includes('401') || error.message.includes('403')) {
                    throw new Error(`Authentication failed: ${error.message}`);
                }

                // Increment failure count
                this.failures++;
                this.lastFailureTime = Date.now();

                // Open circuit breaker if threshold reached
                if (this.failures >= this.failureThreshold) {
                    this.circuitOpen = true;
                    console.error(`[${this.constructor.name}] Circuit breaker opened after ${this.failures} failures`);
                }

                // Wait before retry (exponential backoff)
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt);
                    console.log(`[${this.constructor.name}] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(`Max retries exceeded: ${lastError.message}`);
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    /**
     * PUT request
     */
    async put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}