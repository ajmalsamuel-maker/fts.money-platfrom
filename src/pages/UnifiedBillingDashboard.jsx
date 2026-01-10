import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, Users, AlertCircle, Clock, CheckCircle, FileText, Download, Filter, Calendar, BarChart3, Search, Eye, Mail } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { toast } from 'sonner';

export default function UnifiedBillingDashboard() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [selectedPeriod, setSelectedPeriod] = useState('current_month');
    const [statusFilter, setStatusFilter] = useState('all');
    const [customerSearch, setCustomerSearch] = useState('');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const { data: invoices = [] } = useQuery({
        queryKey: ['consolidated-invoices'],
        queryFn: async () => {
            return await base44.entities.ConsolidatedInvoice.list('-created_date');
        },
        enabled: !loading
    });

    const { data: paymentStatuses = [] } = useQuery({
        queryKey: ['payment-statuses'],
        queryFn: async () => {
            return await base44.entities.PaymentStatus.list();
        },
        enabled: !loading
    });

    const { data: meters = [] } = useQuery({
        queryKey: ['usage-meters'],
        queryFn: async () => {
            return await base44.entities.UsageMeter.list();
        },
        enabled: !loading
    });

    // Filter invoices
    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const matchesCustomer = !customerSearch || 
            inv.customer_email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
            inv.customer_name?.toLowerCase().includes(customerSearch.toLowerCase());
        const matchesService = serviceFilter === 'all' || 
            inv.services_included?.includes(serviceFilter);
        return matchesStatus && matchesCustomer && matchesService;
    });

    // Calculate metrics
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const pendingRevenue = invoices.filter(inv => inv.status === 'sent' || inv.status === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const overdueRevenue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalCustomers = new Set(invoices.map(inv => inv.customer_email)).size;
    const avgInvoiceValue = invoices.length > 0 ? invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / invoices.length : 0;
    const collectionRate = totalRevenue / (totalRevenue + pendingRevenue + overdueRevenue) * 100 || 0;

    const revenueByService = {};
    invoices.forEach(inv => {
        inv.services_included?.forEach(service => {
            if (!revenueByService[service]) revenueByService[service] = 0;
            const serviceLineItems = inv.line_items?.filter(item => item.service_type === service) || [];
            const serviceTotal = serviceLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
            revenueByService[service] += serviceTotal;
        });
    });

    const revenueByCustomerType = {};
    invoices.forEach(inv => {
        if (!revenueByCustomerType[inv.customer_type]) revenueByCustomerType[inv.customer_type] = 0;
        revenueByCustomerType[inv.customer_type] += inv.total_amount || 0;
    });

    // AR Aging
    const now = new Date();
    const arAging = {
        current: 0,
        days_1_30: 0,
        days_31_60: 0,
        days_61_90: 0,
        days_90_plus: 0
    };
    
    invoices.filter(inv => inv.status !== 'paid').forEach(inv => {
        const dueDate = new Date(inv.due_date);
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        if (daysOverdue < 0) arAging.current += inv.total_amount || 0;
        else if (daysOverdue <= 30) arAging.days_1_30 += inv.total_amount || 0;
        else if (daysOverdue <= 60) arAging.days_31_60 += inv.total_amount || 0;
        else if (daysOverdue <= 90) arAging.days_61_90 += inv.total_amount || 0;
        else arAging.days_90_plus += inv.total_amount || 0;
    });

    // Export function
    const exportToCSV = () => {
        const headers = ['Invoice Number', 'Customer', 'Type', 'Amount', 'Status', 'Due Date', 'Services'];
        const rows = filteredInvoices.map(inv => [
            inv.invoice_number,
            inv.customer_email,
            inv.customer_type,
            inv.total_amount,
            inv.status,
            inv.due_date,
            inv.services_included?.join('; ') || ''
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Exported to CSV');
    };

    // Mark as paid mutation
    const markAsPaidMutation = useMutation({
        mutationFn: async ({ invoiceId, paymentReference }) => {
            await base44.entities.ConsolidatedInvoice.update(invoiceId, {
                status: 'paid',
                paid_date: new Date().toISOString(),
                payment_reference: paymentReference
            });
            
            const paymentStatus = paymentStatuses.find(ps => ps.invoice_id === invoiceId);
            if (paymentStatus) {
                await base44.entities.PaymentStatus.update(paymentStatus.id, {
                    payment_status: 'paid',
                    amount_paid: paymentStatus.total_amount,
                    amount_outstanding: 0
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['consolidated-invoices']);
            queryClient.invalidateQueries(['payment-statuses']);
            toast.success('Invoice marked as paid');
        }
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="UnifiedBillingDashboard"
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Unified Billing Dashboard</h2>
                        <p className="text-xs text-slate-600">Real-time billing overview across all services</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={exportToCSV} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="ar_aging">AR Aging</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue (Paid)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Pending Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-blue-600">${pendingRevenue.toLocaleString()}</span>
                                    <Clock className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Overdue Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-red-600">${overdueRevenue.toLocaleString()}</span>
                                    <AlertCircle className="h-8 w-8 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Active Customers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-slate-900">{totalCustomers}</span>
                                    <Users className="h-8 w-8 text-slate-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Avg Invoice Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-xl font-bold text-slate-900">${avgInvoiceValue.toFixed(2)}</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Collection Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-xl font-bold text-green-600">{collectionRate.toFixed(1)}%</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total Invoices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-xl font-bold text-slate-900">{invoices.length}</span>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue by Service</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(revenueByService).map(([service, revenue]) => (
                                        <div key={service} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-700">{service}</span>
                                            <span className="text-sm font-bold text-slate-900">${revenue.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue by Customer Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(revenueByCustomerType).map(([type, revenue]) => (
                                        <div key={type} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-700">{type}</span>
                                            <span className="text-sm font-bold text-slate-900">${revenue.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    </TabsContent>

                        <TabsContent value="invoices" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoice Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 mb-4">
                                        <Input
                                            placeholder="Search customer..."
                                            value={customerSearch}
                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="sent">Sent</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Services</SelectItem>
                                                {Object.keys(revenueByService).map(service => (
                                                    <SelectItem key={service} value={service}>{service}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        {filteredInvoices.map((invoice) => (
                                            <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                                                        <Badge className={
                                                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {invoice.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{invoice.customer_email}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {invoice.services_included?.map(service => (
                                                            <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-slate-900">${invoice.total_amount?.toLocaleString()}</p>
                                                        <p className="text-xs text-slate-500">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Invoice Details: {invoice.invoice_number}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-sm text-slate-600">Customer</p>
                                                                        <p className="font-medium">{invoice.customer_email}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-slate-600">Amount</p>
                                                                        <p className="font-medium">${invoice.total_amount?.toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-600 mb-2">Line Items</p>
                                                                    {invoice.line_items?.map((item, idx) => (
                                                                        <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded mb-1">
                                                                            <span className="text-sm">{item.description}</span>
                                                                            <span className="text-sm font-medium">${item.amount?.toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {invoice.status !== 'paid' && (
                                                                    <Button 
                                                                        onClick={() => markAsPaidMutation.mutate({ invoiceId: invoice.id, paymentReference: 'Manual' })}
                                                                        className="w-full"
                                                                    >
                                                                        Mark as Paid
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue Trends</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-600">Total Billed</span>
                                                <span className="text-lg font-bold">${(totalRevenue + pendingRevenue + overdueRevenue).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-600">Collected</span>
                                                <span className="text-lg font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-600">Outstanding</span>
                                                <span className="text-lg font-bold text-orange-600">${(pendingRevenue + overdueRevenue).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Customers by Revenue</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                invoices.reduce((acc, inv) => {
                                                    acc[inv.customer_email] = (acc[inv.customer_email] || 0) + (inv.total_amount || 0);
                                                    return acc;
                                                }, {})
                                            )
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 5)
                                            .map(([email, revenue]) => (
                                                <div key={email} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="text-sm">{email}</span>
                                                    <span className="text-sm font-bold">${revenue.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="ar_aging" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Accounts Receivable Aging</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="font-medium">Current (Not Due)</span>
                                            <span className="text-lg font-bold text-green-600">${arAging.current.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                            <span className="font-medium">1-30 Days</span>
                                            <span className="text-lg font-bold text-yellow-600">${arAging.days_1_30.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                            <span className="font-medium">31-60 Days</span>
                                            <span className="text-lg font-bold text-orange-600">${arAging.days_31_60.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                            <span className="font-medium">61-90 Days</span>
                                            <span className="text-lg font-bold text-red-600">${arAging.days_61_90.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                                            <span className="font-medium">90+ Days</span>
                                            <span className="text-lg font-bold text-red-700">${arAging.days_90_plus.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}