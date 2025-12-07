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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    Search, Plus, MoreHorizontal, Edit, Trash2, CreditCard, Store, Terminal, 
    ChevronLeft, ChevronRight, CheckCircle, XCircle, Filter, Sparkles, Loader2
} from 'lucide-react';

const terminalTypeLabels = {
    ecommerce: 'E-Commerce',
    virtual_terminal: 'Virtual Terminal',
    soft_pos: 'Soft POS',
    physical_terminal: 'Physical Terminal',
    mpos: 'mPOS',
};

const transactionTypeLabels = {
    card_present: 'Card Present',
    card_not_present: 'Card Not Present',
    ecommerce: 'E-Commerce',
    virtual_terminal: 'Virtual Terminal',
    soft_pos: 'Soft POS',
    recurring: 'Recurring',
    moto: 'MOTO',
};

const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
};

export default function MerchantMIDs() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingMID, setEditingMID] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedMIDs, setSelectedMIDs] = useState([]);
    const [isSuggestingMID, setIsSuggestingMID] = useState(false);
    const [formData, setFormData] = useState({
        merchant_id: '', merchant_name: '', mid: '',
        provider_id: '', provider_name: '', terminal_type: 'ecommerce',
        transaction_types: [], currency: 'USD', status: 'pending',
        activation_date: '', notes: ''
    });

    const queryClient = useQueryClient();

    const { data: mids = [], isLoading } = useQuery({
        queryKey: ['merchant-mids'],
        queryFn: () => base44.entities.MerchantMID.list('-created_date'),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list(),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.MerchantMID.create(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchant-mids'] }); resetForm(); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MerchantMID.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchant-mids'] }); resetForm(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.MerchantMID.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchant-mids'] }),
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: async ({ ids, status }) => {
            const updates = ids.map(id => {
                const mid = mids.find(m => m.id === id);
                return base44.entities.MerchantMID.update(id, { ...mid, status });
            });
            return Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-mids'] });
            setSelectedMIDs([]);
        }
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingMID(null);
        setFormData({
            merchant_id: '', merchant_name: '', mid: '',
            provider_id: '', provider_name: '', terminal_type: 'ecommerce',
            transaction_types: [], currency: 'USD', status: 'pending',
            activation_date: '', notes: ''
        });
    };

    const handleEdit = (mid) => {
        setEditingMID(mid);
        setFormData({
            merchant_id: mid.merchant_id || '',
            merchant_name: mid.merchant_name || '',
            mid: mid.mid || '',
            provider_id: mid.provider_id || '',
            provider_name: mid.provider_name || '',
            terminal_type: mid.terminal_type || 'ecommerce',
            transaction_types: mid.transaction_types || [],
            currency: mid.currency || 'USD',
            status: mid.status || 'pending',
            activation_date: mid.activation_date || '',
            notes: mid.notes || '',
        });
        setShowDialog(true);
    };

    const handleMerchantChange = (merchantId) => {
        const merchant = merchants.find(m => m.id === merchantId);
        setFormData({
            ...formData,
            merchant_id: merchantId,
            merchant_name: merchant?.business_name || ''
        });
    };

    const handleProviderChange = (providerId) => {
        const provider = providers.find(p => p.id === providerId);
        setFormData({
            ...formData,
            provider_id: providerId,
            provider_name: provider?.name || ''
        });
    };

    const suggestMID = async () => {
        if (!formData.provider_id || !formData.terminal_type) return;
        
        setIsSuggestingMID(true);
        try {
            const provider = providers.find(p => p.id === formData.provider_id);
            const existingMIDs = mids
                .filter(m => m.provider_id === formData.provider_id && m.terminal_type === formData.terminal_type)
                .map(m => m.mid);
            
            // Generate smart MID suggestion
            const providerPrefix = provider?.name?.substring(0, 3).toUpperCase() || 'MID';
            const terminalPrefix = formData.terminal_type === 'ecommerce' ? 'EC' : 
                                   formData.terminal_type === 'virtual_terminal' ? 'VT' :
                                   formData.terminal_type === 'soft_pos' ? 'SP' :
                                   formData.terminal_type === 'physical_terminal' ? 'PT' : 'MP';
            
            let suggestedMID;
            let counter = 1;
            do {
                suggestedMID = `${providerPrefix}${terminalPrefix}${String(counter).padStart(6, '0')}`;
                counter++;
            } while (existingMIDs.includes(suggestedMID));
            
            setFormData({...formData, mid: suggestedMID});
        } catch (error) {
            console.error('Error suggesting MID:', error);
        } finally {
            setIsSuggestingMID(false);
        }
    };

    const toggleTransactionType = (type) => {
        const types = formData.transaction_types || [];
        if (types.includes(type)) {
            setFormData({...formData, transaction_types: types.filter(t => t !== type)});
        } else {
            setFormData({...formData, transaction_types: [...types, type]});
        }
    };

    const handleSubmit = () => {
        if (editingMID) {
            updateMutation.mutate({ id: editingMID.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredMIDs = mids.filter(m => {
        const matchesSearch = !searchQuery || 
            m.mid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.provider_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMerchant = merchantFilter === 'all' || m.merchant_id === merchantFilter;
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        const matchesPaymentMethod = paymentMethodFilter === 'all' || 
            (m.transaction_types || []).includes(paymentMethodFilter);
        return matchesSearch && matchesMerchant && matchesStatus && matchesPaymentMethod;
    });

    const totalPages = Math.ceil(filteredMIDs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMIDs = filteredMIDs.slice(startIndex, startIndex + itemsPerPage);

    const handleQuickStatusChange = (mid, newStatus) => {
        updateMutation.mutate({ id: mid.id, data: { ...mid, status: newStatus } });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="MerchantMIDs" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Merchant MIDs</h1>
                            <p className="text-slate-500">Manage Merchant Identifiers mapped to payment methods and terminals</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Add MID
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <p className="text-xs text-slate-500">Total MIDs</p>
                            <p className="text-2xl font-bold">{mids.length}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-xs text-slate-500">Active</p>
                            <p className="text-2xl font-bold text-emerald-600">{mids.filter(m => m.status === 'active').length}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-xs text-slate-500">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">{mids.filter(m => m.status === 'pending').length}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-xs text-slate-500">Merchants</p>
                            <p className="text-2xl font-bold text-blue-600">{new Set(mids.map(m => m.merchant_id)).size}</p>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search MIDs..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10" />
                                </div>
                                <Select value={merchantFilter} onValueChange={(val) => { setMerchantFilter(val); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Merchant" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Merchants</SelectItem>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={paymentMethodFilter} onValueChange={(val) => { setPaymentMethodFilter(val); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-44"><SelectValue placeholder="Payment Method" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        {Object.entries(transactionTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bulk Actions */}
                    {selectedMIDs.length > 0 && (
                        <Card className="mb-4 border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{selectedMIDs.length} MID(s) selected</p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => bulkUpdateMutation.mutate({ ids: selectedMIDs, status: 'active' })}>
                                            <CheckCircle className="h-3 w-3 mr-1" />Activate All
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => bulkUpdateMutation.mutate({ ids: selectedMIDs, status: 'inactive' })}>
                                            <XCircle className="h-3 w-3 mr-1" />Deactivate All
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setSelectedMIDs([])}>Clear Selection</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">All MIDs <Badge variant="secondary" className="ml-2">{filteredMIDs.length}</Badge></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="w-12">
                                            <Checkbox 
                                                checked={selectedMIDs.length === paginatedMIDs.length && paginatedMIDs.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedMIDs(paginatedMIDs.map(m => m.id));
                                                    } else {
                                                        setSelectedMIDs([]);
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>MID</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Terminal Type</TableHead>
                                        <TableHead>Transaction Types</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedMIDs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                {isLoading ? 'Loading...' : 'No MIDs found'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedMIDs.map((mid) => (
                                            <TableRow key={mid.id}>
                                                <TableCell>
                                                    <Checkbox 
                                                        checked={selectedMIDs.includes(mid.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedMIDs([...selectedMIDs, mid.id]);
                                                            } else {
                                                                setSelectedMIDs(selectedMIDs.filter(id => id !== mid.id));
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono font-medium text-blue-600">{mid.mid}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Store className="h-4 w-4 text-slate-400" />
                                                        {mid.merchant_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{mid.provider_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{terminalTypeLabels[mid.terminal_type] || mid.terminal_type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(mid.transaction_types || []).map(type => (
                                                            <Badge key={type} variant="secondary" className="text-xs">{transactionTypeLabels[type] || type}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusConfig[mid.status]?.color}>{statusConfig[mid.status]?.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(mid)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                            {mid.status !== 'active' && (
                                                                <DropdownMenuItem onClick={() => handleQuickStatusChange(mid, 'active')}><CheckCircle className="h-4 w-4 mr-2" />Activate</DropdownMenuItem>
                                                            )}
                                                            {mid.status !== 'inactive' && (
                                                                <DropdownMenuItem onClick={() => handleQuickStatusChange(mid, 'inactive')}><XCircle className="h-4 w-4 mr-2" />Deactivate</DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(mid.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {filteredMIDs.length > 0 && (
                            <div className="border-t p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm text-slate-600">
                                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMIDs.length)} of {filteredMIDs.length} MIDs
                                        </p>
                                        <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10 per page</SelectItem>
                                                <SelectItem value="25">25 per page</SelectItem>
                                                <SelectItem value="50">50 per page</SelectItem>
                                                <SelectItem value="100">100 per page</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        className="w-9"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </main>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); else setShowDialog(true); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingMID ? 'Edit MID' : 'Add Merchant MID'}</DialogTitle>
                        <DialogDescription>Map a MID to a merchant, provider, and terminal type</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Merchant *</Label>
                                <Select value={formData.merchant_id} onValueChange={handleMerchantChange}>
                                    <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                    <SelectContent>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>MID *</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.mid} onChange={(e) => setFormData({...formData, mid: e.target.value})} placeholder="e.g., 1234567890" />
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        size="icon"
                                        onClick={suggestMID}
                                        disabled={!formData.provider_id || !formData.terminal_type || isSuggestingMID}
                                        title="Auto-suggest MID"
                                    >
                                        {isSuggestingMID ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {formData.provider_id && formData.terminal_type && (
                                    <p className="text-xs text-slate-500">Click sparkle icon to auto-generate available MID</p>
                                )}
                            </div>
                        </div>
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
                                <Label>Terminal Type *</Label>
                                <Select value={formData.terminal_type} onValueChange={(val) => setFormData({...formData, terminal_type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(terminalTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Transaction Types</Label>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                                {Object.entries(transactionTypeLabels).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={key} 
                                            checked={(formData.transaction_types || []).includes(key)}
                                            onCheckedChange={() => toggleTransactionType(key)}
                                        />
                                        <label htmlFor={key} className="text-sm">{label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional notes..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.merchant_id || !formData.mid || !formData.provider_id}>{editingMID ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}