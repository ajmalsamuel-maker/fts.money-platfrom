import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, CheckCircle, GitBranch, Shield, BarChart3, FileText, Settings, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import WorkflowDashboard from '@/components/workflow/WorkflowDashboard';
import WorkflowTemplateManager from '@/components/workflow/WorkflowTemplateManager';

const isoStandards = [
    { 
        code: 'ISO/IEC 19510', 
        name: 'BPMN 2.0', 
        description: 'Modeling and executing business processes/workflows',
        field: 'iso_19510_compliant',
        audience: 'Most users - practical standard for drawing and automating workflows'
    },
    { 
        code: 'ISO/IEC 23005-7', 
        name: 'Multimedia Workflow', 
        description: 'Interoperability of workflow control in multimedia systems',
        field: 'iso_23005_7_compliant',
        audience: 'Technical developers in specific media/device integration contexts'
    },
    { 
        code: 'ISO/IEC 10746', 
        name: 'ODP Framework', 
        description: 'Architectural framework for distributed systems',
        field: 'iso_10746_compliant',
        audience: 'Architects designing complex, large-scale workflow/BPM systems'
    },
    { 
        code: 'ISO 9001', 
        name: 'Quality Management', 
        description: 'Managing processes for quality assurance',
        field: 'iso_9001_compliant',
        audience: 'Organizations linking workflow efficiency to quality certification'
    }
];

const workflowTypes = [
    'psp_provisioning',
    'merchant_onboarding',
    'transaction_processing',
    'compliance_verification',
    'payout_processing',
    'service_provisioning',
    'dispute_resolution',
    'risk_assessment'
];

