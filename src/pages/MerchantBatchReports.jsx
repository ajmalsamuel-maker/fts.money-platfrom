import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { FileText, Download, Calendar, DollarSign } from 'lucide-react';

export default function MerchantBatchReports() {
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

    // Group transactions by date for batch reports
    const batches = React.useMemo(() => {
        const grouped = {};
        transactions.forEach(txn => {
            const date = new Date(txn.created_date).toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = { date, transactions: [], totalAmount: 0, count: 0 };
            }
            grouped[date].transactions.push(txn);
            grouped[date].totalAmount += txn.amount || 0;
            grouped[date].count += 1;
        });
        return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions]);

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantBatchReports" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Batch Reports</h1>
                            <p className="text-slate-500">Daily transaction batch summaries</p>
                        </div>

                        <div className="grid gap-4">
                            {batches.length === 0 ? (
                                <Card><CardContent className="py-12 text-center text-slate-500">No batches found</CardContent></Card>
                            ) : (
                                batches.map((batch) => (
                                    <Card key={batch.date}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-5 w-5 text-slate-400" />
                                                    <div>
                                                        <CardTitle className="text-base">{new Date(batch.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                                                        <p className="text-sm text-slate-500">{batch.count} transactions</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-500">Batch Total</p>
                                                        <p className="text-xl font-bold">${batch.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Export
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500">Approved</p>
                                                    <p className="text-lg font-semibold text-green-600">
                                                        {batch.transactions.filter(t => t.status === 'approved').length}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Declined</p>
                                                    <p className="text-lg font-semibold text-red-600">
                                                        {batch.transactions.filter(t => t.status === 'declined').length}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Pending</p>
                                                    <p className="text-lg font-semibold text-amber-600">
                                                        {batch.transactions.filter(t => t.status === 'pending').length}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Success Rate</p>
                                                    <p className="text-lg font-semibold">
                                                        {batch.count > 0 ? ((batch.transactions.filter(t => t.status === 'approved').length / batch.count) * 100).toFixed(1) : 0}%
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}