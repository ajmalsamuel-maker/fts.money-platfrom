import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BusinessInvoiceImport() {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleFileUpload = async (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
    };

    const processImport = async () => {
        if (!file) return;

        setImporting(true);
        try {
            // Upload file first
            const uploadResponse = await base44.integrations.Core.UploadFile({ file });
            const fileUrl = uploadResponse.file_url;

            // Extract data from file
            const extractResponse = await base44.integrations.Core.ExtractDataFromUploadedFile({
                file_url: fileUrl,
                json_schema: {
                    type: 'object',
                    properties: {
                        invoices: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    invoice_number: { type: 'string' },
                                    issue_date: { type: 'string' },
                                    customer_name: { type: 'string' },
                                    amount: { type: 'number' },
                                    currency: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            });

            if (extractResponse.status === 'success') {
                setImportResult({
                    success: true,
                    invoices: extractResponse.output.invoices || [],
                    count: extractResponse.output.invoices?.length || 0
                });
            } else {
                setImportResult({
                    success: false,
                    error: extractResponse.details
                });
            }
        } catch (error) {
            setImportResult({
                success: false,
                error: error.message
            });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Import Invoice Data</h1>
                    <p className="text-slate-600 mt-1">Upload data from CSV, Excel, or connect accounting software</p>
                </div>

                <Tabs defaultValue="file">
                    <TabsList>
                        <TabsTrigger value="file">File Upload</TabsTrigger>
                        <TabsTrigger value="api">API Integration</TabsTrigger>
                        <TabsTrigger value="accounting">Accounting Software</TabsTrigger>
                    </TabsList>

                    <TabsContent value="file">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload CSV or Excel File</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-sm text-slate-600 mb-4">
                                        Drag and drop your file here, or click to browse
                                    </p>
                                    <Input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileUpload}
                                        className="max-w-xs mx-auto"
                                    />
                                    {file && (
                                        <div className="mt-4 text-sm text-slate-600">
                                            Selected: {file.name}
                                        </div>
                                    )}
                                </div>

                                <Alert>
                                    <AlertDescription>
                                        <strong>Required columns:</strong> invoice_number, issue_date, customer_name, amount, currency
                                    </AlertDescription>
                                </Alert>

                                <Button
                                    onClick={processImport}
                                    disabled={!file || importing}
                                    className="w-full"
                                >
                                    {importing ? 'Processing...' : 'Import Invoices'}
                                </Button>

                                {importResult && (
                                    <Alert className={importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                                        <AlertDescription>
                                            {importResult.success ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-green-800">
                                                        Successfully imported {importResult.count} invoices
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <span className="text-red-800">Import failed: {importResult.error}</span>
                                                </div>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="api">
                        <Card>
                            <CardHeader>
                                <CardTitle>API Integration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertDescription>
                                        Connect your systems using our REST API to automatically sync invoices.
                                    </AlertDescription>
                                </Alert>

                                <div className="p-4 bg-slate-900 rounded-lg">
                                    <code className="text-green-400 text-sm">
                                        POST https://api.fts.money/v1/invoices/import<br/>
                                        Authorization: Bearer YOUR_API_KEY
                                    </code>
                                </div>

                                <Button variant="outline" className="w-full">
                                    View API Documentation
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="accounting">
                        <Card>
                            <CardHeader>
                                <CardTitle>Connect Accounting Software</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {['QuickBooks', 'Xero', 'SAP', 'Oracle NetSuite'].map(software => (
                                        <Card key={software} className="hover:shadow-lg transition-shadow cursor-pointer">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <Database className="h-8 w-8 text-blue-600" />
                                                    <div>
                                                        <h3 className="font-semibold">{software}</h3>
                                                        <p className="text-sm text-slate-600">Connect now</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}