import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
    Download, FileText, TrendingUp, TrendingDown, DollarSign, Percent, 
    BarChart3, PieChart as PieChartIcon, Activity, Filter, Calendar
} from 'lucide-react';
import { toast } from "sonner";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdvancedReports() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('pnl');
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [providerFilter, setProviderFilter] = useState('all');
    const [txnTypeFilter, setTxnTypeFilter] = useState('all');

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 1000),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list(),
    });

    const { data: pricing = [] } = useQuery({
        queryKey: ['merchant-pricing'],
        queryFn: () => base44.entities.MerchantPricing.list(),
    });

    const { data: chargebacks = [] } = useQuery({
        queryKey: ['chargebacks'],
        queryFn: () => base44.entities.Chargeback.list(),
    });

    // Filter transactions
    const filteredTxns = useMemo(() => {
        return transactions.filter(t => {
            const matchesMerchant = merchantFilter === 'all' || t.merchant_id === merchantFilter;
            const matchesType = txnTypeFilter === 'all' || t.type === txnTypeFilter;
            return matchesMerchant && matchesType;
        });
    }, [transactions, merchantFilter, txnTypeFilter]);

    // P&L Calculations
    const pnlData = useMemo(() => {
        const merchantPnl = {};
        
        merchants.forEach(m => {
            const mTxns = filteredTxns.filter(t => t.merchant_id === m.id);
            const mPricing = pricing.filter(p => p.merchant_id === m.id);
            
            const grossVolume = mTxns.filter(t => t.type === 'sale' && t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0);
            const txnCount = mTxns.filter(t => t.type === 'sale').length;
            
            const avgMdr = mPricing.length > 0 ? mPricing.reduce((acc, p) => acc + (p.sell_percentage_rate || 0), 0) / mPricing.length : 0;
            const avgBuyRate = mPricing.length > 0 ? mPricing.reduce((acc, p) => acc + (p.buy_percentage_rate || 0), 0) / mPricing.length : 0;
            
            const grossRevenue = grossVolume * (avgMdr / 100);
            const costOfSales = grossVolume * (avgBuyRate / 100);
            const grossProfit = grossRevenue - costOfSales;
            const margin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

            merchantPnl[m.id] = {
                merchant_name: m.business_name,
                gross_volume: grossVolume,
                transaction_count: txnCount,
                gross_revenue: grossRevenue,
                cost_of_sales: costOfSales,
                gross_profit: grossProfit,
                margin
            };
        });

        return Object.values(merchantPnl).filter(p => p.gross_volume > 0).sort((a, b) => b.gross_profit - a.gross_profit);
    }, [merchants, filteredTxns, pricing]);

    // Volume stats
    const volumeStats = useMemo(() => {
        const byDay = {};
        filteredTxns.forEach(t => {
            const day = format(new Date(t.created_date || new Date()), 'MMM dd');
            if (!byDay[day]) byDay[day] = { date: day, volume: 0, count: 0, approved: 0, declined: 0 };
            byDay[day].volume += t.amount || 0;
            byDay[day].count += 1;
            if (t.status === 'approved') byDay[day].approved += 1;
            if (t.status === 'declined') byDay[day].declined += 1;
        });
        return Object.values(byDay).slice(-14);
    }, [filteredTxns]);

    // Success rate
    const successRateData = useMemo(() => {
        const total = filteredTxns.length;
        const approved = filteredTxns.filter(t => t.status === 'approved').length;
        const declined = filteredTxns.filter(t => t.status === 'declined').length;
        const pending = filteredTxns.filter(t => t.status === 'pending').length;
        const failed = filteredTxns.filter(t => t.status === 'failed').length;
        
        return [
            { name: 'Approved', value: approved, color: '#10b981' },
            { name: 'Declined', value: declined, color: '#ef4444' },
            { name: 'Pending', value: pending, color: '#f59e0b' },
            { name: 'Failed', value: failed, color: '#6b7280' },
        ].filter(d => d.value > 0);
    }, [filteredTxns]);

    // Fee breakdown
    const feeBreakdown = useMemo(() => {
        const byProvider = {};
        pricing.forEach(p => {
            if (!byProvider[p.provider_name]) {
                byProvider[p.provider_name] = { provider: p.provider_name, buy_fees: 0, sell_fees: 0, margin: 0 };
            }
            byProvider[p.provider_name].buy_fees += p.buy_percentage_rate || 0;
            byProvider[p.provider_name].sell_fees += p.sell_percentage_rate || 0;
            byProvider[p.provider_name].margin += (p.sell_percentage_rate || 0) - (p.buy_percentage_rate || 0);
        });
        return Object.values(byProvider);
    }, [pricing]);

    // Chargeback ratio
    const chargebackRatio = useMemo(() => {
        const totalTxns = filteredTxns.filter(t => t.type === 'sale').length;
        const totalChargebacks = chargebacks.length;
        return totalTxns > 0 ? ((totalChargebacks / totalTxns) * 100).toFixed(2) : '0.00';
    }, [filteredTxns, chargebacks]);

    // Overall stats
    const overallStats = useMemo(() => {
        const totalVolume = filteredTxns.filter(t => t.type === 'sale' && t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0);
        const totalRevenue = pnlData.reduce((acc, p) => acc + p.gross_revenue, 0);
        const totalProfit = pnlData.reduce((acc, p) => acc + p.gross_profit, 0);
        const avgMargin = pnlData.length > 0 ? pnlData.reduce((acc, p) => acc + p.margin, 0) / pnlData.length : 0;
        const successRate = filteredTxns.length > 0 ? (filteredTxns.filter(t => t.status === 'approved').length / filteredTxns.length * 100).toFixed(1) : 0;

        return { totalVolume, totalRevenue, totalProfit, avgMargin, successRate };
    }, [filteredTxns, pnlData]);

    const exportCSV = (data, filename) => {
        if (!data || data.length === 0) {
            toast.error('No data to export');
            return;
        }
        const headers = Object.keys(data[0] || {});
        const csv = [headers.join(','), ...data.map(row => headers.map(h => {
            const val = row[h];
            // Handle values with commas or quotes
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${format(new Date(), 'yyyyMMdd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename}_${format(new Date(), 'yyyyMMdd')}.csv`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="AdvancedReports" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Advanced Reports</h1>
                            <p className="text-slate-500">P&L, volume analytics, and customizable reports</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={() => exportCSV(volumeStats, 'volume_report')}>
                                <Download className="h-4 w-4" /> Volume Report
                            </Button>
                            <Button variant="outline" className="gap-2" onClick={() => exportCSV(pnlData, 'pnl_report')}>
                                <Download className="h-4 w-4" /> P&L Report
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-36" />
                                    <span className="text-slate-400">to</span>
                                    <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-36" />
                                </div>
                                <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Merchant" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Merchants</SelectItem>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={txnTypeFilter} onValueChange={setTxnTypeFilter}>
                                    <SelectTrigger className="w-40"><SelectValue placeholder="Txn Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="sale">Sale</SelectItem>
                                        <SelectItem value="refund">Refund</SelectItem>
                                        <SelectItem value="chargeback">Chargeback</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Volume</p>
                                    <p className="text-lg font-bold">${overallStats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Gross Revenue</p>
                                    <p className="text-lg font-bold">${overallStats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Gross Profit</p>
                                    <p className="text-lg font-bold">${overallStats.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Percent className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Success Rate</p>
                                    <p className="text-lg font-bold">{overallStats.successRate}%</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Chargeback Ratio</p>
                                    <p className="text-lg font-bold">{chargebackRatio}%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Report Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="bg-white border">
                            <TabsTrigger value="pnl">P&L by Merchant</TabsTrigger>
                            <TabsTrigger value="volume">Volume Analytics</TabsTrigger>
                            <TabsTrigger value="success">Success Rates</TabsTrigger>
                            <TabsTrigger value="fees">Fee Breakdown</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pnl">
                            <Card>
                                <CardHeader className="border-b flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Profit & Loss by Merchant</CardTitle>
                                        <CardDescription>Revenue, costs, and margin analysis</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => exportCSV(pnlData, 'pnl_by_merchant')}>
                                        <Download className="h-4 w-4 mr-2" /> Export
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Merchant</TableHead>
                                                <TableHead className="text-right">Volume</TableHead>
                                                <TableHead className="text-right">Transactions</TableHead>
                                                <TableHead className="text-right">Gross Revenue</TableHead>
                                                <TableHead className="text-right">Cost of Sales</TableHead>
                                                <TableHead className="text-right">Gross Profit</TableHead>
                                                <TableHead className="text-right">Margin</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pnlData.length === 0 ? (
                                                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No data available</TableCell></TableRow>
                                            ) : (
                                                pnlData.map((row, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-medium">{row.merchant_name}</TableCell>
                                                        <TableCell className="text-right">${row.gross_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                                                        <TableCell className="text-right">{row.transaction_count.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right text-blue-600">${row.gross_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="text-right text-red-600">-${row.cost_of_sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="text-right font-bold text-emerald-600">${row.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge className={row.margin > 30 ? 'bg-emerald-100 text-emerald-700' : row.margin > 15 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                                                                {row.margin.toFixed(1)}%
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="volume">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Daily Volume Trend</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={volumeStats}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transaction Count Trend</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={volumeStats}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
                                                <Line type="monotone" dataKey="declined" stroke="#ef4444" name="Declined" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="success">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transaction Status Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie data={successRateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                                    {successRateData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Status Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {successRateData.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span>{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-slate-500">{item.value.toLocaleString()} txns</span>
                                                    <Badge variant="outline">{((item.value / filteredTxns.length) * 100).toFixed(1)}%</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="fees">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle>Fee Breakdown by Provider</CardTitle>
                                    <CardDescription>Average rates and margins</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Provider</TableHead>
                                                <TableHead className="text-right">Avg Buy Rate</TableHead>
                                                <TableHead className="text-right">Avg Sell Rate</TableHead>
                                                <TableHead className="text-right">Avg Margin</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {feeBreakdown.map((row, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium">{row.provider}</TableCell>
                                                    <TableCell className="text-right">{row.buy_fees.toFixed(2)}%</TableCell>
                                                    <TableCell className="text-right">{row.sell_fees.toFixed(2)}%</TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600">{row.margin.toFixed(2)}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}