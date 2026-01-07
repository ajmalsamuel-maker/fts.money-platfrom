import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, DollarSign, FileText, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformBillingPortal() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        client_type: 'psp',
        client_code: '',
        billing_period: '',
        items: []
    });

    const queryClient = useQueryClient();

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['all-merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const { data: platformInvoices = [] } = useQuery({
        queryKey: ['platform-invoices'],
        queryFn: () => base44.entities.Invoice.filter({ invoice_type: 'platform_billing' })
    });

    const generateInvoiceMutation = useMutation({
        mutationFn: async (data) => {
            const result = await base44.functions.invoke('generatePlatformInvoice', data);
            return result.data;
        },
        onSuccess: () => {
            toast.success('Invoice generated successfully!');
            setCreateDialogOpen(false);
            queryClient.invalidateQueries(['platform-invoices']);
        }
    });

    const stats = {
        totalInvoices: platformInvoices.length,
        totalRevenue: platformInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
        paidInvoices: platformInvoices.filter(i => i.status === 'paid').length,
        pendingRevenue: platformInvoices
            .filter(i => i.status === 'sent')
            .reduce((sum, i) => sum + (i.total_amount || 0), 0)
    };

    const handleGenerateInvoice = () => {
        generateInvoiceMutation.mutate(invoiceData);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Platform Billing</h1>
                        <p className="text-slate-600">Generate and manage invoices for PSPs and merchants</p>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Invoice
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Total Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.paidInvoices}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">${stats.pendingRevenue.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    {platformInvoices.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                            <p>No invoices generated yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {platformInvoices.map((invoice) => (
                                <div key={invoice.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Building className="h-5 w-5 text-slate-400" />
                                            <div>
                                                <p className="font-medium">{invoice.invoice_number}</p>
                                                <p className="text-sm text-slate-600">
                                                    {invoice.merchant_code || invoice.psp_code}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold">${invoice.total_amount?.toLocaleString()}</p>
                                                <p className="text-xs text-slate-600">
                                                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge className={
                                                invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }>
                                                {invoice.status}
                                            </Badge>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Generate Platform Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Client Type</Label>
                            <Select 
                                value={invoiceData.client_type} 
                                onValueChange={(value) => setInvoiceData({...invoiceData, client_type: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="psp">PSP</SelectItem>
                                    <SelectItem value="merchant">Merchant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>{invoiceData.client_type === 'psp' ? 'PSP' : 'Merchant'}</Label>
                            <Select 
                                value={invoiceData.client_code} 
                                onValueChange={(value) => setInvoiceData({...invoiceData, client_code: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(invoiceData.client_type === 'psp' ? psps : merchants).map(client => (
                                        <SelectItem 
                                            key={client.id} 
                                            value={client.psp_code || client.merchant_code}
                                        >
                                            {client.psp_name || client.business_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Billing Period</Label>
                            <Input
                                type="month"
                                value={invoiceData.billing_period}
                                onChange={(e) => setInvoiceData({...invoiceData, billing_period: e.target.value})}
                            />
                        </div>

                        <Button 
                            onClick={handleGenerateInvoice}
                            disabled={generateInvoiceMutation.isPending}
                            className="w-full"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {generateInvoiceMutation.isPending ? 'Generating...' : 'Generate & Send Invoice'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}