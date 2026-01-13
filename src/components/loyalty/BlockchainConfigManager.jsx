import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, CheckCircle, XCircle, Clock, Loader2, Shield, Zap, Edit, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BlockchainConfigManager({ customerId, customerName }) {
    const [editDialog, setEditDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [editData, setEditData] = useState(null);
    const queryClient = useQueryClient();

    const { data: configs = [], isLoading } = useQuery({
        queryKey: ['blockchain-config', customerId],
        queryFn: () => base44.entities.BlockchainConfig.filter({ customer_id: customerId }),
        enabled: !!customerId
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.BlockchainConfig.update(data.id, data.updates);
        },
        onSuccess: () => {
            toast.success('Blockchain configuration updated');
            queryClient.invalidateQueries(['blockchain-config', customerId]);
            setEditDialog(false);
        },
        onError: (error) => {
            toast.error('Update failed: ' + error.message);
        }
    });

    const provisionMutation = useMutation({
        mutationFn: async () => {
            const { data } = await base44.functions.invoke('provisionCustomerBlockchain', {
                customer_id: customerId,
                chain_type: 'polygon_edge'
            });
            return data;
        },
        onSuccess: () => {
            toast.success('Blockchain provisioning started!');
            queryClient.invalidateQueries(['blockchain-config', customerId]);
        },
        onError: (error) => {
            toast.error('Provisioning failed: ' + error.message);
        }
    });

    const handleEdit = (config) => {
        setEditData({
            id: config.id,
            monthly_cost: config.monthly_cost || 150,
            gas_relay_enabled: config.gas_relay_enabled ?? true,
            cpu_cores: config.resources_allocated?.cpu_cores || 4,
            ram_gb: config.resources_allocated?.ram_gb || 16,
            storage_gb: config.resources_allocated?.storage_gb || 500,
            transactions_per_month: config.resources_allocated?.transactions_per_month || 1000000
        });
        setEditDialog(true);
    };

    const handleUpdate = () => {
        if (!editData) return;

        const updates = {
            monthly_cost: parseFloat(editData.monthly_cost),
            gas_relay_enabled: editData.gas_relay_enabled,
            resources_allocated: {
                cpu_cores: parseFloat(editData.cpu_cores),
                ram_gb: parseFloat(editData.ram_gb),
                storage_gb: parseFloat(editData.storage_gb),
                transactions_per_month: parseFloat(editData.transactions_per_month)
            }
        };

        updateMutation.mutate({ id: editData.id, updates });
    };

    const config = configs[0];

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

    if (isLoading) {
        return <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
    }

    if (!config) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Blockchain Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 mb-4">No blockchain infrastructure provisioned</p>
                        <Button 
                            onClick={() => provisionMutation.mutate()}
                            disabled={provisionMutation.isPending}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                            {provisionMutation.isPending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Provisioning...</>
                            ) : (
                                <><Server className="h-4 w-4 mr-2" />Provision Blockchain</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Blockchain Configuration
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(config.provisioning_status)}>
                                {getStatusIcon(config.provisioning_status)}
                                <span className="ml-1">{config.provisioning_status}</span>
                            </Badge>
                            {config.provisioning_status === 'active' && (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setViewDialog(true)}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Details
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Chain Type</p>
                            <p className="font-medium">{config.chain_type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Chain ID</p>
                            <p className="font-medium">{config.chain_id || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Validators</p>
                            <p className="font-medium">{config.validator_nodes?.length || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Monthly Cost</p>
                            <p className="font-medium text-green-600">${config.monthly_cost || 0}</p>
                        </div>
                    </div>

                    {config.gas_relay_enabled && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <span className="text-yellow-700 font-medium">Gas-free meta-transactions enabled</span>
                        </div>
                    )}

                    {config.resources_allocated && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-slate-700 mb-2">Resource Allocation</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500">CPU</p>
                                    <p className="font-medium">{config.resources_allocated.cpu_cores} cores</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">RAM</p>
                                    <p className="font-medium">{config.resources_allocated.ram_gb} GB</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Storage</p>
                                    <p className="font-medium">{config.resources_allocated.storage_gb} GB</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">TX/Month</p>
                                    <p className="font-medium">{(config.resources_allocated.transactions_per_month || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Details Dialog */}
            <Dialog open={viewDialog} onOpenChange={setViewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Blockchain Configuration Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs text-slate-500">RPC Endpoint</Label>
                            <code className="block bg-slate-100 p-2 rounded text-sm mt-1">{config.rpc_url}</code>
                        </div>
                        <div>
                            <Label className="text-xs text-slate-500">WebSocket Endpoint</Label>
                            <code className="block bg-slate-100 p-2 rounded text-sm mt-1">{config.ws_url}</code>
                        </div>
                        <div>
                            <Label className="text-xs text-slate-500">Block Explorer</Label>
                            <code className="block bg-slate-100 p-2 rounded text-sm mt-1">{config.explorer_url}</code>
                        </div>
                        <div>
                            <Label className="text-xs text-slate-500">Deployer Address</Label>
                            <code className="block bg-slate-100 p-2 rounded text-sm mt-1">{config.deployer_address}</code>
                        </div>
                        {config.relay_address && (
                            <div>
                                <Label className="text-xs text-slate-500">Gas Relay Contract</Label>
                                <code className="block bg-slate-100 p-2 rounded text-sm mt-1">{config.relay_address}</code>
                            </div>
                        )}
                        {config.validator_nodes && config.validator_nodes.length > 0 && (
                            <div>
                                <Label className="text-xs text-slate-500">Validator Nodes</Label>
                                <div className="space-y-1 mt-1">
                                    {config.validator_nodes.map((node, idx) => (
                                        <code key={idx} className="block bg-slate-100 p-2 rounded text-xs">{node}</code>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Blockchain Configuration</DialogTitle>
                    </DialogHeader>
                    {editData && (
                        <div className="space-y-4">
                            <div>
                                <Label>Monthly Cost (USD)</Label>
                                <Input 
                                    type="number" 
                                    value={editData.monthly_cost}
                                    onChange={(e) => setEditData({...editData, monthly_cost: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox"
                                    checked={editData.gas_relay_enabled}
                                    onChange={(e) => setEditData({...editData, gas_relay_enabled: e.target.checked})}
                                    className="rounded"
                                />
                                <Label>Enable Gas-Free Meta-Transactions</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>CPU Cores</Label>
                                    <Input 
                                        type="number" 
                                        value={editData.cpu_cores}
                                        onChange={(e) => setEditData({...editData, cpu_cores: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>RAM (GB)</Label>
                                    <Input 
                                        type="number" 
                                        value={editData.ram_gb}
                                        onChange={(e) => setEditData({...editData, ram_gb: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Storage (GB)</Label>
                                    <Input 
                                        type="number" 
                                        value={editData.storage_gb}
                                        onChange={(e) => setEditData({...editData, storage_gb: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>TX/Month</Label>
                                    <Input 
                                        type="number" 
                                        value={editData.transactions_per_month}
                                        onChange={(e) => setEditData({...editData, transactions_per_month: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setEditDialog(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleUpdate}
                                    disabled={updateMutation.isPending}
                                    className="flex-1"
                                >
                                    {updateMutation.isPending ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}