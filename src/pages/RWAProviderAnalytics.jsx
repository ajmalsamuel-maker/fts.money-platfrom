import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { BarChart3, TrendingUp, Users, Building2, DollarSign, Activity } from 'lucide-react';

export default function RWAProviderAnalytics() {
    const { provider } = useRWAProviderAuth();

    const { data: issuers = [] } = useQuery({
        queryKey: ['issuers', provider?.provider_code],
        queryFn: () => base44.entities.AssetIssuer.filter({ provider_code: provider.provider_code }),
        enabled: !!provider
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['assets', provider?.provider_code],
        queryFn: () => base44.entities.RWAAsset.filter({ issuer_lei: { $in: issuers.map(i => i.lei).filter(Boolean) } }),
        enabled: issuers.length > 0
    });

    const { data: investors = [] } = useQuery({
        queryKey: ['investors'],
        queryFn: () => base44.entities.RWAInvestor.list(),
        enabled: !!provider
    });

    const activeIssuers = issuers.filter(i => i.status === 'active').length;
    const totalAUM = assets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const avgAssetValue = assets.length > 0 ? totalAUM / assets.length : 0;

    const assetTypeDistribution = assets.reduce((acc, asset) => {
        acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-slate-50">
            <RWAProviderSidebar 
                currentPage="RWAProviderAnalytics"
                providerName={provider?.company_name}
                providerEmail={provider?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Analytics</h1>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Active Issuers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">{activeIssuers}</div>
                                    <Building2 className="h-8 w-8 text-blue-500" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">of {issuers.length} total</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total AUM</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">${(totalAUM / 1000000).toFixed(1)}M</div>
                                    <DollarSign className="h-8 w-8 text-green-500" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{assets.length} assets</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Avg Asset Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">${(avgAssetValue / 1000000).toFixed(2)}M</div>
                                    <TrendingUp className="h-8 w-8 text-purple-500" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">per asset</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Asset Type Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(assetTypeDistribution).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(assetTypeDistribution).map(([type, count]) => (
                                            <div key={type} className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600 capitalize">{type.replace('_', ' ')}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500" 
                                                            style={{ width: `${(count / assets.length) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">No assets yet</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Issuer Status Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {['active', 'pending_kyb', 'suspended', 'terminated'].map(status => {
                                        const count = issuers.filter(i => i.status === status).length;
                                        return (
                                            <div key={status} className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600 capitalize">{status.replace('_', ' ')}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${
                                                                status === 'active' ? 'bg-green-500' :
                                                                status === 'pending_kyb' ? 'bg-yellow-500' :
                                                                status === 'suspended' ? 'bg-orange-500' :
                                                                'bg-red-500'
                                                            }`}
                                                            style={{ width: `${issuers.length > 0 ? (count / issuers.length) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}