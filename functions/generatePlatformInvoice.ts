import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { client_type, client_code, billing_period } = await req.json();

        // Calculate usage and fees for the billing period
        const [year, month] = billing_period.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        let client, transactions, lineItems = [];

        if (client_type === 'psp') {
            // Get PSP details
            const psps = await base44.asServiceRole.entities.ProvisionedPSP.filter({ 
                psp_code: client_code 
            });
            client = psps[0];

            // Get all transactions for PSP merchants
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ 
                psp_code: client_code 
            });
            
            transactions = await base44.asServiceRole.entities.Transaction.filter({
                status: 'completed',
                created_date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
            });

            // Calculate monthly platform fee
            lineItems.push({
                description: 'Monthly Platform Subscription',
                quantity: 1,
                unit_price: client.monthly_fee || 299,
                amount: client.monthly_fee || 299
            });

            // Transaction processing fees
            const txnCount = transactions.length;
            const txnFee = txnCount * 0.05; // $0.05 per transaction
            lineItems.push({
                description: `Transaction Processing (${txnCount} transactions)`,
                quantity: txnCount,
                unit_price: 0.05,
                amount: txnFee
            });

        } else {
            // Merchant billing
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ 
                merchant_code: client_code 
            });
            client = merchants[0];

            transactions = await base44.asServiceRole.entities.Transaction.filter({
                merchant_code: client_code,
                status: 'completed',
                created_date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
            });

            const txnVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const processingFee = txnVolume * 0.029; // 2.9% processing fee

            lineItems.push({
                description: `Payment Processing (${transactions.length} transactions)`,
                quantity: transactions.length,
                unit_price: processingFee / transactions.length,
                amount: processingFee
            });
        }

        // Calculate totals
        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const taxRate = 0.20; // 20% VAT
        const taxAmount = subtotal * taxRate;
        const totalAmount = subtotal + taxAmount;

        // Generate invoice number
        const invoiceNumber = `INV-${client_type.toUpperCase()}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create invoice
        const invoice = await base44.asServiceRole.entities.Invoice.create({
            invoice_number: invoiceNumber,
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            merchant_code: client_type === 'merchant' ? client_code : null,
            psp_code: client_type === 'psp' ? client_code : null,
            customer_name: client.business_name || client.psp_name,
            customer_email: client.email || client.contact_email,
            currency: 'USD',
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: 'sent',
            invoice_type: 'platform_billing',
            billing_period,
            line_items: JSON.stringify(lineItems)
        });

        // Generate PDF invoice
        const pdfUrl = await base44.asServiceRole.functions.invoke('generateVATInvoice', {
            invoice_id: invoice.id
        });

        // Send email notification
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: invoice.customer_email,
            subject: `Invoice ${invoiceNumber} - FTS.Money Platform`,
            body: `
                Dear ${invoice.customer_name},
                
                Your invoice for ${billing_period} is ready.
                
                Invoice Number: ${invoiceNumber}
                Amount Due: $${totalAmount.toFixed(2)}
                Due Date: ${invoice.due_date}
                
                Please log in to your portal to view and pay this invoice.
                
                Best regards,
                FTS.Money Platform
            `
        });

        return Response.json({
            success: true,
            invoice,
            pdf_url: pdfUrl.data
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return Response.json({ 
            error: error.message || 'Failed to generate invoice' 
        }, { status: 500 });
    }
});