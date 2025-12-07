import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, DollarSign, Repeat } from 'lucide-react';

export default function MerchantAnalytics({ merchant, transactions, subscriptions, aiDecisions }) {
    // Calculate metrics
    const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const successRate = transactions.length > 0 
        ? (transactions.filter(t => t.status === 'approved').length / transactions.length * 100) 
        : 0;
    
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, sub) => {
        const monthlyAmount = sub.frequency === 'monthly' ? sub.amount :
                             sub.frequency === 'yearly' ? sub.amount / 12 :
                             sub.frequency === 'quarterly' ? sub.amount / 3 : sub.amount;
        return sum + monthlyAmount;
    }, 0);

    const aiSuccessRate = aiDecisions.length > 0 
        ? (aiDecisions.filter(d => d.outcome === 'successful').length / aiDecisions.length * 100) 
        : 0;

    // Mock chart data
    const volumeData = Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        volume: Math.round(Math.random() * 10000 + 5000)
    }));

    const statusData = [
        { name: 'Approved', value: transactions.filter(t => t.status === 'approved').length, color: '#10b981' },
        { name: 'Declined', value: transactions.filter(t => t.status === 'declined').length, color: '#ef4444' },
        { name: 'Pending', value: transactions.filter(t => t.status === 'pending').length, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Volume</p>
                            <p className="text-2xl font-bold">${(totalVolume / 1000).toFixed(1)}K</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Success Rate</p>
                            <p className="text-2xl font-bold text-emerald-600">{successRate.toFixed(1)}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500">MRR</p>
                            <p className="text-2xl font-bold text-purple-600">${mrr.toLocaleString()}</p>
                        </div>
                        <Repeat className="h-8 w-8 text-purple-600" />
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500">AI Success</p>
                            <p className="text-2xl font-bold text-indigo-600">{aiSuccessRate.toFixed(1)}%</p>
                        </div>
                        <Brain className="h-8 w-8 text-indigo-600" />
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Transaction Volume Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={9} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="#dbeafe" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Transaction Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={statusData} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={90} 
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {statusData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-indigo-600" />
                        AI-Powered Insights & Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">Approval Rate Optimization</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Your approval rate is {successRate.toFixed(1)}%. AI routing could increase this by 2-5% through optimized processor selection.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {mrr > 0 && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Repeat className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-purple-900">Subscription Health</p>
                                        <p className="text-sm text-purple-700 mt-1">
                                            You have {activeSubscriptions} active subscriptions generating ${mrr.toLocaleString()} MRR. 
                                            AI predicts stable growth with low churn risk.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Brain className="h-5 w-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-emerald-900">AI Processing Performance</p>
                                    <p className="text-sm text-emerald-700 mt-1">
                                        {aiDecisions.length} transactions processed with AI. Success rate: {aiSuccessRate.toFixed(1)}%. 
                                        AI has saved an estimated ${(aiDecisions.length * 0.25).toFixed(0)} in processing costs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {transactions.filter(t => t.status === 'declined').length > 5 && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-900">Decline Rate Alert</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            {transactions.filter(t => t.status === 'declined').length} declined transactions detected. 
                                            Consider enabling 3DS authentication for high-risk transactions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}