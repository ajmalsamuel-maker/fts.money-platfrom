import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { DollarSign, Download, Calendar, TrendingUp } from 'lucide-react';

export default function MerchantSettlementReports() {
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

    const { data: settlements = [] } = useQuery({
        queryKey: ['settlements', user?.merchant_id],
        queryFn: async () => await base44.entities.Settlement.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const summary = React.useMemo(() => {
        const completed = settlements.filter(s => s.status === 'completed');
        const pending = settlements.filter(s => s.status === 'pending');
        return {
            totalCompleted: completed.reduce((sum, s) => sum + (s.net_amount || 0), 0),
            totalPending: pending.reduce((sum, s) => sum + (s.net_amount || 0), 0),
            completedCount: completed.length,
            pendingCount: pending.length
        };
    }, [settlements]);

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantSettlementReports" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Settlement Reports</h1>
                            <p className="text-slate-500">View your payment settlements and payouts</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader><CardTitle className="text-sm text-slate-500">Total Settled</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">${summary.totalCompleted.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                    <p className="text-sm text-slate-500 mt-1">{summary.completedCount} settlements</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-sm text-slate-500">Pending Settlement</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-600">${summary.totalPending.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                    <p className="text-sm text-slate-500 mt-1">{summary.pendingCount} pending</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Settlement History</CardTitle>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {settlements.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No settlements yet</p>
                                    ) : (
                                        settlements.map((settlement) => (
                                            <div key={settlement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <DollarSign className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">Settlement #{settlement.settlement_id || settlement.id.slice(-8)}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {new Date(settlement.created_date).toLocaleDateString()} • {settlement.transaction_count} transactions
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold">${settlement.net_amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                    <Badge variant={settlement.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                                                        {settlement.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}