import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automatic Invoice Trigger
 * Monitors transactions and automatically generates invoices when configured
 * Called as webhook or scheduled task
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        
        const {
            transaction_id,
            trigger_type = 'manual' // 'webhook', 'scheduled', 'manual'
        } = payload;

        // 1. Get transaction
        const transactions = await base44.asServiceRole.entities.Transaction.filter({
            id: transaction_id
        });

        if (!transactions || transactions.length === 0) {
            throw new Error('Transaction not found');
        }

        const transaction = transactions[0];

        // 2. Check if transaction is eligible for invoicing
        const eligibleStatuses = ['approved', 'settled', 'accepted'];
        if (!eligibleStatuses.includes(transaction.status)) {
            return Response.json({
                success: false,
                message: `Transaction status ${transaction.status} not eligible for invoicing`
            });
        }

        // 3. Check if invoice already exists
        const existingInvoices = await base44.asServiceRole.entities.Invoice.filter({
            transaction_id: transaction.id
        });

        if (existingInvoices && existingInvoices.length > 0) {
            return Response.json({
                success: false,
                message: 'Invoice already exists for this transaction',
                existing_invoice_id: existingInvoices[0].id
            });
        }

        // 4. Check if auto-invoice is enabled
        const taxConfigs = await base44.asServiceRole.entities.TaxConfiguration.filter({
            psp_code: transaction.psp_code,
            status: 'active'
        });

        if (!taxConfigs || taxConfigs.length === 0) {
            return Response.json({
                success: false,
                message: 'No tax configuration found'
            });
        }

        const config = taxConfigs[0];
        
        if (!config.auto_invoice_generation) {
            return Response.json({
                success: false,
                message: 'Auto invoice generation not enabled'
            });
        }

        // 5. Generate invoice
        const invoiceResponse = await base44.asServiceRole.functions.invoke('generateVATInvoice', {
            transaction_id: transaction.id,
            merchant_id: transaction.merchant_id,
            psp_code: transaction.psp_code,
            service_type: 'psp',
            auto_send: true // Always send for automatic generation
        });

        return Response.json({
            success: true,
            trigger_type,
            invoice_generated: invoiceResponse.data.success,
            invoice_number: invoiceResponse.data.invoice_number,
            invoice_id: invoiceResponse.data.invoice_id
        });

    } catch (error) {
        console.error('Auto invoice trigger error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});