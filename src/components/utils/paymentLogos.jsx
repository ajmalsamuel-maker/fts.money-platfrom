// Central Repository for Payment Method & Payout Method Logos
// Used globally across Community Portal, FTS Platform, PSP Portal, Merchant Portal, and Virtual Terminal
// 
// Now supports dynamic fetching from multiple sources:
// - Clearbit, Logo.dev, VectorLogoZone, Google Favicons

import { fetchProviderLogo, getCachedLogo } from './dynamicLogoFetcher';

export const PAYMENT_METHOD_LOGOS = {
    // Card Networks - Using mpay24 logos for cards that exist, fallback for others
    'visa': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/visa.svg',
    'mastercard': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/mastercard.svg',
    'amex': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/amex.svg',
    'american_express': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/amex.svg',
    'discover': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg',
    'unionpay': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg',
    'china_union_pay': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg',
    'diners_club': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/diners.svg',
    'jcb': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/jcb.svg',
    
    // Digital Wallets & Payment Apps
    'alipay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/alipay.svg',
    'wechat': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/wechat_pay.svg',
    'wechat_pay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/wechat_pay.svg',
    'apple_pay': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
    'google_pay': 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
    'paypal': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/paypal.svg',
    'venmo': null, // Logo not available
    'cash_app': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Square_Cash_app_logo.svg',
    'square': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Square_Cash_app_logo.svg',
    
    // Bank Transfer Methods
    'ideal': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/ideal.svg',
    'sofort': null, // Logo not available
    'giropay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/giropay.svg',
    'sepa': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/sepa.svg',
    'sepa_debit': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/sepa.svg',
    'ach': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/sepa.svg',
    'wire': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/sepa.svg',
    'bank_transfer': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/sepa.svg',
    'faster_payments': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/sepa.svg',
    'real_time_payments': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/sepa.svg',
    
    // Cryptocurrencies
    'bitcoin': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
    'btc': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
    'ethereum': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    'eth': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    'usdt': 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    'tether': 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    'usdc': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    'usd_coin': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    'bitcoin_cash': 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg',
    'bch': 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg',
    'litecoin': 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg',
    'ltc': 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg',
    'crypto_currency': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
    
    // Buy Now Pay Later
    'afterpay': null, // Logo not available
    'klarna': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/klarna.svg',
    'sezzle': null, // Logo not available
    
    // Other Methods
    'bancontact': null, // Logo not available
    'multibanco': null, // Logo not available
    'p24': null, // Logo not available
    'przelewy24': null, // Logo not available
    'eps': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/eps.svg',
    
    // Debit Specific
    'visa_debit': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/visa.svg',
    'mastercard_debit': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/mastercard.svg',
    'debit_card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/visa.svg',
    'push_to_card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/visa.svg',
    
    // Generic/Fallback
    'credit_card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/visa.svg',
    'card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/visa.svg',
    'wallet': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/paypal.svg',
    'e_wallet': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/paypal.svg',
};

// Get logo URL for a payment method
export const getPaymentMethodLogo = (methodName) => {
    if (!methodName) return null;
    
    // Normalize the method name
    const normalized = methodName.toLowerCase().replace(/\s+/g, '_');
    
    return PAYMENT_METHOD_LOGOS[normalized] || null;
};

// Get display name for a payment method
export const getPaymentMethodDisplayName = (methodName) => {
    if (!methodName) return '';
    
    return methodName
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Check if a logo exists for a method
export const hasPaymentMethodLogo = (methodName) => {
    return !!getPaymentMethodLogo(methodName);
};

// Get all available payment methods with logos
export const getAllPaymentMethodsWithLogos = () => {
    return Object.keys(PAYMENT_METHOD_LOGOS).map(method => ({
        method,
        displayName: getPaymentMethodDisplayName(method),
        logoUrl: PAYMENT_METHOD_LOGOS[method]
    }));
};

/**
 * Fetch logo dynamically if not in static map
 */
export const getPaymentMethodLogoAsync = async (method) => {
    // Try static first
    const staticLogo = getPaymentMethodLogo(method);
    if (staticLogo) return staticLogo;

    // Fallback to dynamic fetch with caching
    return await getCachedLogo(method);
};

/**
 * Export dynamic fetchers for direct use
 */
export { fetchProviderLogo, getCachedLogo } from './dynamicLogoFetcher';