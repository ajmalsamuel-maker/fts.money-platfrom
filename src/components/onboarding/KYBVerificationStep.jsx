import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
    Building2, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Loader2,
    ExternalLink,
    Info,
    AlertTriangle,
    Users,
    FileText,
    Search,
    Shield
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const kybChecks = [
    { id: 'company_registry', name: 'Company Registry Verification', description: 'Verify registration with official registries' },
    { id: 'ubo_identification', name: 'UBO Identification', description: 'Identify Ultimate Beneficial Owners (25%+)' },
    { id: 'director_verification', name: 'Director Verification', description: 'Verify directors and officers' },
    { id: 'address_verification', name: 'Address Verification', description: 'Confirm registered business address' },
    { id: 'document_verification', name: 'Document Verification', description: 'Validate submitted documents' },
];

export default function KYBVerificationStep({ data, onChange, errors, businessData, contactData }) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [checkProgress, setCheckProgress] = useState({});
    const [overallStatus, setOverallStatus] = useState(data.kyb_status || 'not_started');

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const initiateKYBVerification = async () => {
        setIsVerifying(true);
        handleChange('kyb_status', 'in_progress');
        handleChange('kyb_initiated_at', new Date().toISOString());
        setOverallStatus('in_progress');

        try {
            // Simulate progress for UI feedback
            for (let i = 0; i < kybChecks.length; i++) {
                const check = kybChecks[i];
                setCheckProgress(prev => ({
                    ...prev,
                    [check.id]: 'in_progress'
                }));
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Call real KYB verification API
            const response = await base44.functions.invoke('kybVerification', {
                company_name: businessData?.business_name || data.business_name,
                registration_number: businessData?.registration_number || data.registration_number,
                country: businessData?.country || data.country,
                business_type: businessData?.business_type || data.business_type,
                merchant_id: data.merchant_id
            });

            if (response.data?.success && response.data?.verification) {
                const verification = response.data.verification;
                const checks = verification.checks || {};

                // Update check progress from API results
                const newCheckProgress = {};
                Object.keys(checks).forEach(checkKey => {
                    newCheckProgress[checkKey] = checks[checkKey].status;
                    handleChange(`kyb_check_${checkKey}`, checks[checkKey]);
                });

                setCheckProgress(newCheckProgress);
                setOverallStatus(verification.kyb_status);
                handleChange('kyb_status', verification.kyb_status);
                handleChange('kyb_reference_id', verification.kyb_reference_id);
                handleChange('kyb_completed_at', new Date().toISOString());
                handleChange('company_verified', verification.company_verified);
                
                if (verification.company_data) {
                    handleChange('kyb_company_data', verification.company_data);
                }
            } else {
                // Verification failed or company not found
                const verification = response.data?.verification || {};
                setOverallStatus(verification.kyb_status || 'pending_review');
                handleChange('kyb_status', verification.kyb_status || 'pending_review');
                handleChange('kyb_reference_id', verification.kyb_reference_id);
                handleChange('kyb_completed_at', new Date().toISOString());
                
                const checks = verification.checks || {};
                Object.keys(checks).forEach(checkKey => {
                    setCheckProgress(prev => ({...prev, [checkKey]: checks[checkKey].status}));
                    handleChange(`kyb_check_${checkKey}`, checks[checkKey]);
                });
            }
        } catch (error) {
            console.error('KYB Verification Error:', error);
            setOverallStatus('rejected');
            handleChange('kyb_status', 'rejected');
            
            // Mark all checks as failed
            const failedProgress = {};
            kybChecks.forEach(check => {
                failedProgress[check.id] = 'failed';
            });
            setCheckProgress(failedProgress);
        } finally {
            setIsVerifying(false);
        }
    };

    const getCheckIcon = (status) => {
        switch (status) {
            case 'passed':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'needs_review':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'in_progress':
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
            default:
                return <div className="h-5 w-5 rounded-full border-2 border-slate-300" />;
        }
    };

    const getStatusBadge = () => {
        switch (overallStatus) {
            case 'approved':
                return <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
            case 'pending_review':
                return <Badge className="bg-amber-100 text-amber-700">Pending Review</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-700">Verifying...</Badge>;
            default:
                return <Badge variant="outline">Not Started</Badge>;
        }
    };

    const completedChecks = Object.values(checkProgress).filter(s => s !== 'in_progress' && s).length;
    const progressPercent = (completedChecks / kybChecks.length) * 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900">KYB Verification</h2>
                    <p className="text-sm text-slate-500">Know Your Business verification via TheKYB</p>
                </div>
                {getStatusBadge()}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                    We partner with <a href="https://thekyb.com" target="_blank" rel="noopener noreferrer" className="font-medium underline">TheKYB</a> for 
                    comprehensive business verification including company registry checks, UBO identification, and document validation.
                </AlertDescription>
            </Alert>

            {overallStatus === 'not_started' && (
                <Card className="p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Ready to Verify Your Business</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Click below to start the automated KYB verification process. This typically takes 2-3 minutes.
                        </p>
                        <Button 
                            onClick={initiateKYBVerification}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                            size="lg"
                        >
                            <Shield className="h-5 w-5" />
                            Start KYB Verification
                        </Button>
                    </div>
                </Card>
            )}

            {(overallStatus === 'in_progress' || overallStatus !== 'not_started') && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Verification Progress</h3>
                        <span className="text-sm text-slate-500">{completedChecks} of {kybChecks.length} checks</span>
                    </div>
                    <Progress value={progressPercent} className="h-2 mb-6" />

                    <div className="space-y-4">
                        {kybChecks.map((check) => (
                            <div 
                                key={check.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                                    checkProgress[check.id] === 'passed' ? "bg-emerald-50 border-emerald-200" :
                                    checkProgress[check.id] === 'failed' ? "bg-red-50 border-red-200" :
                                    checkProgress[check.id] === 'needs_review' ? "bg-amber-50 border-amber-200" :
                                    checkProgress[check.id] === 'in_progress' ? "bg-blue-50 border-blue-200" :
                                    "bg-slate-50"
                                )}
                            >
                                {getCheckIcon(checkProgress[check.id])}
                                <div className="flex-1">
                                    <p className="font-medium">{check.name}</p>
                                    <p className="text-sm text-slate-500">{check.description}</p>
                                </div>
                                {checkProgress[check.id] === 'passed' && (
                                    <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                                )}
                                {checkProgress[check.id] === 'needs_review' && (
                                    <Badge className="bg-amber-100 text-amber-700">Manual Review</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {overallStatus === 'approved' && (
                <Alert className="bg-emerald-50 border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700">
                        <strong>KYB Verification Complete!</strong> Your business has been successfully verified. 
                        Reference: {data.kyb_reference_id}
                    </AlertDescription>
                </Alert>
            )}

            {overallStatus === 'pending_review' && (
                <Alert className="bg-amber-50 border-amber-200">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                        <strong>Manual Review Required</strong> - Some checks require additional verification. 
                        Our compliance team will review within 24-48 hours.
                    </AlertDescription>
                </Alert>
            )}

            {overallStatus === 'rejected' && (
                <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                        <strong>Verification Failed</strong> - Please review the failed checks above and contact support for assistance.
                    </AlertDescription>
                </Alert>
            )}

            {data.kyb_reference_id && (
                <Card className="p-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Verification Reference</p>
                            <p className="font-mono font-medium">{data.kyb_reference_id}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href="https://thekyb.com" target="_blank" rel="noopener noreferrer" className="gap-1">
                                View on TheKYB <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}