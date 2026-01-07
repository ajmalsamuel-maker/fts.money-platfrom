import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Shield, CheckCircle2, AlertTriangle, Clock, 
    FileText, TrendingUp, Calendar, AlertCircle 
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PCIComplianceDashboard() {
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });

    const { data: requirements } = useQuery({
        queryKey: ['pci-requirements'],
        queryFn: () => base44.entities.PCIRequirement.list(),
        enabled: !loading
    });

    const { data: evidence } = useQuery({
        queryKey: ['pci-evidence'],
        queryFn: () => base44.entities.PCIEvidence.list(),
        enabled: !loading
    });

    const { data: findings } = useQuery({
        queryKey: ['pci-findings'],
        queryFn: () => base44.entities.PCIFinding.filter({ status: 'open' }),
        enabled: !loading
    });

    const { data: audits } = useQuery({
        queryKey: ['pci-audits'],
        queryFn: () => base44.entities.PCIAuditLog.list('-created_date', 5),
        enabled: !loading
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    // Calculate metrics
    const totalRequirements = requirements?.length || 0;
    const completedRequirements = requirements?.filter(r => r.compliance_status === 'completed').length || 0;
    const overallCompliance = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

    const criticalFindings = findings?.filter(f => f.severity === 'critical').length || 0;
    const highFindings = findings?.filter(f => f.severity === 'high').length || 0;
    const openFindings = findings?.length || 0;

    const validEvidence = evidence?.filter(e => e.status === 'valid').length || 0;
    const expiringEvidence = evidence?.filter(e => e.status === 'expiring_soon').length || 0;

    const latestAudit = audits?.[0];
    const daysUntilNextAudit = latestAudit?.valid_until 
        ? Math.ceil((new Date(latestAudit.valid_until) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const quickLinks = [
        { title: 'Requirements Tracker', path: 'PCIRequirementsTracker', icon: Shield, desc: 'Track all 12 PCI requirements' },
        { title: 'Evidence Vault', path: 'PCIEvidenceVault', icon: FileText, desc: 'Manage compliance evidence' },
        { title: 'Control Testing', path: 'PCIControlTesting', icon: CheckCircle2, desc: 'Test and validate controls' },
        { title: 'Policy Library', path: 'PCIPolicyLibrary', icon: FileText, desc: 'Policy management' },
        { title: 'Gap Analysis', path: 'PCIGapAnalysis', icon: AlertTriangle, desc: 'Track findings & remediation' },
        { title: 'Audit Reports', path: 'PCIAuditReports', icon: TrendingUp, desc: 'Audit history & reporting' }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIComplianceDashboard"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">PCI DSS Level 1 Compliance</h1>
                        <p className="text-slate-600">Enterprise Payment Card Industry Data Security Standard Management</p>
                    </div>

                    {/* Compliance Status Alert */}
                    {overallCompliance >= 90 ? (
                        <Alert className="mb-6 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>Excellent!</strong> You're {overallCompliance}% compliant with PCI DSS requirements.
                            </AlertDescription>
                        </Alert>
                    ) : overallCompliance >= 70 ? (
                        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>Good Progress:</strong> {overallCompliance}% compliant. Continue working on remaining requirements.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <strong>Action Required:</strong> Only {overallCompliance}% compliant. Immediate attention needed.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Overall Compliance</CardDescription>
                                <CardTitle className="text-3xl">{overallCompliance}%</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Progress value={overallCompliance} className="h-2" />
                                <p className="text-xs text-slate-500 mt-2">
                                    {completedRequirements} of {totalRequirements} requirements completed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Open Findings</CardDescription>
                                <CardTitle className="text-3xl">{openFindings}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-red-600">Critical</span>
                                        <Badge variant="destructive">{criticalFindings}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-orange-600">High</span>
                                        <Badge variant="secondary">{highFindings}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Evidence Documents</CardDescription>
                                <CardTitle className="text-3xl">{validEvidence}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-500">
                                    {expiringEvidence} expiring soon
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Next Audit</CardDescription>
                                <CardTitle className="text-3xl">
                                    {daysUntilNextAudit ? `${daysUntilNextAudit}d` : 'TBD'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-500">
                                    {latestAudit?.valid_until 
                                        ? `Valid until ${new Date(latestAudit.valid_until).toLocaleDateString()}`
                                        : 'Schedule annual assessment'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Access */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Quick Access</CardTitle>
                            <CardDescription>Navigate to key compliance areas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quickLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <a
                                            key={link.path}
                                            href={createPageUrl(link.path)}
                                            className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                        >
                                            <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{link.title}</h3>
                                                <p className="text-sm text-slate-500">{link.desc}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Audits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {audits?.length > 0 ? (
                                    <div className="space-y-3">
                                        {audits.map((audit) => (
                                            <div key={audit.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{audit.audit_name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(audit.created_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge variant={audit.overall_result === 'compliant' ? 'default' : 'secondary'}>
                                                    {audit.overall_result}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-8">No audits recorded yet</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Critical Action Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {findings?.filter(f => f.severity === 'critical' || f.severity === 'high').slice(0, 5).length > 0 ? (
                                    <div className="space-y-3">
                                        {findings.filter(f => f.severity === 'critical' || f.severity === 'high').slice(0, 5).map((finding) => (
                                            <div key={finding.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                                <AlertTriangle className={`h-4 w-4 mt-0.5 ${finding.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{finding.finding_title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Req {finding.requirement_number} • Due {finding.due_date ? new Date(finding.due_date).toLocaleDateString() : 'ASAP'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-8">No critical findings 🎉</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}