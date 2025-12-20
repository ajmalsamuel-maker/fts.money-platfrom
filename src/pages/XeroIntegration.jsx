import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { 
    CheckCircle2, 
    XCircle, 
    RefreshCw, 
    ExternalLink,
    DollarSign,
    FileText,
    Users,
    TrendingUp,
    AlertCircle,
    BarChart3,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

export default function XeroIntegration() {
    const queryClient = useQueryClient();
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

    const { data: xeroStatus, isLoading: statusLoading, error: statusError } = useQuery({
        queryKey: ['xero-status'],
        queryFn: async () => {
            try {
                const response = await base44.functions.invoke('xeroIntegration', {
                    action: 'get_status',
                    psp_id: 'current'
                });
                return response.data;
            } catch (error) {
                console.error('Xero status error:', error);
                return { connected: false };
            }
        }
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 100)
    });

    const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
        queryKey: ['xero-metrics', dateFrom, dateTo],
        queryFn: async () => {
            try {
                const response = await base44.functions.invoke('xeroMetrics', {
                    psp_id: 'current',
                    date_from: dateFrom,
                    date_to: dateTo
                });
                return response.data;
            } catch (error) {
                console.error('Xero metrics error:', error);
                return { success: false };
            }
        },
        enabled: !!xeroStatus?.connected
    });

    const connectMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('xeroIntegration', {
                action: 'get_auth_url',
                psp_id: 'current'
            });
            window.location.href = response.data.auth_url;
        },
        onError: (error) => {
            toast.error('Failed to connect: ' + error.message);
        }
    });

    const disconnectMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('xeroIntegration', {
                action: 'disconnect',
                psp_id: 'current'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['xero-status']);
            toast.success('Disconnected from Xero');
        }
    });

    const syncMutation = useMutation({
        mutationFn: async (transaction_ids) => {
            const response = await base44.functions.invoke('xeroIntegration', {
                action: 'sync_transactions',
                psp_id: 'current',
                transaction_ids
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Transactions synced to Xero');
            setSelectedTransactions([]);
        },
        onError: (error) => {
            toast.error('Sync failed: ' + error.message);
        }
    });

    if (statusLoading) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar currentPage="XeroIntegration" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
                        <p className="text-slate-600">Loading Xero integration...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (statusError) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar currentPage="XeroIntegration" />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopHeader />
                    <div className="flex-1 flex items-center justify-center p-6">
                        <Card className="max-w-md">
                            <CardContent className="p-8 text-center">
                                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Integration Error</h2>
                                <p className="text-slate-600 mb-4">Unable to load Xero integration. Please check your configuration or try again later.</p>
                                <Button onClick={() => window.location.reload()}>Retry</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar currentPage="XeroIntegration" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader />
                <div className="flex-1 overflow-auto p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Xero Integration</h1>
                        <p className="text-slate-600">Cloud accounting integration for automated bookkeeping</p>
                    </div>

                    {/* Connection Status */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Connection Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {xeroStatus?.connected ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Connected to Xero</p>
                                                <p className="text-sm text-slate-600">Organization: {xeroStatus.tenant_name}</p>
                                                <p className="text-xs text-slate-500">
                                                    Connected: {format(new Date(xeroStatus.connected_at), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="destructive"
                                            onClick={() => disconnectMutation.mutate()}
                                            disabled={disconnectMutation.isPending}
                                        >
                                            Disconnect
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                                        <div className="bg-emerald-50 p-3 rounded-lg">
                                            <p className="text-xs text-emerald-700 mb-1">Auto-Sync</p>
                                            <p className="text-lg font-bold text-emerald-900">Enabled</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-xs text-blue-700 mb-1">Last Sync</p>
                                            <p className="text-lg font-bold text-blue-900">2 hours ago</p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                            <p className="text-xs text-purple-700 mb-1">Synced Today</p>
                                            <p className="text-lg font-bold text-purple-900">156</p>
                                        </div>
                                        <div className="bg-amber-50 p-3 rounded-lg">
                                            <p className="text-xs text-amber-700 mb-1">Pending</p>
                                            <p className="text-lg font-bold text-amber-900">23</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 mb-4">Not connected to Xero</p>
                                    <Button 
                                        onClick={() => connectMutation.mutate()}
                                        disabled={connectMutation.isPending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Connect to Xero
                                    </Button>
                                    <p className="text-xs text-slate-500 mt-3">
                                        You'll be redirected to Xero to authorize access
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {xeroStatus?.connected && (
                        <Tabs defaultValue="dashboard" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="dashboard">
                                {/* Date Range Filter */}
                                <Card className="mb-6">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <Calendar className="h-5 w-5 text-slate-600" />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div>
                                                    <label className="text-xs text-slate-600 mb-1 block">From</label>
                                                    <Input 
                                                        type="date" 
                                                        value={dateFrom}
                                                        onChange={(e) => setDateFrom(e.target.value)}
                                                        className="w-40"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-600 mb-1 block">To</label>
                                                    <Input 
                                                        type="date" 
                                                        value={dateTo}
                                                        onChange={(e) => setDateTo(e.target.value)}
                                                        className="w-40"
                                                    />
                                                </div>
                                                <Button 
                                                    onClick={() => refetchMetrics()}
                                                    disabled={metricsLoading}
                                                    className="mt-5"
                                                >
                                                    <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
                                                    Refresh
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {metricsLoading ? (
                                    <div className="text-center py-12">
                                        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
                                        <p className="text-slate-600">Loading metrics from Xero...</p>
                                    </div>
                                ) : metrics?.success ? (
                                    <>
                                        {/* Key Metrics */}
                                        <div className="grid grid-cols-4 gap-4 mb-6">
                                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <DollarSign className="h-8 w-8 opacity-80" />
                                                        <TrendingUp className="h-5 w-5 opacity-60" />
                                                    </div>
                                                    <p className="text-xs text-blue-100 mb-1">Total Invoiced</p>
                                                    <p className="text-2xl font-bold">
                                                        ${metrics.metrics.total_invoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-xs text-blue-100 mt-2">
                                                        {metrics.metrics.total_invoices} invoices
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <CheckCircle2 className="h-8 w-8 opacity-80" />
                                                    </div>
                                                    <p className="text-xs text-emerald-100 mb-1">Total Paid</p>
                                                    <p className="text-2xl font-bold">
                                                        ${metrics.metrics.total_paid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-xs text-emerald-100 mt-2">
                                                        {((metrics.metrics.total_paid / metrics.metrics.total_invoiced) * 100).toFixed(1)}% collected
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <AlertCircle className="h-8 w-8 opacity-80" />
                                                    </div>
                                                    <p className="text-xs text-amber-100 mb-1">Outstanding Balance</p>
                                                    <p className="text-2xl font-bold">
                                                        ${metrics.metrics.outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-xs text-amber-100 mt-2">
                                                        {metrics.metrics.overdue_invoices} overdue
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Users className="h-8 w-8 opacity-80" />
                                                    </div>
                                                    <p className="text-xs text-purple-100 mb-1">Total Contacts</p>
                                                    <p className="text-2xl font-bold">
                                                        {metrics.metrics.total_contacts}
                                                    </p>
                                                    <p className="text-xs text-purple-100 mt-2">
                                                        Active customers
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Financial Performance */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                                        Revenue
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-2xl font-bold text-emerald-600">
                                                        ${metrics.metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-red-600" />
                                                        Expenses
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-2xl font-bold text-red-600">
                                                        ${metrics.metrics.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <BarChart3 className="h-4 w-4 text-blue-600" />
                                                        Net Profit
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className={`text-2xl font-bold ${metrics.metrics.net_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                        ${metrics.metrics.net_profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Invoice Status Breakdown */}
                                        <Card className="mb-6">
                                            <CardHeader>
                                                <CardTitle>Invoice Status Breakdown</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-5 gap-3">
                                                    <div className="bg-slate-50 p-4 rounded-lg text-center">
                                                        <p className="text-xs text-slate-600 mb-1">Draft</p>
                                                        <p className="text-2xl font-bold text-slate-900">{metrics.invoices_by_status.draft}</p>
                                                    </div>
                                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                                        <p className="text-xs text-blue-600 mb-1">Submitted</p>
                                                        <p className="text-2xl font-bold text-blue-900">{metrics.invoices_by_status.submitted}</p>
                                                    </div>
                                                    <div className="bg-amber-50 p-4 rounded-lg text-center">
                                                        <p className="text-xs text-amber-600 mb-1">Authorised</p>
                                                        <p className="text-2xl font-bold text-amber-900">{metrics.invoices_by_status.authorised}</p>
                                                    </div>
                                                    <div className="bg-emerald-50 p-4 rounded-lg text-center">
                                                        <p className="text-xs text-emerald-600 mb-1">Paid</p>
                                                        <p className="text-2xl font-bold text-emerald-900">{metrics.invoices_by_status.paid}</p>
                                                    </div>
                                                    <div className="bg-red-50 p-4 rounded-lg text-center">
                                                        <p className="text-xs text-red-600 mb-1">Voided</p>
                                                        <p className="text-2xl font-bold text-red-900">{metrics.invoices_by_status.voided}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Recent Invoices */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Recent Invoices</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left py-3 px-4 font-semibold">Invoice #</th>
                                                                <th className="text-left py-3 px-4 font-semibold">Contact</th>
                                                                <th className="text-left py-3 px-4 font-semibold">Date</th>
                                                                <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                                                                <th className="text-right py-3 px-4 font-semibold">Total</th>
                                                                <th className="text-right py-3 px-4 font-semibold">Amount Due</th>
                                                                <th className="text-center py-3 px-4 font-semibold">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {metrics.recent_invoices.map((inv) => (
                                                                <tr key={inv.id} className="border-b hover:bg-slate-50">
                                                                    <td className="py-3 px-4 font-mono text-xs">{inv.number}</td>
                                                                    <td className="py-3 px-4">{inv.contact}</td>
                                                                    <td className="py-3 px-4">{format(new Date(inv.date), 'MMM dd, yyyy')}</td>
                                                                    <td className="py-3 px-4">{format(new Date(inv.due_date), 'MMM dd, yyyy')}</td>
                                                                    <td className="py-3 px-4 text-right font-mono">${inv.total.toFixed(2)}</td>
                                                                    <td className="py-3 px-4 text-right font-mono">${inv.amount_due.toFixed(2)}</td>
                                                                    <td className="py-3 px-4 text-center">
                                                                        <Badge className={
                                                                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                                            inv.status === 'AUTHORISED' ? 'bg-amber-100 text-amber-700' :
                                                                            inv.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                        }>
                                                                            {inv.status}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <p className="text-slate-600">Unable to load metrics</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="transactions">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Sync Transactions</CardTitle>
                                            <Button
                                                onClick={() => syncMutation.mutate(selectedTransactions)}
                                                disabled={selectedTransactions.length === 0 || syncMutation.isPending}
                                            >
                                                <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                                                Sync Selected ({selectedTransactions.length})
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left py-3 px-4">
                                                            <input 
                                                                type="checkbox"
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedTransactions(transactions.map(t => t.id));
                                                                    } else {
                                                                        setSelectedTransactions([]);
                                                                    }
                                                                }}
                                                            />
                                                        </th>
                                                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                                                        <th className="text-left py-3 px-4 font-semibold">Merchant</th>
                                                        <th className="text-left py-3 px-4 font-semibold">Amount</th>
                                                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                                                        <th className="text-left py-3 px-4 font-semibold">Synced</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.map((txn) => (
                                                        <tr key={txn.id} className="border-b hover:bg-slate-50">
                                                            <td className="py-3 px-4">
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={selectedTransactions.includes(txn.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedTransactions([...selectedTransactions, txn.id]);
                                                                        } else {
                                                                            setSelectedTransactions(selectedTransactions.filter(id => id !== txn.id));
                                                                        }
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {format(new Date(txn.created_date), 'MMM dd, yyyy')}
                                                            </td>
                                                            <td className="py-3 px-4">{txn.merchant_name}</td>
                                                            <td className="py-3 px-4 font-mono">
                                                                ${txn.amount?.toFixed(2)}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <Badge className={
                                                                    txn.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                    txn.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }>
                                                                    {txn.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {txn.xero_synced ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-slate-300" />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="invoices">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Invoice Management</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">Automatic invoice creation in Xero for completed transactions</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="contacts">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Contact Sync</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">Merchants and customers automatically synced as Xero contacts</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Sync Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-3 border-b">
                                                <div>
                                                    <p className="font-medium text-slate-900">Auto-sync transactions</p>
                                                    <p className="text-sm text-slate-600">Automatically sync completed transactions to Xero</p>
                                                </div>
                                                <input type="checkbox" defaultChecked className="toggle" />
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b">
                                                <div>
                                                    <p className="font-medium text-slate-900">Create invoices</p>
                                                    <p className="text-sm text-slate-600">Generate invoices in Xero for each transaction</p>
                                                </div>
                                                <input type="checkbox" defaultChecked className="toggle" />
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b">
                                                <div>
                                                    <p className="font-medium text-slate-900">Sync contacts</p>
                                                    <p className="text-sm text-slate-600">Keep merchant and customer data in sync</p>
                                                </div>
                                                <input type="checkbox" defaultChecked className="toggle" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
}