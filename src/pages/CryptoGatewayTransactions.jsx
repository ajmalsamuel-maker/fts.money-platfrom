import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Search, TrendingUp, DollarSign, Bitcoin } from 'lucide-react';

export default function CryptoGatewayTransactions() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ['crypto-transactions'],
        queryFn: async () => {
            const txns = await base44.asServiceRole.entities.Transaction.filter({
                payment_method: { $in: ['bitcoin', 'bitcoin_cash', 'circle_usd_coin', 'crypto_currency'] }
            }, '-created_date', 100);
            return txns || [];
        }
    });

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen">
                <FTSPlatformSidebarRestructured currentPage="CryptoGatewayTransactions" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-slate-500">Loading transactions...</div>
                </div>
            </div>
        );
    }

    const stats = {
        total: transactions.length,
        volume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        approved: transactions.filter(t => t.status === 'approved').length,
        pending: transactions.filter(t => t.status === 'pending').length
    };

    const filteredTransactions = transactions.filter(t => 
        t.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.crypto_address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="CryptoGatewayTransactions"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Crypto Transactions</h1>
                        <p className="text-slate-600 mt-1">All crypto banking transactions across customers</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Transactions</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Volume</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">
                                            ${(stats.volume / 1000000).toFixed(2)}M
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Approved</p>
                                        <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                                    </div>
                                    <Bitcoin className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by transaction ID or crypto address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Transactions List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredTransactions.slice(0, 50).map((txn) => (
                                    <div key={txn.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-semibold text-slate-900">
                                                        {txn.transaction_id}
                                                    </span>
                                                    <Badge variant={
                                                        txn.status === 'approved' ? 'default' :
                                                        txn.status === 'pending' ? 'secondary' : 'destructive'
                                                    }>
                                                        {txn.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span>{txn.crypto_asset || txn.payment_method}</span>
                                                    {txn.crypto_address && (
                                                        <span className="font-mono">
                                                            {txn.crypto_address.substring(0, 16)}...
                                                        </span>
                                                    )}
                                                    <span>{new Date(txn.created_date).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900">
                                                    ${txn.amount?.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-500">{txn.type}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        No transactions found
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}