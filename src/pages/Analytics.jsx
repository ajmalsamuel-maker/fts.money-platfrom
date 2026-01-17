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

    // Calculate real payment method distribution
    const methodCounts = transactions.reduce((acc, t) => {
        const method = t.payment_method || 'other';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});

    const methodAmounts = transactions.reduce((acc, t) => {
        const method = t.payment_method || 'other';
        acc[method] = (acc[method] || 0) + (t.amount || 0);
        return acc;
    }, {});

    const paymentMethodData = Object.entries(methodCounts).map(([method, count]) => ({
        name: method.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value: transactions.length > 0 ? Math.round((count / transactions.length) * 100) : 0,
        amount: methodAmounts[method] || 0,
        color: method.includes('visa') ? '#1a1f71' :
               method.includes('mastercard') ? '#eb001b' :
               method.includes('amex') ? '#006fcf' :
               method.includes('crypto') || method.includes('bitcoin') ? '#f59e0b' : '#64748b'
    }));

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['subscriptions-analytics'],
        queryFn: () => base44.entities.RecurringPayment.list(),
    });

    const { data: aiDecisions = [] } = useQuery({
        queryKey: ['ai-decisions-analytics'],
        queryFn: () => base44.entities.AIPaymentDecision.list('-created_date', 100),
    });

    const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalTransactions = transactions.length;
    const approvedCount = transactions.filter(t => t.status === 'approved' || t.status === 'accepted' || t.status === 'settled').length;
    const avgApprovalRate = totalTransactions > 0 ? (approvedCount / totalTransactions * 100).toFixed(1) : '0.0';
    const totalChargebacks = transactions.filter(t => t.type === 'chargeback').length;
    
    // Generate time series from real transactions
    const timeSeriesData = [];
    
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
                                    <p className="text-2xl font-bold text-slate-900">${totalVolume.toLocaleString()}</p>
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
                                    <p className="text-2xl font-bold text-slate-900">{totalTransactions > 0 ? ((totalChargebacks / totalTransactions) * 100).toFixed(2) : '0.00'}%</p>
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
                    {transactions.length > 0 ? (
                        <Card className="mb-6">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Volume & Transactions Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 flex items-center justify-center text-slate-400">
                                    Trend data available after more transactions are processed
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="mb-6">
                            <CardContent className="py-12 text-center text-slate-400">
                                No transaction data yet
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Methods</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {paymentMethodData.length > 0 ? (
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
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-slate-400">
                                        No payment method data yet
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Approval vs Decline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Approval vs Decline Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-slate-400">
                                    {transactions.length > 0 ? 'Trend data available after more transactions' : 'No transaction data yet'}
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
                                <div className="h-64 flex items-center justify-center text-slate-400">
                                    Geographic data available after transactions are processed
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hourly Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Hourly Transaction Pattern</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-slate-400">
                                    Hourly pattern data available after transactions are processed
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
                            <div className="py-12 text-center text-slate-400">
                                Decline reason analytics available after transactions are processed
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}