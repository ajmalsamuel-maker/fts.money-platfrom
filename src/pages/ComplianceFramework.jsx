import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { 
    Shield, 
    CheckCircle2, 
    Award, 
    Globe, 
    Lock, 
    FileCheck,
    Building,
    Scale,
    Cloud,
    Key,
    Download
} from 'lucide-react';

export default function ComplianceFramework() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: framework } = useQuery({
        queryKey: ['compliance-framework'],
        queryFn: async () => {
            const { data } = await base44.functions.invoke('complianceFramework', { action: 'getFramework' });
            return data;
        }
    });

    const categoryIcons = {
        legal_financial: Scale,
        privacy_regulations: Lock,
        security_frameworks: Shield,
        attestation_reports: Award,
        operational_standards: Building,
        technical_standards: Key,
        identity_standards: FileCheck,
        cloud_standards: Cloud,
        payment_networks: Globe,
        regulators: Building
    };

    const downloadReport = async () => {
        const { data } = await base44.functions.invoke('complianceFramework', { 
            action: 'generateComplianceReport',
            psp_code: 'PLATFORM'
        });
        
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="ComplianceFramework"
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Compliance Framework</h1>
                                <p className="text-slate-600 mt-1">International standards and certifications</p>
                            </div>
                            <Button onClick={downloadReport}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                            </Button>
                        </div>

                        {/* Summary Cards */}
                        {framework && (
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-600">Total Standards</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {framework.summary.total_standards}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Implemented & Maintained</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-600">Mandatory Standards</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-emerald-600">
                                            {framework.summary.mandatory_standards}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Fully Compliant</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-600">Certified Standards</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {framework.summary.certified_standards}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Active Certifications</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Standards by Category */}
                        {framework && (
                            <Tabs defaultValue="legal_financial" className="space-y-4">
                                <TabsList>
                                    {Object.keys(framework.compliance_framework).map((category) => {
                                        const Icon = categoryIcons[category] || Shield;
                                        return (
                                            <TabsTrigger key={category} value={category} className="gap-2">
                                                <Icon className="h-4 w-4" />
                                                {category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>

                                {Object.entries(framework.compliance_framework).map(([category, standards]) => (
                                    <TabsContent key={category} value={category}>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(standards).map(([key, standard]) => (
                                                <Card key={key}>
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <CardTitle className="text-lg">{standard.name}</CardTitle>
                                                                {standard.category && (
                                                                    <p className="text-sm text-slate-600 mt-1">{standard.category}</p>
                                                                )}
                                                            </div>
                                                            <Badge className={
                                                                standard.status === 'certified' ? 'bg-emerald-100 text-emerald-800' :
                                                                standard.status === 'implemented' ? 'bg-blue-100 text-blue-800' :
                                                                standard.status === 'compliant' ? 'bg-green-100 text-green-800' :
                                                                'bg-slate-100 text-slate-800'
                                                            }>
                                                                {standard.status === 'certified' && <Award className="h-3 w-3 mr-1" />}
                                                                {standard.status === 'implemented' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                                {standard.status?.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        {standard.region && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Globe className="h-4 w-4 text-slate-400" />
                                                                <span className="text-slate-600">{standard.region}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {standard.mandatory !== undefined && (
                                                            <Badge variant={standard.mandatory ? "default" : "outline"}>
                                                                {standard.mandatory ? 'Mandatory' : 'Optional'}
                                                            </Badge>
                                                        )}

                                                        {standard.requirements && (
                                                            <div>
                                                                <p className="text-xs font-medium text-slate-700 mb-2">Requirements:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {standard.requirements.map((req, idx) => (
                                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                                            {req}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {standard.frameworks && (
                                                            <div>
                                                                <p className="text-xs font-medium text-slate-700 mb-2">Frameworks:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {standard.frameworks.map((fw, idx) => (
                                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                                            {fw}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {standard.trust_principles && (
                                                            <div>
                                                                <p className="text-xs font-medium text-slate-700 mb-2">Trust Principles:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {standard.trust_principles.map((tp, idx) => (
                                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                                            {tp}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {standard.level && (
                                                            <div className="text-sm">
                                                                <span className="text-slate-600">Level: </span>
                                                                <span className="font-semibold">{standard.level}</span>
                                                            </div>
                                                        )}

                                                        {standard.audit_frequency && (
                                                            <div className="text-sm">
                                                                <span className="text-slate-600">Audit: </span>
                                                                <span className="font-semibold capitalize">{standard.audit_frequency}</span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}