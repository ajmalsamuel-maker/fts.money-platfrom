import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { 
    CheckCircle2, AlertCircle, Clock, Upload, FileText, 
    Shield, Calendar, TrendingUp, Download, X
} from 'lucide-react';

const COMPLIANCE_REQUIREMENTS = [
    { id: 'lei_verification', title: 'LEI Verification', description: 'Valid Legal Entity Identifier', frequency: 'Annual' },
    { id: 'financial_statements', title: 'Financial Statements', description: 'Audited financial statements', frequency: 'Annual' },
    { id: 'aml_policy', title: 'AML/KYC Policy', description: 'Anti-Money Laundering policy documentation', frequency: 'Annual' },
    { id: 'asset_valuation', title: 'Asset Valuation Report', description: 'Independent asset valuation', frequency: 'Quarterly' },
    { id: 'director_certification', title: 'Director Certification', description: 'Board of directors certification', frequency: 'Annual' },
    { id: 'regulatory_licenses', title: 'Regulatory Licenses', description: 'Valid regulatory licenses and permits', frequency: 'Annual' },
    { id: 'investor_reporting', title: 'Investor Reporting', description: 'Quarterly investor reports', frequency: 'Quarterly' },
    { id: 'audit_report', title: 'External Audit', description: 'Third-party audit report', frequency: 'Annual' }
];

export default function AssetIssuerCompliance() {
    const { issuer } = useAssetIssuerAuth();
    const queryClient = useQueryClient();
    const [uploadDialog, setUploadDialog] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [expiryDate, setExpiryDate] = useState('');

    // Fetch issuer with documents
    const { data: issuerData } = useQuery({
        queryKey: ['issuer-data', issuer?.id],
        queryFn: async () => {
            const data = await base44.entities.AssetIssuer.filter({ id: issuer.id });
            return data[0];
        },
        enabled: !!issuer
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ file, requirement, expiryDate }) => {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            const documents = issuerData?.documents || [];
            documents.push({
                requirement_id: requirement.id,
                requirement_title: requirement.title,
                file_name: file.name,
                file_url,
                upload_date: new Date().toISOString(),
                expiry_date: expiryDate,
                status: 'pending'
            });

            await base44.entities.AssetIssuer.update(issuer.id, { documents });
            return documents;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['issuer-data']);
            setUploadDialog(false);
            setUploadFile(null);
            setSelectedRequirement(null);
            setExpiryDate('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (docIndex) => {
            const documents = [...(issuerData?.documents || [])];
            documents.splice(docIndex, 1);
            await base44.entities.AssetIssuer.update(issuer.id, { documents });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['issuer-data']);
        }
    });

    // Calculate compliance score
    const getComplianceStatus = (requirementId) => {
        const docs = (issuerData?.documents || []).filter(d => d.requirement_id === requirementId);
        const validDoc = docs.find(d => {
            if (!d.expiry_date) return true;
            return new Date(d.expiry_date) > new Date();
        });
        return validDoc ? 'compliant' : 'missing';
    };

    const compliantCount = COMPLIANCE_REQUIREMENTS.filter(r => getComplianceStatus(r.id) === 'compliant').length;
    const complianceScore = Math.round((compliantCount / COMPLIANCE_REQUIREMENTS.length) * 100);

    // Get upcoming deadlines
    const upcomingDeadlines = (issuerData?.documents || [])
        .filter(d => d.expiry_date)
        .map(d => ({ ...d, daysUntil: Math.ceil((new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) }))
        .filter(d => d.daysUntil > 0 && d.daysUntil <= 90)
        .sort((a, b) => a.daysUntil - b.daysUntil);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) setUploadFile(file);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerCompliance"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Compliance Management</h1>
                        <p className="text-slate-600">Track and manage your regulatory compliance requirements</p>
                    </div>

                    {/* Dashboard Overview */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Compliance Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-bold">{complianceScore}%</p>
                                    <TrendingUp className={`h-5 w-5 mb-1 ${complianceScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`} />
                                </div>
                                <Progress value={complianceScore} className="mt-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Compliant Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">
                                    {compliantCount}/{COMPLIANCE_REQUIREMENTS.length}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Requirements met</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Upcoming Deadlines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-orange-600">{upcomingDeadlines.length}</p>
                                <p className="text-xs text-slate-500 mt-1">Next 90 days</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerts */}
                    {upcomingDeadlines.length > 0 && (
                        <Card className="mb-6 border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-900">
                                    <AlertCircle className="h-5 w-5" />
                                    Upcoming Regulatory Deadlines
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {upcomingDeadlines.slice(0, 3).map((deadline, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-orange-600" />
                                                <div>
                                                    <p className="font-medium text-slate-900">{deadline.requirement_title}</p>
                                                    <p className="text-xs text-slate-600">{deadline.file_name}</p>
                                                </div>
                                            </div>
                                            <Badge className={
                                                deadline.daysUntil <= 30 ? 'bg-red-100 text-red-700' :
                                                deadline.daysUntil <= 60 ? 'bg-orange-100 text-orange-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }>
                                                {deadline.daysUntil} days
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Compliance Checklist */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Compliance Requirements Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {COMPLIANCE_REQUIREMENTS.map(requirement => {
                                    const status = getComplianceStatus(requirement.id);
                                    const docs = (issuerData?.documents || []).filter(d => d.requirement_id === requirement.id);
                                    
                                    return (
                                        <div key={requirement.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {status === 'compliant' ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                                    ) : (
                                                        <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-900">{requirement.title}</h3>
                                                        <p className="text-sm text-slate-600">{requirement.description}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {requirement.frequency} renewal
                                                            </Badge>
                                                            {docs.length > 0 && (
                                                                <span className="text-xs text-slate-500">
                                                                    {docs.length} document{docs.length > 1 ? 's' : ''} uploaded
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedRequirement(requirement);
                                                        setUploadDialog(true);
                                                    }}
                                                >
                                                    <Upload className="h-3 w-3 mr-1" />
                                                    Upload
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Compliance Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!issuerData?.documents || issuerData.documents.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No documents uploaded yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {issuerData.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3 hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-slate-900">{doc.requirement_title}</p>
                                                    <p className="text-xs text-slate-600">{doc.file_name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-500">
                                                            Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                                                        </span>
                                                        {doc.expiry_date && (
                                                            <span className="text-xs text-slate-500">
                                                                • Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={
                                                    doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }>
                                                    {doc.status}
                                                </Badge>
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => deleteMutation.mutate(idx)}
                                                >
                                                    <X className="h-3 w-3 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upload Dialog */}
                    <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Compliance Document</DialogTitle>
                            </DialogHeader>
                            {selectedRequirement && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="font-medium text-blue-900">{selectedRequirement.title}</p>
                                        <p className="text-sm text-blue-700">{selectedRequirement.description}</p>
                                    </div>
                                    <div>
                                        <Label>Document File</Label>
                                        <Input
                                            type="file"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                        {uploadFile && (
                                            <p className="text-xs text-slate-600 mt-1">Selected: {uploadFile.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Expiry Date (Optional)</Label>
                                        <Input
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Leave blank if document does not expire
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => uploadMutation.mutate({ 
                                            file: uploadFile, 
                                            requirement: selectedRequirement,
                                            expiryDate 
                                        })}
                                        disabled={!uploadFile || uploadMutation.isPending}
                                        className="w-full"
                                    >
                                        {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}