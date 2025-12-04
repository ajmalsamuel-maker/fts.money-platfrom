import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Search, Plus, MoreHorizontal, Edit, Trash2, Percent, Copy, AlertCircle
} from 'lucide-react';

const transactionTypeLabels = {
    card_present: 'Card Present (CP)',
    card_not_present: 'Card Not Present (CNP)',
    ecommerce: 'E-Commerce',
    virtual_terminal: 'Virtual Terminal',
    soft_pos: 'Soft POS',
    recurring: 'Recurring',
    moto: 'MOTO',
};

const cardTypeLabels = {
    all: 'All Cards', debit: 'Debit', credit: 'Credit', prepaid: 'Prepaid', corporate: 'Corporate', 'n/a': 'N/A'
};

const cardBrandLabels = {
    all: 'All Brands', visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', discover: 'Discover', unionpay: 'UnionPay', jcb: 'JCB', 'n/a': 'N/A'
};

const regionLabels = {
    domestic: 'Domestic', intra_regional: 'Intra-Regional', international: 'International', all: 'All Regions'
};

export default function BuyRates() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [providerFilter, setProviderFilter] = useState('all');
    const [txnTypeFilter, setTxnTypeFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [formData, setFormData] = useState({
        provider_id: '', provider_name: '', transaction_type: 'ecommerce', card_type: 'all',
        card_brand: 'all', region: 'all', currency: 'USD', percentage_rate: '', fixed_fee: '',
        monthly_fee: 0, minimum_fee: 0, effective_from: '', status: 'active', notes: ''
    });

    const queryClient = useQueryClient();

    const { data: rates = [], isLoading } = useQuery({
        queryKey: ['buy-rates'],
        queryFn: () => base44.entities.BuyRate.list('-created_date'),
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list(),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.BuyRate.create(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['buy-rates'] }); resetForm(); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.BuyRate.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['buy-rates'] }); resetForm(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.BuyRate.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buy-rates'] }),
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingRate(null);
        setFormData({
            provider_id: '', provider_name: '', transaction_type: 'ecommerce', card_type: 'all',
            card_brand: 'all', region: 'all', currency: 'USD', percentage_rate: '', fixed_fee: '',
            monthly_fee: 0, minimum_fee: 0, effective_from: '', status: 'active', notes: ''
        });
    };

    const handleEdit = (rate) => {
        setEditingRate(rate);
        setFormData({
            provider_id: rate.provider_id || '',
            provider_name: rate.provider_name || '',
            transaction_type: rate.transaction_type || 'ecommerce',
            card_type: rate.card_type || 'all',
            card_brand: rate.card_brand || 'all',
            region: rate.region || 'all',
            currency: rate.currency || 'USD',
            percentage_rate: rate.percentage_rate ?? '',
            fixed_fee: rate.fixed_fee ?? '',
            monthly_fee: rate.monthly_fee || 0,
            minimum_fee: rate.minimum_fee || 0,
            effective_from: rate.effective_from || '',
            status: rate.status || 'active',
            notes: rate.notes || '',
        });
        setShowDialog(true);
    };

    const handleDuplicate = (rate) => {
        setEditingRate(null);
        setFormData({
            provider_id: rate.provider_id || '',
            provider_name: rate.provider_name || '',
            transaction_type: rate.transaction_type || 'ecommerce',
            card_type: rate.card_type || 'all',
            card_brand: rate.card_brand || 'all',
            region: rate.region || 'all',
            currency: rate.currency || 'USD',
            percentage_rate: rate.percentage_rate ?? '',
            fixed_fee: rate.fixed_fee ?? '',
            monthly_fee: rate.monthly_fee || 0,
            minimum_fee: rate.minimum_fee || 0,
            effective_from: '',
            status: 'active',
            notes: rate.notes || '',
        });
        setShowDialog(true);
    };

    const handleProviderChange = (providerId) => {
        const provider = providers.find(p => p.id === providerId);
        setFormData({
            ...formData,
            provider_id: providerId,
            provider_name: provider?.name || ''
        });
    };

    const handleSubmit = () => {
        const data = {
            ...formData,
            percentage_rate: parseFloat(formData.percentage_rate) || 0,
            fixed_fee: parseFloat(formData.fixed_fee) || 0,
            monthly_fee: parseFloat(formData.monthly_fee) || 0,
            minimum_fee: parseFloat(formData.minimum_fee) || 0,
        };
        if (editingRate) {
            updateMutation.mutate({ id: editingRate.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredRates = rates.filter(r => {
        const matchesSearch = !searchQuery || 
            r.provider_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProvider = providerFilter === 'all' || r.provider_id === providerFilter;
        const matchesTxnType = txnTypeFilter === 'all' || r.transaction_type === txnTypeFilter;
        return matchesSearch && matchesProvider && matchesTxnType;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="BuyRates" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Buy Rates</h1>
                            <p className="text-slate-500">Manage base pricing from payment providers, schemes, and rails</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Add Buy Rate
                        </Button>
                    </div>

                    {/* Info Card */}
                    <Card className="mb-6 border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">Buy Rate Configuration</p>
                                    <p className="text-sm text-blue-700">Define the rates you pay to providers. When setting merchant pricing, these rates will be shown so operators can add appropriate markup to calculate the final MDR (Merchant Discount Rate).</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search by provider..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={providerFilter} onValueChange={setProviderFilter}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Provider" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Providers</SelectItem>
                                        {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={txnTypeFilter} onValueChange={setTxnTypeFilter}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Transaction Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {Object.entries(transactionTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">Buy Rates <Badge variant="secondary" className="ml-2">{filteredRates.length}</Badge></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Transaction Type</TableHead>
                                            <TableHead>Card Type / Brand</TableHead>
                                            <TableHead>Region</TableHead>
                                            <TableHead>Rate (%)</TableHead>
                                            <TableHead>Fixed Fee</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRates.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading...' : 'No buy rates configured'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredRates.map((rate) => (
                                                <TableRow key={rate.id}>
                                                    <TableCell className="font-medium">{rate.provider_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{transactionTypeLabels[rate.transaction_type] || rate.transaction_type}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {cardTypeLabels[rate.card_type]} / {cardBrandLabels[rate.card_brand]}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">{regionLabels[rate.region]}</TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-blue-600">{rate.percentage_rate?.toFixed(2)}%</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono">{rate.currency} {rate.fixed_fee?.toFixed(2)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={rate.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                            {rate.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEdit(rate)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDuplicate(rate)}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(rate.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); else setShowDialog(true); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRate ? 'Edit Buy Rate' : 'Add Buy Rate'}</DialogTitle>
                        <DialogDescription>Configure the rate you pay to a payment provider</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Provider *</Label>
                                <Select value={formData.provider_id} onValueChange={handleProviderChange}>
                                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                                    <SelectContent>
                                        {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Transaction Type *</Label>
                                <Select value={formData.transaction_type} onValueChange={(val) => setFormData({...formData, transaction_type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(transactionTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Card Type</Label>
                                <Select value={formData.card_type} onValueChange={(val) => setFormData({...formData, card_type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(cardTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Card Brand</Label>
                                <Select value={formData.card_brand} onValueChange={(val) => setFormData({...formData, card_brand: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(cardBrandLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Region</Label>
                                <Select value={formData.region} onValueChange={(val) => setFormData({...formData, region: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(regionLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="SGD">SGD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Percentage Rate (%) *</Label>
                                <Input type="number" step="0.01" value={formData.percentage_rate} onChange={(e) => setFormData({...formData, percentage_rate: e.target.value})} placeholder="1.50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Fixed Fee</Label>
                                <Input type="number" step="0.01" value={formData.fixed_fee} onChange={(e) => setFormData({...formData, fixed_fee: e.target.value})} placeholder="0.10" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Monthly Fee</Label>
                                <Input type="number" step="0.01" value={formData.monthly_fee} onChange={(e) => setFormData({...formData, monthly_fee: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Minimum Fee</Label>
                                <Input type="number" step="0.01" value={formData.minimum_fee} onChange={(e) => setFormData({...formData, minimum_fee: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Effective From</Label>
                                <Input type="date" value={formData.effective_from} onChange={(e) => setFormData({...formData, effective_from: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional notes..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.provider_id || !formData.percentage_rate}>{editingRate ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}