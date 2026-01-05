import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash, Copy, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import InvoiceTemplateBuilder from './InvoiceTemplateBuilder';

export default function InvoiceTemplateManager() {
    const [builderOpen, setBuilderOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const queryClient = useQueryClient();

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['invoice-templates'],
        queryFn: async () => {
            const result = await base44.entities.InvoiceTemplate.list();
            return result || [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (templateId) => base44.entities.InvoiceTemplate.delete(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoice-templates']);
            toast.success('Template deleted');
        }
    });

    const setDefaultMutation = useMutation({
        mutationFn: async (templateId) => {
            // Unset all defaults first
            const updates = templates.map(t => 
                base44.entities.InvoiceTemplate.update(t.id, { is_default: false })
            );
            await Promise.all(updates);
            
            // Set new default
            await base44.entities.InvoiceTemplate.update(templateId, { is_default: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['invoice-templates']);
            toast.success('Default template updated');
        }
    });

    const duplicateMutation = useMutation({
        mutationFn: async (template) => {
            const { id, created_date, updated_date, ...templateData } = template;
            return await base44.entities.InvoiceTemplate.create({
                ...templateData,
                template_name: `${template.template_name} (Copy)`,
                is_default: false,
                status: 'draft'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['invoice-templates']);
            toast.success('Template duplicated');
        }
    });

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setBuilderOpen(true);
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setBuilderOpen(true);
    };

    const handleSave = () => {
        queryClient.invalidateQueries(['invoice-templates']);
        setBuilderOpen(false);
        setEditingTemplate(null);
    };

    const getSegmentBadge = (segment) => {
        const colors = {
            enterprise: 'bg-purple-100 text-purple-800',
            sme: 'bg-blue-100 text-blue-800',
            retail: 'bg-green-100 text-green-800',
            subscription: 'bg-orange-100 text-orange-800',
            digital_services: 'bg-cyan-100 text-cyan-800',
            all: 'bg-slate-100 text-slate-800'
        };
        return <Badge className={colors[segment] || colors.all}>{segment.replace('_', ' ')}</Badge>;
    };

    const getTypeBadge = (type) => {
        const colors = {
            b2c: 'bg-green-100 text-green-800',
            b2b: 'bg-blue-100 text-blue-800',
            reverse_charge: 'bg-purple-100 text-purple-800',
            custom: 'bg-slate-100 text-slate-800'
        };
        return <Badge className={colors[type]}>{type.replace('_', ' ')}</Badge>;
    };

    if (isLoading) {
        return <div>Loading templates...</div>;
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Invoice Templates</h3>
                        <p className="text-slate-600">Create custom templates for different customer segments</p>
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Template
                    </Button>
                </div>

                {/* Templates Grid */}
                {templates.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="text-slate-400 mb-4">
                                <Plus className="h-12 w-12 mx-auto mb-2" />
                                <p>No templates yet</p>
                            </div>
                            <Button onClick={handleCreate}>Create Your First Template</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {template.template_name}
                                                {template.is_default && (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                )}
                                            </CardTitle>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {getTypeBadge(template.template_type)}
                                                {getSegmentBadge(template.customer_segment)}
                                            </div>
                                        </div>
                                        {template.logo_url && (
                                            <img src={template.logo_url} alt="Logo" className="h-8 w-auto" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: template.primary_color }} />
                                        <span>Service: {template.service_type}</span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(template)}
                                            className="flex-1"
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => duplicateMutation.mutate(template)}
                                            disabled={duplicateMutation.isPending}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => deleteMutation.mutate(template.id)}
                                            disabled={deleteMutation.isPending || template.is_default}
                                        >
                                            <Trash className="h-3 w-3 text-red-600" />
                                        </Button>
                                    </div>

                                    {!template.is_default && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="w-full"
                                            onClick={() => setDefaultMutation.mutate(template.id)}
                                            disabled={setDefaultMutation.isPending}
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Template Builder Dialog */}
            <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? 'Edit Template' : 'Create New Template'}
                        </DialogTitle>
                    </DialogHeader>
                    <InvoiceTemplateBuilder
                        template={editingTemplate}
                        onSave={handleSave}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}