import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function MerchantMonitorTools() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions', user?.merchant_id],
        queryFn: async () => await base44.entities.Transaction.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const realtimeStats = React.useMemo(() => {
        const now = new Date();
        const last5min = new Date(now.getTime() - 5 * 60 * 1000);
        const last1hour = new Date(now.getTime() - 60 * 60 * 1000);

        const recent5min = transactions.filter(t => new Date(t.created_date) >= last5min);
        const recent1hour = transactions.filter(t => new Date(t.created_date) >= last1hour);

        return {
            tps: (recent5min.length / 300).toFixed(2),
            last5minCount: recent5min.length,
            last5minVolume: recent5min.reduce((sum, t) => sum + (t.amount || 0), 0),
            last1hourCount: recent1hour.length,
            last1hourVolume: recent1hour.reduce((sum, t) => sum + (t.amount || 0), 0),
            successRate: recent1hour.length > 0 
                ? ((recent1hour.filter(t => t.status === 'approved').length / recent1hour.length) * 100).toFixed(1)
                : 0
        };
    }, [transactions]);

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantMonitorTools" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Real-Time Monitoring</h1>
                            <p className="text-slate-500">Monitor your transaction performance in real-time</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Transactions Per Second
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{realtimeStats.tps}</div>
                                    <p className="text-xs text-slate-500 mt-1">Last 5 minutes average</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Last Hour Volume
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">${realtimeStats.last1hourVolume.toLocaleString()}</div>
                                    <p className="text-xs text-slate-500 mt-1">{realtimeStats.last1hourCount} transactions</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Success Rate
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{realtimeStats.successRate}%</div>
                                    <p className="text-xs text-slate-500 mt-1">Last hour</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>System Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-semibold">Payment Processing</p>
                                                <p className="text-sm text-slate-500">All systems operational</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-semibold">Settlement Engine</p>
                                                <p className="text-sm text-slate-500">Operating normally</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-semibold">API Services</p>
                                                <p className="text-sm text-slate-500">Responding normally</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}