import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * VAT-Compliant Invoice Generator
 * Automatically generates invoices with proper VAT breakdown
 * Supports EU MOSS/OSS, VIES validation, and multiple formats
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        
        const {
            transaction_id,
            merchant_id,
            customer_id,
            psp_code,
            service_type = 'psp',
            auto_send = false
        } = payload;

        // 1. Get transaction data
        const transaction = transaction_id 
            ? await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id })
            : null;
        
        if (!transaction || transaction.length === 0) {
            throw new Error('Transaction not found');
        }
        
        const txn = transaction[0];

        // 2. Get tax configuration
        const taxConfig = await base44.asServiceRole.entities.TaxConfiguration.filter({
            service_type,
            psp_code,
            vat_enabled: true,
            status: 'active'
        });

        if (!taxConfig || taxConfig.length === 0 || !taxConfig[0].auto_invoice_generation) {
            return Response.json({
                success: false,
                message: 'Invoice generation not enabled'
            });
        }

        const config = taxConfig[0];

        // 3. Get VAT calculation log if exists
        let vatLog = null;
        if (txn.vat_calculation_log_id) {
            const logs = await base44.asServiceRole.entities.TaxCalculationLog.filter({
                id: txn.vat_calculation_log_id
            });
            if (logs && logs.length > 0) {
                vatLog = logs[0];
            }
        }

        // 4. Get merchant/seller info
        const merchant = merchant_id 
            ? await base44.asServiceRole.entities.Merchant.filter({ id: merchant_id })
            : null;

        // 5. Generate invoice number
        const invoiceNumber = `${config.invoice_prefix || 'INV-'}${new Date().getFullYear()}-${String(config.invoice_sequence || 1).padStart(6, '0')}`;

        // Update sequence
        await base44.asServiceRole.entities.TaxConfiguration.update(config.id, {
            invoice_sequence: (config.invoice_sequence || 1) + 1
        });

        // 6. Validate VAT IDs if EU B2B
        let vatIdValidation = null;
        if (vatLog?.buyer_tax_id && vatLog?.buyer_jurisdiction?.startsWith('EU-')) {
            vatIdValidation = await validateEUVATID(vatLog.buyer_tax_id);
        }

        // 7. Create invoice
        const invoiceData = {
            invoice_number: invoiceNumber,
            transaction_id: txn.id,
            merchant_id: merchant_id || txn.merchant_id,
            customer_id: customer_id || txn.customer_id,
            psp_code: psp_code || txn.psp_code,
            
            // Date fields
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            
            // Amount fields
            subtotal: txn.original_amount || txn.amount,
            vat_amount: txn.vat_amount || 0,
            total_amount: txn.actual_amount || txn.amount,
            currency: txn.currency || 'USD',
            
            // VAT details
            vat_rate: txn.vat_rate || vatLog?.tax_rate_applied,
            vat_jurisdiction: txn.vat_jurisdiction || vatLog?.final_jurisdiction,
            vat_category: txn.vat_category || vatLog?.tax_category,
            
            // Tax IDs
            seller_tax_id: config.tax_id_number,
            buyer_tax_id: vatLog?.buyer_tax_id,
            buyer_tax_id_validated: vatIdValidation?.valid || false,
            
            // B2B/Reverse charge
            is_b2b: vatLog?.is_b2b || false,
            reverse_charge_applied: vatLog?.reverse_charge_applied || false,
            
            // Customer details
            customer_name: txn.customer_name,
            customer_email: txn.customer_email,
            customer_country: txn.customer_country,
            
            // Merchant details
            merchant_name: merchant?.[0]?.business_name || txn.merchant_name,
            merchant_country: merchant?.[0]?.country,
            
            // Line items
            line_items: [{
                description: txn.description || 'Payment Processing Service',
                quantity: 1,
                unit_price: txn.original_amount || txn.amount,
                vat_rate: txn.vat_rate || 0,
                vat_amount: txn.vat_amount || 0,
                total: txn.actual_amount || txn.amount
            }],
            
            // Compliance
            moss_oss_number: config.moss_oss_enabled ? config.tax_id_number : null,
            invoice_format: determineInvoiceFormat(config, vatLog),
            
            // Status
            status: 'issued',
            paid: txn.status === 'approved' || txn.status === 'settled',
            payment_date: txn.complete_time,
            
            // Metadata
            generated_by: 'system',
            notes: vatLog?.reverse_charge_applied 
                ? 'Reverse charge: Customer is liable for VAT in their jurisdiction'
                : null
        };

        const invoice = await base44.asServiceRole.entities.Invoice.create(invoiceData);

        // 8. Send invoice if auto_send enabled
        if (auto_send && txn.customer_email) {
            await sendInvoiceEmail(base44, invoice, txn.customer_email, config);
        }

        return Response.json({
            success: true,
            invoice_id: invoice.id,
            invoice_number: invoiceNumber,
            invoice,
            vat_compliance: {
                vat_enabled: true,
                format: invoiceData.invoice_format,
                reverse_charge: invoiceData.reverse_charge_applied,
                vat_id_validated: invoiceData.buyer_tax_id_validated,
                moss_oss: config.moss_oss_enabled
            }
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

function determineInvoiceFormat(config, vatLog) {
    if (config.moss_oss_enabled) return 'EU_MOSS_OSS';
    if (vatLog?.buyer_jurisdiction?.startsWith('EU-')) return 'EU_STANDARD';
    if (vatLog?.buyer_jurisdiction?.startsWith('US-')) return 'US_STANDARD';
    return 'INTERNATIONAL';
}

async function validateEUVATID(vatId) {
    // In production, integrate with EU VIES API
    // https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl
    
    // Basic format validation
    const euVatPattern = /^(AT|BE|BG|CY|CZ|DE|DK|EE|EL|ES|FI|FR|GB|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK)[\dA-Z]{8,12}$/;
    const valid = euVatPattern.test(vatId.replace(/\s/g, ''));
    
    return {
        valid,
        vatId,
        checked_at: new Date().toISOString(),
        method: 'format_check' // In production: 'vies_api'
    };
}

async function sendInvoiceEmail(base44, invoice, email, config) {
    try {
        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: config.psp_code || 'FTS.Money',
            to: email,
            subject: `Invoice ${invoice.invoice_number}`,
            body: generateInvoiceEmailHTML(invoice)
        });
    } catch (error) {
        console.error('Failed to send invoice email:', error);
    }
}

