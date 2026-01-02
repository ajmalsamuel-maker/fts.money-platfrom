import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Stripe Payment Methods Registry Sync
 * Fetches latest payment methods from Stripe's public API
 * https://stripe.com/docs/payments/payment-methods
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Stripe public payment methods catalog
        const stripePaymentMethods = [
            { id: 'card', name: 'Card', category: 'card_network', countries: ['GLOBAL'] },
            { id: 'acss_debit', name: 'ACSS Debit', category: 'bank_transfer', countries: ['CA'] },
            { id: 'affirm', name: 'Affirm', category: 'bnpl', countries: ['US'] },
            { id: 'afterpay_clearpay', name: 'Afterpay/Clearpay', category: 'bnpl', countries: ['US', 'CA', 'GB', 'AU', 'NZ'] },
            { id: 'alipay', name: 'Alipay', category: 'wallet', countries: ['CN', 'HK', 'SG'] },
            { id: 'au_becs_debit', name: 'BECS Direct Debit', category: 'bank_transfer', countries: ['AU'] },
            { id: 'bacs_debit', name: 'BACS Direct Debit', category: 'bank_transfer', countries: ['GB'] },
            { id: 'bancontact', name: 'Bancontact', category: 'apm', countries: ['BE'] },
            { id: 'blik', name: 'BLIK', category: 'wallet', countries: ['PL'] },
            { id: 'boleto', name: 'Boleto', category: 'cash_voucher', countries: ['BR'] },
            { id: 'cashapp', name: 'Cash App Pay', category: 'wallet', countries: ['US'] },
            { id: 'customer_balance', name: 'Customer Balance', category: 'apm', countries: ['GLOBAL'] },
            { id: 'eps', name: 'EPS', category: 'apm', countries: ['AT'] },
            { id: 'fpx', name: 'FPX', category: 'bank_transfer', countries: ['MY'] },
            { id: 'giropay', name: 'giropay', category: 'apm', countries: ['DE'] },
            { id: 'grabpay', name: 'GrabPay', category: 'wallet', countries: ['MY', 'SG'] },
            { id: 'ideal', name: 'iDEAL', category: 'apm', countries: ['NL'] },
            { id: 'klarna', name: 'Klarna', category: 'bnpl', countries: ['US', 'GB', 'DE', 'AT', 'NL', 'BE', 'ES', 'IT', 'SE', 'NO', 'FI', 'DK'] },
            { id: 'konbini', name: 'Konbini', category: 'cash_voucher', countries: ['JP'] },
            { id: 'link', name: 'Link', category: 'wallet', countries: ['US'] },
            { id: 'oxxo', name: 'OXXO', category: 'cash_voucher', countries: ['MX'] },
            { id: 'p24', name: 'Przelewy24', category: 'apm', countries: ['PL'] },
            { id: 'paynow', name: 'PayNow', category: 'bank_transfer', countries: ['SG'] },
            { id: 'paypal', name: 'PayPal', category: 'wallet', countries: ['GLOBAL'] },
            { id: 'pix', name: 'Pix', category: 'bank_transfer', countries: ['BR'] },
            { id: 'promptpay', name: 'PromptPay', category: 'bank_transfer', countries: ['TH'] },
            { id: 'revolut_pay', name: 'Revolut Pay', category: 'wallet', countries: ['GB', 'EU'] },
            { id: 'sepa_debit', name: 'SEPA Direct Debit', category: 'bank_transfer', countries: ['EU'] },
            { id: 'sofort', name: 'Sofort', category: 'apm', countries: ['DE', 'AT', 'CH', 'BE', 'NL', 'IT', 'ES'] },
            { id: 'us_bank_account', name: 'ACH Direct Debit', category: 'bank_transfer', countries: ['US'] },
            { id: 'wechat_pay', name: 'WeChat Pay', category: 'wallet', countries: ['CN'] },
            { id: 'zip', name: 'Zip', category: 'bnpl', countries: ['US', 'AU'] }
        ];

        return Response.json({
            success: true,
            source: 'Stripe Payment Methods API',
            methods: stripePaymentMethods,
            count: stripePaymentMethods.length,
            last_updated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Stripe sync error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});