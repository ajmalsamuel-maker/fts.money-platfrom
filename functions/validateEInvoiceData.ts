import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * E-Invoice Data Validation Engine
 * Validates invoice data against country-specific schemas and business rules
 * before submission to tax authorities
 */

const VALIDATION_RULES = {
    // Peppol (Universal)
    'peppol': {
        required: ['invoice_number', 'issue_date', 'seller_name', 'seller_country', 'buyer_name', 'buyer_country', 'currency', 'total_amount'],
        formats: {
            invoice_number: /^.{1,35}$/,
            vat_number: /^[A-Z]{2}.{2,15}$/,
            currency: /^[A-Z]{3}$/,
            country: /^[A-Z]{2}$/
        },
        business_rules: [
            { rule: 'total_must_match', message: 'Total amount must equal sum of line items plus tax' },
            { rule: 'issue_date_valid', message: 'Issue date cannot be in the future' },
            { rule: 'delivery_date_after_issue', message: 'Delivery date must be after issue date' }
        ]
    },

    // Saudi Arabia - ZATCA
    'zatca': {
        required: ['invoice_number', 'issue_date', 'seller_vat', 'buyer_vat', 'total_with_vat', 'total_without_vat', 'vat_amount', 'invoice_type'],
        formats: {
            seller_vat: /^3\d{14}$/,
            buyer_vat: /^3\d{14}$/,
            invoice_number: /^.{1,127}$/,
            invoice_type: /^(0[123]8|38[123456])$/
        },
        business_rules: [
            { rule: 'vat_calculation', message: 'VAT amount must be 15% of taxable amount' },
            { rule: 'qr_code_required', message: 'QR code is mandatory for Phase 2' },
            { rule: 'uuid_required', message: 'Invoice UUID is mandatory' },
            { rule: 'counter_value', message: 'Invoice counter value must be sequential' }
        ]
    },

    // Pakistan - PRAL/FBR
    'pral': {
        required: ['InvoiceNumber', 'InvoiceDate', 'InvoiceType', 'BuyerNTN', 'SupplierNTN', 'TotalInvoiceValue', 'TotalSalesTax'],
        formats: {
            BuyerNTN: /^\d{7}-\d$/,
            SupplierNTN: /^\d{7}-\d$/,
            InvoiceType: /^(Sales|Debit|Credit)$/,
            InvoiceCategory: /^(B2B|B2C|Export)$/
        },
        business_rules: [
            { rule: 'sales_tax_18', message: 'Sales tax must be 18% for standard transactions' },
            { rule: 'ntn_validation', message: 'NTN format must be 7 digits followed by check digit' },
            { rule: 'sequential_invoice', message: 'Invoice numbers must be sequential' }
        ]
    },

    // Italy - FatturaPA
    'fatturapa': {
        required: ['invoice_number', 'issue_date', 'seller_vat', 'buyer_fiscal_code', 'total_amount', 'document_type'],
        formats: {
            seller_vat: /^IT\d{11}$/,
            buyer_fiscal_code: /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/,
            document_type: /^TD0[1-9]|TD1[0-9]|TD2[0-8]$/
        },
        business_rules: [
            { rule: 'progressive_number', message: 'Progressive invoice number required' },
            { rule: 'stamp_duty', message: 'Bollo stamp duty required for invoices > €77.47' },
            { rule: 'iva_calculation', message: 'IVA must be correctly calculated per rate' }
        ]
    },

    // Mexico - CFDI
    'cfdi': {
        required: ['folio', 'serie', 'fecha', 'rfc_emisor', 'rfc_receptor', 'total', 'tipo_comprobante'],
        formats: {
            rfc_emisor: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
            rfc_receptor: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
            tipo_comprobante: /^(I|E|T|N|P)$/
        },
        business_rules: [
            { rule: 'pac_certification', message: 'PAC certification required' },
            { rule: 'uuid_valid', message: 'UUID must be obtained from SAT' },
            { rule: 'iva_16', message: 'IVA must be 16% or 8% (border zone)' }
        ]
    },

    // India - GST e-Invoice
    'gst_india': {
        required: ['DocNo', 'DocDt', 'SellerGstin', 'BuyerGstin', 'TotInvVal', 'TotItemVal', 'TotTaxVal'],
        formats: {
            SellerGstin: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
            BuyerGstin: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
            DocTyp: /^(INV|CRN|DBN)$/
        },
        business_rules: [
            { rule: 'irn_generation', message: 'IRN must be generated from IRP' },
            { rule: 'hsn_code', message: 'HSN/SAC code mandatory' },
            { rule: 'igst_cgst_sgst', message: 'IGST for inter-state, CGST+SGST for intra-state' },
            { rule: 'turnover_threshold', message: 'Mandatory for turnover > ₹5 crore' }
        ]
    },

    // Malaysia - MyInvois
    'myinvois': {
        required: ['InvoiceNumber', 'IssueDate', 'SupplierTIN', 'BuyerTIN', 'TotalExcludingTax', 'TotalIncludingTax', 'TaxTotal'],
        formats: {
            SupplierTIN: /^[A-Z]\d{10}$/,
            BuyerTIN: /^[A-Z]\d{10}$/,
            Currency: /^[A-Z]{3}$/
        },
        business_rules: [
            { rule: 'ubl_2_1', message: 'Must conform to UBL 2.1 format' },
            { rule: 'validation_by_irbm', message: 'Real-time validation by IRBM required' },
            { rule: 'sst_calculation', message: 'SST must be calculated correctly' }
        ]
    },

    // Brazil - NF-e
    'nfe_brazil': {
        required: ['cNF', 'natOp', 'mod', 'serie', 'nNF', 'dhEmi', 'tpNF', 'cUF', 'emit_CNPJ', 'dest_CNPJ'],
        formats: {
            emit_CNPJ: /^\d{14}$/,
            dest_CNPJ: /^\d{14}$/,
            mod: /^(55|65)$/,
            tpNF: /^(0|1)$/
        },
        business_rules: [
            { rule: 'danfe_generation', message: 'DANFE must be generated' },
            { rule: 'sefaz_authorization', message: 'Authorization from SEFAZ required' },
            { rule: 'digital_signature', message: 'Digital certificate required' },
            { rule: 'icms_calculation', message: 'ICMS must be calculated per state rules' }
        ]
    },

    // Chile - DTE
    'dte_chile': {
        required: ['TipoDTE', 'Folio', 'FchEmis', 'RUTEmisor', 'RUTReceptor', 'MntTotal'],
        formats: {
            RUTEmisor: /^\d{1,8}-[\dKk]$/,
            RUTReceptor: /^\d{1,8}-[\dKk]$/,
            TipoDTE: /^(33|34|39|41|43|46|52|56|61)$/
        },
        business_rules: [
            { rule: 'caf_stamp', message: 'CAF authorization stamp required' },
            { rule: 'sii_validation', message: 'SII validation required' },
            { rule: 'ted_barcode', message: 'TED electronic stamp required' }
        ]
    },

    // Romania - RO e-Factura
    'ro_efactura': {
        required: ['ID', 'IssueDate', 'InvoiceTypeCode', 'AccountingSupplierParty', 'AccountingCustomerParty', 'LegalMonetaryTotal'],
        formats: {
            VAT_ID: /^RO\d{2,10}$/,
            Currency: /^RON$/,
            InvoiceTypeCode: /^(380|381|384)$/
        },
        business_rules: [
            { rule: 'ubl_ro_cius', message: 'Must use RO_CIUS UBL 2.1 format' },
            { rule: 'anaf_submission', message: 'Real-time submission to ANAF required' },
            { rule: 'e_transport_awb', message: 'e-Transport AWB required for goods movement' }
        ]
    },

    // Poland - KSeF
    'ksef': {
        required: ['NumerFaktury', 'DataWystawienia', 'NIP_Sprzedawcy', 'NIP_Nabywcy', 'WartoscBrutto'],
        formats: {
            NIP_Sprzedawcy: /^\d{10}$/,
            NIP_Nabywcy: /^\d{10}$/,
            NumerFaktury: /^.{1,256}$/
        },
        business_rules: [
            { rule: 'fa3_schema', message: 'Must use FA(3) structured XML schema' },
            { rule: 'ksef_api', message: 'Submit via KSeF 2.0 API' },
            { rule: 'jpk_vat_integration', message: 'Integration with JPK_VAT reporting' }
        ]
    },

    // Turkey - e-Fatura
    'efatura_turkey': {
        required: ['UUID', 'ID', 'IssueDate', 'SupplierVKN', 'CustomerVKN', 'TaxInclusiveAmount'],
        formats: {
            SupplierVKN: /^\d{10}$/,
            CustomerVKN: /^\d{10}$/,
            UUID: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
        },
        business_rules: [
            { rule: 'ubl_tr_1_2', message: 'Must use UBL-TR 1.2 XML format' },
            { rule: 'gib_validation', message: 'GIB validation required' },
            { rule: 'qr_code', message: 'QR code mandatory' }
        ]
    }
};

