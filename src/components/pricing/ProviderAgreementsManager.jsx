import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Plus, 
    Edit, 
    Trash2, 
    FileText, 
    TrendingDown,
    Calendar,
    DollarSign,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProviderAgreementsManager() {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [showComparisonDialog, setShowComparisonDialog] = useState(false);
    const [editingAgreement, setEditingAgreement] = useState(null);
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [formData, setFormData] = useState({
        provider_name: '',
        provider_type: 'payment_provider',
        agreement_name: '',
        contract_reference: '',
        contract_start_date: '',
        contract_end_date: '',
        auto_renew: false,
        status: 'draft',
        priority: 100,
        rate_cards: []
    });

    const { data: agreements = [] } = useQuery({
        queryKey: ['provider-agreements'],
        queryFn: () => base44.entities.ProviderAgreement.list()
    });

    const { data: masterPricing = [] } = useQuery({
        queryKey: ['master-pricing'],
        queryFn: () => base44.entities.MasterPricing.list()
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ProviderAgreement.create({
            ...data,
            agreement_id: `AGR-${Date.now()}`,
            provider_id: data.provider_name
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['provider-agreements']);
            setShowDialog(false);
            resetForm();
            toast.success('Provider agreement created');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ProviderAgreement.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['provider-agreements']);
            setShowDialog(false);
            setEditingAgreement(null);
            resetForm();
            toast.success('Agreement updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ProviderAgreement.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['provider-agreements']);
            toast.success('Agreement deleted');
        }
    });

    const resetForm = () => {
        setFormData({
            provider_name: '',
            provider_type: 'payment_provider',
            agreement_name: '',
            contract_reference: '',
            contract_start_date: '',
            contract_end_date: '',
            auto_renew: false,
            status: 'draft',
            priority: 100,
            rate_cards: []
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAgreement) {
            updateMutation.mutate({ id: editingAgreement.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (agreement) => {
        setEditingAgreement(agreement);
        setFormData(agreement);
        setShowDialog(true);
    };

    const handleViewComparison = (agreement) => {
        setSelectedAgreement(agreement);
        setShowComparisonDialog(true);
    };

    const activeAgreements = agreements.filter(a => a.status === 'active');
    const pendingAgreements = agreements.filter(a => a.status === 'pending_approval');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Provider Agreements</h3>
                    <p className="text-sm text-slate-600">Manage custom pricing agreements with providers</p>
                </div>
                <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Agreement
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Active Agreements</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-1">{activeAgreements.length}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Pending Approval</p>
                                <p className="text-3xl font-bold text-amber-600 mt-1">{pendingAgreements.length}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Savings</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    ${agreements.reduce((sum, a) => sum + (a.total_savings || 0), 0).toLocaleString()}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Volume</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    ${agreements.reduce((sum, a) => sum + (a.total_volume || 0), 0).toLocaleString()}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-slate-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Agreements List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Agreements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {agreements.map((agreement) => (
                            <div key={agreement.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-slate-900">{agreement.agreement_name}</h4>
                                            <Badge className={
                                                agreement.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                agreement.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }>
                                                {agreement.status.replace(/_/g, ' ')}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize">
                                                {agreement.provider_type.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-600">Provider</p>
                                                <p className="font-medium text-slate-900">{agreement.provider_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Contract Ref</p>
                                                <p className="font-medium text-slate-900">{agreement.contract_reference || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Valid Period</p>
                                                <p className="font-medium text-slate-900">
                                                    {agreement.contract_start_date} to {agreement.contract_end_date || 'Ongoing'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Rate Cards</p>
                                                <p className="font-medium text-slate-900">{agreement.rate_cards?.length || 0} items</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleViewComparison(agreement)}>
                                            <FileText className="h-3 w-3 mr-1" />
                                            Compare
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(agreement)}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(agreement.id)} className="text-red-600">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {agreements.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                                <p className="text-slate-600">No provider agreements yet</p>
                                <Button onClick={() => setShowDialog(true)} variant="outline" className="mt-4">
                                    Create First Agreement
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAgreement ? 'Edit' : 'Create'} Provider Agreement</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Provider Name</Label>
                                <Select value={formData.provider_name} onValueChange={(value) => setFormData({ ...formData, provider_name: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.map(p => (
                                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Provider Type</Label>
                                <Select value={formData.provider_type} onValueChange={(value) => setFormData({ ...formData, provider_type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="payment_provider">Payment Provider</SelectItem>
                                        <SelectItem value="service_provider">Service Provider</SelectItem>
                                        <SelectItem value="payout_provider">Payout Provider</SelectItem>
                                        <SelectItem value="acquirer">Acquirer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Agreement Name</Label>
                            <Input
                                value={formData.agreement_name}
                                onChange={(e) => setFormData({ ...formData, agreement_name: e.target.value })}
                                placeholder="e.g., Stripe Enterprise Agreement 2025"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Contract Reference</Label>
                                <Input
                                    value={formData.contract_reference}
                                    onChange={(e) => setFormData({ ...formData, contract_reference: e.target.value })}
                                    placeholder="Contract #"
                                />
                            </div>
                            <div>
                                <Label>Priority (Lower = Higher)</Label>
                                <Input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={formData.contract_start_date}
                                    onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={formData.contract_end_date}
                                    onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="terminated">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Special Terms</Label>
                            <Textarea
                                value={formData.special_terms}
                                onChange={(e) => setFormData({ ...formData, special_terms: e.target.value })}
                                rows={3}
                                placeholder="Any special terms or conditions..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.auto_renew}
                                onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label>Auto-renew contract</Label>
                        </div>

                        {/* Rate Cards Section */}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-base">Negotiated Rate Cards</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const newRateCards = [...(formData.rate_cards || []), {
                                            service_name: '',
                                            negotiated_rate_type: 'percentage',
                                            negotiated_rate_percentage: 0,
                                            negotiated_rate_fixed: 0
                                        }];
                                        setFormData({ ...formData, rate_cards: newRateCards });
                                    }}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Rate Card
                                </Button>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {(formData.rate_cards || []).map((card, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <Label className="text-xs">Service/Category</Label>
                                                <Input
                                                    size="sm"
                                                    value={card.service_name}
                                                    onChange={(e) => {
                                                        const updated = [...formData.rate_cards];
                                                        updated[idx].service_name = e.target.value;
                                                        setFormData({ ...formData, rate_cards: updated });
                                                    }}
                                                    placeholder="e.g., Card Processing"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Negotiated Rate %</Label>
                                                <Input
                                                    size="sm"
                                                    type="number"
                                                    step="0.01"
                                                    value={card.negotiated_rate_percentage}
                                                    onChange={(e) => {
                                                        const updated = [...formData.rate_cards];
                                                        updated[idx].negotiated_rate_percentage = parseFloat(e.target.value);
                                                        setFormData({ ...formData, rate_cards: updated });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Fixed Fee</Label>
                                                <div className="flex gap-1">
                                                    <Input
                                                        size="sm"
                                                        type="number"
                                                        step="0.01"
                                                        value={card.negotiated_rate_fixed}
                                                        onChange={(e) => {
                                                            const updated = [...formData.rate_cards];
                                                            updated[idx].negotiated_rate_fixed = parseFloat(e.target.value);
                                                            setFormData({ ...formData, rate_cards: updated });
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            const updated = formData.rate_cards.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, rate_cards: updated });
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!formData.rate_cards || formData.rate_cards.length === 0) && (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No rate cards added. Click "Add Rate Card" to define negotiated pricing.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingAgreement ? 'Update' : 'Create'} Agreement
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Comparison Dialog */}
            <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Rate Comparison: {selectedAgreement?.agreement_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="font-semibold text-blue-900">Provider: {selectedAgreement?.provider_name}</p>
                            <p className="text-sm text-blue-700">
                                Contract: {selectedAgreement?.contract_reference} | Valid: {selectedAgreement?.contract_start_date} to {selectedAgreement?.contract_end_date}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-900">Service</th>
                                        <th className="py-3 px-4 text-right text-sm font-semibold text-slate-900">Standard Rate</th>
                                        <th className="py-3 px-4 text-right text-sm font-semibold text-slate-900">Negotiated Rate</th>
                                        <th className="py-3 px-4 text-right text-sm font-semibold text-slate-900">Savings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {selectedAgreement?.rate_cards?.map((card, idx) => {
                                        const standardPricing = masterPricing.find(p => p.id === card.master_pricing_id);
                                        const standardRate = standardPricing?.buy_rate_percentage || 0;
                                        const negotiatedRate = card.negotiated_rate_percentage || 0;
                                        const savings = standardRate - negotiatedRate;

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 text-sm text-slate-900">{card.service_name}</td>
                                                <td className="py-3 px-4 text-right text-sm text-slate-700">{standardRate.toFixed(2)}%</td>
                                                <td className="py-3 px-4 text-right text-sm font-semibold text-emerald-600">{negotiatedRate.toFixed(2)}%</td>
                                                <td className="py-3 px-4 text-right text-sm font-semibold text-blue-600">
                                                    {savings > 0 ? `↓ ${savings.toFixed(2)}%` : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!selectedAgreement?.rate_cards || selectedAgreement.rate_cards.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-slate-500">
                                                No rate cards defined for this agreement
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}