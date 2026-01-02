// Comprehensive Global Payment Methods Registry
// Organized by: Global → Region → Country

export const GLOBAL_PAYMENT_METHODS = {
    // Always available globally
    global: [
        { id: 'visa', name: 'Visa', category: 'card_network', logo: 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/visa.svg' },
        { id: 'mastercard', name: 'Mastercard', category: 'card_network', logo: 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/mastercard.svg' },
        { id: 'amex', name: 'American Express', category: 'card_network', logo: 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/amex.svg' },
        { id: 'discover', name: 'Discover', category: 'card_network', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg' },
        { id: 'jcb', name: 'JCB', category: 'card_network', logo: 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/jcb.svg' },
        { id: 'diners_club', name: 'Diners Club', category: 'card_network', logo: 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/diners.svg' },
        { id: 'paypal', name: 'PayPal', category: 'wallet', logo: 'https://raw.githubusercontent.com/mpay24/payment-logos/master/svg/color/paypal.svg' },
        { id: 'apple_pay', name: 'Apple Pay', category: 'wallet', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg' },
        { id: 'google_pay', name: 'Google Pay', category: 'wallet', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
        { id: 'bitcoin', name: 'Bitcoin', category: 'crypto', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg' },
        { id: 'ethereum', name: 'Ethereum', category: 'crypto', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
        { id: 'usdt', name: 'Tether (USDT)', category: 'crypto', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
        { id: 'usdc', name: 'USD Coin', category: 'crypto', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg' },
    ],

    // Regional payment methods
    regions: {
        'North America': {
            regional: [
                { id: 'ach', name: 'ACH Bank Transfer', category: 'bank_transfer', countries: ['US', 'CA'] },
                { id: 'interac', name: 'Interac', category: 'bank_transfer', countries: ['CA'] },
                { id: 'venmo', name: 'Venmo', category: 'wallet', countries: ['US'] },
                { id: 'cash_app', name: 'Cash App', category: 'wallet', countries: ['US'] },
                { id: 'affirm', name: 'Affirm', category: 'bnpl', countries: ['US', 'CA'] },
                { id: 'klarna', name: 'Klarna', category: 'bnpl', countries: ['US', 'CA'] },
                { id: 'afterpay', name: 'Afterpay', category: 'bnpl', countries: ['US', 'CA'] },
                { id: 'sezzle', name: 'Sezzle', category: 'bnpl', countries: ['US', 'CA'] },
            ],
            countries: {
                'US': [
                    { id: 'zelle', name: 'Zelle', category: 'bank_transfer' },
                    { id: 'amazon_pay', name: 'Amazon Pay', category: 'wallet' },
                ],
                'CA': [
                    { id: 'interac_etransfer', name: 'Interac e-Transfer', category: 'bank_transfer' },
                ],
                'MX': [
                    { id: 'oxxo', name: 'OXXO', category: 'cash_voucher' },
                    { id: 'spei', name: 'SPEI', category: 'bank_transfer' },
                ]
            }
        },

        'Europe': {
            regional: [
                { id: 'sepa', name: 'SEPA', category: 'bank_transfer', countries: ['EU'] },
                { id: 'ideal', name: 'iDEAL', category: 'apm', countries: ['NL'] },
                { id: 'sofort', name: 'Sofort', category: 'apm', countries: ['DE', 'AT', 'CH'] },
                { id: 'giropay', name: 'Giropay', category: 'apm', countries: ['DE'] },
                { id: 'bancontact', name: 'Bancontact', category: 'apm', countries: ['BE'] },
                { id: 'eps', name: 'EPS', category: 'apm', countries: ['AT'] },
                { id: 'przelewy24', name: 'Przelewy24', category: 'apm', countries: ['PL'] },
                { id: 'multibanco', name: 'Multibanco', category: 'apm', countries: ['PT'] },
                { id: 'trustly', name: 'Trustly', category: 'bank_transfer', countries: ['SE', 'NO', 'FI', 'DK'] },
                { id: 'swish', name: 'Swish', category: 'wallet', countries: ['SE'] },
                { id: 'vipps', name: 'Vipps', category: 'wallet', countries: ['NO'] },
                { id: 'mobilepay', name: 'MobilePay', category: 'wallet', countries: ['DK', 'FI'] },
            ],
            countries: {
                'GB': [
                    { id: 'faster_payments', name: 'Faster Payments', category: 'bank_transfer' },
                    { id: 'bacs', name: 'BACS', category: 'bank_transfer' },
                ],
                'DE': [
                    { id: 'paydirekt', name: 'Paydirekt', category: 'wallet' },
                ],
                'FR': [
                    { id: 'carte_bancaire', name: 'Carte Bancaire', category: 'card_network' },
                ],
                'NL': [
                    { id: 'ing_homepay', name: 'ING Home\'Pay', category: 'bank_transfer' },
                ],
                'IT': [
                    { id: 'mybank', name: 'MyBank', category: 'bank_transfer' },
                    { id: 'postepay', name: 'Postepay', category: 'wallet' },
                ]
            }
        },

        'Asia Pacific': {
            regional: [
                { id: 'unionpay', name: 'UnionPay', category: 'card_network', countries: ['CN', 'HK', 'SG'] },
                { id: 'alipay', name: 'Alipay', category: 'wallet', countries: ['CN', 'HK', 'SG'] },
                { id: 'wechat_pay', name: 'WeChat Pay', category: 'wallet', countries: ['CN', 'HK', 'SG'] },
            ],
            countries: {
                'CN': [
                    { id: 'alipay_cn', name: 'Alipay China', category: 'wallet' },
                    { id: 'wechat_cn', name: 'WeChat Pay China', category: 'wallet' },
                    { id: 'unionpay_qr', name: 'UnionPay QR', category: 'qr_code' },
                ],
                'IN': [
                    { id: 'upi', name: 'UPI', category: 'bank_transfer' },
                    { id: 'paytm', name: 'Paytm', category: 'wallet' },
                    { id: 'phonepe', name: 'PhonePe', category: 'wallet' },
                    { id: 'gpay_india', name: 'Google Pay India', category: 'wallet' },
                    { id: 'rupay', name: 'RuPay', category: 'card_network' },
                    { id: 'netbanking', name: 'Net Banking', category: 'bank_transfer' },
                ],
                'JP': [
                    { id: 'konbini', name: 'Konbini', category: 'cash_voucher' },
                    { id: 'line_pay', name: 'LINE Pay', category: 'wallet' },
                    { id: 'paypay', name: 'PayPay', category: 'wallet' },
                    { id: 'rakuten_pay', name: 'Rakuten Pay', category: 'wallet' },
                ],
                'KR': [
                    { id: 'kakaopay', name: 'KakaoPay', category: 'wallet' },
                    { id: 'naver_pay', name: 'Naver Pay', category: 'wallet' },
                    { id: 'toss', name: 'Toss', category: 'wallet' },
                ],
                'SG': [
                    { id: 'grabpay', name: 'GrabPay', category: 'wallet' },
                    { id: 'paynow', name: 'PayNow', category: 'bank_transfer' },
                ],
                'MY': [
                    { id: 'fpx', name: 'FPX', category: 'bank_transfer' },
                    { id: 'tng', name: 'Touch \'n Go eWallet', category: 'wallet' },
                    { id: 'boost', name: 'Boost', category: 'wallet' },
                ],
                'TH': [
                    { id: 'promptpay', name: 'PromptPay', category: 'bank_transfer' },
                    { id: 'truemoney', name: 'TrueMoney', category: 'wallet' },
                ],
                'PH': [
                    { id: 'gcash', name: 'GCash', category: 'wallet' },
                    { id: 'paymaya', name: 'Maya (PayMaya)', category: 'wallet' },
                    { id: 'dragonpay', name: 'Dragonpay', category: 'apm' },
                ],
                'ID': [
                    { id: 'gopay', name: 'GoPay', category: 'wallet' },
                    { id: 'ovo', name: 'OVO', category: 'wallet' },
                    { id: 'dana', name: 'DANA', category: 'wallet' },
                ],
                'VN': [
                    { id: 'momo', name: 'MoMo', category: 'wallet' },
                    { id: 'zalopay', name: 'ZaloPay', category: 'wallet' },
                ],
                'AU': [
                    { id: 'poli', name: 'POLi', category: 'bank_transfer' },
                    { id: 'bpay', name: 'BPAY', category: 'bank_transfer' },
                ],
                'NZ': [
                    { id: 'poli_nz', name: 'POLi NZ', category: 'bank_transfer' },
                ]
            }
        },

        'Latin America': {
            regional: [
                { id: 'pix', name: 'PIX', category: 'bank_transfer', countries: ['BR'] },
                { id: 'mercado_pago', name: 'Mercado Pago', category: 'wallet', countries: ['BR', 'AR', 'MX', 'CL'] },
            ],
            countries: {
                'BR': [
                    { id: 'boleto', name: 'Boleto Bancário', category: 'cash_voucher' },
                    { id: 'picpay', name: 'PicPay', category: 'wallet' },
                    { id: 'elo', name: 'Elo', category: 'card_network' },
                ],
                'AR': [
                    { id: 'pago_facil', name: 'Pago Fácil', category: 'cash_voucher' },
                    { id: 'rapipago', name: 'Rapipago', category: 'cash_voucher' },
                ],
                'CL': [
                    { id: 'khipu', name: 'Khipu', category: 'bank_transfer' },
                    { id: 'webpay', name: 'Webpay', category: 'apm' },
                ],
                'CO': [
                    { id: 'pse', name: 'PSE', category: 'bank_transfer' },
                    { id: 'efecty', name: 'Efecty', category: 'cash_voucher' },
                ],
                'PE': [
                    { id: 'pagoefectivo', name: 'PagoEfectivo', category: 'cash_voucher' },
                ]
            }
        },

        'Middle East & Africa': {
            regional: [],
            countries: {
                'SA': [
                    { id: 'mada', name: 'Mada', category: 'card_network' },
                    { id: 'stc_pay', name: 'STC Pay', category: 'wallet' },
                ],
                'AE': [
                    { id: 'naps', name: 'NAPS', category: 'card_network' },
                    { id: 'apple_pay_uae', name: 'Apple Pay UAE', category: 'wallet' },
                ],
                'EG': [
                    { id: 'fawry', name: 'Fawry', category: 'cash_voucher' },
                ],
                'KE': [
                    { id: 'mpesa', name: 'M-Pesa', category: 'mobile_money' },
                    { id: 'airtel_money', name: 'Airtel Money', category: 'mobile_money' },
                ],
                'NG': [
                    { id: 'mtn_mobile_money', name: 'MTN Mobile Money', category: 'mobile_money' },
                    { id: 'verve', name: 'Verve', category: 'card_network' },
                ],
                'ZA': [
                    { id: 'snapscan', name: 'SnapScan', category: 'wallet' },
                    { id: 'zapper', name: 'Zapper', category: 'wallet' },
                ],
                'GH': [
                    { id: 'mtn_ghana', name: 'MTN Mobile Money Ghana', category: 'mobile_money' },
                ]
            }
        },

        'Russia & CIS': {
            regional: [
                { id: 'mir', name: 'Mir', category: 'card_network', countries: ['RU'] },
                { id: 'qiwi', name: 'QIWI', category: 'wallet', countries: ['RU', 'KZ'] },
                { id: 'yandex_money', name: 'YooMoney (Yandex.Money)', category: 'wallet', countries: ['RU'] },
            ],
            countries: {
                'RU': [
                    { id: 'sbp', name: 'SBP (Faster Payments)', category: 'bank_transfer' },
                    { id: 'webmoney', name: 'WebMoney', category: 'wallet' },
                ]
            }
        }
    }
};

export const PAYMENT_CATEGORIES = {
    card_network: { label: 'Card Networks', icon: '💳' },
    wallet: { label: 'Digital Wallets', icon: '👛' },
    bank_transfer: { label: 'Bank Transfers', icon: '🏦' },
    crypto: { label: 'Cryptocurrencies', icon: '₿' },
    bnpl: { label: 'Buy Now Pay Later', icon: '💰' },
    apm: { label: 'Alternative Payment Methods', icon: '🔄' },
    cash_voucher: { label: 'Cash & Vouchers', icon: '🎫' },
    mobile_money: { label: 'Mobile Money', icon: '📱' },
    qr_code: { label: 'QR Code Payments', icon: '📲' }
};

export function getAllPaymentMethods() {
    const all = [...GLOBAL_PAYMENT_METHODS.global];
    
    Object.values(GLOBAL_PAYMENT_METHODS.regions).forEach(region => {
        all.push(...region.regional);
        Object.values(region.countries).forEach(countryMethods => {
            all.push(...countryMethods);
        });
    });
    
    return all;
}

export function getPaymentMethodsByRegion(regionName) {
    const region = GLOBAL_PAYMENT_METHODS.regions[regionName];
    if (!region) return [];
    return [...GLOBAL_PAYMENT_METHODS.global, ...region.regional];
}

export function getPaymentMethodsByCountry(regionName, countryCode) {
    const region = GLOBAL_PAYMENT_METHODS.regions[regionName];
    if (!region || !region.countries[countryCode]) return [];
    return [...GLOBAL_PAYMENT_METHODS.global, ...region.regional, ...region.countries[countryCode]];
}