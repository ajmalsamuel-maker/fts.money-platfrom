import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const payload = await req.json();
        const {
            reportType,
            countries,
            regions,
            statuses,
            dateFrom,
            dateTo,
            groupBy,
            includeCharts,
            format
        } = payload;

        // Comprehensive global e-invoicing standards
        const mockStandards = [
            { country: 'Saudi Arabia', name: 'ZATCA', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2021-12-04', api_endpoint: '/api/zatca', regions: ['Middle East & Africa'] },
            { country: 'Poland', name: 'KSeF', format: 'FA(3)', status: 'mandatory', mandate_date: '2022-01-01', api_endpoint: '/api/ksef', regions: ['Europe'] },
            { country: 'India', name: 'GST e-Invoice', format: 'JSON', status: 'mandatory', mandate_date: '2020-10-01', api_endpoint: '/api/gst-india', regions: ['Asia Pacific'] },
            { country: 'France', name: 'Chorus Pro', format: 'UBL/CII', status: 'mandatory', mandate_date: '2020-01-01', api_endpoint: '/api/chorus-pro', regions: ['Europe'] },
            { country: 'Italy', name: 'FatturaPA', format: 'XML', status: 'mandatory', mandate_date: '2019-01-01', api_endpoint: '/api/fatturapa', regions: ['Europe'] },
            { country: 'Germany', name: 'XRechnung', format: 'XML', status: 'mandatory', mandate_date: '2020-11-27', api_endpoint: '/api/xrechnung', regions: ['Europe'] },
            { country: 'Spain', name: 'FacturaE', format: 'XML', status: 'mandatory', mandate_date: '2025-01-01', api_endpoint: '/api/facturae', regions: ['Europe'] },
            { country: 'Spain', name: 'SII', format: 'XML', status: 'mandatory', mandate_date: '2017-07-01', api_endpoint: '/api/sii', regions: ['Europe'] },
            { country: 'Brazil', name: 'NF-e', format: 'XML', status: 'mandatory', mandate_date: '2008-04-01', api_endpoint: '/api/nfe-brazil', regions: ['Latin America'] },
            { country: 'Brazil', name: 'NFC-e', format: 'XML', status: 'mandatory', mandate_date: '2013-01-01', api_endpoint: '/api/nfce', regions: ['Latin America'] },
            { country: 'Brazil', name: 'NFS-e', format: 'XML', status: 'mandatory', mandate_date: '2010-01-01', api_endpoint: '/api/nfse', regions: ['Latin America'] },
            { country: 'Mexico', name: 'CFDI', format: 'XML', status: 'mandatory', mandate_date: '2014-01-01', api_endpoint: '/api/cfdi', regions: ['Latin America'] },
            { country: 'Malaysia', name: 'MyInvois', format: 'XML', status: 'active', mandate_date: '2024-08-01', api_endpoint: '/api/myinvois', regions: ['Asia Pacific'] },
            { country: 'EU/EEA', name: 'PEPPOL', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2020-04-01', api_endpoint: '/api/peppol', regions: ['Europe'] },
            { country: 'Romania', name: 'ANAF e-Factura', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2022-07-01', api_endpoint: '/api/anaf', regions: ['Europe'] },
            { country: 'Austria', name: 'E-Rechnung.gv.at', format: 'ebInterface', status: 'mandatory', mandate_date: '2020-01-01', api_endpoint: '/api/erechnung-at', regions: ['Europe'] },
            { country: 'Belgium', name: 'InvoiceData.be', format: 'UBL/CII', status: 'planned', mandate_date: '2026-01-01', api_endpoint: '/api/invoicedata-be', regions: ['Europe'] },
            { country: 'Norway', name: 'EHF', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2019-04-01', api_endpoint: '/api/ehf', regions: ['Europe'] },
            { country: 'Sweden', name: 'Svefaktura', format: 'XML', status: 'recommended', mandate_date: '2008-01-01', api_endpoint: '/api/svefaktura', regions: ['Europe'] },
            { country: 'Finland', name: 'Finvoice', format: 'XML', status: 'mandatory', mandate_date: '2020-04-01', api_endpoint: '/api/finvoice', regions: ['Europe'] },
            { country: 'Denmark', name: 'NES (OIOUBL)', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2005-02-01', api_endpoint: '/api/nes-dk', regions: ['Europe'] },
            { country: 'Netherlands', name: 'Standard Business Reporting', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2020-04-01', api_endpoint: '/api/sbr-nl', regions: ['Europe'] },
            { country: 'Singapore', name: 'InvoiceNow (PEPPOL)', format: 'UBL 2.1', status: 'active', mandate_date: '2019-11-01', api_endpoint: '/api/invoicenow', regions: ['Asia Pacific'] },
            { country: 'Australia', name: 'PEPPOL AU-NZ', format: 'UBL 2.1', status: 'active', mandate_date: '2020-02-01', api_endpoint: '/api/peppol-au', regions: ['Asia Pacific'] },
            { country: 'New Zealand', name: 'PEPPOL AU-NZ', format: 'UBL 2.1', status: 'active', mandate_date: '2019-10-01', api_endpoint: '/api/peppol-nz', regions: ['Asia Pacific'] },
            { country: 'Japan', name: 'JP PINT', format: 'XML', status: 'planned', mandate_date: '2023-10-01', api_endpoint: '/api/jp-pint', regions: ['Asia Pacific'] },
            { country: 'China', name: 'Golden Tax System', format: 'XML', status: 'mandatory', mandate_date: '1994-01-01', api_endpoint: '/api/fapiao', regions: ['Asia Pacific'] },
            { country: 'Taiwan', name: 'E-Invoice (eZTax)', format: 'XML', status: 'mandatory', mandate_date: '2017-01-01', api_endpoint: '/api/eztax', regions: ['Asia Pacific'] },
            { country: 'South Korea', name: 'National Tax Service e-Tax', format: 'XML', status: 'mandatory', mandate_date: '2011-01-01', api_endpoint: '/api/etax-kr', regions: ['Asia Pacific'] },
            { country: 'Thailand', name: 'e-Tax Invoice', format: 'XML', status: 'active', mandate_date: '2022-01-01', api_endpoint: '/api/etax-th', regions: ['Asia Pacific'] },
            { country: 'Vietnam', name: 'General Department Taxation', format: 'XML', status: 'mandatory', mandate_date: '2022-07-01', api_endpoint: '/api/einvoice-vn', regions: ['Asia Pacific'] },
            { country: 'Indonesia', name: 'e-Faktur', format: 'XML', status: 'mandatory', mandate_date: '2015-07-01', api_endpoint: '/api/efaktur', regions: ['Asia Pacific'] },
            { country: 'Philippines', name: 'EIS (e-Invoice System)', format: 'XML', status: 'planned', mandate_date: '2024-07-01', api_endpoint: '/api/eis-ph', regions: ['Asia Pacific'] },
            { country: 'UAE', name: 'Federal Tax Authority', format: 'XML', status: 'planned', mandate_date: '2026-01-01', api_endpoint: '/api/fta-uae', regions: ['Middle East & Africa'] },
            { country: 'Turkey', name: 'e-Fatura', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2012-01-01', api_endpoint: '/api/efatura', regions: ['Europe'] },
            { country: 'Egypt', name: 'Egyptian Tax Authority', format: 'JSON/UBL', status: 'mandatory', mandate_date: '2020-11-15', api_endpoint: '/api/eta-eg', regions: ['Middle East & Africa'] },
            { country: 'South Africa', name: 'PEPPOL SA', format: 'UBL 2.1', status: 'active', mandate_date: '2022-01-01', api_endpoint: '/api/peppol-za', regions: ['Middle East & Africa'] },
            { country: 'Guatemala', name: 'FEL', format: 'XML', status: 'mandatory', mandate_date: '2019-07-01', api_endpoint: '/api/fel-gt', regions: ['Latin America'] },
            { country: 'Chile', name: 'DTE', format: 'XML', status: 'mandatory', mandate_date: '2003-08-01', api_endpoint: '/api/dte-cl', regions: ['Latin America'] },
            { country: 'Costa Rica', name: 'Factura Electrónica', format: 'XML', status: 'mandatory', mandate_date: '2018-10-01', api_endpoint: '/api/fe-cr', regions: ['Latin America'] },
            { country: 'Argentina', name: 'Factura Electrónica (AFIP)', format: 'XML', status: 'mandatory', mandate_date: '2009-01-01', api_endpoint: '/api/fe-ar', regions: ['Latin America'] },
            { country: 'Colombia', name: 'Factura Electrónica (DIAN)', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2019-01-01', api_endpoint: '/api/fe-co', regions: ['Latin America'] },
            { country: 'Peru', name: 'Factura Electrónica (SUNAT)', format: 'UBL 2.1', status: 'mandatory', mandate_date: '2014-03-01', api_endpoint: '/api/fe-pe', regions: ['Latin America'] },
            { country: 'Ecuador', name: 'Factura Electrónica (SRI)', format: 'XML', status: 'mandatory', mandate_date: '2015-11-01', api_endpoint: '/api/fe-ec', regions: ['Latin America'] },
            { country: 'Uruguay', name: 'CFE', format: 'XML', status: 'mandatory', mandate_date: '2012-04-01', api_endpoint: '/api/cfe-uy', regions: ['Latin America'] },
            { country: 'Panama', name: 'Factura Electrónica', format: 'XML', status: 'active', mandate_date: '2021-03-01', api_endpoint: '/api/fe-pa', regions: ['Latin America'] },
            { country: 'United States', name: 'EDI/ANSI X12', format: 'EDI', status: 'active', mandate_date: '1980-01-01', api_endpoint: '/api/edi-us', regions: ['North America'] },
            { country: 'Canada', name: 'PEPPOL CA', format: 'UBL 2.1', status: 'active', mandate_date: '2021-01-01', api_endpoint: '/api/peppol-ca', regions: ['North America'] }
        ];

        // Filter standards based on criteria
        let filteredStandards = mockStandards;

        if (countries && countries.length > 0) {
            filteredStandards = filteredStandards.filter(std => countries.includes(std.country));
        }

        if (regions && regions.length > 0) {
            filteredStandards = filteredStandards.filter(std => 
                std.regions.some(r => regions.includes(r))
            );
        }

        if (statuses && statuses.length > 0) {
            filteredStandards = filteredStandards.filter(std => statuses.includes(std.status));
        }

        // Group data
        let groupedData = {};
        if (groupBy === 'country') {
            filteredStandards.forEach(std => {
                if (!groupedData[std.country]) {
                    groupedData[std.country] = [];
                }
                groupedData[std.country].push(std);
            });
        } else if (groupBy === 'region') {
            filteredStandards.forEach(std => {
                std.regions.forEach(region => {
                    if (!groupedData[region]) {
                        groupedData[region] = [];
                    }
                    groupedData[region].push(std);
                });
            });
        } else if (groupBy === 'status') {
            filteredStandards.forEach(std => {
                if (!groupedData[std.status]) {
                    groupedData[std.status] = [];
                }
                groupedData[std.status].push(std);
            });
        }

        // Generate report content based on type and format
        let reportContent = '';
        const timestamp = new Date().toISOString();

        if (format === 'csv') {
            reportContent = generateCSV(filteredStandards, groupBy);
        } else if (format === 'json') {
            reportContent = JSON.stringify({
                reportType,
                timestamp,
                filters: { countries, regions, statuses, dateFrom, dateTo },
                data: groupedData,
                summary: {
                    total_standards: filteredStandards.length,
                    total_countries: new Set(filteredStandards.map(s => s.country)).size,
                    by_status: getStatusBreakdown(filteredStandards)
                }
            }, null, 2);
        } else {
            // PDF or Excel - return structured data for client-side processing
            reportContent = JSON.stringify({
                reportType,
                timestamp,
                data: groupedData,
                charts: includeCharts ? generateChartData(filteredStandards) : null
            });
        }

        return Response.json({
            success: true,
            content: reportContent,
            filename: `compliance-report-${timestamp.split('T')[0]}.${format}`,
            summary: {
                total_records: filteredStandards.length,
                grouped_by: groupBy
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateCSV(standards, groupBy) {
    let csv = 'Country,Standard,Format,Status,Mandate Date,API Endpoint,Regions\n';
    
    standards.forEach(std => {
        csv += `"${std.country}","${std.name}","${std.format}","${std.status}","${std.mandate_date || 'N/A'}","${std.api_endpoint}","${std.regions.join('; ')}"\n`;
    });

    return csv;
}

function getStatusBreakdown(standards) {
    const breakdown = {};
    standards.forEach(std => {
        breakdown[std.status] = (breakdown[std.status] || 0) + 1;
    });
    return breakdown;
}

function generateChartData(standards) {
    // Regional breakdown
    const regionalData = {};
    standards.forEach(std => {
        std.regions.forEach(region => {
            regionalData[region] = (regionalData[region] || 0) + 1;
        });
    });

    // Status distribution
    const statusData = {};
    standards.forEach(std => {
        statusData[std.status] = (statusData[std.status] || 0) + 1;
    });

    return {
        regional: Object.entries(regionalData).map(([name, count]) => ({ name, count })),
        status: Object.entries(statusData).map(([name, count]) => ({ name, count }))
    };
}