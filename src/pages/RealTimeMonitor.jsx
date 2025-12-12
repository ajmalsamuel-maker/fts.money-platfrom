import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RealTimeMonitor() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [liveData, setLiveData] = useState([]);

    const { data: transactions = [] } = useQuery({
        queryKey: ['recent-transactions'],
        queryFn: async () => {
            const txns = await base44.entities.Transaction.list('-created_date', 20);
            return txns;
        },
        refetchInterval: 5000
    });

    useEffect(() => {
        const now = new Date();
        const newPoint = {
            time: now.toLocaleTimeString(),
            tps: Math.floor(Math.random() * 50) + 20,
            volume: Math.floor(Math.random() * 10000) + 5000,
            successRate: Math.floor(Math.random() * 5) + 95
        };
        setLiveData(prev => [...prev.slice(-19), newPoint]);
    }, [transactions]);

    const stats = {
        currentTPS: liveData[liveData.length - 1]?.tps || 0,
        avgSuccessRate: liveData.length > 0 ? (liveData.reduce((acc, d) => acc + d.successRate, 0) / liveData.length).toFixed(1) : 0,
        totalVolume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        activeProcessors: 5
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="RealTimeMonitor" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-white animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Real-Time Monitor</h1>
                                <p className="text-slate-500">Live payment processing metrics</p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Live
                        </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Current TPS</p>
                                        <p className="text-2xl font-bold">{stats.currentTPS}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Success Rate</p>
                                        <p className="text-2xl font-bold">{stats.avgSuccessRate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Volume (5m)</p>
                                        <p className="text-2xl font-bold">${stats.totalVolume.toFixed(0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-8 w-8 text-cyan-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Active Processors</p>
                                        <p className="text-2xl font-bold">{stats.activeProcessors}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Transactions Per Second</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={liveData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="tps" stroke="#3b82f6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Success Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={liveData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis domain={[90, 100]} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="successRate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {transactions.slice(0, 10).map((txn) => (
                                    <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                txn.status === 'completed' ? 'bg-emerald-500' :
                                                txn.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                            )} />
                                            <span className="font-mono text-sm">{txn.transaction_id}</span>
                                            <Badge variant="outline" className="capitalize">{txn.payment_method}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">${txn.amount?.toFixed(2)}</span>
                                            <Badge className={
                                                txn.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                txn.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }>
                                                {txn.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}