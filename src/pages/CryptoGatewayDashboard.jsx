import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FTS_COLORS, FTS_LOGOS } from '@/components/community/FTSBrandColors';
import StrigaDisclaimer from '@/components/crypto/StrigaDisclaimer';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { 
    Wallet, TrendingUp, Users, Activity, Bitcoin, 
    ArrowUpRight, ArrowDownRight, Zap, AlertCircle,
    CheckCircle2, DollarSign, Globe, Shield, CreditCard,
    Clock, TrendingDown, ArrowRight, ExternalLink, LogOut,
    BarChart3, PieChart, Calendar, ArrowLeftRight, Menu
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CryptoGatewayDashboard() {
    const { t } = useI18n();
    const [timeRange, setTimeRange] = useState('7d');
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // Transaction volume data over time
    const getVolumeData = () => {
        if (timeRange === '24h') {
            return Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                volume: Math.floor(Math.random() * 50000) + 10000,
                transactions: Math.floor(Math.random() * 500) + 100
            }));
        } else if (timeRange === '7d') {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
                time: day,
                volume: Math.floor(Math.random() * 300000) + 100000,
                transactions: Math.floor(Math.random() * 3000) + 1000
            }));
        } else {
            return Array.from({ length: 30 }, (_, i) => ({
                time: `Day ${i + 1}`,
                volume: Math.floor(Math.random() * 400000) + 100000,
                transactions: Math.floor(Math.random() * 4000) + 1000
            }));
        }
    };

    // Asset breakdown data
    const assetBreakdown = [
        { name: 'BTC', volume: 1250000, percentage: 29.4, color: '#F7931A' },
        { name: 'ETH', volume: 980000, percentage: 23.1, color: '#627EEA' },
        { name: 'USDC', volume: 1520000, percentage: 35.8, color: '#2775CA' },
        { name: 'USDT', volume: 500000, percentage: 11.7, color: '#26A17B' }
    ];

    // KYC status distribution
    const kycStatusData = [
        { status: 'Approved', count: 1170, color: '#10b981' },
        { status: 'Pending', count: 23, color: '#f59e0b' },
        { status: 'Rejected', count: 7, color: '#ef4444' },
        { status: 'Not Started', count: 34, color: '#94a3b8' }
    ];

    // Wallet creation trends
    const walletTrends = [
        { date: 'Week 1', wallets: 45 },
        { date: 'Week 2', wallets: 67 },
        { date: 'Week 3', wallets: 89 },
        { date: 'Week 4', wallets: 123 },
        { date: 'Week 5', wallets: 156 },
        { date: 'Week 6', wallets: 198 },
        { date: 'Week 7', wallets: 234 },
        { date: 'Week 8', wallets: 289 }
    ];

    // On-ramp and off-ramp volumes
    const rampVolumes = [
        { month: 'Jan', onRamp: 450000, offRamp: 320000 },
        { month: 'Feb', onRamp: 520000, offRamp: 380000 },
        { month: 'Mar', onRamp: 680000, offRamp: 420000 },
        { month: 'Apr', onRamp: 750000, offRamp: 510000 },
        { month: 'May', onRamp: 890000, offRamp: 640000 },
        { month: 'Jun', onRamp: 1020000, offRamp: 720000 }
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Top Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <img src={FTS_LOGOS.primary} alt="FTS.Money" className="h-8" />
                </div>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher variant="select" showLabel={true} />
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">FTS Admin</p>
                        <p className="text-xs text-slate-500">{t('crypto:dashboard.cryptoBanking')}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                
                <div className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    <CryptoGatewaySidebar 
                        currentPage="CryptoGatewayDashboard" 
                        userEmail="FTS Admin"
                        onClose={() => setSidebarOpen(false)}
                    />
                </div>
                
                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Striga Crypto Banking Platform</h1>
                        <p className="text-slate-600 mt-1">Monitor and manage your whitelabel crypto banking infrastructure</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

                            {/* Analytics Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-slate-900">Advanced Analytics</h2>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={timeRange === '24h' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setTimeRange('24h')}
                                        >
                                            24h
                                        </Button>
                                        <Button
                                            variant={timeRange === '7d' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setTimeRange('7d')}
                                        >
                                            7d
                                        </Button>
                                        <Button
                                            variant={timeRange === '30d' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setTimeRange('30d')}
                                        >
                                            30d
                                        </Button>
                                    </div>
                                </div>

                                {/* Transaction Volume Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                            Transaction Volume
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={getVolumeData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis yAxisId="left" />
                                                <YAxis yAxisId="right" orientation="right" />
                                                <Tooltip />
                                                <Legend />
                                                <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} name="Volume ($)" />
                                                <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#06b6d4" strokeWidth={2} name="Transactions" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Asset Breakdown */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <PieChart className="h-5 w-5 text-purple-600" />
                                                Asset Volume Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <RePieChart>
                                                    <Pie
                                                        data={assetBreakdown}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percentage }) => `${name} ${percentage}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="volume"
                                                    >
                                                        {assetBreakdown.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                                </RePieChart>
                                            </ResponsiveContainer>
                                            <div className="mt-4 space-y-2">
                                                {assetBreakdown.map((asset) => (
                                                    <div key={asset.name} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                                                            <span className="text-sm font-medium">{asset.name}</span>
                                                        </div>
                                                        <span className="text-sm text-slate-600">${(asset.volume / 1000).toFixed(0)}K</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* KYC Status Distribution */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-green-600" />
                                                KYC Status Distribution
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <RePieChart>
                                                    <Pie
                                                        data={kycStatusData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ status, count }) => `${status}: ${count}`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {kycStatusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </RePieChart>
                                            </ResponsiveContainer>
                                            <div className="mt-4 space-y-2">
                                                {kycStatusData.map((status) => (
                                                    <div key={status.status} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                                                            <span className="text-sm font-medium">{status.status}</span>
                                                        </div>
                                                        <span className="text-sm text-slate-600">{status.count} users</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Wallet Creation Trends */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-cyan-600" />
                                            Wallet Creation Trends
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={walletTrends}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="wallets" fill="#06b6d4" name="New Wallets" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* On-Ramp / Off-Ramp Volumes */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowLeftRight className="h-5 w-5 text-amber-600" />
                                            On-Ramp vs Off-Ramp Volumes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={rampVolumes}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                                <Legend />
                                                <Bar dataKey="onRamp" fill="#10b981" name="On-Ramp (Fiat → Crypto)" />
                                                <Bar dataKey="offRamp" fill="#ef4444" name="Off-Ramp (Crypto → Fiat)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <div className="text-sm text-green-700 font-medium">Total On-Ramp</div>
                                                <div className="text-2xl font-bold text-green-900">
                                                    ${rampVolumes.reduce((sum, v) => sum + v.onRamp, 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-red-50 rounded-lg">
                                                <div className="text-sm text-red-700 font-medium">Total Off-Ramp</div>
                                                <div className="text-2xl font-bold text-red-900">
                                                    ${rampVolumes.reduce((sum, v) => sum + v.offRamp, 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                            {/* Legal Disclaimer */}
                            <StrigaDisclaimer />
                            </div>
                            </div>
                            </div>
                            );
                            }