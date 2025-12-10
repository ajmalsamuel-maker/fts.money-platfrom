import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { AlertTriangle, Download, TrendingUp, Clock, XCircle, CheckCircle2 } from 'lucide-react';

export default function MerchantChargebackReport() {
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

    const { data: chargebacks = [] } = useQuery({
        queryKey: ['chargebacks', user?.merchant_id],
        queryFn: async () => await base44.entities.Chargeback.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const stats = React.useMemo(() => ({
        total: chargebacks.length,
        open: chargebacks.filter(c => c.status === 'received' || c.status === 'pending_response').length,
        won: chargebacks.filter(c => c.status === 'won').length,
        lost: chargebacks.filter(c => c.status === 'lost').length,
        totalAmount: chargebacks.reduce((sum, c) => sum + (c.amount || 0), 0)
    }), [chargebacks]);

    const getStatusConfig = (status) => {
        const configs = {
            received: { label: 'Received', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
            pending_response: { label: 'Pending', icon: Clock, className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            won: { label: 'Won', icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
            lost: { label: 'Lost', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
        };
        return configs[status] || configs.received;
    };

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantChargebackReport" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Chargeback Report</h1>
                            <p className="text-slate-500">Monitor and manage chargebacks</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Total Chargebacks</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Open Cases</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{stats.open}</div></CardContent></Card>
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Won</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.won}</div></CardContent></Card>
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Lost</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.lost}</div></CardContent></Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Chargeback Cases</CardTitle>
                                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {chargebacks.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No chargebacks</p>
                                    ) : (
                                        chargebacks.map((cb) => {
                                            const statusConfig = getStatusConfig(cb.status);
                                            const StatusIcon = statusConfig.icon;
                                            return (
                                                <div key={cb.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">Case #{cb.chargeback_id || cb.id.slice(-8)}</p>
                                                            <p className="text-sm text-slate-500">
                                                                {cb.reason_category} • {new Date(cb.chargeback_date || cb.created_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold">${cb.amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                        <Badge variant="outline" className={statusConfig.className}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })
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