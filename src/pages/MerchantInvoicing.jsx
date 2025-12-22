import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Search, Plus, Send, Eye } from 'lucide-react';

export default function MerchantInvoicing() {
    const { user } = useMerchantAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMID, setSelectedMID] = useState('');
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        description: '',
        amount: '',
        currency: 'USD',
        due_date: '',
        status: 'draft',
        merchant_id: ''
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            const response = await base44.entities.Invoice.filter({ merchant_id: user.merchant_id }, '-created_date');
            return response || [];
        },
        enabled: !!user?.merchant_id
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Invoice.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            setDialogOpen(false);
            resetForm();
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            merchant_id: user.merchant_id,
            amount: parseFloat(formData.amount) || 0,
            invoice_number: `INV-${Date.now()}`
        });
    };

    const resetForm = () => {
        setFormData({
            customer_name: '',
            customer_email: '',
            description: '',
            amount: '',
            currency: 'USD',
            due_date: '',
            status: 'draft',
            merchant_id: ''
        });
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusColors = {
        draft: 'bg-gray-100 text-gray-800',
        sent: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
        overdue: 'bg-red-100 text-red-800',
        cancelled: 'bg-slate-100 text-slate-800'
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantInvoicing"
                user={user}
            />
            
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Invoicing</h1>
                            <p className="text-slate-500">Create and manage customer invoices</p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    New Invoice
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create Invoice</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Customer Name *</Label>
                                            <Input
                                                value={formData.customer_name}
                                                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Customer Email *</Label>
                                            <Input
                                                type="email"
                                                value={formData.customer_email}
                                                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Amount *</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Currency</Label>
                                            <Input
                                                value={formData.currency}
                                                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Due Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Create Invoice</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by customer or invoice number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading invoices...</div>
                            ) : filteredInvoices.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No invoices found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Invoice #</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Customer</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Due Date</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInvoices.map((invoice) => (
                                                <tr key={invoice.id} className="border-b hover:bg-slate-50">
                                                    <td className="py-3 px-4 font-medium text-slate-900">
                                                        {invoice.invoice_number}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{invoice.customer_name}</p>
                                                            <p className="text-sm text-slate-500">{invoice.customer_email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 font-medium text-slate-900">
                                                        {invoice.currency || 'USD'} {invoice.amount?.toFixed(2) || '0.00'}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600">
                                                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}>
                                                            {invoice.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex gap-1 justify-end">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Send className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}