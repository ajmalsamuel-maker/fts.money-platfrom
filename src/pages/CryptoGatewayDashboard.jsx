import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FTS_COLORS } from '@/components/community/FTSBrandColors';
import { 
    Wallet, TrendingUp, Users, Activity, Bitcoin, 
    ArrowUpRight, ArrowDownRight, Zap, AlertCircle,
    CheckCircle2, DollarSign, Globe, Shield, CreditCard,
    Clock, TrendingDown, ArrowRight, ExternalLink
} from 'lucide-react';

export default function CryptoGatewayDashboard() {
    const [session, setSession] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    if (!session) return null;

    // Mock data - replace with real API calls
    const stats = {
        totalVolume: 4250000,
        totalTransactions: 12453,
        activeWallets: 847,
        avgTransactionValue: 341.23,
        monthlyRevenue: 42500,
        activeUsers: 1234,
        kycPending: 23,
        systemUptime: 99.98,
        apiCallsToday: 48392,
        volumeGrowth: 12.5,
        userGrowth: 5.1,
        revenueGrowth: 18.3
    };

    const recentActivity = [
        { id: 1, type: 'deposit', asset: 'BTC', amount: 0.5, usd: 21500, time: '2 min ago', status: 'completed', user: 'john@example.com' },
        { id: 2, type: 'withdrawal', asset: 'ETH', amount: 12.4, usd: 29800, time: '5 min ago', status: 'pending', user: 'jane@example.com' },
        { id: 3, type: 'exchange', asset: 'USDC', amount: 50000, usd: 50000, time: '12 min ago', status: 'completed', user: 'bob@example.com' },
        { id: 4, type: 'deposit', asset: 'BTC', amount: 1.2, usd: 51600, time: '18 min ago', status: 'completed', user: 'alice@example.com' },
        { id: 5, type: 'withdrawal', asset: 'USDT', amount: 15000, usd: 15000, time: '25 min ago', status: 'completed', user: 'charlie@example.com' }
    ];

    const alerts = [
        { id: 1, type: 'warning', message: 'KYC verification pending for 23 users', time: '1 hour ago' },
        { id: 2, type: 'info', message: 'Monthly volume limit at 85%', time: '3 hours ago' },
        { id: 3, type: 'success', message: 'New wallet integration completed', time: '5 hours ago' }
    ];

    const topAssets = [
        { asset: 'BTC', volume: 1250000, transactions: 342, change: 12.5 },
        { asset: 'ETH', volume: 980000, transactions: 521, change: 8.2 },
        { asset: 'USDT', volume: 1520000, transactions: 4231, change: 15.1 },
        { asset: 'USDC', volume: 500000, transactions: 2359, change: -3.2 }
    ];

    const complianceStatus = [
        { item: 'KYC Completion Rate', status: 'good', value: '94%' },
        { item: 'AML Screening', status: 'good', value: 'Up to date' },
        { item: 'Travel Rule Compliance', status: 'good', value: 'Active' },
        { item: 'Transaction Monitoring', status: 'warning', value: '3 Flagged' }
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoGatewayDashboard" userEmail={session.user.email} />
            
            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome back, {session.user.company_name || session.user.email}</p>
                </div>

                <div className="space-y-6">
                    {/* Alerts Banner */}
                    {alerts.length > 0 && (
                        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-amber-900 mb-2">Action Required</h3>
                                        <div className="space-y-1">
                                            {alerts.slice(0, 2).map(alert => (
                                                <p key={alert.id} className="text-sm text-amber-800">
                                                    • {alert.message}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
                                        View All
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Primary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-100">Total Volume (24h)</p>
                                                <p className="text-3xl font-bold mt-1">
                                                    ${stats.totalVolume.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-blue-100 mt-1">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    <span>+{stats.volumeGrowth}% from yesterday</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                <DollarSign className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Monthly Revenue</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    ${stats.monthlyRevenue.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    <span>+{stats.revenueGrowth}% from last month</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Active Users</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    {stats.activeUsers.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    <span>+{stats.userGrowth}% this week</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">System Uptime</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    {stats.systemUptime}%
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>All systems operational</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <Activity className="h-6 w-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>

                                {/* Secondary Metrics Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Activity className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600">Transactions (24h)</p>
                                                    <p className="text-xl font-bold text-slate-900">{stats.totalTransactions.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                                    <Clock className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600">KYC Pending</p>
                                                    <p className="text-xl font-bold text-slate-900">{stats.kycPending}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/CryptoUsers'}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                    <Globe className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600">API Calls (24h)</p>
                                                    <p className="text-xl font-bold text-slate-900">{stats.apiCallsToday.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Activity */}
                                <Card className="bg-white border-slate-200">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Recent Activity</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => window.location.href = '/CryptoTransactions'}>
                                            View All <ExternalLink className="ml-2 h-3 w-3" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {recentActivity.slice(0, 5).map((activity) => (
                                                <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                                            activity.type === 'deposit' ? 'bg-green-100' :
                                                            activity.type === 'withdrawal' ? 'bg-red-100' :
                                                            'bg-blue-100'
                                                        }`}>
                                                            {activity.type === 'deposit' ? <ArrowDownRight className="w-4 h-4 text-green-600" /> :
                                                             activity.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4 text-red-600" /> :
                                                             <Zap className="w-4 h-4 text-blue-600" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm capitalize">{activity.type}</div>
                                                            <div className="text-xs text-slate-500">{activity.user}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-sm">
                                                            {activity.amount} {activity.asset}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            ${activity.usd.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top Assets by Volume */}
                                <Card className="bg-white border-slate-200">
                                    <CardHeader>
                                        <CardTitle>Top Assets by Volume</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {topAssets.map((asset, idx) => (
                                                <div key={idx}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                                                                {asset.asset}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{asset.asset}</p>
                                                                <p className="text-xs text-slate-500">{asset.transactions} transactions</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-sm">${(asset.volume / 1000).toFixed(0)}K</p>
                                                            <div className={`flex items-center justify-end gap-1 text-xs ${asset.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {asset.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                                <span>{Math.abs(asset.change)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Progress value={(asset.volume / 1520000) * 100} className="h-1.5" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Compliance Status */}
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        Compliance Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {complianceStatus.map((item, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {item.status === 'good' ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                                    )}
                                                    <Badge variant={item.status === 'good' ? 'default' : 'secondary'} className={item.status === 'good' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                                                        {item.value}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">{item.item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-4 gap-4">
                                        <button 
                                            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
                                            onClick={() => window.location.href = '/CryptoWallets'}
                                        >
                                            <Wallet className="w-8 h-8 mb-2 text-blue-400" />
                                            <h3 className="font-semibold mb-1">Wallets</h3>
                                            <p className="text-xs text-slate-300">Manage wallets</p>
                                        </button>

                                        <button 
                                            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
                                            onClick={() => window.location.href = '/CryptoIBANs'}
                                        >
                                            <CreditCard className="w-8 h-8 mb-2 text-cyan-400" />
                                            <h3 className="font-semibold mb-1">IBANs</h3>
                                            <p className="text-xs text-slate-300">Virtual accounts</p>
                                        </button>

                                        <button 
                                            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
                                            onClick={() => window.location.href = '/CryptoCards'}
                                        >
                                            <CreditCard className="w-8 h-8 mb-2 text-purple-400" />
                                            <h3 className="font-semibold mb-1">Cards</h3>
                                            <p className="text-xs text-slate-300">Issue cards</p>
                                        </button>

                                        <button 
                                            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
                                            onClick={() => window.location.href = '/CryptoUsers'}
                                        >
                                            <Users className="w-8 h-8 mb-2 text-amber-400" />
                                            <h3 className="font-semibold mb-1">KYC</h3>
                                            <p className="text-xs text-slate-300">Verify users</p>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                            </div>
                        </div>
            </div>
        </div>
    );
}