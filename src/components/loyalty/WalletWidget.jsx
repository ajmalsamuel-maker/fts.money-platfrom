import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wallet, Copy, ExternalLink, Coins, TrendingUp, TrendingDown, RefreshCw, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletWidget({ programId, participantId }) {
    const [refreshing, setRefreshing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch token balances
    const { data: balances, isLoading, refetch } = useQuery({
        queryKey: ['tokenBalances', programId, participantId],
        queryFn: async () => {
            const results = await base44.entities.TokenBalance.filter({ 
                program_id: programId,
                participant_id: participantId 
            });
            return results;
        },
        enabled: !!programId && !!participantId
    });

    // Fetch token details
    const { data: tokens } = useQuery({
        queryKey: ['loyaltyTokens', programId],
        queryFn: async () => {
            const results = await base44.entities.LoyaltyToken.filter({ program_id: programId });
            return results;
        },
        enabled: !!programId
    });

    // Fetch transaction history
    const { data: transactions = [] } = useQuery({
        queryKey: ['tokenTransactions', programId, participantId],
        queryFn: async () => {
            const results = await base44.entities.TokenTransaction.filter({
                program_id: programId,
                participant_id: participantId
            });
            return results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        },
        enabled: !!programId && !!participantId && showHistory
    });

    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
        toast.success('Wallet address copied!');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
        toast.success('Balance refreshed');
    };

    const getTransactionIcon = (type) => {
        if (type === 'earn' || type === 'bonus' || type === 'mint') return <ArrowUp className="h-4 w-4 text-green-600" />;
        if (type === 'redeem' || type === 'burn') return <ArrowDown className="h-4 w-4 text-red-600" />;
        return <Activity className="h-4 w-4 text-blue-600" />;
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!balances || balances.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Blockchain Wallet</CardTitle>
                    </div>
                    <CardDescription>Your on-chain token balance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Wallet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-4">No wallet provisioned yet</p>
                        <p className="text-sm text-gray-400">
                            Earn your first points to activate your blockchain wallet
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const balance = balances[0];
    const token = tokens?.find(t => t.id === balance.token_id);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Blockchain Wallet</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            {showHistory ? 'Hide History' : 'View History'}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
                {token?.is_blockchain_enabled && (
                    <Badge variant="secondary" className="w-fit">
                        <Coins className="w-3 h-3 mr-1" />
                        On-Chain
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Balance Display */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
                    <div className="text-sm text-gray-600 mb-1">Available Balance</div>
                    <div className="text-4xl font-bold text-indigo-900 mb-2">
                        {balance.available_balance?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                        {token?.token_symbol || 'Tokens'}
                    </div>
                    {token?.conversion_rate_to_usd && (
                        <div className="text-xs text-gray-500 mt-2">
                            ≈ ${((balance.available_balance || 0) * token.conversion_rate_to_usd).toFixed(2)} USD
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-600">Earned</span>
                        </div>
                        <div className="text-2xl font-semibold text-green-900">
                            {balance.lifetime_earned?.toLocaleString() || 0}
                        </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-orange-600" />
                            <span className="text-xs text-gray-600">Spent</span>
                        </div>
                        <div className="text-2xl font-semibold text-orange-900">
                            {balance.lifetime_spent?.toLocaleString() || 0}
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                {showHistory && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Transaction History
                        </h4>
                        {transactions.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No transactions yet</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {transactions.slice(0, 20).map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            {getTransactionIcon(tx.transaction_type)}
                                            <div>
                                                <p className="text-sm font-medium">{tx.description || tx.transaction_type}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(tx.created_date).toLocaleDateString()} {new Date(tx.created_date).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Balance: {tx.balance_after.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Wallet Address */}
                {balance.wallet_address && (
                    <div className="border-t pt-4">
                        <div className="text-sm text-gray-600 mb-2">Wallet Address</div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                            <code className="text-xs flex-1 truncate text-gray-700">
                                {balance.wallet_address}
                            </code>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => handleCopyAddress(balance.wallet_address)}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            {token?.contract_address && (
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => window.open(
                                        `https://explorer.polygon.technology/address/${balance.wallet_address}`,
                                        '_blank'
                                    )}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Pending Balance */}
                {balance.pending_balance > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-yellow-800">
                            Pending: {balance.pending_balance} tokens
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                            Awaiting verification
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}