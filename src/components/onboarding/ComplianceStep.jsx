import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Shield, 
    Upload, 
    FileText, 
    Check, 
    X, 
    AlertCircle,
    Loader2,
    Building2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

const requiredDocuments = [
    {
        id: 'certificate_of_incorporation',
        name: 'Certificate of Incorporation',
        description: 'Official document proving business registration',
        required: true
    },
    {
        id: 'business_license',
        name: 'Business License',
        description: 'Valid operating license for your industry',
        required: true
    },
    {
        id: 'proof_of_address',
        name: 'Proof of Business Address',
        description: 'Utility bill or bank statement (less than 3 months old)',
        required: true
    },
    {
        id: 'director_id',
        name: 'Director/Owner ID',
        description: 'Passport or government-issued ID of primary director',
        required: true
    },
    {
        id: 'shareholder_register',
        name: 'Shareholder Register',
        description: 'List of shareholders with ownership percentages',
        required: true
    },
    {
        id: 'financial_statements',
        name: 'Financial Statements',
        description: 'Latest audited financial statements or tax returns',
        required: false
    },
    {
        id: 'aml_policy',
        name: 'AML Policy Document',
        description: 'Your Anti-Money Laundering policy (if applicable)',
        required: false
    },
];

export default function ComplianceStep({ data, onChange, errors }) {
    const [uploading, setUploading] = useState({});
    const documents = data.documents || {};
    const declarations = data.declarations || {};

    const handleFileUpload = async (docId, file) => {
        if (!file) return;
        
        setUploading(prev => ({ ...prev, [docId]: true }));
        
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const newDocuments = {
                ...documents,
                [docId]: {
                    file_url,
                    file_name: file.name,
                    uploaded_at: new Date().toISOString()
                }
            };
            onChange({ ...data, documents: newDocuments });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(prev => ({ ...prev, [docId]: false }));
        }
    };

    const removeDocument = (docId) => {
        const newDocuments = { ...documents };
        delete newDocuments[docId];
        onChange({ ...data, documents: newDocuments });
    };

    const handleDeclaration = (key, checked) => {
        onChange({ 
            ...data, 
            declarations: { ...declarations, [key]: checked } 
        });
    };

    const requiredDocsUploaded = requiredDocuments
        .filter(d => d.required)
        .every(d => documents[d.id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Compliance Documents</h2>
                    <p className="text-sm text-slate-500">Upload KYC/AML verification documents</p>
                </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
                <h3 className="font-medium text-slate-900">Required Documents</h3>
                
                {requiredDocuments.map((doc) => {
                    const uploaded = documents[doc.id];
                    const isUploading = uploading[doc.id];
                    const hasError = errors?.documents?.[doc.id];
                    
                    return (
                        <Card 
                            key={doc.id} 
                            className={cn(
                                "p-4",
                                uploaded ? "border-emerald-200 bg-emerald-50/50" : "",
                                hasError ? "border-red-300" : ""
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        uploaded ? "bg-emerald-100" : "bg-slate-100"
                                    )}>
                                        {uploaded ? (
                                            <Check className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {doc.name}
                                            {doc.required && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-slate-500">{doc.description}</p>
                                        {uploaded && (
                                            <p className="text-xs text-emerald-600 mt-1">
                                                ✓ {uploaded.file_name}
                                            </p>
                                        )}
                                        {hasError && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {hasError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {uploaded ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeDocument(doc.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <label>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                                                disabled={isUploading}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 cursor-pointer"
                                                asChild
                                                disabled={isUploading}
                                            >
                                                <span>
                                                    {isUploading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                    Upload
                                                </span>
                                            </Button>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Declarations */}
            <div className="space-y-4 pt-6 border-t">
                <h3 className="font-medium text-slate-900">Declarations & Acknowledgements</h3>
                
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="beneficial_owners"
                            checked={declarations.beneficial_owners || false}
                            onCheckedChange={(checked) => handleDeclaration('beneficial_owners', checked)}
                        />
                        <Label htmlFor="beneficial_owners" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                            I confirm that all beneficial owners with 25% or more ownership have been disclosed and their identification documents provided.
                        </Label>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="no_sanctions"
                            checked={declarations.no_sanctions || false}
                            onCheckedChange={(checked) => handleDeclaration('no_sanctions', checked)}
                        />
                        <Label htmlFor="no_sanctions" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                            I confirm that neither the business nor its directors/shareholders are subject to any sanctions, embargoes, or regulatory restrictions.
                        </Label>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="accurate_info"
                            checked={declarations.accurate_info || false}
                            onCheckedChange={(checked) => handleDeclaration('accurate_info', checked)}
                        />
                        <Label htmlFor="accurate_info" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                            I declare that all information provided is accurate and complete to the best of my knowledge, and I will notify of any changes.
                        </Label>
                    </div>
                </div>

                {errors?.declarations && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.declarations}
                    </p>
                )}
            </div>

            {/* Upload Summary */}
            <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Documents uploaded</span>
                    <span className={cn(
                        "font-medium",
                        requiredDocsUploaded ? "text-emerald-600" : "text-slate-900"
                    )}>
                        {Object.keys(documents).length} / {requiredDocuments.filter(d => d.required).length} required
                    </span>
                </div>
            </div>
        </div>
    );
}