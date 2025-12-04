import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';

const generateData = (period) => {
    const data = [];
    const points = period === '24h' ? 24 : period === '7d' ? 7 : period === '30d' ? 30 : 12;
    
    for (let i = 0; i < points; i++) {
        const base = 100000 + Math.random() * 150000;
        data.push({
            label: period === '24h' 
                ? `${i}:00` 
                : period === '7d' 
                    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7]
                    : period === '30d'
                        ? `Day ${i + 1}`
                        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            volume: Math.round(base),
            transactions: Math.round(base / 50),
            approved: Math.round((base / 50) * 0.95),
            declined: Math.round((base / 50) * 0.05),
        });
    }
    return data;
};

export default function VolumeChart() {
    const [period, setPeriod] = useState('7d');
    const [chartType, setChartType] = useState('area');
    const data = generateData(period);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                    <p className="font-medium text-slate-900">{label}</p>
                    <p className="text-sm text-blue-600">
                        Volume: ${payload[0].value.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">
                        Transactions: {payload[0].payload.transactions.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-semibold">Transaction Volume</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        Total: ${data.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={chartType} onValueChange={setChartType}>
                        <TabsList className="h-8">
                            <TabsTrigger value="area" className="text-xs px-3 h-6">Area</TabsTrigger>
                            <TabsTrigger value="bar" className="text-xs px-3 h-6">Bar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Tabs value={period} onValueChange={setPeriod}>
                        <TabsList className="h-8">
                            <TabsTrigger value="24h" className="text-xs px-3 h-6">24h</TabsTrigger>
                            <TabsTrigger value="7d" className="text-xs px-3 h-6">7d</TabsTrigger>
                            <TabsTrigger value="30d" className="text-xs px-3 h-6">30d</TabsTrigger>
                            <TabsTrigger value="12m" className="text-xs px-3 h-6">12m</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'area' ? (
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#volumeGradient)"
                                />
                            </AreaChart>
                        ) : (
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="volume" 
                                    fill="#3b82f6" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}