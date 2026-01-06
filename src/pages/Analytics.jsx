import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard, 
    Users, 
    AlertTriangle,
    Globe,
    Calendar,
    Download,
    RefreshCw,
    Repeat,
    Brain,
    Coins
} from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

const generateTimeSeriesData = (days) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            volume: Math.round(80000 + Math.random() * 120000),
            transactions: Math.round(800 + Math.random() * 600),
            approved: Math.round(750 + Math.random() * 500),
            declined: Math.round(30 + Math.random() * 50),
            refunds: Math.round(10 + Math.random() * 30),
            chargebacks: Math.round(Math.random() * 10),
        });
    }
    return data;
};



const geoData = [
    { country: 'United States', transactions: 5420, volume: 892340, percentage: 42 },
    { country: 'United Kingdom', transactions: 2180, volume: 425600, percentage: 17 },
    { country: 'Germany', transactions: 1560, volume: 312000, percentage: 12 },
    { country: 'Singapore', transactions: 980, volume: 245000, percentage: 10 },
    { country: 'Australia', transactions: 750, volume: 187500, percentage: 7 },
    { country: 'Others', transactions: 1540, volume: 308000, percentage: 12 },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    transactions: Math.round(200 + Math.random() * 800 * (i >= 9 && i <= 21 ? 1.5 : 0.5)),
    volume: Math.round(5000 + Math.random() * 20000 * (i >= 9 && i <= 21 ? 1.5 : 0.5)),
}));

