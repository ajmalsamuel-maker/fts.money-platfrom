import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url, format, merchant_code } = await req.json();

        // Fetch file content
        const fileResponse = await fetch(file_url);
        const fileContent = await fileResponse.text();

        let standardizedInvoice;

        // Parse and standardize based on format
        switch (format) {
            case 'ubl':
                standardizedInvoice = await parseUBL(fileContent);
                break;
            case 'json':
                standardizedInvoice = JSON.parse(fileContent);
                break;
            case 'peppol':
                standardizedInvoice = await parsePeppol(fileContent);
                break;
            case 'sap':
                standardizedInvoice = await parseSAP(fileContent);
                break;
            case 'oracle':
                standardizedInvoice = await parseOracle(fileContent);
                break;
            case 'pdf':
                standardizedInvoice = await extractFromPDF(file_url);
                break;
            default:
                throw new Error('Unsupported format');
        }

        // Validate against e-invoicing standards
        const validationResult = await base44.functions.invoke('validateEInvoiceSchema', {
            invoice: standardizedInvoice,
            standard: 'EN16931'
        });

        if (!validationResult.data.valid) {
            return Response.json({
                error: 'Invoice validation failed',
                details: validationResult.data.errors
            }, { status: 400 });
        }

        // Create standardized invoice record
        const invoice = await base44.asServiceRole.entities.Invoice.create({
            merchant_code,
            invoice_number: standardizedInvoice.invoice_number,
            invoice_date: standardizedInvoice.invoice_date,
            due_date: standardizedInvoice.due_date,
            customer_name: standardizedInvoice.customer_name,
            customer_email: standardizedInvoice.customer_email,
            currency: standardizedInvoice.currency || 'USD',
            subtotal: standardizedInvoice.subtotal,
            tax_amount: standardizedInvoice.tax_amount,
            total_amount: standardizedInvoice.total_amount,
            status: 'sent',
            invoice_type: 'merchant_invoice',
            original_format: format,
            original_file_url: file_url,
            standardized_data: JSON.stringify(standardizedInvoice)
        });

        return Response.json({
            success: true,
            invoice,
            validation: validationResult.data
        });

    } catch (error) {
        console.error('Invoice processing error:', error);
        return Response.json({ 
            error: error.message || 'Failed to process invoice' 
        }, { status: 500 });
    }
});

// UBL 2.1 Parser
async function parseUBL(xmlContent) {
    // Basic XML parsing (in production, use proper XML parser)
    const invoice = {
        invoice_number: extractXMLValue(xmlContent, 'cbc:ID'),
        invoice_date: extractXMLValue(xmlContent, 'cbc:IssueDate'),
        due_date: extractXMLValue(xmlContent, 'cbc:DueDate'),
        customer_name: extractXMLValue(xmlContent, 'cac:AccountingCustomerParty', 'cbc:Name'),
        currency: extractXMLValue(xmlContent, 'cbc:DocumentCurrencyCode'),
        subtotal: parseFloat(extractXMLValue(xmlContent, 'cbc:LineExtensionAmount')),
        tax_amount: parseFloat(extractXMLValue(xmlContent, 'cbc:TaxAmount')),
        total_amount: parseFloat(extractXMLValue(xmlContent, 'cbc:PayableAmount'))
    };
    return invoice;
}

// Peppol BIS 3.0 Parser
async function parsePeppol(xmlContent) {
    return parseUBL(xmlContent); // Peppol uses UBL format
}

// SAP IDoc Parser
async function parseSAP(content) {
    // Parse SAP IDoc format
    return {
        invoice_number: extractSAPField(content, 'BELNR'),
        invoice_date: extractSAPField(content, 'BLDAT'),
        total_amount: parseFloat(extractSAPField(content, 'WRBTR'))
    };
}

// Oracle EBS Parser
async function parseOracle(content) {
    const data = JSON.parse(content);
    return {
        invoice_number: data.invoice_num,
        invoice_date: data.invoice_date,
        total_amount: data.invoice_amount
    };
}

// PDF Extraction using AI
async function extractFromPDF(file_url) {
    const base44 = createClientFromRequest(req);
    
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: 'Extract invoice data from this PDF and return structured JSON with fields: invoice_number, invoice_date, due_date, customer_name, currency, subtotal, tax_amount, total_amount',
        file_urls: [file_url],
        response_json_schema: {
            type: 'object',
            properties: {
                invoice_number: { type: 'string' },
                invoice_date: { type: 'string' },
                due_date: { type: 'string' },
                customer_name: { type: 'string' },
                currency: { type: 'string' },
                subtotal: { type: 'number' },
                tax_amount: { type: 'number' },
                total_amount: { type: 'number' }
            }
        }
    });

    return result;
}

// Helper functions
function extractXMLValue(xml, tag, childTag = null) {
    const regex = childTag 
        ? new RegExp(`<${tag}[^>]*>[\\s\\S]*?<${childTag}>([^<]+)</${childTag}>`, 'i')
        : new RegExp(`<${tag}>([^<]+)</${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : '';
}

function extractSAPField(content, field) {
    const regex = new RegExp(`${field}\\s+([^\\n]+)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
}