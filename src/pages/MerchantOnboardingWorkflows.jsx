import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getStaffSession } from '@/components/auth/useStaffAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
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
import { Workflow, Plus, Edit, Play, CheckCircle, AlertCircle, BookTemplate, Copy } from 'lucide-react';
import { toast } from 'sonner';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import WorkflowExecutionMonitor from '@/components/workflow/WorkflowExecutionMonitor';

export default function MerchantOnboardingWorkflows() {
    const staffSession = getStaffSession();
    const pspCode = staffSession?.psp_code;
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('workflows');
    const [showDialog, setShowDialog] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Get current PSP
    const { data: currentPSP } = useQuery({
        queryKey: ['current-psp', pspCode],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.list();
            return psps.find(p => p.psp_code === pspCode);
        }
    });

    // Fetch PSP-specific workflows only
    const { data: workflows = [] } = useQuery({
        queryKey: ['merchant-workflows', pspCode],
        queryFn: async () => {
            return await base44.entities.MerchantOnboardingWorkflowTemplate.filter({ psp_code: pspCode });
        },
        enabled: !!pspCode
    });

    // Fetch platform templates for cloning
    const { data: platformTemplates = [] } = useQuery({
        queryKey: ['platform-templates'],
        queryFn: async () => {
            const all = await base44.entities.MerchantOnboardingWorkflowTemplate.list();
            return all.filter(w => !w.psp_id); // Platform templates only
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
            return base44.entities.MerchantOnboardingWorkflowTemplate.create({
                ...data,
                workflow_id: `WF-${pspCode}-${Date.now()}`,
                psp_id: currentPSP?.id,
                psp_code: pspCode,
                is_template: false,
                version: '1.0.0'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant-workflows']);
            setShowDialog(false);
            toast.success('Workflow created');
        }
    });

    const cloneTemplateMutation = useMutation({
        mutationFn: (template) => {
            const { id, created_date, updated_date, psp_id, psp_code: _, ...rest } = template;
            return base44.entities.MerchantOnboardingWorkflowTemplate.create({
                ...rest,
                workflow_id: `WF-${pspCode}-${Date.now()}`,
                psp_id: currentPSP?.id,
                psp_code: pspCode,
                workflow_name: `${template.workflow_name} (Cloned)`,
                is_template: false,
                cloned_from_template: template.workflow_id,
                version: '1.0.0',
                status: 'draft'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant-workflows']);
            setShowTemplateLibrary(false);
            toast.success('Template cloned successfully');
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

    if (!staffSession) {
        window.location.href = '/PSPLogin';
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="MerchantOnboardingWorkflows" />

            <div className="flex-1 overflow-auto">
                <TopHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Merchant Onboarding Workflows</h2>
                        <p className="text-sm text-slate-600">Create and manage custom workflows for merchant onboarding</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-6">
                        <Button onClick={() => { setEditingWorkflow(null); setShowDialog(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Custom Workflow
                        </Button>
                        <Button variant="outline" onClick={() => setShowTemplateLibrary(true)}>
                            <BookTemplate className="h-4 w-4 mr-2" />
                            Clone from Template Library
                        </Button>
                    </div>

                    {/* Stats */}
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
                                {workflows.map(workflow => (
                                    <Card key={workflow.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{workflow.workflow_name}</CardTitle>
                                                    {workflow.cloned_from_template && (
                                                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                                            <BookTemplate className="h-3 w-3" />
                                                            Cloned from template
                                                        </p>
                                                    )}
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

                            {workflows.length === 0 && (
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
                </div>
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
                        psps={currentPSP ? [currentPSP] : []}
                        isTemplate={false}
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

            {/* Template Library Dialog */}
            <Dialog open={showTemplateLibrary} onOpenChange={setShowTemplateLibrary}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Clone from Template Library</DialogTitle>
                        <DialogDescription>
                            Select a pre-built workflow template to clone and customize
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {platformTemplates.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <BookTemplate className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                <p>No platform templates available</p>
                            </div>
                        )}
                        {platformTemplates.map(template => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">{template.workflow_name}</CardTitle>
                                            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                                        </div>
                                        <Badge variant="outline">v{template.version}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Badge variant="outline">{template.steps?.length || 0} steps</Badge>
                                            <Badge variant="outline" className={
                                                template.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ''
                                            }>
                                                {template.status}
                                            </Badge>
                                        </div>
                                        <Button size="sm" onClick={() => cloneTemplateMutation.mutate(template)}>
                                            <Copy className="h-3 w-3 mr-1" />
                                            Clone Template
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}