import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

export default function UsageAnalyticsTab() {
    const { data: metrics = [] } = useQuery({
        queryKey: ['api-usage-metrics'],
        queryFn: () => base44.entities.APIUsageMetric.list()
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: apis = [] } = useQuery({
        queryKey: ['api-definitions'],
        queryFn: () => base44.entities.APIDefinition.list()
    });

    // Group metrics by PSP
    const metricsByPSP = metrics.reduce((acc, metric) => {
        if (!acc[metric.psp_id]) {
            acc[metric.psp_id] = {
                total_calls: 0,
                total_cost: 0,
                success_rate: 0,
                avg_response_time: 0,
                throttled_calls: 0
            };
        }
        acc[metric.psp_id].total_calls += 1;
        acc[metric.psp_id].total_cost += metric.cost || 0;
        if (metric.response_status >= 200 && metric.response_status < 300) {
            acc[metric.psp_id].success_rate += 1;
        }
        acc[metric.psp_id].avg_response_time += metric.response_time_ms || 0;
        if (metric.throttled) {
            acc[metric.psp_id].throttled_calls += 1;
        }
        return acc;
    }, {});

    // Calculate averages
    Object.keys(metricsByPSP).forEach(pspId => {
        const data = metricsByPSP[pspId];
        data.success_rate = (data.success_rate / data.total_calls) * 100;
        data.avg_response_time = data.avg_response_time / data.total_calls;
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">API Usage Analytics</h3>
                <p className="text-sm text-slate-600">Per-PSP API usage tracking and monetization metrics</p>
            </div>

            {/* Platform Summary */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total API Calls</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{metrics.length}</p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-1">
                                    ${metrics.reduce((sum, m) => sum + (m.cost || 0), 0).toFixed(2)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Avg Response Time</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {metrics.length > 0 
                                        ? Math.round(metrics.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / metrics.length)
                                        : 0}ms
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-slate-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Throttled Calls</p>
                                <p className="text-3xl font-bold text-amber-600 mt-1">
                                    {metrics.filter(m => m.throttled).length}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Per-PSP Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage by PSP</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(metricsByPSP).map(([pspId, data]) => {
                            const psp = psps.find(p => p.id === pspId);
                            return (
                                <div key={pspId} className="p-4 border border-slate-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">{psp?.psp_name || 'Unknown PSP'}</h4>
                                        <Badge variant="outline">{psp?.psp_code}</Badge>
                                    </div>
                                    <div className="grid grid-cols-5 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-600">API Calls</p>
                                            <p className="font-semibold text-lg">{data.total_calls}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Revenue</p>
                                            <p className="font-semibold text-lg text-emerald-600">${data.total_cost.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Success Rate</p>
                                            <p className="font-semibold text-lg">{data.success_rate.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Avg Response</p>
                                            <p className="font-semibold text-lg">{Math.round(data.avg_response_time)}ms</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Throttled</p>
                                            <p className="font-semibold text-lg text-amber-600">{data.throttled_calls}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(metricsByPSP).length === 0 && (
                            <div className="text-center py-12">
                                <Activity className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600">No API usage data yet</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}