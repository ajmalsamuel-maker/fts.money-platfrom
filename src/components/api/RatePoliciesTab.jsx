import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Shield, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RatePoliciesTab() {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: policies = [] } = useQuery({
        queryKey: ['api-rate-policies'],
        queryFn: () => base44.entities.APIRatePolicy.list()
    });

    const [policyForm, setPolicyForm] = useState({
        policy_name: '',
        policy_type: 'global',
        psp_id: '',
        rate_limit_per_minute: 1000,
        rate_limit_per_hour: 50000,
        quota_enabled: false,
        monthly_quota: 0,
        overage_allowed: false,
        overage_price_per_call: 0
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            const psp = data.psp_id ? psps.find(p => p.id === data.psp_id) : null;
            return base44.entities.APIRatePolicy.create({
                ...data,
                policy_id: `POL-${Date.now()}`,
                psp_code: psp?.psp_code
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['api-rate-policies']);
            setShowDialog(false);
            resetForm();
            toast.success('Policy created');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.APIRatePolicy.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['api-rate-policies']);
            setShowDialog(false);
            setEditingPolicy(null);
            resetForm();
            toast.success('Policy updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.APIRatePolicy.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['api-rate-policies']);
            toast.success('Policy deleted');
        }
    });

    const resetForm = () => {
        setPolicyForm({
            policy_name: '',
            policy_type: 'global',
            psp_id: '',
            rate_limit_per_minute: 1000,
            rate_limit_per_hour: 50000,
            quota_enabled: false,
            monthly_quota: 0,
            overage_allowed: false,
            overage_price_per_call: 0
        });
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setPolicyForm({
            policy_name: policy.policy_name,
            policy_type: policy.policy_type,
            psp_id: policy.psp_id || '',
            rate_limit_per_minute: policy.rate_limit_per_minute,
            rate_limit_per_hour: policy.rate_limit_per_hour,
            quota_enabled: policy.quota_enabled || false,
            monthly_quota: policy.monthly_quota || 0,
            overage_allowed: policy.overage_allowed || false,
            overage_price_per_call: policy.overage_price_per_call || 0
        });
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingPolicy) {
            updateMutation.mutate({ id: editingPolicy.id, data: policyForm });
        } else {
            createMutation.mutate(policyForm);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Rate Limiting Policies</h3>
                    <p className="text-sm text-slate-600">PSP-configurable rate limits and quotas</p>
                </div>
                <Button onClick={() => { resetForm(); setEditingPolicy(null); setShowDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Policy
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {policies.map(policy => (
                    <Card key={policy.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{policy.policy_name}</CardTitle>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {policy.policy_type === 'psp_specific' 
                                            ? psps.find(p => p.id === policy.psp_id)?.psp_name 
                                            : 'Platform-wide'}
                                    </p>
                                </div>
                                <Badge className={
                                    policy.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-slate-100 text-slate-700'
                                }>
                                    {policy.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    <span>{policy.rate_limit_per_minute}/min</span>
                                    <span className="text-slate-400">•</span>
                                    <span>{policy.rate_limit_per_hour}/hr</span>
                                </div>
                                {policy.quota_enabled && (
                                    <div className="text-sm">
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                            Monthly Quota: {policy.monthly_quota}
                                        </Badge>
                                        {policy.overage_allowed && (
                                            <p className="text-xs text-slate-600 mt-1">
                                                Overage: ${policy.overage_price_per_call}/call
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(policy)}>
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => {
                                            if (confirm('Delete this policy?')) {
                                                deleteMutation.mutate(policy.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create Rate Policy'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Policy Name</Label>
                            <Input
                                value={policyForm.policy_name}
                                onChange={(e) => setPolicyForm({...policyForm, policy_name: e.target.value})}
                                placeholder="Standard Rate Limit"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Policy Type</Label>
                                <Select value={policyForm.policy_type} onValueChange={(v) => setPolicyForm({...policyForm, policy_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="global">Global (All PSPs)</SelectItem>
                                        <SelectItem value="psp_specific">PSP Specific</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {policyForm.policy_type === 'psp_specific' && (
                                <div>
                                    <Label>PSP</Label>
                                    <Select value={policyForm.psp_id} onValueChange={(v) => setPolicyForm({...policyForm, psp_id: v})}>
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
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Rate Limit (per minute)</Label>
                                <Input
                                    type="number"
                                    value={policyForm.rate_limit_per_minute}
                                    onChange={(e) => setPolicyForm({...policyForm, rate_limit_per_minute: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <Label>Rate Limit (per hour)</Label>
                                <Input
                                    type="number"
                                    value={policyForm.rate_limit_per_hour}
                                    onChange={(e) => setPolicyForm({...policyForm, rate_limit_per_hour: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div>
                                <Label>Enable Monthly Quota</Label>
                                <p className="text-xs text-slate-500">Limit total monthly calls</p>
                            </div>
                            <Switch 
                                checked={policyForm.quota_enabled}
                                onCheckedChange={(v) => setPolicyForm({...policyForm, quota_enabled: v})}
                            />
                        </div>

                        {policyForm.quota_enabled && (
                            <>
                                <div>
                                    <Label>Monthly Quota</Label>
                                    <Input
                                        type="number"
                                        value={policyForm.monthly_quota}
                                        onChange={(e) => setPolicyForm({...policyForm, monthly_quota: parseInt(e.target.value)})}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                    <div>
                                        <Label>Allow Overage</Label>
                                        <p className="text-xs text-slate-500">Charge for calls over quota</p>
                                    </div>
                                    <Switch 
                                        checked={policyForm.overage_allowed}
                                        onCheckedChange={(v) => setPolicyForm({...policyForm, overage_allowed: v})}
                                    />
                                </div>

                                {policyForm.overage_allowed && (
                                    <div>
                                        <Label>Overage Price Per Call ($)</Label>
                                        <Input
                                            type="number"
                                            step="0.0001"
                                            value={policyForm.overage_price_per_call}
                                            onChange={(e) => setPolicyForm({...policyForm, overage_price_per_call: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSubmit}>
                                {editingPolicy ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}