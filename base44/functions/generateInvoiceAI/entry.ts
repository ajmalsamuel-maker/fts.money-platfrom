import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { basicDetails, standard, country, businessInfo } = await req.json();

        // Map of standards with their requirements
        const standardsMap = {
            'PEPPOL': { taxField: 'VAT', taxRate: 0.20, currency: 'EUR' },
            'ZATCA': { taxField: 'VAT', taxRate: 0.15, currency: 'SAR' },
            'CFDI': { taxField: 'IVA', taxRate: 0.16, currency: 'MXN' },
            'FatturaPA': { taxField: 'IVA', taxRate: 0.22, currency: 'EUR' },
            'XRechnung': { taxField: 'USt', taxRate: 0.19, currency: 'EUR' },
            'SII': { taxField: 'IVA', taxRate: 0.21, currency: 'EUR' }
        };

        const standardInfo = standardsMap[standard] || standardsMap['PEPPOL'];

        // Use AI to generate complete invoice
        const generatedInvoice = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an AI e-invoicing assistant generating a compliant ${standard} invoice for ${country}.

Business Information:
${JSON.stringify(businessInfo, null, 2)}

User Input (Basic Details):
${JSON.stringify(basicDetails, null, 2)}

Standard: ${standard}
Country: ${country}
Default Tax Rate: ${(standardInfo.taxRate * 100).toFixed(0)}%
Currency: ${standardInfo.currency}

Generate a complete, compliant e-invoice with:
1. Auto-generated invoice number (format: INV-${new Date().getFullYear()}-XXXXX)
2. Current date in ISO format
3. Complete line items with:
   - Product/service descriptions (expand user input)
   - Quantities (default to 1 if not specified)
   - Unit prices
   - Tax amounts per line
   - Line totals
4. Proper tax calculations:
   - Subtotal (sum of line items before tax)
   - Tax amount (subtotal × tax rate)
   - Total amount (subtotal + tax)
5. Suggested tax codes based on product/service type for ${country}
6. Payment terms (default: Net 30)
7. All mandatory fields for ${standard}

If customer name is provided, suggest proper recipient tax identification number format for ${country}.
If service description is vague, enhance it with professional language.

Return a structured invoice ready for submission.`,
            response_json_schema: {
                type: "object",
                properties: {
                    invoice_number: { type: "string" },
                    invoice_date: { type: "string" },
                    due_date: { type: "string" },
                    currency: { type: "string" },
                    customer: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            tax_id: { type: "string" },
                            address: { type: "string" },
                            country: { type: "string" }
                        }
                    },
                    line_items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                quantity: { type: "number" },
                                unit_price: { type: "number" },
                                tax_rate: { type: "number" },
                                tax_amount: { type: "number" },
                                line_total: { type: "number" },
                                tax_code: { type: "string" }
                            }
                        }
                    },
                    subtotal: { type: "number" },
                    tax_amount: { type: "number" },
                    total_amount: { type: "number" },
                    payment_terms: { type: "string" },
                    notes: { type: "string" },
                    compliance_fields: {
                        type: "object",
                        properties: {
                            tax_code_suggestions: { 
                                type: "array",
                                items: { type: "string" }
                            },
                            recommended_payment_method: { type: "string" },
                            standard_specific_fields: { type: "object" }
                        }
                    },
                    ai_suggestions: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({
            invoice: generatedInvoice,
            standard: standard,
            country: country,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});