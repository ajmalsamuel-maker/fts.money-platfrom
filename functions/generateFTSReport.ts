import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import * as XLSX from 'npm:xlsx@0.18.5';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { format, reportType, dateRange, data } = await req.json();

        if (format === 'csv') {
            return generateCSV(data, reportType);
        } else if (format === 'excel') {
            return generateExcel(data, reportType);
        } else if (format === 'pdf') {
            return generatePDF(data, reportType);
        }

        return Response.json({ error: 'Invalid format' }, { status: 400 });
    } catch (error) {
        console.error('Report generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateCSV(data, reportType) {
    let csvContent = '';

    if (reportType === 'overview' || reportType === 'psp_performance') {
        // PSP Performance Report
        csvContent = 'PSP Code,PSP Name,Status,Total Merchants,Monthly Volume,Monthly Revenue,Total Volume,Total Revenue\n';
        data.psps.forEach(psp => {
            csvContent += `${psp.psp_code},${psp.psp_name},${psp.status},${psp.total_merchants || 0},${psp.monthly_volume || 0},${psp.monthly_revenue || 0},${psp.total_volume || 0},${psp.total_revenue || 0}\n`;
        });
    } else if (reportType === 'revenue') {
        // Revenue Analysis
        csvContent = 'PSP Code,PSP Name,Monthly Revenue,Total Revenue,Revenue Share %\n';
        data.psps.forEach(psp => {
            csvContent += `${psp.psp_code},${psp.psp_name},${psp.monthly_revenue || 0},${psp.total_revenue || 0},${psp.revenue_share_percentage || 0}\n`;
        });
    } else if (reportType === 'services') {
        // Service Subscriptions
        csvContent = 'PSP Code,Service Name,Status,Base Fee,Variable Fee,Monthly Spent\n';
        data.subscriptions.forEach(sub => {
            csvContent += `${sub.psp_code},${sub.service_name},${sub.status},${sub.base_fee || 0},${sub.variable_fee || 0},${sub.monthly_spent || 0}\n`;
        });
    } else if (reportType === 'audit') {
        // Audit Trail - generate from actual logs if available
        csvContent = 'Date,PSP Code,Action,User,Field Changed,Old Value,New Value\n';
        csvContent += 'Sample audit data would go here\n';
    }

    return Response.json({ 
        content: csvContent,
        filename: `fts-report-${reportType}.csv`
    });
}

function generateExcel(data, reportType) {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        ['FTS.Money Platform Report'],
        ['Generated:', new Date().toISOString()],
        ['Report Type:', reportType],
        [],
        ['Key Metrics'],
        ['Total Revenue', `$${(data.metrics.totalRevenue / 1000000).toFixed(2)}M`],
        ['Monthly Revenue', `$${(data.metrics.monthlyRevenue / 1000).toFixed(0)}k`],
        ['Total Volume', `$${(data.metrics.totalVolume / 1000000).toFixed(1)}M`],
        ['Active PSPs', data.metrics.activePSPs],
        ['Total Merchants', data.metrics.totalMerchants],
        ['Active Subscriptions', data.metrics.activeSubscriptions]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // PSP Performance Sheet
    const pspData = [
        ['PSP Code', 'PSP Name', 'Status', 'Tier', 'Merchants', 'Monthly Volume', 'Monthly Revenue', 'Total Revenue']
    ];
    data.psps.forEach(psp => {
        pspData.push([
            psp.psp_code,
            psp.psp_name,
            psp.status,
            psp.tier || 'N/A',
            psp.total_merchants || 0,
            psp.monthly_volume || 0,
            psp.monthly_revenue || 0,
            psp.total_revenue || 0
        ]);
    });
    const pspSheet = XLSX.utils.aoa_to_sheet(pspData);
    XLSX.utils.book_append_sheet(workbook, pspSheet, 'PSP Performance');

    // Revenue by PSP Sheet
    const revenueData = [
        ['PSP Code', 'Monthly Revenue', 'Total Revenue', 'Volume']
    ];
    data.revenueByPSP.forEach(item => {
        revenueData.push([
            item.name,
            item.revenue,
            0, // Total would come from actual data
            item.volume
        ]);
    });
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Analysis');

    // Service Subscriptions Sheet
    if (data.subscriptions && data.subscriptions.length > 0) {
        const serviceData = [
            ['PSP Code', 'PSP Name', 'Service Name', 'Status', 'Base Fee', 'Monthly Spent']
        ];
        data.subscriptions.forEach(sub => {
            serviceData.push([
                sub.psp_code,
                sub.psp_name,
                sub.service_name,
                sub.status,
                sub.base_fee || 0,
                sub.monthly_spent || 0
            ]);
        });
        const serviceSheet = XLSX.utils.aoa_to_sheet(serviceData);
        XLSX.utils.book_append_sheet(workbook, serviceSheet, 'Service Subscriptions');
    }

    // Write to buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return Response.json({ 
        content: Array.from(excelBuffer).join(','), // Convert to comma-separated string for transport
        filename: `fts-report-${reportType}.xlsx`
    });
}

