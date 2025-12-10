import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PerformanceComparison({ transactions = [] }) {
    const comparison = React.useMemo(() => {
        const now = new Date();
        const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const thisWeek = transactions.filter(t => new Date(t.created_date) >= thisWeekStart);
        const lastWeek = transactions.filter(t => 
            new Date(t.created_date) >= lastWeekStart && 
            new Date(t.created_date) < thisWeekStart
        );

        const thisWeekAmount = thisWeek.reduce((sum, t) => sum + (t.amount || 0), 0);
        const lastWeekAmount = lastWeek.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const volumeChange = lastWeekAmount > 0 
            ? ((thisWeekAmount - lastWeekAmount) / lastWeekAmount * 100).toFixed(1)
            : 0;

        const countChange = lastWeek.length > 0
            ? ((thisWeek.length - lastWeek.length) / lastWeek.length * 100).toFixed(1)
            : 0;

        return {
            thisWeek: { volume: thisWeekAmount, count: thisWeek.length },
            lastWeek: { volume: lastWeekAmount, count: lastWeek.length },
            volumeChange: parseFloat(volumeChange),
            countChange: parseFloat(countChange)
        };
    }, [transactions]);

    const getTrendIcon = (change) => {
        if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    const getTrendColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-slate-600';
    };

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-base">Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Weekly Volume</span>
                            <div className="flex items-center gap-2">
                                {getTrendIcon(comparison.volumeChange)}
                                <span className={`text-sm font-bold ${getTrendColor(comparison.volumeChange)}`}>
                                    {comparison.volumeChange > 0 ? '+' : ''}{comparison.volumeChange}%
                                </span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">${comparison.thisWeek.volume.toLocaleString()}</span>
                            <span className="text-sm text-slate-500">vs ${comparison.lastWeek.volume.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Transaction Count</span>
                            <div className="flex items-center gap-2">
                                {getTrendIcon(comparison.countChange)}
                                <span className={`text-sm font-bold ${getTrendColor(comparison.countChange)}`}>
                                    {comparison.countChange > 0 ? '+' : ''}{comparison.countChange}%
                                </span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{comparison.thisWeek.count}</span>
                            <span className="text-sm text-slate-500">vs {comparison.lastWeek.count}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}