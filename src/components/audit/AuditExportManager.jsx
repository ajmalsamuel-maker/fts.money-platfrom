import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileJson, FileText, File } from 'lucide-react';

export default function AuditExportManager() {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-01-17');
  const [exports, setExports] = useState([
    {
      id: 1,
      filename: 'audit-export-2026-01-17.pdf',
      format: 'PDF',
      generated: '2026-01-17 14:30:00',
      size: '2.4 MB',
      records: 1245,
      status: 'ready'
    },
    {
      id: 2,
      filename: 'audit-export-2026-01-10.csv',
      format: 'CSV',
      generated: '2026-01-10 16:15:00',
      size: '1.8 MB',
      records: 856,
      status: 'ready'
    },
  ]);

  const handleExport = () => {
    const newExport = {
      id: exports.length + 1,
      filename: `audit-export-${new Date().toISOString().split('T')[0]}.${exportFormat.toLowerCase()}`,
      format: exportFormat.toUpperCase(),
      generated: new Date().toLocaleString(),
      size: '...',
      records: '...',
      status: 'processing'
    };
    setExports([newExport, ...exports]);

    // Simulate export
    setTimeout(() => {
      setExports(prev =>
        prev.map(e =>
          e.id === newExport.id
            ? { ...e, status: 'ready', size: Math.random() > 0.5 ? '2.4 MB' : '1.8 MB', records: Math.floor(Math.random() * 1000 + 800) }
            : e
        )
      );
    }, 2000);
  };

  const getFormatIcon = (format) => {
    switch(format) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'CSV': return <File className="w-4 h-4" />;
      case 'JSON': return <FileJson className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Export Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF (Compliance Report)</SelectItem>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="json">JSON (Machine Readable)</SelectItem>
                <SelectItem value="xml">XML (Archive Format)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">From Date</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">To Date</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="p-3 bg-blue-50 rounded text-xs text-slate-700">
            <p className="font-medium mb-1">Include in Export:</p>
            <ul className="space-y-1">
              <li>✓ All audit events</li>
              <li>✓ User actions</li>
              <li>✓ System changes</li>
              <li>✓ Digital signatures</li>
            </ul>
          </div>

          <Button onClick={handleExport} className="w-full gap-2">
            <Download className="w-4 h-4" />
            Generate Export
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exports.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(exp.format)}
                    <div>
                      <p className="font-medium text-sm">{exp.filename}</p>
                      <div className="flex gap-2 mt-1 text-xs text-slate-600">
                        <span>{exp.records} records</span>
                        <span>•</span>
                        <span>{exp.size}</span>
                        <span>•</span>
                        <span>{exp.generated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.status === 'processing' ? (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}