import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { DollarSign, Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetIssuerDividends() {
    const { issuer, loading } = useAssetIssuerAuth();
    const queryClient = useQueryClient();
    const [showDistributeDialog, setShowDistributeDialog] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [amount, setAmount] = useState('');
    const [dividendType, setDividendType] = useState('cash');

    const { data: myAssets = [] } = useQuery({
        queryKey: ['my-assets', issuer?.issuer_id],
        queryFn: async () => {
            const issuers = await base44.entities.AssetIssuer.filter({ id: issuer.issuer_id });
            if (issuers.length === 0) return [];
            return base44.entities.RWAAsset.filter({ issuer_lei: issuers[0].lei });
        },
        enabled: !!issuer
    });

    const { data: dividends = [] } = useQuery({
        queryKey: ['dividends'],
        queryFn: () => base44.entities.RWADividend.list('-payment_date'),
        enabled: !!issuer
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['holdings'],
        queryFn: () => base44.entities.RWAHolding.list(),
        enabled: !!issuer
    });

    const distributeMutation = useMutation({
        mutationFn: async (dividendData) => {
            const asset = myAssets.find(a => a.asset_id === selectedAsset);
            const assetHoldings = holdings.filter(h => h.asset_id === selectedAsset);
            const totalAmount = parseFloat(amount);
            const totalTokens = assetHoldings.reduce((sum, h) => sum + h.token_amount, 0);
            
            // Create dividend record
            const dividend = await base44.entities.RWADividend.create({
                asset_id: selectedAsset,
                total_amount: totalAmount,
                per_token_amount: totalAmount / totalTokens,
                payment_date: new Date().toISOString(),
                dividend_type: dividendType,
                status: 'processing'
            });

            // In production, this would trigger blockchain transactions
            // For now, just mark as completed
            await base44.entities.RWADividend.update(dividend.id, { status: 'completed' });

            return dividend;
        },
        onSuccess: () => {
            toast.success('Dividend distributed successfully!');
            setShowDistributeDialog(false);
            setSelectedAsset('');
            setAmount('');
            queryClient.invalidateQueries(['dividends']);
        }
    });

    const handleDistribute = () => {
        if (!selectedAsset || !amount) {
            toast.error('Please fill all fields');
            return;
        }
        distributeMutation.mutate();
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const myAssetIds = myAssets.map(a => a.asset_id);
    const myDividends = dividends.filter(d => myAssetIds.includes(d.asset_id));

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerDividends"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Dividend Management</h1>
                            <p className="text-slate-600">Distribute returns to token holders</p>
                        </div>
                        <Button onClick={() => setShowDistributeDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Distribute Dividend
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Distributed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    ${myDividends.reduce((sum, d) => sum + (d.total_amount || 0), 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Distributions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{myDividends.length}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Last Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    {myDividends[0] ? new Date(myDividends[0].payment_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribution History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myDividends.length === 0 ? (
                                <div className="text-center py-12">
                                    <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">No dividends distributed yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myDividends.map((dividend) => {
                                        const asset = myAssets.find(a => a.asset_id === dividend.asset_id);
                                        return (
                                            <div key={dividend.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold">{asset?.name || 'Unknown Asset'}</h3>
                                                        <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(dividend.payment_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold">${dividend.total_amount.toLocaleString()}</p>
                                                        <p className="text-xs text-slate-500">${dividend.per_token_amount?.toFixed(4)} per token</p>
                                                        <Badge className={
                                                            dividend.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            dividend.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {dividend.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                            {dividend.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                                                            {dividend.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Distribute Dividend</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Select Asset</Label>
                            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an asset" />
                                </SelectTrigger>
                                <SelectContent>
                                    {myAssets.map(asset => (
                                        <SelectItem key={asset.asset_id} value={asset.asset_id}>
                                            {asset.name} ({asset.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Total Amount (USD)</Label>
                            <Input
                                type="number"
                                placeholder="Enter total dividend amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Dividend Type</Label>
                            <Select value={dividendType} onValueChange={setDividendType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="reinvest">Reinvestment</SelectItem>
                                    <SelectItem value="stablecoin">Stablecoin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedAsset && amount && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-900">
                                    This will distribute <strong>${parseFloat(amount).toLocaleString()}</strong> to all token holders of{' '}
                                    <strong>{myAssets.find(a => a.asset_id === selectedAsset)?.name}</strong>
                                </p>
                            </div>
                        )}

                        <Button 
                            className="w-full" 
                            onClick={handleDistribute}
                            disabled={distributeMutation.isPending}
                        >
                            {distributeMutation.isPending ? 'Processing...' : 'Distribute Dividend'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}