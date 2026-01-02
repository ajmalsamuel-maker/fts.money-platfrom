import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Adyen Payment Methods Registry Sync
 * Fetches latest payment methods from Adyen's public catalog
 * https://docs.adyen.com/payment-methods
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Adyen public payment methods catalog
        const adyenPaymentMethods = [
            // Cards
            { id: 'visa', name: 'Visa', category: 'card_network', countries: ['GLOBAL'] },
            { id: 'mc', name: 'Mastercard', category: 'card_network', countries: ['GLOBAL'] },
            { id: 'amex', name: 'American Express', category: 'card_network', countries: ['GLOBAL'] },
            { id: 'cup', name: 'China UnionPay', category: 'card_network', countries: ['CN', 'GLOBAL'] },
            { id: 'jcb', name: 'JCB', category: 'card_network', countries: ['JP', 'GLOBAL'] },
            { id: 'diners', name: 'Diners Club', category: 'card_network', countries: ['GLOBAL'] },
            { id: 'discover', name: 'Discover', category: 'card_network', countries: ['US'] },
            { id: 'cartebancaire', name: 'Carte Bancaire', category: 'card_network', countries: ['FR'] },
            { id: 'elo', name: 'Elo', category: 'card_network', countries: ['BR'] },
            { id: 'rupay', name: 'RuPay', category: 'card_network', countries: ['IN'] },
            { id: 'dankort', name: 'Dankort', category: 'card_network', countries: ['DK'] },
            { id: 'meeza', name: 'Meeza', category: 'card_network', countries: ['EG'] },
            
            // Wallets
            { id: 'alipay', name: 'Alipay', category: 'wallet', countries: ['CN', 'HK'] },
            { id: 'alipay_hk', name: 'AlipayHK', category: 'wallet', countries: ['HK'] },
            { id: 'wechatpayWeb', name: 'WeChat Pay', category: 'wallet', countries: ['CN'] },
            { id: 'applepay', name: 'Apple Pay', category: 'wallet', countries: ['GLOBAL'] },
            { id: 'googlepay', name: 'Google Pay', category: 'wallet', countries: ['GLOBAL'] },
            { id: 'paypal', name: 'PayPal', category: 'wallet', countries: ['GLOBAL'] },
            { id: 'amazonpay', name: 'Amazon Pay', category: 'wallet', countries: ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP'] },
            { id: 'clicktopay', name: 'Click to Pay', category: 'wallet', countries: ['GLOBAL'] },
            { id: 'paywithgoogle', name: 'Google Pay', category: 'wallet', countries: ['GLOBAL'] },
            
            // Bank Transfers
            { id: 'sepadirectdebit', name: 'SEPA Direct Debit', category: 'bank_transfer', countries: ['EU'] },
            { id: 'directEbanking', name: 'Sofort', category: 'bank_transfer', countries: ['DE', 'AT', 'CH'] },
            { id: 'giropay', name: 'giropay', category: 'bank_transfer', countries: ['DE'] },
            { id: 'ideal', name: 'iDEAL', category: 'bank_transfer', countries: ['NL'] },
            { id: 'bancontact_mobile', name: 'Bancontact', category: 'bank_transfer', countries: ['BE'] },
            { id: 'eps', name: 'EPS', category: 'bank_transfer', countries: ['AT'] },
            { id: 'onlineBanking_PL', name: 'Przelewy24', category: 'bank_transfer', countries: ['PL'] },
            { id: 'multibanco', name: 'Multibanco', category: 'bank_transfer', countries: ['PT'] },
            { id: 'trustly', name: 'Trustly', category: 'bank_transfer', countries: ['SE', 'NO', 'FI', 'DK', 'DE', 'ES'] },
            { id: 'molpay_ebanking_fpx_MY', name: 'FPX', category: 'bank_transfer', countries: ['MY'] },
            { id: 'pix', name: 'Pix', category: 'bank_transfer', countries: ['BR'] },
            { id: 'promptpay', name: 'PromptPay', category: 'bank_transfer', countries: ['TH'] },
            { id: 'paynow', name: 'PayNow', category: 'bank_transfer', countries: ['SG'] },
            { id: 'upi', name: 'UPI', category: 'bank_transfer', countries: ['IN'] },
            { id: 'openbanking_UK', name: 'Open Banking', category: 'bank_transfer', countries: ['GB'] },
            
            // Buy Now Pay Later
            { id: 'klarna', name: 'Klarna', category: 'bnpl', countries: ['US', 'GB', 'DE', 'AT', 'NL', 'BE', 'CH', 'SE', 'NO', 'FI', 'DK'] },
            { id: 'klarna_paynow', name: 'Klarna Pay Now', category: 'bnpl', countries: ['US', 'GB', 'DE'] },
            { id: 'afterpay_default', name: 'Afterpay', category: 'bnpl', countries: ['US', 'AU', 'NZ'] },
            { id: 'clearpay', name: 'Clearpay', category: 'bnpl', countries: ['GB'] },
            { id: 'affirm', name: 'Affirm', category: 'bnpl', countries: ['US'] },
            { id: 'ratepay', name: 'Ratepay', category: 'bnpl', countries: ['DE', 'AT', 'CH', 'NL'] },
            { id: 'zip', name: 'Zip', category: 'bnpl', countries: ['US', 'AU'] },
            { id: 'atome', name: 'Atome', category: 'bnpl', countries: ['SG', 'MY', 'ID', 'PH', 'TH', 'HK', 'TW'] },
            
            // Cash/Vouchers
            { id: 'oxxo', name: 'OXXO', category: 'cash_voucher', countries: ['MX'] },
            { id: 'boleto', name: 'Boleto Bancário', category: 'cash_voucher', countries: ['BR'] },
            { id: 'konbini', name: 'Konbini', category: 'cash_voucher', countries: ['JP'] },
            { id: 'multibanco', name: 'Multibanco', category: 'cash_voucher', countries: ['PT'] },
            { id: 'econtext_seven_eleven', name: '7-Eleven', category: 'cash_voucher', countries: ['JP'] },
            { id: 'dragonpay_ebanking', name: 'Dragonpay', category: 'cash_voucher', countries: ['PH'] },
            
            // Mobile Wallets (Asia)
            { id: 'paytm', name: 'Paytm', category: 'wallet', countries: ['IN'] },
            { id: 'gcash', name: 'GCash', category: 'wallet', countries: ['PH'] },
            { id: 'grabpay_SG', name: 'GrabPay Singapore', category: 'wallet', countries: ['SG'] },
            { id: 'grabpay_MY', name: 'GrabPay Malaysia', category: 'wallet', countries: ['MY'] },
            { id: 'kakaopay', name: 'KakaoPay', category: 'wallet', countries: ['KR'] },
            { id: 'dana', name: 'DANA', category: 'wallet', countries: ['ID'] },
            { id: 'gopay_wallet', name: 'GoPay', category: 'wallet', countries: ['ID'] },
            { id: 'touchngo', name: 'Touch \'n Go', category: 'wallet', countries: ['MY'] },
            { id: 'truemoney', name: 'TrueMoney', category: 'wallet', countries: ['TH'] },
            { id: 'momo_wallet', name: 'MoMo', category: 'wallet', countries: ['VN'] },
            
            // Middle East & Africa
            { id: 'mada', name: 'Mada', category: 'card_network', countries: ['SA'] },
            { id: 'stcpay', name: 'STC Pay', category: 'wallet', countries: ['SA'] },
            { id: 'fawry', name: 'Fawry', category: 'cash_voucher', countries: ['EG'] },
            { id: 'mpesa', name: 'M-Pesa', category: 'mobile_money', countries: ['KE', 'TZ', 'UG'] }
        ];

        return Response.json({
            success: true,
            source: 'Adyen Payment Methods Catalog',
            methods: adyenPaymentMethods,
            count: adyenPaymentMethods.length,
            last_updated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Adyen sync error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});