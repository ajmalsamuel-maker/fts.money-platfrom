import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileText, CheckCircle2, AlertTriangle, Download, LogOut } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function QSAPortalDashboard() {
    const [qsaSession, setQsaSession] = useState(null);

    useEffect(() => {
        const session = localStorage.getItem('qsa_session');
        if (!session) {
            window.location.href = createPageUrl('QSAPortalLogin');
            return;
        }
        setQsaSession(JSON.parse(session));
    }, []);

    const { data: requirements } = useQuery({
        queryKey: ['pci-requirements'],
        queryFn: () => base44.entities.PCIRequirement.list(),
        enabled: !!qsaSession
    });

    const { data: evidence } = useQuery({
        queryKey: ['pci-evidence'],
        queryFn: () => base44.entities.PCIEvidence.list('-created_date', 200),
        enabled: !!qsaSession
    });

    const { data: findings } = useQuery({
        queryKey: ['pci-findings'],
        queryFn: () => base44.entities.PCIFinding.list(),
        enabled: !!qsaSession
    });

    const { data: controls } = useQuery({
        queryKey: ['pci-controls'],
        queryFn: () => base44.entities.PCIControl.list(),
        enabled: !!qsaSession
    });

    const { data: policies } = useQuery({
        queryKey: ['pci-policies'],
        queryFn: () => base44.entities.PCIPolicy.list(),
        enabled: !!qsaSession
    });

    const handleLogout = () => {
        localStorage.removeItem('qsa_session');
        window.location.href = createPageUrl('QSAPortalLogin');
    };

    const handleExport = async () => {
        try {
            const response = await base44.functions.invoke('exportPCIPackage', {});
            if (response.data?.download_url) {
                window.open(response.data.download_url, '_blank');
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (!qsaSession) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const totalRequirements = requirements?.length || 0;
    const completedRequirements = requirements?.filter(r => r.compliance_status === 'completed').length || 0;
    const overallCompliance = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

    const openFindings = findings?.filter(f => f.status === 'open') || [];
    const criticalFindings = openFindings.filter(f => f.severity === 'critical').length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">QSA Portal</h1>
                                <p className="text-sm text-slate-600">Read-Only Compliance Assessment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">{qsaSession.email}</p>
                                <p className="text-xs text-slate-500">QSA Assessor</p>
                            </div>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export All
                            </Button>
                            <Button variant="ghost" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Compliance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Overall Compliance</CardDescription>
                            <CardTitle className="text-3xl">{overallCompliance}%</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-500">
                                {completedRequirements} of {totalRequirements} requirements
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Evidence Documents</CardDescription>
                            <CardTitle className="text-3xl">{evidence?.length || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Open Findings</CardDescription>
                            <CardTitle className="text-3xl">{openFindings.length}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-red-600">{criticalFindings} critical</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Active Policies</CardDescription>
                            <CardTitle className="text-3xl">
                                {policies?.filter(p => p.status === 'active').length || 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Quick Access Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements Status</CardTitle>
                            <CardDescription>PCI DSS compliance by requirement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {requirements?.slice(0, 12).map((req) => (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{req.requirement_number}</p>
                                            <p className="text-xs text-slate-600">{req.requirement_title}</p>
                                        </div>
                                        <Badge variant={req.compliance_status === 'completed' ? 'default' : 'secondary'}>
                                            {req.compliance_status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Evidence by Requirement</CardTitle>
                            <CardDescription>Uploaded compliance evidence</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {evidence?.slice(0, 10).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>Req {item.requirement_number}</span>
                                                <span>•</span>
                                                <span>{item.evidence_type}</span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => window.open(item.file_url, '_blank')}
                                        >
                                            <Download className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Control Test Results</CardTitle>
                            <CardDescription>Security control testing status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {controls?.slice(0, 10).map((control) => (
                                    <div key={control.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{control.control_name}</p>
                                            <p className="text-xs text-slate-500">{control.test_type}</p>
                                        </div>
                                        <Badge variant={control.test_result === 'passed' ? 'default' : 'secondary'}>
                                            {control.test_result}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Findings & Gaps</CardTitle>
                            <CardDescription>Identified compliance gaps</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {findings?.slice(0, 10).map((finding) => (
                                    <div key={finding.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                                            finding.severity === 'critical' ? 'text-red-600' : 
                                            finding.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
                                        }`} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{finding.finding_title}</p>
                                            <p className="text-xs text-slate-500">Req {finding.requirement_number}</p>
                                        </div>
                                        <Badge>{finding.severity}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}