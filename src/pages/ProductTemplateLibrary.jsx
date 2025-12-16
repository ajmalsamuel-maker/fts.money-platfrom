import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Copy, Trash2, Star, CheckCircle, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductTemplateLibrary() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Fetch platform-level templates (psp_id = null or is_platform_template = true)
    const { data: templates = [] } = useQuery({
        queryKey: ['product-templates-platform'],
        queryFn: async () => {
            const all = await base44.entities.PSPProductTemplate.list();
            return all.filter(t => !t.psp_id || t.is_platform_template);
        }
    });

    // Count usage across PSPs
    const { data: allProducts = [] } = useQuery({
        queryKey: ['all-psp-products'],
        queryFn: () => base44.entities.PSPProductTemplate.list()
    });

    const [templateForm, setTemplateForm] = useState({
        product_name: '',
        product_description: '',
        product_category: 'payment_processing',
        version: '1.0.0',
        lifecycle_state: 'active',
        is_bundle: false,
        base_price: 0,
        pricing_model: 'fixed',
        features: [],
        components: [],
        is_platform_template: true
    });

    // Mutations
    const createTemplateMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.PSPProductTemplate.create({
                ...data,
                product_id: `TPL-${Date.now()}`,
                psp_id: null,
                psp_code: null,
                is_platform_template: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['product-templates-platform']);
            setShowDialog(false);
            resetForm();
            toast.success('Template created successfully');
        }
    });

    const updateTemplateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PSPProductTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['product-templates-platform']);
            setShowDialog(false);
            setEditingTemplate(null);
            resetForm();
            toast.success('Template updated successfully');
        }
    });

    const duplicateTemplateMutation = useMutation({
        mutationFn: async (template) => {
            return await base44.entities.PSPProductTemplate.create({
                ...template,
                product_id: `TPL-${Date.now()}`,
                product_name: `${template.product_name} (Copy)`,
                version: '1.0.0',
                lifecycle_state: 'draft',
                total_subscribers: 0,
                is_platform_template: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['product-templates-platform']);
            toast.success('Template duplicated successfully');
        }
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: (id) => base44.entities.PSPProductTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['product-templates-platform']);
            toast.success('Template deleted');
        }
    });

    const resetForm = () => {
        setTemplateForm({
            product_name: '',
            product_description: '',
            product_category: 'payment_processing',
            version: '1.0.0',
            lifecycle_state: 'active',
            is_bundle: false,
            base_price: 0,
            pricing_model: 'fixed',
            features: [],
            components: [],
            is_platform_template: true
        });
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setTemplateForm({
            product_name: template.product_name,
            product_description: template.product_description || '',
            product_category: template.product_category,
            version: template.version,
            lifecycle_state: template.lifecycle_state,
            is_bundle: template.is_bundle || false,
            base_price: template.base_price || 0,
            pricing_model: template.pricing_model,
            features: template.features || [],
            components: template.components || [],
            is_platform_template: true
        });
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingTemplate) {
            updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateForm });
        } else {
            createTemplateMutation.mutate(templateForm);
        }
    };

    const addFeature = () => {
        const feature = prompt('Enter feature name:');
        if (feature) {
            setTemplateForm({
                ...templateForm,
                features: [...(templateForm.features || []), feature]
            });
        }
    };

    const removeFeature = (index) => {
        setTemplateForm({
            ...templateForm,
            features: templateForm.features.filter((_, i) => i !== index)
        });
    };

    // Calculate usage for each template
    const getTemplateUsage = (templateId) => {
        return allProducts.filter(p => 
            p.cloned_from_template === templateId || 
            (p.product_name && templates.find(t => t.id === templateId)?.product_name === p.product_name && p.psp_id)
        ).length;
    };

    if (loading) return null;

    const templatesByCategory = templates.reduce((acc, template) => {
        const cat = template.product_category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(template);
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ProductTemplateLibrary" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Product Template Library</h2>
                        <p className="text-xs text-slate-600">Platform-level reusable product templates for PSPs</p>
                    </div>
                    <Button 
                        onClick={() => { 
                            resetForm(); 
                            setEditingTemplate(null); 
                            setShowDialog(true); 
                        }}
                        className="bg-blue-600"
                    >
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
                                    <Star className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Templates</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">
                                            {templates.filter(t => t.lifecycle_state === 'active').length}
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
                                        <p className="text-sm text-slate-600">Total Usage</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">
                                            {templates.reduce((sum, t) => sum + getTemplateUsage(t.id), 0)}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Product Bundles</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">
                                            {templates.filter(t => t.is_bundle).length}
                                        </p>
                                    </div>
                                    <Package className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Templates by Category */}
                    <div className="space-y-6">
                        {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                            <Card key={category}>
                                <CardHeader>
                                    <CardTitle className="capitalize">{category.replace(/_/g, ' ')}</CardTitle>
                                    <CardDescription>{categoryTemplates.length} templates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {categoryTemplates.map(template => {
                                            const usage = getTemplateUsage(template.id);
                                            return (
                                                <Card key={template.id} className="hover:shadow-lg transition-shadow border-amber-200 bg-amber-50/30">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Star className="h-4 w-4 text-amber-600" />
                                                                    <CardTitle className="text-base">{template.product_name}</CardTitle>
                                                                </div>
                                                                <p className="text-xs text-slate-500">Platform Template</p>
                                                            </div>
                                                            <Badge className={
                                                                template.lifecycle_state === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                template.lifecycle_state === 'beta' ? 'bg-blue-100 text-blue-700' :
                                                                template.lifecycle_state === 'deprecated' ? 'bg-red-100 text-red-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {template.lifecycle_state}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                                            {template.product_description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Badge variant="outline" className="text-xs">v{template.version}</Badge>
                                                            {template.is_bundle && (
                                                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                                    Bundle
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-xs">
                                                                ${template.base_price}/mo
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            Used by {usage} PSP{usage !== 1 ? 's' : ''}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                                                                <Edit className="h-3 w-3 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => duplicateTemplateMutation.mutate(template)}>
                                                                <Copy className="h-3 w-3 mr-1" />
                                                                Duplicate
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="text-red-600"
                                                                onClick={() => {
                                                                    if (confirm('Delete this template?')) {
                                                                        deleteTemplateMutation.mutate(template.id);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {templates.length === 0 && (
                        <div className="text-center py-12">
                            <Star className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 mb-4">No product templates created yet</p>
                            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Template
                            </Button>
                        </div>
                    )}
                </main>
            </div>

            {/* Template Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Product Template'}</DialogTitle>
                        <DialogDescription>
                            Define a reusable product template that PSPs can clone and customize
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Product Name</Label>
                            <Input
                                value={templateForm.product_name}
                                onChange={(e) => setTemplateForm({...templateForm, product_name: e.target.value})}
                                placeholder="e.g., Basic Payment Gateway"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={templateForm.product_description}
                                onChange={(e) => setTemplateForm({...templateForm, product_description: e.target.value})}
                                placeholder="Describe the product template..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Category</Label>
                                <Select 
                                    value={templateForm.product_category} 
                                    onValueChange={(v) => setTemplateForm({...templateForm, product_category: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="payment_processing">Payment Processing</SelectItem>
                                        <SelectItem value="fraud_detection">Fraud Detection</SelectItem>
                                        <SelectItem value="analytics">Analytics</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                        <SelectItem value="api_services">API Services</SelectItem>
                                        <SelectItem value="merchant_tools">Merchant Tools</SelectItem>
                                        <SelectItem value="reporting">Reporting</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Lifecycle State</Label>
                                <Select 
                                    value={templateForm.lifecycle_state} 
                                    onValueChange={(v) => setTemplateForm({...templateForm, lifecycle_state: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="beta">Beta</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="deprecated">Deprecated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Version</Label>
                                <Input
                                    value={templateForm.version}
                                    onChange={(e) => setTemplateForm({...templateForm, version: e.target.value})}
                                    placeholder="1.0.0"
                                />
                            </div>

                            <div>
                                <Label>Base Price ($)</Label>
                                <Input
                                    type="number"
                                    value={templateForm.base_price}
                                    onChange={(e) => setTemplateForm({...templateForm, base_price: parseFloat(e.target.value) || 0})}
                                />
                            </div>

                            <div>
                                <Label>Pricing Model</Label>
                                <Select 
                                    value={templateForm.pricing_model} 
                                    onValueChange={(v) => setTemplateForm({...templateForm, pricing_model: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed</SelectItem>
                                        <SelectItem value="usage_based">Usage Based</SelectItem>
                                        <SelectItem value="tiered">Tiered</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Features</Label>
                                <Button size="sm" variant="outline" onClick={addFeature}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Feature
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {(templateForm.features || []).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input value={feature} disabled />
                                        <Button size="sm" variant="outline" onClick={() => removeFeature(idx)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                            >
                                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                {editingTemplate ? 'Update' : 'Create'} Template
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}