export default function Analytics() {
    const { t } = useI18n();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [period, setPeriod] = useState('30d');
    const [merchantFilter, setMerchantFilter] = useState('all');

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 1000),
    });

    // Separate crypto and fiat transactions
    const cryptoTransactions = transactions.filter(t => t.crypto_asset || t.payment_method === 'crypto_currency' || t.payment_method === 'bitcoin' || t.payment_method === 'bitcoin_cash');
    const fiatTransactions = transactions.filter(t => !t.crypto_asset && t.payment_method !== 'crypto_currency' && t.payment_method !== 'bitcoin' && t.payment_method !== 'bitcoin_cash');

    const paymentMethodData = [
        { name: 'Visa', value: 45, amount: 1125000, color: '#1a1f71' },
        { name: 'Mastercard', value: 32, amount: 800000, color: '#eb001b' },
        { name: 'Amex', value: 12, amount: 300000, color: '#006fcf' },
        { name: 'Discover', value: 5, amount: 125000, color: '#ff6000' },
        { name: 'Crypto', value: transactions.length > 0 && cryptoTransactions.length > 0 ? Math.round((cryptoTransactions.length / transactions.length) * 100) : 4, amount: cryptoTransactions.reduce((sum, t) => sum + (t.amount || 0), 0), color: '#f59e0b' },
        { name: 'Others', value: 2, amount: 50000, color: '#64748b' },
    ];

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['subscriptions-analytics'],
        queryFn: () => base44.entities.RecurringPayment.list(),
    });

    const { data: aiDecisions = [] } = useQuery({
        queryKey: ['ai-decisions-analytics'],
        queryFn: () => base44.entities.AIPaymentDecision.list('-created_date', 100),
    });

    const timeSeriesData = generateTimeSeriesData(period === '7d' ? 7 : period === '30d' ? 30 : 90);

    const totalVolume = timeSeriesData.reduce((sum, d) => sum + d.volume, 0);
    const totalTransactions = timeSeriesData.reduce((sum, d) => sum + d.transactions, 0);
    const avgApprovalRate = (timeSeriesData.reduce((sum, d) => sum + d.approved, 0) / totalTransactions * 100).toFixed(1);
    const totalChargebacks = timeSeriesData.reduce((sum, d) => sum + d.chargebacks, 0);
    
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, sub) => {
        const monthlyAmount = sub.frequency === 'monthly' ? sub.amount :
                             sub.frequency === 'yearly' ? sub.amount / 12 :
                             sub.frequency === 'quarterly' ? sub.amount / 3 : sub.amount;
        return sum + monthlyAmount;
    }, 0);
    
    const aiSuccessRate = aiDecisions.length > 0 
        ? (aiDecisions.filter(d => d.outcome === 'successful').length / aiDecisions.length * 100).toFixed(1) 
        : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
            
            <Sidebar collapsed={sidebarCollapsed} currentPage="Analytics" />
            
            <div className="lg:ml-20">
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                            <p className="text-slate-500">Comprehensive payment insights and trends</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Merchants" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Merchants</SelectItem>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Tabs value={period} onValueChange={setPeriod}>
                                <TabsList>
                                    <TabsTrigger value="7d">7D</TabsTrigger>
                                    <TabsTrigger value="30d">30D</TabsTrigger>
                                    <TabsTrigger value="90d">90D</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* KPI Cards - Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Total Volume</p>
                                    <p className="text-2xl font-bold text-slate-900">${(totalVolume / 1000000).toFixed(2)}M</p>
                                    <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
                                        <TrendingUp className="h-4 w-4" />
                                        +12.5% vs last period
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Transactions</p>
                                    <p className="text-2xl font-bold text-slate-900">{totalTransactions.toLocaleString()}</p>
                                    <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
                                        <TrendingUp className="h-4 w-4" />
                                        +8.3% vs last period
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Approval Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">{avgApprovalRate}%</p>
                                    <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
                                        <TrendingUp className="h-4 w-4" />
                                        +0.5% vs last period
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Chargeback Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">{((totalChargebacks / totalTransactions) * 100).toFixed(2)}%</p>
                                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                                        <TrendingDown className="h-4 w-4" />
                                        -0.1% vs last period
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Recurring, AI & Crypto KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Active Subscriptions</p>
                                    <p className="text-2xl font-bold text-slate-900">{activeSubscriptions}</p>
                                    <div className="flex items-center gap-1 mt-1 text-purple-600 text-sm">
                                        MRR: ${(mrr / 1000).toFixed(1)}K
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Repeat className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">AI Decisions</p>
                                    <p className="text-2xl font-bold text-slate-900">{aiDecisions.length}</p>
                                    <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
                                        <TrendingUp className="h-4 w-4" />
                                        {aiSuccessRate}% success
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <Brain className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Crypto Transactions</p>
                                    <p className="text-2xl font-bold text-slate-900">{cryptoTransactions.length}</p>
                                    <div className="flex items-center gap-1 mt-1 text-amber-600 text-sm">
                                        ${(cryptoTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / 1000).toFixed(1)}K
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Coins className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Failed Payments</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {subscriptions.filter(s => s.status === 'dunning').length}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                                        In dunning
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Volume & Transactions Chart */}
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Volume & Transactions Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={timeSeriesData}>
                                        <defs>
                                            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="left" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value, name) => [
                                            name === 'volume' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                                            name === 'volume' ? 'Volume' : 'Transactions'
                                        ]} />
                                        <Legend />
                                        <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#3b82f6" fill="url(#volumeGradient)" name="Volume" />
                                        <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} dot={false} name="Transactions" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Methods</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                                                {paymentMethodData.map((entry, idx) => (
                                                    <Cell key={idx} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [`${value}% ($${(props.payload.amount/1000).toFixed(0)}k)`, props.payload.name]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Approval vs Decline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Approval vs Decline Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={timeSeriesData.slice(-14)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
                                            <Bar dataKey="declined" stackId="a" fill="#ef4444" name="Declined" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Geographic Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Geographic Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {geoData.map((geo, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-32 font-medium text-slate-700">{geo.country}</div>
                                            <div className="flex-1">
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                        style={{ width: `${geo.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-20 text-right text-sm text-slate-600">
                                                {geo.percentage}%
                                            </div>
                                            <div className="w-28 text-right font-medium">
                                                ${(geo.volume/1000).toFixed(0)}k
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hourly Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Hourly Transaction Pattern</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={hourlyData}>
                                            <defs>
                                                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="transactions" stroke="#8b5cf6" fill="url(#hourlyGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Decline Reasons */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Top Decline Reasons</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { reason: 'Insufficient Funds', code: '51', count: 234, percentage: 32 },
                                    { reason: 'Do Not Honor', code: '05', count: 156, percentage: 21 },
                                    { reason: 'Invalid Card', code: '14', count: 98, percentage: 13 },
                                    { reason: 'Expired Card', code: '54', count: 87, percentage: 12 },
                                    { reason: 'Transaction Not Allowed', code: '57', count: 65, percentage: 9 },
                                    { reason: 'CVV Mismatch', code: 'N7', count: 45, percentage: 6 },
                                    { reason: 'Fraud Suspected', code: '59', count: 32, percentage: 4 },
                                    { reason: 'Other', code: '-', count: 23, percentage: 3 },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className="text-xs">{item.code}</Badge>
                                            <span className="text-sm font-medium text-slate-900">{item.percentage}%</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">{item.reason}</p>
                                        <p className="text-xs text-slate-500">{item.count} transactions</p>
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