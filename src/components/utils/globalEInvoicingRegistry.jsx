// Global E-Invoicing Standards Registry
// Single source of truth for all e-invoicing standards across the platform

export const GLOBAL_EINVOICING_STANDARDS = {
    zatca_saudi: {
        code: 'zatca_saudi',
        name: 'Saudi Arabia (ZATCA)',
        country: 'SA',
        format: 'UBL 2.1 XML',
        status: 'mandatory',
        mandate_date: '2021-12-04',
        regions: ['Middle East'],
        api_endpoint: 'https://api.zatca.gov.sa'
    },
    ksef_poland: {
        code: 'ksef_poland',
        name: 'Poland (KSeF)',
        country: 'PL',
        format: 'FA(3) XML',
        status: 'mandatory',
        mandate_date: '2024-01-01',
        regions: ['Europe'],
        api_endpoint: 'https://ksef.mf.gov.pl'
    },
    peppol_belgium: {
        code: 'peppol_belgium',
        name: 'Belgium (Peppol)',
        country: 'BE',
        format: 'UBL 2.1',
        status: 'mandatory',
        mandate_date: '2026-01-01',
        regions: ['Europe'],
        api_endpoint: 'https://peppol.eu'
    },
    gst_india: {
        code: 'gst_india',
        name: 'India (GST e-Invoice)',
        country: 'IN',
        format: 'JSON',
        status: 'mandatory',
        mandate_date: '2020-10-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://einvoice1.gst.gov.in'
    },
    myinvois_malaysia: {
        code: 'myinvois_malaysia',
        name: 'Malaysia (MyInvois)',
        country: 'MY',
        format: 'UBL/JSON',
        status: 'mandatory',
        mandate_date: '2024-08-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://myinvois.hasil.gov.my'
    },
    efatura_turkey: {
        code: 'efatura_turkey',
        name: 'Turkey (e-Fatura)',
        country: 'TR',
        format: 'UBL-TR 1.2',
        status: 'mandatory',
        mandate_date: '2012-01-01',
        regions: ['Europe', 'Middle East'],
        api_endpoint: 'https://efatura.gib.gov.tr'
    },
    chorus_france: {
        code: 'chorus_france',
        name: 'France (Chorus Pro)',
        country: 'FR',
        format: 'UBL/CII',
        status: 'mandatory',
        mandate_date: '2020-01-01',
        regions: ['Europe'],
        api_endpoint: 'https://chorus-pro.gouv.fr'
    },
    coretax_indonesia: {
        code: 'coretax_indonesia',
        name: 'Indonesia (Coretax)',
        country: 'ID',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2024-07-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://coretax.pajak.go.id'
    },
    gdt_vietnam: {
        code: 'gdt_vietnam',
        name: 'Vietnam (GDT)',
        country: 'VN',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2022-07-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://hoadondientu.gdt.gov.vn'
    },
    nts_korea: {
        code: 'nts_korea',
        name: 'South Korea (NTS)',
        country: 'KR',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2011-01-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://www.nts.go.kr'
    },
    bir_philippines: {
        code: 'bir_philippines',
        name: 'Philippines (BIR)',
        country: 'PH',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2024-01-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://bir.gov.ph'
    },
    nfe_brazil: {
        code: 'nfe_brazil',
        name: 'Brazil (NF-e)',
        country: 'BR',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2008-04-01',
        regions: ['Latin America'],
        api_endpoint: 'https://www.nfe.fazenda.gov.br'
    },
    dte_chile: {
        code: 'dte_chile',
        name: 'Chile (DTE)',
        country: 'CL',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2003-08-01',
        regions: ['Latin America'],
        api_endpoint: 'https://www.sii.cl'
    },
    dian_colombia: {
        code: 'dian_colombia',
        name: 'Colombia (DIAN)',
        country: 'CO',
        format: 'UBL 2.1',
        status: 'mandatory',
        mandate_date: '2019-01-01',
        regions: ['Latin America'],
        api_endpoint: 'https://www.dian.gov.co'
    },
    sunat_peru: {
        code: 'sunat_peru',
        name: 'Peru (SUNAT)',
        country: 'PE',
        format: 'UBL 2.1',
        status: 'mandatory',
        mandate_date: '2010-12-01',
        regions: ['Latin America'],
        api_endpoint: 'https://www.sunat.gob.pe'
    },
    eta_egypt: {
        code: 'eta_egypt',
        name: 'Egypt (ETA)',
        country: 'EG',
        format: 'JSON/XML',
        status: 'mandatory',
        mandate_date: '2020-11-15',
        regions: ['Middle East & Africa'],
        api_endpoint: 'https://invoicing.eta.gov.eg'
    },
    fta_uae: {
        code: 'fta_uae',
        name: 'UAE (FTA)',
        country: 'AE',
        format: 'UBL 2.1/PDF',
        status: 'mandatory',
        mandate_date: '2026-01-01',
        regions: ['Middle East'],
        api_endpoint: 'https://tax.gov.ae'
    },
    etims_kenya: {
        code: 'etims_kenya',
        name: 'Kenya (eTIMS)',
        country: 'KE',
        format: 'JSON',
        status: 'mandatory',
        mandate_date: '2024-01-01',
        regions: ['Middle East & Africa'],
        api_endpoint: 'https://itax.kra.go.ke'
    },
    afip_argentina: {
        code: 'afip_argentina',
        name: 'Argentina (AFIP)',
        country: 'AR',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2011-01-01',
        regions: ['Latin America'],
        api_endpoint: 'https://www.afip.gob.ar'
    },
    cfe_uruguay: {
        code: 'cfe_uruguay',
        name: 'Uruguay (CFE)',
        country: 'UY',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2012-07-01',
        regions: ['Latin America'],
        api_endpoint: 'https://cfe.dgi.gub.uy'
    },
    jqis_japan: {
        code: 'jqis_japan',
        name: 'Japan (JQIS)',
        country: 'JP',
        format: 'Digital',
        status: 'planning',
        mandate_date: '2024-10-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://www.nta.go.jp'
    },
    etax_thailand: {
        code: 'etax_thailand',
        name: 'Thailand (e-Tax)',
        country: 'TH',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2022-01-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://etax.rd.go.th'
    },
    peppol_australia: {
        code: 'peppol_australia',
        name: 'Australia (Peppol)',
        country: 'AU',
        format: 'UBL',
        status: 'voluntary',
        mandate_date: null,
        regions: ['Asia Pacific'],
        api_endpoint: 'https://peppol.org'
    },
    erca_ethiopia: {
        code: 'erca_ethiopia',
        name: 'Ethiopia (ERCA)',
        country: 'ET',
        format: 'JSON/XML',
        status: 'mandatory',
        mandate_date: '2024-01-01',
        regions: ['Middle East & Africa'],
        api_endpoint: 'https://erca.gov.et'
    },
    vfd_tanzania: {
        code: 'vfd_tanzania',
        name: 'Tanzania (VFD)',
        country: 'TZ',
        format: 'JSON',
        status: 'mandatory',
        mandate_date: '2023-07-01',
        regions: ['Middle East & Africa'],
        api_endpoint: 'https://vfd.tra.go.tz'
    },
    facturae_spain: {
        code: 'facturae_spain',
        name: 'Spain (FacturaE)',
        country: 'ES',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2015-01-15',
        regions: ['Europe'],
        api_endpoint: 'https://face.gob.es'
    },
    fatturapa_italy: {
        code: 'fatturapa_italy',
        name: 'Italy (FatturaPA)',
        country: 'IT',
        format: 'XML',
        status: 'mandatory',
        mandate_date: '2019-01-01',
        regions: ['Europe'],
        api_endpoint: 'https://www.fatturapa.gov.it'
    },
    anaf_romania: {
        code: 'anaf_romania',
        name: 'Romania (ANAF)',
        country: 'RO',
        format: 'UBL/CII',
        status: 'mandatory',
        mandate_date: '2024-07-01',
        regions: ['Europe'],
        api_endpoint: 'https://efactura.anaf.ro'
    },
    pral_pakistan: {
        code: 'pral_pakistan',
        name: 'Pakistan (PRAL/FBR)',
        country: 'PK',
        format: 'JSON',
        status: 'mandatory',
        mandate_date: '2024-01-01',
        regions: ['Asia Pacific'],
        api_endpoint: 'https://iris.fbr.gov.pk'
    }
};