export default function WorkflowManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('workflows');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [formData, setFormData] = useState({
        workflow_name: '',
        workflow_type: 'psp_provisioning',
        iso_19510_compliant: true,
        iso_23005_7_compliant: false,
        iso_10746_compliant: true,
        iso_9001_compliant: true,
        status: 'active',
        version: '1.0'
    });

    const { data: workflows = [] } = useQuery({
        queryKey: ['workflows'],
        queryFn: () => base44.entities.WorkflowCompliance.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.WorkflowCompliance.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['workflows']);
            setShowCreateDialog(false);
            setFormData({
                workflow_name: '',
                workflow_type: 'psp_provisioning',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0'
            });
            toast.success('Workflow created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create workflow: ' + error.message);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.WorkflowCompliance.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['workflows']);
            toast.success('Workflow updated successfully');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const nextAuditDate = new Date();
        nextAuditDate.setMonth(nextAuditDate.getMonth() + 3);
        
        createMutation.mutate({
            ...formData,
            workflow_id: `WF-${Date.now()}`,
            last_audit_date: new Date().toISOString().split('T')[0],
            next_audit_date: nextAuditDate.toISOString().split('T')[0]
        });
    };

    const handleToggleCompliance = (workflow, field) => {
        updateMutation.mutate({
            id: workflow.id,
            data: { [field]: !workflow[field] }
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const complianceStats = {
        total: workflows.length,
        bpmn: workflows.filter(w => w.iso_19510_compliant).length,
        multimedia: workflows.filter(w => w.iso_23005_7_compliant).length,
        odp: workflows.filter(w => w.iso_10746_compliant).length,
        quality: workflows.filter(w => w.iso_9001_compliant).length,
        fullyCompliant: workflows.filter(w => 
            w.iso_19510_compliant && w.iso_10746_compliant && w.iso_9001_compliant
        ).length
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="WorkflowManagement" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Workflow & Compliance Management</h2>
                        <p className="text-xs text-slate-600">ISO/IEC standards compliance tracking</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={async () => {
                                const response = await base44.functions.invoke('createDefaultWorkflows', {});
                                if (response.data.success) {
                                    toast.success(response.data.message);
                                    queryClient.invalidateQueries(['workflows']);
                                }
                            }} 
                            variant="outline" 
                            className="gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Initialize Default Workflows
                        </Button>
                        <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            New Workflow
                        </Button>
                        <Button onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))} variant="ghost">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                            <TabsTrigger value="workflows">Workflows</TabsTrigger>
                            <TabsTrigger value="templates">Templates</TabsTrigger>
                            <TabsTrigger value="compliance">Compliance Overview</TabsTrigger>
                            <TabsTrigger value="standards">ISO Standards</TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard">
                            <WorkflowDashboard workflows={workflows} />
                        </TabsContent>

                        <TabsContent value="templates">
                            <WorkflowTemplateManager />
                        </TabsContent>

                        <TabsContent value="workflows" className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-5 gap-4">
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Total Workflows</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">{complianceStats.total}</p>
                                            </div>
                                            <GitBranch className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">BPMN 2.0</p>
                                                <p className="text-3xl font-bold text-emerald-600 mt-1">{complianceStats.bpmn}</p>
                                            </div>
                                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">ODP Framework</p>
                                                <p className="text-3xl font-bold text-blue-600 mt-1">{complianceStats.odp}</p>
                                            </div>
                                            <Settings className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">ISO 9001</p>
                                                <p className="text-3xl font-bold text-purple-600 mt-1">{complianceStats.quality}</p>
                                            </div>
                                            <Shield className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Fully Compliant</p>
                                                <p className="text-3xl font-bold text-emerald-600 mt-1">{complianceStats.fullyCompliant}</p>
                                            </div>
                                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Workflows Table */}
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle>Platform Workflows</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Workflow</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">BPMN 2.0</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">ODP</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">ISO 9001</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Next Audit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {workflows.map((workflow) => (
                                                    <tr key={workflow.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-3 px-4">
                                                            <p className="font-medium text-slate-900">{workflow.workflow_name}</p>
                                                            <p className="text-xs text-slate-500">{workflow.workflow_id}</p>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge variant="outline" className="capitalize">
                                                                {workflow.workflow_type.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button onClick={() => handleToggleCompliance(workflow, 'iso_19510_compliant')}>
                                                                {workflow.iso_19510_compliant ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                                                                ) : (
                                                                    <AlertCircle className="h-5 w-5 text-slate-300 mx-auto" />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button onClick={() => handleToggleCompliance(workflow, 'iso_10746_compliant')}>
                                                                {workflow.iso_10746_compliant ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                                                                ) : (
                                                                    <AlertCircle className="h-5 w-5 text-slate-300 mx-auto" />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button onClick={() => handleToggleCompliance(workflow, 'iso_9001_compliant')}>
                                                                {workflow.iso_9001_compliant ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                                                                ) : (
                                                                    <AlertCircle className="h-5 w-5 text-slate-300 mx-auto" />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge className={workflow.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                                {workflow.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600">
                                                            {workflow.next_audit_date ? new Date(workflow.next_audit_date).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {workflows.length === 0 && (
                                            <div className="text-center py-12">
                                                <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                                <p className="text-slate-600">No workflows defined yet</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="compliance">
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle>Compliance Matrix</CardTitle>
                                    <p className="text-sm text-slate-600 mt-1">ISO standards compliance across all workflows</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {isoStandards.map((standard) => {
                                            const compliantCount = workflows.filter(w => w[standard.field]).length;
                                            const percentage = workflows.length > 0 ? (compliantCount / workflows.length * 100).toFixed(0) : 0;
                                            
                                            return (
                                                <div key={standard.code} className="border border-slate-200 rounded-lg p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="font-semibold text-lg text-slate-900">{standard.code}</h3>
                                                            <p className="text-sm text-slate-600 mt-1">{standard.name}</p>
                                                            <p className="text-xs text-slate-500 mt-2">{standard.description}</p>
                                                            <p className="text-xs text-blue-600 mt-2 italic">{standard.audience}</p>
                                                        </div>
                                                        <Badge className="bg-emerald-100 text-emerald-700 text-lg px-4 py-2">
                                                            {percentage}%
                                                        </Badge>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                                        <div 
                                                            className="bg-emerald-600 h-3 rounded-full transition-all" 
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-2">
                                                        {compliantCount} of {workflows.length} workflows compliant
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="standards">
                            <div className="grid grid-cols-2 gap-6">
                                {isoStandards.map((standard) => (
                                    <Card key={standard.code} className="bg-white border-slate-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{standard.code}</CardTitle>
                                            <p className="text-sm font-semibold text-blue-600">{standard.name}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-2">Description:</p>
                                                    <p className="text-sm text-slate-600">{standard.description}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-2">Target Audience:</p>
                                                    <p className="text-sm text-slate-600">{standard.audience}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-2">Compliance Status:</p>
                                                    <Badge className="bg-emerald-100 text-emerald-700">
                                                        {workflows.filter(w => w[standard.field]).length} workflows compliant
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Workflow</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Workflow Name</Label>
                            <Input
                                value={formData.workflow_name}
                                onChange={(e) => setFormData({ ...formData, workflow_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Workflow Type</Label>
                            <Select value={formData.workflow_type} onValueChange={(value) => setFormData({ ...formData, workflow_type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {workflowTypes.map((type) => (
                                        <SelectItem key={type} value={type} className="capitalize">
                                            {type.replace(/_/g, ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label>ISO Standards Compliance</Label>
                            {isoStandards.map((standard) => (
                                <div key={standard.code} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData[standard.field]}
                                        onChange={(e) => setFormData({ ...formData, [standard.field]: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-700">{standard.code} - {standard.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Workflow'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}