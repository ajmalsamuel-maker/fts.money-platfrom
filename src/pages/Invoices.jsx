import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { FileText, Download, Search, Filter, Calendar, DollarSign } from 'lucide-react';

export default function Invoices() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [merchantFilter, setMerchantFilter] = useState('all');

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => base44.entities.Invoice.list('-invoice_date')
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = !searchQuery || 
            inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const matchesMerchant = merchantFilter === 'all' || inv.merchant_id === merchantFilter;
        return matchesSearch && matchesStatus && matchesMerchant;
    });

    const getStatusBadge = (status) => {
        const configs = {
            draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
            issued: { label: 'Issued', className: 'bg-blue-100 text-blue-700' },
            paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
            partially_paid: { label: 'Partially Paid', className: 'bg-amber-100 text-amber-700' },
            overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
            cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-700' }
        };
        const config = configs[status] || configs.draft;
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'issued').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Invoices" />
            <div className={cn("transition-all duration-300", "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Invoices</h1>
                                <p className="text-slate-500">Manage merchant billing and invoices</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Total Invoices</p>
                                            <p className="text-2xl font-bold">{stats.total}</p>
                                        </div>
                                        <FileText className="h-8 w-8 text-slate-400" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Paid</p>
                                            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                                        </div>
                                        <DollarSign className="h-8 w-8 text-green-400" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Pending</p>
                                            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-blue-400" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Total Revenue</p>
                                            <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                                        </div>
                                        <DollarSign className="h-8 w-8 text-emerald-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>All Invoices</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search invoices..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 w-64"
                                        />
                                    </div>
                                    <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="All Merchants" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Merchants</SelectItem>
                                            {merchants.map(m => (
                                                <SelectItem key={m.id} value={m.merchant_id}>
                                                    {m.business_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="issued">Issued</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Invoice Date</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInvoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                                No invoices found. Invoices are generated automatically during billing cycles.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInvoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                                                <TableCell className="font-medium">{invoice.merchant_name}</TableCell>
                                                <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-xs">
                                                    {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {invoice.currency} {invoice.total_amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                                <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost">
                                                        <Download className="h-3 w-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}