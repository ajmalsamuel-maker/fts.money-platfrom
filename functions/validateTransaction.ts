import { queryOne, query, closeConnection } from './db/postgresClient.js';

/**
 * Validates transaction before processing
 * Checks merchant limits, payment method support, amounts, etc.
 */
Deno.serve(async (req) => {
    try {
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
        const merchant = await queryOne(
            `SELECT * FROM merchant WHERE id = $1 AND psp_code = $2`,
            [merchant_id, psp_code]
        );

        if (!merchant) {
            await closeConnection();
            return Response.json({ 
                valid: false, 
                errors: ['Merchant not found'] 
            }, { status: 404 });
        }

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

        const dailyTransactions = await query(
            `SELECT amount FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND status = 'approved' AND DATE(created_date) = $3`,
            [merchant_id, psp_code, today]
        );

        const monthlyTransactions = await query(
            `SELECT amount FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND status = 'approved' AND DATE_TRUNC('month', created_date)::DATE = $3`,
            [merchant_id, psp_code, thisMonth + '-01']
        );

        const dailyVolume = dailyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const monthlyVolume = monthlyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

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
        const config = await queryOne(
            `SELECT accepted_payment_methods, allowed_currencies FROM merchant_checkout_config WHERE merchant_id = $1 AND psp_code = $2`,
            [merchant_id, psp_code]
        );

        if (config) {
            const acceptedMethods = config.accepted_payment_methods || [];
            const allowedCurrencies = config.allowed_currencies || [];
            
            if (!acceptedMethods.includes(payment_method)) {
                errors.push(`Payment method '${payment_method}' not accepted. Allowed: ${acceptedMethods.join(', ')}`);
            }
            if (!allowedCurrencies.includes(currency)) {
                errors.push(`Currency '${currency}' not supported. Allowed: ${allowedCurrencies.join(', ')}`);
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

        await closeConnection();

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
        await closeConnection();
        console.error('Validation error:', error);
        return Response.json({ 
            valid: false, 
            errors: [error.message] 
        }, { status: 500 });
    }
});