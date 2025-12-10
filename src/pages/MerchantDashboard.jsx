import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    CreditCard, 
    LogOut, 
    User, 
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    TrendingUp,
    Search,
    Filter,
    Download,
    Calendar,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    FileText,
    Settings,
    BarChart3,
    TrendingDown,
    Wallet,
    RefreshCw
} from 'lucide-react';

export default function MerchantDashboard() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMID, setSelectedMID] = useState('all');
    const [dateRange, setDateRange] = useState('7d');

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
        enabled: !!user?.merchant_id
    });

    // Fetch transactions
    const { data: transactions = [], refetch: refetchTransactions } = useQuery({
        queryKey: ['transactions', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.Transaction.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    // Calculate stats
    const stats = React.useMemo(() => {
        if (!transactions.length) return {
            totalVolume: 0,
            totalTransactions: 0,
            successRate: 0,
            pendingSettlement: 0,
            todayVolume: 0,
            weeklyVolume: 0,
            avgTransaction: 0,
            failedTransactions: 0
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const successfulTxns = transactions.filter(t => t.status === 'approved' || t.status === 'settled');
        const successRate = transactions.length > 0 ? (successfulTxns.length / transactions.length * 100) : 0;
        const pendingSettlement = transactions
            .filter(t => t.status === 'approved' && !t.settlement_date)
            .reduce((sum, t) => sum + (t.net_amount || t.amount || 0), 0);
        
        const todayVolume = transactions
            .filter(t => new Date(t.created_date) >= today)
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const weeklyVolume = transactions
            .filter(t => new Date(t.created_date) >= weekAgo)
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const avgTransaction = transactions.length > 0 ? totalVolume / transactions.length : 0;
        const failedTransactions = transactions.filter(t => t.status === 'declined' || t.status === 'failed').length;

        return {
            totalVolume,
            totalTransactions: transactions.length,
            successRate,
            pendingSettlement,
            todayVolume,
            weeklyVolume,
            avgTransaction,
            failedTransactions
        };
    }, [transactions]);

    // Filter transactions
    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = !searchQuery || 
                t.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.card_last_four?.includes(searchQuery);
            
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            const matchesMID = selectedMID === 'all' || t.terminal_id === selectedMID;

            return matchesSearch && matchesStatus && matchesMID;
        }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }, [transactions, searchQuery, statusFilter, selectedMID]);

    const getStatusConfig = (status) => {
        const configs = {
            approved: { label: 'Approved', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            settled: { label: 'Settled', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            declined: { label: 'Declined', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
            failed: { label: 'Failed', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        };
        return configs[status] || configs.pending;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{stats.merchantName || 'Merchant Portal'}</h1>
                            <p className="text-sm text-slate-500">Merchant Portal</p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                                    {user.full_name?.charAt(0) || 'M'}
                                </div>
                                <span className="hidden sm:inline">{user.full_name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-2">
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <Badge className="mt-1 text-xs">{user.role}</Badge>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-red-600">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    {/* Welcome Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.full_name}</h2>
                            <p className="text-slate-500">{merchant?.business_name || 'Loading...'}</p>
                        </div>
                        <Button variant="outline" onClick={() => refetchTransactions()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Total Volume
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    ${stats.totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    Today: ${stats.todayVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Transactions
                                </CardTitle>
                                <Activity className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {stats.totalTransactions.toLocaleString()}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Avg: ${stats.avgTransaction.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Success Rate
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {stats.successRate.toFixed(1)}%
                                </div>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                    {stats.failedTransactions} failed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Pending Settlement
                                </CardTitle>
                                <Wallet className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">
                                    ${stats.pendingSettlement.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Awaiting payout</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="transactions" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="mids">MIDs & Accounts</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>

                        {/* Transactions Tab */}
                        <TabsContent value="transactions" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <CardTitle>Recent Transactions</CardTitle>
                                            <CardDescription>View and manage your payment transactions</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Filters */}
                                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Search by transaction ID, email, or card..."
                                                className="pl-10"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full sm:w-40">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="settled">Settled</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="declined">Declined</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedMID} onValueChange={setSelectedMID}>
                                            <SelectTrigger className="w-full sm:w-48">
                                                <SelectValue placeholder="MID" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All MIDs</SelectItem>
                                                {mids.map(mid => (
                                                    <SelectItem key={mid.id} value={mid.mid}>
                                                        {mid.mid} - {mid.description}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Transactions Table */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Transaction ID</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Customer</TableHead>
                                                    <TableHead>Payment Method</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>MID</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredTransactions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                                            No transactions found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredTransactions.slice(0, 20).map((txn) => {
                                                        const statusConfig = getStatusConfig(txn.status);
                                                        const StatusIcon = statusConfig.icon;
                                                        return (
                                                            <TableRow key={txn.id}>
                                                                <TableCell className="font-mono text-sm">
                                                                    {txn.transaction_id?.slice(-12) || txn.id.slice(-12)}
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {new Date(txn.created_date).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    ${txn.amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm">
                                                                        <div className="font-medium">{txn.customer_name || 'N/A'}</div>
                                                                        <div className="text-slate-500">{txn.customer_email || ''}</div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <CreditCard className="h-4 w-4 text-slate-400" />
                                                                        <span className="text-sm">
                                                                            {txn.card_brand || txn.payment_method} •••• {txn.card_last_four}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
                                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                                        {statusConfig.label}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="font-mono text-xs text-slate-500">
                                                                    {txn.terminal_id || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="sm">
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>
                                                                                <Eye className="h-4 w-4 mr-2" />
                                                                                View Details
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <FileText className="h-4 w-4 mr-2" />
                                                                                Receipt
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* MIDs Tab */}
                        <TabsContent value="mids" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Merchant Identification Numbers (MIDs)</CardTitle>
                                    <CardDescription>View and manage your payment processing accounts</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {mids.length === 0 ? (
                                            <div className="col-span-full text-center py-8 text-slate-500">
                                                No MIDs configured yet
                                            </div>
                                        ) : (
                                            mids.map((mid) => (
                                                <Card key={mid.id} className="border-2">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <CardTitle className="text-base font-mono">{mid.mid}</CardTitle>
                                                                <CardDescription className="mt-1">{mid.description}</CardDescription>
                                                            </div>
                                                            <Badge variant={mid.status === 'active' ? 'default' : 'secondary'} className="bg-green-50 text-green-700 border-green-200">
                                                                {mid.status}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <p className="text-slate-500">Type</p>
                                                                <p className="font-medium">{mid.account_type}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-500">Currency</p>
                                                                <p className="font-medium">{mid.currency}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-500">Volume</p>
                                                                <p className="font-medium">${(mid.total_volume || 0).toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-500">Transactions</p>
                                                                <p className="font-medium">{(mid.total_transactions || 0).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        {mid.daily_limit && (
                                                            <div className="pt-3 border-t">
                                                                <p className="text-xs text-slate-500">Daily Limit</p>
                                                                <p className="text-sm font-medium">${mid.daily_limit.toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Overview</CardTitle>
                                        <CardDescription>Last 7 days</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Weekly Volume</span>
                                                <span className="font-medium">${stats.weeklyVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Success Rate</span>
                                                <span className="font-medium text-green-600">{stats.successRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Avg Transaction</span>
                                                <span className="font-medium">${stats.avgTransaction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Failed Transactions</span>
                                                <span className="font-medium text-red-600">{stats.failedTransactions}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                        <CardDescription>Common tasks</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start">
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Generate Report
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start"
                                            onClick={() => navigate(createPageUrl('MerchantAPIDocumentation'))}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            API Documentation
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Account Settings
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}