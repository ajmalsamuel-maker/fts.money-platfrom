import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { createPageUrl } from '@/utils';
import { Plus, Coins, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function AssetIssuerDashboard() {
    const { issuer, loading } = useAssetIssuerAuth();

    const { data: myAssets = [] } = useQuery({
        queryKey: ['my-assets', issuer?.issuer_id],
        queryFn: async () => {
            const issuers = await base44.entities.AssetIssuer.filter({ id: issuer.issuer_id });
            if (issuers.length === 0) return [];
            return base44.entities.RWAAsset.filter({ issuer_lei: issuers[0].lei });
        },
        enabled: !!issuer
    });

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const totalValue = myAssets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const totalInvestors = myAssets.reduce((sum, a) => sum + (a.investor_type?.length || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerDashboard"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                            <p className="text-slate-600">Welcome back, {issuer?.company_name}</p>
                        </div>
                        <Button onClick={() => window.location.href = createPageUrl('AssetIssuerTokenize')} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tokenize New Asset
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Coins className="h-4 w-4" />
                                    My Assets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{myAssets.length}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {myAssets.filter(a => a.status === 'active').length} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Total Value
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${(totalValue / 1000000).toFixed(1)}M</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Investors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{totalInvestors}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Avg Yield
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">6.5%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* My Assets */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Tokenized Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myAssets.length === 0 ? (
                                <div className="text-center py-12">
                                    <Coins className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600 mb-4">No assets tokenized yet</p>
                                    <Button onClick={() => window.location.href = createPageUrl('AssetIssuerTokenize')}>
                                        Tokenize Your First Asset
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myAssets.map(asset => (
                                        <div key={asset.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{asset.name}</h3>
                                                    <p className="text-sm text-slate-600">{asset.symbol}</p>
                                                    <Badge className="mt-2" variant="outline">{asset.asset_type}</Badge>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold">${(asset.total_value / 1000000).toFixed(2)}M</p>
                                                    <p className="text-xs text-slate-500">{asset.total_supply} tokens</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}