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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Wallet, Edit, Trash2, MoreVertical, DollarSign, Save } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getPaymentMethodLogo, getPaymentMethodDisplayName } from '@/components/utils/paymentLogos';

export default function FTSPayoutRoutes() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [showDialog, setShowDialog] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [activeTab, setActiveTab] = useState('pool');
    const [editedPrices, setEditedPrices] = useState({});
    const [formData, setFormData] = useState({
        route_name: '',
        channel_type: 'bank_transfer',
        provider: '',
        supported_currencies: [],
        countries: [],
        cost_percentage: 0,
        cost_fixed: 0,
        speed: 'next_day',
        status: 'active'
    });

    const { data: routes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list('-created_date')
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PayoutRoute.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['payout-routes']);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PayoutRoute.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['payout-routes']);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PayoutRoute.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['payout-routes'])
    });

    const updatePricingMutation = useMutation({
        mutationFn: async (updates) => {
            await Promise.all(updates.map(({ id, cost_percentage, cost_fixed }) =>
                base44.entities.PayoutRoute.update(id, { cost_percentage, cost_fixed })
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['payout-routes']);
            setEditedPrices({});
        }
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingRoute(null);
        setFormData({ route_name: '', channel_type: 'bank_transfer', provider: '', supported_currencies: [], countries: [], cost_percentage: 0, cost_fixed: 0, speed: 'next_day', status: 'active' });
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        setFormData(route);
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingRoute) {
            updateMutation.mutate({ id: editingRoute.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleSavePricing = () => {
        const updates = Object.entries(editedPrices).map(([routeId, prices]) => {
            const route = routes.find(r => r.id === routeId);
            return {
                id: routeId,
                cost_percentage: prices.cost_percentage ?? route.cost_percentage ?? 0,
                cost_fixed: prices.cost_fixed ?? route.cost_fixed ?? 0
            };
        });
        updatePricingMutation.mutate(updates);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSPayoutRoutes" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Payout Route Pool</h2>
                        <p className="text-xs text-slate-600">Global payout methods available for PSP assignment</p>
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
                            Add Payout Route
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="pool">Payout Routes</TabsTrigger>
                                <TabsTrigger value="pricing">Pricing Matrix</TabsTrigger>
                            </TabsList>
                            {activeTab === 'pricing' && Object.keys(editedPrices).length > 0 && (
                                <Button onClick={handleSavePricing} className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Pricing Changes ({Object.keys(editedPrices).length})
                                </Button>
                            )}
                        </div>

                        <TabsContent value="pool">
                            <Card>
                        <CardHeader>
                            <CardTitle>All Payout Routes ({routes.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Route Name</TableHead>
                                        <TableHead>Channel Type</TableHead>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Speed</TableHead>
                                        <TableHead>Assigned PSPs</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {routes.map((route) => {
                                        const assignedCount = psps.filter(p => 
                                            p.enabled_payout_methods?.includes(route.id)
                                        ).length;
                                        return (
                                            <TableRow key={route.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-10 rounded flex items-center justify-center bg-white border border-slate-200 p-1">
                                                            {getPaymentMethodLogo(route.route_name) || getPaymentMethodLogo(route.channel_type) ? (
                                                                <img 
                                                                    src={getPaymentMethodLogo(route.route_name) || getPaymentMethodLogo(route.channel_type)} 
                                                                    alt={route.route_name} 
                                                                    className="max-w-full max-h-full object-contain" 
                                                                />
                                                            ) : (
                                                                <Wallet className="h-5 w-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="font-medium">{route.route_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{route.channel_type?.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>{route.provider}</TableCell>
                                                <TableCell className="text-sm">
                                                    {route.cost_percentage}% + ${route.cost_fixed}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{route.speed?.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{assignedCount} PSPs</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={route.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                        {route.status}
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
                                                            <DropdownMenuItem onClick={() => handleEdit(route)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(route.id)}>
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
                        </TabsContent>

                        <TabsContent value="pricing">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Master Pricing Matrix - Payout Routes
                                    </CardTitle>
                                    <p className="text-sm text-slate-600">Manage payout costs for all routes</p>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Route Name</TableHead>
                                                <TableHead>Channel Type</TableHead>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Cost %</TableHead>
                                                <TableHead>Fixed Cost</TableHead>
                                                <TableHead>Speed</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {routes.map((route) => {
                                                const editedPrice = editedPrices[route.id];
                                                const costPercentage = editedPrice?.cost_percentage ?? route.cost_percentage ?? 0;
                                                const costFixed = editedPrice?.cost_fixed ?? route.cost_fixed ?? 0;

                                                return (
                                                    <TableRow key={route.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-16 h-10 rounded flex items-center justify-center bg-white border border-slate-200 p-1">
                                                                    {getPaymentMethodLogo(route.route_name) || getPaymentMethodLogo(route.channel_type) ? (
                                                                        <img 
                                                                            src={getPaymentMethodLogo(route.route_name) || getPaymentMethodLogo(route.channel_type)} 
                                                                            alt={route.route_name} 
                                                                            className="max-w-full max-h-full object-contain" 
                                                                        />
                                                                    ) : (
                                                                        <Wallet className="h-5 w-5 text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <span className="font-medium">{route.route_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{route.channel_type?.replace('_', ' ')}</Badge>
                                                        </TableCell>
                                                        <TableCell>{route.provider}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={costPercentage}
                                                                    onChange={(e) => setEditedPrices({
                                                                        ...editedPrices,
                                                                        [route.id]: {
                                                                            ...editedPrices[route.id],
                                                                            cost_percentage: parseFloat(e.target.value) || 0
                                                                        }
                                                                    })}
                                                                    className="w-24"
                                                                />
                                                                <span className="text-sm text-slate-600">%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-slate-600">$</span>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={costFixed}
                                                                    onChange={(e) => setEditedPrices({
                                                                        ...editedPrices,
                                                                        [route.id]: {
                                                                            ...editedPrices[route.id],
                                                                            cost_fixed: parseFloat(e.target.value) || 0
                                                                        }
                                                                    })}
                                                                    className="w-24"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{route.speed?.replace('_', ' ')}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={route.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                                {route.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingRoute ? 'Edit Payout Route' : 'Add Payout Route'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Route Name *</Label>
                                <Input 
                                    value={formData.route_name} 
                                    onChange={(e) => setFormData({...formData, route_name: e.target.value})} 
                                    placeholder="e.g., US Bank Transfer"
                                />
                            </div>
                            <div>
                                <Label>Channel Type *</Label>
                                <Select value={formData.channel_type} onValueChange={(v) => setFormData({...formData, channel_type: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="instant_payment">Instant Payment</SelectItem>
                                        <SelectItem value="swift">SWIFT</SelectItem>
                                        <SelectItem value="sepa">SEPA</SelectItem>
                                        <SelectItem value="ach">ACH</SelectItem>
                                        <SelectItem value="crypto">Crypto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Provider *</Label>
                            <Input 
                                value={formData.provider} 
                                onChange={(e) => setFormData({...formData, provider: e.target.value})} 
                                placeholder="e.g., Wise, Stripe Connect"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Cost Percentage (%)</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.cost_percentage} 
                                    onChange={(e) => setFormData({...formData, cost_percentage: parseFloat(e.target.value)})} 
                                />
                            </div>
                            <div>
                                <Label>Fixed Cost</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.cost_fixed} 
                                    onChange={(e) => setFormData({...formData, cost_fixed: parseFloat(e.target.value)})} 
                                />
                            </div>
                            <div>
                                <Label>Speed</Label>
                                <Select value={formData.speed} onValueChange={(v) => setFormData({...formData, speed: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant">Instant</SelectItem>
                                        <SelectItem value="same_day">Same Day</SelectItem>
                                        <SelectItem value="next_day">Next Day</SelectItem>
                                        <SelectItem value="2_3_days">2-3 Days</SelectItem>
                                        <SelectItem value="3_5_days">3-5 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Supported Currencies</Label>
                            <Input 
                                value={formData.supported_currencies?.join(', ')} 
                                onChange={(e) => setFormData({...formData, supported_currencies: e.target.value.split(',').map(s => s.trim())})} 
                                placeholder="USD, EUR, GBP"
                            />
                        </div>
                        <div>
                            <Label>Countries</Label>
                            <Input 
                                value={formData.countries?.join(', ')} 
                                onChange={(e) => setFormData({...formData, countries: e.target.value.split(',').map(s => s.trim())})} 
                                placeholder="US, UK, SG"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.route_name || !formData.provider} className="bg-blue-600 hover:bg-blue-700">
                            {editingRoute ? 'Update' : 'Create'} Route
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}