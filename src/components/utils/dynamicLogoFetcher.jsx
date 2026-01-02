import { base44 } from '@/api/base44Client';

/**
 * Dynamic Logo Fetcher
 * Tries multiple logo sources: Clearbit, Logo.dev, VectorLogoZone, Google, DuckDuckGo
 */

// Extract domain from URL or provider name
const extractDomain = (input) => {
    if (!input) return null;
    
    // If it's already a domain
    if (input.includes('.')) {
        return input.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
    
    // Common payment provider domains
    const knownDomains = {
        'stripe': 'stripe.com',
        'paypal': 'paypal.com',
        'adyen': 'adyen.com',
        'square': 'squareup.com',
        'braintree': 'braintreepayments.com',
        'worldpay': 'worldpay.com',
        'authorize.net': 'authorize.net',
        'checkout.com': 'checkout.com',
        'mollie': 'mollie.com',
        'klarna': 'klarna.com',
        'afterpay': 'afterpay.com',
        'affirm': 'affirm.com',
        'mastercard': 'mastercard.com',
        'visa': 'visa.com',
        'amex': 'americanexpress.com',
        'discover': 'discover.com',
        'jcb': 'global.jcb',
        'unionpay': 'unionpayintl.com',
        'alipay': 'alipay.com',
        'wechat': 'wechat.com',
        'revolut': 'revolut.com',
        'wise': 'wise.com',
        'n26': 'n26.com',
        'monzo': 'monzo.com',
        'chime': 'chime.com'
    };
    
    const normalized = input.toLowerCase().replace(/\s+/g, '');
    return knownDomains[normalized] || `${normalized}.com`;
};

/**
 * Fetch logo from multiple sources with fallback
 */
export const fetchProviderLogo = async (providerName, customDomain = null) => {
    try {
        const domain = customDomain || extractDomain(providerName);
        
        const response = await base44.functions.invoke('fetchDynamicLogo', {
            providerName,
            domain
        });

        if (response.data.success) {
            return response.data.logo_url;
        }

        return null;
    } catch (error) {
        console.warn(`Failed to fetch logo for ${providerName}:`, error);
        return null;
    }
};

/**
 * Fetch multiple logos in parallel
 */
export const fetchMultipleLogos = async (providers) => {
    const promises = providers.map(async (provider) => {
        const logoUrl = await fetchProviderLogo(provider.name, provider.domain);
        return {
            ...provider,
            logo_url: logoUrl
        };
    });

    return await Promise.all(promises);
};

/**
 * Get logo with caching (localStorage)
 */
export const getCachedLogo = async (providerName, customDomain = null) => {
    const cacheKey = `logo_${providerName.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Check cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        // Cache for 7 days
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
            return url;
        }
    }

    // Fetch fresh
    const logoUrl = await fetchProviderLogo(providerName, customDomain);
    if (logoUrl) {
        localStorage.setItem(cacheKey, JSON.stringify({
            url: logoUrl,
            timestamp: Date.now()
        }));
    }

    return logoUrl;
};

/**
 * Clear logo cache
 */
export const clearLogoCache = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('logo_')) {
            localStorage.removeItem(key);
        }
    });
};