import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

const complianceTemplates = {
    global: {
        name: 'Global Standard',
        policies: [
            { name: 'PCI DSS L1', required: true, enabled: true },
            { name: 'KYB Verification', required: true, enabled: true },
            { name: 'AML Screening', required: true, enabled: true },
            { name: '3DS2 Required', required: false, enabled: true }
        ]
    },
    eu: {
        name: 'European Union',
        policies: [
            { name: 'PCI DSS L1', required: true, enabled: true },
            { name: 'KYB Verification', required: true, enabled: true },
            { name: 'AML Screening', required: true, enabled: true },
            { name: 'PSD2 Compliance', required: true, enabled: true },
            { name: 'GDPR Data Protection', required: true, enabled: true },
            { name: 'SCA Required', required: true, enabled: true }
        ]
    },
    us: {
        name: 'United States',
        policies: [
            { name: 'PCI DSS L1', required: true, enabled: true },
            { name: 'KYB Verification', required: true, enabled: true },
            { name: 'AML Screening', required: true, enabled: true },
            { name: 'OFAC Screening', required: true, enabled: true },
            { name: 'State Money Transmitter', required: true, enabled: true }
        ]
    },
    apac: {
        name: 'Asia Pacific',
        policies: [
            { name: 'PCI DSS L1', required: true, enabled: true },
            { name: 'KYB Verification', required: true, enabled: true },
            { name: 'AML Screening', required: true, enabled: true },
            { name: 'Local Regulatory Compliance', required: true, enabled: true }
        ]
    }
};

export default function FTSCompliance() {
    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="FTSCompliance" userRole="Platform Operator" />
            
            <div className="flex-1 overflow-auto">
                <div className="bg-white border-b border-slate-200 px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Compliance Policy Templates</h1>
                        <p className="text-sm text-slate-600">Region-based compliance policies auto-applied to PSP instances</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {Object.entries(complianceTemplates).map(([key, template]) => (
                            <Card key={key}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                            <CardTitle>{template.name}</CardTitle>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-700">{template.policies.length} policies</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {template.policies.map((policy, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    {policy.enabled && <Check className="h-4 w-4 text-emerald-600" />}
                                                    <div>
                                                        <p className="text-sm font-medium">{policy.name}</p>
                                                        {policy.required && (
                                                            <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Switch checked={policy.enabled} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}