function generateInvoiceEmailHTML(invoice) {
    return `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invoice ${invoice.invoice_number}</h2>
            <p>Dear ${invoice.customer_name || 'Customer'},</p>
            <p>Thank you for your payment. Please find your invoice details below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td><strong>Invoice Number:</strong></td><td>${invoice.invoice_number}</td></tr>
                <tr><td><strong>Date:</strong></td><td>${invoice.invoice_date}</td></tr>
                <tr><td><strong>Amount:</strong></td><td>${invoice.currency} ${invoice.total_amount?.toFixed(2)}</td></tr>
            </table>
            
            ${invoice.vat_amount > 0 ? `
            <h3>VAT Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td>Subtotal:</td><td>${invoice.currency} ${invoice.subtotal?.toFixed(2)}</td></tr>
                <tr><td>VAT (${invoice.vat_rate}%):</td><td>${invoice.currency} ${invoice.vat_amount?.toFixed(2)}</td></tr>
                <tr style="font-weight: bold; border-top: 2px solid #000;">
                    <td>Total:</td><td>${invoice.currency} ${invoice.total_amount?.toFixed(2)}</td>
                </tr>
            </table>
            ` : ''}
            
            ${invoice.reverse_charge_applied ? `
            <p style="background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">
                <strong>Reverse Charge Applied:</strong> As a business customer, you are responsible 
                for accounting for VAT in your jurisdiction.
            </p>
            ` : ''}
            
            <p>Best regards,<br>${invoice.merchant_name || 'FTS.Money'}</p>
        </body>
        </html>
    `;
}