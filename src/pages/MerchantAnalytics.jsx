import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { getStaffSession } from '@/components/auth/useStaffAuth';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown,
    DollarSign, 
    CreditCard, 
    AlertTriangle,
    Clock,
    Search,
    Calendar as CalendarIcon,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    Store,
    RefreshCw
} from 'lucide-react';
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
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const categoryColors = {
    retail: '#3b82f6',
    ecommerce: '#10b981',
    hospitality: '#f59e0b',
    services: '#8b5cf6',
    travel: '#ec4899',
    gaming: '#ef4444',
    other: '#6b7280'
};

export default function MerchantAnalytics() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date()
    });
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [userPspCode, setUserPspCode] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    React.useEffect(() => {
        const session = getStaffSession();
        if (!session?.psp_code) {
            window.location.href = '/PSPLogin';
            return;
        }
        setUserPspCode(session.psp_code);
    }, []);

    const { data: merchants = [], isLoading: loadingMerchants } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list('-total_volume'),
    });



    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 1000),
    });

    const { data: chargebacks = [] } = useQuery({
        queryKey: ['chargebacks'],
        queryFn: () => base44.entities.Chargeback.list('-created_date'),
    });

    // Separate crypto and fiat transactions
    const cryptoTransactions = transactions.filter(t => t.crypto_asset || t.payment_method === 'crypto_currency' || t.payment_method === 'bitcoin' || t.payment_method === 'bitcoin_cash');
    const fiatTransactions = transactions.filter(t => !t.crypto_asset && t.payment_method !== 'crypto_currency' && t.payment_method !== 'bitcoin' && t.payment_method !== 'bitcoin_cash');

    // Payment method distribution
    const paymentMethodData = [
        { name: 'Visa', value: 45, color: '#1a1f71' },
        { name: 'Mastercard', value: 32, color: '#eb001b' },
        { name: 'Amex', value: 12, color: '#006fcf' },
        { name: 'Crypto', value: transactions.length > 0 && cryptoTransactions.length > 0 ? Math.round((cryptoTransactions.length / transactions.length) * 100) : 5, color: '#f59e0b' },
        { name: 'Other', value: 6, color: '#6b7280' }
    ];

    // Filter merchants
    const filteredMerchants = merchants.filter(m => {
        const matchesSearch = !searchQuery || 
            m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.merchant_id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Calculate metrics for selected merchant or all
    const calculateMetrics = (merchantId = null) => {
        const relevantTxns = merchantId 
            ? transactions.filter(t => t.merchant_id === merchantId)
            : transactions;
        
        const relevantCBs = merchantId
            ? chargebacks.filter(c => c.merchant_id === merchantId)
            : chargebacks;

        const totalVolume = relevantTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalTxns = relevantTxns.length;
        const approvedTxns = relevantTxns.filter(t => t.status === 'approved').length;
        const successRate = totalTxns > 0 ? (approvedTxns / totalTxns) * 100 : 0;
        const avgTicket = totalTxns > 0 ? totalVolume / totalTxns : 0;
        const chargebackCount = relevantCBs.length;
        const chargebackRatio = totalTxns > 0 ? (chargebackCount / totalTxns) * 100 : 0;
        const declinedTxns = relevantTxns.filter(t => t.status === 'declined').length;
        const declineRate = totalTxns > 0 ? (declinedTxns / totalTxns) * 100 : 0;

        return {
            totalVolume,
            totalTxns,
            successRate,
            avgTicket,
            chargebackCount,
            chargebackRatio,
            declineRate,
            fees: totalVolume * 0.025 // Assume 2.5% fee
        };
    };

    const overallMetrics = calculateMetrics();
    const selectedMetrics = selectedMerchant ? calculateMetrics(selectedMerchant.merchant_id) : null;

    // Generate trend data
    const generateTrendData = () => {
        const days = [];
        for (let i = 30; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, 'MMM dd');
            const dayTxns = transactions.filter(t => {
                if (!t.created_date) return false;
                const txnDate = new Date(t.created_date);
                return txnDate.toDateString() === date.toDateString();
            });
            
            days.push({
                date: dateStr,
                volume: dayTxns.reduce((sum, t) => sum + (t.amount || 0), 0),
                transactions: dayTxns.length,
                approved: dayTxns.filter(t => t.status === 'approved').length,
                declined: dayTxns.filter(t => t.status === 'declined').length
            });
        }
        return days;
    };

    const trendData = generateTrendData();

    // Category distribution
    const categoryDistribution = Object.entries(
        merchants.reduce((acc, m) => {
            const cat = m.category || 'other';
            acc[cat] = (acc[cat] || 0) + (m.total_volume || 0);
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value, color: categoryColors[name] || '#6b7280' }));



    // Settlement timeline data
    const settlementData = [
        { period: 'T+0', merchants: 5, volume: 125000 },
        { period: 'T+1', merchants: 45, volume: 890000 },
        { period: 'T+2', merchants: 32, volume: 560000 },
        { period: 'T+3', merchants: 12, volume: 180000 },
        { period: 'T+7', merchants: 3, volume: 45000 }
    ];

    // Fee analysis
    const feeAnalysis = [
        { type: 'Interchange', amount: overallMetrics.totalVolume * 0.015, percentage: 1.5 },
        { type: 'Scheme Fees', amount: overallMetrics.totalVolume * 0.003, percentage: 0.3 },
        { type: 'Acquirer Markup', amount: overallMetrics.totalVolume * 0.007, percentage: 0.7 },
        { type: 'Platform Fee', amount: overallMetrics.totalVolume * 0.005, percentage: 0.5 }
    ];

    const MetricCard = ({ title, value, change, icon: Icon, trend, format: formatType = 'number' }) => {
        const isPositive = change >= 0;
        const formattedValue = formatType === 'currency' 
            ? `$${value.toLocaleString()}` 
            : formatType === 'percent' 
                ? `${value.toFixed(2)}%`
                : value.toLocaleString();

        return (
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500">{title}</p>
                        <p className="text-2xl font-bold mt-1">{formattedValue}</p>
                        {change !== undefined && (
                            <div className={cn(
                                "flex items-center gap-1 text-sm mt-1",
                                trend === 'up' ? (isPositive ? 'text-emerald-600' : 'text-red-600') :
                                trend === 'down' ? (isPositive ? 'text-red-600' : 'text-emerald-600') :
                                isPositive ? 'text-emerald-600' : 'text-red-600'
                            )}>
                                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                <span>{Math.abs(change).toFixed(1)}% vs last period</span>
                            </div>
                        )}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                </div>
            </Card>
        );
    };

    if (!userPspCode) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="MerchantAnalytics"
            />
            
            <div className={cn("transition-all duration-300 lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Merchant Analytics</h1>
                            <p className="text-slate-500">Performance metrics and insights</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search merchants..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                                        <SelectItem value="hospitality">Hospitality</SelectItem>
                                        <SelectItem value="services">Services</SelectItem>
                                        <SelectItem value="travel">Travel</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            {dateRange.from ? format(dateRange.from, 'MMM dd') : 'From'} - {dateRange.to ? format(dateRange.to, 'MMM dd') : 'To'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overview Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <MetricCard 
                            title="Total Volume" 
                            value={overallMetrics.totalVolume} 
                            change={12.5}
                            icon={DollarSign}
                            format="currency"
                        />
                        <MetricCard 
                            title="Transactions" 
                            value={overallMetrics.totalTxns} 
                            change={8.3}
                            icon={CreditCard}
                        />
                        <MetricCard 
                            title="Crypto Volume" 
                            value={cryptoTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)} 
                            change={15.2}
                            icon={Store}
                            format="currency"
                        />
                        <MetricCard 
                            title="Success Rate" 
                            value={overallMetrics.successRate} 
                            change={2.1}
                            icon={TrendingUp}
                            format="percent"
                        />
                        <MetricCard 
                            title="Chargeback Ratio" 
                            value={overallMetrics.chargebackRatio} 
                            change={-0.5}
                            trend="down"
                            icon={AlertTriangle}
                            format="percent"
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Volume Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-slate-400" />
                                    Transaction Volume Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                                            <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="#dbeafe" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Success vs Decline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-slate-400" />
                                    Approval vs Decline Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData.slice(-14)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
                                            <Bar dataKey="declined" stackId="a" fill="#ef4444" name="Declined" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Distribution Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {/* Category Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Store className="h-5 w-5 text-slate-400" />
                                    Volume by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                dataKey="value"
                                            >
                                                {categoryDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {categoryDistribution.slice(0, 5).map((cat, idx) => (
                                        <div key={idx} className="flex items-center gap-1 text-xs">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="capitalize">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-slate-400" />
                                    Payment Methods
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentMethodData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {paymentMethodData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settlement Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-slate-400" />
                                    Settlement Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={settlementData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="merchants" fill="#8b5cf6" name="Merchants" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fee Analysis */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Percent className="h-5 w-5 text-slate-400" />
                                Fee Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {feeAnalysis.map((fee, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">{fee.type}</p>
                                        <p className="text-xl font-bold mt-1">${fee.amount.toLocaleString()}</p>
                                        <p className="text-sm text-slate-600">{fee.percentage}% of volume</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Total Revenue from Fees</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        ${feeAnalysis.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Merchant Performance Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Store className="h-5 w-5 text-slate-400" />
                                Merchant Performance
                                <Badge variant="secondary" className="ml-2">{filteredMerchants.length} merchants</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Volume</TableHead>
                                        <TableHead className="text-right">Transactions</TableHead>
                                        <TableHead className="text-right">Success Rate</TableHead>
                                        <TableHead className="text-right">CB Ratio</TableHead>
                                        <TableHead className="text-right">Avg Ticket</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMerchants.slice(0, 10).map((merchant) => {
                                        const metrics = calculateMetrics(merchant.merchant_id);
                                        return (
                                            <TableRow 
                                                key={merchant.id} 
                                                className="hover:bg-slate-50/50 cursor-pointer"
                                                onClick={() => setSelectedMerchant(merchant)}
                                            >
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{merchant.business_name}</p>
                                                        <p className="text-xs text-slate-500">{merchant.merchant_id}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {merchant.category || 'other'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${(merchant.total_volume || 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(merchant.total_transactions || 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={cn(
                                                        metrics.successRate >= 95 ? 'text-emerald-600' :
                                                        metrics.successRate >= 90 ? 'text-amber-600' : 'text-red-600'
                                                    )}>
                                                        {metrics.successRate.toFixed(1)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={cn(
                                                        metrics.chargebackRatio <= 0.5 ? 'text-emerald-600' :
                                                        metrics.chargebackRatio <= 1.0 ? 'text-amber-600' : 'text-red-600'
                                                    )}>
                                                        {metrics.chargebackRatio.toFixed(2)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    ${metrics.avgTicket.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        merchant.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        merchant.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    )}>
                                                        {merchant.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}