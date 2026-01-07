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
import { AlertTriangle, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIGapAnalysis() {
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });
    const queryClient = useQueryClient();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedFinding, setSelectedFinding] = useState(null);
    const [findingData, setFindingData] = useState({
        requirement_number: '',
        finding_title: '',
        finding_description: '',
        severity: 'medium',
        finding_type: 'gap'
    });

    const { data: findings, isLoading } = useQuery({
        queryKey: ['pci-findings'],
        queryFn: () => base44.entities.PCIFinding.list('-created_date', 200),
        enabled: !loading
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PCIFinding.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-findings'] });
            toast.success('Finding recorded');
            setShowAddDialog(false);
            setFindingData({
                requirement_number: '',
                finding_title: '',
                finding_description: '',
                severity: 'medium',
                finding_type: 'gap'
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PCIFinding.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-findings'] });
            toast.success('Finding updated');
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const severityConfig = {
        critical: { label: 'Critical', color: 'bg-red-500 text-white' },
        high: { label: 'High', color: 'bg-orange-500 text-white' },
        medium: { label: 'Medium', color: 'bg-yellow-500 text-white' },
        low: { label: 'Low', color: 'bg-blue-500 text-white' },
        informational: { label: 'Info', color: 'bg-slate-500 text-white' }
    };

    const statusConfig = {
        open: { label: 'Open', color: 'bg-red-100 text-red-700', icon: XCircle },
        in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
        resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        accepted_risk: { label: 'Risk Accepted', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
        false_positive: { label: 'False Positive', color: 'bg-slate-100 text-slate-700', icon: XCircle }
    };

    const handleSubmit = () => {
        if (!findingData.requirement_number || !findingData.finding_title) {
            toast.error('Please fill in required fields');
            return;
        }

        createMutation.mutate({
            ...findingData,
            identified_by: user?.email,
            identified_date: new Date().toISOString().split('T')[0],
            status: 'open'
        });
    };

    // Group by severity
    const groupedFindings = findings?.reduce((acc, finding) => {
        const sev = finding.severity;
        if (!acc[sev]) acc[sev] = [];
        acc[sev].push(finding);
        return acc;
    }, {}) || {};

    const openFindings = findings?.filter(f => f.status === 'open') || [];
    const criticalOpen = openFindings.filter(f => f.severity === 'critical').length;
    const highOpen = openFindings.filter(f => f.severity === 'high').length;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIGapAnalysis"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Gap Analysis & Findings</h1>
                            <p className="text-slate-600">Track and remediate compliance gaps</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Record Finding
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Open Findings</CardDescription>
                                <CardTitle className="text-3xl">{openFindings.length}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Critical</CardDescription>
                                <CardTitle className="text-3xl text-red-600">{criticalOpen}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>High</CardDescription>
                                <CardTitle className="text-3xl text-orange-600">{highOpen}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>In Progress</CardDescription>
                                <CardTitle className="text-3xl text-blue-600">
                                    {findings?.filter(f => f.status === 'in_progress').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Resolved</CardDescription>
                                <CardTitle className="text-3xl text-green-600">
                                    {findings?.filter(f => f.status === 'resolved').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Findings by Severity */}
                    {isLoading ? (
                        <div className="text-center py-12">Loading findings...</div>
                    ) : findings?.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-slate-500">
                                No findings recorded. Great compliance posture! 🎉
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {['critical', 'high', 'medium', 'low', 'informational'].map((severity) => {
                                const severityFindings = groupedFindings[severity] || [];
                                if (severityFindings.length === 0) return null;

                                return (
                                    <Card key={severity}>
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <Badge className={severityConfig[severity]?.color}>
                                                    {severityConfig[severity]?.label}
                                                </Badge>
                                                <CardTitle className="text-lg">
                                                    {severityFindings.length} {severityFindings.length === 1 ? 'Finding' : 'Findings'}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {severityFindings.map((finding) => {
                                                    const StatusIcon = statusConfig[finding.status]?.icon || Clock;
                                                    return (
                                                        <div 
                                                            key={finding.id}
                                                            className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                                            onClick={() => setSelectedFinding(finding)}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <StatusIcon className="h-5 w-5" />
                                                                    <h4 className="font-semibold">{finding.finding_title}</h4>
                                                                    <Badge className={statusConfig[finding.status]?.color}>
                                                                        {statusConfig[finding.status]?.label}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                                                    {finding.finding_description}
                                                                </p>
                                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                                    <span>Req {finding.requirement_number}</span>
                                                                    <span>•</span>
                                                                    <span>{finding.finding_type.replace('_', ' ')}</span>
                                                                    {finding.assigned_to && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>Assigned: {finding.assigned_to}</span>
                                                                        </>
                                                                    )}
                                                                    {finding.due_date && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>Due: {new Date(finding.due_date).toLocaleDateString()}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Add Finding Dialog */}
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Record New Finding</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">PCI Requirement *</label>
                                    <Input 
                                        placeholder="e.g., 1.1.1, 2.3, 12.1"
                                        value={findingData.requirement_number}
                                        onChange={(e) => setFindingData({...findingData, requirement_number: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Finding Title *</label>
                                    <Input 
                                        placeholder="Brief title describing the issue"
                                        value={findingData.finding_title}
                                        onChange={(e) => setFindingData({...findingData, finding_title: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea 
                                        placeholder="Detailed description of the finding"
                                        value={findingData.finding_description}
                                        onChange={(e) => setFindingData({...findingData, finding_description: e.target.value})}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Severity *</label>
                                        <Select 
                                            value={findingData.severity}
                                            onValueChange={(value) => setFindingData({...findingData, severity: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="informational">Informational</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Type *</label>
                                        <Select 
                                            value={findingData.finding_type}
                                            onValueChange={(value) => setFindingData({...findingData, finding_type: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gap">Gap</SelectItem>
                                                <SelectItem value="vulnerability">Vulnerability</SelectItem>
                                                <SelectItem value="non_compliance">Non-Compliance</SelectItem>
                                                <SelectItem value="observation">Observation</SelectItem>
                                                <SelectItem value="best_practice">Best Practice</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Saving...' : 'Record Finding'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* View/Edit Finding Dialog */}
                    <Dialog open={!!selectedFinding} onOpenChange={() => setSelectedFinding(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{selectedFinding?.finding_title}</DialogTitle>
                            </DialogHeader>
                            {selectedFinding && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Select 
                                            value={selectedFinding.status}
                                            onValueChange={(value) => {
                                                updateMutation.mutate({
                                                    id: selectedFinding.id,
                                                    data: { status: value }
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="accepted_risk">Accepted Risk</SelectItem>
                                                <SelectItem value="false_positive">False Positive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Assigned To</label>
                                        <Input 
                                            value={selectedFinding.assigned_to || ''}
                                            onChange={(e) => {
                                                updateMutation.mutate({
                                                    id: selectedFinding.id,
                                                    data: { assigned_to: e.target.value }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Due Date</label>
                                        <Input 
                                            type="date"
                                            value={selectedFinding.due_date || ''}
                                            onChange={(e) => {
                                                updateMutation.mutate({
                                                    id: selectedFinding.id,
                                                    data: { due_date: e.target.value }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Remediation Plan</label>
                                        <Textarea 
                                            value={selectedFinding.remediation_plan || ''}
                                            onChange={(e) => {
                                                updateMutation.mutate({
                                                    id: selectedFinding.id,
                                                    data: { remediation_plan: e.target.value }
                                                });
                                            }}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}