/**
 * EMVCo Payment Tokenization Standards
 * https://www.emvco.com/emv-technologies/payment-tokenisation/
 * 
 * EMVCo defines standards for:
 * - Payment Token (surrogate PAN)
 * - Token Requestor ID
 * - Token Service Provider (TSP)
 * - Network Token
 */

export const EMVCO_TOKEN_SERVICES = {
    // Card Network Token Service Providers
    visa_token_service: {
        id: 'visa_vts',
        name: 'Visa Token Service (VTS)',
        network: 'Visa',
        standard: 'EMVCo Payment Tokenization',
        token_format: '16-digit surrogate PAN',
        tsp_id: '40010030273',
        use_cases: ['mobile_payment', 'ecommerce', 'recurring']
    },
    mastercard_digital_enablement: {
        id: 'mastercard_mdes',
        name: 'Mastercard Digital Enablement Service (MDES)',
        network: 'Mastercard',
        standard: 'EMVCo Payment Tokenization',
        token_format: '16-digit surrogate PAN',
        tsp_id: '50110030273',
        use_cases: ['mobile_payment', 'ecommerce', 'recurring']
    },
    amex_token_service: {
        id: 'amex_token',
        name: 'American Express Token Service',
        network: 'American Express',
        standard: 'EMVCo Payment Tokenization',
        token_format: '15-digit surrogate PAN',
        use_cases: ['mobile_payment', 'ecommerce']
    },
    discover_token_service: {
        id: 'discover_token',
        name: 'Discover Token Service',
        network: 'Discover',
        standard: 'EMVCo Payment Tokenization',
        token_format: '16-digit surrogate PAN',
        use_cases: ['mobile_payment', 'ecommerce']
    },
    jcb_token_service: {
        id: 'jcb_token',
        name: 'JCB Token Service',
        network: 'JCB',
        standard: 'EMVCo Payment Tokenization',
        token_format: '16-digit surrogate PAN',
        use_cases: ['mobile_payment', 'ecommerce']
    },
    unionpay_token_service: {
        id: 'unionpay_token',
        name: 'UnionPay Token Service',
        network: 'China UnionPay',
        standard: 'EMVCo Payment Tokenization',
        token_format: '16-digit surrogate PAN',
        use_cases: ['mobile_payment', 'ecommerce', 'qr_code']
    }
};

/**
 * Token Requestor IDs (assigned by card networks)
 * Used to identify who requested the token
 */
export const TOKEN_REQUESTOR_TYPES = {
    wallet_provider: 'Wallet Provider (Apple Pay, Google Pay, Samsung Pay)',
    merchant: 'Merchant (Direct tokenization)',
    payment_gateway: 'Payment Gateway/PSP',
    acquirer: 'Acquirer/Processor',
    tsp: 'Token Service Provider'
};

/**
 * EMVCo Token Domains
 */
export const EMVCO_TOKEN_DOMAINS = {
    '01': 'Mobile NFC',
    '02': 'E-commerce',
    '03': 'In-app',
    '04': 'Merchant Token',
    '05': 'Device Token',
    '06': 'Installment/Recurring'
};

/**
 * Check if card network supports EMVCo tokenization
 */
export const supportsEMVCoTokenization = (cardNetwork) => {
    const supportedNetworks = Object.keys(EMVCO_TOKEN_SERVICES).map(
        key => EMVCO_TOKEN_SERVICES[key].network.toLowerCase()
    );
    return supportedNetworks.includes(cardNetwork.toLowerCase());
};

/**
 * Get Token Service Provider for card network
 */
export const getTokenServiceProvider = (cardNetwork) => {
    const serviceKey = Object.keys(EMVCO_TOKEN_SERVICES).find(
        key => EMVCO_TOKEN_SERVICES[key].network.toLowerCase() === cardNetwork.toLowerCase()
    );
    return serviceKey ? EMVCO_TOKEN_SERVICES[serviceKey] : null;
};

/**
 * Validate EMVCo token format
 */
export const validateTokenFormat = (token, cardNetwork) => {
    const tsp = getTokenServiceProvider(cardNetwork);
    if (!tsp) return false;

    const expectedLength = tsp.token_format.includes('15') ? 15 : 16;
    return token.length === expectedLength && /^\d+$/.test(token);
};