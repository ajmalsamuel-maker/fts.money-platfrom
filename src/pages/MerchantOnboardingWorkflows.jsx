import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Workflow, Plus, Edit, Play, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import WorkflowExecutionMonitor from '@/components/workflow/WorkflowExecutionMonitor';

export default function MerchantOnboardingWorkflows() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('workflows');
    const [showDialog, setShowDialog] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    const [selectedPSP, setSelectedPSP] = useState('all');

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: workflows = [] } = useQuery({
        queryKey: ['merchant-workflows', selectedPSP],
        queryFn: async () => {
            if (selectedPSP === 'all') {
                return await base44.entities.MerchantOnboardingWorkflowTemplate.list();
            }
            return await base44.entities.MerchantOnboardingWorkflowTemplate.filter({ psp_id: selectedPSP });
        }
    });

    const { data: executions = [] } = useQuery({
        queryKey: ['workflow-executions'],
        queryFn: () => base44.entities.WorkflowExecution.list('-started_at', 50)
    });

    const [workflowForm, setWorkflowForm] = useState({
        psp_id: '',
        workflow_name: '',
        description: '',
        steps: []
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            const psp = psps.find(p => p.id === data.psp_id);
            return base44.entities.MerchantOnboardingWorkflowTemplate.create({
                ...data,
                workflow_id: `WF-${Date.now()}`,
                psp_code: psp?.psp_code,
                version: '1.0.0'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant-workflows']);
            setShowDialog(false);
            toast.success('Workflow created');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MerchantOnboardingWorkflowTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant-workflows']);
            setShowDialog(false);
            setEditingWorkflow(null);
            toast.success('Workflow updated');
        }
    });

    const handleEdit = (workflow) => {
        setEditingWorkflow(workflow);
        setShowDialog(true);
    };

    if (loading) return null;

    const filteredWorkflows = selectedPSP === 'all' 
        ? workflows 
        : workflows.filter(w => w.psp_id === selectedPSP);

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="MerchantOnboardingWorkflows" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Merchant Onboarding Workflows</h2>
                        <p className="text-xs text-slate-600">Phase 1, Step 2: Configurable workflow builder for PSPs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={selectedPSP} onValueChange={setSelectedPSP}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by PSP" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All PSPs</SelectItem>
                                {psps.map(psp => (
                                    <SelectItem key={psp.id} value={psp.id}>{psp.psp_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => { setEditingWorkflow(null); setShowDialog(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Workflow
                        </Button>
                    </div>
                </header>

                <main className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Workflows</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{workflows.length}</p>
                                    </div>
                                    <Workflow className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Workflows</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">
                                            {workflows.filter(w => w.status === 'active').length}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Executions</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">{executions.length}</p>
                                    </div>
                                    <Play className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Success Rate</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            {executions.length > 0 
                                                ? ((executions.filter(e => e.status === 'completed').length / executions.length) * 100).toFixed(1)
                                                : 0}%
                                        </p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="workflows">Workflows</TabsTrigger>
                            <TabsTrigger value="executions">Executions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="workflows" className="space-y-4 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                {filteredWorkflows.map(workflow => (
                                    <Card key={workflow.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{workflow.workflow_name}</CardTitle>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {psps.find(p => p.id === workflow.psp_id)?.psp_name}
                                                    </p>
                                                </div>
                                                <Badge className={
                                                    workflow.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                    workflow.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }>
                                                    {workflow.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-slate-600 mb-3">{workflow.description}</p>
                                            <div className="flex items-center gap-2 mb-3 text-sm">
                                                <Badge variant="outline">{workflow.steps?.length || 0} steps</Badge>
                                                <Badge variant="outline">v{workflow.version}</Badge>
                                            </div>
                                            <div className="text-xs text-slate-500 mb-3">
                                                Executions: {workflow.total_executions || 0} | Success: {workflow.success_rate || 0}%
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(workflow)}>
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredWorkflows.length === 0 && (
                                <div className="text-center py-12">
                                    <Workflow className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                    <p className="text-slate-600 mb-4">No workflows created yet</p>
                                    <Button onClick={() => { setEditingWorkflow(null); setShowDialog(true); }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Workflow
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="executions" className="space-y-4 mt-6">
                            <WorkflowExecutionMonitor executions={executions} workflows={workflows} />
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
                        <DialogDescription>
                            Build a custom merchant onboarding workflow with conditional steps and approvals
                        </DialogDescription>
                    </DialogHeader>
                    <WorkflowBuilder 
                        workflow={editingWorkflow}
                        psps={psps}
                        onSave={(data) => {
                            if (editingWorkflow) {
                                updateMutation.mutate({ id: editingWorkflow.id, data });
                            } else {
                                createMutation.mutate(data);
                            }
                        }}
                        onCancel={() => setShowDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}