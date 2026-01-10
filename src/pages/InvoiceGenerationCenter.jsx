import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Eye, CheckCircle, Clock } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { toast } from 'sonner';

export default function InvoiceGenerationCenter() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();

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

    // Group customers by email
    const customerEmails = [...new Set(meters.map(m => m.customer_email))];

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
                </header>

                <div className="p-6 space-y-6">
                    {/* Generate Invoices Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate New Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {customerEmails.map((email) => {
                                    const customerMeters = meters.filter(m => m.customer_email === email);
                                    const estimatedTotal = customerMeters.reduce((sum, m) => sum + (m.estimated_charge || 0), 0);
                                    const hasUnbilledUsage = estimatedTotal > 0;
                                    
                                    return (
                                        <div key={email} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900">{email}</p>
                                                <p className="text-sm text-slate-600">
                                                    {customerMeters.length} service{customerMeters.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-slate-900">
                                                        ${estimatedTotal.toFixed(2)}
                                                    </p>
                                                    {hasUnbilledUsage && (
                                                        <Badge className="bg-orange-100 text-orange-700">Unbilled usage</Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    onClick={() => generateInvoiceMutation.mutate(email)}
                                                    disabled={!hasUnbilledUsage || generateInvoiceMutation.isPending}
                                                    className="bg-blue-600 hover:bg-blue-700"
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

                    {/* Recent Invoices */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                                            <p className="text-sm text-slate-600">{invoice.customer_email}</p>
                                            <div className="flex gap-2 mt-1">
                                                {invoice.services_included?.map(service => (
                                                    <Badge key={service} variant="outline" className="text-xs">
                                                        {service}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    ${invoice.total_amount?.toLocaleString()}
                                                </p>
                                                <Badge className={
                                                    invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                    invoice.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }>
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                            {invoice.status === 'draft' && (
                                                <Button
                                                    onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                                                    disabled={sendInvoiceMutation.isPending}
                                                    variant="outline"
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send
                                                </Button>
                                            )}
                                            {invoice.posted_to_community && (
                                                <CheckCircle className="h-5 w-5 text-green-500" title="Posted to customer portal" />
                                            )}
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