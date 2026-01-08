import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Comprehensive global e-invoicing mandate registry
const GLOBAL_EINVOICING_REGISTRY = {
    // Countries with active mandates (34 standards)
    'SA': { standard: 'ZATCA (FATOORA)', status: 'mandatory', phase: 'Phase 2 active', vat: '15%', deadline: null, format: 'UBL 2.1 XML' },
    'PL': { standard: 'KSeF', status: 'mandatory', phase: 'Active since 2022', vat: '23%', deadline: null, format: 'FA(3) XML' },
    'BE': { standard: 'B2B Peppol', status: 'mandatory', phase: 'B2B mandatory 2026', vat: '21%', deadline: '2026-01-01', format: 'UBL 2.1' },
    'IN': { standard: 'GST e-Invoice', status: 'mandatory', phase: 'Phased rollout', vat: '18%', deadline: null, format: 'JSON' },
    'MY': { standard: 'MyInvois (LHDN)', status: 'mandatory', phase: 'Phased 2024-2027', vat: '6-10%', deadline: '2027-01-01', format: 'UBL/JSON' },
    'RO': { standard: 'RO e-Factura (ANAF)', status: 'mandatory', phase: 'B2B/B2C active', vat: '19%', deadline: null, format: 'UBL 2.1' },
    'TR': { standard: 'e-Fatura (GIB)', status: 'mandatory', phase: 'Active since 2012', vat: '20%', deadline: null, format: 'UBL-TR 1.2' },
    'FR': { standard: 'Chorus Pro', status: 'mandatory', phase: 'B2G live, B2B 2026', vat: '20%', deadline: '2026-09-01', format: 'UBL/CII/Factur-X' },
    'ID': { standard: 'Coretax (e-Faktur)', status: 'mandatory', phase: 'Active since 2016', vat: '11%', deadline: null, format: 'XML' },
    'VN': { standard: 'GDT e-Invoice', status: 'mandatory', phase: 'Active since 2022', vat: '10%', deadline: null, format: 'XML' },
    'KR': { standard: 'NTS e-Tax', status: 'mandatory', phase: 'Active since 2011', vat: '10%', deadline: null, format: 'XML' },
    'PH': { standard: 'BIR e-Invoice', status: 'pilot', phase: 'Pilot phase', vat: '12%', deadline: '2027-06-01', format: 'XML' },
    'BR': { standard: 'NF-e/NFS-e', status: 'mandatory', phase: 'Active since 2006', vat: 'varies', deadline: null, format: 'XML' },
    'CL': { standard: 'DTE (SII)', status: 'mandatory', phase: 'Active since 2003', vat: '19%', deadline: null, format: 'XML' },
    'CO': { standard: 'DIAN', status: 'mandatory', phase: 'Active since 2019', vat: '19%', deadline: null, format: 'UBL 2.1' },
    'PE': { standard: 'CPE (SUNAT)', status: 'mandatory', phase: 'Phased rollout', vat: '18%', deadline: null, format: 'UBL 2.1' },
    'EG': { standard: 'ETA', status: 'mandatory', phase: 'Phased rollout', vat: '14%', deadline: null, format: 'JSON/XML' },
    'AE': { standard: 'FTA', status: 'active', phase: 'Phase 1 active', vat: '5%', deadline: null, format: 'UBL 2.1/PDF' },
    'KE': { standard: 'eTIMS (KRA)', status: 'mandatory', phase: 'Active since 2024', vat: '16%', deadline: null, format: 'JSON' },
    'AR': { standard: 'AFIP', status: 'mandatory', phase: 'Progressive mandate', vat: '21%', deadline: null, format: 'XML' },
    'UY': { standard: 'CFE (DGI)', status: 'mandatory', phase: 'Active since 2012', vat: '22%', deadline: null, format: 'XML' },
    'JP': { standard: 'Qualified Invoice (JQIS)', status: 'mandatory', phase: 'Active since 2023', vat: '10%', deadline: null, format: 'Digital' },
    'TH': { standard: 'e-Tax Invoice', status: 'voluntary', phase: 'Incentivized', vat: '7%', deadline: null, format: 'XML' },
    'AU': { standard: 'Peppol', status: 'mandatory', phase: 'B2G mandatory', vat: '10%', deadline: null, format: 'UBL' },
    'ET': { standard: 'ERCA', status: 'phased', phase: 'Phased rollout', vat: '15%', deadline: null, format: 'JSON/XML' },
    'TZ': { standard: 'VFD', status: 'mandatory', phase: 'Active since 2020', vat: '18%', deadline: null, format: 'JSON' },
    'MX': { standard: 'CFDI 4.0', status: 'mandatory', phase: 'Active since 2014', vat: '16%', deadline: null, format: 'XML' },
    'IT': { standard: 'FatturaPA (SDI)', status: 'mandatory', phase: 'Active since 2019', vat: '22%', deadline: null, format: 'XML' },
    'DE': { standard: 'XRechnung', status: 'mandatory', phase: 'B2G mandatory', vat: '19%', deadline: null, format: 'XML (CII/UBL)' },
    'ES': { standard: 'TicketBAI / FACe', status: 'mandatory', phase: 'Regional mandates', vat: '21%', deadline: null, format: 'XML' },
    'NL': { standard: 'Peppol', status: 'mandatory', phase: 'B2G mandatory', vat: '21%', deadline: null, format: 'UBL' },
    'PT': { standard: 'Peppol (ESPAP)', status: 'mandatory', phase: 'B2G mandatory', vat: '23%', deadline: null, format: 'UBL' },
    'SG': { standard: 'InvoiceNow (Peppol)', status: 'voluntary', phase: 'Incentivized', vat: '9%', deadline: null, format: 'UBL' },
    'PK': { standard: 'PRAL/FBR (IRIS)', status: 'mandatory', phase: 'Phased rollout', vat: '18%', deadline: null, format: 'JSON' },

    // Countries planning mandates
    'CN': { standard: 'Golden Tax System', status: 'planning', phase: 'Existing system, reforms planned', vat: '13%', deadline: '2027-01-01', format: 'TBD' },
    'ZA': { standard: 'SARS e-Filing', status: 'planning', phase: 'Under consideration', vat: '15%', deadline: '2027-06-01', format: 'TBD' },
    'RU': { standard: 'EDI System', status: 'active', phase: 'Active for some sectors', vat: '20%', deadline: null, format: 'XML' },
    'NG': { standard: 'FIRS e-Invoice', status: 'planning', phase: 'Pilot discussions', vat: '7.5%', deadline: '2028-01-01', format: 'TBD' },
    
    // Countries without mandates (monitoring)
    'US': { standard: 'None', status: 'no_mandate', phase: 'State-level requirements only', vat: 'varies', deadline: null, format: 'N/A' },
    'CA': { standard: 'None', status: 'no_mandate', phase: 'No federal mandate', vat: '5%', deadline: null, format: 'N/A' },
    'GB': { standard: 'MTD (Making Tax Digital)', status: 'active', phase: 'MTD for VAT live', vat: '20%', deadline: null, format: 'Digital records' },
    'CH': { standard: 'None', status: 'no_mandate', phase: 'No mandate', vat: '8.1%', deadline: null, format: 'N/A' },
    'NO': { standard: 'EHF (Peppol)', status: 'mandatory', phase: 'B2G mandatory', vat: '25%', deadline: null, format: 'UBL' },
    'SE': { standard: 'Peppol', status: 'mandatory', phase: 'B2G mandatory', vat: '25%', deadline: null, format: 'UBL' },
    'DK': { standard: 'NemHandel (Peppol)', status: 'mandatory', phase: 'B2G mandatory', vat: '25%', deadline: null, format: 'UBL' },
    'FI': { standard: 'Finvoice', status: 'mandatory', phase: 'B2G mandatory', vat: '25.5%', deadline: null, format: 'XML' },
    'AT': { standard: 'ebInterface', status: 'mandatory', phase: 'B2G mandatory', vat: '20%', deadline: null, format: 'XML' },
    'NZ': { standard: 'None', status: 'no_mandate', phase: 'No mandate', vat: '15%', deadline: null, format: 'N/A' },
    'IL': { standard: 'None', status: 'planning', phase: 'Considering implementation', vat: '17%', deadline: null, format: 'TBD' },
    'KW': { standard: 'None', status: 'no_mandate', phase: 'No VAT', vat: '0%', deadline: null, format: 'N/A' },
    'QA': { standard: 'None', status: 'no_mandate', phase: 'No mandate', vat: '0%', deadline: null, format: 'N/A' },
    'BH': { standard: 'None', status: 'no_mandate', phase: 'No mandate', vat: '10%', deadline: null, format: 'N/A' },
    'OM': { standard: 'None', status: 'no_mandate', phase: 'No mandate', vat: '5%', deadline: null, format: 'N/A' },
};

