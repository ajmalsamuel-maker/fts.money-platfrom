import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Link2, Zap, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function BlockchainConnectors() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const queryClient = useQueryClient();

    const { data: connectors = [] } = useQuery({
        queryKey: ['blockchainConnectors'],
        queryFn: () => base44.entities.BlockchainConnector.list('-created_date'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.BlockchainConnector.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['blockchainConnectors']);
            setDialogOpen(false);
            toast.success('Blockchain connector created');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            connector_id: `bc_${Date.now()}`,
            status: 'active'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="BlockchainConnectors" />
            
            <div className={cn("transition-all duration-300 lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Blockchain Connectors</h1>
                            <p className="text-slate-500">Direct blockchain network integrations</p>
                        </div>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Connector
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connectors.map((connector) => (
                            <Card key={connector.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{connector.connector_name}</CardTitle>
                                        {connector.status === 'active' ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Network</span>
                                            <Badge>{connector.blockchain_network}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Type</span>
                                            <span className="text-sm">{connector.connection_type}</span>
                                        </div>
                                        {connector.api_provider && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-500">Provider</span>
                                                <span className="text-sm font-medium">{connector.api_provider}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Success Rate</span>
                                            <span className="text-sm font-medium text-emerald-600">
                                                {connector.success_rate || 100}%
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add Blockchain Connector</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Connector Name *</Label>
                                    <Input
                                        value={formData.connector_name || ''}
                                        onChange={(e) => setFormData({...formData, connector_name: e.target.value})}
                                        placeholder="e.g., Ethereum Mainnet"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Blockchain Network *</Label>
                                    <Select 
                                        value={formData.blockchain_network} 
                                        onValueChange={(val) => setFormData({...formData, blockchain_network: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ethereum">Ethereum</SelectItem>
                                            <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                            <SelectItem value="polygon">Polygon</SelectItem>
                                            <SelectItem value="binance_smart_chain">Binance Smart Chain</SelectItem>
                                            <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                            <SelectItem value="optimism">Optimism</SelectItem>
                                            <SelectItem value="avalanche">Avalanche</SelectItem>
                                            <SelectItem value="solana">Solana</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Connection Type *</Label>
                                    <Select 
                                        value={formData.connection_type} 
                                        onValueChange={(val) => setFormData({...formData, connection_type: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="api_provider">API Provider</SelectItem>
                                            <SelectItem value="self_hosted_node">Self-Hosted Node</SelectItem>
                                            <SelectItem value="exchange_api">Exchange API</SelectItem>
                                            <SelectItem value="custodian">Custodian</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.connection_type === 'api_provider' && (
                                    <div className="space-y-2">
                                        <Label>API Provider</Label>
                                        <Select 
                                            value={formData.api_provider} 
                                            onValueChange={(val) => setFormData({...formData, api_provider: val})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select provider" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="alchemy">Alchemy</SelectItem>
                                                <SelectItem value="infura">Infura</SelectItem>
                                                <SelectItem value="quicknode">QuickNode</SelectItem>
                                                <SelectItem value="ankr">Ankr</SelectItem>
                                                <SelectItem value="moralis">Moralis</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>RPC Endpoint URL</Label>
                                    <Input
                                        value={formData.rpc_endpoint || ''}
                                        onChange={(e) => setFormData({...formData, rpc_endpoint: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Hot Wallet Address (Optional)</Label>
                                    <Input
                                        value={formData.hot_wallet_address || ''}
                                        onChange={(e) => setFormData({...formData, hot_wallet_address: e.target.value})}
                                        placeholder="0x..."
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create Connector</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}