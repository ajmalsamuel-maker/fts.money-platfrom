import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PSPPageWrapper from '@/components/layout/PSPPageWrapper';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function ProcessPayment() {
    const [merchants, setMerchants] = useState([]);
    const [userPspCode, setUserPspCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        merchant_id: '',
        amount: '',
        currency: 'USD',
        payment_method: 'card',
        customer_email: '',
        customer_name: '',
        customer_country: 'US',
        description: '',
        order_id: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const session = JSON.parse(localStorage.getItem('staff_session') || '{}');
                setUserPspCode(session.psp_code);

                if (session.psp_code) {
                    const result = await base44.functions.invoke('pspData', {
                        action: 'listMerchants',
                        psp_code: session.psp_code
                    });
                    setMerchants(result.data.data || []);
                }
            } catch (error) {
                console.error('Load error:', error);
                toast.error('Failed to load merchants');
            }
            setLoading(false);
        };

        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setResult(null);

        try {
            const response = await base44.functions.invoke('processPayment', {
                merchant_id: formData.merchant_id,
                psp_code: userPspCode,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                payment_method: formData.payment_method,
                customer_email: formData.customer_email,
                customer_name: formData.customer_name,
                customer_country: formData.customer_country,
                description: formData.description,
                order_id: formData.order_id || `TEST-${Date.now()}`
            });

            console.log('Payment response:', response.data);
            setResult(response.data);

            if (response.data.success) {
                toast.success('Payment processed successfully');
                // Reset form
                setFormData({
                    ...formData,
                    amount: '',
                    customer_email: '',
                    customer_name: '',
                    description: '',
                    order_id: ''
                });
            } else {
                toast.error(response.data.error || 'Payment failed');
            }
        } catch (error) {
            console.error('Processing error:', error);
            toast.error(error.message);
            setResult({
                success: false,
                error: error.message
            });
        }
        setProcessing(false);
    };

    const selectedMerchant = merchants.find(m => m.id === formData.merchant_id);

    return (
        <PSPPageWrapper currentPage="ProcessPayment">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Process Payment</h1>
                        <p className="text-slate-500">Test payment processing through provisioned connectors</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Merchant Selection */}
                                <div className="space-y-2">
                                    <Label>Merchant *</Label>
                                    <Select
                                        value={formData.merchant_id}
                                        onValueChange={(val) => setFormData({...formData, merchant_id: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select merchant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {merchants.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.business_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Merchant Info */}
                                {selectedMerchant && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-blue-600 font-medium">Status</p>
                                                <Badge className="bg-emerald-100 text-emerald-700">{selectedMerchant.status}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-medium">Risk Level</p>
                                                <Badge className="bg-yellow-100 text-yellow-700">{selectedMerchant.risk_level}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-medium">Currency</p>
                                                <p className="text-slate-700">{selectedMerchant.currency || 'USD'}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-medium">Processing Limit</p>
                                                <p className="text-slate-700">${selectedMerchant.processing_volume?.toLocaleString() || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Amount & Currency */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Amount *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Currency *</Label>
                                        <Select
                                            value={formData.currency}
                                            onValueChange={(val) => setFormData({...formData, currency: val})}
                                        >
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

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <Label>Payment Method *</Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(val) => setFormData({...formData, payment_method: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="wallet">E-Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-2">
                                    <Label>Customer Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                                        placeholder="customer@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Customer Name *</Label>
                                    <Input
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Select
                                        value={formData.customer_country}
                                        onValueChange={(val) => setFormData({...formData, customer_country: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="GB">United Kingdom</SelectItem>
                                            <SelectItem value="EU">European Union</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Payment description"
                                    />
                                </div>

                                {/* Order ID */}
                                <div className="space-y-2">
                                    <Label>Order ID (optional)</Label>
                                    <Input
                                        value={formData.order_id}
                                        onChange={(e) => setFormData({...formData, order_id: e.target.value})}
                                        placeholder="AUTO-GENERATED"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || !formData.merchant_id || !formData.amount || !formData.customer_email}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Process Payment'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Result Panel */}
                    <Card className="h-fit sticky top-24">
                        <CardHeader>
                            <CardTitle>Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!result ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No transaction yet</p>
                                    <p className="text-sm mt-2">Fill form and submit to test payment</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        {result.success ? (
                                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        )}
                                        <div>
                                            <p className="font-semibold">{result.success ? 'Success' : 'Failed'}</p>
                                            <p className="text-sm text-slate-500">{result.status}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2 text-sm">
                                        <div>
                                            <p className="text-slate-500">Transaction ID</p>
                                            <p className="font-mono text-blue-600">{result.transaction_id}</p>
                                        </div>
                                        {result.reference_id && (
                                            <div>
                                                <p className="text-slate-500">Reference ID</p>
                                                <p className="font-mono text-slate-700">{result.reference_id}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-slate-500">Amount</p>
                                            <p className="font-semibold">{result.currency} {result.amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Connector</p>
                                            <Badge className="bg-purple-100 text-purple-700">{result.connector}</Badge>
                                        </div>
                                        {result.error && (
                                            <Alert variant="destructive" className="mt-3">
                                                <AlertDescription>{result.error}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PSPPageWrapper>
    );
}