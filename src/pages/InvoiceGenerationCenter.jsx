import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Send, Eye, CheckCircle, Clock, Plus, Download, Calendar, Filter, Trash2, Mail, Settings } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { toast } from 'sonner';
import InvoiceTemplateDesigner from '@/components/billing/InvoiceTemplateDesigner';

export default function InvoiceGenerationCenter() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [invoiceTemplate, setInvoiceTemplate] = useState(null);

    const { data: invoices = [] } = useQuery({
        queryKey: ['consolidated-invoices'],
        queryFn: async () => {
            return await base44.entities.ConsolidatedInvoice.list('-created_date');
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

    const { data: paymentStatuses = [] } = useQuery({
        queryKey: ['payment-statuses'],
        queryFn: async () => {
            return await base44.entities.PaymentStatus.list();
        },
        enabled: !loading
    });

    const generateInvoiceMutation = useMutation({
        mutationFn: async (customerEmail) => {
            // Get all meters for this customer
            const customerMeters = meters.filter(m => m.customer_email === customerEmail);
            
            // Calculate line items from meters
            const lineItems = customerMeters.map(meter => ({
                service_type: meter.service_type,
                description: `${meter.metric_type} - ${meter.current_usage_count} units`,
                quantity: meter.current_usage_count,
                unit_price: meter.unit_price || 0,
                amount: meter.estimated_charge || 0,
                usage_details: {
                    period_start: meter.current_period_start,
                    period_end: meter.current_period_end,
                    included_units: meter.included_units,
                    overage_units: meter.overage_units
                }
            }));

            const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
            const taxAmount = subtotal * 0.1; // 10% tax example
            const totalAmount = subtotal + taxAmount;

            // Generate invoice number
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;

            // Create invoice
            const invoice = await base44.entities.ConsolidatedInvoice.create({
                invoice_number: invoiceNumber,
                customer_email: customerEmail,
                customer_name: customerEmail.split('@')[0],
                customer_type: customerMeters[0]?.customer_type || 'psp',
                billing_period_start: new Date().toISOString().split('T')[0],
                billing_period_end: new Date().toISOString().split('T')[0],
                line_items: lineItems,
                subtotal,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                currency: 'USD',
                status: 'draft',
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                services_included: [...new Set(lineItems.map(item => item.service_type))]
            });

            // Create payment status
            await base44.entities.PaymentStatus.create({
                invoice_id: invoice.id,
                invoice_number: invoiceNumber,
                customer_email: customerEmail,
                total_amount: totalAmount,
                amount_outstanding: totalAmount,
                payment_status: 'unpaid',
                due_date: invoice.due_date,
                payment_attempts: []
            });

            return invoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['consolidated-invoices']);
            toast.success('Invoice generated successfully');
        },
        onError: (error) => {
            toast.error(`Failed to generate invoice: ${error.message}`);
        }
    });

    const sendInvoiceMutation = useMutation({
        mutationFn: async (invoiceId) => {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            await base44.entities.ConsolidatedInvoice.update(invoiceId, {
                status: 'sent',
                sent_date: new Date().toISOString(),
                posted_to_community: true,
                posted_at: new Date().toISOString()
            });
            return invoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['consolidated-invoices']);
            toast.success('Invoice sent and posted to customer portal');
        }
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: async (invoiceId) => {
            await base44.entities.ConsolidatedInvoice.delete(invoiceId);
            const paymentStatus = paymentStatuses.find(ps => ps.invoice_id === invoiceId);
            if (paymentStatus) {
                await base44.entities.PaymentStatus.delete(paymentStatus.id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['consolidated-invoices']);
            queryClient.invalidateQueries(['payment-statuses']);
            toast.success('Invoice deleted');
        }
    });

    const bulkGenerateMutation = useMutation({
        mutationFn: async (customerEmails) => {
            const results = [];
            for (const email of customerEmails) {
                const customerMeters = meters.filter(m => m.customer_email === email);
                const lineItems = customerMeters.map(meter => ({
                    service_type: meter.service_type,
                    description: `${meter.metric_type} - ${meter.current_usage_count} units`,
                    quantity: meter.current_usage_count,
                    unit_price: meter.unit_price || 0,
                    amount: meter.estimated_charge || 0,
                    usage_details: {
                        period_start: meter.current_period_start,
                        period_end: meter.current_period_end,
                        included_units: meter.included_units,
                        overage_units: meter.overage_units
                    }
                }));

                const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
                if (subtotal === 0) continue;

                const taxAmount = subtotal * 0.1;
                const totalAmount = subtotal + taxAmount;
                const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + results.length + 1).padStart(4, '0')}`;

                const invoice = await base44.entities.ConsolidatedInvoice.create({
                    invoice_number: invoiceNumber,
                    customer_email: email,
                    customer_name: email.split('@')[0],
                    customer_type: customerMeters[0]?.customer_type || 'psp',
                    billing_period_start: new Date().toISOString().split('T')[0],
                    billing_period_end: new Date().toISOString().split('T')[0],
                    line_items: lineItems,
                    subtotal,
                    tax_amount: taxAmount,
                    total_amount: totalAmount,
                    currency: 'USD',
                    status: 'draft',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    services_included: [...new Set(lineItems.map(item => item.service_type))]
                });

                await base44.entities.PaymentStatus.create({
                    invoice_id: invoice.id,
                    invoice_number: invoiceNumber,
                    customer_email: email,
                    total_amount: totalAmount,
                    amount_outstanding: totalAmount,
                    payment_status: 'unpaid',
                    due_date: invoice.due_date,
                    payment_attempts: []
                });

                results.push(invoice);
            }
            return results;
        },
        onSuccess: (results) => {
            queryClient.invalidateQueries(['consolidated-invoices']);
            queryClient.invalidateQueries(['payment-statuses']);
            toast.success(`Generated ${results.length} invoices`);
            setSelectedCustomers([]);
        }
    });

    // Group customers by email
    const customerEmails = [...new Set(meters.map(m => m.customer_email))];

    // Filter invoices
    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const matchesSearch = !searchQuery || 
            inv.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Calculate stats
    const draftCount = invoices.filter(inv => inv.status === 'draft').length;
    const sentCount = invoices.filter(inv => inv.status === 'sent').length;
    const paidCount = invoices.filter(inv => inv.status === 'paid').length;
    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Handle bulk actions
    const handleBulkAction = () => {
        if (bulkAction === 'generate' && selectedCustomers.length > 0) {
            bulkGenerateMutation.mutate(selectedCustomers);
        } else if (bulkAction === 'send' && selectedCustomers.length > 0) {
            selectedCustomers.forEach(email => {
                const invoice = invoices.find(inv => inv.customer_email === email && inv.status === 'draft');
                if (invoice) sendInvoiceMutation.mutate(invoice.id);
            });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="InvoiceGenerationCenter"
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Invoice Generation Center</h2>
                        <p className="text-xs text-slate-600">Generate and send consolidated multi-service invoices</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedCustomers.length > 0 && (
                            <>
                                <Select value={bulkAction} onValueChange={setBulkAction}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Bulk Action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="generate">Generate All</SelectItem>
                                        <SelectItem value="send">Send All</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleBulkAction} disabled={!bulkAction}>
                                    Apply to {selectedCustomers.length}
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-slate-600">Draft Invoices</p>
                                        <p className="text-2xl font-bold text-slate-900">{draftCount}</p>
                                    </div>
                                    <FileText className="h-8 w-8 text-slate-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-slate-600">Sent Invoices</p>
                                        <p className="text-2xl font-bold text-blue-600">{sentCount}</p>
                                    </div>
                                    <Send className="h-8 w-8 text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-slate-600">Paid Invoices</p>
                                        <p className="text-2xl font-bold text-green-600">{paidCount}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Billed</p>
                                        <p className="text-2xl font-bold text-slate-900">${totalBilled.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="generate" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="generate">Generate New</TabsTrigger>
                            <TabsTrigger value="manage">Manage Invoices</TabsTrigger>
                            <TabsTrigger value="template">Invoice Template</TabsTrigger>
                        </TabsList>

                        <TabsContent value="generate" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Generate New Invoices</CardTitle>
                                <Button 
                                    onClick={() => bulkGenerateMutation.mutate(
                                        customerEmails.filter(email => {
                                            const total = meters.filter(m => m.customer_email === email)
                                                .reduce((sum, m) => sum + (m.estimated_charge || 0), 0);
                                            return total > 0;
                                        })
                                    )}
                                    disabled={bulkGenerateMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Generate All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {customerEmails.map((email) => {
                                    const customerMeters = meters.filter(m => m.customer_email === email);
                                    const estimatedTotal = customerMeters.reduce((sum, m) => sum + (m.estimated_charge || 0), 0);
                                    const hasUnbilledUsage = estimatedTotal > 0;
                                    const isSelected = selectedCustomers.includes(email);
                                    
                                    return (
                                        <div key={email} className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedCustomers([...selectedCustomers, email]);
                                                    } else {
                                                        setSelectedCustomers(selectedCustomers.filter(e => e !== email));
                                                    }
                                                }}
                                                disabled={!hasUnbilledUsage}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{email}</p>
                                                <p className="text-sm text-slate-600">
                                                    {customerMeters.length} service{customerMeters.length !== 1 ? 's' : ''}
                                                    {customerMeters.map(m => ` • ${m.service_type}`).join('')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-slate-900">
                                                        ${estimatedTotal.toFixed(2)}
                                                    </p>
                                                    {hasUnbilledUsage && (
                                                        <Badge className="bg-orange-100 text-orange-700">Unbilled</Badge>
                                                    )}
                                                    {!hasUnbilledUsage && (
                                                        <Badge className="bg-slate-100 text-slate-700">No usage</Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    onClick={() => generateInvoiceMutation.mutate(email)}
                                                    disabled={!hasUnbilledUsage || generateInvoiceMutation.isPending}
                                                    size="sm"
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Generate
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                        </TabsContent>

                        <TabsContent value="manage" className="space-y-4">

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <Input
                                    placeholder="Search invoices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                            </div>
                            <div className="space-y-2">
                                {filteredInvoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                                                <Badge className={
                                                    invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                    invoice.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }>
                                                    {invoice.status}
                                                </Badge>
                                                {invoice.posted_to_community && (
                                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                                        Posted
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600">{invoice.customer_email}</p>
                                            <div className="flex gap-2 mt-1">
                                                {invoice.services_included?.slice(0, 3).map(service => (
                                                    <Badge key={service} variant="outline" className="text-xs">
                                                        {service.split('_')[0]}
                                                    </Badge>
                                                ))}
                                                {invoice.services_included?.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{invoice.services_included.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    ${invoice.total_amount?.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {invoice.status === 'draft' && (
                                                    <>
                                                        <Button
                                                            onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                                                            disabled={sendInvoiceMutation.isPending}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                                                            disabled={deleteInvoiceMutation.isPending}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Invoice: {invoice.invoice_number}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Customer</p>
                                                                    <p className="font-medium">{invoice.customer_email}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Status</p>
                                                                    <Badge className={
                                                                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-slate-100 text-slate-700'
                                                                    }>
                                                                        {invoice.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Period</p>
                                                                    <p className="text-sm">{new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Due Date</p>
                                                                    <p className="text-sm">{new Date(invoice.due_date).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-slate-600 mb-2">Line Items</p>
                                                                {invoice.line_items?.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded mb-1">
                                                                        <div>
                                                                            <span className="text-sm font-medium">{item.service_type}</span>
                                                                            <p className="text-xs text-slate-600">{item.description}</p>
                                                                        </div>
                                                                        <span className="text-sm font-bold">${item.amount?.toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="border-t pt-3">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-sm">Subtotal</span>
                                                                    <span className="text-sm font-medium">${invoice.subtotal?.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-sm">Tax</span>
                                                                    <span className="text-sm font-medium">${invoice.tax_amount?.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between mt-2 pt-2 border-t">
                                                                    <span className="font-bold">Total</span>
                                                                    <span className="font-bold text-lg">${invoice.total_amount?.toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                        </TabsContent>

                        <TabsContent value="template" className="space-y-4">
                            <InvoiceTemplateDesigner 
                                onSave={(template) => {
                                    setInvoiceTemplate(template);
                                    // In production, save to database
                                }}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}