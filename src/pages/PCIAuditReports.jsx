import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Calendar, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIAuditReports() {
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });
    const queryClient = useQueryClient();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [auditData, setAuditData] = useState({
        audit_type: 'internal_audit',
        audit_name: '',
        auditor_name: '',
        start_date: '',
        end_date: '',
        status: 'scheduled'
    });

    const { data: audits, isLoading } = useQuery({
        queryKey: ['pci-audits'],
        queryFn: () => base44.entities.PCIAuditLog.list('-created_date', 50),
        enabled: !loading
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PCIAuditLog.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-audits'] });
            toast.success('Audit logged');
            setShowAddDialog(false);
            setAuditData({
                audit_type: 'internal_audit',
                audit_name: '',
                auditor_name: '',
                start_date: '',
                end_date: '',
                status: 'scheduled'
            });
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const auditTypes = [
        { value: 'internal_audit', label: 'Internal Audit' },
        { value: 'external_audit', label: 'External Audit' },
        { value: 'qsa_assessment', label: 'QSA Assessment' },
        { value: 'asv_scan', label: 'ASV Scan' },
        { value: 'penetration_test', label: 'Penetration Test' },
        { value: 'gap_analysis', label: 'Gap Analysis' },
        { value: 'interim_review', label: 'Interim Review' }
    ];

    const statusConfig = {
        scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
        in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
        completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
        report_pending: { label: 'Report Pending', color: 'bg-orange-100 text-orange-700' },
        closed: { label: 'Closed', color: 'bg-slate-100 text-slate-700' }
    };

    const resultConfig = {
        compliant: { label: 'Compliant', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        compliant_with_exceptions: { label: 'Compliant (Exceptions)', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
        non_compliant: { label: 'Non-Compliant', color: 'bg-red-100 text-red-700', icon: AlertCircle },
        pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: Calendar }
    };

    const handleSubmit = () => {
        if (!auditData.audit_name || !auditData.auditor_name) {
            toast.error('Please fill in required fields');
            return;
        }

        createMutation.mutate(auditData);
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIAuditReports"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Audit Reports</h1>
                            <p className="text-slate-600">Track compliance audits and assessments</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Log Audit
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Total Audits</CardDescription>
                                <CardTitle className="text-2xl">{audits?.length || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Compliant</CardDescription>
                                <CardTitle className="text-2xl text-green-600">
                                    {audits?.filter(a => a.overall_result === 'compliant').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>In Progress</CardDescription>
                                <CardTitle className="text-2xl text-blue-600">
                                    {audits?.filter(a => a.status === 'in_progress').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Upcoming</CardDescription>
                                <CardTitle className="text-2xl text-slate-600">
                                    {audits?.filter(a => a.status === 'scheduled').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Audit List */}
                    {isLoading ? (
                        <div className="text-center py-12">Loading audits...</div>
                    ) : audits?.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-slate-500">
                                No audits logged yet. Schedule your first audit.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {audits.map((audit) => {
                                const ResultIcon = resultConfig[audit.overall_result]?.icon || Calendar;
                                return (
                                    <Card key={audit.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                        <CardTitle className="text-lg">{audit.audit_name}</CardTitle>
                                                        <Badge className={statusConfig[audit.status]?.color}>
                                                            {statusConfig[audit.status]?.label}
                                                        </Badge>
                                                        {audit.overall_result && (
                                                            <Badge className={resultConfig[audit.overall_result]?.color}>
                                                                {resultConfig[audit.overall_result]?.label}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription>
                                                        {audit.audit_type.replace('_', ' ')} • {audit.auditor_name}
                                                        {audit.auditor_company && ` (${audit.auditor_company})`}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500">Start Date:</span>
                                                    <p className="font-medium">
                                                        {audit.start_date ? new Date(audit.start_date).toLocaleDateString() : 'TBD'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">End Date:</span>
                                                    <p className="font-medium">
                                                        {audit.end_date ? new Date(audit.end_date).toLocaleDateString() : 'TBD'}
                                                    </p>
                                                </div>
                                                {audit.compliance_score !== null && audit.compliance_score !== undefined && (
                                                    <div>
                                                        <span className="text-slate-500">Compliance Score:</span>
                                                        <p className="font-medium text-green-600">{audit.compliance_score}%</p>
                                                    </div>
                                                )}
                                                {audit.findings_count > 0 && (
                                                    <div>
                                                        <span className="text-slate-500">Findings:</span>
                                                        <p className="font-medium">
                                                            {audit.findings_count} total
                                                            {audit.critical_findings > 0 && (
                                                                <span className="text-red-600"> ({audit.critical_findings} critical)</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {(audit.report_url || audit.aoc_url || audit.certificate_url) && (
                                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                                    {audit.report_url && (
                                                        <Button variant="outline" size="sm" onClick={() => window.open(audit.report_url, '_blank')}>
                                                            <Download className="h-3 w-3 mr-2" />
                                                            Audit Report
                                                        </Button>
                                                    )}
                                                    {audit.aoc_url && (
                                                        <Button variant="outline" size="sm" onClick={() => window.open(audit.aoc_url, '_blank')}>
                                                            <Download className="h-3 w-3 mr-2" />
                                                            AOC
                                                        </Button>
                                                    )}
                                                    {audit.certificate_url && (
                                                        <Button variant="outline" size="sm" onClick={() => window.open(audit.certificate_url, '_blank')}>
                                                            <Download className="h-3 w-3 mr-2" />
                                                            Certificate
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Add Audit Dialog */}
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Log New Audit</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Audit Type *</label>
                                    <Select 
                                        value={auditData.audit_type}
                                        onValueChange={(value) => setAuditData({...auditData, audit_type: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {auditTypes.map(type => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Audit Name *</label>
                                    <Input 
                                        placeholder="e.g., Annual QSA Assessment 2026"
                                        value={auditData.audit_name}
                                        onChange={(e) => setAuditData({...auditData, audit_name: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Auditor Name *</label>
                                        <Input 
                                            placeholder="Lead auditor"
                                            value={auditData.auditor_name}
                                            onChange={(e) => setAuditData({...auditData, auditor_name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Auditor Company</label>
                                        <Input 
                                            placeholder="QSA company (optional)"
                                            value={auditData.auditor_company || ''}
                                            onChange={(e) => setAuditData({...auditData, auditor_company: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Start Date</label>
                                        <Input 
                                            type="date"
                                            value={auditData.start_date}
                                            onChange={(e) => setAuditData({...auditData, start_date: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">End Date</label>
                                        <Input 
                                            type="date"
                                            value={auditData.end_date}
                                            onChange={(e) => setAuditData({...auditData, end_date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Audit Scope</label>
                                    <Textarea 
                                        placeholder="Description of audit scope"
                                        value={auditData.audit_scope || ''}
                                        onChange={(e) => setAuditData({...auditData, audit_scope: e.target.value})}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Saving...' : 'Log Audit'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}