// Add remaining ~150+ countries without mandates
const COUNTRIES_NO_MANDATE = [
    'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AM', 'AZ', 'BS', 'BD', 'BB', 'BY', 'BZ', 'BJ', 'BT', 'BA', 
    'BW', 'BN', 'BF', 'BI', 'KH', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'CR', 'CI', 'HR', 'CU',
    'CY', 'CZ', 'DJ', 'DM', 'DO', 'EC', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'FJ', 'GA', 'GM', 'GE', 'GH',
    'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU', 'IS', 'IR', 'IQ', 'IE', 'JM', 'JO', 'KZ',
    'KI', 'KP', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MG', 'MW', 'MV', 'ML',
    'MT', 'MH', 'MR', 'MU', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NI',
    'NE', 'MK', 'PW', 'PS', 'PA', 'PG', 'PY', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SN', 'RS',
    'SC', 'SL', 'SK', 'SI', 'SB', 'SO', 'SS', 'LK', 'SD', 'SR', 'SY', 'TJ', 'TL', 'TG', 'TO', 'TT',
    'TN', 'TM', 'TV', 'UG', 'UA', 'UZ', 'VU', 'VE', 'YE', 'ZM', 'ZW'
];

COUNTRIES_NO_MANDATE.forEach(code => {
    if (!GLOBAL_EINVOICING_REGISTRY[code]) {
        GLOBAL_EINVOICING_REGISTRY[code] = {
            standard: 'None',
            status: 'no_mandate',
            phase: 'No e-invoicing mandate',
            vat: 'varies',
            deadline: null,
            format: 'N/A'
        };
    }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return comprehensive global registry
        const result = {
            timestamp: new Date().toISOString(),
            totalCountries: Object.keys(GLOBAL_EINVOICING_REGISTRY).length,
            statistics: {
                mandatory: Object.values(GLOBAL_EINVOICING_REGISTRY).filter(c => c.status === 'mandatory').length,
                active: Object.values(GLOBAL_EINVOICING_REGISTRY).filter(c => c.status === 'active').length,
                pilot: Object.values(GLOBAL_EINVOICING_REGISTRY).filter(c => c.status === 'pilot').length,
                planning: Object.values(GLOBAL_EINVOICING_REGISTRY).filter(c => c.status === 'planning').length,
                voluntary: Object.values(GLOBAL_EINVOICING_REGISTRY).filter(c => c.status === 'voluntary').length,
                no_mandate: Object.values(GLOBAL_EINVOICING_REGISTRY).filter(c => c.status === 'no_mandate').length
            },
            registry: GLOBAL_EINVOICING_REGISTRY,
            supported: [
                'SA', 'PL', 'BE', 'IN', 'MY', 'RO', 'TR', 'FR', 'ID', 'VN', 'KR', 'PH', 'BR', 'CL',
                'CO', 'PE', 'EG', 'AE', 'KE', 'AR', 'UY', 'JP', 'TH', 'AU', 'ET', 'TZ', 'MX', 'IT',
                'DE', 'ES', 'NL', 'PT', 'SG', 'PK'
            ],
            regions: {
                'Europe': Object.entries(GLOBAL_EINVOICING_REGISTRY).filter(([code]) => 
                    ['PL', 'BE', 'RO', 'TR', 'FR', 'IT', 'DE', 'ES', 'NL', 'PT', 'NO', 'SE', 'DK', 'FI', 'AT', 'GB', 'CH'].includes(code)
                ),
                'Asia Pacific': Object.entries(GLOBAL_EINVOICING_REGISTRY).filter(([code]) => 
                    ['IN', 'MY', 'ID', 'VN', 'KR', 'PH', 'JP', 'TH', 'AU', 'SG', 'PK', 'CN', 'NZ'].includes(code)
                ),
                'Latin America': Object.entries(GLOBAL_EINVOICING_REGISTRY).filter(([code]) => 
                    ['BR', 'CL', 'CO', 'PE', 'AR', 'UY', 'MX'].includes(code)
                ),
                'Middle East & Africa': Object.entries(GLOBAL_EINVOICING_REGISTRY).filter(([code]) => 
                    ['SA', 'EG', 'AE', 'KE', 'ET', 'TZ', 'ZA', 'NG', 'IL', 'KW', 'QA', 'BH', 'OM'].includes(code)
                )
            }
        };

        return Response.json(result);
    } catch (error) {
        console.error('Error checking global mandates:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});