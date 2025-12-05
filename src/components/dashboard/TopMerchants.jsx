import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const merchants = [
    { name: 'TechCorp Ltd', volume: 458320, transactions: 2341, change: 12.5, status: 'active' },
    { name: 'Global Retail Inc', volume: 325100, transactions: 1892, change: 8.3, status: 'active' },
    { name: 'Digital Services', volume: 289450, transactions: 1654, change: -2.1, status: 'active' },
    { name: 'E-Commerce Plus', volume: 234800, transactions: 1423, change: 15.7, status: 'active' },
    { name: 'PaySmart Solutions', volume: 198650, transactions: 1187, change: 5.2, status: 'pending' },
];

export default function TopMerchants() {
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