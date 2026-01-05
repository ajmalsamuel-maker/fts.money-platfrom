import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Enhanced Transaction Processing with VAT
 * Automatically calculates and applies VAT to transactions
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        
        const {
            transaction_data,
            auto_calculate_vat = true,
            service_type = 'psp'
        } = payload;

        // 1. Calculate VAT if enabled
        let vatCalculation = null;
        if (auto_calculate_vat) {
            const vatResponse = await base44.functions.invoke('taxCalculationEngine', {
                amount: transaction_data.amount,
                currency: transaction_data.currency || 'USD',
                psp_code: transaction_data.psp_code,
                merchant_id: transaction_data.merchant_id,
                customer_id: transaction_data.customer_id,
                service_type,
                buyer_country: transaction_data.customer_country,
                buyer_ip: transaction_data.ip_address,
                billing_address: {
                    country: transaction_data.customer_country
                },
                tax_category: transaction_data.tax_category || 'DIGITAL_SERVICES',
                buyer_tax_id: transaction_data.buyer_tax_id,
                is_b2b: transaction_data.is_b2b || false
            });

            if (vatResponse.data.success) {
                vatCalculation = vatResponse.data;
            }
        }

        // 2. Create transaction with VAT data
        const transactionPayload = {
            ...transaction_data,
            // Original amount (before VAT)
            original_amount: transaction_data.amount,
            
            // VAT fields
            vat_amount: vatCalculation?.tax_amount || 0,
            vat_rate: vatCalculation?.tax_rate || 0,
            vat_jurisdiction: vatCalculation?.jurisdiction || null,
            vat_category: vatCalculation?.tax_category || null,
            vat_calculation_log_id: vatCalculation?.calculation_log_id || null,
            
            // Actual amount (with VAT)
            actual_amount: vatCalculation?.gross_amount || transaction_data.amount,
            
            // Update amount field for processing
            amount: vatCalculation?.gross_amount || transaction_data.amount
        };

        // 3. Process transaction (this would call your payment processor)
        const transaction = await base44.asServiceRole.entities.Transaction.create(transactionPayload);

        // 4. Return result with VAT breakdown
        return Response.json({
            success: true,
            transaction_id: transaction.id,
            transaction,
            vat_calculation: vatCalculation ? {
                vat_enabled: true,
                net_amount: vatCalculation.net_amount,
                vat_amount: vatCalculation.tax_amount,
                gross_amount: vatCalculation.gross_amount,
                vat_rate: vatCalculation.tax_rate,
                jurisdiction: vatCalculation.jurisdiction,
                breakdown: vatCalculation.breakdown
            } : {
                vat_enabled: false,
                net_amount: transaction_data.amount,
                vat_amount: 0,
                gross_amount: transaction_data.amount
            }
        });

    } catch (error) {
        console.error('Transaction processing error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});