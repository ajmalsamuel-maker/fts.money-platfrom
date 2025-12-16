import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, MoveUp, MoveDown, GitBranch, CheckCircle } from 'lucide-react';

export default function WorkflowBuilder({ workflow, psps, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        psp_id: '',
        workflow_name: '',
        description: '',
        steps: [],
        approval_gates: [],
        notification_config: {
            email_notifications: true,
            slack_notifications: false,
            webhook_url: ''
        }
    });

    useEffect(() => {
        if (workflow) {
            setFormData({
                psp_id: workflow.psp_id,
                workflow_name: workflow.workflow_name,
                description: workflow.description || '',
                steps: workflow.steps || [],
                approval_gates: workflow.approval_gates || [],
                notification_config: workflow.notification_config || {
                    email_notifications: true,
                    slack_notifications: false,
                    webhook_url: ''
                }
            });
        }
    }, [workflow]);

    const loadStandardTemplate = () => {
        const standardSteps = [
            { step_id: 'STEP-1', step_name: 'Contact Information', step_order: 1, step_type: 'form', required: true, component: 'ContactInfoStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-2', step_name: 'Business Details', step_order: 2, step_type: 'form', required: true, component: 'BusinessDetailsStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-3', step_name: 'Company Structure', step_order: 3, step_type: 'form', required: true, component: 'CompanyStructureStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-4', step_name: 'KYB Verification', step_order: 4, step_type: 'verification', required: true, component: 'KYBVerificationStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-5', step_name: 'LEI Verification', step_order: 5, step_type: 'verification', required: false, component: 'LEIVerificationStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-6', step_name: 'AML Screening', step_order: 6, step_type: 'verification', required: true, component: 'AMLScreeningStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-7', step_name: 'Document Upload', step_order: 7, step_type: 'form', required: true, component: 'DocumentUploadStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-8', step_name: 'Bank Details', step_order: 8, step_type: 'form', required: true, component: 'BankDetailsStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-9', step_name: 'Pricing Configuration', step_order: 9, step_type: 'form', required: true, component: 'PricingStep', rollback_action: 'notify_admin' },
            { step_id: 'STEP-10', step_name: 'Review & Submit', step_order: 10, step_type: 'approval', required: true, component: 'ReviewSubmitStep', approval_role: 'finance_manager', rollback_action: 'notify_admin' }
        ];
        setFormData({
            ...formData,
            steps: standardSteps
        });
    };

    const addStep = () => {
        const newStep = {
            step_id: `STEP-${Date.now()}`,
            step_name: 'New Step',
            step_order: formData.steps.length + 1,
            step_type: 'form',
            required: true,
            form_fields: [],
            rollback_action: 'notify_admin'
        };
        setFormData({
            ...formData,
            steps: [...formData.steps, newStep]
        });
    };

    const removeStep = (index) => {
        const newSteps = formData.steps.filter((_, i) => i !== index);
        // Reorder
        newSteps.forEach((step, i) => {
            step.step_order = i + 1;
        });
        setFormData({ ...formData, steps: newSteps });
    };

    const moveStep = (index, direction) => {
        const newSteps = [...formData.steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSteps.length) return;
        
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        newSteps.forEach((step, i) => {
            step.step_order = i + 1;
        });
        setFormData({ ...formData, steps: newSteps });
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setFormData({ ...formData, steps: newSteps });
    };

    const addConditionalBranch = (index) => {
        const newSteps = [...formData.steps];
        newSteps[index] = {
            ...newSteps[index],
            step_type: 'conditional',
            condition: {
                field: '',
                operator: 'equals',
                value: '',
                then_step: '',
                else_step: ''
            }
        };
        setFormData({ ...formData, steps: newSteps });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>PSP</Label>
                    <Select 
                        value={formData.psp_id} 
                        onValueChange={(v) => setFormData({...formData, psp_id: v})}
                        disabled={!!workflow}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select PSP" />
                        </SelectTrigger>
                        <SelectContent>
                            {psps.map(psp => (
                                <SelectItem key={psp.id} value={psp.id}>{psp.psp_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Workflow Name</Label>
                    <Input
                        value={formData.workflow_name}
                        onChange={(e) => setFormData({...formData, workflow_name: e.target.value})}
                        placeholder="Standard Merchant Onboarding"
                    />
                </div>
            </div>

            <div>
                <Label>Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-base">Workflow Steps</Label>
                    <div className="flex gap-2">
                        {formData.steps.length === 0 && (
                            <Button size="sm" variant="outline" onClick={loadStandardTemplate}>
                                Load Standard Template (10 steps)
                            </Button>
                        )}
                        <Button size="sm" onClick={addStep}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Step
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    {formData.steps.map((step, index) => (
                        <Card key={step.step_id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col gap-1">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => moveStep(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <MoveUp className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => moveStep(index, 'down')}
                                            disabled={index === formData.steps.length - 1}
                                        >
                                            <MoveDown className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-100 text-blue-700">Step {step.step_order}</Badge>
                                            <Input
                                                value={step.step_name}
                                                onChange={(e) => updateStep(index, 'step_name', e.target.value)}
                                                placeholder="Step name"
                                                className="flex-1"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs">Step Type</Label>
                                                <Select 
                                                    value={step.step_type} 
                                                    onValueChange={(v) => updateStep(index, 'step_type', v)}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="form">Form Input</SelectItem>
                                                        <SelectItem value="verification">Verification</SelectItem>
                                                        <SelectItem value="approval">Approval Gate</SelectItem>
                                                        <SelectItem value="notification">Notification</SelectItem>
                                                        <SelectItem value="integration">Integration</SelectItem>
                                                        <SelectItem value="conditional">Conditional</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center justify-between pt-5">
                                                <Label className="text-xs">Required</Label>
                                                <Switch 
                                                    checked={step.required}
                                                    onCheckedChange={(v) => updateStep(index, 'required', v)}
                                                />
                                            </div>
                                        </div>

                                        {step.step_type === 'approval' && (
                                            <div>
                                                <Label className="text-xs">Approval Role</Label>
                                                <Input
                                                    value={step.approval_role || ''}
                                                    onChange={(e) => updateStep(index, 'approval_role', e.target.value)}
                                                    placeholder="finance_manager"
                                                />
                                            </div>
                                        )}

                                        {step.step_type === 'conditional' && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <GitBranch className="h-4 w-4 text-amber-600" />
                                                    <Label className="text-xs">Conditional Logic</Label>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Input
                                                        placeholder="Field name"
                                                        value={step.condition?.field || ''}
                                                        onChange={(e) => updateStep(index, 'condition', { ...step.condition, field: e.target.value })}
                                                        className="h-8 text-xs"
                                                    />
                                                    <Select 
                                                        value={step.condition?.operator || 'equals'}
                                                        onValueChange={(v) => updateStep(index, 'condition', { ...step.condition, operator: v })}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="equals">Equals</SelectItem>
                                                            <SelectItem value="not_equals">Not Equals</SelectItem>
                                                            <SelectItem value="greater_than">Greater Than</SelectItem>
                                                            <SelectItem value="less_than">Less Than</SelectItem>
                                                            <SelectItem value="contains">Contains</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        placeholder="Value"
                                                        value={step.condition?.value || ''}
                                                        onChange={(e) => updateStep(index, 'condition', { ...step.condition, value: e.target.value })}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => removeStep(index)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <Label className="mb-2 block">Notification Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <Label className="text-sm">Email Notifications</Label>
                        <Switch 
                            checked={formData.notification_config.email_notifications}
                            onCheckedChange={(v) => setFormData({
                                ...formData,
                                notification_config: { ...formData.notification_config, email_notifications: v }
                            })}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <Label className="text-sm">Slack Notifications</Label>
                        <Switch 
                            checked={formData.notification_config.slack_notifications}
                            onCheckedChange={(v) => setFormData({
                                ...formData,
                                notification_config: { ...formData.notification_config, slack_notifications: v }
                            })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(formData)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Workflow
                </Button>
            </div>
        </div>
    );
}