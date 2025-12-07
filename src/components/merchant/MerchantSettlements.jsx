import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function MerchantSettlements({ merchant, transactions }) {
    // Group transactions by settlement date (mock logic)
    const settledTransactions = transactions.filter(t => t.settlement_date);
    const pendingTransactions = transactions.filter(t => !t.settlement_date && t.status === 'approved');

    const totalSettled = settledTransactions.reduce((sum, t) => sum + (t.net_amount || t.amount || 0), 0);
    const totalPending = pendingTransactions.reduce((sum, t) => sum + (t.net_amount || t.amount || 0), 0);
    const totalFees = transactions.reduce((sum, t) => sum + (t.fee || 0), 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Settled</p>
                            <p className="text-2xl font-bold text-slate-900">${totalSettled.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 mt-1">{settledTransactions.length} transactions</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Pending Settlement</p>
                            <p className="text-2xl font-bold text-amber-600">${totalPending.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 mt-1">{pendingTransactions.length} transactions</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Fees</p>
                            <p className="text-2xl font-bold text-blue-600">${totalFees.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 mt-1">Processing costs</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Settlement History */}
            <Card>
                <CardHeader>
                    <CardTitle>Settlement History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {settledTransactions.slice(0, 10).map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">{txn.transaction_id}</p>
                                    <p className="text-sm text-slate-500">
                                        Settled: {txn.settlement_date ? format(new Date(txn.settlement_date), 'MMM dd, yyyy') : '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600">${(txn.net_amount || txn.amount || 0).toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">Fee: ${(txn.fee || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}