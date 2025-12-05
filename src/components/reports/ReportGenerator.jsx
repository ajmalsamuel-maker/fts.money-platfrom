import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import jsPDF from 'jspdf';

export function generateCSV(data, columns, filename) {
    let csvContent = columns.map(c => c.header).join(',') + '\n';
    data.forEach(row => {
        csvContent += columns.map(c => {
            const value = c.accessor(row);
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
}

export function generatePDF(title, data, columns, filename, options = {}) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 14, 22);
    
    // Subtitle with date range
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    if (options.dateRange) {
        doc.text(`Period: ${format(options.dateRange.from, 'MMM d, yyyy')} - ${format(options.dateRange.to, 'MMM d, yyyy')}`, 14, 30);
    }
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 36);
    
    // Summary stats if provided
    let yPos = 46;
    if (options.summary) {
        doc.setFillColor(241, 245, 249);
        doc.rect(14, yPos - 4, pageWidth - 28, 20, 'F');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        let xPos = 20;
        options.summary.forEach((stat, i) => {
            doc.setFont(undefined, 'normal');
            doc.text(stat.label + ':', xPos, yPos + 4);
            doc.setFont(undefined, 'bold');
            doc.text(stat.value, xPos, yPos + 11);
            xPos += 45;
        });
        yPos += 28;
    }
    
    // Table header
    const colWidth = (pageWidth - 28) / columns.length;
    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    columns.forEach((col, i) => {
        doc.text(col.header, 16 + (i * colWidth), yPos + 5.5);
    });
    yPos += 10;
    
    // Table rows
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    data.forEach((row, rowIndex) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, yPos - 4, pageWidth - 28, 8, 'F');
        }
        
        columns.forEach((col, i) => {
            const value = String(col.accessor(row) || '');
            doc.text(value.substring(0, 25), 16 + (i * colWidth), yPos);
        });
        yPos += 8;
    });
    
    // Footer
    if (options.footer) {
        yPos += 10;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(options.footer, 14, yPos);
    }
    
    doc.save(filename);
    toast.success(`Downloaded ${filename}`);
}

const reportTypes = [
    { 
        id: 'daily_sales', 
        name: 'Daily Sales Summary', 
        description: 'Transaction totals grouped by day',
        icon: '📊'
    },
    { 
        id: 'monthly_sales', 
        name: 'Monthly Sales Summary', 
        description: 'Monthly revenue and transaction breakdown',
        icon: '📈'
    },
    { 
        id: 'settlement', 
        name: 'Settlement Report', 
        description: 'Detailed settlement and payout records',
        icon: '💰'
    },
    { 
        id: 'chargeback', 
        name: 'Chargeback Report', 
        description: 'Chargeback cases and resolution status',
        icon: '⚠️'
    },
    { 
        id: 'payout', 
        name: 'Payout Summary', 
        description: 'Merchant payout history and details',
        icon: '💳'
    },
    { 
        id: 'fee_statement', 
        name: 'Fee Statement', 
        description: 'Processing fees breakdown by merchant',
        icon: '📋'
    },
];

