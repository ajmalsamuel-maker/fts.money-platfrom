/**
 * Global E-Invoicing Standards Registry
 * Comprehensive support for worldwide e-invoicing compliance
 */

export const E_INVOICING_STANDARDS = {
    // European Union - EN 16931 (Peppol BIS, UBL)
    EU_EN16931: {
        id: 'eu_en16931',
        name: 'EN 16931 (Peppol BIS)',
        region: 'European Union',
        format: 'UBL 2.1 XML',
        network: 'Peppol',
        mandatory: true,
        sectors: ['public', 'private'],
        schema: 'EN 16931-1:2017',
        transmission: ['peppol', 'api', 'email'],
        validation_rules: 'CIUS (Core Invoice Usage Specification)',
        countries: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']
    },

    // Italy - FatturaPA
    IT_FATTURAPA: {
        id: 'it_fatturapa',
        name: 'FatturaPA',
        region: 'Italy',
        format: 'FatturaPA XML',
        network: 'SDI (Sistema di Interscambio)',
        mandatory: true,
        sectors: ['public', 'private'],
        schema: 'FatturaPA v1.2.1',
        transmission: ['sdi', 'peppol', 'pec'],
        validation_rules: 'Agenzia delle Entrate',
        digital_signature: true,
        requires_certified_email: true,
        countries: ['IT']
    },

    // France & Germany - Factur-X / ZUGFeRD
    FR_DE_FACTURX: {
        id: 'fr_de_facturx',
        name: 'Factur-X / ZUGFeRD',
        region: 'France & Germany',
        format: 'Hybrid PDF/A-3 + embedded UBL XML',
        network: 'Chorus Pro (FR), ZRE (DE)',
        mandatory: true,
        sectors: ['public'],
        schema: 'CII (Cross Industry Invoice)',
        transmission: ['chorus_pro', 'peppol', 'email'],
        validation_rules: 'EN 16931 compliant',
        hybrid_format: true,
        profiles: ['MINIMUM', 'BASIC WL', 'BASIC', 'EN 16931', 'EXTENDED'],
        countries: ['FR', 'DE']
    },

    // United Kingdom
    UK_PEPPOL: {
        id: 'uk_peppol',
        name: 'UK Peppol BIS',
        region: 'United Kingdom',
        format: 'UBL 2.1 XML',
        network: 'Peppol',
        mandatory: false,
        sectors: ['public'],
        schema: 'Peppol BIS Billing 3.0',
        transmission: ['peppol', 'api'],
        validation_rules: 'UK PEPPOL BIS',
        countries: ['GB']
    },

    // Nordics (Denmark, Norway, Sweden, Finland)
    NORDICS_PEPPOL: {
        id: 'nordics_peppol',
        name: 'Nordic Peppol BIS',
        region: 'Nordic Countries',
        format: 'UBL 2.1 XML',
        network: 'Peppol',
        mandatory: true,
        sectors: ['public', 'private'],
        schema: 'Peppol BIS Billing 3.0',
        transmission: ['peppol'],
        validation_rules: 'Nordic CIUS',
        early_adopter: true,
        countries: ['DK', 'NO', 'SE', 'FI']
    },

    // Australia & New Zealand
    AU_NZ_PEPPOL: {
        id: 'au_nz_peppol',
        name: 'A-NZ Peppol BIS',
        region: 'Australia & New Zealand',
        format: 'UBL 2.1 XML',
        network: 'Peppol',
        mandatory: true,
        sectors: ['public'],
        schema: 'A-NZ PEPPOL BIS 3.0',
        transmission: ['peppol'],
        validation_rules: 'A-NZ extension',
        countries: ['AU', 'NZ']
    },

    // Singapore
    SG_PEPPOL: {
        id: 'sg_peppol',
        name: 'Singapore Peppol',
        region: 'Singapore',
        format: 'UBL 2.1 XML',
        network: 'Peppol',
        mandatory: true,
        sectors: ['public', 'private'],
        schema: 'Singapore Peppol BIS',
        transmission: ['peppol', 'infocomm'],
        validation_rules: 'IMDA requirements',
        nationwide: true,
        countries: ['SG']
    },

    // Japan
    JP_PEPPOL: {
        id: 'jp_peppol',
        name: 'Japan Peppol / METI',
        region: 'Japan',
        format: 'UBL 2.1 XML / JP-PINT',
        network: 'Peppol',
        mandatory: false,
        sectors: ['public', 'cross-border'],
        schema: 'JP-PINT (Japan PEPPOL International)',
        transmission: ['peppol', 'meti'],
        validation_rules: 'METI guidelines',
        countries: ['JP']
    },

    // India - e-Invoice (IRN/QR)
    IN_EINVOICE: {
        id: 'in_einvoice',
        name: 'India e-Invoice (IRN)',
        region: 'India',
        format: 'JSON / XML',
        network: 'IRP (Invoice Registration Portal)',
        mandatory: true,
        sectors: ['b2b'],
        schema: 'GST e-Invoice Schema v1.1',
        transmission: ['irp', 'gsp'],
        validation_rules: 'CBIC e-Invoice Rules',
        requires_qr_code: true,
        requires_irn: true,
        digital_signature: true,
        threshold: '10 crore turnover',
        countries: ['IN']
    },

    // Brazil - NF-e
    BR_NFE: {
        id: 'br_nfe',
        name: 'Nota Fiscal Eletrônica (NF-e)',
        region: 'Brazil',
        format: 'NF-e XML',
        network: 'SEFAZ (State Tax Authority)',
        mandatory: true,
        sectors: ['all'],
        schema: 'NF-e Schema v4.00',
        transmission: ['sefaz', 'webservice'],
        validation_rules: 'SEFAZ validation',
        digital_signature: true,
        requires_certificate: true,
        danfe_required: true,
        access_key: true,
        countries: ['BR']
    },

    // Mexico - CFDI
    MX_CFDI: {
        id: 'mx_cfdi',
        name: 'CFDI (Comprobante Fiscal Digital)',
        region: 'Mexico',
        format: 'CFDI XML 4.0',
        network: 'SAT (Servicio de Administración Tributaria)',
        mandatory: true,
        sectors: ['all'],
        schema: 'CFDI 4.0',
        transmission: ['pac', 'sat'],
        validation_rules: 'SAT validation',
        digital_signature: true,
        requires_pac: true,
        requires_rfc: true,
        uuid_required: true,
        countries: ['MX']
    },

    // Saudi Arabia - ZATCA (Fatoorah)
    SA_ZATCA: {
        id: 'sa_zatca',
        name: 'ZATCA e-Invoicing (Fatoorah)',
        region: 'Saudi Arabia',
        format: 'UBL 2.1 XML + Cryptographic Stamp',
        network: 'ZATCA Portal',
        mandatory: true,
        sectors: ['all'],
        schema: 'ZATCA UBL 2.1 extension',
        transmission: ['zatca', 'api'],
        validation_rules: 'ZATCA Phase 2',
        digital_signature: true,
        requires_qr_code: true,
        cryptographic_stamp: true,
        phase: 'Phase 2 (Integration)',
        countries: ['SA']
    },

    // United States - No single standard
    US_HYBRID: {
        id: 'us_hybrid',
        name: 'US E-Invoice (EDI/UBL/JSON)',
        region: 'United States',
        format: 'EDI X12 810 / UBL / JSON',
        network: 'VAN / API',
        mandatory: false,
        sectors: ['voluntary'],
        schema: 'ANSI X12 810 / UBL 2.1',
        transmission: ['edi', 'api', 'email'],
        validation_rules: 'Industry-specific',
        legacy_dominant: true,
        formats: ['EDIFACT', 'X12 810', 'UBL', 'JSON API'],
        countries: ['US']
    }
};

