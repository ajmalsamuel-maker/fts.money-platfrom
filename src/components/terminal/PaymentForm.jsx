import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentForm({ merchants }) {
    const [formData, setFormData] = useState({
        merchant_id: '',
        amount: '',
        currency: 'USD',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        card_number: '',
        card_expiry: '',
        card_cvv: '',
        billing_zip: '',
        description: '',
        reference_number: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    const queryClient = useQueryClient();

    const processPaymentMutation = useMutation({
        mutationFn: async (data) => {
            const merchant = merchants.find(m => m.id === data.merchant_id);
            
            // Generate ISO 20022 compliant data structure
            const iso20022Data = {
                payment_id: `PMT-${Date.now()}`,
                end_to_end_id: `E2E-${Date.now()}`,
                instruction_id: `INSTR-${Date.now()}`,
                creditor_name: merchant?.business_name,
                creditor_account: merchant?.merchant_id,
                debtor_name: data.customer_name,
                debtor_account: `****${data.card_number.slice(-4)}`,
                remittance_info: data.description || 'Payment',
                purpose_code: 'GPAY', // General Payment
                requested_execution_date: new Date().toISOString().split('T')[0]
            };

            const transaction = await base44.entities.Transaction.create({
                transaction_id: `TXN-${Date.now()}`,
                merchant_id: data.merchant_id,
                merchant_name: merchant?.business_name,
                type: 'sale',
                status: 'approved',
                amount: parseFloat(data.amount),
                currency: data.currency,
                payment_method: 'visa',
                card_last_four: data.card_number.slice(-4),
                card_brand: 'visa',
                customer_name: data.customer_name,
                customer_email: data.customer_email,
                description: data.description,
                auth_code: `AUTH${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                response_code: '00',
                response_message: 'Approved',
                iso20022_data: iso20022Data
            });

            return transaction;
        },
        onSuccess: (transaction) => {
            queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
            setPaymentSuccess(true);
            setReceiptData(transaction);
            toast.success('Payment processed successfully');
        },
        onError: (error) => {
            toast.error('Payment failed: ' + error.message);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.merchant_id || !formData.amount || !formData.customer_email) {
            toast.error('Please fill in all required fields');
            return;
        }

        await processPaymentMutation.mutate(formData);
    };

    const handleReset = () => {
        setFormData({
            merchant_id: '',
            amount: '',
            currency: 'USD',
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            card_number: '',
            card_expiry: '',
            card_cvv: '',
            billing_zip: '',
            description: '',
            reference_number: ''
        });
        setPaymentSuccess(false);
        setReceiptData(null);
    };

    if (paymentSuccess && receiptData) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Payment Successful!</h3>
                <p className="text-slate-600 mb-4">Transaction ID: {receiptData.transaction_id}</p>
                
                <div className="bg-slate-50 rounded-lg p-6 max-w-md mx-auto mb-6">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Amount:</span>
                            <span className="font-semibold">${receiptData.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Card:</span>
                            <span className="font-semibold">****{receiptData.card_last_four}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Auth Code:</span>
                            <span className="font-semibold">{receiptData.auth_code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Customer:</span>
                            <span className="font-semibold">{receiptData.customer_email}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleReset}>
                        New Payment
                    </Button>
                    <Button onClick={() => window.print()}>
                        Print Receipt
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Merchant Selection */}
            <div className="space-y-2">
                <Label>Merchant *</Label>
                <Select value={formData.merchant_id} onValueChange={(val) => setFormData({...formData, merchant_id: val})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select merchant account" />
                    </SelectTrigger>
                    <SelectContent>
                        {merchants.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                    <Label>Amount *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-slate-900">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                            value={formData.customer_name}
                            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                            placeholder="john@example.com"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                        placeholder="+1 234 567 8900"
                    />
                </div>
            </div>

            {/* Card Information */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                </h3>
                <div className="space-y-2">
                    <Label>Card Number *</Label>
                    <Input
                        value={formData.card_number}
                        onChange={(e) => setFormData({...formData, card_number: e.target.value.replace(/\s/g, '')})}
                        placeholder="4242 4242 4242 4242"
                        maxLength={16}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Expiry (MM/YY) *</Label>
                        <Input
                            value={formData.card_expiry}
                            onChange={(e) => setFormData({...formData, card_expiry: e.target.value})}
                            placeholder="12/25"
                            maxLength={5}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>CVV *</Label>
                        <Input
                            type="password"
                            value={formData.card_cvv}
                            onChange={(e) => setFormData({...formData, card_cvv: e.target.value})}
                            placeholder="123"
                            maxLength={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>ZIP Code *</Label>
                        <Input
                            value={formData.billing_zip}
                            onChange={(e) => setFormData({...formData, billing_zip: e.target.value})}
                            placeholder="10001"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Payment for..."
                        rows={2}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Reference Number</Label>
                    <Input
                        value={formData.reference_number}
                        onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                        placeholder="REF-12345"
                    />
                </div>
            </div>

            {/* Submit */}
            <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={processPaymentMutation.isPending}
            >
                {processPaymentMutation.isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                    </>
                )}
            </Button>
        </form>
    );
}