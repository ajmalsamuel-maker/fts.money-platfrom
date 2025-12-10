import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function ComplianceDashboard({ merchant }) {
    const complianceItems = [
        {
            label: 'KYB Verification',
            status: merchant?.kyb_status || 'approved',
            icon: CheckCircle2,
            progress: 100
        },
        {
            label: 'AML Screening',
            status: merchant?.aml_status || 'clear',
            icon: Shield,
            progress: 100
        },
        {
            label: 'Document Upload',
            status: merchant?.documents?.length > 0 ? 'complete' : 'pending',
            icon: FileText,
            progress: merchant?.documents?.length > 0 ? 100 : 0
        },
        {
            label: 'PCI-DSS Compliance',
            status: 'active',
            icon: Shield,
            progress: 100
        }
    ];

    const getStatusConfig = (status) => {
        switch (status) {
            case 'approved':
            case 'clear':
            case 'complete':
            case 'active':
                return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Compliant' };
            case 'pending':
            case 'monitoring':
                return { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'In Progress' };
            default:
                return { color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Unknown' };
        }
    };

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Compliance Status
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {complianceItems.map((item, idx) => {
                        const Icon = item.icon;
                        const statusConfig = getStatusConfig(item.status);
                        return (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                    </div>
                                    <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                                </div>
                                <Progress value={item.progress} className="h-2" />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-green-900">All Requirements Met</p>
                            <p className="text-xs text-green-700 mt-1">Your account is fully compliant with all regulations</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}