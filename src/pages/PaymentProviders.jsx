import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { getPaymentMethodLogo, getPaymentMethodDisplayName } from '@/components/utils/paymentLogos';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Search, Plus, MoreHorizontal, Edit, Trash2, Building, CreditCard, 
    Wallet, Globe, Landmark, Bitcoin
} from 'lucide-react';

const typeConfig = {
    card_scheme: { label: 'Card Scheme', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
    acquirer: { label: 'Acquirer', icon: Landmark, color: 'bg-purple-100 text-purple-700' },
    bank: { label: 'Bank', icon: Building, color: 'bg-emerald-100 text-emerald-700' },
    wallet: { label: 'Wallet', icon: Wallet, color: 'bg-amber-100 text-amber-700' },
    apm: { label: 'APM', icon: Globe, color: 'bg-pink-100 text-pink-700' },
    crypto: { label: 'Crypto', icon: Bitcoin, color: 'bg-orange-100 text-orange-700' },
};

const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
};

export default function PaymentProviders() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [formData, setFormData] = useState({
        name: '', type: 'card_scheme', status: 'active', 
        supported_currencies: [], supported_regions: [], notes: ''
    });

    const queryClient = useQueryClient();

    const { data: providers = [], isLoading } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list('-created_date'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PaymentProvider.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-providers'] });
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PaymentProvider.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-providers'] });
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PaymentProvider.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-providers'] }),
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingProvider(null);
        setFormData({ name: '', type: 'card_scheme', status: 'active', supported_currencies: [], supported_regions: [], notes: '' });
    };

    const handleEdit = (provider) => {
        setEditingProvider(provider);
        setFormData({
            name: provider.name || '',
            type: provider.type || 'card_scheme',
            status: provider.status || 'active',
            supported_currencies: provider.supported_currencies || [],
            supported_regions: provider.supported_regions || [],
            notes: provider.notes || '',
        });
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingProvider) {
            updateMutation.mutate({ id: editingProvider.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredProviders = providers.filter(p => {
        const matchesSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || p.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="PaymentProviders" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Payment Providers</h1>
                            <p className="text-slate-500">Manage card schemes, acquirers, banks, wallets, APMs and crypto rails</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Add Provider
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        {Object.entries(typeConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            const count = providers.filter(p => p.type === key).length;
                            return (
                                <Card key={key} className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.color)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">{config.label}</p>
                                            <p className="text-lg font-bold">{count}</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search providers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {Object.entries(typeConfig).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">All Providers <Badge variant="secondary" className="ml-2">{filteredProviders.length}</Badge></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Currencies</TableHead>
                                        <TableHead>Regions</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProviders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                                {isLoading ? 'Loading...' : 'No providers found'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProviders.map((provider) => {
                                            const typeConf = typeConfig[provider.type] || typeConfig.apm;
                                            const Icon = typeConf.icon;
                                            return (
                                                <TableRow key={provider.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-10 rounded flex items-center justify-center bg-white border border-slate-200 p-1">
                                                                {getPaymentMethodLogo(provider.name) ? (
                                                                    <img 
                                                                        src={getPaymentMethodLogo(provider.name)} 
                                                                        alt={provider.name} 
                                                                        className="max-w-full max-h-full object-contain" 
                                                                    />
                                                                ) : (
                                                                    <div className={cn("w-full h-full rounded flex items-center justify-center", typeConf.color)}>
                                                                        <Icon className="h-5 w-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="font-medium">{provider.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant="outline" className={typeConf.color}>{typeConf.label}</Badge></TableCell>
                                                    <TableCell className="text-slate-600">{provider.supported_currencies?.join(', ') || '-'}</TableCell>
                                                    <TableCell className="text-slate-600">{provider.supported_regions?.join(', ') || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge className={statusConfig[provider.status]?.color}>{statusConfig[provider.status]?.label}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEdit(provider)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(provider.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); else setShowDialog(true); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProvider ? 'Edit Provider' : 'Add Payment Provider'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Provider Name *</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Visa, PayPal, Stripe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type *</Label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(typeConfig).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Supported Currencies (comma separated)</Label>
                            <Input value={formData.supported_currencies?.join(', ')} onChange={(e) => setFormData({...formData, supported_currencies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} placeholder="USD, EUR, GBP" />
                        </div>
                        <div className="space-y-2">
                            <Label>Supported Regions (comma separated)</Label>
                            <Input value={formData.supported_regions?.join(', ')} onChange={(e) => setFormData({...formData, supported_regions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} placeholder="US, EU, APAC" />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional notes..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.name}>{editingProvider ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}