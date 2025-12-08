import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    Upload, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    Trash2, 
    Loader2,
    Eye,
    File,
    Image,
    Building2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const requiredDocuments = [
    { 
        id: 'certificate_incorporation', 
        name: 'Certificate of Incorporation', 
        description: 'Official company registration document',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png'
    },
    { 
        id: 'business_license', 
        name: 'Business License', 
        description: 'Valid business operating license',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png'
    },
    { 
        id: 'director_id', 
        name: 'Director ID/Passport', 
        description: 'Government-issued ID of primary director',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png'
    },
    { 
        id: 'proof_of_address', 
        name: 'Proof of Address', 
        description: 'Utility bill or bank statement (less than 3 months old)',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png'
    },
    { 
        id: 'bank_statement', 
        name: 'Bank Statement', 
        description: 'Recent bank statement (last 3 months)',
        required: true,
        accept: '.pdf'
    },
    { 
        id: 'ubo_declaration', 
        name: 'UBO Declaration', 
        description: 'Ultimate Beneficial Owner declaration form',
        required: false,
        accept: '.pdf'
    },
    { 
        id: 'processing_history', 
        name: 'Processing History', 
        description: 'Previous 6 months processing statements (if applicable)',
        required: false,
        accept: '.pdf,.csv,.xlsx'
    },
];

export default function DocumentUploadStep({ data, onChange, errors, merchantType }) {
    const [uploading, setUploading] = useState({});
    const [dragOver, setDragOver] = useState(null);

    const documents = data.documents || {};

    const handleUpload = async (docId, file) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [docId]: true }));
        
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            const updatedDocs = {
                ...documents,
                [docId]: {
                    name: file.name,
                    url: file_url,
                    uploadedAt: new Date().toISOString(),
                    size: file.size,
                    type: file.type
                }
            };
            
            onChange({ ...data, documents: updatedDocs });
            toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed: ' + error.message);
        }
        
        setUploading(prev => ({ ...prev, [docId]: false }));
    };

    const handleRemove = (docId) => {
        const updatedDocs = { ...documents };
        delete updatedDocs[docId];
        onChange({ ...data, documents: updatedDocs });
        toast.info('Document removed');
    };

    const handleDrop = (e, docId) => {
        e.preventDefault();
        setDragOver(null);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(docId, file);
    };

    const handleDragOver = (e, docId) => {
        e.preventDefault();
        setDragOver(docId);
    };

    // Filter documents based on merchant type
    const filteredDocs = requiredDocuments.filter(doc => {
        if (merchantType === 'sole_proprietorship' && doc.id === 'ubo_declaration') return false;
        return true;
    });

    const uploadedCount = Object.keys(documents).length;
    const requiredCount = filteredDocs.filter(d => d.required).length;
    const completedRequired = filteredDocs.filter(d => d.required && documents[d.id]).length;
    const progress = requiredCount > 0 ? (completedRequired / requiredCount) * 100 : 0;

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
        return <File className="h-4 w-4 text-slate-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900">Document Upload</h2>
                    <p className="text-sm text-slate-500">Upload required KYC and business documents</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium">{completedRequired}/{requiredCount} Required</p>
                    <Progress value={progress} className="w-32 h-2" />
                </div>
            </div>

            {errors?.documents && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-600">{errors.documents}</p>
                </div>
            )}

            <div className="grid gap-4">
                {filteredDocs.map((doc) => {
                    const uploaded = documents[doc.id];
                    const isUploading = uploading[doc.id];
                    const isDragOver = dragOver === doc.id;

                    return (
                        <div 
                            key={doc.id}
                            className={cn(
                                "border-2 rounded-lg p-4 transition-all",
                                uploaded ? "border-emerald-200 bg-emerald-50/50" : "border-dashed border-slate-200",
                                isDragOver && "border-blue-400 bg-blue-50",
                                errors?.[doc.id] && "border-red-300 bg-red-50"
                            )}
                            onDrop={(e) => handleDrop(e, doc.id)}
                            onDragOver={(e) => handleDragOver(e, doc.id)}
                            onDragLeave={() => setDragOver(null)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        uploaded ? "bg-emerald-100" : "bg-slate-100"
                                    )}>
                                        {uploaded ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <Upload className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-slate-900">{doc.name}</p>
                                            {doc.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-500">{doc.description}</p>
                                        
                                        {uploaded && (
                                            <div className="mt-2 flex items-center gap-3 text-sm">
                                                {getFileIcon(uploaded.type)}
                                                <span className="text-slate-700">{uploaded.name}</span>
                                                <span className="text-slate-400">({formatFileSize(uploaded.size)})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {uploaded ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(uploaded.url, '_blank')}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemove(doc.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept={doc.accept}
                                                className="hidden"
                                                onChange={(e) => handleUpload(doc.id, e.target.files[0])}
                                                disabled={isUploading}
                                            />
                                            <Button variant="outline" size="sm" disabled={isUploading} asChild>
                                                <span>
                                                    {isUploading ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4 mr-1" />
                                                    )}
                                                    Upload
                                                </span>
                                            </Button>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {errors?.[doc.id] && (
                                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors[doc.id]}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Document Guidelines</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
                    <li>• Documents must be clear and legible</li>
                    <li>• All documents must be in English or include certified translation</li>
                    <li>• Proof of address must be dated within the last 3 months</li>
                </ul>
            </div>
        </div>
    );
}