// Helper functions
export function getStandardByCode(code) {
    return GLOBAL_EINVOICING_STANDARDS[code];
}

export function getStandardsByCountry(countryCode) {
    return Object.values(GLOBAL_EINVOICING_STANDARDS).filter(
        std => std.country === countryCode
    );
}

export function getStandardsByRegion(region) {
    return Object.values(GLOBAL_EINVOICING_STANDARDS).filter(
        std => std.regions.includes(region)
    );
}

export function getMandatoryStandards() {
    return Object.values(GLOBAL_EINVOICING_STANDARDS).filter(
        std => std.status === 'mandatory'
    );
}

export function getStandardsArray() {
    return Object.values(GLOBAL_EINVOICING_STANDARDS);
}

export function getRegionalBreakdown() {
    const breakdown = {};
    Object.values(GLOBAL_EINVOICING_STANDARDS).forEach(std => {
        std.regions.forEach(region => {
            if (!breakdown[region]) {
                breakdown[region] = { total: 0, mandatory: 0, planning: 0, voluntary: 0 };
            }
            breakdown[region].total++;
            breakdown[region][std.status]++;
        });
    });
    return breakdown;
}

export const EINVOICING_STATISTICS = {
    total_standards: Object.keys(GLOBAL_EINVOICING_STANDARDS).length,
    total_countries: new Set(Object.values(GLOBAL_EINVOICING_STANDARDS).map(s => s.country)).size,
    mandatory_count: Object.values(GLOBAL_EINVOICING_STANDARDS).filter(s => s.status === 'mandatory').length,
    regions_covered: [...new Set(Object.values(GLOBAL_EINVOICING_STANDARDS).flatMap(s => s.regions))]
};