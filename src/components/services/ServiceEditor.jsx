import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceEditor({ service, allServices, onSave, onClose }) {
    const [formData, setFormData] = useState(service || {
        service_name: '',
        service_category: 'payment_rail',
        version: '1.0.0',
        lifecycle_state: 'development',
        is_bundle: false,
        dependencies: [],
        bundle_components: [],
        health_check_enabled: true,
        health_check_interval: 300,
        pricing_model: 'per_transaction'
    });

    const handleAddDependency = () => {
        setFormData({
            ...formData,
            dependencies: [
                ...(formData.dependencies || []),
                { service_id: '', service_name: '', version_requirement: '>=1.0.0', required: true }
            ]
        });
    };

    const handleRemoveDependency = (index) => {
        setFormData({
            ...formData,
            dependencies: formData.dependencies.filter((_, i) => i !== index)
        });
    };

    const handleAddBundleComponent = () => {
        setFormData({
            ...formData,
            bundle_components: [
                ...(formData.bundle_components || []),
                { service_id: '', service_name: '', is_optional: false }
            ]
        });
    };

    const handleRemoveBundleComponent = (index) => {
        setFormData({
            ...formData,
            bundle_components: formData.bundle_components.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Generate service_id if new
        if (!formData.service_id) {
            formData.service_id = `SRV-${formData.service_name.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`;
        }

        onSave(formData);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{service ? 'Edit Service' : 'Create New Service'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Service Name *</Label>
                                <Input
                                    value={formData.service_name}
                                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Category *</Label>
                                <Select value={formData.service_category} onValueChange={(value) => setFormData({ ...formData, service_category: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="payment_rail">Payment Rail</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                        <SelectItem value="fraud_detection">Fraud Detection</SelectItem>
                                        <SelectItem value="analytics">Analytics</SelectItem>
                                        <SelectItem value="crypto">Crypto</SelectItem>
                                        <SelectItem value="developer_tools">Developer Tools</SelectItem>
                                        <SelectItem value="orchestration">Orchestration</SelectItem>
                                        <SelectItem value="payout">Payout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Version</Label>
                                <Input
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    placeholder="1.0.0"
                                />
                            </div>
                            <div>
                                <Label>Lifecycle State</Label>
                                <Select value={formData.lifecycle_state} onValueChange={(value) => setFormData({ ...formData, lifecycle_state: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="development">Development</SelectItem>
                                        <SelectItem value="beta">Beta</SelectItem>
                                        <SelectItem value="GA">GA (General Availability)</SelectItem>
                                        <SelectItem value="mature">Mature</SelectItem>
                                        <SelectItem value="deprecated">Deprecated</SelectItem>
                                        <SelectItem value="sunset">Sunset</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Pricing Model</Label>
                                <Select value={formData.pricing_model} onValueChange={(value) => setFormData({ ...formData, pricing_model: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed</SelectItem>
                                        <SelectItem value="per_transaction">Per Transaction</SelectItem>
                                        <SelectItem value="tiered">Tiered</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Dependencies */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900">Dependencies</h3>
                            <Button type="button" size="sm" variant="outline" onClick={handleAddDependency}>
                                <Plus className="h-3 w-3 mr-1" />
                                Add Dependency
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {(formData.dependencies || []).map((dep, idx) => (
                                <div key={idx} className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Select
                                        value={dep.service_id}
                                        onValueChange={(value) => {
                                            const selectedService = allServices.find(s => s.service_id === value);
                                            const updated = [...formData.dependencies];
                                            updated[idx] = {
                                                ...updated[idx],
                                                service_id: value,
                                                service_name: selectedService?.service_name || ''
                                            };
                                            setFormData({ ...formData, dependencies: updated });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allServices.filter(s => s.service_id !== formData.service_id).map(s => (
                                                <SelectItem key={s.service_id} value={s.service_id}>
                                                    {s.service_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder=">=1.0.0"
                                        value={dep.version_requirement}
                                        onChange={(e) => {
                                            const updated = [...formData.dependencies];
                                            updated[idx].version_requirement = e.target.value;
                                            setFormData({ ...formData, dependencies: updated });
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={dep.required}
                                            onChange={(e) => {
                                                const updated = [...formData.dependencies];
                                                updated[idx].required = e.target.checked;
                                                setFormData({ ...formData, dependencies: updated });
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <Label className="text-xs">Required</Label>
                                    </div>
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleRemoveDependency(idx)} className="text-red-600">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            {(!formData.dependencies || formData.dependencies.length === 0) && (
                                <p className="text-sm text-slate-500 text-center py-3">No dependencies defined</p>
                            )}
                        </div>
                    </div>

                    {/* Bundle Configuration */}
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-3 mb-3">
                            <input
                                type="checkbox"
                                checked={formData.is_bundle}
                                onChange={(e) => setFormData({ ...formData, is_bundle: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label className="font-semibold">This is a bundle of multiple services</Label>
                        </div>
                        {formData.is_bundle && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Bundle Components</Label>
                                    <Button type="button" size="sm" variant="outline" onClick={handleAddBundleComponent}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Component
                                    </Button>
                                </div>
                                {(formData.bundle_components || []).map((comp, idx) => (
                                    <div key={idx} className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
                                        <Select
                                            value={comp.service_id}
                                            onValueChange={(value) => {
                                                const selectedService = allServices.find(s => s.service_id === value);
                                                const updated = [...formData.bundle_components];
                                                updated[idx] = {
                                                    ...updated[idx],
                                                    service_id: value,
                                                    service_name: selectedService?.service_name || ''
                                                };
                                                setFormData({ ...formData, bundle_components: updated });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allServices.filter(s => !s.is_bundle && s.service_id !== formData.service_id).map(s => (
                                                    <SelectItem key={s.service_id} value={s.service_id}>
                                                        {s.service_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={comp.is_optional}
                                                onChange={(e) => {
                                                    const updated = [...formData.bundle_components];
                                                    updated[idx].is_optional = e.target.checked;
                                                    setFormData({ ...formData, bundle_components: updated });
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <Label className="text-xs">Optional</Label>
                                        </div>
                                        <Button type="button" size="sm" variant="outline" onClick={() => handleRemoveBundleComponent(idx)} className="text-red-600">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                <div>
                                    <Label className="text-sm">Bundle Discount (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.bundle_discount_percentage || ''}
                                        onChange={(e) => setFormData({ ...formData, bundle_discount_percentage: parseFloat(e.target.value) })}
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Health Check Configuration */}
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-3 mb-3">
                            <input
                                type="checkbox"
                                checked={formData.health_check_enabled}
                                onChange={(e) => setFormData({ ...formData, health_check_enabled: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label className="font-semibold">Enable Automated Health Checks</Label>
                        </div>
                        {formData.health_check_enabled && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm">Health Check URL</Label>
                                    <Input
                                        value={formData.health_check_url || ''}
                                        onChange={(e) => setFormData({ ...formData, health_check_url: e.target.value })}
                                        placeholder="https://api.service.com/health"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Check Interval (seconds)</Label>
                                    <Input
                                        type="number"
                                        value={formData.health_check_interval}
                                        onChange={(e) => setFormData({ ...formData, health_check_interval: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="gap-2">
                            <Save className="h-4 w-4" />
                            {service ? 'Update Service' : 'Create Service'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}