/**
 * Get e-invoicing standard by country
 */
export const getEInvoiceStandardByCountry = (countryCode) => {
    const standards = Object.values(E_INVOICING_STANDARDS).filter(
        standard => standard.countries.includes(countryCode)
    );
    return standards.length > 0 ? standards[0] : null;
};

/**
 * Get all available e-invoicing standards
 */
export const getAllEInvoiceStandards = () => {
    return Object.values(E_INVOICING_STANDARDS);
};

/**
 * Check if country has mandatory e-invoicing
 */
export const isMandatory = (countryCode) => {
    const standard = getEInvoiceStandardByCountry(countryCode);
    return standard ? standard.mandatory : false;
};

/**
 * Get required fields for each standard
 */
export const REQUIRED_FIELDS = {
    eu_en16931: ['invoice_number', 'issue_date', 'seller_vat', 'buyer_vat', 'currency', 'total_amount', 'tax_amount'],
    it_fatturapa: ['invoice_number', 'issue_date', 'seller_vat', 'buyer_vat', 'codice_destinatario', 'pec_email', 'currency', 'total_amount'],
    fr_de_facturx: ['invoice_number', 'issue_date', 'seller_vat', 'buyer_vat', 'siret', 'currency', 'total_amount'],
    in_einvoice: ['invoice_number', 'issue_date', 'seller_gstin', 'buyer_gstin', 'irn', 'supply_type', 'total_amount', 'tax_amount'],
    br_nfe: ['invoice_number', 'issue_date', 'seller_cnpj', 'buyer_cnpj', 'access_key', 'danfe', 'total_amount'],
    mx_cfdi: ['invoice_number', 'issue_date', 'seller_rfc', 'buyer_rfc', 'uuid', 'pac_stamp', 'total_amount'],
    sa_zatca: ['invoice_number', 'issue_date', 'seller_vat', 'buyer_vat', 'qr_code', 'cryptographic_stamp', 'total_amount']
};

/**
 * Validation functions for each standard
 */
export const validateInvoice = (standard, invoiceData) => {
    const requiredFields = REQUIRED_FIELDS[standard] || [];
    const missingFields = requiredFields.filter(field => !invoiceData[field]);
    
    return {
        valid: missingFields.length === 0,
        missingFields,
        standard: E_INVOICING_STANDARDS[standard.toUpperCase()]
    };
};