function generatePDF(data, reportType) {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text('FTS.Money Platform Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Report Type: ${reportType.replace(/_/g, ' ').toUpperCase()}`, 20, yPosition);
    yPosition += 15;

    // Key Metrics Box
    doc.setFillColor(59, 130, 246);
    doc.rect(20, yPosition, 170, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Key Metrics', 25, yPosition + 8);
    
    doc.setFontSize(9);
    doc.text(`Total Revenue: $${(data.metrics.totalRevenue / 1000000).toFixed(2)}M`, 25, yPosition + 16);
    doc.text(`Monthly Revenue: $${(data.metrics.monthlyRevenue / 1000).toFixed(0)}k`, 25, yPosition + 23);
    doc.text(`Active PSPs: ${data.metrics.activePSPs}`, 25, yPosition + 30);
    
    doc.text(`Total Volume: $${(data.metrics.totalVolume / 1000000).toFixed(1)}M`, 110, yPosition + 16);
    doc.text(`Total Merchants: ${data.metrics.totalMerchants}`, 110, yPosition + 23);
    doc.text(`Active Subscriptions: ${data.metrics.activeSubscriptions}`, 110, yPosition + 30);
    
    yPosition += 50;
    doc.setTextColor(0, 0, 0);

    // PSP Performance Table
    doc.setFontSize(14);
    doc.text('PSP Performance', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('PSP Code', 20, yPosition);
    doc.text('PSP Name', 50, yPosition);
    doc.text('Merchants', 100, yPosition);
    doc.text('Monthly Rev', 135, yPosition);
    doc.text('Status', 170, yPosition);
    yPosition += 7;

    doc.setFont(undefined, 'normal');
    data.psps.slice(0, 15).forEach(psp => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.text(psp.psp_code || '', 20, yPosition);
        doc.text((psp.psp_name || '').substring(0, 20), 50, yPosition);
        doc.text(String(psp.total_merchants || 0), 100, yPosition);
        doc.text(`$${((psp.monthly_revenue || 0) / 1000).toFixed(1)}k`, 135, yPosition);
        doc.text(psp.status || '', 170, yPosition);
        yPosition += 6;
    });

    // Revenue Chart (text representation)
    if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
    } else {
        yPosition += 15;
    }

    doc.setFontSize(14);
    doc.text('Top PSPs by Revenue', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    data.revenueByPSP.slice(0, 10).forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name}: $${(item.revenue / 1000).toFixed(1)}k`, 25, yPosition);
        yPosition += 6;
    });

    const pdfBase64 = btoa(doc.output());
    
    return Response.json({ 
        content: pdfBase64,
        filename: `fts-report-${reportType}.pdf`
    });
}