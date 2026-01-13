import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Server, CheckCircle, XCircle, Clock, Loader2, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformBlockchainProvisioning() {
    const [provisionDialog, setProvisionDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [chainType, setChainType] = useState('polygon_edge');
    const queryClient = useQueryClient();

    const platformSession = localStorage.getItem('platform_admin_session');
    if (!platformSession) {
        window.location.href = '/PlatformAdminLogin';
        return null;
    }

    const { data: customers = [] } = useQuery({
        queryKey: ['loyalty-customers'],
        queryFn: () => base44.entities.LoyaltyCustomer.list()
    });

    const { data: blockchainConfigs = [] } = useQuery({
        queryKey: ['blockchain-configs'],
        queryFn: () => base44.entities.BlockchainConfig.list()
    });

    const provisionMutation = useMutation({
        mutationFn: async ({ customer_id, chain_type }) => {
            const { data } = await base44.functions.invoke('provisionCustomerBlockchain', {
                customer_id,
                chain_type
            });
            return data;
        },
        onSuccess: () => {
            toast.success('Blockchain provisioned successfully!');
            queryClient.invalidateQueries(['blockchain-configs']);
            setProvisionDialog(false);
            setSelectedCustomer('');
        },
        onError: (error) => {
            toast.error('Provisioning failed: ' + error.message);
        }
    });

    const handleProvision = () => {
        if (!selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }
        provisionMutation.mutate({ customer_id: selectedCustomer, chain_type: chainType });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'provisioning': return 'bg-blue-100 text-blue-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'suspended': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'provisioning': return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'failed': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const provisionedCustomers = new Set(blockchainConfigs.map(c => c.customer_id));
    const unprovisionedCustomers = customers.filter(c => !provisionedCustomers.has(c.id));

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="blockchain" />
            
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Blockchain Provisioning</h1>
                            <p className="text-slate-600 mt-1">Manage permissioned blockchain infrastructure for customers</p>
                        </div>
                        <Button 
                            onClick={() => setProvisionDialog(true)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                            disabled={unprovisionedCustomers.length === 0}
                        >
                            <Server className="h-4 w-4 mr-2" />
                            Provision New Chain
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Chains</p>
                                        <p className="text-2xl font-bold">{blockchainConfigs.filter(c => c.provisioning_status === 'active').length}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Provisioning</p>
                                        <p className="text-2xl font-bold">{blockchainConfigs.filter(c => c.provisioning_status === 'provisioning').length}</p>
                                    </div>
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Gas Relay Enabled</p>
                                        <p className="text-2xl font-bold">{blockchainConfigs.filter(c => c.gas_relay_enabled).length}</p>
                                    </div>
                                    <Zap className="h-8 w-8 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Monthly Revenue</p>
                                        <p className="text-2xl font-bold">${blockchainConfigs.reduce((sum, c) => sum + (c.monthly_cost || 0), 0).toLocaleString()}</p>
                                    </div>
                                    <Shield className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Provisioned Chains */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Provisioned Blockchain Infrastructure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {blockchainConfigs.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Server className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                    <p>No blockchain infrastructure provisioned yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {blockchainConfigs.map(config => {
                                        const customer = customers.find(c => c.id === config.customer_id);
                                        return (
                                            <div key={config.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{customer?.organization_name || 'Unknown'}</h3>
                                                        <p className="text-sm text-slate-600">{customer?.admin_email}</p>
                                                    </div>
                                                    <Badge className={getStatusColor(config.provisioning_status)}>
                                                        {getStatusIcon(config.provisioning_status)}
                                                        <span className="ml-1">{config.provisioning_status}</span>
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-slate-500">Chain Type</p>
                                                        <p className="font-medium">{config.chain_type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Chain ID</p>
                                                        <p className="font-medium">{config.chain_id || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Validators</p>
                                                        <p className="font-medium">{config.validator_nodes?.length || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Monthly Cost</p>
                                                        <p className="font-medium text-green-600">${config.monthly_cost || 0}</p>
                                                    </div>
                                                </div>

                                                {config.provisioning_status === 'active' && (
                                                    <div className="mt-3 pt-3 border-t space-y-1 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500 w-20">RPC:</span>
                                                            <code className="bg-slate-100 px-2 py-1 rounded flex-1">{config.rpc_url}</code>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500 w-20">Explorer:</span>
                                                            <code className="bg-slate-100 px-2 py-1 rounded flex-1">{config.explorer_url}</code>
                                                        </div>
                                                        {config.gas_relay_enabled && (
                                                            <div className="flex items-center gap-2">
                                                                <Zap className="h-3 w-3 text-yellow-600" />
                                                                <span className="text-yellow-700 font-medium">Gas-free transactions enabled</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Provision Dialog */}
            <Dialog open={provisionDialog} onOpenChange={setProvisionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Provision Blockchain Infrastructure</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Customer</Label>
                            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {unprovisionedCustomers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.organization_name} ({customer.admin_email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Chain Type</Label>
                            <Select value={chainType} onValueChange={setChainType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="polygon_edge">Polygon Edge (Recommended)</SelectItem>
                                    <SelectItem value="hyperledger_fabric" disabled>Hyperledger Fabric (Coming Soon)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                            <p className="font-medium text-blue-900 mb-2">What will be provisioned:</p>
                            <ul className="space-y-1 text-blue-800">
                                <li>✓ Isolated blockchain network</li>
                                <li>✓ 4 validator nodes</li>
                                <li>✓ Gas relay contract (zero fees)</li>
                                <li>✓ RBAC-enabled smart contracts</li>
                                <li>✓ Private RPC endpoint</li>
                                <li>✓ Block explorer</li>
                            </ul>
                            <p className="mt-2 text-blue-700 font-medium">Cost: $150/month</p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setProvisionDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleProvision}
                                disabled={!selectedCustomer || provisionMutation.isPending}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                                {provisionMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Provisioning...
                                    </>
                                ) : (
                                    <>
                                        <Server className="h-4 w-4 mr-2" />
                                        Provision Chain
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}