import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIDocumentManager() {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [batchName, setBatchName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const queryClient = useQueryClient();
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });

    const { data: documents, isLoading } = useQuery({
        queryKey: ['pci-documents'],
        queryFn: () => base44.entities.PCIDocument.list('-created_date', 100),
        enabled: !loading
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        
        toast.loading('Uploading files...');
        const uploaded = [];

        for (const file of files) {
            try {
                const result = await base44.integrations.Core.UploadFile({ file });
                uploaded.push({
                    name: file.name,
                    url: result.file_url
                });
            } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        setUploadedFiles(prev => [...prev, ...uploaded]);
        toast.success(`Uploaded ${uploaded.length} files`);
    };

    const handleProcessDocuments = async () => {
        if (uploadedFiles.length === 0) {
            toast.error('Please upload documents first');
            return;
        }

        setProcessing(true);
        setProgress(0);

        try {
            const fileUrls = uploadedFiles.map(f => f.url);
            
            const result = await base44.functions.invoke('processPCIDocuments', {
                file_urls: fileUrls,
                batch_name: batchName || `PCI Upload ${new Date().toLocaleDateString()}`
            });

            if (result.data.success) {
                toast.success(result.data.message);
                setUploadedFiles([]);
                setBatchName('');
                queryClient.invalidateQueries({ queryKey: ['pci-documents'] });
            }
        } catch (error) {
            toast.error('Processing failed: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const categoryColors = {
        security_policy: 'bg-blue-100 text-blue-800',
        technical_control: 'bg-purple-100 text-purple-800',
        audit_procedure: 'bg-green-100 text-green-800',
        training: 'bg-yellow-100 text-yellow-800',
        network_security: 'bg-red-100 text-red-800',
        access_control: 'bg-indigo-100 text-indigo-800',
        data_protection: 'bg-pink-100 text-pink-800',
        monitoring: 'bg-orange-100 text-orange-800',
        testing: 'bg-teal-100 text-teal-800',
        other: 'bg-slate-100 text-slate-800'
    };

    const priorityColors = {
        critical: 'bg-red-500 text-white',
        high: 'bg-orange-500 text-white',
        medium: 'bg-yellow-500 text-white',
        low: 'bg-green-500 text-white'
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIDocumentManager"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">PCI Compliance Documents</h1>
                        <p className="text-slate-600">Upload and process PCI DSS compliance documentation</p>
                    </div>

                    {/* Upload Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Upload PCI Documents</CardTitle>
                            <CardDescription>Upload Word or PDF documents for batch processing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Batch Name (Optional)</label>
                                <Input
                                    value={batchName}
                                    onChange={(e) => setBatchName(e.target.value)}
                                    placeholder="e.g., Q1 2026 PCI Audit"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Upload Documents</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                    <input
                                        type="file"
                                        multiple
                                        accept=".doc,.docx,.pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer inline-block">
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload').click()}>
                                            Select Files
                                        </Button>
                                    </label>
                                    <p className="text-sm text-slate-500 mt-2">Word or PDF files (52 documents)</p>
                                </div>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">{uploadedFiles.length} files ready to process:</p>
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                            <FileText className="h-4 w-4" />
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {processing && (
                                <div className="space-y-2">
                                    <Progress value={progress} />
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing documents...
                                    </p>
                                </div>
                            )}

                            <Button 
                                onClick={handleProcessDocuments}
                                disabled={uploadedFiles.length === 0 || processing}
                                className="w-full"
                            >
                                {processing ? 'Processing...' : `Process ${uploadedFiles.length} Documents`}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Processed Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Processed Documents ({documents?.length || 0})</CardTitle>
                            <CardDescription>View and manage processed PCI compliance documents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading...</div>
                            ) : documents?.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No documents processed yet</div>
                            ) : (
                                <div className="space-y-3">
                                    {documents?.map((doc) => (
                                        <div key={doc.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-slate-900">{doc.document_title}</h3>
                                                        <Badge className={categoryColors[doc.category]}>
                                                            {doc.category.replace('_', ' ')}
                                                        </Badge>
                                                        <Badge className={priorityColors[doc.priority]}>
                                                            {doc.priority}
                                                        </Badge>
                                                    </div>
                                                    {doc.pci_requirement && (
                                                        <p className="text-sm text-slate-600 mb-2">
                                                            <strong>Requirement:</strong> {doc.pci_requirement}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500">
                                                        Processed by {doc.processed_by} on {new Date(doc.created_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}