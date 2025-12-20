import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function MyWholesaleOfferings() {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingOffering, setEditingOffering] = useState(null);
    const [formData, setFormData] = useState({
        offering_category: 'payment_rail',
        platform_commission_percentage: 15,
        visibility: 'public'
    });

    // Get current PSP session
    const pspSession = JSON.parse(localStorage.getItem('psp_session') || '{}');
    const pspCode = pspSession.psp_code;

    const { data: currentPSP } = useQuery({
        queryKey: ['current-psp', pspCode],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ psp_code: pspCode }).then(r => r[0]),
        enabled: !!pspCode
    });

    const { data: offerings = [] } = useQuery({
        queryKey: ['my-wholesale-offerings', currentPSP?.id],
        queryFn: () => base44.entities.PSPWholesaleOffering.filter({ provider_psp_id: currentPSP.id }),
        enabled: !!currentPSP?.id
    });

    const { data: relationships = [] } = useQuery({
        queryKey: ['my-reseller-relationships', currentPSP?.id],
        queryFn: () => base44.entities.PSPResellerRelationship.filter({ provider_psp_id: currentPSP.id }),
        enabled: !!currentPSP?.id
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PSPWholesaleOffering.create({
            ...data,
            offering_id: `WS-${Date.now()}`,
            provider_psp_id: currentPSP.id,
            provider_psp_code: currentPSP.psp_code,
            provider_psp_name: currentPSP.psp_name,
            status: 'pending_approval',
            current_resellers: 0
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-wholesale-offerings']);
            setShowDialog(false);
            setFormData({ offering_category: 'payment_rail', platform_commission_percentage: 15, visibility: 'public' });
            toast.success('Offering submitted for platform approval');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PSPWholesaleOffering.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-wholesale-offerings']);
            setShowDialog(false);
            setEditingOffering(null);
            toast.success('Offering updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PSPWholesaleOffering.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-wholesale-offerings']);
            toast.success('Offering deleted');
        }
    });

    const handleSubmit = () => {
        const data = {
            ...formData,
            wholesale_pricing: {
                pricing_model: formData.pricing_model,
                base_price: parseFloat(formData.base_price) || 0,
                per_transaction_fee: parseFloat(formData.per_transaction_fee) || 0,
                revenue_share_percentage: parseFloat(formData.revenue_share_percentage) || 0,
                currency: 'USD'
            }
        };

        if (editingOffering) {
            updateMutation.mutate({ id: editingOffering.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const stats = {
        totalOfferings: offerings.length,
        activeOfferings: offerings.filter(o => o.status === 'active').length,
        totalResellers: offerings.reduce((sum, o) => sum + (o.current_resellers || 0), 0),
        totalRevenue: offerings.reduce((sum, o) => sum + (o.total_revenue || 0), 0)
    };

    if (!currentPSP?.can_wholesale) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar currentPage="MyWholesaleOfferings" />
                <div className="flex-1 flex flex-col">
                    <TopHeader />
                    <main className="flex-1 p-6">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <h3 className="text-xl font-semibold mb-2">Wholesale Features Not Enabled</h3>
                                <p className="text-slate-600">Contact FTS.Money platform to enable wholesale functionality for your PSP.</p>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar currentPage="MyWholesaleOfferings" />
            <div className="flex-1 flex flex-col">
                <TopHeader />
                <main className="flex-1 overflow-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">My Wholesale Offerings</h2>
                            <p className="text-slate-600">Sell your services to other PSPs on the platform</p>
                        </div>
                        <Button onClick={() => { setEditingOffering(null); setShowDialog(true); }} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Offering
                        </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Offerings</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOfferings}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active</p>
                                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeOfferings}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Resellers</p>
                                        <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalResellers}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Total Revenue</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">${stats.totalRevenue.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Your Offerings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {offerings.map(offering => (
                                    <div key={offering.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{offering.offering_name}</h4>
                                                <p className="text-sm text-slate-600">{offering.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={
                                                    offering.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                    offering.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }>
                                                    {offering.status}
                                                </Badge>
                                                <Button size="sm" variant="outline" onClick={() => { setEditingOffering(offering); setFormData(offering); setShowDialog(true); }}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(offering.id)} className="text-red-600">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-600">Pricing:</span>
                                                <span className="ml-2 font-medium">
                                                    {offering.wholesale_pricing?.pricing_model === 'fixed_monthly' && `$${offering.wholesale_pricing.base_price}/mo`}
                                                    {offering.wholesale_pricing?.pricing_model === 'per_transaction' && `$${offering.wholesale_pricing.per_transaction_fee}/txn`}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Resellers:</span>
                                                <span className="ml-2 font-medium">{offering.current_resellers || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Revenue:</span>
                                                <span className="ml-2 font-medium">${offering.total_revenue?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {offerings.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-slate-600">No offerings yet. Create your first wholesale offering!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingOffering ? 'Edit Offering' : 'Create Wholesale Offering'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Offering Name *</Label>
                            <Input
                                value={formData.offering_name || ''}
                                onChange={(e) => setFormData({...formData, offering_name: e.target.value})}
                                placeholder="e.g., Premium Payment Gateway"
                            />
                        </div>
                        <div>
                            <Label>Category *</Label>
                            <Select value={formData.offering_category} onValueChange={(v) => setFormData({...formData, offering_category: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="payment_rail">Payment Rail</SelectItem>
                                    <SelectItem value="payout_route">Payout Route</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
                                    <SelectItem value="fraud_detection">Fraud Detection</SelectItem>
                                    <SelectItem value="analytics">Analytics</SelectItem>
                                    <SelectItem value="crypto">Crypto</SelectItem>
                                    <SelectItem value="api_service">API Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description *</Label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Describe your service..."
                            />
                        </div>
                        <div>
                            <Label>Pricing Model *</Label>
                            <Select value={formData.pricing_model} onValueChange={(v) => setFormData({...formData, pricing_model: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed_monthly">Fixed Monthly</SelectItem>
                                    <SelectItem value="per_transaction">Per Transaction</SelectItem>
                                    <SelectItem value="tiered">Tiered</SelectItem>
                                    <SelectItem value="revenue_share">Revenue Share</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {formData.pricing_model === 'fixed_monthly' && (
                                <div>
                                    <Label>Monthly Price ($)</Label>
                                    <Input
                                        type="number"
                                        value={formData.base_price || ''}
                                        onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                                    />
                                </div>
                            )}
                            {formData.pricing_model === 'per_transaction' && (
                                <div>
                                    <Label>Per Transaction ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.per_transaction_fee || ''}
                                        onChange={(e) => setFormData({...formData, per_transaction_fee: e.target.value})}
                                    />
                                </div>
                            )}
                            {formData.pricing_model === 'revenue_share' && (
                                <div>
                                    <Label>Revenue Share (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.revenue_share_percentage || ''}
                                        onChange={(e) => setFormData({...formData, revenue_share_percentage: e.target.value})}
                                    />
                                </div>
                            )}
                            <div>
                                <Label>Platform Commission (%)</Label>
                                <Input
                                    type="number"
                                    value={formData.platform_commission_percentage || 15}
                                    onChange={(e) => setFormData({...formData, platform_commission_percentage: parseFloat(e.target.value)})}
                                />
                                <p className="text-xs text-slate-500 mt-1">FTS.Money's commission from each sale</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSubmit}>
                                {editingOffering ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}