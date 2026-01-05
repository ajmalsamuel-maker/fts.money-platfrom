/**
 * Global E-Invoicing Standards Reference
 * Comprehensive guide for all supported formats
 */

export const EINVOICING_STANDARDS = {
    peppol: {
        name: 'Peppol BIS Billing 3.0',
        format: 'UBL 2.1',
        regions: ['EU', 'AU', 'NZ', 'SG', 'MY', 'NO', 'CH'],
        mandatory: ['AU', 'SG'],
        gateway_required: true,
        digital_signature: false,
        description: 'Pan-European Public Procurement Online standard'
    },
    fatturapa: {
        name: 'FatturaPA',
        format: 'XML (FPR12)',
        regions: ['IT'],
        mandatory: ['IT'],
        gateway_required: true,
        gateway_name: 'Sistema di Interscambio (SDI)',
        digital_signature: true,
        description: 'Italian electronic invoice format'
    },
    zatca: {
        name: 'ZATCA (Fatoora)',
        format: 'UBL 2.1 with Saudi extensions',
        regions: ['SA'],
        mandatory: ['SA'],
        gateway_required: true,
        gateway_name: 'ZATCA Platform',
        digital_signature: true,
        qr_code_required: true,
        phases: {
            phase1: 'Generation (completed)',
            phase2: 'Integration (current)'
        },
        description: 'Saudi Arabian e-invoicing system'
    },
    cfdi: {
        name: 'CFDI 4.0',
        format: 'XML',
        regions: ['MX'],
        mandatory: ['MX'],
        gateway_required: true,
        gateway_name: 'PAC (Proveedor Autorizado de Certificación)',
        digital_signature: true,
        description: 'Mexican Comprobante Fiscal Digital por Internet'
    },
    facturx: {
        name: 'Factur-X / ZUGFeRD',
        format: 'Hybrid PDF/A-3 with embedded XML',
        regions: ['FR', 'DE'],
        mandatory: ['FR'],
        gateway_required: false,
        digital_signature: false,
        description: 'Franco-German hybrid invoice standard'
    },
    sii: {
        name: 'SII (Suministro Inmediato de Información)',
        format: 'JSON',
        regions: ['ES'],
        mandatory: ['ES'],
        gateway_required: true,
        gateway_name: 'AEAT SII Platform',
        digital_signature: false,
        real_time: true,
        description: 'Spanish immediate supply of information system'
    },
    mtd: {
        name: 'Making Tax Digital',
        format: 'UBL 2.1',
        regions: ['GB'],
        mandatory: ['GB'],
        gateway_required: true,
        gateway_name: 'HMRC MTD API',
        digital_signature: false,
        description: 'UK digital tax reporting'
    },
    anaf: {
        name: 'e-Factura',
        format: 'UBL 2.1',
        regions: ['RO'],
        mandatory: ['RO'],
        gateway_required: true,
        gateway_name: 'ANAF SPV',
        digital_signature: true,
        description: 'Romanian e-invoice system'
    },
    fenix: {
        name: 'FENIX',
        format: 'UBL 2.1',
        regions: ['PT'],
        mandatory: false,
        gateway_required: false,
        digital_signature: false,
        description: 'Portuguese e-invoicing platform'
    },
    india_gst: {
        name: 'e-Invoice (India GST)',
        format: 'JSON',
        regions: ['IN'],
        mandatory: ['IN'],
        gateway_required: true,
        gateway_name: 'IRP (Invoice Registration Portal)',
        digital_signature: true,
        description: 'Indian GST e-invoicing system'
    },
    korea_etax: {
        name: 'Korea e-Tax',
        format: 'XML',
        regions: ['KR'],
        mandatory: ['KR'],
        gateway_required: true,
        gateway_name: 'National Tax Service',
        digital_signature: true,
        description: 'Korean electronic tax invoice'
    },
    brazil_nfe: {
        name: 'NF-e (Nota Fiscal Eletrônica)',
        format: 'XML',
        regions: ['BR'],
        mandatory: ['BR'],
        gateway_required: true,
        gateway_name: 'SEFAZ',
        digital_signature: true,
        description: 'Brazilian electronic fiscal document'
    },
    turkey_einvoice: {
        name: 'e-Fatura',
        format: 'UBL-TR',
        regions: ['TR'],
        mandatory: ['TR'],
        gateway_required: true,
        gateway_name: 'GIB (Gelir İdaresi Başkanlığı)',
        digital_signature: true,
        description: 'Turkish e-invoice system'
    }
};

export const DIGITAL_SIGNATURE_STANDARDS = {
    xmldsig: {
        name: 'XML Digital Signature',
        algorithm: 'XMLDSig-SHA256-RSA',
        used_in: ['fatturapa', 'zatca', 'cfdi', 'anaf']
    },
    xades: {
        name: 'XML Advanced Electronic Signatures',
        algorithm: 'XAdES',
        used_in: ['fatturapa', 'turkey_einvoice']
    },
    pades: {
        name: 'PDF Advanced Electronic Signatures',
        algorithm: 'PAdES',
        used_in: ['facturx']
    }
};

export const GATEWAY_ENDPOINTS = {
    peppol: {
        production: 'https://access-point.peppol.eu',
        test: 'https://test-access-point.peppol.eu'
    },
    fatturapa: {
        production: 'https://sdi.fatturapa.gov.it',
        test: 'https://testservizi.fatturapa.it'
    },
    zatca: {
        production: 'https://gw-fatoora.zatca.gov.sa',
        test: 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal'
    },
    sii: {
        production: 'https://www7.aeat.es/wlpl/SSII-FACT/ws',
        test: 'https://www7.aeat.es/wlpl/SSII-FACT/ws'
    },
    mtd: {
        production: 'https://api.service.hmrc.gov.uk',
        test: 'https://test-api.service.hmrc.gov.uk'
    }
};

export function getStandardForCountry(countryCode) {
    for (const [key, standard] of Object.entries(EINVOICING_STANDARDS)) {
        if (standard.mandatory?.includes(countryCode)) {
            return key;
        }
        if (standard.regions?.includes(countryCode)) {
            return key;
        }
    }
    return 'peppol'; // Default to Peppol
}

export function isEInvoicingMandatory(countryCode) {
    for (const standard of Object.values(EINVOICING_STANDARDS)) {
        if (standard.mandatory?.includes(countryCode)) {
            return true;
        }
    }
    return false;
}

export function getRequiredFeatures(format) {
    const standard = EINVOICING_STANDARDS[format];
    return {
        digital_signature: standard?.digital_signature || false,
        gateway_submission: standard?.gateway_required || false,
        qr_code: standard?.qr_code_required || false,
        real_time: standard?.real_time || false,
        pdf_hybrid: standard?.format?.includes('PDF') || false
    };
}