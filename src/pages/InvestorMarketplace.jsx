import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { ShoppingCart, TrendingUp, Shield, ExternalLink, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function InvestorMarketplace() {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [orderAmount, setOrderAmount] = useState('');
    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const queryClient = useQueryClient();

    const { data: investor } = useQuery({
        queryKey: ['current-investor'],
        queryFn: async () => {
            const session = localStorage.getItem('rwa_investor_session');
            if (!session) return null;
            return JSON.parse(session);
        }
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['marketplace-assets'],
        queryFn: () => base44.entities.RWAAsset.filter({ status: 'active' })
    });

    const createOrderMutation = useMutation({
        mutationFn: (orderData) => base44.entities.RWAOrder.create(orderData),
        onSuccess: () => {
            toast.success('Order placed successfully!');
            setShowOrderDialog(false);
            setOrderAmount('');
            queryClient.invalidateQueries(['marketplace-assets']);
            queryClient.invalidateQueries(['my-orders']);
        }
    });

    const handlePlaceOrder = () => {
        if (!orderAmount || parseFloat(orderAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const tokenAmount = parseFloat(orderAmount);
        const orderValue = (selectedAsset.current_value / selectedAsset.total_supply) * tokenAmount;

        createOrderMutation.mutate({
            asset_id: selectedAsset.asset_id,
            investor_id: investor.investor_id,
            order_type: 'buy',
            token_amount: tokenAmount,
            price_per_token: selectedAsset.current_value / selectedAsset.total_supply,
            total_value: orderValue,
            status: 'pending',
            order_date: new Date().toISOString()
        });
    };

    const getAssetTypeBadge = (type) => {
        const colors = {
            real_estate: 'bg-blue-100 text-blue-700',
            treasury_bill: 'bg-green-100 text-green-700',
            private_credit: 'bg-purple-100 text-purple-700',
            commodity: 'bg-yellow-100 text-yellow-700',
            equity: 'bg-red-100 text-red-700'
        };
        return colors[type] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar currentPage="InvestorMarketplace" />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Asset Marketplace</h1>
                        <p className="text-slate-600">Browse and invest in tokenized real-world assets</p>
                    </div>

                    {assets.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600">No assets available for investment</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.map((asset) => {
                                const pricePerToken = asset.current_value / asset.total_supply;
                                const expectedYield = asset.expected_return ? (asset.expected_return / 100) : 0;

                                return (
                                    <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                                                    <p className="text-sm text-slate-600">{asset.symbol}</p>
                                                </div>
                                                <Badge className={getAssetTypeBadge(asset.asset_type)}>
                                                    {asset.asset_type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Price per Token:</span>
                                                    <span className="font-semibold">${pricePerToken.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Total Value:</span>
                                                    <span className="font-semibold">${asset.current_value.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Available Tokens:</span>
                                                    <span className="font-semibold">{asset.total_supply.toLocaleString()}</span>
                                                </div>
                                                {expectedYield > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-600">Expected Yield:</span>
                                                        <span className="font-semibold text-green-600 flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            {(expectedYield * 100).toFixed(2)}%
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t">
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                                        <Shield className="h-3 w-3" />
                                                        {asset.accredited_only ? 'Accredited Investors Only' : 'Open to All'}
                                                    </div>
                                                    <Button 
                                                        className="w-full"
                                                        onClick={() => {
                                                            setSelectedAsset(asset);
                                                            setShowOrderDialog(true);
                                                        }}
                                                    >
                                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                                        Invest Now
                                                    </Button>
                                                    {asset.contract_address && (
                                                        <a
                                                            href={`https://polygonscan.com/address/${asset.contract_address}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 mt-2"
                                                        >
                                                            View on Polygonscan <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Place Buy Order</DialogTitle>
                    </DialogHeader>
                    {selectedAsset && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-600">Asset</p>
                                <p className="font-semibold">{selectedAsset.name} ({selectedAsset.symbol})</p>
                            </div>
                            <div>
                                <Label>Number of Tokens</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={orderAmount}
                                    onChange={(e) => setOrderAmount(e.target.value)}
                                />
                            </div>
                            {orderAmount && parseFloat(orderAmount) > 0 && (
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Price per Token:</span>
                                        <span className="font-semibold">
                                            ${(selectedAsset.current_value / selectedAsset.total_supply).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Tokens:</span>
                                        <span className="font-semibold">{parseFloat(orderAmount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                        <span>Total:</span>
                                        <span>
                                            ${((selectedAsset.current_value / selectedAsset.total_supply) * parseFloat(orderAmount)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <Button 
                                className="w-full" 
                                onClick={handlePlaceOrder}
                                disabled={createOrderMutation.isPending}
                            >
                                {createOrderMutation.isPending ? 'Processing...' : 'Place Order'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}