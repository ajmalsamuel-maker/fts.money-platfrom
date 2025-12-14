import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    Plus, 
    CreditCard, 
    Landmark, 
    Building, 
    Wallet, 
    Globe, 
    Bitcoin,
    Edit,
    Trash2,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const typeIcons = {
    card_scheme: { Icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
    acquirer: { Icon: Landmark, color: 'bg-purple-100 text-purple-700' },
    bank: { Icon: Building, color: 'bg-emerald-100 text-emerald-700' },
    wallet: { Icon: Wallet, color: 'bg-amber-100 text-amber-700' },
    apm: { Icon: Globe, color: 'bg-pink-100 text-pink-700' },
    crypto: { Icon: Bitcoin, color: 'bg-orange-100 text-orange-700' }
};

export default function FTSProviderPool() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [showDialog, setShowDialog] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'card_scheme',
        supported_currencies: [],
        supported_regions: [],
        status: 'active'
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list('-created_date')
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PaymentProvider.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-providers']);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PaymentProvider.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-providers']);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PaymentProvider.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['payment-providers'])
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingProvider(null);
        setFormData({ name: '', type: 'card_scheme', supported_currencies: [], supported_regions: [], status: 'active' });
    };

    const handleEdit = (provider) => {
        setEditingProvider(provider);
        setFormData(provider);
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingProvider) {
            updateMutation.mutate({ id: editingProvider.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSProviderPool" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Payment Provider Pool</h2>
                        <p className="text-xs text-slate-600">Global provider registry available for PSP assignment</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Provider
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-6 gap-4 mb-6">
                        {Object.entries(typeIcons).map(([type, { Icon, color }]) => {
                            const count = providers.filter(p => p.type === type).length;
                            return (
                                <Card key={type} className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 capitalize">{type.replace('_', ' ')}</p>
                                            <p className="text-lg font-bold">{count}</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Provider Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Providers ({providers.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Currencies</TableHead>
                                        <TableHead>Regions</TableHead>
                                        <TableHead>Assigned PSPs</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {providers.map((provider) => {
                                        const { Icon, color } = typeIcons[provider.type] || typeIcons.apm;
                                        const assignedCount = psps.filter(p => 
                                            p.enabled_payment_methods?.includes(provider.id)
                                        ).length;
                                        return (
                                            <TableRow key={provider.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <span className="font-medium">{provider.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={color}>
                                                        {provider.type?.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{provider.supported_currencies?.join(', ') || '-'}</TableCell>
                                                <TableCell className="text-sm">{provider.supported_regions?.join(', ') || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{assignedCount} PSPs</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={provider.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                        {provider.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(provider)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(provider.id)}>
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingProvider ? 'Edit Provider' : 'Add Payment Provider'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Provider Name *</Label>
                            <Input 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g., Stripe, Adyen, Visa"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Provider Type *</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="card_scheme">Card Scheme</SelectItem>
                                        <SelectItem value="acquirer">Acquirer</SelectItem>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="wallet">Digital Wallet</SelectItem>
                                        <SelectItem value="apm">Alternative Payment Method</SelectItem>
                                        <SelectItem value="crypto">Crypto Provider</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Supported Currencies (comma-separated)</Label>
                            <Input 
                                value={formData.supported_currencies?.join(', ')} 
                                onChange={(e) => setFormData({...formData, supported_currencies: e.target.value.split(',').map(s => s.trim())})} 
                                placeholder="USD, EUR, GBP, SGD"
                            />
                        </div>
                        <div>
                            <Label>Supported Regions (comma-separated)</Label>
                            <Input 
                                value={formData.supported_regions?.join(', ')} 
                                onChange={(e) => setFormData({...formData, supported_regions: e.target.value.split(',').map(s => s.trim())})} 
                                placeholder="US, EU, APAC"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.name} className="bg-blue-600 hover:bg-blue-700">
                            {editingProvider ? 'Update' : 'Create'} Provider
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}