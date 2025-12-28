import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Users, Building2, DollarSign, Activity, Zap, Target, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: () => base44.entities.RWAOrder.list('-created_date', 500),
        enabled: !!provider
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['holdings'],
        queryFn: () => base44.entities.RWAHolding.list(),
        enabled: !!provider
    });

    const activeIssuers = issuers.filter(i => i.status === 'active').length;
    const totalAUM = assets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const avgAssetValue = assets.length > 0 ? totalAUM / assets.length : 0;

    const assetTypeDistribution = assets.reduce((acc, asset) => {
        acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1;
        return acc;
    }, {});

    // Transaction volume over time (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
    });

    const transactionVolumeData = last30Days.map(date => {
        const dayOrders = orders.filter(o => o.created_date?.startsWith(date));
        return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            volume: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / 1000000,
            count: dayOrders.length
        };
    });

    // Investor behavior insights
    const investorsByIssuer = holdings.reduce((acc, h) => {
        const asset = assets.find(a => a.asset_id === h.asset_id);
        if (asset) {
            acc[asset.issuer_lei] = (acc[asset.issuer_lei] || 0) + 1;
        }
        return acc;
    }, {});

    const avgInvestmentSize = orders.length > 0 
        ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length 
        : 0;

    // Predictive analytics - asset performance trends
    const assetPerformance = assets.map(asset => {
        const assetOrders = orders.filter(o => o.asset_id === asset.asset_id);
        const recentOrders = assetOrders.filter(o => {
            const orderDate = new Date(o.created_date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate > weekAgo;
        });
        
        const momentum = recentOrders.length > 0 ? 'High' : assetOrders.length > 0 ? 'Moderate' : 'Low';
        const totalVolume = assetOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        
        return {
            asset_id: asset.asset_id,
            name: asset.name,
            momentum,
            totalVolume,
            orderCount: assetOrders.length,
            avgOrderSize: assetOrders.length > 0 ? totalVolume / assetOrders.length : 0,
            predicted_growth: momentum === 'High' ? '+15%' : momentum === 'Moderate' ? '+8%' : '+2%'
        };
    }).sort((a, b) => b.totalVolume - a.totalVolume).slice(0, 5);

    // Peer comparison for issuers
    const issuerMetrics = issuers.map(issuer => {
        const issuerAssets = assets.filter(a => a.issuer_lei === issuer.lei);
        const issuerAUM = issuerAssets.reduce((sum, a) => sum + (a.total_value || 0), 0);
        const issuerOrders = orders.filter(o => {
            const asset = assets.find(a => a.asset_id === o.asset_id);
            return asset?.issuer_lei === issuer.lei;
        });
        
        return {
            name: issuer.company_name,
            aum: issuerAUM / 1000000,
            assets: issuerAssets.length,
            investors: investorsByIssuer[issuer.lei] || 0,
            orders: issuerOrders.length,
            efficiency: issuerAssets.length > 0 ? (issuerAUM / issuerAssets.length / 1000000).toFixed(1) : 0
        };
    }).sort((a, b) => b.aum - a.aum);

    return (
        <div className="flex h-screen bg-slate-50">
            <RWAProviderSidebar 
                currentPage="RWAProviderAnalytics"
                providerName={provider?.company_name}
                providerEmail={provider?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Advanced Analytics</h1>
                            <p className="text-slate-600">Predictive insights and performance metrics</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-6">
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

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Avg Investment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">${(avgInvestmentSize / 1000).toFixed(0)}K</div>
                                    <Zap className="h-8 w-8 text-amber-500" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{orders.length} orders</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="performance" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="performance">Predictive Analytics</TabsTrigger>
                            <TabsTrigger value="transactions">Transaction Volume</TabsTrigger>
                            <TabsTrigger value="issuers">Issuer Comparison</TabsTrigger>
                            <TabsTrigger value="investors">Investor Behavior</TabsTrigger>
                        </TabsList>

                        <TabsContent value="performance" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Top Performing Assets - Predictive Growth
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {assetPerformance.length > 0 ? (
                                        <div className="space-y-3">
                                            {assetPerformance.map(asset => (
                                                <div key={asset.asset_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{asset.name}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <Badge className={
                                                                asset.momentum === 'High' ? 'bg-green-100 text-green-700' :
                                                                asset.momentum === 'Moderate' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {asset.momentum} Momentum
                                                            </Badge>
                                                            <span className="text-xs text-slate-500">{asset.orderCount} orders</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-slate-600">${(asset.totalVolume / 1000000).toFixed(2)}M volume</p>
                                                        <p className="text-lg font-bold text-green-600">{asset.predicted_growth}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-500 py-8">No performance data yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="transactions" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Transaction Volume - Last 30 Days
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={transactionVolumeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} name="Volume ($M)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Order Frequency
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={transactionVolumeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#10b981" name="Orders" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="issuers" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Issuer Performance Comparison
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {issuerMetrics.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3 text-sm font-semibold text-slate-700">Issuer</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-slate-700">AUM</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Assets</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Investors</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Orders</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Efficiency</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {issuerMetrics.map((issuer, index) => (
                                                        <tr key={index} className="border-b hover:bg-slate-50">
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                                                                    <span className="font-medium text-slate-900">{issuer.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-right font-medium">${issuer.aum.toFixed(1)}M</td>
                                                            <td className="p-3 text-right">{issuer.assets}</td>
                                                            <td className="p-3 text-right">{issuer.investors}</td>
                                                            <td className="p-3 text-right">{issuer.orders}</td>
                                                            <td className="p-3 text-right">
                                                                <Badge className="bg-blue-100 text-blue-700">
                                                                    ${issuer.efficiency}M/asset
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-500 py-8">No issuer data yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="investors" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Investor Distribution by Issuer
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {Object.entries(investorsByIssuer).map(([lei, count]) => {
                                                const issuer = issuers.find(i => i.lei === lei);
                                                return (
                                                    <div key={lei} className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-600">{issuer?.company_name || 'Unknown'}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-purple-500" 
                                                                    style={{ width: `${(count / holdings.length) * 100}%` }}
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

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Investor Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm text-slate-700">Total Active Investors</span>
                                            <span className="text-2xl font-bold text-blue-600">{investors.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm text-slate-700">Verified (KYC)</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                {investors.filter(i => i.kyc_status === 'verified').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                            <span className="text-sm text-slate-700">Avg Portfolio Size</span>
                                            <span className="text-2xl font-bold text-purple-600">
                                                {holdings.length > 0 ? Math.round(holdings.length / investors.length) : 0}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">

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