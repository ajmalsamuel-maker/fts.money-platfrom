import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transaction_id, template_id } = await req.json();

        // Fetch transaction
        const transactions = await base44.entities.Transaction.filter({ transaction_id });
        if (transactions.length === 0) {
            return Response.json({ error: 'Transaction not found' }, { status: 404 });
        }
        const transaction = transactions[0];

        // Fetch merchant
        const merchants = await base44.entities.Merchant.filter({ merchant_id: transaction.merchant_id });
        const merchant = merchants[0];

        // Fetch receipt template
        let template = null;
        if (template_id) {
            const templates = await base44.entities.ReceiptTemplate.filter({ id: template_id });
            template = templates[0];
        } else {
            // Get default template
            const templates = await base44.entities.ReceiptTemplate.filter({ 
                merchant_id: transaction.merchant_id, 
                is_default: true 
            });
            template = templates[0];
        }

        // Generate PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(merchant?.business_name || 'Payment Receipt', pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (template?.show_merchant_details) {
            doc.text(template?.merchant_address || merchant?.address || '', pageWidth / 2, 28, { align: 'center' });
            doc.text(template?.merchant_phone || merchant?.contact_phone || '', pageWidth / 2, 33, { align: 'center' });
            doc.text(template?.merchant_email || merchant?.contact_email || '', pageWidth / 2, 38, { align: 'center' });
        }

        // Line separator
        doc.line(15, 45, pageWidth - 15, 45);

        // Transaction Details
        let yPos = 55;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Transaction Details', 15, yPos);
        
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const details = [
            ['Transaction ID:', transaction.transaction_id],
            ['Date:', new Date(transaction.created_date).toLocaleString()],
            ['Status:', transaction.status.toUpperCase()],
            ['Amount:', `${transaction.currency} ${transaction.amount.toFixed(2)}`],
            ['Payment Method:', `${transaction.card_brand || 'Card'} •••• ${transaction.card_last_four}`],
            ['Authorization Code:', transaction.auth_code || 'N/A']
        ];

        details.forEach(([label, value]) => {
            doc.text(label, 15, yPos);
            doc.text(value, 80, yPos);
            yPos += 7;
        });

        // Customer Details
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Customer Information', 15, yPos);
        
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        if (transaction.customer_name) {
            doc.text('Name:', 15, yPos);
            doc.text(transaction.customer_name, 80, yPos);
            yPos += 7;
        }
        if (transaction.customer_email) {
            doc.text('Email:', 15, yPos);
            doc.text(transaction.customer_email, 80, yPos);
            yPos += 7;
        }

        // Description
        if (transaction.description) {
            yPos += 5;
            doc.setFont('helvetica', 'bold');
            doc.text('Description:', 15, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            const splitDesc = doc.splitTextToSize(transaction.description, pageWidth - 30);
            doc.text(splitDesc, 15, yPos);
            yPos += splitDesc.length * 5;
        }

        // Footer
        yPos = doc.internal.pageSize.height - 30;
        doc.line(15, yPos, pageWidth - 15, yPos);
        yPos += 7;
        doc.setFontSize(9);
        doc.text(
            template?.footer_text || 'Thank you for your business!',
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=receipt-${transaction.transaction_id}.pdf`
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});