import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    AlertTriangle,
    Building2,
    Shield,
    Users,
    Landmark,
    FileCheck,
    Globe
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ReviewSubmitStep({ formData }) {
    const { business, lei, contacts, kyb, aml, bank } = formData;

    const getStatusIcon = (status) => {
        if (status === 'verified' || status === 'approved' || status === 'clear') {
            return <CheckCircle className="h-5 w-5 text-emerald-500" />;
        }
        if (status === 'rejected' || status === 'flagged') {
            return <XCircle className="h-5 w-5 text-red-500" />;
        }
        if (status === 'pending_review' || status === 'monitoring') {
            return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        }
        return <Clock className="h-5 w-5 text-slate-400" />;
    };

    const getStatusBadge = (status) => {
        if (status === 'verified' || status === 'approved' || status === 'clear') {
            return <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>;
        }
        if (status === 'rejected' || status === 'flagged') {
            return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
        }
        if (status === 'pending_review' || status === 'monitoring') {
            return <Badge className="bg-amber-100 text-amber-700">Pending Review</Badge>;
        }
        if (status === 'in_progress') {
            return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
        }
        return <Badge variant="outline">Not Started</Badge>;
    };

    const sections = [
        {
            title: 'Business Details',
            icon: Building2,
            status: business?.legal_name ? 'verified' : 'pending',
            items: [
                { label: 'Legal Name', value: business?.legal_name },
                { label: 'Trading Name', value: business?.trading_name },
                { label: 'Registration Number', value: business?.registration_number },
                { label: 'Country', value: business?.country },
                { label: 'Industry', value: business?.industry },
            ]
        },
        {
            title: 'LEI Verification',
            icon: Globe,
            status: lei?.lei_status || 'pending',
            items: [
                { label: 'LEI Code', value: lei?.lei },
                { label: 'Status', value: lei?.lei_status },
                { label: 'Verified Date', value: lei?.lei_verified_date },
                { label: 'vLEI', value: lei?.vlei || 'Not requested' },
            ]
        },
        {
            title: 'Contact Information',
            icon: Users,
            status: contacts?.contacts?.length > 0 ? 'verified' : 'pending',
            items: contacts?.contacts?.map((c, i) => ({
                label: c.is_primary ? 'Primary Contact' : `Contact ${i + 1}`,
                value: `${c.full_name} (${c.email})`
            })) || []
        },
        {
            title: 'KYB Verification',
            icon: FileCheck,
            status: kyb?.kyb_status || 'pending',
            items: [
                { label: 'Status', value: kyb?.kyb_status },
                { label: 'Reference ID', value: kyb?.kyb_reference_id },
                { label: 'Provider', value: 'TheKYB' },
            ]
        },
        {
            title: 'AML Screening',
            icon: Shield,
            status: aml?.aml_status || 'pending',
            items: [
                { label: 'Status', value: aml?.aml_status },
                { label: 'Risk Score', value: aml?.aml_risk_score ? `${aml.aml_risk_score}/100` : 'N/A' },
                { label: 'Reference ID', value: aml?.aml_reference_id },
                { label: 'Ongoing Monitoring', value: aml?.ongoing_monitoring !== false ? 'Enabled' : 'Disabled' },
            ]
        },
        {
            title: 'Bank Details',
            icon: Landmark,
            status: bank?.account_number ? 'verified' : 'pending',
            items: [
                { label: 'Bank Name', value: bank?.bank_name },
                { label: 'Account Holder', value: bank?.account_holder_name },
                { label: 'Account Number', value: bank?.account_number ? `****${bank.account_number.slice(-4)}` : null },
                { label: 'Settlement Currency', value: bank?.settlement_currency },
            ]
        },
    ];

    const allVerified = ['verified', 'approved', 'clear'].includes(lei?.lei_status) &&
                        ['approved', 'pending_review'].includes(kyb?.kyb_status) &&
                        ['clear', 'monitoring'].includes(aml?.aml_status);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Review & Submit</h2>
                    <p className="text-sm text-slate-500">Review your application before submitting</p>
                </div>
            </div>

            {allVerified ? (
                <Alert className="bg-emerald-50 border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700">
                        <strong>All verifications passed!</strong> Your application is ready for submission.
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                        Some verifications are pending or require review. You can still submit, but approval may take longer.
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                {sections.map((section, idx) => (
                    <Card key={idx} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <section.icon className="h-5 w-5 text-slate-600" />
                                </div>
                                <h3 className="font-medium">{section.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(section.status)}
                                {getStatusBadge(section.status)}
                            </div>
                        </div>
                        <Separator className="mb-3" />
                        <div className="grid md:grid-cols-2 gap-3">
                            {section.items.filter(item => item.value).map((item, i) => (
                                <div key={i} className="text-sm">
                                    <span className="text-slate-500">{item.label}: </span>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                <ol className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                        Your application will be submitted to our compliance team
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                        Final review typically takes 1-2 business days
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                        You'll receive an email notification with your merchant credentials
                    </li>
                </ol>
            </Card>
        </div>
    );
}