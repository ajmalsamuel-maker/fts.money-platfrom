import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useStaffAuth } from '@/components/auth/useStaffAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    FileText, 
    Calendar, 
    DollarSign, 
    Users, 
    Send,
    Eye,
    Download,
    CheckCircle,
    Clock,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MerchantInvoiceGenerator() {
    const queryClient = useQueryClient();
    const { user, loading } = useStaffAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPspCode, setCurrentPspCode] = useState(null);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [billingPeriod, setBillingPeriod] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            setCurrentPspCode(session.psp_code);
        }
    }, []);

    // Fetch pending invoices
    const { data: pendingInvoices = [], refetch: refetchPending } = useQuery({
        queryKey: ['pending-invoices', currentPspCode],
        queryFn: async () => {
            if (!currentPspCode) return [];
            const { data } = await base44.functions.invoke('generateMerchantInvoice', {
                action: 'getPending',
                psp_code: currentPspCode
            });
            return data.pending || [];
        },
        enabled: !!currentPspCode
    });

    // Fetch recent invoices
    const { data: recentInvoices = [] } = useQuery({
        queryKey: ['recent-invoices', currentPspCode],
        queryFn: async () => {
            if (!currentPspCode) return [];
            const result = await base44.entities.Invoice.filter({ psp_code: currentPspCode });
            return result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 20);
        },
        enabled: !!currentPspCode
    });

    // Fetch merchants
    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants', currentPspCode],
        queryFn: async () => {
            if (!currentPspCode) return [];
            return await base44.entities.Merchant.filter({ psp_code: currentPspCode, status: 'active' });
        },
        enabled: !!currentPspCode
    });

    // Generate invoice mutation
    const generateInvoiceMutation = useMutation({
        mutationFn: async ({ merchant_id, billing_period_start, billing_period_end }) => {
            const { data } = await base44.functions.invoke('generateMerchantInvoice', {
                action: 'generate',
                merchant_id,
                psp_code: currentPspCode,
                billing_period_start,
                billing_period_end
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-invoices'] });
            queryClient.invalidateQueries({ queryKey: ['recent-invoices'] });
            queryClient.invalidateQueries({ queryKey: ['usage-meters'] });
            setSelectedMerchant(null);
        }
    });

    // Bulk generate mutation
    const bulkGenerateMutation = useMutation({
        mutationFn: async (merchantIds) => {
            const results = [];
            for (const merchant_id of merchantIds) {
                try {
                    const { data } = await base44.functions.invoke('generateMerchantInvoice', {
                        action: 'generate',
                        merchant_id,
                        psp_code: currentPspCode,
                        billing_period_start: billingPeriod.start,
                        billing_period_end: billingPeriod.end
                    });
                    results.push({ merchant_id, success: true, invoice: data.invoice });
                } catch (error) {
                    results.push({ merchant_id, success: false, error: error.message });
                }
            }
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-invoices'] });
            queryClient.invalidateQueries({ queryKey: ['recent-invoices'] });
            queryClient.invalidateQueries({ queryKey: ['usage-meters'] });
        }
    });

    // Preview invoice
    const handlePreview = async (merchant_id) => {
        try {
            const { data } = await base44.functions.invoke('generateMerchantInvoice', {
                action: 'preview',
                merchant_id,
                psp_code: currentPspCode
            });
            setPreviewData(data.preview);
            setShowPreview(true);
        } catch (error) {
            console.error('Preview error:', error);
        }
    };

    // Finalize invoice
    const finalizeInvoiceMutation = useMutation({
        mutationFn: async (invoice_id) => {
            const { data } = await base44.functions.invoke('generateMerchantInvoice', {
                action: 'finalize',
                invoice_id,
                psp_code: currentPspCode
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recent-invoices'] });
        }
    });

    const stats = [
        {
            label: 'Pending Invoices',
            value: pendingInvoices.length,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            label: 'Draft Invoices',
            value: recentInvoices.filter(i => i.status === 'draft').length,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Issued This Month',
            value: recentInvoices.filter(i => {
                const issueDate = new Date(i.issue_date);
                const now = new Date();
                return issueDate.getMonth() === now.getMonth() && 
                       issueDate.getFullYear() === now.getFullYear();
            }).length,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Total Revenue',
            value: `$${recentInvoices.filter(i => i.status === 'issued').reduce((sum, i) => sum + (i.total_amount || 0), 0).toFixed(2)}`,
            icon: DollarSign,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="MerchantInvoiceGenerator"
            />
            
            <div className="lg:ml-20">
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Invoice Generator</h2>
                            <p className="text-sm text-slate-600">Generate usage-based invoices for your merchants</p>
                        </div>
                        <Button
                            onClick={() => {
                                if (pendingInvoices.length > 0) {
                                    bulkGenerateMutation.mutate(pendingInvoices.map(p => p.merchant_id));
                                }
                            }}
                            disabled={pendingInvoices.length === 0 || bulkGenerateMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Generate All Pending ({pendingInvoices.length})
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={idx}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", stat.bg)}>
                                                <Icon className={cn("h-5 w-5", stat.color)} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">{stat.label}</p>
                                                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="pending" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="pending">
                                <Clock className="h-4 w-4 mr-2" />
                                Pending ({pendingInvoices.length})
                            </TabsTrigger>
                            <TabsTrigger value="recent">
                                <FileText className="h-4 w-4 mr-2" />
                                Recent Invoices
                            </TabsTrigger>
                            <TabsTrigger value="manual">
                                <Users className="h-4 w-4 mr-2" />
                                Manual Generation
                            </TabsTrigger>
                        </TabsList>

                        {/* Pending Invoices */}
                        <TabsContent value="pending">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pending Invoices</CardTitle>
                                    <CardDescription>Merchants with usage ready to be invoiced</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {pendingInvoices.length === 0 ? (
                                        <Alert>
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                No pending invoices. All merchants are up to date!
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingInvoices.map(pending => (
                                                <div key={pending.merchant_id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{pending.merchant_name}</p>
                                                        <div className="flex gap-4 mt-1 text-sm text-slate-600">
                                                            <span>Period ended: {new Date(pending.billing_period_end).toLocaleDateString()}</span>
                                                            <span>Usage: {pending.total_usage_count} transactions</span>
                                                            <span>Volume: ${pending.total_usage_volume.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePreview(pending.merchant_id)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Preview
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                const merchant = merchants.find(m => m.id === pending.merchant_id);
                                                                if (merchant) {
                                                                    const meters = [];
                                                                    base44.entities.MerchantUsageMeter.filter({ 
                                                                        merchant_id: pending.merchant_id,
                                                                        psp_code: currentPspCode 
                                                                    }).then(m => {
                                                                        if (m.length > 0) {
                                                                            generateInvoiceMutation.mutate({
                                                                                merchant_id: pending.merchant_id,
                                                                                billing_period_start: m[0].billing_period_start,
                                                                                billing_period_end: m[0].billing_period_end
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            }}
                                                            disabled={generateInvoiceMutation.isPending}
                                                        >
                                                            <FileText className="h-4 w-4 mr-1" />
                                                            Generate
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Recent Invoices */}
                        <TabsContent value="recent">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Invoices</CardTitle>
                                    <CardDescription>Last 20 generated invoices</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentInvoices.map(invoice => (
                                            <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                                                        <Badge className={
                                                            invoice.status === 'issued' ? 'bg-emerald-100 text-emerald-700' :
                                                            invoice.status === 'draft' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {invoice.status}
                                                        </Badge>
                                                        <Badge variant="outline" className={
                                                            invoice.payment_status === 'paid' ? 'text-emerald-600 border-emerald-600' :
                                                            invoice.payment_status === 'overdue' ? 'text-red-600 border-red-600' :
                                                            'text-amber-600 border-amber-600'
                                                        }>
                                                            {invoice.payment_status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-4 text-sm text-slate-600">
                                                        <span>{invoice.merchant_name}</span>
                                                        <span>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</span>
                                                        <span className="font-medium text-slate-900">${invoice.total_amount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {invoice.status === 'draft' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => finalizeInvoiceMutation.mutate(invoice.id)}
                                                            disabled={finalizeInvoiceMutation.isPending}
                                                        >
                                                            <Send className="h-4 w-4 mr-1" />
                                                            Finalize
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Manual Generation */}
                        <TabsContent value="manual">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manual Invoice Generation</CardTitle>
                                    <CardDescription>Generate invoice for specific merchant and period</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Merchant</Label>
                                            <select
                                                className="w-full mt-1 p-2 border border-slate-200 rounded-md"
                                                value={selectedMerchant || ''}
                                                onChange={(e) => setSelectedMerchant(e.target.value)}
                                            >
                                                <option value="">Select merchant...</option>
                                                {merchants.map(merchant => (
                                                    <option key={merchant.id} value={merchant.id}>
                                                        {merchant.business_name || merchant.merchant_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Period Start</Label>
                                                <Input
                                                    type="date"
                                                    value={billingPeriod.start}
                                                    onChange={(e) => setBillingPeriod({...billingPeriod, start: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <Label>Period End</Label>
                                                <Input
                                                    type="date"
                                                    value={billingPeriod.end}
                                                    onChange={(e) => setBillingPeriod({...billingPeriod, end: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => selectedMerchant && handlePreview(selectedMerchant)}
                                                variant="outline"
                                                disabled={!selectedMerchant}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Preview
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (selectedMerchant) {
                                                        generateInvoiceMutation.mutate({
                                                            merchant_id: selectedMerchant,
                                                            billing_period_start: billingPeriod.start,
                                                            billing_period_end: billingPeriod.end
                                                        });
                                                    }
                                                }}
                                                disabled={!selectedMerchant || generateInvoiceMutation.isPending}
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Generate Invoice
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Preview Dialog */}
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Invoice Preview</DialogTitle>
                                <DialogDescription>Review invoice before generating</DialogDescription>
                            </DialogHeader>
                            {previewData && (
                                <div className="space-y-4">
                                    <div className="border-b pb-4">
                                        <p className="font-medium text-lg">{previewData.merchant.business_name || previewData.merchant.merchant_name}</p>
                                        <p className="text-sm text-slate-600">{previewData.merchant.email}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 mb-2">Line Items:</p>
                                        <div className="space-y-2">
                                            {previewData.line_items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                                                    <span>{item.description} (x{item.quantity})</span>
                                                    <span className="font-medium">${item.amount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span>${previewData.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}