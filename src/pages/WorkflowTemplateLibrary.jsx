import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Workflow, Plus, Edit, Copy, BookTemplate, Shield, FileCheck, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';

export default function WorkflowTemplateLibrary() {
    const { platformUser, loading } = usePlatformAuth(['platform_admin', 'super_admin']);
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Fetch platform-level templates (psp_id IS NULL)
    const { data: templates = [] } = useQuery({
        queryKey: ['workflow-templates'],
        queryFn: async () => {
            const all = await base44.entities.MerchantOnboardingWorkflowTemplate.list();
            return all.filter(w => !w.psp_id); // Platform templates only
        }
    });

    // Track template usage across PSPs
    const { data: templateUsage = [] } = useQuery({
        queryKey: ['template-usage'],
        queryFn: async () => {
            const all = await base44.entities.MerchantOnboardingWorkflowTemplate.list();
            const usage = {};
            all.filter(w => w.cloned_from_template).forEach(w => {
                usage[w.cloned_from_template] = (usage[w.cloned_from_template] || 0) + 1;
            });
            return usage;
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.MerchantOnboardingWorkflowTemplate.create({
            ...data,
            workflow_id: `TEMPLATE-${Date.now()}`,
            psp_id: null, // Platform template
            psp_code: null,
            is_template: true,
            status: 'active',
            version: '1.0.0'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['workflow-templates']);
            setShowDialog(false);
            toast.success('Template created successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MerchantOnboardingWorkflowTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['workflow-templates']);
            setShowDialog(false);
            setEditingTemplate(null);
            toast.success('Template updated');
        }
    });

    const duplicateMutation = useMutation({
        mutationFn: (template) => {
            const { id, created_date, updated_date, ...rest } = template;
            return base44.entities.MerchantOnboardingWorkflowTemplate.create({
                ...rest,
                workflow_id: `TEMPLATE-${Date.now()}`,
                workflow_name: `${template.workflow_name} (Copy)`,
                version: '1.0.0'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['workflow-templates']);
            toast.success('Template duplicated');
        }
    });

    if (loading) return null;

    const predefinedTemplates = [
        {
            category: 'Standard Flows',
            icon: FileCheck,
            templates: templates.filter(t => t.workflow_name.includes('Standard') || t.workflow_name.includes('Basic'))
        },
        {
            category: 'Industry Specific',
            icon: Shield,
            templates: templates.filter(t => t.workflow_name.includes('Crypto') || t.workflow_name.includes('Enterprise') || t.workflow_name.includes('E-commerce'))
        },
        {
            category: 'Advanced Workflows',
            icon: Zap,
            templates: templates.filter(t => t.workflow_name.includes('Advanced') || t.workflow_name.includes('Multi-step'))
        }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="WorkflowTemplateLibrary" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Workflow Template Library</h2>
                        <p className="text-xs text-slate-600">Platform-level templates for PSPs to clone and customize</p>
                    </div>
                    <Button onClick={() => { setEditingTemplate(null); setShowDialog(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                </header>

                <main className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Templates</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{templates.length}</p>
                                    </div>
                                    <BookTemplate className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Templates</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">
                                            {templates.filter(t => t.status === 'active').length}
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
                                        <p className="text-sm text-slate-600">Total Clones</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">
                                            {Object.values(templateUsage).reduce((a, b) => a + b, 0)}
                                        </p>
                                    </div>
                                    <Copy className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Most Popular</p>
                                        <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                                            {Object.entries(templateUsage).sort((a, b) => b[1] - a[1])[0]?.[0]?.substring(0, 15) || 'N/A'}
                                        </p>
                                    </div>
                                    <Workflow className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Template Categories */}
                    <div className="space-y-6">
                        {predefinedTemplates.map(({ category, icon: Icon, templates: categoryTemplates }) => (
                            categoryTemplates.length > 0 && (
                                <div key={category}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Icon className="h-5 w-5 text-slate-600" />
                                        <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                                        <Badge variant="outline">{categoryTemplates.length}</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {categoryTemplates.map(template => (
                                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-base">{template.workflow_name}</CardTitle>
                                                            <p className="text-xs text-slate-500 mt-1">v{template.version}</p>
                                                        </div>
                                                        <Badge className={
                                                            template.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {template.status}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{template.description}</p>
                                                    <div className="flex items-center gap-2 mb-3 text-xs">
                                                        <Badge variant="outline">{template.steps?.length || 0} steps</Badge>
                                                        <Badge variant="outline" className="text-purple-700 border-purple-200">
                                                            {templateUsage[template.workflow_id] || 0} PSPs using
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); setShowDialog(true); }}>
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => duplicateMutation.mutate(template)}>
                                                            <Copy className="h-3 w-3 mr-1" />
                                                            Duplicate
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}

                        {/* Other Templates */}
                        {templates.filter(t => 
                            !t.workflow_name.includes('Standard') && 
                            !t.workflow_name.includes('Basic') &&
                            !t.workflow_name.includes('Crypto') && 
                            !t.workflow_name.includes('Enterprise') &&
                            !t.workflow_name.includes('E-commerce') &&
                            !t.workflow_name.includes('Advanced') &&
                            !t.workflow_name.includes('Multi-step')
                        ).length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Other Templates</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {templates.filter(t => 
                                        !t.workflow_name.includes('Standard') && 
                                        !t.workflow_name.includes('Basic') &&
                                        !t.workflow_name.includes('Crypto') && 
                                        !t.workflow_name.includes('Enterprise') &&
                                        !t.workflow_name.includes('E-commerce') &&
                                        !t.workflow_name.includes('Advanced') &&
                                        !t.workflow_name.includes('Multi-step')
                                    ).map(template => (
                                        <Card key={template.id}>
                                            <CardHeader>
                                                <CardTitle className="text-base">{template.workflow_name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); setShowDialog(true); }}>
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => duplicateMutation.mutate(template)}>
                                                        <Copy className="h-3 w-3 mr-1" />
                                                        Duplicate
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {templates.length === 0 && (
                            <div className="text-center py-12">
                                <BookTemplate className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 mb-4">No templates created yet</p>
                                <Button onClick={() => { setEditingTemplate(null); setShowDialog(true); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Template
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
                        <DialogDescription>
                            Create a reusable workflow template that PSPs can clone and customize
                        </DialogDescription>
                    </DialogHeader>
                    <WorkflowBuilder 
                        workflow={editingTemplate}
                        psps={[]} // No PSP selection for templates
                        isTemplate={true}
                        onSave={(data) => {
                            if (editingTemplate) {
                                updateMutation.mutate({ id: editingTemplate.id, data });
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