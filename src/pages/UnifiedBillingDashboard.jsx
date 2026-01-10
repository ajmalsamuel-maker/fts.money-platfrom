import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, AlertCircle, Clock, CheckCircle, FileText } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';

export default function UnifiedBillingDashboard() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [selectedPeriod, setSelectedPeriod] = useState('current_month');

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

    // Calculate metrics
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const pendingRevenue = invoices.filter(inv => inv.status === 'sent' || inv.status === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const overdueRevenue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalCustomers = new Set(invoices.map(inv => inv.customer_email)).size;

    const revenueByService = {};
    invoices.forEach(inv => {
        inv.services_included?.forEach(service => {
            if (!revenueByService[service]) revenueByService[service] = 0;
            const serviceLineItems = inv.line_items?.filter(item => item.service_type === service) || [];
            const serviceTotal = serviceLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
            revenueByService[service] += serviceTotal;
        });
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
                </header>

                <div className="p-6 space-y-6">
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

                    {/* Revenue by Service */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(revenueByService).map(([service, revenue]) => (
                                    <div key={service} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="font-medium text-slate-700">{service}</span>
                                        <span className="text-lg font-bold text-slate-900">${revenue.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Invoices */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Recent Invoices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {invoices.slice(0, 10).map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                                        <div>
                                            <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                                            <p className="text-sm text-slate-600">{invoice.customer_name || invoice.customer_email}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-900">${invoice.total_amount?.toLocaleString()}</p>
                                            <Badge className={
                                                invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }>
                                                {invoice.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}