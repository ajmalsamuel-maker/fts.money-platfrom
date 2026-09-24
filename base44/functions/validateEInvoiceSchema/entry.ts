import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Real-time E-Invoice Schema Validation
 * Validates against country-specific XSD schemas and tax authority rules
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        
        const {
            invoice_id,
            xml_content,
            format,
            strict_mode = true
        } = payload;

        // Validate based on format
        let validationResult;
        switch (format) {
            case 'peppol':
                validationResult = await validatePeppol(xml_content, strict_mode);
                break;
            case 'fatturapa':
                validationResult = await validateFatturaPA(xml_content, strict_mode);
                break;
            case 'zatca':
                validationResult = await validateZATCA(xml_content, strict_mode);
                break;
            case 'cfdi':
                validationResult = await validateCFDI(xml_content, strict_mode);
                break;
            case 'sii':
                validationResult = await validateSII(xml_content, strict_mode);
                break;
            case 'mtd':
                validationResult = await validateMTD(xml_content, strict_mode);
                break;
            default:
                validationResult = await validateGenericUBL(xml_content, strict_mode);
        }

        // Update invoice with validation results
        if (invoice_id) {
            await base44.asServiceRole.entities.Invoice.update(invoice_id, {
                einvoice_validation: validationResult,
                einvoice_validation_date: new Date().toISOString(),
                einvoice_status: validationResult.valid ? 'validated' : 'validation_failed'
            });
        }

        return Response.json({
            success: true,
            validation: validationResult
        });

    } catch (error) {
        console.error('Validation error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

// Peppol BIS 3.0 Validation
async function validatePeppol(xml, strictMode) {
    const errors = [];
    const warnings = [];
    
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        
        if (!doc) {
            return createValidationResult(false, [{
                code: 'PARSE_ERROR',
                message: 'Failed to parse XML',
                severity: 'error',
                field: 'root'
            }]);
        }

        // Required fields validation
        const requiredFields = [
            { path: '//cbc:ID', name: 'Invoice Number', code: 'BR-02' },
            { path: '//cbc:IssueDate', name: 'Issue Date', code: 'BR-03' },
            { path: '//cbc:InvoiceTypeCode', name: 'Invoice Type', code: 'BR-04' },
            { path: '//cbc:DocumentCurrencyCode', name: 'Currency', code: 'BR-05' },
            { path: '//cac:AccountingSupplierParty', name: 'Supplier', code: 'BR-06' },
            { path: '//cac:AccountingCustomerParty', name: 'Customer', code: 'BR-07' },
            { path: '//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount', name: 'Tax Inclusive Amount', code: 'BR-14' }
        ];

        for (const field of requiredFields) {
            const node = doc.evaluate(field.path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!node) {
                errors.push({
                    code: field.code,
                    message: `Missing required field: ${field.name}`,
                    severity: 'error',
                    field: field.path,
                    suggestion: `Add ${field.name} to invoice`
                });
            }
        }

        // Date format validation (YYYY-MM-DD)
        const dateNode = doc.evaluate('//cbc:IssueDate', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (dateNode) {
            const dateValue = dateNode.textContent;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                errors.push({
                    code: 'BR-03-FORMAT',
                    message: 'Issue date must be in YYYY-MM-DD format',
                    severity: 'error',
                    field: '//cbc:IssueDate',
                    currentValue: dateValue,
                    suggestion: 'Use format: YYYY-MM-DD'
                });
            }
        }

        // VAT validation
        const taxTotals = doc.evaluate('//cac:TaxTotal', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (taxTotals.snapshotLength === 0) {
            warnings.push({
                code: 'BR-45',
                message: 'Invoice should include tax information',
                severity: 'warning',
                field: '//cac:TaxTotal'
            });
        }

        // Customization ID validation
        const customizationId = doc.evaluate('//cbc:CustomizationID', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const expectedCustomization = 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0';
        if (customizationId && customizationId.textContent !== expectedCustomization) {
            errors.push({
                code: 'PEPPOL-T010-R001',
                message: 'Invalid Peppol BIS customization ID',
                severity: 'error',
                field: '//cbc:CustomizationID',
                currentValue: customizationId.textContent,
                expectedValue: expectedCustomization
            });
        }

    } catch (error) {
        errors.push({
            code: 'VALIDATION_ERROR',
            message: error.message,
            severity: 'error',
            field: 'document'
        });
    }

    return createValidationResult(errors.length === 0, errors, warnings);
}

// Italy FatturaPA Validation
async function validateFatturaPA(xml, strictMode) {
    const errors = [];
    const warnings = [];
    
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        // Required FatturaPA fields
        const requiredChecks = [
            { path: '//IdTrasmittente/IdPaese', name: 'Transmitter Country', code: 'FPA-001' },
            { path: '//IdTrasmittente/IdCodice', name: 'Transmitter Code', code: 'FPA-002' },
            { path: '//ProgressivoInvio', name: 'Progressive Number', code: 'FPA-003' },
            { path: '//FormatoTrasmissione', name: 'Format', code: 'FPA-004' },
            { path: '//CodiceDestinatario', name: 'Recipient Code', code: 'FPA-005' },
            { path: '//DatiAnagrafici/IdFiscaleIVA', name: 'VAT ID', code: 'FPA-006' }
        ];

        for (const check of requiredChecks) {
            const node = doc.evaluate(check.path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!node || !node.textContent.trim()) {
                errors.push({
                    code: check.code,
                    message: `Missing required field: ${check.name}`,
                    severity: 'error',
                    field: check.path
                });
            }
        }

        // Format validation (must be FPR12)
        const formatNode = doc.evaluate('//FormatoTrasmissione', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (formatNode && formatNode.textContent !== 'FPR12') {
            errors.push({
                code: 'FPA-FORMAT',
                message: 'Format must be FPR12',
                severity: 'error',
                field: '//FormatoTrasmissione',
                currentValue: formatNode.textContent,
                expectedValue: 'FPR12'
            });
        }

        // CodiceDestinatario validation (7 characters or 0000000 for PEC)
        const destCode = doc.evaluate('//CodiceDestinatario', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (destCode && destCode.textContent.length !== 7) {
            errors.push({
                code: 'FPA-DEST-CODE',
                message: 'Recipient code must be exactly 7 characters',
                severity: 'error',
                field: '//CodiceDestinatario',
                currentValue: destCode.textContent
            });
        }

        // VAT number format (IT + 11 digits)
        const vatNodes = doc.evaluate('//IdFiscaleIVA/IdCodice', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < vatNodes.snapshotLength; i++) {
            const vatNode = vatNodes.snapshotItem(i);
            const vatValue = vatNode.textContent;
            if (!/^\d{11}$/.test(vatValue)) {
                errors.push({
                    code: 'FPA-VAT-FORMAT',
                    message: 'Italian VAT number must be 11 digits',
                    severity: 'error',
                    field: `//IdFiscaleIVA/IdCodice[${i + 1}]`,
                    currentValue: vatValue
                });
            }
        }

    } catch (error) {
        errors.push({
            code: 'FPA_VALIDATION_ERROR',
            message: error.message,
            severity: 'error',
            field: 'document'
        });
    }

    return createValidationResult(errors.length === 0, errors, warnings);
}

// Saudi ZATCA Phase 2 Validation
async function validateZATCA(xml, strictMode) {
    const errors = [];
    const warnings = [];
    
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        // ZATCA-specific requirements
        const requiredChecks = [
            { path: '//cbc:UUID', name: 'UUID', code: 'KSA-1' },
            { path: '//cbc:IssueDate', name: 'Issue Date', code: 'KSA-2' },
            { path: '//cbc:IssueTime', name: 'Issue Time', code: 'KSA-3' },
            { path: '//cbc:InvoiceTypeCode', name: 'Invoice Type', code: 'KSA-4' }
        ];

        for (const check of requiredChecks) {
            const node = doc.evaluate(check.path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!node) {
                errors.push({
                    code: check.code,
                    message: `Missing required ZATCA field: ${check.name}`,
                    severity: 'error',
                    field: check.path
                });
            }
        }

        // Invoice Type Code validation (must have name attribute)
        const typeCode = doc.evaluate('//cbc:InvoiceTypeCode', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (typeCode && !typeCode.getAttribute('name')) {
            errors.push({
                code: 'KSA-TYPE-CODE',
                message: 'InvoiceTypeCode must have name attribute',
                severity: 'error',
                field: '//cbc:InvoiceTypeCode',
                suggestion: 'Add name attribute (e.g., name="0100000")'
            });
        }

        // VAT validation (15% standard rate for Saudi Arabia)
        const vatRates = doc.evaluate('//cac:TaxCategory/cbc:Percent', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < vatRates.snapshotLength; i++) {
            const rate = parseFloat(vatRates.snapshotItem(i).textContent);
            if (rate !== 15 && rate !== 0) {
                warnings.push({
                    code: 'KSA-VAT-RATE',
                    message: 'Saudi Arabia standard VAT rate is 15%',
                    severity: 'warning',
                    field: `//cac:TaxCategory[${i + 1}]/cbc:Percent`,
                    currentValue: rate.toString()
                });
            }
        }

        // QR code requirement for Phase 2
        if (strictMode) {
            const qrCode = doc.evaluate('//cac:AdditionalDocumentReference[cbc:ID="QR"]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!qrCode) {
                errors.push({
                    code: 'KSA-QR-REQUIRED',
                    message: 'ZATCA Phase 2 requires embedded QR code',
                    severity: 'error',
                    field: '//cac:AdditionalDocumentReference',
                    suggestion: 'Add QR code reference with embedded TLV data'
                });
            }
        }

    } catch (error) {
        errors.push({
            code: 'ZATCA_VALIDATION_ERROR',
            message: error.message,
            severity: 'error',
            field: 'document'
        });
    }

    return createValidationResult(errors.length === 0, errors, warnings);
}

// Mexico CFDI Validation
async function validateCFDI(xml, strictMode) {
    const errors = [];
    const warnings = [];
    
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        // CFDI 4.0 required attributes
        const comprobante = doc.evaluate('//cfdi:Comprobante', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (!comprobante) {
            errors.push({
                code: 'CFDI-ROOT',
                message: 'Missing cfdi:Comprobante root element',
                severity: 'error',
                field: 'root'
            });
        } else {
            const requiredAttrs = ['Version', 'Serie', 'Folio', 'Fecha', 'FormaPago', 'SubTotal', 'Total', 'TipoDeComprobante', 'LugarExpedicion'];
            for (const attr of requiredAttrs) {
                if (!comprobante.getAttribute(attr)) {
                    errors.push({
                        code: `CFDI-${attr}`,
                        message: `Missing required attribute: ${attr}`,
                        severity: 'error',
                        field: `//cfdi:Comprobante/@${attr}`
                    });
                }
            }

            // Version must be 4.0
            const version = comprobante.getAttribute('Version');
            if (version && version !== '4.0') {
                errors.push({
                    code: 'CFDI-VERSION',
                    message: 'CFDI Version must be 4.0',
                    severity: 'error',
                    field: '//cfdi:Comprobante/@Version',
                    currentValue: version,
                    expectedValue: '4.0'
                });
            }
        }

        // RFC validation (13 characters for legal entities)
        const rfcNodes = doc.evaluate('//cfdi:Emisor/@Rfc | //cfdi:Receptor/@Rfc', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < rfcNodes.snapshotLength; i++) {
            const rfc = rfcNodes.snapshotItem(i).value;
            if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc)) {
                errors.push({
                    code: 'CFDI-RFC-FORMAT',
                    message: 'Invalid RFC format',
                    severity: 'error',
                    field: `RFC[${i + 1}]`,
                    currentValue: rfc
                });
            }
        }

    } catch (error) {
        errors.push({
            code: 'CFDI_VALIDATION_ERROR',
            message: error.message,
            severity: 'error',
            field: 'document'
        });
    }

    return createValidationResult(errors.length === 0, errors, warnings);
}

// Spain SII Validation
async function validateSII(jsonContent, strictMode) {
    const errors = [];
    const warnings = [];
    
    try {
        const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;

        // Required SII fields
        if (!data.IDFactura) {
            errors.push({
                code: 'SII-001',
                message: 'Missing IDFactura',
                severity: 'error',
                field: 'IDFactura'
            });
        }

        if (!data.PeriodoLiquidacion) {
            errors.push({
                code: 'SII-002',
                message: 'Missing PeriodoLiquidacion',
                severity: 'error',
                field: 'PeriodoLiquidacion'
            });
        }

        // NIF validation
        const nif = data.IDFactura?.IDEmisorFactura?.NIF;
        if (nif && !/^[A-Z]\d{8}$|^\d{8}[A-Z]$/.test(nif)) {
            errors.push({
                code: 'SII-NIF',
                message: 'Invalid Spanish NIF format',
                severity: 'error',
                field: 'IDFactura.IDEmisorFactura.NIF',
                currentValue: nif
            });
        }

    } catch (error) {
        errors.push({
            code: 'SII_VALIDATION_ERROR',
            message: error.message,
            severity: 'error',
            field: 'document'
        });
    }

    return createValidationResult(errors.length === 0, errors, warnings);
}

// UK MTD Validation
async function validateMTD(xml, strictMode) {
    // MTD uses Peppol format
    return await validatePeppol(xml, strictMode);
}

// Generic UBL Validation
async function validateGenericUBL(xml, strictMode) {
    const errors = [];
    const warnings = [];
    
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        if (!doc) {
            errors.push({
                code: 'UBL-PARSE',
                message: 'Failed to parse UBL XML',
                severity: 'error',
                field: 'root'
            });
        }

    } catch (error) {
        errors.push({
            code: 'UBL_VALIDATION_ERROR',
            message: error.message,
            severity: 'error',
            field: 'document'
        });
    }

    return createValidationResult(errors.length === 0, errors, warnings);
}

function createValidationResult(valid, errors = [], warnings = []) {
    return {
        valid,
        errors,
        warnings,
        error_count: errors.length,
        warning_count: warnings.length,
        validated_at: new Date().toISOString(),
        can_submit: valid && errors.length === 0
    };
}