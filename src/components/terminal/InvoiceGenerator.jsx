import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceGenerator({ merchants }) {
    const [formData, setFormData] = useState({
        merchant_id: '',
        template_id: '',
        customer_name: '',
        customer_email: '',
        customer_address: '',
        payment_terms: 'net_30',
        notes: '',
        line_items: [{
            description: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: 0
        }]
    });

    const queryClient = useQueryClient();

    const { data: templates = [] } = useQuery({
        queryKey: ['invoice-templates', formData.merchant_id],
        queryFn: () => formData.merchant_id ? 
            base44.entities.InvoiceTemplate.filter({ merchant_id: formData.merchant_id }) : 
            Promise.resolve([]),
        enabled: !!formData.merchant_id
    });

    const createInvoiceMutation = useMutation({
        mutationFn: async (data) => {
            const merchant = merchants.find(m => m.id === data.merchant_id);
            
            // Calculate totals
            const subtotal = data.line_items.reduce((sum, item) => {
                return sum + (item.quantity * item.unit_price);
            }, 0);
            
            const tax_amount = data.line_items.reduce((sum, item) => {
                return sum + (item.quantity * item.unit_price * (item.tax_rate / 100));
            }, 0);
            
            const total_amount = subtotal + tax_amount;
            
            // Calculate due date based on payment terms
            const issue_date = new Date();
            const due_date = new Date(issue_date);
            const termsDays = {
                'due_on_receipt': 0,
                'net_15': 15,
                'net_30': 30,
                'net_60': 60,
                'net_90': 90
            };
            due_date.setDate(due_date.getDate() + termsDays[data.payment_terms]);
            
            // Generate payment link
            const shortCode = Math.random().toString(36).substr(2, 8).toUpperCase();
            const payment_link = `${window.location.origin}/pay/${shortCode}`;
            
            // ISO 20022 data structure
            const iso20022Data = {
                payment_id: `INV-${Date.now()}`,
                end_to_end_id: `E2E-INV-${Date.now()}`,
                creditor_name: merchant?.business_name,
                creditor_account: merchant?.merchant_id,
                debtor_name: data.customer_name,
                remittance_info: `Invoice payment for ${merchant?.business_name}`,
                purpose_code: 'INVC' // Invoice payment
            };
            
            const invoice = await base44.entities.Invoice.create({
                invoice_id: `INV-${Date.now()}`,
                invoice_number: `INV-${Date.now().toString().slice(-6)}`,
                merchant_id: data.merchant_id,
                merchant_name: merchant?.business_name,
                customer_name: data.customer_name,
                customer_email: data.customer_email,
                customer_address: data.customer_address,
                status: 'sent',
                line_items: data.line_items.map(item => ({
                    ...item,
                    amount: item.quantity * item.unit_price * (1 + item.tax_rate / 100)
                })),
                subtotal,
                tax_amount,
                total_amount,
                currency: 'USD',
                issue_date: issue_date.toISOString().split('T')[0],
                due_date: due_date.toISOString().split('T')[0],
                payment_terms: data.payment_terms,
                notes: data.notes,
                payment_link,
                payment_link_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                iso20022_data: iso20022Data
            });
            
            // Send invoice email
            await base44.integrations.Core.SendEmail({
                to: data.customer_email,
                subject: `Invoice ${invoice.invoice_number} from ${merchant?.business_name}`,
                body: `
                    <h2>Invoice ${invoice.invoice_number}</h2>
                    <p>Amount Due: $${total_amount.toFixed(2)}</p>
                    <p>Due Date: ${due_date.toLocaleDateString()}</p>
                    <p><a href="${payment_link}">Pay Invoice Online</a></p>
                    <p>Thank you for your business!</p>
                `
            });
            
            return invoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Invoice created and sent successfully');
            // Reset form
            setFormData({
                merchant_id: '',
                customer_name: '',
                customer_email: '',
                customer_address: '',
                payment_terms: 'net_30',
                notes: '',
                line_items: [{
                    description: '',
                    quantity: 1,
                    unit_price: 0,
                    tax_rate: 0
                }]
            });
        },
        onError: (error) => {
            toast.error('Failed to create invoice: ' + error.message);
        }
    });

    const addLineItem = () => {
        setFormData({
            ...formData,
            line_items: [...formData.line_items, {
                description: '',
                quantity: 1,
                unit_price: 0,
                tax_rate: 0
            }]
        });
    };

    const removeLineItem = (index) => {
        setFormData({
            ...formData,
            line_items: formData.line_items.filter((_, i) => i !== index)
        });
    };

    const updateLineItem = (index, field, value) => {
        const newItems = [...formData.line_items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, line_items: newItems });
    };

    const calculateTotal = () => {
        return formData.line_items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unit_price;
            const taxAmount = itemTotal * (item.tax_rate / 100);
            return sum + itemTotal + taxAmount;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.merchant_id || !formData.customer_email || formData.line_items.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        await createInvoiceMutation.mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Merchant & Customer */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Merchant *</Label>
                    <Select value={formData.merchant_id} onValueChange={(val) => setFormData({...formData, merchant_id: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select merchant" />
                        </SelectTrigger>
                        <SelectContent>
                            {merchants.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Invoice Template</Label>
                    <Select value={formData.template_id} onValueChange={(val) => setFormData({...formData, template_id: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Use default template" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>Default Template</SelectItem>
                            {templates.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select value={formData.payment_terms} onValueChange={(val) => setFormData({...formData, payment_terms: val})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                            <SelectItem value="net_15">Net 15</SelectItem>
                            <SelectItem value="net_30">Net 30</SelectItem>
                            <SelectItem value="net_60">Net 60</SelectItem>
                            <SelectItem value="net_90">Net 90</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    placeholder="Customer name"
                />
            </div>

            <div className="space-y-2">
                <Label>Customer Email *</Label>
                <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    placeholder="customer@example.com"
                />
            </div>

            <div className="space-y-2">
                <Label>Customer Address</Label>
                <Textarea
                    value={formData.customer_address}
                    onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
                    placeholder="123 Main St, City, State 12345"
                    rows={2}
                />
            </div>

            {/* Line Items */}
            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <Label className="text-base">Line Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                    </Button>
                </div>

                {formData.line_items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-slate-700">Item {index + 1}</span>
                            {formData.line_items.length > 1 && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeLineItem(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            )}
                        </div>
                        
                        <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        />
                        
                        <div className="grid grid-cols-3 gap-3">
                            <Input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="Price"
                                value={item.unit_price}
                                onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            />
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="Tax %"
                                value={item.tax_rate}
                                onChange={(e) => updateLineItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900">${calculateTotal().toFixed(2)}</p>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes or payment instructions..."
                    rows={3}
                />
            </div>

            {/* Submit */}
            <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createInvoiceMutation.isPending}
            >
                {createInvoiceMutation.isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Invoice...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Create & Send Invoice
                    </>
                )}
            </Button>
        </form>
    );
}