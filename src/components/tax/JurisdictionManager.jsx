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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Globe, CheckCircle, Trash2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

export default function JurisdictionManager({ jurisdictions }) {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingJurisdiction, setEditingJurisdiction] = useState(null);
    const [formData, setFormData] = useState({
        jurisdiction_code: '',
        jurisdiction_name: '',
        jurisdiction_type: 'country',
        tax_type: 'vat',
        standard_rate: '',
        reduced_rate: '',
        super_reduced_rate: '',
        threshold_amount: '',
        reverse_charge_b2b: false,
        tax_id_required: false,
        status: 'active'
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            if (editingJurisdiction) {
                return await base44.entities.TaxJurisdiction.update(editingJurisdiction.id, data);
            }
            return await base44.entities.TaxJurisdiction.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-jurisdictions'] });
            setShowDialog(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await base44.entities.TaxJurisdiction.update(id, { status: 'inactive' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-jurisdictions'] });
        }
    });

    const resetForm = () => {
        setFormData({
            jurisdiction_code: '',
            jurisdiction_name: '',
            jurisdiction_type: 'country',
            tax_type: 'vat',
            standard_rate: '',
            reduced_rate: '',
            super_reduced_rate: '',
            threshold_amount: '',
            reverse_charge_b2b: false,
            tax_id_required: false,
            status: 'active'
        });
        setEditingJurisdiction(null);
    };

    const handleEdit = (jurisdiction) => {
        setEditingJurisdiction(jurisdiction);
        setFormData(jurisdiction);
        setShowDialog(true);
    };

    const handleSubmit = () => {
        createMutation.mutate({
            ...formData,
            standard_rate: parseFloat(formData.standard_rate) || 0,
            reduced_rate: formData.reduced_rate ? parseFloat(formData.reduced_rate) : null,
            super_reduced_rate: formData.super_reduced_rate ? parseFloat(formData.super_reduced_rate) : null,
            threshold_amount: formData.threshold_amount ? parseFloat(formData.threshold_amount) : null
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tax Jurisdictions</h2>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Jurisdiction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingJurisdiction ? 'Edit' : 'Add'} Tax Jurisdiction</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Jurisdiction Code *</Label>
                                    <Input
                                        value={formData.jurisdiction_code}
                                        onChange={(e) => setFormData({...formData, jurisdiction_code: e.target.value.toUpperCase()})}
                                        placeholder="GB, US-CA, FR"
                                        maxLength={5}
                                    />
                                </div>
                                <div>
                                    <Label>Jurisdiction Name *</Label>
                                    <Input
                                        value={formData.jurisdiction_name}
                                        onChange={(e) => setFormData({...formData, jurisdiction_name: e.target.value})}
                                        placeholder="United Kingdom, California"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Type</Label>
                                    <Select value={formData.jurisdiction_type} onValueChange={(value) => setFormData({...formData, jurisdiction_type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="country">Country</SelectItem>
                                            <SelectItem value="state">State</SelectItem>
                                            <SelectItem value="province">Province</SelectItem>
                                            <SelectItem value="territory">Territory</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Tax Type</Label>
                                    <Select value={formData.tax_type} onValueChange={(value) => setFormData({...formData, tax_type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="vat">VAT</SelectItem>
                                            <SelectItem value="gst">GST</SelectItem>
                                            <SelectItem value="sales_tax">Sales Tax</SelectItem>
                                            <SelectItem value="hst">HST</SelectItem>
                                            <SelectItem value="pst">PST</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Standard Rate (%) *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.standard_rate}
                                        onChange={(e) => setFormData({...formData, standard_rate: e.target.value})}
                                        placeholder="20"
                                    />
                                </div>
                                <div>
                                    <Label>Reduced Rate (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.reduced_rate}
                                        onChange={(e) => setFormData({...formData, reduced_rate: e.target.value})}
                                        placeholder="5"
                                    />
                                </div>
                                <div>
                                    <Label>Super Reduced (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.super_reduced_rate}
                                        onChange={(e) => setFormData({...formData, super_reduced_rate: e.target.value})}
                                        placeholder="2.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Registration Threshold</Label>
                                <Input
                                    type="number"
                                    value={formData.threshold_amount}
                                    onChange={(e) => setFormData({...formData, threshold_amount: e.target.value})}
                                    placeholder="85000"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={formData.reverse_charge_b2b}
                                        onCheckedChange={(checked) => setFormData({...formData, reverse_charge_b2b: checked})}
                                    />
                                    <Label>B2B Reverse Charge</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={formData.tax_id_required}
                                        onCheckedChange={(checked) => setFormData({...formData, tax_id_required: checked})}
                                    />
                                    <Label>Tax ID Required</Label>
                                </div>
                            </div>

                            <Button 
                                onClick={handleSubmit} 
                                disabled={!formData.jurisdiction_code || !formData.jurisdiction_name || !formData.standard_rate || createMutation.isPending}
                                className="w-full"
                            >
                                {createMutation.isPending ? 'Saving...' : (editingJurisdiction ? 'Update' : 'Create') + ' Jurisdiction'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {jurisdictions.filter(j => j.status === 'active').map((jurisdiction) => (
                    <Card key={jurisdiction.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <CardTitle className="text-lg">{jurisdiction.jurisdiction_name}</CardTitle>
                                        <p className="text-sm text-slate-600">Code: {jurisdiction.jurisdiction_code}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{jurisdiction.tax_type.toUpperCase()}</Badge>
                                    <Badge>{jurisdiction.jurisdiction_type}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-slate-500">Standard Rate</p>
                                    <p className="text-lg font-semibold">{jurisdiction.standard_rate}%</p>
                                </div>
                                {jurisdiction.reduced_rate && (
                                    <div>
                                        <p className="text-xs text-slate-500">Reduced Rate</p>
                                        <p className="text-lg font-semibold">{jurisdiction.reduced_rate}%</p>
                                    </div>
                                )}
                                {jurisdiction.threshold_amount && (
                                    <div>
                                        <p className="text-xs text-slate-500">Threshold</p>
                                        <p className="text-lg font-semibold">${jurisdiction.threshold_amount.toLocaleString()}</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    {jurisdiction.reverse_charge_b2b && (
                                        <Badge className="bg-purple-100 text-purple-800">B2B Reverse Charge</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(jurisdiction)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteMutation.mutate(jurisdiction.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Deactivate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}