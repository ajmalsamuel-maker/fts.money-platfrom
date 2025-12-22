// Central Repository for Payment Method & Payout Method Logos
// Used globally across Community Portal, FTS Platform, PSP Portal, Merchant Portal, and Virtual Terminal

export const PAYMENT_METHOD_LOGOS = {
    // Card Networks - Using GitHub raw content from mpay24/payment-logos
    'visa': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/visa.svg',
    'mastercard': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/mastercard.svg',
    'amex': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/amex.svg',
    'american_express': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/amex.svg',
    'discover': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/discover.svg',
    'unionpay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/unionpay.svg',
    'china_union_pay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/unionpay.svg',
    'diners_club': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/diners.svg',
    'jcb': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/jcb.svg',
    
    // Digital Wallets & Payment Apps
    'alipay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/alipay.svg',
    'wechat': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/wechat_pay.svg',
    'wechat_pay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/wechat_pay.svg',
    'apple_pay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/apple_pay.svg',
    'google_pay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/google_pay.svg',
    'paypal': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/paypal.svg',
    'venmo': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/venmo.svg',
    'cash_app': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/cash_app.svg',
    'square': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/cash_app.svg',
    
    // Bank Transfer Methods
    'ideal': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/ideal.svg',
    'sofort': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sofort.svg',
    'giropay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/giropay.svg',
    'sepa': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sepa.svg',
    'sepa_debit': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sepa.svg',
    'ach': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sepa.svg',
    'wire': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sepa.svg',
    'bank_transfer': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sepa.svg',
    'faster_payments': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sepa.svg',
    'real_time_payments': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sepa.svg',
    
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
    'afterpay': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/afterpay.svg',
    'klarna': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/klarna.svg',
    'sezzle': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/sezzle.svg',
    
    // Other Methods
    'bancontact': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/bancontact.svg',
    'multibanco': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/multibanco.svg',
    'p24': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/przelewy24.svg',
    'przelewy24': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/przelewy24.svg',
    'eps': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/eps.svg',
    
    // Debit Specific
    'visa_debit': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/visa.svg',
    'mastercard_debit': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/mastercard.svg',
    'debit_card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/visa.svg',
    'push_to_card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/visa.svg',
    
    // Generic/Fallback
    'credit_card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/visa.svg',
    'card': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/visa.svg',
    'wallet': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/paypal.svg',
    'e_wallet': 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/paypal.svg',
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