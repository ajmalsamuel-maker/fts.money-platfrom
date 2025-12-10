import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CryptoAnalyticsCard() {
    const { data: transactions = [] } = useQuery({
        queryKey: ['crypto-transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 1000),
    });

    const cryptoTransactions = transactions.filter(t => 
        t.crypto_asset || 
        t.payment_method === 'crypto_currency' || 
        t.payment_method === 'bitcoin' || 
        t.payment_method === 'bitcoin_cash'
    );

    const cryptoVolume = cryptoTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const cryptoCount = cryptoTransactions.length;
    
    // Group by crypto asset
    const assetDistribution = cryptoTransactions.reduce((acc, t) => {
        const asset = t.crypto_asset || 'BTC';
        acc[asset] = (acc[asset] || 0) + 1;
        return acc;
    }, {});

    const topAssets = Object.entries(assetDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Group by blockchain network
    const networkDistribution = cryptoTransactions.reduce((acc, t) => {
        const network = t.blockchain_network || 'Bitcoin';
        acc[network] = (acc[network] || 0) + 1;
        return acc;
    }, {});

    const avgCryptoTxn = cryptoCount > 0 ? cryptoVolume / cryptoCount : 0;

    return (
        <Card>
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="text-base flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-600" />
                    Crypto Transaction Analytics
                    <Badge variant="outline" className="ml-auto bg-amber-100 text-amber-700">
                        ISO 23257
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">Volume</p>
                            <p className="text-lg font-bold text-slate-900">${(cryptoVolume / 1000).toFixed(1)}K</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">Transactions</p>
                            <p className="text-lg font-bold text-slate-900">{cryptoCount}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">Avg Size</p>
                            <p className="text-lg font-bold text-slate-900">${avgCryptoTxn.toFixed(0)}</p>
                        </div>
                    </div>

                    {/* Top Crypto Assets */}
                    {topAssets.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-amber-600" />
                                Top Crypto Assets (ISO 23257)
                            </h4>
                            <div className="space-y-2">
                                {topAssets.map(([asset, count]) => {
                                    const percentage = (count / cryptoCount) * 100;
                                    return (
                                        <div key={asset} className="flex items-center gap-3">
                                            <div className="w-16 text-sm font-mono font-semibold text-slate-700">{asset}</div>
                                            <div className="flex-1">
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-16 text-right text-sm text-slate-600">
                                                {percentage.toFixed(1)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Blockchain Networks */}
                    {Object.keys(networkDistribution).length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-3">Blockchain Networks</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(networkDistribution).map(([network, count]) => (
                                    <Badge key={network} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        {network}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {cryptoCount === 0 && (
                        <div className="text-center py-6 text-slate-500">
                            <Coins className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No crypto transactions yet</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}