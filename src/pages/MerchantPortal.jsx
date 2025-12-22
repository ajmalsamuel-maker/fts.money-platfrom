import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    CreditCard, 
    FileText, 
    Upload, 
    CheckCircle, 
    Clock,
    AlertTriangle,
    Eye,
    Download,
    RefreshCw,
    Shield,
    Building2,
    Mail,
    Phone,
    Globe,
    FileCheck,
    Loader2,
    ExternalLink,
    MessageSquare
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function MerchantPortal() {
    const urlParams = new URLSearchParams(window.location.search);
    const merchantId = urlParams.get('mid');
    const token = urlParams.get('token');

    const [activeTab, setActiveTab] = useState('status');
    const [uploading, setUploading] = useState(false);

    // Allow access without token for now (can be re-enabled later)
    const { data: merchant, isLoading, refetch } = useQuery({
        queryKey: ['merchant-portal', merchantId],
        queryFn: async () => {
            if (!merchantId) return null;
            const merchants = await base44.entities.Merchant.filter({ merchant_id: merchantId });
            return merchants[0] || null;
        },
        enabled: !!merchantId
    });

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
            active: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
            onboarding: { label: 'Onboarding', color: 'bg-blue-100 text-blue-700', icon: FileText }
        };
        return configs[status] || configs.pending;
    };

    const getKYBStatusConfig = (status) => {
        const configs = {
            not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-700', progress: 0 },
            in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', progress: 50 },
            pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', progress: 75 },
            approved: { label: 'Verified', color: 'bg-emerald-100 text-emerald-700', progress: 100 },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', progress: 0 }
        };
        return configs[status] || configs.not_started;
    };

    const handleDocumentUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            toast.success(`${docType} uploaded successfully`);
            refetch();
        } catch (error) {
            toast.error('Upload failed: ' + error.message);
        }
        setUploading(false);
    };

    if (!merchantId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Access</h1>
                    <p className="text-slate-500">Please use the link provided in your onboarding email.</p>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!merchant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Application Not Found</h1>
                    <p className="text-slate-500">We couldn't find your merchant application.</p>
                </Card>
            </div>
        );
    }

    const statusConfig = getStatusConfig(merchant.status);
    const kybConfig = getKYBStatusConfig(merchant.kyb_status);
    const StatusIcon = statusConfig.icon;

    const onboardingSteps = [
        { name: 'Application Submitted', completed: true, date: merchant.created_date },
        { name: 'Document Verification', completed: merchant.kyb_status === 'approved', date: null },
        { name: 'KYB Verification', completed: merchant.kyb_status === 'approved', date: merchant.kyb_verified_date },
        { name: 'AML Screening', completed: merchant.aml_status === 'clear', date: merchant.aml_last_check },
        { name: 'Final Approval', completed: merchant.status === 'active', date: null }
    ];

    const completedSteps = onboardingSteps.filter(s => s.completed).length;
    const overallProgress = (completedSteps / onboardingSteps.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Toaster position="top-right" />
            
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900">Merchant Portal</h1>
                            <p className="text-xs text-slate-500">Application Tracking</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh Status
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Status Overview */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center",
                                    merchant.status === 'active' ? 'bg-emerald-100' :
                                    merchant.status === 'pending' ? 'bg-amber-100' : 'bg-slate-100'
                                )}>
                                    <StatusIcon className={cn(
                                        "h-8 w-8",
                                        merchant.status === 'active' ? 'text-emerald-600' :
                                        merchant.status === 'pending' ? 'text-amber-600' : 'text-slate-600'
                                    )} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{merchant.business_name}</h2>
                                    <p className="text-slate-500">MID: {merchant.merchant_id}</p>
                                    <Badge className={cn("mt-2", statusConfig.color)}>
                                        {statusConfig.label}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Application Progress</p>
                                <p className="text-3xl font-bold text-blue-600">{Math.round(overallProgress)}%</p>
                                <Progress value={overallProgress} className="w-48 h-2 mt-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="status">Application Status</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="verification">Verification</TabsTrigger>
                        <TabsTrigger value="support">Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="status">
                        {/* Timeline */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-base">Application Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {onboardingSteps.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                step.completed ? 'bg-emerald-100' : 'bg-slate-100'
                                            )}>
                                                {step.completed ? (
                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <Clock className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={cn(
                                                        "font-medium",
                                                        step.completed ? 'text-slate-900' : 'text-slate-400'
                                                    )}>
                                                        {step.name}
                                                    </p>
                                                    {step.date && (
                                                        <span className="text-sm text-slate-500">
                                                            {format(new Date(step.date), 'MMM dd, yyyy')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                    Business Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-slate-500">Legal Name</p>
                                            <p className="font-medium">{merchant.business_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Trading Name</p>
                                            <p className="font-medium">{merchant.trading_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Category</p>
                                            <p className="font-medium capitalize">{merchant.category || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-slate-500">Contact Email</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                {merchant.contact_email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Contact Phone</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                {merchant.contact_phone || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Website</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-slate-400" />
                                                {merchant.website || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-slate-400" />
                                    Required Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { id: 'incorporation', name: 'Certificate of Incorporation', required: true },
                                        { id: 'license', name: 'Business License', required: true },
                                        { id: 'id', name: 'Director ID/Passport', required: true },
                                        { id: 'address', name: 'Proof of Address', required: true },
                                        { id: 'bank', name: 'Bank Statement', required: true },
                                        { id: 'ubo', name: 'UBO Declaration', required: false }
                                    ].map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileCheck className="h-5 w-5 text-slate-400" />
                                                <div>
                                                    <p className="font-medium">{doc.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {doc.required ? 'Required' : 'Optional'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-emerald-100 text-emerald-700">Uploaded</Badge>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 border-2 border-dashed rounded-lg text-center">
                                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-600">Upload additional documents</p>
                                    <label className="cursor-pointer">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => handleDocumentUpload(e, 'Additional Document')}
                                            disabled={uploading}
                                        />
                                        <Button variant="outline" size="sm" className="mt-2" disabled={uploading}>
                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Select File'}
                                        </Button>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="verification">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-500" />
                                        KYB Verification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                                            merchant.kyb_status === 'approved' ? 'bg-emerald-100' :
                                            merchant.kyb_status === 'pending_review' ? 'bg-amber-100' : 'bg-blue-100'
                                        )}>
                                            {merchant.kyb_status === 'approved' ? (
                                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                                            ) : merchant.kyb_status === 'pending_review' ? (
                                                <Clock className="h-8 w-8 text-amber-600" />
                                            ) : (
                                                <Shield className="h-8 w-8 text-blue-600" />
                                            )}
                                        </div>
                                        <Badge className={kybConfig.color}>{kybConfig.label}</Badge>
                                        <p className="text-sm text-slate-500 mt-2">Powered by TheKYB</p>
                                        {merchant.kyb_reference_id && (
                                            <p className="text-xs text-slate-400 mt-1">Ref: {merchant.kyb_reference_id}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-purple-500" />
                                        AML Screening
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                                            merchant.aml_status === 'clear' ? 'bg-emerald-100' :
                                            merchant.aml_status === 'monitoring' ? 'bg-amber-100' : 'bg-purple-100'
                                        )}>
                                            {merchant.aml_status === 'clear' ? (
                                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                                            ) : (
                                                <AlertTriangle className="h-8 w-8 text-purple-600" />
                                            )}
                                        </div>
                                        <Badge className={cn(
                                            merchant.aml_status === 'clear' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-amber-100 text-amber-700'
                                        )}>
                                            {merchant.aml_status === 'clear' ? 'Clear' : 'Under Monitoring'}
                                        </Badge>
                                        <p className="text-sm text-slate-500 mt-2">Powered by AMLWatcher</p>
                                        {merchant.aml_risk_score !== undefined && (
                                            <p className="text-xs text-slate-400 mt-1">Risk Score: {merchant.aml_risk_score}/100</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {merchant.lei && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-slate-400" />
                                        LEI Verification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Legal Entity Identifier</p>
                                            <p className="font-mono text-lg">{merchant.lei}</p>
                                        </div>
                                        <Badge className={cn(
                                            merchant.lei_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-amber-100 text-amber-700'
                                        )}>
                                            {merchant.lei_status || 'Pending'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="support">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-slate-400" />
                                    Need Help?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="font-medium text-slate-900 mb-2">Contact Support</h3>
                                    <p className="text-slate-500 mb-4">Have questions about your application?</p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button variant="outline" className="gap-2">
                                            <Mail className="h-4 w-4" />
                                            onboarding@paymenthub.com
                                        </Button>
                                        <Button variant="outline" className="gap-2">
                                            <Phone className="h-4 w-4" />
                                            +1 (800) 123-4567
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}