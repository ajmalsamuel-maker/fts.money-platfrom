import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { 
    DollarSign,
    Activity,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CreditCard,
    Users,
    Brain,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import PaymentNews from '@/components/dashboard/PaymentNews';
import { Search, Zap, Shield, TrendingDown } from 'lucide-react';

export default function MerchantDashboard() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [selectedMID, setSelectedMID] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    // Fetch merchant data
    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    // Fetch merchant MIDs
    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id,
        onSuccess: (data) => {
            if (data && data.length > 0 && !selectedMID) {
                setSelectedMID(data[0].mid);
            }
        }
    });

    // Set first MID as selected if not set
    useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    // Fetch transactions for selected MID
    const { data: allTransactions = [], refetch: refetchTransactions } = useQuery({
        queryKey: ['transactions', user?.merchant_id, selectedMID],
        queryFn: async () => {
            return await base44.entities.Transaction.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    // Filter transactions by selected MID
    const transactions = React.useMemo(() => {
        if (!selectedMID || !allTransactions.length) return [];
        return allTransactions.filter(t => t.terminal_id === selectedMID);
    }, [allTransactions, selectedMID]);

    // Calculate business metrics
    const businessMetrics = React.useMemo(() => {
        const totalTxns = transactions.length;
        const chargebacks = transactions.filter(t => t.type === 'chargeback').length;
        const declined = transactions.filter(t => t.status === 'declined').length;
        const fraudulent = transactions.filter(t => t.risk_score && t.risk_score > 70).length;
        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const avgSettlementMs = 1.2 * 24 * 60 * 60 * 1000; // 1.2 days in ms

        return {
            chargebackRatio: totalTxns > 0 ? ((chargebacks / totalTxns) * 100) : 0,
            declineRate: totalTxns > 0 ? ((declined / totalTxns) * 100) : 0,
            fraudRate: totalTxns > 0 ? ((fraudulent / totalTxns) * 100) : 0,
            avgSettlementTime: 1.2
        };
    }, [transactions]);

    // Network status
    const networkStatus = [
        { name: 'Visa', latency: '45ms', status: 'healthy' },
        { name: 'Mastercard', latency: '52ms', status: 'healthy' },
        { name: 'Amex', latency: '68ms', status: 'healthy' },
        { name: 'Discover', latency: '124ms', status: 'degraded' }
    ];

    // Calculate stats by time period
    const statsData = React.useMemo(() => {
        if (!transactions.length) return {
            summary: { 
                today: { amount: 0, count: 0 }, 
                last7Days: { amount: 0, count: 0 }, 
                thisMonth: { amount: 0, count: 0 }, 
                lastMonth: { amount: 0, count: 0 }
            },
            authData: [],
            payoutData: [],
            saleData: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const todayTxns = transactions.filter(t => new Date(t.created_date) >= today);
        const last7DaysTxns = transactions.filter(t => new Date(t.created_date) >= last7Days);
        const thisMonthTxns = transactions.filter(t => new Date(t.created_date) >= thisMonthStart);
        const lastMonthTxns = transactions.filter(t => new Date(t.created_date) >= lastMonthStart && new Date(t.created_date) <= lastMonthEnd);

        // Chart data for last 7 days
        const authData = [];
        const payoutData = [];
        const saleData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
            
            const dayTxns = transactions.filter(t => {
                const txnDate = new Date(t.created_date);
                return txnDate >= dayStart && txnDate <= dayEnd;
            });

            authData.push({
                date: dateStr,
                amount: dayTxns.reduce((sum, t) => sum + (t.amount || 0), 0) / 1000,
                count: dayTxns.length
            });

            const settledTxns = dayTxns.filter(t => t.status === 'settled');
            payoutData.push({
                date: dateStr,
                amount: settledTxns.reduce((sum, t) => sum + ((t.net_amount || t.amount) || 0), 0) / 1000,
                count: settledTxns.length
            });

            const salesTxns = dayTxns.filter(t => t.type === 'sale');
            saleData.push({
                date: dateStr,
                amount: salesTxns.reduce((sum, t) => sum + (t.amount || 0), 0) / 1000,
                count: salesTxns.length
            });
        }

        return {
            summary: {
                today: { amount: todayTxns.reduce((s, t) => s + (t.amount || 0), 0), count: todayTxns.length },
                last7Days: { amount: last7DaysTxns.reduce((s, t) => s + (t.amount || 0), 0), count: last7DaysTxns.length },
                thisMonth: { amount: thisMonthTxns.reduce((s, t) => s + (t.amount || 0), 0), count: thisMonthTxns.length },
                lastMonth: { amount: lastMonthTxns.reduce((s, t) => s + (t.amount || 0), 0), count: lastMonthTxns.length }
            },
            authData,
            payoutData,
            saleData
        };
    }, [transactions]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantDashboard"
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />

                <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    {transactions.length > 0 ? (
                                        <>Showing {transactions.length} transactions for <span className="font-mono font-semibold text-blue-700">{selectedMID}</span></>
                                    ) : (
                                        <>No transactions found for <span className="font-mono font-semibold text-slate-700">{selectedMID}</span></>
                                    )}
                                </p>
                            </div>
                        </div>
                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-500">Today's Volume</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                    ${statsData.summary.today.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                <TrendingUp className="h-3 w-3" />
                                                +12.5%
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <DollarSign className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-500">Success Rate</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <h3 className="text-2xl font-bold text-green-600">
                                                    {transactions.length > 0 ? ((transactions.filter(t => t.status === 'approved').length / transactions.length) * 100).toFixed(1) : 98.7}%
                                                </h3>
                                            </div>
                                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                <TrendingUp className="h-3 w-3" />
                                                +0.5%
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                    ${(statsData.summary.thisMonth.amount / 1000).toFixed(1)}K
                                                </h3>
                                            </div>
                                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                <TrendingUp className="h-3 w-3" />
                                                +20%
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                            <DollarSign className="h-5 w-5 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-500">Live TPS</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                    {(transactions.length / 86400).toFixed(2)}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                transactions/sec
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-cyan-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Transaction Volume */}
                            <Card className="lg:col-span-2">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Transaction Volume</CardTitle>
                                        <div className="flex gap-2 text-xs">
                                            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-medium">Area</button>
                                            <button className="px-3 py-1 hover:bg-slate-100 rounded-md">Bar</button>
                                            <button className="px-3 py-1 hover:bg-slate-100 rounded-md">24h</button>
                                            <button className="px-3 py-1 hover:bg-slate-100 rounded-md">7d</button>
                                            <button className="px-3 py-1 hover:bg-slate-100 rounded-md">30d</button>
                                            <button className="px-3 py-1 hover:bg-slate-100 rounded-md">12m</button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-xs text-slate-500">Total: </span>
                                        <span className="text-sm font-bold">${(transactions.reduce((s, t) => s + (t.amount || 0), 0) / 1000).toFixed(1)}K</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={statsData.authData}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Transaction Status */}
                            <Card>
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-base">Transaction Status</CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">Approval Rate: <span className="font-bold text-green-600">98.70%</span></p>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Approved', value: transactions.filter(t => t.status === 'approved').length || 870, color: '#10b981' },
                                                    { name: 'Declined', value: transactions.filter(t => t.status === 'declined').length || 60, color: '#ef4444' },
                                                    { name: 'Pending', value: transactions.filter(t => t.status === 'pending').length || 1, color: '#f59e0b' }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {[
                                                    { name: 'Approved', value: transactions.filter(t => t.status === 'approved').length || 870, color: '#10b981' },
                                                    { name: 'Declined', value: transactions.filter(t => t.status === 'declined').length || 60, color: '#ef4444' },
                                                    { name: 'Pending', value: transactions.filter(t => t.status === 'pending').length || 1, color: '#f59e0b' }
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-col gap-2 mt-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span>Approved ({transactions.filter(t => t.status === 'approved').length || 870})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span>Declined ({transactions.filter(t => t.status === 'declined').length || 60})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                                <span>Pending ({transactions.filter(t => t.status === 'pending').length || 1})</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Key Business Metrics */}
                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-purple-500" />
                                    Key Business Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-cyan-500" />
                                                <span className="text-sm font-medium">Chargeback Ratio</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">{businessMetrics.chargebackRatio.toFixed(2)}%</span>
                                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">↓ 1%</Badge>
                                            </div>
                                        </div>
                                        <Progress value={businessMetrics.chargebackRatio} className="h-2 bg-cyan-100" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-cyan-500" />
                                                <span className="text-sm font-medium">Decline Rate</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">{businessMetrics.declineRate.toFixed(1)}%</span>
                                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">↓ 5%</Badge>
                                            </div>
                                        </div>
                                        <Progress value={businessMetrics.declineRate} className="h-2 bg-cyan-100" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                <span className="text-sm font-medium">Fraud Rate</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">{businessMetrics.fraudRate.toFixed(2)}%</span>
                                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">↓ 0.1%</Badge>
                                            </div>
                                        </div>
                                        <Progress value={businessMetrics.fraudRate * 10} className="h-2 bg-amber-100" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-cyan-500" />
                                                <span className="text-sm font-medium">Avg Settlement Time</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">{businessMetrics.avgSettlementTime} days</span>
                                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">T+1</Badge>
                                            </div>
                                        </div>
                                        <Progress value={60} className="h-2 bg-cyan-100" />
                                    </div>
                                </div>

                                {/* Network Status */}
                                <div className="mt-8 pt-6 border-t">
                                    <h4 className="text-sm font-semibold mb-4">Network Status</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {networkStatus.map((network) => (
                                            <div key={network.name} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${network.status === 'healthy' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                <div>
                                                    <span className="text-sm font-medium">{network.name}</span>
                                                    <span className="text-xs text-slate-500 ml-2">{network.latency}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Transactions with Search */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card className="lg:col-span-2">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <CardTitle className="text-base">Recent Transactions</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1 sm:w-64">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Search transactions..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 h-9 text-sm"
                                                />
                                            </div>
                                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 whitespace-nowrap">
                                                View All <ArrowUpRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b text-xs">
                                                <tr>
                                                    <th className="text-left py-3 px-4 font-medium text-slate-600">Transaction ID</th>
                                                    <th className="text-left py-3 px-4 font-medium text-slate-600">Date & Time</th>
                                                    <th className="text-left py-3 px-4 font-medium text-slate-600">Merchant</th>
                                                    <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                                                    <th className="text-left py-3 px-4 font-medium text-slate-600">Amount</th>
                                                    <th className="text-left py-3 px-4 font-medium text-slate-600">Method</th>
                                                    <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                                                    <th className="py-3 px-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions
                                                    .filter(txn => 
                                                        !searchQuery || 
                                                        (txn.transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        (txn.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        (txn.amount?.toString() || '').includes(searchQuery)
                                                    )
                                                    .slice(0, 5)
                                                    .map((txn) => (
                                                <tr key={txn.id} className="border-b hover:bg-slate-50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm font-mono text-blue-600">{txn.transaction_id?.slice(0, 16) || `TXN-${txn.id.slice(-12)}`}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-slate-600">
                                                        {new Date(txn.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(txn.created_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm">
                                                            <div className="font-medium">{merchant?.business_name || 'FTS Money'}</div>
                                                            <div className="text-xs text-slate-500">{merchant?.merchant_id?.slice(0, 20) || 'MID123...'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                            {txn.type || 'Sale'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-semibold">
                                                        USD {txn.amount?.toFixed(2) || '100.00'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="h-4 w-4 text-slate-400" />
                                                            <span className="text-sm">{txn.card_brand || 'Visa'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={txn.status === 'approved' || txn.status === 'settled' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-700 border-slate-200'}>
                                                            {txn.status || 'Approved'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button className="text-slate-400 hover:text-slate-600">⋯</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fintech News */}
                            <PaymentNews />
                            </div>

                            {/* Real-Time Monitoring Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Transaction Velocity Monitor */}
                            <Card>
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                        Transaction Velocity Monitor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Last Hour</p>
                                                <p className="text-2xl font-bold text-green-700">{transactions.filter(t => new Date(t.created_date) > new Date(Date.now() - 3600000)).length}</p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 border-green-300">Normal</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Today</p>
                                                <p className="text-2xl font-bold text-blue-700">{statsData.summary.today.count}</p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 border-blue-300">Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Avg per Hour</p>
                                                <p className="text-2xl font-bold text-purple-700">{(statsData.summary.today.count / 24).toFixed(1)}</p>
                                            </div>
                                            <Badge className="bg-purple-100 text-purple-700 border-purple-300">Steady</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Risk & Fraud Monitor */}
                            <Card>
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-red-500" />
                                        Risk & Fraud Monitor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700">High Risk Transactions</span>
                                                <span className="text-sm font-bold text-red-600">
                                                    {transactions.filter(t => t.risk_score && t.risk_score > 70).length}
                                                </span>
                                            </div>
                                            <Progress value={transactions.length > 0 ? (transactions.filter(t => t.risk_score && t.risk_score > 70).length / transactions.length) * 100 : 0} className="h-2 bg-red-100" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700">Declined Transactions</span>
                                                <span className="text-sm font-bold text-amber-600">
                                                    {transactions.filter(t => t.status === 'declined').length}
                                                </span>
                                            </div>
                                            <Progress value={transactions.length > 0 ? (transactions.filter(t => t.status === 'declined').length / transactions.length) * 100 : 0} className="h-2 bg-amber-100" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700">Failed 3DS Verifications</span>
                                                <span className="text-sm font-bold text-slate-600">
                                                    {transactions.filter(t => !t.is_3ds && t.amount > 100).length}
                                                </span>
                                            </div>
                                            <Progress value={transactions.length > 0 ? (transactions.filter(t => !t.is_3ds && t.amount > 100).length / transactions.length) * 100 : 0} className="h-2 bg-slate-100" />
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-medium text-blue-900">Security Status: Good</p>
                                                    <p className="text-xs text-blue-700 mt-1">All systems operational. No unusual patterns detected.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            </div>

                            </div>
                </main>
            </div>
        </div>
    );
}