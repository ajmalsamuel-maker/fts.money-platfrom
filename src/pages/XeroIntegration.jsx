import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function XeroIntegration() {
    const queryClient = useQueryClient();
    const [selectedTransactions, setSelectedTransactions] = useState([]);

    const { data: xeroStatus, isLoading: statusLoading } = useQuery({
        queryKey: ['xero-status'],
        queryFn: async () => {
            const response = await base44.functions.invoke('xeroIntegration', {
                action: 'get_status',
                psp_id: 'current' // Should be dynamic based on logged-in PSP
            });
            return response.data;
        }
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 100)
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
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
                        <Tabs defaultValue="transactions" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

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