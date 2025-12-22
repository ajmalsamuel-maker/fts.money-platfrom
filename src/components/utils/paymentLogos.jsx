// Central Repository for Payment Method & Payout Method Logos
// Used globally across Community Portal, FTS Platform, PSP Portal, Merchant Portal, and Virtual Terminal

export const PAYMENT_METHOD_LOGOS = {
    // Card Networks - Using CDN jsDelivr with payrexx logos
    'visa': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/visa.svg',
    'mastercard': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/mastercard.svg',
    'amex': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/american-express.svg',
    'american_express': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/american-express.svg',
    'discover': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/discover.svg',
    'unionpay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/unionpay.svg',
    'china_union_pay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/unionpay.svg',
    'diners_club': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/diners-club.svg',
    'jcb': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/jcb.svg',
    
    // Digital Wallets & Payment Apps
    'alipay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/alipay.svg',
    'wechat': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/wechat.svg',
    'wechat_pay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/wechat.svg',
    'apple_pay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/apple-pay.svg',
    'google_pay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/google-pay.svg',
    'paypal': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/paypal.svg',
    'venmo': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/venmo.svg',
    'cash_app': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/cash-app.svg',
    'square': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/cash-app.svg',
    
    // Bank Transfer Methods
    'ideal': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/ideal.svg',
    'sofort': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sofort.svg',
    'giropay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/giropay.svg',
    'sepa': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sepa.svg',
    'sepa_debit': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sepa.svg',
    'ach': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sepa.svg',
    'wire': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sepa.svg',
    'bank_transfer': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sepa.svg',
    'faster_payments': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sepa.svg',
    'real_time_payments': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sepa.svg',
    
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
    'afterpay': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/afterpay.svg',
    'klarna': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/klarna.svg',
    'sezzle': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/sezzle.svg',
    
    // Other Methods
    'bancontact': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/bancontact.svg',
    'multibanco': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/multibanco.svg',
    'p24': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/przelewy24.svg',
    'przelewy24': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/przelewy24.svg',
    'eps': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/eps.svg',
    
    // Debit Specific
    'visa_debit': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/visa.svg',
    'mastercard_debit': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/mastercard.svg',
    'debit_card': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/visa.svg',
    'push_to_card': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/visa.svg',
    
    // Generic/Fallback
    'credit_card': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/visa.svg',
    'card': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/visa.svg',
    'wallet': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/paypal.svg',
    'e_wallet': 'https://cdn.jsdelivr.net/gh/payrexx/payment-logos/paypal.svg',
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