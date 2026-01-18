import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, TrendingUp, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

export default function RealTimeMonitor({ testRunning, metrics = [] }) {
    const [liveData, setLiveData] = useState([]);
    const [currentMetrics, setCurrentMetrics] = useState({
        current_tps: 0,
        success_rate: 0,
        avg_latency: 0,
        total_transactions: 0,
        successful: 0,
        failed: 0
    });

    useEffect(() => {
        if (!testRunning) {
            setLiveData([]);
            return;
        }

        // Simulate real-time data stream (in production, use WebSocket)
        const interval = setInterval(() => {
            const timestamp = new Date().toLocaleTimeString();
            const tps = Math.floor(Math.random() * 20) + 80; // 80-100 TPS
            const successRate = Math.floor(Math.random() * 10) + 90; // 90-100%
            const latency = Math.floor(Math.random() * 50) + 100; // 100-150ms
            const errors = Math.floor(Math.random() * 5);

            const newDataPoint = {
                timestamp,
                tps,
                successRate,
                latency,
                errors
            };

            setLiveData(prev => {
                const updated = [...prev, newDataPoint];
                return updated.slice(-20); // Keep last 20 data points
            });

            setCurrentMetrics(prev => ({
                current_tps: tps,
                success_rate: successRate,
                avg_latency: latency,
                total_transactions: prev.total_transactions + tps,
                successful: prev.successful + Math.floor(tps * (successRate / 100)),
                failed: prev.failed + Math.floor(tps * ((100 - successRate) / 100))
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [testRunning]);

    if (!testRunning && liveData.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Live Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Current TPS</p>
                                <p className="text-2xl font-bold text-blue-600">{currentMetrics.current_tps}</p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Success Rate</p>
                                <p className="text-2xl font-bold text-green-600">{currentMetrics.success_rate}%</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Avg Latency</p>
                                <p className="text-2xl font-bold text-purple-600">{currentMetrics.avg_latency}ms</p>
                            </div>
                            <Clock className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Txns</p>
                                <p className="text-2xl font-bold text-slate-900">{currentMetrics.total_transactions}</p>
                            </div>
                            <Zap className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TPS Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Transactions Per Second (TPS)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={liveData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="tps" stroke="#3b82f6" fill="#93c5fd" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Success Rate & Latency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Success Rate %</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={liveData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Response Latency (ms)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={liveData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="latency" stroke="#8b5cf6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}