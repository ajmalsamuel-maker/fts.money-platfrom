import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';

export default function OverrideAnalytics() {
    const { data: flags = [] } = useQuery({
        queryKey: ['all-review-flags'],
        queryFn: () => base44.entities.AIReviewFlag.list('-created_date', 200),
    });

    const resolvedFlags = flags.filter(f => f.status === 'resolved');
    
    // Calculate statistics
    const stats = {
        total: resolvedFlags.length,
        approved: resolvedFlags.filter(f => f.review_decision === 'approved').length,
        rejected: resolvedFlags.filter(f => f.review_decision === 'rejected').length,
        modified: resolvedFlags.filter(f => f.review_decision === 'modified').length,
        avgReviewTime: resolvedFlags.reduce((acc, f) => acc + (f.review_duration_seconds || 0), 0) / resolvedFlags.length || 0
    };

    // Group by override reasons
    const reasonCounts = {};
    resolvedFlags.forEach(flag => {
        const reason = flag.override_reason || 'Unspecified';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const topReasons = Object.entries(reasonCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Group by flag reasons
    const flagReasonCounts = {};
    resolvedFlags.forEach(flag => {
        const reason = flag.flag_reason || 'unknown';
        flagReasonCounts[reason] = (flagReasonCounts[reason] || 0) + 1;
    });

    const approvalRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Override Pattern Analytics
                </h3>
                <p className="text-sm text-slate-500">
                    Identify trends and improve AI accuracy
                </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-600">Total Reviews</p>
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-600">Approval Rate</p>
                        {parseFloat(approvalRate) > 70 ? 
                            <TrendingUp className="h-4 w-4 text-emerald-600" /> :
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        }
                    </div>
                    <p className="text-2xl font-bold">{approvalRate}%</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-600">Modified</p>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.modified}</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-600">Avg Review Time</p>
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold">{Math.round(stats.avgReviewTime)}s</p>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h4 className="font-semibold mb-4">Top Override Reasons</h4>
                    <div className="space-y-3">
                        {topReasons.map(([reason, count]) => (
                            <div key={reason}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">{reason}</span>
                                    <Badge variant="outline">{count}</Badge>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h4 className="font-semibold mb-4">Flag Reason Distribution</h4>
                    <div className="space-y-3">
                        {Object.entries(flagReasonCounts).map(([reason, count]) => (
                            <div key={reason} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{reason.replace(/_/g, ' ')}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 bg-slate-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${(count / stats.total) * 100}%` }}
                                        />
                                    </div>
                                    <Badge variant="outline">{count}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card className="p-6 bg-blue-50 border-blue-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Insights & Recommendations
                </h4>
                <ul className="space-y-2 text-sm">
                    {approvalRate < 60 && (
                        <li className="text-red-700">
                            • Low approval rate detected - AI confidence threshold may need adjustment
                        </li>
                    )}
                    {stats.modified > stats.total * 0.3 && (
                        <li className="text-amber-700">
                            • High modification rate suggests AI decision boundaries need refinement
                        </li>
                    )}
                    {stats.avgReviewTime > 120 && (
                        <li className="text-amber-700">
                            • Average review time is high - consider improving decision context presentation
                        </li>
                    )}
                    {approvalRate > 80 && (
                        <li className="text-emerald-700">
                            • High approval rate indicates AI is performing well
                        </li>
                    )}
                </ul>
            </Card>
        </div>
    );
}