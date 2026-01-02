// Comprehensive Global Payment Methods Registry
// Organized by: Global → Region → Country
//
// HOW TO ADD NEW PAYMENT METHODS:
// 1. For Global methods: Add to GLOBAL_PAYMENT_METHODS.global array
// 2. For Regional methods: Add to regions[RegionName].regional array
// 3. For Country-specific: Add to regions[RegionName].countries[CountryCode] array
//
// Format for each method:
// { id: 'unique_id', name: 'Display Name', category: 'category_key', logo: 'url' (optional), countries: ['US', 'CA'] (optional) }
//
// Categories: card_network, wallet, bank_transfer, crypto, bnpl, apm, cash_voucher, mobile_money, qr_code

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
                    { id: 'open_banking_uk', name: 'Open Banking UK', category: 'bank_transfer' },
                ],
                'DE': [
                    { id: 'paydirekt', name: 'Paydirekt', category: 'wallet' },
                    { id: 'bluecode', name: 'Blue Code', category: 'wallet' },
                ],
                'FR': [
                    { id: 'carte_bancaire', name: 'Carte Bancaire', category: 'card_network' },
                    { id: 'lydia', name: 'Lydia', category: 'wallet' },
                    { id: 'paylib', name: 'Paylib', category: 'wallet' },
                ],
                'NL': [
                    { id: 'ing_homepay', name: 'ING Home\'Pay', category: 'bank_transfer' },
                ],
                'IT': [
                    { id: 'mybank', name: 'MyBank', category: 'bank_transfer' },
                    { id: 'postepay', name: 'Postepay', category: 'wallet' },
                    { id: 'satispay', name: 'Satispay', category: 'wallet' },
                ],
                'ES': [
                    { id: 'bizum', name: 'Bizum', category: 'wallet' },
                    { id: 'redsys', name: 'Redsys', category: 'apm' },
                ],
                'BE': [
                    { id: 'payconiq', name: 'Payconiq', category: 'wallet' },
                ],
                'PL': [
                    { id: 'blik', name: 'BLIK', category: 'wallet' },
                    { id: 'dotpay', name: 'Dotpay', category: 'apm' },
                ],
                'SE': [
                    { id: 'bankgirot', name: 'Bankgirot', category: 'bank_transfer' },
                ],
                'NO': [
                    { id: 'bank_axept', name: 'BankAxept', category: 'card_network' },
                ],
                'DK': [
                    { id: 'dankort', name: 'Dankort', category: 'card_network' },
                ],
                'CH': [
                    { id: 'twint', name: 'TWINT', category: 'wallet' },
                    { id: 'postfinance', name: 'PostFinance', category: 'bank_transfer' },
                ],
                'AT': [
                    { id: 'bluecode_at', name: 'Blue Code Austria', category: 'wallet' },
                ],
                'CZ': [
                    { id: 'csob', name: 'ČSOB', category: 'bank_transfer' },
                ],
                'HU': [
                    { id: 'otp', name: 'OTP Bank', category: 'bank_transfer' },
                ],
                'RO': [
                    { id: 'netopia', name: 'Netopia', category: 'apm' },
                ],
                'GR': [
                    { id: 'viva_wallet', name: 'Viva Wallet', category: 'wallet' },
                ],
                'PT': [
                    { id: 'mbway', name: 'MB WAY', category: 'wallet' },
                ],
                'IE': [
                    { id: 'revolut_ie', name: 'Revolut Ireland', category: 'wallet' },
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
                    { id: 'tenpay', name: 'Tenpay', category: 'wallet' },
                ],
                'IN': [
                    { id: 'upi', name: 'UPI', category: 'bank_transfer' },
                    { id: 'paytm', name: 'Paytm', category: 'wallet' },
                    { id: 'phonepe', name: 'PhonePe', category: 'wallet' },
                    { id: 'gpay_india', name: 'Google Pay India', category: 'wallet' },
                    { id: 'rupay', name: 'RuPay', category: 'card_network' },
                    { id: 'netbanking', name: 'Net Banking', category: 'bank_transfer' },
                    { id: 'mobikwik', name: 'MobiKwik', category: 'wallet' },
                    { id: 'freecharge', name: 'FreeCharge', category: 'wallet' },
                    { id: 'amazonpay_india', name: 'Amazon Pay India', category: 'wallet' },
                ],
                'JP': [
                    { id: 'konbini', name: 'Konbini', category: 'cash_voucher' },
                    { id: 'line_pay', name: 'LINE Pay', category: 'wallet' },
                    { id: 'paypay', name: 'PayPay', category: 'wallet' },
                    { id: 'rakuten_pay', name: 'Rakuten Pay', category: 'wallet' },
                    { id: 'au_pay', name: 'au PAY', category: 'wallet' },
                    { id: 'd_payment', name: 'd Payment', category: 'wallet' },
                    { id: 'merpay', name: 'Merpay', category: 'wallet' },
                ],
                'KR': [
                    { id: 'kakaopay', name: 'KakaoPay', category: 'wallet' },
                    { id: 'naver_pay', name: 'Naver Pay', category: 'wallet' },
                    { id: 'toss', name: 'Toss', category: 'wallet' },
                    { id: 'payco', name: 'PAYCO', category: 'wallet' },
                    { id: 'samsung_pay', name: 'Samsung Pay', category: 'wallet' },
                ],
                'SG': [
                    { id: 'grabpay', name: 'GrabPay', category: 'wallet' },
                    { id: 'paynow', name: 'PayNow', category: 'bank_transfer' },
                    { id: 'nets', name: 'NETS', category: 'card_network' },
                ],
                'MY': [
                    { id: 'fpx', name: 'FPX', category: 'bank_transfer' },
                    { id: 'tng', name: 'Touch \'n Go eWallet', category: 'wallet' },
                    { id: 'boost', name: 'Boost', category: 'wallet' },
                    { id: 'grabpay_my', name: 'GrabPay Malaysia', category: 'wallet' },
                    { id: 'maybank2u', name: 'Maybank2u', category: 'bank_transfer' },
                ],
                'TH': [
                    { id: 'promptpay', name: 'PromptPay', category: 'bank_transfer' },
                    { id: 'truemoney', name: 'TrueMoney', category: 'wallet' },
                    { id: 'rabbit_line_pay', name: 'Rabbit LINE Pay', category: 'wallet' },
                    { id: 'shopeepay_th', name: 'ShopeePay Thailand', category: 'wallet' },
                ],
                'PH': [
                    { id: 'gcash', name: 'GCash', category: 'wallet' },
                    { id: 'paymaya', name: 'Maya (PayMaya)', category: 'wallet' },
                    { id: 'dragonpay', name: 'Dragonpay', category: 'apm' },
                    { id: 'coins_ph', name: 'Coins.ph', category: 'wallet' },
                    { id: 'grabpay_ph', name: 'GrabPay Philippines', category: 'wallet' },
                ],
                'ID': [
                    { id: 'gopay', name: 'GoPay', category: 'wallet' },
                    { id: 'ovo', name: 'OVO', category: 'wallet' },
                    { id: 'dana', name: 'DANA', category: 'wallet' },
                    { id: 'shopeepay_id', name: 'ShopeePay Indonesia', category: 'wallet' },
                    { id: 'linkaja', name: 'LinkAja', category: 'wallet' },
                ],
                'VN': [
                    { id: 'momo', name: 'MoMo', category: 'wallet' },
                    { id: 'zalopay', name: 'ZaloPay', category: 'wallet' },
                    { id: 'vnpay', name: 'VNPay', category: 'wallet' },
                    { id: 'shopeepay_vn', name: 'ShopeePay Vietnam', category: 'wallet' },
                ],
                'AU': [
                    { id: 'poli', name: 'POLi', category: 'bank_transfer' },
                    { id: 'bpay', name: 'BPAY', category: 'bank_transfer' },
                    { id: 'eftpos', name: 'EFTPOS', category: 'card_network' },
                ],
                'NZ': [
                    { id: 'poli_nz', name: 'POLi NZ', category: 'bank_transfer' },
                    { id: 'eftpos_nz', name: 'EFTPOS NZ', category: 'card_network' },
                ],
                'HK': [
                    { id: 'fps', name: 'FPS (Faster Payment System)', category: 'bank_transfer' },
                    { id: 'alipay_hk', name: 'AlipayHK', category: 'wallet' },
                    { id: 'wechat_pay_hk', name: 'WeChat Pay HK', category: 'wallet' },
                    { id: 'octopus', name: 'Octopus', category: 'wallet' },
                ],
                'TW': [
                    { id: 'line_pay_tw', name: 'LINE Pay Taiwan', category: 'wallet' },
                    { id: 'jkopay', name: 'JKoPay', category: 'wallet' },
                ],
                'BD': [
                    { id: 'bkash', name: 'bKash', category: 'mobile_money' },
                    { id: 'nagad', name: 'Nagad', category: 'mobile_money' },
                    { id: 'rocket', name: 'Rocket', category: 'mobile_money' },
                ],
                'PK': [
                    { id: 'easypaisa', name: 'Easypaisa', category: 'mobile_money' },
                    { id: 'jazzcash', name: 'JazzCash', category: 'mobile_money' },
                ],
                'LK': [
                    { id: 'frimi', name: 'frimi', category: 'wallet' },
                ]
            }
        },

        'Latin America': {
            regional: [
                { id: 'pix', name: 'PIX', category: 'bank_transfer', countries: ['BR'] },
                { id: 'mercado_pago', name: 'Mercado Pago', category: 'wallet', countries: ['BR', 'AR', 'MX', 'CL', 'UY', 'CO', 'PE'] },
            ],
            countries: {
                'BR': [
                    { id: 'boleto', name: 'Boleto Bancário', category: 'cash_voucher' },
                    { id: 'picpay', name: 'PicPay', category: 'wallet' },
                    { id: 'elo', name: 'Elo', category: 'card_network' },
                    { id: 'nubank', name: 'Nubank', category: 'wallet' },
                    { id: 'inter', name: 'Banco Inter', category: 'bank_transfer' },
                ],
                'MX': [
                    { id: 'oxxo', name: 'OXXO', category: 'cash_voucher' },
                    { id: 'spei', name: 'SPEI', category: 'bank_transfer' },
                    { id: 'paynet', name: 'Paynet', category: 'cash_voucher' },
                ],
                'AR': [
                    { id: 'pago_facil', name: 'Pago Fácil', category: 'cash_voucher' },
                    { id: 'rapipago', name: 'Rapipago', category: 'cash_voucher' },
                    { id: 'brubank', name: 'Brubank', category: 'wallet' },
                    { id: 'modo', name: 'MODO', category: 'wallet' },
                ],
                'CL': [
                    { id: 'khipu', name: 'Khipu', category: 'bank_transfer' },
                    { id: 'webpay', name: 'Webpay', category: 'apm' },
                    { id: 'servipag', name: 'Servipag', category: 'cash_voucher' },
                ],
                'CO': [
                    { id: 'pse', name: 'PSE', category: 'bank_transfer' },
                    { id: 'efecty', name: 'Efecty', category: 'cash_voucher' },
                    { id: 'nequi', name: 'Nequi', category: 'wallet' },
                    { id: 'daviplata', name: 'Daviplata', category: 'wallet' },
                ],
                'PE': [
                    { id: 'pagoefectivo', name: 'PagoEfectivo', category: 'cash_voucher' },
                    { id: 'yape', name: 'Yape', category: 'wallet' },
                    { id: 'plin', name: 'Plin', category: 'wallet' },
                ],
                'UY': [
                    { id: 'abitab', name: 'Abitab', category: 'cash_voucher' },
                    { id: 'redpagos', name: 'RedPagos', category: 'cash_voucher' },
                ],
                'EC': [
                    { id: 'kushki', name: 'Kushki', category: 'apm' },
                ],
                'VE': [
                    { id: 'pago_movil', name: 'Pago Móvil', category: 'bank_transfer' },
                ],
                'PA': [
                    { id: 'yappy', name: 'Yappy', category: 'wallet' },
                ],
                'GT': [
                    { id: 'banrural', name: 'Banrural', category: 'bank_transfer' },
                ],
                'CR': [
                    { id: 'sinpe', name: 'SINPE', category: 'bank_transfer' },
                ]
            }
        },

        'Middle East & Africa': {
            regional: [],
            countries: {
                'SA': [
                    { id: 'mada', name: 'Mada', category: 'card_network' },
                    { id: 'stc_pay', name: 'STC Pay', category: 'wallet' },
                    { id: 'urpay', name: 'urpay', category: 'wallet' },
                ],
                'AE': [
                    { id: 'naps', name: 'NAPS', category: 'card_network' },
                    { id: 'apple_pay_uae', name: 'Apple Pay UAE', category: 'wallet' },
                    { id: 'payit', name: 'Payit', category: 'wallet' },
                ],
                'EG': [
                    { id: 'fawry', name: 'Fawry', category: 'cash_voucher' },
                    { id: 'aman', name: 'Aman', category: 'cash_voucher' },
                    { id: 'meeza', name: 'Meeza', category: 'card_network' },
                ],
                'IL': [
                    { id: 'bit', name: 'Bit', category: 'wallet' },
                    { id: 'paybox', name: 'Paybox', category: 'wallet' },
                ],
                'KE': [
                    { id: 'mpesa', name: 'M-Pesa', category: 'mobile_money' },
                    { id: 'airtel_money', name: 'Airtel Money', category: 'mobile_money' },
                    { id: 'tkash', name: 'T-Kash', category: 'mobile_money' },
                ],
                'NG': [
                    { id: 'mtn_mobile_money', name: 'MTN Mobile Money', category: 'mobile_money' },
                    { id: 'verve', name: 'Verve', category: 'card_network' },
                    { id: 'paga', name: 'Paga', category: 'mobile_money' },
                    { id: 'opay', name: 'OPay', category: 'wallet' },
                ],
                'ZA': [
                    { id: 'snapscan', name: 'SnapScan', category: 'wallet' },
                    { id: 'zapper', name: 'Zapper', category: 'wallet' },
                    { id: 'masterpass', name: 'Masterpass', category: 'wallet' },
                    { id: 'instant_eft', name: 'Instant EFT', category: 'bank_transfer' },
                ],
                'GH': [
                    { id: 'mtn_ghana', name: 'MTN Mobile Money Ghana', category: 'mobile_money' },
                    { id: 'vodafone_cash', name: 'Vodafone Cash', category: 'mobile_money' },
                ],
                'TZ': [
                    { id: 'mpesa_tanzania', name: 'M-Pesa Tanzania', category: 'mobile_money' },
                    { id: 'tigo_pesa', name: 'Tigo Pesa', category: 'mobile_money' },
                ],
                'UG': [
                    { id: 'mtn_uganda', name: 'MTN Mobile Money Uganda', category: 'mobile_money' },
                    { id: 'airtel_uganda', name: 'Airtel Money Uganda', category: 'mobile_money' },
                ],
                'MA': [
                    { id: 'cmi', name: 'CMI', category: 'card_network' },
                ],
                'TN': [
                    { id: 'edinar', name: 'e-Dinar', category: 'wallet' },
                ],
                'DZ': [
                    { id: 'cib', name: 'CIB', category: 'card_network' },
                ],
                'ET': [
                    { id: 'cbe_birr', name: 'CBE Birr', category: 'mobile_money' },
                ],
                'RW': [
                    { id: 'mtn_rwanda', name: 'MTN Mobile Money Rwanda', category: 'mobile_money' },
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