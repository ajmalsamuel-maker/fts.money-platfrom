import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
    Search, Plus, MoreHorizontal, Edit, Trash2, DollarSign, Percent, 
    Calculator, AlertCircle, ArrowRight, Store, CreditCard, Eye
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

export default function MerchantPricing() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [providerFilter, setProviderFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingPricing, setEditingPricing] = useState(null);
    const [selectedBuyRate, setSelectedBuyRate] = useState(null);
    const [formData, setFormData] = useState({
        merchant_id: '', merchant_name: '', mid_id: '', mid: '',
        provider_id: '', provider_name: '', buy_rate_id: '',
        transaction_type: 'ecommerce', card_type: 'all', card_brand: 'all', region: 'all', currency: 'USD',
        buy_percentage_rate: 0, buy_fixed_fee: 0,
        markup_percentage: '', markup_fixed_fee: '',
        sell_percentage_rate: 0, sell_fixed_fee: 0,
        monthly_fee: 0, minimum_fee: 0, effective_from: '', status: 'active', notes: ''
    });

    const queryClient = useQueryClient();

    const { data: pricingList = [], isLoading } = useQuery({
        queryKey: ['merchant-pricing'],
        queryFn: () => base44.entities.MerchantPricing.list('-created_date'),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list(),
    });

    const { data: buyRates = [] } = useQuery({
        queryKey: ['buy-rates'],
        queryFn: () => base44.entities.BuyRate.list(),
    });

    const { data: merchantMIDs = [] } = useQuery({
        queryKey: ['merchant-mids'],
        queryFn: () => base44.entities.MerchantMID.list(),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.MerchantPricing.create(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchant-pricing'] }); resetForm(); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MerchantPricing.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchant-pricing'] }); resetForm(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.MerchantPricing.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchant-pricing'] }),
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingPricing(null);
        setSelectedBuyRate(null);
        setFormData({
            merchant_id: '', merchant_name: '', mid_id: '', mid: '',
            provider_id: '', provider_name: '', buy_rate_id: '',
            transaction_type: 'ecommerce', card_type: 'all', card_brand: 'all', region: 'all', currency: 'USD',
            buy_percentage_rate: 0, buy_fixed_fee: 0,
            markup_percentage: '', markup_fixed_fee: '',
            sell_percentage_rate: 0, sell_fixed_fee: 0,
            monthly_fee: 0, minimum_fee: 0, effective_from: '', status: 'active', notes: ''
        });
    };

    const handleEdit = (pricing) => {
        setEditingPricing(pricing);
        const buyRate = buyRates.find(r => r.id === pricing.buy_rate_id);
        setSelectedBuyRate(buyRate || null);
        setFormData({
            merchant_id: pricing.merchant_id || '',
            merchant_name: pricing.merchant_name || '',
            mid_id: pricing.mid_id || '',
            mid: pricing.mid || '',
            provider_id: pricing.provider_id || '',
            provider_name: pricing.provider_name || '',
            buy_rate_id: pricing.buy_rate_id || '',
            transaction_type: pricing.transaction_type || 'ecommerce',
            card_type: pricing.card_type || 'all',
            card_brand: pricing.card_brand || 'all',
            region: pricing.region || 'all',
            currency: pricing.currency || 'USD',
            buy_percentage_rate: pricing.buy_percentage_rate || 0,
            buy_fixed_fee: pricing.buy_fixed_fee || 0,
            markup_percentage: pricing.markup_percentage ?? '',
            markup_fixed_fee: pricing.markup_fixed_fee ?? '',
            sell_percentage_rate: pricing.sell_percentage_rate || 0,
            sell_fixed_fee: pricing.sell_fixed_fee || 0,
            monthly_fee: pricing.monthly_fee || 0,
            minimum_fee: pricing.minimum_fee || 0,
            effective_from: pricing.effective_from || '',
            status: pricing.status || 'active',
            notes: pricing.notes || '',
        });
        setShowDialog(true);
    };

    const handleMerchantChange = (merchantId) => {
        const merchant = merchants.find(m => m.id === merchantId);
        setFormData({
            ...formData,
            merchant_id: merchantId,
            merchant_name: merchant?.business_name || '',
            mid_id: '',
            mid: ''
        });
    };

    const handleMIDChange = (midId) => {
        const mid = merchantMIDs.find(m => m.id === midId);
        if (mid) {
            setFormData({
                ...formData,
                mid_id: midId,
                mid: mid.mid || '',
                provider_id: mid.provider_id || '',
                provider_name: mid.provider_name || '',
            });
        }
    };

    const handleBuyRateChange = (buyRateId) => {
        const rate = buyRates.find(r => r.id === buyRateId);
        setSelectedBuyRate(rate);
        if (rate) {
            const markupPct = parseFloat(formData.markup_percentage) || 0;
            const markupFixed = parseFloat(formData.markup_fixed_fee) || 0;
            setFormData({
                ...formData,
                buy_rate_id: buyRateId,
                provider_id: rate.provider_id,
                provider_name: rate.provider_name,
                transaction_type: rate.transaction_type,
                card_type: rate.card_type,
                card_brand: rate.card_brand,
                region: rate.region,
                currency: rate.currency,
                buy_percentage_rate: rate.percentage_rate || 0,
                buy_fixed_fee: rate.fixed_fee || 0,
                sell_percentage_rate: (rate.percentage_rate || 0) + markupPct,
                sell_fixed_fee: (rate.fixed_fee || 0) + markupFixed,
            });
        }
    };

    const handleMarkupChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        const buyPct = formData.buy_percentage_rate || 0;
        const buyFixed = formData.buy_fixed_fee || 0;
        
        if (field === 'markup_percentage') {
            setFormData({
                ...formData,
                markup_percentage: value,
                sell_percentage_rate: buyPct + numValue,
            });
        } else {
            setFormData({
                ...formData,
                markup_fixed_fee: value,
                sell_fixed_fee: buyFixed + numValue,
            });
        }
    };

    const handleSubmit = () => {
        const data = {
            ...formData,
            buy_percentage_rate: parseFloat(formData.buy_percentage_rate) || 0,
            buy_fixed_fee: parseFloat(formData.buy_fixed_fee) || 0,
            markup_percentage: parseFloat(formData.markup_percentage) || 0,
            markup_fixed_fee: parseFloat(formData.markup_fixed_fee) || 0,
            sell_percentage_rate: parseFloat(formData.sell_percentage_rate) || 0,
            sell_fixed_fee: parseFloat(formData.sell_fixed_fee) || 0,
            monthly_fee: parseFloat(formData.monthly_fee) || 0,
            minimum_fee: parseFloat(formData.minimum_fee) || 0,
        };
        if (editingPricing) {
            updateMutation.mutate({ id: editingPricing.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    // Filter MIDs for selected merchant
    const filteredMIDs = merchantMIDs.filter(m => m.merchant_id === formData.merchant_id);
    
    // Filter buy rates for selected provider
    const filteredBuyRates = buyRates.filter(r => 
        r.provider_id === formData.provider_id && r.status === 'active'
    );

    const filteredPricing = pricingList.filter(p => {
        const matchesSearch = !searchQuery || 
            p.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.provider_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMerchant = merchantFilter === 'all' || p.merchant_id === merchantFilter;
        const matchesProvider = providerFilter === 'all' || p.provider_id === providerFilter;
        return matchesSearch && matchesMerchant && matchesProvider;
    });

    // Calculate profit margin
    const calculateMargin = (pricing) => {
        const margin = (pricing.sell_percentage_rate || 0) - (pricing.buy_percentage_rate || 0);
        return margin.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="MerchantPricing" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Merchant Pricing</h1>
                            <p className="text-slate-500">Configure MDR (Merchant Discount Rate) with buy rates + markup</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Add Pricing
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Store className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Merchants with Pricing</p>
                                    <p className="text-xl font-bold">{new Set(pricingList.map(p => p.merchant_id)).size}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Active Price Rules</p>
                                    <p className="text-xl font-bold">{pricingList.filter(p => p.status === 'active').length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Providers Used</p>
                                    <p className="text-xl font-bold">{new Set(pricingList.map(p => p.provider_id)).size}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Percent className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Avg. Markup</p>
                                    <p className="text-xl font-bold">
                                        {pricingList.length > 0 
                                            ? (pricingList.reduce((acc, p) => acc + (p.markup_percentage || 0), 0) / pricingList.length).toFixed(2)
                                            : '0.00'}%
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search merchant or provider..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Merchant" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Merchants</SelectItem>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={providerFilter} onValueChange={setProviderFilter}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Provider" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Providers</SelectItem>
                                        {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">Pricing Rules <Badge variant="secondary" className="ml-2">{filteredPricing.length}</Badge></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Merchant</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Transaction Type</TableHead>
                                            <TableHead className="text-center">Buy Rate</TableHead>
                                            <TableHead className="text-center">Markup</TableHead>
                                            <TableHead className="text-center">Sell Rate (MDR)</TableHead>
                                            <TableHead className="text-center">Margin</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPricing.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading...' : 'No pricing configured'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredPricing.map((pricing) => (
                                                <TableRow key={pricing.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{pricing.merchant_name}</p>
                                                            {pricing.mid && <p className="text-xs text-slate-500">MID: {pricing.mid}</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">{pricing.provider_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{transactionTypeLabels[pricing.transaction_type] || pricing.transaction_type}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="text-slate-600">
                                                            <span className="font-mono">{pricing.buy_percentage_rate?.toFixed(2)}%</span>
                                                            {pricing.buy_fixed_fee > 0 && <span className="text-xs ml-1">+ {pricing.currency} {pricing.buy_fixed_fee?.toFixed(2)}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="text-amber-600 font-medium">
                                                            <span>+{pricing.markup_percentage?.toFixed(2)}%</span>
                                                            {pricing.markup_fixed_fee > 0 && <span className="text-xs ml-1">+ {pricing.currency} {pricing.markup_fixed_fee?.toFixed(2)}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="text-blue-600 font-bold">
                                                            <span>{pricing.sell_percentage_rate?.toFixed(2)}%</span>
                                                            {pricing.sell_fixed_fee > 0 && <span className="text-xs ml-1">+ {pricing.currency} {pricing.sell_fixed_fee?.toFixed(2)}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-emerald-100 text-emerald-700">{calculateMargin(pricing)}%</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={pricing.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                            {pricing.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEdit(pricing)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(pricing.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPricing ? 'Edit Merchant Pricing' : 'Add Merchant Pricing'}</DialogTitle>
                        <DialogDescription>Configure the MDR by selecting a buy rate and adding your markup</DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="merchant" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="merchant">1. Merchant</TabsTrigger>
                            <TabsTrigger value="buyrate">2. Buy Rate</TabsTrigger>
                            <TabsTrigger value="pricing">3. Pricing</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="merchant" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Merchant *</Label>
                                <Select value={formData.merchant_id} onValueChange={handleMerchantChange}>
                                    <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                    <SelectContent>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.merchant_id && filteredMIDs.length > 0 && (
                                <div className="space-y-2">
                                    <Label>MID (Optional - for MID-specific pricing)</Label>
                                    <Select value={formData.mid_id} onValueChange={handleMIDChange}>
                                        <SelectTrigger><SelectValue placeholder="Select MID or leave empty for merchant-level pricing" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>Merchant-level pricing</SelectItem>
                                            {filteredMIDs.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.mid} - {m.provider_name} ({m.terminal_type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="buyrate" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Provider *</Label>
                                <Select value={formData.provider_id} onValueChange={(val) => {
                                    const provider = providers.find(p => p.id === val);
                                    setFormData({...formData, provider_id: val, provider_name: provider?.name || '', buy_rate_id: ''});
                                    setSelectedBuyRate(null);
                                }}>
                                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                                    <SelectContent>
                                        {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {formData.provider_id && (
                                <div className="space-y-2">
                                    <Label>Buy Rate *</Label>
                                    <Select value={formData.buy_rate_id} onValueChange={handleBuyRateChange}>
                                        <SelectTrigger><SelectValue placeholder="Select buy rate" /></SelectTrigger>
                                        <SelectContent>
                                            {filteredBuyRates.length === 0 ? (
                                                <SelectItem value={null} disabled>No buy rates for this provider</SelectItem>
                                            ) : (
                                                filteredBuyRates.map(r => (
                                                    <SelectItem key={r.id} value={r.id}>
                                                        {transactionTypeLabels[r.transaction_type]} - {r.percentage_rate}% + {r.currency} {r.fixed_fee}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {selectedBuyRate && (
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <h4 className="font-medium text-blue-900 mb-2">Selected Buy Rate Details</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><span className="text-blue-700">Transaction Type:</span> {transactionTypeLabels[selectedBuyRate.transaction_type]}</div>
                                            <div><span className="text-blue-700">Card Type:</span> {cardTypeLabels[selectedBuyRate.card_type]}</div>
                                            <div><span className="text-blue-700">Card Brand:</span> {cardBrandLabels[selectedBuyRate.card_brand]}</div>
                                            <div><span className="text-blue-700">Region:</span> {regionLabels[selectedBuyRate.region]}</div>
                                            <div><span className="text-blue-700">Rate:</span> <span className="font-bold">{selectedBuyRate.percentage_rate}%</span></div>
                                            <div><span className="text-blue-700">Fixed Fee:</span> <span className="font-bold">{selectedBuyRate.currency} {selectedBuyRate.fixed_fee}</span></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="pricing" className="space-y-4 py-4">
                            {/* Pricing Calculator */}
                            <Card className="border-2 border-dashed">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Buy Rate */}
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Buy Rate</p>
                                            <p className="text-2xl font-bold text-slate-600">{formData.buy_percentage_rate.toFixed(2)}%</p>
                                            {formData.buy_fixed_fee > 0 && (
                                                <p className="text-sm text-slate-500">+ {formData.currency} {formData.buy_fixed_fee.toFixed(2)}</p>
                                            )}
                                        </div>
                                        
                                        <ArrowRight className="h-6 w-6 text-slate-400" />
                                        
                                        {/* Markup */}
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Your Markup</p>
                                            <p className="text-2xl font-bold text-amber-600">+{parseFloat(formData.markup_percentage) || 0}%</p>
                                            {(parseFloat(formData.markup_fixed_fee) || 0) > 0 && (
                                                <p className="text-sm text-amber-600">+ {formData.currency} {parseFloat(formData.markup_fixed_fee).toFixed(2)}</p>
                                            )}
                                        </div>
                                        
                                        <ArrowRight className="h-6 w-6 text-slate-400" />
                                        
                                        {/* Sell Rate */}
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">MDR to Merchant</p>
                                            <p className="text-2xl font-bold text-blue-600">{formData.sell_percentage_rate.toFixed(2)}%</p>
                                            {formData.sell_fixed_fee > 0 && (
                                                <p className="text-sm text-blue-600">+ {formData.currency} {formData.sell_fixed_fee.toFixed(2)}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Markup Percentage (%) *</Label>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        value={formData.markup_percentage} 
                                        onChange={(e) => handleMarkupChange('markup_percentage', e.target.value)} 
                                        placeholder="0.50" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Markup Fixed Fee</Label>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        value={formData.markup_fixed_fee} 
                                        onChange={(e) => handleMarkupChange('markup_fixed_fee', e.target.value)} 
                                        placeholder="0.05" 
                                    />
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
                        </TabsContent>
                    </Tabs>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={!formData.merchant_id || !formData.provider_id || formData.markup_percentage === ''}
                        >
                            {editingPricing ? 'Update Pricing' : 'Create Pricing'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}