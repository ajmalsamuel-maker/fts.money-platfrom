import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, GitCommit } from 'lucide-react';

export default function RegressionComparison({ pspCode }) {
    const [baselineId, setBaselineId] = useState('');
    const [compareId, setCompareId] = useState('');

    const { data: testRuns = [] } = useQuery({
        queryKey: ['testRuns', pspCode],
        queryFn: async () => {
            if (!pspCode) return [];
            return await base44.entities.TestRun.filter({ psp_code: pspCode }, '-created_date');
        },
        enabled: !!pspCode
    });

    const baseline = testRuns.find(r => r.id === baselineId);
    const compare = testRuns.find(r => r.id === compareId);

    const calculateDelta = (baseline, current, metric) => {
        if (!baseline || !current) return null;
        const baseValue = baseline[metric];
        const currentValue = current[metric];
        if (!baseValue || !currentValue) return null;
        
        const delta = ((currentValue - baseValue) / baseValue) * 100;
        return delta;
    };

    const metrics = [
        { key: 'actual_tps', label: 'Actual TPS', better: 'higher' },
        { key: 'avg_latency', label: 'Avg Latency', better: 'lower' },
        { key: 'p95_latency', label: 'P95 Latency', better: 'lower' },
        { key: 'p99_latency', label: 'P99 Latency', better: 'lower' }
    ];

    const chartData = testRuns.slice(0, 10).reverse().map(run => ({
        name: new Date(run.created_date).toLocaleDateString(),
        tps: run.actual_tps,
        latency: run.avg_latency,
        successRate: parseFloat(run.success_rate) || 0
    }));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Select Test Runs to Compare</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-600 block mb-2">Baseline Run</label>
                            <Select value={baselineId} onValueChange={setBaselineId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select baseline" />
                                </SelectTrigger>
                                <SelectContent>
                                    {testRuns.map(run => (
                                        <SelectItem key={run.id} value={run.id}>
                                            {run.run_name} - {new Date(run.created_date).toLocaleDateString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-600 block mb-2">Compare With</label>
                            <Select value={compareId} onValueChange={setCompareId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent>
                                    {testRuns.map(run => (
                                        <SelectItem key={run.id} value={run.id}>
                                            {run.run_name} - {new Date(run.created_date).toLocaleDateString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {baseline && compare && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metrics.map(metric => {
                        const delta = calculateDelta(baseline, compare, metric.key);
                        if (delta === null) return null;
                        
                        const isImprovement = metric.better === 'higher' ? delta > 0 : delta < 0;
                        const isRegression = !isImprovement && Math.abs(delta) > 5;
                        
                        return (
                            <Card key={metric.key} className={isRegression ? 'border-red-300' : ''}>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-600">{metric.label}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold">{baseline[metric.key]}</span>
                                                <ArrowRight className="h-4 w-4 text-slate-400" />
                                                <span className="text-xl font-bold">{compare[metric.key]}</span>
                                            </div>
                                            <Badge variant={isImprovement ? 'default' : 'destructive'} className="flex items-center gap-1">
                                                {isImprovement ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {Math.abs(delta).toFixed(1)}%
                                            </Badge>
                                        </div>
                                        {isRegression && (
                                            <p className="text-xs text-red-600">⚠️ Performance regression detected</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Performance Trend (Last 10 Runs)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="tps" stroke="#3b82f6" name="TPS" />
                            <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#8b5cf6" name="Latency (ms)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}