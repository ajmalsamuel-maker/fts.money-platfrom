import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar } from 'lucide-react';

export default function ComplianceAuditReport() {
  const [reportType, setReportType] = useState('pci-dss');
  const [dateRange, setDateRange] = useState('30days');
  const [generatedReports, setGeneratedReports] = useState([
    { id: 1, type: 'PCI-DSS', generated: '2026-01-10', period: 'Q1 2026', status: 'completed', file: 'PCI-DSS-Q1-2026.pdf' },
    { id: 2, type: 'SOC 2', generated: '2026-01-05', period: 'Q4 2025', status: 'completed', file: 'SOC2-Q4-2025.pdf' },
  ]);

  const reportTypes = [
    { value: 'pci-dss', label: 'PCI-DSS Compliance Report', description: 'Payment Card Industry Data Security Standard' },
    { value: 'soc2', label: 'SOC 2 Type II Report', description: 'Service Organization Control audit' },
    { value: 'iso27001', label: 'ISO 27001 Audit', description: 'Information Security Management' },
    { value: 'gdpr', label: 'GDPR Compliance Report', description: 'Data Protection & Privacy' },
  ];

  const handleGenerateReport = () => {
    const newReport = {
      id: generatedReports.length + 1,
      type: reportTypes.find(t => t.value === reportType)?.label.split(' ')[0],
      generated: new Date().toISOString().split('T')[0],
      period: `${dateRange} period`,
      status: 'processing',
      file: `Report-${Date.now()}.pdf`
    };
    setGeneratedReports([newReport, ...generatedReports]);

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReports(prev => 
        prev.map(r => r.id === newReport.id ? { ...r, status: 'completed' } : r)
      );
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Compliance Audit Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generator */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
          <h3 className="font-medium">Generate New Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last 1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateReport} className="w-full gap-2">
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {/* Generated Reports */}
        <div>
          <h3 className="font-medium mb-3">Generated Reports</h3>
          <div className="space-y-2">
            {generatedReports.map(report => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{report.type} - {report.period}</p>
                  <p className="text-sm text-slate-600">Generated: {report.generated}</p>
                </div>
                <div className="flex items-center gap-3">
                  {report.status === 'processing' ? (
                    <Badge className="bg-yellow-100 text-yellow-800">Processing...</Badge>
                  ) : (
                    <>
                      <Badge className="bg-green-100 text-green-800">Ready</Badge>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Details */}
        <div className="p-3 bg-slate-50 rounded-lg text-sm">
          <p className="font-medium mb-2">Report Details</p>
          <ul className="space-y-1 text-slate-600">
            <li>• Includes all audit trail events for the selected period</li>
            <li>• Covers user access, data changes, and system configurations</li>
            <li>• Compliance framework mappings included</li>
            <li>• Digitally signed for authenticity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}