function validateInvoice(standard, data) {
    const rules = VALIDATION_RULES[standard];
    
    if (!rules) {
        throw new Error(`Validation rules not found for standard: ${standard}`);
    }

    const errors = [];
    const warnings = [];

    // Check required fields
    for (const field of rules.required) {
        if (!data[field] || data[field] === '') {
            errors.push({
                field,
                type: 'required',
                message: `Field '${field}' is required`
            });
        }
    }

    // Validate formats
    for (const [field, pattern] of Object.entries(rules.formats)) {
        if (data[field] && !pattern.test(String(data[field]))) {
            errors.push({
                field,
                type: 'format',
                message: `Field '${field}' has invalid format. Expected pattern: ${pattern}`
            });
        }
    }

    // Business rules validation
    for (const rule of rules.business_rules) {
        const result = validateBusinessRule(rule.rule, data, standard);
        if (!result.valid) {
            if (result.severity === 'error') {
                errors.push({
                    field: result.field || 'general',
                    type: 'business_rule',
                    message: rule.message,
                    details: result.details
                });
            } else {
                warnings.push({
                    field: result.field || 'general',
                    type: 'business_rule',
                    message: rule.message,
                    details: result.details
                });
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        standard,
        validated_at: new Date().toISOString()
    };
}

function validateBusinessRule(ruleName, data, standard) {
    // Implement specific business rule validations
    switch (ruleName) {
        case 'total_must_match':
            const calculatedTotal = (data.line_items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
            return {
                valid: Math.abs(calculatedTotal - (data.total_amount || 0)) < 0.01,
                field: 'total_amount',
                severity: 'error',
                details: `Calculated: ${calculatedTotal}, Provided: ${data.total_amount}`
            };

        case 'vat_calculation':
            const vatAmount = (data.total_without_vat || 0) * 0.15;
            return {
                valid: Math.abs(vatAmount - (data.vat_amount || 0)) < 0.01,
                field: 'vat_amount',
                severity: 'error',
                details: `Expected: ${vatAmount}, Provided: ${data.vat_amount}`
            };

        case 'sales_tax_18':
            const expectedTax = (data.TotalInvoiceValue || 0) * 0.18;
            return {
                valid: Math.abs(expectedTax - (data.TotalSalesTax || 0)) < 0.01,
                field: 'TotalSalesTax',
                severity: 'error',
                details: `Expected: ${expectedTax}, Provided: ${data.TotalSalesTax}`
            };

        case 'issue_date_valid':
            const issueDate = new Date(data.issue_date || data.IssueDate || data.DocDt);
            return {
                valid: issueDate <= new Date(),
                field: 'issue_date',
                severity: 'error',
                details: `Issue date: ${issueDate}`
            };

        default:
            return { valid: true, severity: 'info' };
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { standard, invoice_data } = await req.json();

        if (!standard || !invoice_data) {
            return Response.json({
                error: 'Missing required parameters: standard, invoice_data'
            }, { status: 400 });
        }

        const validation = validateInvoice(standard, invoice_data);

        return Response.json({
            success: true,
            validation
        });

    } catch (error) {
        console.error('Validation error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 400 });
    }
});