export default function ReportGenerator({ 
    dateRange, 
    merchant, 
    provider,
    transactions = [],
    settlements = [],
    chargebacks = [],
    payouts = []
}) {
    const [generating, setGenerating] = useState(null);

    const generateReport = async (reportId, exportFormat) => {
        setGenerating(`${reportId}_${exportFormat}`);
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const dateStr = dateRange?.from ? `${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}` : format(new Date(), 'yyyy-MM-dd');
        
        switch (reportId) {
            case 'daily_sales': {
                const columns = [
                    { header: 'Date', accessor: (r) => r.date },
                    { header: 'Transactions', accessor: (r) => r.count },
                    { header: 'Volume', accessor: (r) => `$${r.volume.toLocaleString()}` },
                    { header: 'Fees', accessor: (r) => `$${r.fees.toLocaleString()}` },
                    { header: 'Net', accessor: (r) => `$${r.net.toLocaleString()}` },
                ];
                const data = generateDailySalesData();
                const filename = `Daily_Sales_${dateStr}`;
                
                if (exportFormat === 'csv') {
                    generateCSV(data, columns, `${filename}.csv`);
                } else {
                    generatePDF('Daily Sales Summary', data, columns, `${filename}.pdf`, {
                        dateRange,
                        summary: [
                            { label: 'Total Volume', value: `$${data.reduce((s, d) => s + d.volume, 0).toLocaleString()}` },
                            { label: 'Total Fees', value: `$${data.reduce((s, d) => s + d.fees, 0).toLocaleString()}` },
                            { label: 'Transactions', value: data.reduce((s, d) => s + d.count, 0).toLocaleString() },
                        ]
                    });
                }
                break;
            }
            case 'monthly_sales': {
                const columns = [
                    { header: 'Month', accessor: (r) => r.month },
                    { header: 'Transactions', accessor: (r) => r.count },
                    { header: 'Volume', accessor: (r) => `$${r.volume.toLocaleString()}` },
                    { header: 'Avg Ticket', accessor: (r) => `$${r.avgTicket.toFixed(2)}` },
                    { header: 'Success Rate', accessor: (r) => `${r.successRate}%` },
                ];
                const data = generateMonthlySalesData();
                const filename = `Monthly_Sales_${dateStr}`;
                
                if (exportFormat === 'csv') {
                    generateCSV(data, columns, `${filename}.csv`);
                } else {
                    generatePDF('Monthly Sales Summary', data, columns, `${filename}.pdf`, { dateRange });
                }
                break;
            }
            case 'settlement': {
                const columns = [
                    { header: 'Settlement ID', accessor: (r) => r.id },
                    { header: 'Merchant', accessor: (r) => r.merchant },
                    { header: 'Period', accessor: (r) => r.period },
                    { header: 'Gross', accessor: (r) => `$${r.gross.toLocaleString()}` },
                    { header: 'Net', accessor: (r) => `$${r.net.toLocaleString()}` },
                    { header: 'Status', accessor: (r) => r.status },
                ];
                const data = generateSettlementData();
                const filename = `Settlement_Report_${dateStr}`;
                
                if (exportFormat === 'csv') {
                    generateCSV(data, columns, `${filename}.csv`);
                } else {
                    generatePDF('Settlement Report', data, columns, `${filename}.pdf`, { dateRange });
                }
                break;
            }
            case 'chargeback': {
                const columns = [
                    { header: 'Case ID', accessor: (r) => r.id },
                    { header: 'Merchant', accessor: (r) => r.merchant },
                    { header: 'Amount', accessor: (r) => `$${r.amount.toLocaleString()}` },
                    { header: 'Reason', accessor: (r) => r.reason },
                    { header: 'Status', accessor: (r) => r.status },
                    { header: 'Due Date', accessor: (r) => r.dueDate },
                ];
                const data = generateChargebackData();
                const filename = `Chargeback_Report_${dateStr}`;
                
                if (exportFormat === 'csv') {
                    generateCSV(data, columns, `${filename}.csv`);
                } else {
                    generatePDF('Chargeback Report', data, columns, `${filename}.pdf`, { dateRange });
                }
                break;
            }
            case 'payout': {
                const columns = [
                    { header: 'Payout ID', accessor: (r) => r.id },
                    { header: 'Merchant', accessor: (r) => r.merchant },
                    { header: 'Amount', accessor: (r) => `$${r.amount.toLocaleString()}` },
                    { header: 'Date', accessor: (r) => r.date },
                    { header: 'Method', accessor: (r) => r.method },
                    { header: 'Status', accessor: (r) => r.status },
                ];
                const data = generatePayoutData();
                const filename = `Payout_Summary_${dateStr}`;
                
                if (exportFormat === 'csv') {
                    generateCSV(data, columns, `${filename}.csv`);
                } else {
                    generatePDF('Payout Summary', data, columns, `${filename}.pdf`, { dateRange });
                }
                break;
            }
            case 'fee_statement': {
                const columns = [
                    { header: 'Merchant', accessor: (r) => r.merchant },
                    { header: 'Volume', accessor: (r) => `$${r.volume.toLocaleString()}` },
                    { header: 'MDR Fees', accessor: (r) => `$${r.mdrFees.toLocaleString()}` },
                    { header: 'Fixed Fees', accessor: (r) => `$${r.fixedFees.toLocaleString()}` },
                    { header: 'Total Fees', accessor: (r) => `$${r.totalFees.toLocaleString()}` },
                ];
                const data = generateFeeData();
                const filename = `Fee_Statement_${dateStr}`;
                
                if (exportFormat === 'csv') {
                    generateCSV(data, columns, `${filename}.csv`);
                } else {
                    generatePDF('Fee Statement', data, columns, `${filename}.pdf`, { dateRange });
                }
                break;
            }
        }
        
        setGenerating(null);
    };

    // Sample data generators
    const generateDailySalesData = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const volume = Math.floor(Math.random() * 50000) + 10000;
            const fees = Math.floor(volume * 0.025);
            days.push({
                date: format(date, 'MMM d, yyyy'),
                count: Math.floor(Math.random() * 500) + 100,
                volume,
                fees,
                net: volume - fees
            });
        }
        return days;
    };

    const generateMonthlySalesData = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const volume = Math.floor(Math.random() * 500000) + 100000;
            const count = Math.floor(Math.random() * 5000) + 1000;
            months.push({
                month: format(date, 'MMMM yyyy'),
                count,
                volume,
                avgTicket: volume / count,
                successRate: (Math.random() * 3 + 96).toFixed(1)
            });
        }
        return months;
    };

    const generateSettlementData = () => [
        { id: 'SET-001', merchant: 'TechCorp Solutions', period: 'Dec 1-7', gross: 125000, net: 121875, status: 'Completed' },
        { id: 'SET-002', merchant: 'Global Retail Inc', period: 'Dec 1-7', gross: 89000, net: 86765, status: 'Completed' },
        { id: 'SET-003', merchant: 'GameZone Ltd', period: 'Dec 1-7', gross: 156000, net: 152100, status: 'Processing' },
        { id: 'SET-004', merchant: 'Fashion Forward', period: 'Dec 1-7', gross: 67000, net: 65325, status: 'Pending' },
    ];

    const generateChargebackData = () => [
        { id: 'CB-001', merchant: 'TechCorp Solutions', amount: 450, reason: 'Fraud', status: 'Open', dueDate: 'Dec 15' },
        { id: 'CB-002', merchant: 'Global Retail Inc', amount: 1200, reason: 'Not Received', status: 'Responded', dueDate: 'Dec 12' },
        { id: 'CB-003', merchant: 'GameZone Ltd', amount: 89, reason: 'Duplicate', status: 'Won', dueDate: 'Dec 8' },
    ];

    const generatePayoutData = () => [
        { id: 'PAY-001', merchant: 'TechCorp Solutions', amount: 121875, date: 'Dec 8', method: 'Wire', status: 'Completed' },
        { id: 'PAY-002', merchant: 'Global Retail Inc', amount: 86765, date: 'Dec 8', method: 'ACH', status: 'Completed' },
        { id: 'PAY-003', merchant: 'GameZone Ltd', amount: 152100, date: 'Dec 9', method: 'Wire', status: 'Processing' },
    ];

    const generateFeeData = () => [
        { merchant: 'TechCorp Solutions', volume: 125000, mdrFees: 2500, fixedFees: 625, totalFees: 3125 },
        { merchant: 'Global Retail Inc', volume: 89000, mdrFees: 1780, fixedFees: 455, totalFees: 2235 },
        { merchant: 'GameZone Ltd', volume: 156000, mdrFees: 3120, fixedFees: 780, totalFees: 3900 },
        { merchant: 'Fashion Forward', volume: 67000, mdrFees: 1340, fixedFees: 335, totalFees: 1675 },
    ];

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-2xl">{report.icon}</div>
                            <Badge variant="outline" className="text-xs">Pre-defined</Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{report.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">{report.description}</p>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 gap-1"
                                onClick={() => generateReport(report.id, 'csv')}
                                disabled={generating === `${report.id}_csv`}
                            >
                                {generating === `${report.id}_csv` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                                CSV
                            </Button>
                            <Button 
                                size="sm" 
                                className="flex-1 gap-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => generateReport(report.id, 'pdf')}
                                disabled={generating === `${report.id}_pdf`}
                            >
                                {generating === `${report.id}_pdf` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                                PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}