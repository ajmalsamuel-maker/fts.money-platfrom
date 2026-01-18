import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CreditCard, Plus, CheckCircle, XCircle, MoreHorizontal, Trash2, TestTube, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const GATEWAY_LOGOS = {
    stripe: '🔷',
    paypal: '🅿️',
    adyen: '🔶',
    square: '⬛',
    braintree: '🧠',
    authorize_net: '🔐'
};

export default function PaymentGateways() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [editingGateway, setEditingGateway] = useState(null);
    const [formData, setFormData] = useState({
        merchant_id: '',
        gateway_name: 'stripe',
        gateway_mode: 'test',
        api_key: '',
        api_secret: '',
        merchant_account_id: '',
        webhook_secret: ''
    });

    const queryClient = useQueryClient();
    const pspCode = JSON.parse(localStorage.getItem('staff_session') || '{}').psp_code;

    // Get assigned connectors from platform
    const { data: assignedConnectors = [] } = useQuery({
        queryKey: ['assigned-connectors', pspCode],
        queryFn: async () => {
            if (!pspCode) return [];
            return await base44.entities.PSPConnectorAssignment.filter({ psp_code: pspCode });
        },
        enabled: !!pspCode
    });

    const { data: gateways = [], isLoading } = useQuery({
        queryKey: ['payment-gateways'],
        queryFn: () => base44.entities.PaymentGateway.list('-created_date')
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: async () => {
            if (!pspCode) return [];
            const response = await base44.functions.invoke('pspData', {
                action: 'listMerchants',
                psp_code: pspCode
            });
            return response.data?.data || [];
        },
        enabled: !!pspCode
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PaymentGateway.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
            toast.success('Gateway connected successfully');
            resetForm();
        },
        onError: (error) => {
            toast.error('Failed to connect gateway', { description: error.message });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PaymentGateway.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
            toast.success('Gateway updated successfully');
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PaymentGateway.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
            toast.success('Gateway removed');
        }
    });

    const testConnectionMutation = useMutation({
        mutationFn: async (gateway) => {
            const functionName = `${gateway.gateway_name}Gateway`;
            const response = await base44.functions.invoke(functionName, {
                action: 'test_connection',
                gateway_id: gateway.id
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
            toast.success('Connection verified successfully');
        },
        onError: (error) => {
            toast.error('Connection test failed', { description: error.message });
        }
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingGateway(null);
        setFormData({
            merchant_id: '',
            gateway_name: 'stripe',
            gateway_mode: 'test',
            api_key: '',
            api_secret: '',
            merchant_account_id: '',
            webhook_secret: ''
        });
    };

    const handleEdit = (gateway) => {
        setEditingGateway(gateway);
        setFormData({
            merchant_id: gateway.merchant_id,
            gateway_name: gateway.gateway_name,
            gateway_mode: gateway.gateway_mode,
            api_key: gateway.api_key,
            api_secret: gateway.api_secret || '',
            merchant_account_id: gateway.merchant_account_id || '',
            webhook_secret: gateway.webhook_secret || ''
        });
        setShowDialog(true);
    };

    const handleSubmit = () => {
        const merchant = merchants.find(m => m.id === formData.merchant_id);
        const submitData = {
            ...formData,
            merchant_name: merchant?.business_name || ''
        };

        if (editingGateway) {
            updateMutation.mutate({ id: editingGateway.id, data: submitData });
        } else {
            createMutation.mutate(submitData);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="PaymentGateways" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                                Payment Gateways
                            </h1>
                            <p className="text-slate-500">Configure assigned connectors for your merchants</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700" disabled={assignedConnectors.length === 0}>
                            <Plus className="h-4 w-4" /> Configure Gateway
                        </Button>
                    </div>

                    {/* Assigned Connectors Info */}
                    {assignedConnectors.length === 0 && (
                        <Card className="mb-6 border-blue-200 bg-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-900 mb-1">No Connectors Assigned</p>
                                        <p className="text-sm text-blue-700">
                                            Payment connectors must be assigned to your PSP by the FTS Platform Administrator before you can configure them.
                                            Contact your FTS account manager to request connector access.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Available Connectors */}
                    {assignedConnectors.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Assigned Connectors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    {assignedConnectors.map(assignment => (
                                        <div key={assignment.id} className="p-4 border rounded-lg bg-white">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium capitalize">{assignment.connector_name}</p>
                                                <Badge className={
                                                    assignment.enabled_by_psp ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                                }>
                                                    {assignment.enabled_by_psp ? 'Enabled' : 'Available'}
                                                </Badge>
                                            </div>
                                            {assignment.usage_limits?.monthly_volume_limit && (
                                                <p className="text-xs text-slate-500">
                                                    Limit: ${(assignment.usage_limits.monthly_volume_limit / 1000).toFixed(0)}K/month
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Total Gateways</p>
                                <p className="text-2xl font-bold">{gateways.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Active</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {gateways.filter(g => g.status === 'active').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Verified</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {gateways.filter(g => g.connection_verified).length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Total Volume</p>
                                <p className="text-2xl font-bold">
                                    ${gateways.reduce((sum, g) => sum + (g.total_volume || 0), 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gateways Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Connected Gateways</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Gateway</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead>Volume</TableHead>
                                        <TableHead>Transactions</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                                        </TableRow>
                                    ) : gateways.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                                No gateways connected yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        gateways.map((gateway) => (
                                            <TableRow key={gateway.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{GATEWAY_LOGOS[gateway.gateway_name]}</span>
                                                        <span className="font-medium capitalize">{gateway.gateway_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{gateway.merchant_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={gateway.gateway_mode === 'live' ? 'default' : 'secondary'}>
                                                        {gateway.gateway_mode}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        gateway.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        gateway.status === 'testing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {gateway.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {gateway.connection_verified ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    ${(gateway.total_volume || 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell>{gateway.total_transactions || 0}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => testConnectionMutation.mutate(gateway)}>
                                                                <TestTube className="h-4 w-4 mr-2" />
                                                                Test Connection
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEdit(gateway)}>
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="text-red-600"
                                                                onClick={() => deleteMutation.mutate(gateway.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Add/Edit Gateway Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingGateway ? 'Edit' : 'Configure'} Assigned Gateway</DialogTitle>
                    </DialogHeader>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <p className="text-sm text-blue-700">
                            You can only configure connectors that have been assigned to your PSP by the FTS Platform.
                        </p>
                    </div>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Merchant</Label>
                            <Select value={formData.merchant_id} onValueChange={(val) => setFormData({...formData, merchant_id: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select merchant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Gateway (Assigned by FTS)</Label>
                                <Select value={formData.gateway_name} onValueChange={(val) => setFormData({...formData, gateway_name: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assigned connector" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignedConnectors.map(assignment => (
                                            <SelectItem key={assignment.id} value={assignment.connector_name}>
                                                {assignment.connector_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Mode</Label>
                                <Select value={formData.gateway_mode} onValueChange={(val) => setFormData({...formData, gateway_mode: val})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="test">Test/Sandbox</SelectItem>
                                        <SelectItem value="live">Live/Production</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input 
                                type="password"
                                value={formData.api_key}
                                onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                                placeholder="Enter API key"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSubmit}>
                            {editingGateway ? 'Update' : 'Connect'} Gateway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}