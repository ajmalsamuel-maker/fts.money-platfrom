import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Star, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowTemplateManager() {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        template_name: '',
        description: '',
        workflow_type: 'custom',
        iso_19510_compliant: true,
        iso_23005_7_compliant: false,
        iso_10746_compliant: true,
        iso_9001_compliant: true,
        quality_thresholds: {
            min_success_rate: 95,
            max_completion_time: 3600,
            sla_target: 99
        }
    });

    const { data: templates = [] } = useQuery({
        queryKey: ['workflow-templates'],
        queryFn: () => base44.entities.WorkflowTemplate.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.WorkflowTemplate.create({
            ...data,
            template_id: `TPL-${Date.now()}`,
            created_by: 'admin',
            usage_count: 0
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['workflow-templates']);
            setShowDialog(false);
            resetForm();
            toast.success('Template created successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.WorkflowTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['workflow-templates']);
            toast.success('Template updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.WorkflowTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['workflow-templates']);
            toast.success('Template deleted');
        }
    });

    const resetForm = () => {
        setFormData({
            template_name: '',
            description: '',
            workflow_type: 'custom',
            iso_19510_compliant: true,
            iso_23005_7_compliant: false,
            iso_10746_compliant: true,
            iso_9001_compliant: true,
            quality_thresholds: {
                min_success_rate: 95,
                max_completion_time: 3600,
                sla_target: 99
            }
        });
        setEditingTemplate(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            template_name: template.template_name,
            description: template.description,
            workflow_type: template.workflow_type,
            iso_19510_compliant: template.iso_19510_compliant,
            iso_23005_7_compliant: template.iso_23005_7_compliant,
            iso_10746_compliant: template.iso_10746_compliant,
            iso_9001_compliant: template.iso_9001_compliant,
            quality_thresholds: template.quality_thresholds || {
                min_success_rate: 95,
                max_completion_time: 3600,
                sla_target: 99
            }
        });
        setShowDialog(true);
    };

    const handleDuplicate = async (template) => {
        const newTemplate = {
            ...template,
            template_id: `TPL-${Date.now()}`,
            template_name: `${template.template_name} (Copy)`,
            usage_count: 0,
            is_default: false
        };
        delete newTemplate.id;
        await base44.entities.WorkflowTemplate.create(newTemplate);
        queryClient.invalidateQueries(['workflow-templates']);
        toast.success('Template duplicated');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Workflow Templates</h3>
                    <p className="text-sm text-slate-600">Reusable templates for consistent compliance</p>
                </div>
                <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Template
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {template.template_name}
                                        {template.is_default && (
                                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        )}
                                    </CardTitle>
                                    <p className="text-xs text-slate-600 mt-1">{template.template_id}</p>
                                </div>
                                <Badge variant="outline" className="capitalize">
                                    {template.workflow_type.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">BPMN 2.0:</span>
                                    <Badge className={template.iso_19510_compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                        {template.iso_19510_compliant ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">ODP:</span>
                                    <Badge className={template.iso_10746_compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                        {template.iso_10746_compliant ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">ISO 9001:</span>
                                    <Badge className={template.iso_9001_compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                        {template.iso_9001_compliant ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                                <span>Used {template.usage_count} times</span>
                                <Badge className={template.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                    {template.status}
                                </Badge>
                            </div>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(template)} className="flex-1">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDuplicate(template)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(template.id)} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-3 text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                        <p className="text-slate-600">No templates created yet</p>
                        <Button onClick={() => setShowDialog(true)} variant="outline" className="mt-4">
                            Create First Template
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Workflow Template</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Template Name</Label>
                            <Input
                                value={formData.template_name}
                                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>Workflow Type</Label>
                            <Select value={formData.workflow_type} onValueChange={(value) => setFormData({ ...formData, workflow_type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="psp_provisioning">PSP Provisioning</SelectItem>
                                    <SelectItem value="merchant_onboarding">Merchant Onboarding</SelectItem>
                                    <SelectItem value="transaction_processing">Transaction Processing</SelectItem>
                                    <SelectItem value="compliance_verification">Compliance Verification</SelectItem>
                                    <SelectItem value="payout_processing">Payout Processing</SelectItem>
                                    <SelectItem value="service_provisioning">Service Provisioning</SelectItem>
                                    <SelectItem value="dispute_resolution">Dispute Resolution</SelectItem>
                                    <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label>ISO Standards Compliance</Label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.iso_19510_compliant}
                                        onChange={(e) => setFormData({ ...formData, iso_19510_compliant: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">ISO/IEC 19510 (BPMN 2.0)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.iso_10746_compliant}
                                        onChange={(e) => setFormData({ ...formData, iso_10746_compliant: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">ISO/IEC 10746 (ODP Framework)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.iso_9001_compliant}
                                        onChange={(e) => setFormData({ ...formData, iso_9001_compliant: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">ISO 9001 (Quality Management)</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {editingTemplate ? 'Update' : 'Create'} Template
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}