import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { 
    Plus, 
    Search, 
    CreditCard, 
    Store, 
    Building2,
    MoreHorizontal,
    Pencil,
    Trash2,
    Filter,
    Download,
    RefreshCw,
    Database,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    Loader2
} from 'lucide-react';

const terminalTypes = {
    ecommerce: { label: 'E-Commerce', color: 'bg-blue-100 text-blue-700' },
    virtual_terminal: { label: 'Virtual Terminal', color: 'bg-purple-100 text-purple-700' },
    soft_pos: { label: 'Soft POS', color: 'bg-green-100 text-green-700' },
    physical_terminal: { label: 'Physical Terminal', color: 'bg-amber-100 text-amber-700' },
    mpos: { label: 'mPOS', color: 'bg-pink-100 text-pink-700' }
};

const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-700', icon: XCircle },
    suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
};

const transactionTypeLabels = {
    card_present: 'Card Present',
    card_not_present: 'Card Not Present',
    ecommerce: 'E-Commerce',
    virtual_terminal: 'Virtual Terminal',
    soft_pos: 'Soft POS',
    recurring: 'Recurring',
    moto: 'MOTO'
};

export default function MerchantMIDsDB() {
    const [collapsed, setCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingMid, setEditingMid] = useState(null);
    const [formData, setFormData] = useState({
        merchant_id: '',
        merchant_name: '',
        mid: '',
        provider_id: '',
        provider_name: '',
        terminal_type: 'ecommerce',
        transaction_types: [],
        currency: 'USD',
        status: 'pending',
        activation_date: '',
        notes: ''
    });

    const queryClient = useQueryClient();

    // Fetch MIDs from PostgreSQL
    const { data: midsResponse, isLoading: midsLoading, error: midsError, refetch } = useQuery({
        queryKey: ['db-mids'],
        queryFn: async () => {
            const response = await base44.functions.invoke('dbMids', { action: 'list' });
            return response.data;
        }
    });

    // Fetch merchants from PostgreSQL
    const { data: merchantsResponse } = useQuery({
        queryKey: ['db-merchants'],
        queryFn: async () => {
            const response = await base44.functions.invoke('dbMerchants', { action: 'list' });
            return response.data;
        }
    });

    // Fetch providers from PostgreSQL
    const { data: providersResponse } = useQuery({
        queryKey: ['db-providers'],
        queryFn: async () => {
            const response = await base44.functions.invoke('dbProviders', { action: 'list' });
            return response.data;
        }
    });

    const mids = midsResponse?.data || [];
    const merchants = merchantsResponse?.data || [];
    const providers = providersResponse?.data || [];

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('dbMids', { action: 'create', data });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['db-mids'] });
            setShowDialog(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('dbMids', { action: 'update', data });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['db-mids'] });
            setShowDialog(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await base44.functions.invoke('dbMids', { action: 'delete', data: { id } });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['db-mids'] });
        }
    });

    const resetForm = () => {
        setFormData({
            merchant_id: '',
            merchant_name: '',
            mid: '',
            provider_id: '',
            provider_name: '',
            terminal_type: 'ecommerce',
            transaction_types: [],
            currency: 'USD',
            status: 'pending',
            activation_date: '',
            notes: ''
        });
        setEditingMid(null);
    };

    const handleEdit = (mid) => {
        setEditingMid(mid);
        setFormData({
            ...mid,
            transaction_types: mid.transaction_types || []
        });
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingMid) {
            updateMutation.mutate({ ...formData, id: editingMid.id });
        } else {
            createMutation.mutate(formData);
        }
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

    const filteredMids = mids.filter(mid => {
        const matchesSearch = !searchQuery || 
            mid.mid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mid.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mid.provider_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || mid.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: mids.length,
        active: mids.filter(m => m.status === 'active').length,
        pending: mids.filter(m => m.status === 'pending').length,
        suspended: mids.filter(m => m.status === 'suspended').length
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} currentPage="MerchantMIDsDB" />
            
            <div className={cn("transition-all duration-300", collapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setCollapsed(!collapsed)} collapsed={collapsed} />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-slate-900">Merchant MID Management</h1>
                                <Badge className="bg-blue-100 text-blue-700">
                                    <Database className="h-3 w-3 mr-1" />
                                    PostgreSQL
                                </Badge>
                            </div>
                            <p className="text-slate-600">Manage Merchant IDs connected to your PostgreSQL database</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                    resetForm();
                                    setShowDialog(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add MID
                            </Button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {midsError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Failed to load MIDs from database. Please check your database connection.
                                {midsError.message && `: ${midsError.message}`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total MIDs</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Active</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Pending</p>
                                        <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                                    </div>
                                    <div className="p-3 bg-amber-100 rounded-lg">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Suspended</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by MID, merchant, or provider..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* MIDs Table */}
                    <Card>
                        <CardContent className="p-0">
                            {midsLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>MID</TableHead>
                                            <TableHead>Merchant</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Terminal Type</TableHead>
                                            <TableHead>Currency</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMids.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                                    {mids.length === 0 
                                                        ? "No MIDs found. Add your first MID or initialize the database schema."
                                                        : "No MIDs match your search criteria."
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMids.map((mid) => {
                                                const StatusIcon = statusConfig[mid.status]?.icon || Clock;
                                                return (
                                                    <TableRow key={mid.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-4 w-4 text-slate-400" />
                                                                <span className="font-mono font-medium">{mid.mid}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Store className="h-4 w-4 text-slate-400" />
                                                                <span>{mid.merchant_name || '-'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-slate-400" />
                                                                <span>{mid.provider_name || '-'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={terminalTypes[mid.terminal_type]?.color || 'bg-slate-100'}>
                                                                {terminalTypes[mid.terminal_type]?.label || mid.terminal_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{mid.currency}</TableCell>
                                                        <TableCell>
                                                            <Badge className={statusConfig[mid.status]?.color || 'bg-slate-100'}>
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {statusConfig[mid.status]?.label || mid.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-500 text-sm">
                                                            {mid.created_at ? format(new Date(mid.created_at), 'MMM d, yyyy') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEdit(mid)}>
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        className="text-red-600"
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to delete this MID?')) {
                                                                                deleteMutation.mutate(mid.id);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingMid ? 'Edit MID' : 'Add New MID'}</DialogTitle>
                        <DialogDescription>
                            {editingMid ? 'Update the MID details below' : 'Enter the details for the new Merchant ID'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Merchant</Label>
                            <Select value={formData.merchant_id} onValueChange={handleMerchantChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select merchant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.business_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>MID</Label>
                            <Input
                                value={formData.mid}
                                onChange={(e) => setFormData({ ...formData, mid: e.target.value })}
                                placeholder="Enter Merchant ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select value={formData.provider_id} onValueChange={handleProviderChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Terminal Type</Label>
                            <Select 
                                value={formData.terminal_type} 
                                onValueChange={(v) => setFormData({ ...formData, terminal_type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(terminalTypes).map(([key, val]) => (
                                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select 
                                value={formData.currency} 
                                onValueChange={(v) => setFormData({ ...formData, currency: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                    <SelectItem value="CAD">CAD</SelectItem>
                                    <SelectItem value="AUD">AUD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(v) => setFormData({ ...formData, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statusConfig).map(([key, val]) => (
                                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Activation Date</Label>
                            <Input
                                type="date"
                                value={formData.activation_date}
                                onChange={(e) => setFormData({ ...formData, activation_date: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional notes..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            {editingMid ? 'Update MID' : 'Create MID'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}