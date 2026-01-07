import React, { useState } from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Plus, Edit, TrendingUp, Activity } from 'lucide-react';

export default function RWAPlatformAssets() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [editingAsset, setEditingAsset] = useState(null);
    const [creatingAsset, setCreatingAsset] = useState(false);
    const [viewingMetrics, setViewingMetrics] = useState(null);
    const [newAsset, setNewAsset] = useState({
        name: '',
        symbol: '',
        asset_type: 'real_estate',
        total_value: 0,
        total_supply: 0,
        description: '',
        issuer_lei: '',
        status: 'pending'
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['all-rwa-assets'],
        queryFn: () => base44.entities.RWAAsset.list('-created_date')
    });

    const { data: issuers = [] } = useQuery({
        queryKey: ['all-issuers'],
        queryFn: () => base44.entities.AssetIssuer.list()
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['all-orders'],
        queryFn: () => base44.entities.RWAOrder.list('-created_date', 500)
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.RWAAsset.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-rwa-assets']);
            setCreatingAsset(false);
            setNewAsset({
                name: '',
                symbol: '',
                asset_type: 'real_estate',
                total_value: 0,
                total_supply: 0,
                description: '',
                issuer_lei: '',
                status: 'pending'
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await base44.entities.RWAAsset.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-rwa-assets']);
            setEditingAsset(null);
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="RWAPlatformAssets" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Tokenized Assets</h2>
                        <p className="text-xs text-slate-600">Manage all tokenized assets across the RWA platform</p>
                    </div>
                    <Button onClick={() => setCreatingAsset(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Asset
                    </Button>
                </header>

                <div className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map(asset => {
                            const assetOrders = orders.filter(o => o.asset_id === asset.asset_id);
                            const totalVolume = assetOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
                            
                            return (
                                <Card key={asset.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{asset.name}</CardTitle>
                                                <p className="text-sm text-slate-600">{asset.symbol}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={
                                                    asset.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }>
                                                    {asset.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Type:</span>
                                            <span className="font-medium capitalize">{asset.asset_type?.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Total Value:</span>
                                            <span className="font-medium">${(asset.total_value / 1000000).toFixed(2)}M</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Supply:</span>
                                            <span className="font-medium">{asset.total_supply?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Trading Volume:</span>
                                            <span className="font-medium">${(totalVolume / 1000).toFixed(0)}K</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Orders:</span>
                                            <span className="font-medium">{assetOrders.length}</span>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingAsset(asset)}>
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewingMetrics(asset)}>
                                                <Activity className="h-3 w-3 mr-1" />
                                                Metrics
                                            </Button>
                                        </div>
                                        {asset.contract_address && (
                                            <a 
                                                href={`https://polygonscan.com/address/${asset.contract_address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                            >
                                                View on Polygonscan
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {assets.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                No tokenized assets yet. Click "Create Asset" to start.
                            </div>
                        )}
                    </div>

                    {/* Create Asset Dialog */}
                    <Dialog open={creatingAsset} onOpenChange={setCreatingAsset}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Asset</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Asset Name *</Label>
                                        <Input
                                            placeholder="e.g., Manhattan Office Building"
                                            value={newAsset.name}
                                            onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Symbol *</Label>
                                        <Input
                                            placeholder="e.g., MNHTN-01"
                                            value={newAsset.symbol}
                                            onChange={(e) => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Asset Type *</Label>
                                    <Select value={newAsset.asset_type} onValueChange={(value) => setNewAsset({...newAsset, asset_type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="real_estate">Real Estate</SelectItem>
                                            <SelectItem value="commodities">Commodities</SelectItem>
                                            <SelectItem value="art">Art</SelectItem>
                                            <SelectItem value="private_equity">Private Equity</SelectItem>
                                            <SelectItem value="bonds">Bonds</SelectItem>
                                            <SelectItem value="carbon_credits">Carbon Credits</SelectItem>
                                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="Describe the asset..."
                                        value={newAsset.description}
                                        onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Total Value (USD) *</Label>
                                        <Input
                                            type="number"
                                            placeholder="10000000"
                                            value={newAsset.total_value}
                                            onChange={(e) => setNewAsset({...newAsset, total_value: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Total Supply (Tokens) *</Label>
                                        <Input
                                            type="number"
                                            placeholder="1000000"
                                            value={newAsset.total_supply}
                                            onChange={(e) => setNewAsset({...newAsset, total_supply: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Issuer LEI</Label>
                                    <Select value={newAsset.issuer_lei} onValueChange={(value) => setNewAsset({...newAsset, issuer_lei: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select issuer..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {issuers.filter(i => i.lei).map(issuer => (
                                                <SelectItem key={issuer.id} value={issuer.lei}>
                                                    {issuer.company_name} ({issuer.lei})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select value={newAsset.status} onValueChange={(value) => setNewAsset({...newAsset, status: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button 
                                    onClick={() => createMutation.mutate(newAsset)}
                                    className="w-full"
                                    disabled={!newAsset.name || !newAsset.symbol || createMutation.isPending}
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Asset'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Asset Dialog */}
                    {editingAsset && (
                        <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Edit Asset: {editingAsset.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Asset Name</Label>
                                            <Input
                                                value={editingAsset.name}
                                                onChange={(e) => setEditingAsset({...editingAsset, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Symbol</Label>
                                            <Input
                                                value={editingAsset.symbol}
                                                onChange={(e) => setEditingAsset({...editingAsset, symbol: e.target.value.toUpperCase()})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Asset Type</Label>
                                        <Select value={editingAsset.asset_type} onValueChange={(value) => setEditingAsset({...editingAsset, asset_type: value})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="real_estate">Real Estate</SelectItem>
                                                <SelectItem value="commodities">Commodities</SelectItem>
                                                <SelectItem value="art">Art</SelectItem>
                                                <SelectItem value="private_equity">Private Equity</SelectItem>
                                                <SelectItem value="bonds">Bonds</SelectItem>
                                                <SelectItem value="carbon_credits">Carbon Credits</SelectItem>
                                                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={editingAsset.description || ''}
                                            onChange={(e) => setEditingAsset({...editingAsset, description: e.target.value})}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Total Value (USD)</Label>
                                            <Input
                                                type="number"
                                                value={editingAsset.total_value}
                                                onChange={(e) => setEditingAsset({...editingAsset, total_value: parseFloat(e.target.value) || 0})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Total Supply (Tokens)</Label>
                                            <Input
                                                type="number"
                                                value={editingAsset.total_supply}
                                                onChange={(e) => setEditingAsset({...editingAsset, total_supply: parseFloat(e.target.value) || 0})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select value={editingAsset.status} onValueChange={(value) => setEditingAsset({...editingAsset, status: value})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button 
                                        onClick={() => updateMutation.mutate({ id: editingAsset.id, data: editingAsset })}
                                        className="w-full"
                                        disabled={updateMutation.isPending}
                                    >
                                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Asset Metrics Dialog */}
                    {viewingMetrics && (
                        <Dialog open={!!viewingMetrics} onOpenChange={() => setViewingMetrics(null)}>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Performance Metrics: {viewingMetrics.name}
                                    </DialogTitle>
                                </DialogHeader>
                                <Tabs defaultValue="overview">
                                    <TabsList>
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="trading">Trading Activity</TabsTrigger>
                                        <TabsTrigger value="holders">Token Holders</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <p className="text-sm text-slate-600">Token Price</p>
                                                    <p className="text-2xl font-bold">
                                                        ${(viewingMetrics.total_value / viewingMetrics.total_supply).toFixed(2)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <p className="text-sm text-slate-600">Market Cap</p>
                                                    <p className="text-2xl font-bold">${(viewingMetrics.total_value / 1000000).toFixed(2)}M</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <p className="text-sm text-slate-600">Total Supply</p>
                                                    <p className="text-2xl font-bold">{viewingMetrics.total_supply?.toLocaleString()}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Asset Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Asset Type:</span>
                                                    <span className="font-medium capitalize">{viewingMetrics.asset_type?.replace('_', ' ')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Status:</span>
                                                    <Badge className={viewingMetrics.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                        {viewingMetrics.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Issuer LEI:</span>
                                                    <span className="font-mono text-xs">{viewingMetrics.issuer_lei || 'N/A'}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="trading" className="space-y-4">
                                        {(() => {
                                            const assetOrders = orders.filter(o => o.asset_id === viewingMetrics.asset_id);
                                            const totalVolume = assetOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
                                            const avgOrderSize = assetOrders.length > 0 ? totalVolume / assetOrders.length : 0;
                                            
                                            return (
                                                <>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <Card>
                                                            <CardContent className="pt-6">
                                                                <p className="text-sm text-slate-600">Total Orders</p>
                                                                <p className="text-2xl font-bold">{assetOrders.length}</p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card>
                                                            <CardContent className="pt-6">
                                                                <p className="text-sm text-slate-600">Trading Volume</p>
                                                                <p className="text-2xl font-bold">${(totalVolume / 1000).toFixed(0)}K</p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card>
                                                            <CardContent className="pt-6">
                                                                <p className="text-sm text-slate-600">Avg Order Size</p>
                                                                <p className="text-2xl font-bold">${(avgOrderSize / 1000).toFixed(1)}K</p>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="text-base">Recent Orders</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {assetOrders.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {assetOrders.slice(0, 5).map(order => (
                                                                        <div key={order.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                                                            <span className="text-slate-600">{new Date(order.created_date).toLocaleDateString()}</span>
                                                                            <span className="font-medium">{order.quantity} tokens</span>
                                                                            <span className="font-semibold">${(order.total_amount / 1000).toFixed(1)}K</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-center text-slate-500 py-4">No trading activity yet</p>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </>
                                            );
                                        })()}
                                    </TabsContent>
                                    <TabsContent value="holders">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <p className="text-center text-slate-500">Token holder data will be displayed here</p>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </div>
    );
}