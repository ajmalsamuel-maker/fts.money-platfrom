import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import {
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    Search,
    Globe,
    Ban,
    UserX,
    FileWarning,
    ExternalLink,
    Info,
    Building
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function UniversalComplianceCheck({ 
    entityData, 
    entityType = 'company', // 'company', 'acquirer', 'apm_provider', 'individual'
    onComplete,
    existingKYB = null,
    existingAML = null
}) {
    const [activeTab, setActiveTab] = useState('kyb');
    const [kybStatus, setKybStatus] = useState(existingKYB?.status || 'not_started');
    const [amlStatus, setAmlStatus] = useState(existingAML?.status || 'not_started');
    const [kybResult, setKybResult] = useState(existingKYB || null);
    const [amlResult, setAmlResult] = useState(existingAML || null);
    const [isVerifying, setIsVerifying] = useState(false);

    const kybChecks = [
        { id: 'company_registry', name: 'Company Registry Verification', icon: Building },
        { id: 'ubo_identification', name: 'UBO Identification', icon: UserX },
        { id: 'director_verification', name: 'Director Verification', icon: UserX },
        { id: 'address_verification', name: 'Address Verification', icon: Globe },
        { id: 'document_verification', name: 'Document Verification', icon: FileWarning },
    ];

    const amlChecks = [
        { id: 'sanctions', name: 'Global Sanctions Lists', icon: Ban },
        { id: 'pep', name: 'PEP Screening', icon: UserX },
        { id: 'adverse_media', name: 'Adverse Media', icon: FileWarning },
        { id: 'watchlists', name: 'Watchlists', icon: Search },
        { id: 'country_risk', name: 'Country Risk Assessment', icon: Globe },
    ];

    const runKYBVerification = async () => {
        setIsVerifying(true);
        setKybStatus('in_progress');

        try {
            const response = await base44.functions.invoke('kybVerification', {
                company_name: entityData.name || entityData.business_name,
                registration_number: entityData.registration_number,
                country: entityData.country,
                business_type: entityData.business_type || entityType,
                merchant_id: entityData.id
            });

            if (response.data?.success) {
                setKybResult(response.data.verification);
                setKybStatus(response.data.verification.kyb_status);
            } else {
                setKybResult(response.data?.verification || {});
                setKybStatus('pending_review');
            }
        } catch (error) {
            console.error('KYB Error:', error);
            setKybStatus('rejected');
            setKybResult({ error: error.message });
        } finally {
            setIsVerifying(false);
        }
    };

    const runAMLScreening = async () => {
        setIsVerifying(true);
        setAmlStatus('in_progress');

        try {
            const response = await base44.functions.invoke('amlScreening', {
                name: entityData.name || entityData.business_name,
                entity_type: entityType === 'individual' ? 'Person' : 'Company',
                country: entityData.country ? [entityData.country] : [],
                birth_incorporation_date: entityData.incorporation_date || entityData.birth_date,
                ongoing_monitoring: true,
                merchant_id: entityData.id,
                client_reference: `${entityType.toUpperCase()}-${entityData.id || Date.now()}`
            });

            if (response.data?.success) {
                setAmlResult(response.data.screening);
                setAmlStatus(response.data.screening.aml_status);
            } else {
                throw new Error('AML screening failed');
            }
        } catch (error) {
            console.error('AML Error:', error);
            setAmlStatus('monitoring');
            setAmlResult({ error: error.message, aml_status: 'monitoring' });
        } finally {
            setIsVerifying(false);
        }
    };

    const getStatusBadge = (status) => {
        const configs = {
            not_started: { label: 'Not Started', className: 'bg-slate-100 text-slate-700' },
            in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
            approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
            clear: { label: 'Clear', className: 'bg-emerald-100 text-emerald-700' },
            pending_review: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700' },
            monitoring: { label: 'Monitoring', className: 'bg-amber-100 text-amber-700' },
            flagged: { label: 'Flagged', className: 'bg-red-100 text-red-700' },
            rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        };
        return configs[status] || configs.not_started;
    };

    const getCheckIcon = (status) => {
        switch (status) {
            case 'passed':
            case 'clear':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'failed':
            case 'match':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'needs_review':
            case 'potential_match':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'in_progress':
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
            default:
                return <div className="h-5 w-5 rounded-full border-2 border-slate-300" />;
        }
    };

    const isComplete = kybStatus !== 'not_started' && amlStatus !== 'not_started';
    const canProceed = ['approved', 'pending_review'].includes(kybStatus) && 
                       ['clear', 'monitoring'].includes(amlStatus);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6 text-purple-600" />
                            <div>
                                <CardTitle>Compliance Verification</CardTitle>
                                <p className="text-sm text-slate-500">KYB & AML screening required for onboarding</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={getStatusBadge(kybStatus).className}>
                                KYB: {getStatusBadge(kybStatus).label}
                            </Badge>
                            <Badge className={getStatusBadge(amlStatus).className}>
                                AML: {getStatusBadge(amlStatus).label}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="kyb">KYB Verification</TabsTrigger>
                            <TabsTrigger value="aml">AML Screening</TabsTrigger>
                        </TabsList>

                        {/* KYB Tab */}
                        <TabsContent value="kyb" className="space-y-4">
                            <Alert className="bg-blue-50 border-blue-200">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-700">
                                    We use <a href="https://thekyb.com" target="_blank" rel="noopener noreferrer" className="font-medium underline">TheKYB</a> for 
                                    business verification including registry checks and UBO identification.
                                </AlertDescription>
                            </Alert>

                            {kybStatus === 'not_started' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                        <Building className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Start KYB Verification</h3>
                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                        Verify {entityData.name || 'this entity'} against official business registries
                                    </p>
                                    <Button 
                                        onClick={runKYBVerification}
                                        disabled={isVerifying}
                                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                        Start Verification
                                    </Button>
                                </div>
                            )}

                            {kybStatus !== 'not_started' && kybResult && (
                                <div className="space-y-4">
                                    {kybResult.checks && Object.keys(kybResult.checks).map((checkKey) => {
                                        const check = kybResult.checks[checkKey];
                                        const checkDef = kybChecks.find(c => c.id === checkKey) || { name: checkKey, icon: Shield };
                                        return (
                                            <div 
                                                key={checkKey}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-lg border",
                                                    check.status === 'passed' ? "bg-emerald-50 border-emerald-200" :
                                                    check.status === 'needs_review' ? "bg-amber-50 border-amber-200" :
                                                    check.status === 'failed' ? "bg-red-50 border-red-200" : "bg-slate-50"
                                                )}
                                            >
                                                {getCheckIcon(check.status)}
                                                <div className="flex-1">
                                                    <p className="font-medium">{checkDef.name}</p>
                                                    <p className="text-sm text-slate-500">{check.details}</p>
                                                </div>
                                                {check.confidence_score && (
                                                    <Badge variant="outline">Score: {check.confidence_score}%</Badge>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {kybResult.kyb_reference_id && (
                                        <Card className="bg-slate-50 border-slate-200">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-500">Reference ID</p>
                                                    <p className="font-mono font-medium">{kybResult.kyb_reference_id}</p>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href="https://backoffice.thekyb.com" target="_blank" rel="noopener noreferrer" className="gap-1">
                                                        View <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* AML Tab */}
                        <TabsContent value="aml" className="space-y-4">
                            <Alert className="bg-purple-50 border-purple-200">
                                <Info className="h-4 w-4 text-purple-600" />
                                <AlertDescription className="text-purple-700">
                                    We use <a href="https://amlwatcher.com" target="_blank" rel="noopener noreferrer" className="font-medium underline">AMLWatcher</a> for 
                                    sanctions, PEP, and adverse media screening.
                                </AlertDescription>
                            </Alert>

                            {amlStatus === 'not_started' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                        <Shield className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Start AML Screening</h3>
                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                        Screen against global sanctions, PEP, and watchlists
                                    </p>
                                    <Button 
                                        onClick={runAMLScreening}
                                        disabled={isVerifying}
                                        className="gap-2 bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        Start Screening
                                    </Button>
                                </div>
                            )}

                            {amlStatus !== 'not_started' && amlResult && (
                                <div className="space-y-4">
                                    {amlResult.checks && Object.keys(amlResult.checks).map((checkKey) => {
                                        const check = amlResult.checks[checkKey];
                                        const checkDef = amlChecks.find(c => c.id === checkKey) || { name: checkKey, icon: Shield };
                                        const CheckIcon = checkDef.icon;
                                        return (
                                            <div 
                                                key={checkKey}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-lg border",
                                                    check.status === 'clear' ? "bg-emerald-50 border-emerald-200" :
                                                    check.status === 'potential_match' ? "bg-amber-50 border-amber-200" :
                                                    check.status === 'match' ? "bg-red-50 border-red-200" : "bg-slate-50"
                                                )}
                                            >
                                                {getCheckIcon(check.status)}
                                                <div className="flex-1">
                                                    <p className="font-medium">{checkDef.name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {check.matches?.length > 0 ? `${check.matches.length} potential matches found` : 'No matches found'}
                                                    </p>
                                                </div>
                                                {check.risk_score > 0 && (
                                                    <Badge variant="outline">Risk: {check.risk_score}</Badge>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {amlResult.alerts && amlResult.alerts.length > 0 && (
                                        <Alert className="bg-amber-50 border-amber-200">
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <AlertDescription className="text-amber-700">
                                                <strong>{amlResult.alerts.length} Alert(s) Detected</strong> - Manual review required
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {amlResult.aml_reference_id && (
                                        <Card className="bg-slate-50 border-slate-200">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-500">Reference ID</p>
                                                    <p className="font-mono font-medium">{amlResult.aml_reference_id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-500">Risk Score</p>
                                                    <p className={cn(
                                                        "font-bold text-lg",
                                                        amlResult.aml_risk_score < 25 ? "text-emerald-600" :
                                                        amlResult.aml_risk_score < 50 ? "text-amber-600" : "text-red-600"
                                                    )}>
                                                        {amlResult.aml_risk_score || 0}/100
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {isComplete && canProceed && onComplete && (
                        <Button onClick={() => onComplete({ kyb: kybResult, aml: amlResult })} className="w-full mt-6">
                            Continue with Onboarding
                        </Button>
                    )}

                    {isComplete && !canProceed && (
                        <Alert className="mt-6 bg-amber-50 border-amber-200">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-700">
                                <strong>Manual Review Required</strong> - Our compliance team will review the results within 24-48 hours.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}