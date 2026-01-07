import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceUploadManager({ merchantCode, onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [invoiceFormat, setInvoiceFormat] = useState('');
    const [uploading, setUploading] = useState(false);
    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationFn: async (data) => {
            // Upload file
            const uploadRes = await base44.integrations.Core.UploadFile({ file: data.file });
            
            // Process and standardize invoice
            const result = await base44.functions.invoke('processInvoice', {
                file_url: uploadRes.file_url,
                format: data.format,
                merchant_code: data.merchant_code
            });
            
            return result.data;
        },
        onSuccess: (data) => {
            toast.success('Invoice uploaded and processed successfully!');
            setFile(null);
            setInvoiceFormat('');
            queryClient.invalidateQueries(['merchant-invoices']);
            if (onUploadComplete) onUploadComplete(data);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to process invoice');
        }
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Auto-detect format based on file extension
            const extension = selectedFile.name.split('.').pop().toLowerCase();
            if (extension === 'xml') setInvoiceFormat('ubl');
            else if (extension === 'json') setInvoiceFormat('json');
            else if (extension === 'pdf') setInvoiceFormat('pdf');
            
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file || !invoiceFormat) {
            toast.error('Please select a file and format');
            return;
        }

        uploadMutation.mutate({
            file,
            format: invoiceFormat,
            merchant_code: merchantCode
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Invoice
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertDescription>
                        Upload invoices from your accounting system (SAP, Oracle, Xero, QuickBooks). 
                        Supported formats: UBL XML, JSON, PDF (with extraction)
                    </AlertDescription>
                </Alert>

                <div>
                    <Label>Invoice File</Label>
                    <Input
                        type="file"
                        accept=".xml,.json,.pdf"
                        onChange={handleFileChange}
                        disabled={uploadMutation.isPending}
                    />
                    {file && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <FileText className="h-4 w-4" />
                            {file.name}
                        </div>
                    )}
                </div>

                <div>
                    <Label>Invoice Format</Label>
                    <Select value={invoiceFormat} onValueChange={setInvoiceFormat}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ubl">UBL 2.1 (XML)</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="peppol">Peppol BIS 3.0</SelectItem>
                            <SelectItem value="facturx">Factur-X (PDF/A-3)</SelectItem>
                            <SelectItem value="edifact">EDIFACT</SelectItem>
                            <SelectItem value="pdf">PDF (Extract)</SelectItem>
                            <SelectItem value="sap">SAP IDoc</SelectItem>
                            <SelectItem value="oracle">Oracle EBS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button 
                    onClick={handleUpload} 
                    disabled={!file || !invoiceFormat || uploadMutation.isPending}
                    className="w-full"
                >
                    {uploadMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload & Process
                        </>
                    )}
                </Button>

                {uploadMutation.isSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Invoice processed and standardized successfully
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}