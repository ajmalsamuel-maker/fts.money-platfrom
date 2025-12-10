import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { FileText, Download, Calendar } from 'lucide-react';

export default function MerchantStatementReport() {
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

    const { data: settlements = [] } = useQuery({
        queryKey: ['settlements', user?.merchant_id],
        queryFn: async () => await base44.entities.Settlement.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    // Generate monthly statements
    const statements = React.useMemo(() => {
        const months = {};
        transactions.forEach(txn => {
            const date = new Date(txn.created_date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!months[key]) {
                months[key] = {
                    month: key,
                    transactions: 0,
                    volume: 0,
                    fees: 0,
                    netAmount: 0
                };
            }
            months[key].transactions += 1;
            months[key].volume += txn.amount || 0;
            months[key].fees += txn.fee || 0;
            months[key].netAmount += (txn.net_amount || txn.amount) || 0;
        });
        return Object.values(months).sort((a, b) => b.month.localeCompare(a.month));
    }, [transactions]);

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantStatementReport" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Monthly Statements</h1>
                            <p className="text-slate-500">Download your monthly transaction statements</p>
                        </div>

                        <div className="grid gap-4">
                            {statements.length === 0 ? (
                                <Card><CardContent className="py-12 text-center text-slate-500">No statements available</CardContent></Card>
                            ) : (
                                statements.map((statement) => (
                                    <Card key={statement.month}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <FileText className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            {new Date(statement.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">{statement.transactions} transactions</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-500">Gross Volume</p>
                                                        <p className="text-lg font-semibold">${statement.volume.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-500">Fees</p>
                                                        <p className="text-lg font-semibold text-red-600">-${statement.fees.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-500">Net Amount</p>
                                                        <p className="text-lg font-semibold text-green-600">${statement.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                    </div>
                                                    <Button variant="outline">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
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