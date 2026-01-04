import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings, CheckCircle, XCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

const SERVICE_TYPES = [
    { value: 'psp', label: 'PSP Platform', icon: '🏦' },
    { value: 'iso_gateway', label: 'ISO Gateway', icon: '🔌' },
    { value: 'orchestration', label: 'Orchestration', icon: '🎯' },
    { value: 'crypto_gateway', label: 'Crypto Banking', icon: '💎' },
    { value: 'rwa_platform', label: 'RWA Platform', icon: '📊' },
    { value: 'platform', label: 'Platform Services', icon: '⚙️' }
];

export default function ServiceVATConfig({ configurations }) {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({
        service_type: 'psp',
        entity_type: 'global',
        vat_enabled: true,
        calculation_mode: 'automatic',
        tax_point: 'payment_date',
        home_jurisdiction: '',
        tax_id_number: '',
        default_category: 'DIGITAL_SERVICES',
        apply_to_fees: true,
        inclusive_pricing: false,
        show_vat_on_invoice: true,
        moss_oss_enabled: false,
        reverse_charge_enabled: false,
        threshold_monitoring: true,
        auto_invoice_generation: true,
        invoice_prefix: 'INV-',
        status: 'active'
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.TaxConfiguration.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-configurations'] });
            setShowDialog(false);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, enabled }) => {
            return await base44.entities.TaxConfiguration.update(id, { vat_enabled: enabled });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-configurations'] });
        }
    });

    const getServiceIcon = (type) => {
        return SERVICE_TYPES.find(s => s.value === type)?.icon || '⚙️';
    };

    const getServiceLabel = (type) => {
        return SERVICE_TYPES.find(s => s.value === type)?.label || type;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Service VAT Configuration</h2>
                    <p className="text-sm text-slate-600">Enable/disable VAT for each service with one click</p>
                </div>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Configure Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Configure VAT for Service</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Service Type *</Label>
                                    <Select value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SERVICE_TYPES.map(service => (
                                                <SelectItem key={service.value} value={service.value}>
                                                    {service.icon} {service.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Home Jurisdiction</Label>
                                    <Input
                                        value={formData.home_jurisdiction}
                                        onChange={(e) => setFormData({...formData, home_jurisdiction: e.target.value.toUpperCase()})}
                                        placeholder="GB, US, FR"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Tax ID Number</Label>
                                    <Input
                                        value={formData.tax_id_number}
                                        onChange={(e) => setFormData({...formData, tax_id_number: e.target.value})}
                                        placeholder="GB123456789"
                                    />
                                </div>
                                <div>
                                    <Label>Default Category</Label>
                                    <Input
                                        value={formData.default_category}
                                        onChange={(e) => setFormData({...formData, default_category: e.target.value})}
                                        placeholder="DIGITAL_SERVICES"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Invoice Prefix</Label>
                                    <Input
                                        value={formData.invoice_prefix}
                                        onChange={(e) => setFormData({...formData, invoice_prefix: e.target.value})}
                                        placeholder="INV-"
                                    />
                                </div>
                                <div>
                                    <Label>Tax Point</Label>
                                    <Select value={formData.tax_point} onValueChange={(value) => setFormData({...formData, tax_point: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="invoice_date">Invoice Date</SelectItem>
                                            <SelectItem value="payment_date">Payment Date</SelectItem>
                                            <SelectItem value="service_date">Service Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>VAT Enabled</Label>
                                    <Switch
                                        checked={formData.vat_enabled}
                                        onCheckedChange={(checked) => setFormData({...formData, vat_enabled: checked})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Apply to Processing Fees</Label>
                                    <Switch
                                        checked={formData.apply_to_fees}
                                        onCheckedChange={(checked) => setFormData({...formData, apply_to_fees: checked})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Inclusive Pricing</Label>
                                    <Switch
                                        checked={formData.inclusive_pricing}
                                        onCheckedChange={(checked) => setFormData({...formData, inclusive_pricing: checked})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Show VAT on Invoice</Label>
                                    <Switch
                                        checked={formData.show_vat_on_invoice}
                                        onCheckedChange={(checked) => setFormData({...formData, show_vat_on_invoice: checked})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>EU MOSS/OSS</Label>
                                    <Switch
                                        checked={formData.moss_oss_enabled}
                                        onCheckedChange={(checked) => setFormData({...formData, moss_oss_enabled: checked})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>B2B Reverse Charge</Label>
                                    <Switch
                                        checked={formData.reverse_charge_enabled}
                                        onCheckedChange={(checked) => setFormData({...formData, reverse_charge_enabled: checked})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Auto Invoice Generation</Label>
                                    <Switch
                                        checked={formData.auto_invoice_generation}
                                        onCheckedChange={(checked) => setFormData({...formData, auto_invoice_generation: checked})}
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={() => createMutation.mutate(formData)} 
                                disabled={createMutation.isPending}
                                className="w-full"
                            >
                                {createMutation.isPending ? 'Saving...' : 'Save Configuration'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {SERVICE_TYPES.map((service) => {
                    const config = configurations.find(c => c.service_type === service.value && c.entity_type === 'global');
                    const isEnabled = config?.vat_enabled;

                    return (
                        <Card key={service.value}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{service.icon}</div>
                                        <div>
                                            <CardTitle>{service.label}</CardTitle>
                                            <p className="text-sm text-slate-600">{service.value}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {config ? (
                                            <>
                                                <Badge className={isEnabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                                                    {isEnabled ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                                    {isEnabled ? 'VAT Enabled' : 'VAT Disabled'}
                                                </Badge>
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={(checked) => toggleMutation.mutate({ id: config.id, enabled: checked })}
                                                    disabled={toggleMutation.isPending}
                                                />
                                            </>
                                        ) : (
                                            <Badge variant="outline">Not Configured</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            {config && (
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Home Jurisdiction</p>
                                            <p className="font-medium">{config.home_jurisdiction || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Tax ID</p>
                                            <p className="font-medium">{config.tax_id_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Pricing</p>
                                            <p className="font-medium">{config.inclusive_pricing ? 'Inclusive' : 'Exclusive'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Auto Invoice</p>
                                            <p className="font-medium">{config.auto_invoice_generation ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}