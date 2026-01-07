import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceUploadManager from '@/components/invoice/InvoiceUploadManager';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { FileText, DollarSign, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

export default function MerchantInvoicePortal() {
    const merchantSession = localStorage.getItem('merchantSession');
    const merchant = merchantSession ? JSON.parse(merchantSession) : null;
    const [selectedMID, setSelectedMID] = useState('');

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids', merchant?.merchant_code],
        queryFn: () => base44.entities.MerchantMID.filter({ merchant_code: merchant.merchant_code }),
        enabled: !!merchant
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids]);

    const { data: invoices = [] } = useQuery({
        queryKey: ['merchant-invoices', merchant?.merchant_code],
        queryFn: () => base44.entities.Invoice.filter({ 
            merchant_code: merchant.merchant_code 
        }),
        enabled: !!merchant
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['merchant-transactions', merchant?.merchant_code],
        queryFn: () => base44.entities.Transaction.filter({ 
            merchant_code: merchant.merchant_code,
            status: 'completed'
        }),
        enabled: !!merchant
    });

    const getStatusBadge = (status) => {
        const config = {
            draft: { color: 'bg-slate-100 text-slate-700', icon: Clock },
            sent: { color: 'bg-blue-100 text-blue-700', icon: Clock },
            paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
            cancelled: { color: 'bg-slate-100 text-slate-700', icon: AlertCircle }
        };
        return config[status] || config.draft;
    };

    const unmatchedTransactions = transactions.filter(t => 
        !invoices.some(inv => inv.transaction_id === t.transaction_id)
    );

    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'sent').length,
        totalValue: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
        unmatched: unmatchedTransactions.length
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                currentPage="MerchantInvoicePortal"
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                user={merchant}
                merchant={merchant}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={merchant} merchant={merchant} />
                <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Invoice Management</h1>
                <p className="text-slate-600">Upload, manage, and reconcile invoices with payments</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Total Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Unmatched Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">{stats.unmatched}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList>
                    <TabsTrigger value="upload">Upload Invoice</TabsTrigger>
                    <TabsTrigger value="invoices">My Invoices</TabsTrigger>
                    <TabsTrigger value="reconcile">Reconciliation</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6">
                    <InvoiceUploadManager merchantCode={merchant?.merchant_code} />
                </TabsContent>

                <TabsContent value="invoices" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                    <p>No invoices uploaded yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map((invoice) => {
                                        const statusInfo = getStatusBadge(invoice.status);
                                        const StatusIcon = statusInfo.icon;
                                        
                                        return (
                                            <div key={invoice.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-slate-400" />
                                                        <div>
                                                            <p className="font-medium">{invoice.invoice_number}</p>
                                                            <p className="text-sm text-slate-600">
                                                                {new Date(invoice.invoice_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="font-bold">${invoice.total_amount?.toLocaleString()}</p>
                                                            <p className="text-xs text-slate-600">{invoice.currency || 'USD'}</p>
                                                        </div>
                                                        <Badge className={statusInfo.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {invoice.status}
                                                        </Badge>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reconcile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Unmatched Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {unmatchedTransactions.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-2" />
                                    <p>All payments matched to invoices</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {unmatchedTransactions.map((txn) => (
                                        <div key={txn.id} className="border rounded-lg p-4 bg-yellow-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{txn.transaction_id}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {new Date(txn.created_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-bold">${txn.amount?.toLocaleString()}</p>
                                                    <Button size="sm">Match to Invoice</Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
                </div>
            </div>
        </div>
    );
}