import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Validates transaction before processing
 * Checks merchant limits, payment method support, amounts, etc.
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { 
            merchant_id, 
            psp_code, 
            amount, 
            currency, 
            payment_method,
            customer_email,
            customer_country
        } = await req.json();

        if (!merchant_id || !psp_code) {
            return Response.json({ 
                valid: false, 
                errors: ['merchant_id and psp_code required'] 
            }, { status: 400 });
        }

        const errors = [];
        const warnings = [];

        // 1. Validate merchant exists and is active
        const merchants = await base44.asServiceRole.entities.Merchant.filter({
            id: merchant_id,
            psp_code: psp_code
        });

        if (!merchants || merchants.length === 0) {
            return Response.json({ 
                valid: false, 
                errors: ['Merchant not found'] 
            }, { status: 404 });
        }

        const merchant = merchants[0];

        if (merchant.status !== 'active') {
            errors.push(`Merchant status is ${merchant.status}, must be active`);
        }

        if (merchant.risk_level === 'high' && merchant.aml_status === 'flagged') {
            errors.push('Merchant is flagged for AML concerns');
        }

        // 2. Validate amount
        if (!amount || amount <= 0) {
            errors.push('Amount must be greater than 0');
        }

        if (merchant.processing_volume && amount > merchant.processing_volume) {
            errors.push(`Amount exceeds merchant limit of ${merchant.processing_volume}`);
        }

        // 3. Check daily/monthly volume limits
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = today.substring(0, 7);

        const dailyTransactions = await base44.asServiceRole.entities.Transaction.filter({
            merchant_id: merchant_id,
            psp_code: psp_code,
            status: 'approved'
        });

        const dailyVolume = dailyTransactions
            .filter(t => t.created_date?.startsWith(today))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyVolume = dailyTransactions
            .filter(t => t.created_date?.startsWith(thisMonth))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        // Check if adding this transaction would exceed limits
        if (merchant.daily_limit && (dailyVolume + amount) > merchant.daily_limit) {
            errors.push(`Daily volume limit exceeded. Current: ${dailyVolume}, Limit: ${merchant.daily_limit}`);
        }

        // 4. Validate currency
        if (!currency || currency.length !== 3) {
            errors.push('Valid ISO 4217 currency code required');
        }

        if (merchant.currency && currency !== merchant.currency) {
            warnings.push(`Currency mismatch: transaction in ${currency}, merchant base is ${merchant.currency}`);
        }

        // 5. Validate payment method
        const checkoutConfig = await base44.asServiceRole.entities.MerchantCheckoutConfig.filter({
            merchant_id: merchant_id,
            psp_code: psp_code
        });

        if (checkoutConfig && checkoutConfig.length > 0) {
            const config = checkoutConfig[0];
            if (!config.accepted_payment_methods?.includes(payment_method)) {
                errors.push(`Payment method '${payment_method}' not accepted. Allowed: ${config.accepted_payment_methods?.join(', ')}`);
            }
            if (!config.allowed_currencies?.includes(currency)) {
                errors.push(`Currency '${currency}' not supported. Allowed: ${config.allowed_currencies?.join(', ')}`);
            }
        }

        // 6. Validate customer data
        if (!customer_email || !customer_email.includes('@')) {
            errors.push('Valid customer email required');
        }

        // 7. Geographic checks
        if (customer_country && merchant.country && customer_country !== merchant.country) {
            warnings.push('Cross-border transaction detected');
        }

        // 8. Check merchant KYB/AML status
        if (merchant.kyb_status !== 'approved') {
            warnings.push(`KYB status is ${merchant.kyb_status}, consider extra verification`);
        }

        if (merchant.aml_status === 'monitoring') {
            warnings.push('Merchant under AML monitoring');
        }

        const valid = errors.length === 0;

        return Response.json({
            valid,
            merchant_id,
            errors: valid ? [] : errors,
            warnings,
            merchant_status: merchant.status,
            merchant_risk_level: merchant.risk_level,
            daily_volume_current: dailyVolume,
            daily_volume_limit: merchant.daily_limit,
            monthly_volume_current: monthlyVolume
        });

    } catch (error) {
        console.error('Validation error:', error);
        return Response.json({ 
            valid: false, 
            errors: [error.message] 
        }, { status: 500 });
    }
});