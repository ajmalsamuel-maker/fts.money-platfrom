import { base44 } from '@/api/base44Client';

/**
 * Client-side VAT Calculator Hook
 * Automatically calculates VAT for transactions
 */

export async function calculateTransactionVAT(transactionData) {
    const {
        amount,
        currency = 'USD',
        psp_code,
        merchant_id,
        customer_id,
        customer_email,
        customer_country,
        ip_address,
        billing_address,
        merchant_category,
        is_b2b = false,
        buyer_tax_id
    } = transactionData;

    // Determine service type from context
    const service_type = psp_code ? 'psp' : 'platform';

    try {
        const response = await base44.functions.invoke('taxCalculationEngine', {
            amount,
            currency,
            psp_code,
            merchant_id,
            customer_id,
            service_type,
            buyer_country: customer_country,
            buyer_ip: ip_address,
            billing_address,
            tax_category: merchant_category || 'DIGITAL_SERVICES',
            buyer_tax_id,
            is_b2b
        });

        if (response.data.success) {
            return {
                vat_enabled: response.data.vat_enabled,
                net_amount: response.data.net_amount,
                vat_amount: response.data.tax_amount,
                gross_amount: response.data.gross_amount,
                vat_rate: response.data.tax_rate,
                vat_jurisdiction: response.data.jurisdiction,
                vat_category: response.data.tax_category,
                calculation_log_id: response.data.calculation_log_id,
                reverse_charge: response.data.reverse_charge || false,
                inclusive_pricing: response.data.inclusive_pricing || false
            };
        }

        // Fallback if VAT not enabled
        return {
            vat_enabled: false,
            net_amount: amount,
            vat_amount: 0,
            gross_amount: amount,
            vat_rate: 0
        };
    } catch (error) {
        console.error('VAT calculation error:', error);
        // Return no VAT on error to not block transaction
        return {
            vat_enabled: false,
            net_amount: amount,
            vat_amount: 0,
            gross_amount: amount,
            vat_rate: 0,
            error: error.message
        };
    }
}

/**
 * React Hook for VAT calculation
 */
export function useVATCalculation() {
    const [calculating, setCalculating] = React.useState(false);
    const [vatData, setVatData] = React.useState(null);

    const calculate = async (transactionData) => {
        setCalculating(true);
        const result = await calculateTransactionVAT(transactionData);
        setVatData(result);
        setCalculating(false);
        return result;
    };

    return { calculate, calculating, vatData };
}

/**
 * Format VAT for display
 */
export function formatVATDisplay(vatData) {
    if (!vatData || !vatData.vat_enabled || vatData.vat_amount === 0) {
        return null;
    }

    return {
        display: `${vatData.vat_rate}% VAT (${vatData.vat_jurisdiction})`,
        amount: `$${vatData.vat_amount.toFixed(2)}`,
        breakdown: {
            net: `$${vatData.net_amount.toFixed(2)}`,
            vat: `$${vatData.vat_amount.toFixed(2)}`,
            total: `$${vatData.gross_amount.toFixed(2)}`
        }
    };
}