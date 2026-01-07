import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Users, Building2, DollarSign, Activity } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function RWAPlatformAnalytics() {
    const { platformUser, loading } = usePlatformAuth();

    const { data: issuers = [] } = useQuery({
        queryKey: ['all-issuers'],
        queryFn: () => base44.entities.AssetIssuer.list()
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['all-assets'],
        queryFn: () => base44.entities.RWAAsset.list()
    });

    const { data: investors = [] } = useQuery({
        queryKey: ['all-investors'],
        queryFn: () => base44.entities.RWAInvestor.list()
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['all-orders'],
        queryFn: () => base44.entities.RWAOrder.list('-created_date', 500)
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

    const activeIssuers = issuers.filter(i => i.status === 'active').length;
    const totalAUM = assets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const avgAssetValue = assets.length > 0 ? totalAUM / assets.length : 0;

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

    const avgInvestmentSize = orders.length > 0 
        ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length 
        : 0;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="RWAPlatformAnalytics" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">RWA Platform Analytics</h2>
                        <p className="text-xs text-slate-600">Performance metrics across all RWA providers</p>
                    </div>
                </header>

                <div className="p-6">
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
                                <CardTitle className="text-sm font-medium text-slate-600">Total Investors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">{investors.length}</div>
                                    <Users className="h-8 w-8 text-cyan-500" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">verified users</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
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
                    </div>
                </div>
            </div>
        </div>
    );
}