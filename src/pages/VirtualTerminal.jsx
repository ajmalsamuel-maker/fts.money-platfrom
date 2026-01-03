import React, { useState } from 'react';
import { useVTAuth } from '@/components/auth/useVTAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Loader2, CheckCircle2, LogOut, Shield, Bitcoin, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ISO4217_CURRENCIES } from '@/components/utils/iso4217';
import { validateCurrency } from '@/components/utils/isoValidator';
import ISOComplianceBadge from '@/components/transaction/ISOComplianceBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CryptoPaymentForm from '@/components/terminal/CryptoPaymentForm';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function VirtualTerminal() {
    const { user, loading, logout } = useVTAuth();
    const { t } = useI18n();
    const [processing, setProcessing] = useState(false);
    const [resultDialogOpen, setResultDialogOpen] = useState(false);
    const [transactionResult, setTransactionResult] = useState(null);
    const [paymentType, setPaymentType] = useState('card'); // 'card' or 'crypto'
    
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        customerEmail: '',
        description: ''
    });

    const { data: terminal } = useQuery({
        queryKey: ['virtualTerminal', user?.terminal_id],
        queryFn: async () => {
            const terminals = await base44.entities.VirtualTerminal.filter({ terminal_id: user.terminal_id });
            return terminals[0];
        },
        enabled: !!user?.terminal_id
    });

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.amount || !formData.cardNumber || !formData.cvv || !formData.expiryMonth || !formData.expiryYear) {
            toast.error('Please fill in all required fields');
            return;
        }

        setProcessing(true);
        
        // Validate currency with ISO 4217
        const currencyValidation = validateCurrency(formData.currency);
        if (!currencyValidation.valid) {
            toast.error('Invalid ISO 4217 currency code');
            setProcessing(false);
            return;
        }
        
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const authCode = Math.random().toString(36).substr(2, 9).toUpperCase();
        const pspCode = merchant?.psp_code;
        
        let transactionStatus = 'approved';
        let responseCode = '00';
        let responseMessage = 'Approved';
        let isSuccess = true;
        let errorDetails = null;
        
        try {
            if (!pspCode) {
                throw new Error('PSP code not found for merchant');
            }
            
            console.log('🔵 VT: Processing transaction...');
            console.log('🔵 VT: PSP Code:', pspCode);
            console.log('🔵 VT: Merchant ID:', user.merchant_id);
            
            // Simulate payment processing - you can add real validation here
            // For now, all transactions are approved
            
        } catch (error) {
            console.error('❌ VT: Transaction error:', error);
            transactionStatus = 'declined';
            responseCode = 'ERR';
            responseMessage = error.message || 'Payment processing failed';
            isSuccess = false;
            errorDetails = error.response?.data?.error || error.message;
        }
        
        // ALWAYS log the transaction regardless of success/failure
        try {
            console.log('🔵 VT: Logging transaction...');
            const result = await base44.functions.invoke('vtAuth', {
                action: 'processTransaction',
                transaction: {
                    transaction_id: transactionId,
                    psp_code: pspCode || 'UNKNOWN',
                    merchant_id: user.merchant_id,
                    merchant_name: merchant?.business_name,
                    type: 'sale',
                    status: transactionStatus,
                    amount: parseFloat(formData.amount),
                    currency: formData.currency,
                    customer_country: merchant?.country,
                    payment_method: 'card',
                    card_last_four: formData.cardNumber.slice(-4),
                    customer_email: formData.customerEmail,
                    customer_name: formData.cardholderName,
                    description: formData.description,
                    terminal_id: user.terminal_id,
                    auth_code: isSuccess ? authCode : null,
                    response_code: responseCode,
                    response_message: responseMessage,
                    is_3ds: false
                }
            });

            console.log('✅ VT: Transaction logged:', result);
        } catch (logError) {
            console.error('❌ VT: Failed to log transaction:', logError);
        }
        
        // Show result dialog
        setTransactionResult({
            success: isSuccess,
            transactionId: transactionId,
            authCode: isSuccess ? authCode : null,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            status: transactionStatus,
            error: errorDetails
        });
        setResultDialogOpen(true);
        
        // Clear form only on success
        if (isSuccess) {
            setFormData({
                amount: '',
                currency: 'USD',
                cardNumber: '',
                cardholderName: '',
                expiryMonth: '',
                expiryYear: '',
                cvv: '',
                customerEmail: '',
                description: ''
            });
        }
        
        setProcessing(false);
    };

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Virtual Terminal</h1>
                            <p className="text-xs text-slate-500">{terminal?.name || 'Terminal'} • {user.email}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Tabs value={paymentType} onValueChange={setPaymentType}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="card" className="gap-2">
                                <CreditCard className="h-4 w-4" />Card Payment
                            </TabsTrigger>
                            <TabsTrigger value="crypto" className="gap-2">
                                <Bitcoin className="h-4 w-4" />Crypto Payment
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="crypto" className="mt-6">
                            <CryptoPaymentForm 
                                merchant_id={user?.merchant_id}
                                onSuccess={() => {
                                    toast.success('Crypto payment initiated');
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="card" className="mt-6">
                            <Card>
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Card Payment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Amount *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => handleInputChange('amount', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1">
                                            Currency (ISO 4217)
                                            <Shield className="h-3 w-3 text-blue-600" />
                                        </Label>
                                        <Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ISO4217_CURRENCIES.slice(0, 30).map(c => (
                                                    <SelectItem key={c.code} value={c.code}>
                                                        {c.code} - {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cardholder Name *</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={formData.cardholderName}
                                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Card Number *</Label>
                                    <Input
                                        placeholder="4111 1111 1111 1111"
                                        value={formData.cardNumber}
                                        onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                                        maxLength={16}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Expiry Month *</Label>
                                        <Input
                                            placeholder="MM"
                                            value={formData.expiryMonth}
                                            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                                            maxLength={2}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expiry Year *</Label>
                                        <Input
                                            placeholder="YY"
                                            value={formData.expiryYear}
                                            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                                            maxLength={2}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CVV *</Label>
                                        <Input
                                            placeholder="123"
                                            value={formData.cvv}
                                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                                            maxLength={4}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Customer Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="customer@example.com"
                                        value={formData.customerEmail}
                                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="Payment for..."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => setFormData({
                                            amount: '',
                                            currency: 'USD',
                                            cardNumber: '',
                                            cardholderName: '',
                                            expiryMonth: '',
                                            expiryYear: '',
                                            cvv: '',
                                            customerEmail: '',
                                            description: ''
                                        })}
                                    >
                                        Clear
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-1"
                                        disabled={processing}
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
                                        </div>
                                        </form>
                                        </CardContent>
                                        </Card>
                                        </TabsContent>
                                        </Tabs>
                                        </div>
                                        </main>

                                        {/* Transaction Result Dialog */}
                                        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
                                        <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                        {transactionResult?.success ? (
                                        <>
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        Transaction Approved
                                        </>
                                        ) : (
                                        <>
                                        <XCircle className="h-6 w-6 text-red-600" />
                                        Transaction Declined
                                        </>
                                        )}
                                        </DialogTitle>
                                        </DialogHeader>

                                        {transactionResult?.success ? (
                                        <div className="space-y-4 py-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold text-green-900">Payment Successful</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                        <span className="text-slate-600">Transaction ID:</span>
                                        <span className="font-mono font-medium">{transactionResult?.transactionId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                        <span className="text-slate-600">Auth Code:</span>
                                        <span className="font-mono font-medium">{transactionResult?.authCode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                        <span className="text-slate-600">Amount:</span>
                                        <span className="font-semibold text-lg">
                                        {transactionResult?.currency} {transactionResult?.amount?.toFixed(2)}
                                        </span>
                                        </div>
                                        <div className="flex justify-between">
                                        <span className="text-slate-600">Status:</span>
                                        <span className="font-semibold text-green-600 uppercase">APPROVED</span>
                                        </div>
                                        </div>
                                        </div>
                                        <Button onClick={() => setResultDialogOpen(false)} className="w-full">
                                        Close
                                        </Button>
                                        </div>
                                        ) : (
                                        <div className="space-y-4 py-4">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <span className="font-semibold text-red-900">Payment Failed</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                        <span className="text-slate-600">Status:</span>
                                        <span className="font-semibold text-red-600 uppercase">DECLINED</span>
                                        </div>
                                        <div className="text-slate-600 mt-2">
                                        <span className="font-medium">Error:</span>
                                        <p className="mt-1 text-red-600">{transactionResult?.error}</p>
                                        </div>
                                        </div>
                                        </div>
                                        <Button onClick={() => setResultDialogOpen(false)} variant="outline" className="w-full">
                                        Close
                                        </Button>
                                        </div>
                                        )}
                                        </DialogContent>
                                        </Dialog>
                                        </div>
                                        );
                                        }