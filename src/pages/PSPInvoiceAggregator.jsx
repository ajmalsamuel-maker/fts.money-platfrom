import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, FileText, Download, Filter, TrendingUp, ArrowLeft } from 'lucide-react';

export default function PSPInvoiceAggregator() {
    const { platformUser, loading } = usePlatformAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [merchantFilter, setMerchantFilter] = useState('all');

    const { data: invoices = [] } = useQuery({
        queryKey: ['psp-all-invoices'],
        queryFn: () => base44.entities.Invoice.list()
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inv.merchant_code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const matchesMerchant = merchantFilter === 'all' || inv.merchant_code === merchantFilter;
        return matchesSearch && matchesStatus && matchesMerchant;
    });

    const stats = {
        total: invoices.length,
        totalValue: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'sent').length,
        merchants: new Set(invoices.map(i => i.merchant_code)).size
    };

    const exportInvoices = async () => {
        const response = await base44.functions.invoke('exportInvoiceReport', {
            invoices: filteredInvoices,
            format: 'csv'
        });
        
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PSPInvoiceAggregator"
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">PSP Invoice Aggregator</h2>
                            <p className="text-xs text-slate-600">View all merchant invoices</p>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6">

            <div className="grid grid-cols-5 gap-4">
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
                        <CardTitle className="text-sm text-slate-600">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
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
                        <CardTitle className="text-sm text-slate-600">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Active Merchants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.merchants}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Invoices
                        </CardTitle>
                        <Button onClick={exportInvoices} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Input
                                placeholder="Search by invoice # or merchant..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Merchant" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Merchants</SelectItem>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.merchant_code}>
                                            {m.business_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice List</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                            <p>No invoices found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredInvoices.map((invoice) => (
                                <div key={invoice.id} className="border rounded-lg p-4 hover:bg-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Building className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="font-medium">{invoice.invoice_number}</p>
                                            <p className="text-sm text-slate-600">{invoice.merchant_code}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold">${invoice.total_amount?.toLocaleString()}</p>
                                            <p className="text-xs text-slate-600">
                                                {new Date(invoice.invoice_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge className={
                                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                            'bg-slate-100 text-slate-700'
                                        }>
                                            {invoice.status}
                                        </Badge>
                                        <Button variant="outline" size="sm">Details</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
                </div>
            </div>
        </div>
    );
}