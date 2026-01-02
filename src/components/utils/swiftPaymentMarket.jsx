/**
 * SWIFT Payment Market Practice Group Standards
 * https://www.swift.com/standards/payment-market-practice-group
 * 
 * SWIFT maintains registries for:
 * - BIC Directory (ISO 9362)
 * - Country Codes (ISO 3166)
 * - Currency Codes (ISO 4217)
 * - Payment Message Standards (ISO 20022)
 */

export const SWIFT_PAYMENT_SERVICES = {
    // SWIFT gpi (Global Payments Innovation)
    gpi: {
        id: 'swift_gpi',
        name: 'SWIFT gpi',
        description: 'Fast, traceable cross-border payments',
        standard: 'ISO 20022',
        tracking: 'End-to-end tracking with UETR',
        settlement_time: 'Same day'
    },
    
    // SWIFT Go (low-value payments)
    swift_go: {
        id: 'swift_go',
        name: 'SWIFT Go',
        description: 'Fast, low-value cross-border payments',
        standard: 'ISO 20022',
        max_amount: 10000,
        currency: 'Multiple',
        features: ['pre_validation', 'upfront_fees', 'fast_settlement']
    }
};

/**
 * SWIFT Message Types (MT vs MX)
 */
export const SWIFT_MESSAGE_TYPES = {
    // Legacy MT messages (being replaced by ISO 20022 MX)
    mt: {
        'MT101': 'Request for Transfer',
        'MT102': 'Multiple Customer Credit Transfer',
        'MT103': 'Single Customer Credit Transfer',
        'MT202': 'General Financial Institution Transfer',
        'MT910': 'Confirmation of Credit',
        'MT940': 'Customer Statement Message',
        'MT950': 'Statement Message'
    },
    
    // ISO 20022 MX messages (modern standard)
    mx: {
        'pacs.008': 'FI to FI Customer Credit Transfer',
        'pacs.009': 'Financial Institution Credit Transfer',
        'pain.001': 'Customer Credit Transfer Initiation',
        'pain.002': 'Payment Status Report',
        'camt.052': 'Bank to Customer Account Report',
        'camt.053': 'Bank to Customer Statement',
        'camt.054': 'Bank to Customer Debit Credit Notification'
    }
};

/**
 * SWIFT BIC Validation (ISO 9362)
 */
export const validateSWIFTBIC = (bic) => {
    // BIC format: AAAABBCCXXX
    // AAAA - Bank code (4 letters)
    // BB - Country code (2 letters, ISO 3166-1)
    // CC - Location code (2 letters/digits)
    // XXX - Branch code (3 letters/digits, optional)
    
    const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return bicRegex.test(bic);
};

/**
 * SWIFT Country Payment Methods
 * Cross-reference with domestic payment systems
 */
export const SWIFT_COUNTRY_PAYMENT_SYSTEMS = {
    'US': ['FedWire', 'ACH', 'CHIPS'],
    'GB': ['CHAPS', 'Faster Payments', 'BACS'],
    'EU': ['TARGET2', 'SEPA', 'STEP2'],
    'CN': ['CNAPS', 'CIPS'],
    'IN': ['RTGS', 'NEFT', 'IMPS', 'UPI'],
    'JP': ['Zengin', 'BOJ-NET'],
    'AU': ['RITS', 'NPP'],
    'CA': ['LVTS', 'ACSS'],
    'SG': ['MEPS+', 'FAST'],
    'HK': ['RTGS', 'FPS'],
    'BR': ['STR', 'PIX'],
    'MX': ['SPEI'],
    'ZA': ['SAMOS']
};

/**
 * Get domestic payment system for country
 */
export const getDomesticPaymentSystems = (countryCode) => {
    return SWIFT_COUNTRY_PAYMENT_SYSTEMS[countryCode] || [];
};

/**
 * Check if SWIFT gpi is supported for corridor
 */
export const isGPISupported = (fromCountry, toCountry) => {
    // SWIFT gpi covers 200+ countries
    const gpiCountries = Object.keys(SWIFT_COUNTRY_PAYMENT_SYSTEMS);
    return gpiCountries.includes(fromCountry) && gpiCountries.includes(toCountry);
};