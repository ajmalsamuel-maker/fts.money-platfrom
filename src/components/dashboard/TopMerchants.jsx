import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TopMerchants({ merchants: merchantsData = [], transactions = [] }) {
    // Calculate merchant stats from real data
    const merchantStats = React.useMemo(() => {
        const stats = {};
        
        transactions.forEach(txn => {
            if (!txn.merchant_id) return;
            
            if (!stats[txn.merchant_id]) {
                stats[txn.merchant_id] = {
                    merchant_id: txn.merchant_id,
                    name: txn.merchant_name || 'Unknown Merchant',
                    volume: 0,
                    transactions: 0,
                    status: 'active'
                };
            }
            
            stats[txn.merchant_id].volume += txn.amount || 0;
            stats[txn.merchant_id].transactions += 1;
        });
        
        return Object.values(stats)
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5)
            .map(m => ({ ...m, change: Math.random() * 20 - 5 })); // Mock change % for now
    }, [transactions]);
    
    const merchants = merchantStats.length > 0 ? merchantStats : [
        { name: 'No merchant data', volume: 0, transactions: 0, change: 0, status: 'active' }
    ];
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">Top Merchants</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 h-7 text-xs">
                    View All
                    <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {merchants.map((merchant, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                                {idx + 1}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="font-medium text-slate-900 text-sm">{merchant.name}</p>
                                    {merchant.status === 'pending' && (
                                        <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">
                                    {merchant.transactions.toLocaleString()} txns
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-slate-900 text-sm">
                                ${merchant.volume.toLocaleString()}
                            </p>
                            <div className={cn(
                                "flex items-center justify-end gap-0.5 text-xs",
                                merchant.change >= 0 ? "text-emerald-600" : "text-red-600"
                            )}>
                                {merchant.change >= 0 ? (
                                    <TrendingUp className="h-2.5 w-2.5" />
                                ) : (
                                    <TrendingDown className="h-2.5 w-2.5" />
                                )}
                                {Math.abs(merchant.change)}%
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}