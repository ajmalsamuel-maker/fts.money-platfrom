import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { invoiceData, standard, country } = await req.json();

        // Get standard details from registry
        const standardsMap = {
            'PEPPOL': { name: 'PEPPOL BIS', format: 'UBL 2.1', mandatoryFields: ['recipient_tin', 'invoice_date', 'invoice_number', 'line_items', 'total_amount', 'vat_amount'] },
            'ZATCA': { name: 'ZATCA (Saudi Arabia)', format: 'XML', mandatoryFields: ['seller_vat', 'buyer_vat', 'invoice_date', 'qr_code', 'line_items', 'total_amount'] },
            'CFDI': { name: 'CFDI (Mexico)', format: 'XML v4.0', mandatoryFields: ['rfc_emisor', 'rfc_receptor', 'fecha', 'folio', 'total', 'tipo_comprobante'] },
            'FatturaPA': { name: 'FatturaPA (Italy)', format: 'XML', mandatoryFields: ['partita_iva', 'codice_destinatario', 'data', 'numero', 'importo_totale'] },
            'XRechnung': { name: 'XRechnung (Germany)', format: 'UBL/CII', mandatoryFields: ['seller_vat', 'buyer_id', 'invoice_date', 'invoice_number', 'total_amount', 'payment_terms'] }
        };

        const standardInfo = standardsMap[standard] || standardsMap['PEPPOL'];

        // Use AI to validate the invoice
        const validationResult = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an e-invoicing compliance validator for the ${standardInfo.name} standard.

Analyze this invoice data and validate it against ${standard} requirements for ${country}:

${JSON.stringify(invoiceData, null, 2)}

Required fields for ${standard}: ${standardInfo.mandatoryFields.join(', ')}

Check for:
1. Missing mandatory fields
2. Incorrect tax calculations (verify VAT/tax amounts match line items)
3. Invalid date formats (should be ISO 8601: YYYY-MM-DD)
4. Missing or invalid tax identification numbers
5. Format inconsistencies (numbers as strings, etc.)
6. Country-specific compliance issues for ${country}
7. Line item validation (prices, quantities, totals)

Provide a structured validation report with specific, actionable feedback.`,
            response_json_schema: {
                type: "object",
                properties: {
                    is_valid: { type: "boolean" },
                    errors: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                field: { type: "string" },
                                severity: { type: "string", enum: ["critical", "warning", "info"] },
                                message: { type: "string" },
                                suggestion: { type: "string" }
                            }
                        }
                    },
                    warnings: {
                        type: "array",
                        items: { type: "string" }
                    },
                    compliance_score: { type: "number" },
                    summary: { type: "string" }
                }
            }
        });

        return Response.json({
            validation: validationResult,
            standard: standardInfo,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});