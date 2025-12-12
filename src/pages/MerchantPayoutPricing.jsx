import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Percent, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantPayoutPricing() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const [showPricingDialog, setShowPricingDialog] = useState(false);
    const [editingPricing, setEditingPricing] = useState(null);
    const queryClient = useQueryClient();

    const [pricingForm, setPricingForm] = useState({
        merchant_fee_percentage: 0,
        merchant_fee_fixed: 0,
        psp_cost_percentage: 0,
        psp_cost_fixed: 0,
        min_payout_amount: 0,
        max_payout_amount: 100000,
        is_enabled: true,
        requires_approval: false,
        status: 'active'
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: routes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list(),
    });

    const { data: pricingRules = [] } = useQuery({
        queryKey: ['merchant-payout-pricing', selectedMerchant],
        queryFn: () => selectedMerchant ? 
            base44.entities.MerchantPayoutPricing.filter({ merchant_id: selectedMerchant }) : 
            base44.entities.MerchantPayoutPricing.list(),
    });

    const createPricingMutation = useMutation({
        mutationFn: (data) => base44.entities.MerchantPayoutPricing.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-payout-pricing'] });
            setShowPricingDialog(false);
            toast.success('Payout pricing configured');
        },
    });

    const updatePricingMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MerchantPayoutPricing.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-payout-pricing'] });
            setShowPricingDialog(false);
            setEditingPricing(null);
            toast.success('Pricing updated');
        },
    });

    const deletePricingMutation = useMutation({
        mutationFn: (id) => base44.entities.MerchantPayoutPricing.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-payout-pricing'] });
            toast.success('Pricing rule deleted');
        },
    });

    const handleSave = () => {
        if (editingPricing) {
            updatePricingMutation.mutate({ id: editingPricing.id, data: pricingForm });
        } else {
            createPricingMutation.mutate(pricingForm);
        }
    };

    const handleEdit = (pricing) => {
        setEditingPricing(pricing);
        setPricingForm(pricing);
        setShowPricingDialog(true);
    };

    const calculateMargin = () => {
        const merchantRevenue = (pricingForm.merchant_fee_percentage || 0) + (pricingForm.merchant_fee_fixed || 0);
        const pspCost = (pricingForm.psp_cost_percentage || 0) + (pricingForm.psp_cost_fixed || 0);
        return merchantRevenue - pspCost;
    };

    const totalRevenue = pricingRules.reduce((sum, p) => sum + ((p.merchant_fee_percentage || 0) + (p.merchant_fee_fixed || 0)), 0);
    const totalCost = pricingRules.reduce((sum, p) => sum + ((p.psp_cost_percentage || 0) + (p.psp_cost_fixed || 0)), 0);
    const totalMargin = totalRevenue - totalCost;

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="MerchantPayoutPricing" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Merchant Payout Pricing</h1>
                                <p className="text-slate-500">Configure payout fees and commercial agreements per merchant</p>
                            </div>
                            <Button onClick={() => {
                                setEditingPricing(null);
                                setPricingForm({
                                    merchant_fee_percentage: 0,
                                    merchant_fee_fixed: 0,
                                    psp_cost_percentage: 0,
                                    psp_cost_fixed: 0,
                                    min_payout_amount: 0,
                                    max_payout_amount: 100000,
                                    is_enabled: true,
                                    requires_approval: false,
                                    status: 'active'
                                });
                                setShowPricingDialog(true);
                            }} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Pricing Rule
                            </Button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card className="p-5 border-l-4 border-l-blue-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Configured Routes</p>
                                        <p className="text-2xl font-bold text-blue-600">{pricingRules.length}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-5 border-l-4 border-l-emerald-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Active Merchants</p>
                                        <p className="text-2xl font-bold text-emerald-600">{new Set(pricingRules.map(p => p.merchant_id)).size}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-5 border-l-4 border-l-amber-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-100 rounded-lg">
                                        <Percent className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Avg PSP Margin</p>
                                        <p className="text-2xl font-bold text-amber-600">{pricingRules.length > 0 ? (totalMargin / pricingRules.length).toFixed(2) : 0}%</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-5 border-l-4 border-l-purple-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Check className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Enabled Routes</p>
                                        <p className="text-2xl font-bold text-purple-600">{pricingRules.filter(p => p.is_enabled).length}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Merchant Filter */}
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <Label className="text-sm font-medium">Filter by Merchant:</Label>
                                    <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                                        <SelectTrigger className="w-64">
                                            <SelectValue placeholder="All Merchants" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>All Merchants</SelectItem>
                                            {merchants.map(m => (
                                                <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing Rules Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payout Pricing Rules</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Merchant</TableHead>
                                            <TableHead>Route</TableHead>
                                            <TableHead>Channel</TableHead>
                                            <TableHead>Merchant Fee</TableHead>
                                            <TableHead>PSP Cost</TableHead>
                                            <TableHead>PSP Margin</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pricingRules.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                    No pricing rules configured
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pricingRules.map(pricing => {
                                                const margin = (pricing.merchant_fee_percentage + pricing.merchant_fee_fixed) - (pricing.psp_cost_percentage + pricing.psp_cost_fixed);
                                                return (
                                                    <TableRow key={pricing.id}>
                                                        <TableCell className="font-medium">{pricing.merchant_name}</TableCell>
                                                        <TableCell className="text-sm">{pricing.route_name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{pricing.channel_type}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {pricing.merchant_fee_percentage}% + ${pricing.merchant_fee_fixed}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-600">
                                                            {pricing.psp_cost_percentage}% + ${pricing.psp_cost_fixed}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={margin > 0 ? 'text-emerald-600 font-semibold' : 'text-red-600'}>
                                                                {margin.toFixed(2)}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                pricing.is_enabled && pricing.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {pricing.is_enabled ? 'Enabled' : 'Disabled'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(pricing)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => deletePricingMutation.mutate(pricing.id)}>
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Pricing Dialog */}
            <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPricing ? 'Edit' : 'Add'} Payout Pricing</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Merchant *</Label>
                                <Select 
                                    value={pricingForm.merchant_id} 
                                    onValueChange={(val) => {
                                        const merchant = merchants.find(m => m.id === val);
                                        setPricingForm({...pricingForm, merchant_id: val, merchant_name: merchant?.business_name});
                                    }}
                                    disabled={!!editingPricing}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                    <SelectContent>
                                        {merchants.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Payout Route *</Label>
                                <Select 
                                    value={pricingForm.payout_route_id} 
                                    onValueChange={(val) => {
                                        const route = routes.find(r => r.id === val);
                                        setPricingForm({
                                            ...pricingForm, 
                                            payout_route_id: val, 
                                            route_name: route?.route_name,
                                            channel_type: route?.channel_type,
                                            psp_cost_percentage: route?.cost_percentage || 0,
                                            psp_cost_fixed: route?.cost_fixed || 0
                                        });
                                    }}
                                    disabled={!!editingPricing}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {routes.map(r => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.route_name} ({r.channel_type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                            <div className="space-y-2">
                                <Label>Merchant Fee % *</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={pricingForm.merchant_fee_percentage} 
                                    onChange={(e) => setPricingForm({...pricingForm, merchant_fee_percentage: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Merchant Fixed Fee *</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={pricingForm.merchant_fee_fixed} 
                                    onChange={(e) => setPricingForm({...pricingForm, merchant_fee_fixed: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg">
                            <div className="space-y-2">
                                <Label>PSP Cost % *</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={pricingForm.psp_cost_percentage} 
                                    onChange={(e) => setPricingForm({...pricingForm, psp_cost_percentage: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>PSP Fixed Cost *</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={pricingForm.psp_cost_fixed} 
                                    onChange={(e) => setPricingForm({...pricingForm, psp_cost_fixed: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <p className="text-sm font-medium text-emerald-900">
                                PSP Margin: <span className="text-xl">{calculateMargin().toFixed(2)}%</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Amount</Label>
                                <Input 
                                    type="number" 
                                    value={pricingForm.min_payout_amount} 
                                    onChange={(e) => setPricingForm({...pricingForm, min_payout_amount: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Amount</Label>
                                <Input 
                                    type="number" 
                                    value={pricingForm.max_payout_amount} 
                                    onChange={(e) => setPricingForm({...pricingForm, max_payout_amount: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <Label>Enable for Merchant</Label>
                            <Switch 
                                checked={pricingForm.is_enabled}
                                onCheckedChange={(checked) => setPricingForm({...pricingForm, is_enabled: checked})}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <Label>Requires Manual Approval</Label>
                            <Switch 
                                checked={pricingForm.requires_approval}
                                onCheckedChange={(checked) => setPricingForm({...pricingForm, requires_approval: checked})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPricingDialog(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Pricing</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}