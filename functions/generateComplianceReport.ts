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

        // Mock standards data for report generation
        const mockStandards = [
            { country: 'Saudi Arabia', name: 'ZATCA', format: 'UBL 2.1', status: 'mandatory', regions: ['Middle East & Africa'] },
            { country: 'Poland', name: 'KSeF', format: 'FA(3)', status: 'mandatory', regions: ['Europe'] },
            { country: 'India', name: 'GST e-Invoice', format: 'JSON', status: 'mandatory', regions: ['Asia Pacific'] },
            { country: 'France', name: 'Chorus Pro', format: 'UBL/CII', status: 'mandatory', regions: ['Europe'] },
            { country: 'Italy', name: 'FatturaPA', format: 'XML', status: 'mandatory', regions: ['Europe'] },
            { country: 'Germany', name: 'XRechnung', format: 'XML', status: 'mandatory', regions: ['Europe'] },
            { country: 'Spain', name: 'FacturaE', format: 'XML', status: 'mandatory', regions: ['Europe'] },
            { country: 'Brazil', name: 'NF-e', format: 'XML', status: 'mandatory', regions: ['Latin America'] },
            { country: 'Mexico', name: 'CFDI', format: 'XML', status: 'mandatory', regions: ['Latin America'] },
            { country: 'Malaysia', name: 'MyInvois', format: 'XML', status: 'active', regions: ['Asia Pacific'] }
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