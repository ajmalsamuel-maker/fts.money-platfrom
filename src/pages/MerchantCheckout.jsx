import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * White-Label Merchant Checkout Page
 * Dynamically branded based on MerchantCheckoutConfig
 * Customizable payment methods, currencies, form fields
 */
export default function MerchantCheckout() {
    const params = new URLSearchParams(window.location.search);
    const merchantCode = params.get('merchant_code');
    const pspCode = params.get('psp_code');
    const orderId = params.get('order_id');
    const amount = params.get('amount');
    const currency = params.get('currency') || 'USD';

    const [config, setConfig] = useState(null);
    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        amount: amount ? parseFloat(amount) : '',
        currency: currency,
        payment_method: 'card',
        customer_email: '',
        customer_name: '',
        card_number: '',
        card_expiry: '',
        card_cvc: ''
    });

    useEffect(() => {
        const loadConfig = async () => {
            try {
                if (!merchantCode || !pspCode) {
                    toast.error('Missing merchant or PSP code');
                    setLoading(false);
                    return;
                }

                // Get merchant
                const merchants = await base44.asServiceRole.entities.Merchant.filter({
                    merchant_code: merchantCode,
                    psp_code: pspCode
                });

                if (!merchants || merchants.length === 0) {
                    toast.error('Merchant not found');
                    setLoading(false);
                    return;
                }

                setMerchant(merchants[0]);

                // Get checkout config
                const configs = await base44.asServiceRole.entities.MerchantCheckoutConfig.filter({
                    merchant_id: merchants[0].id,
                    psp_code: pspCode
                });

                setConfig(configs?.[0] || {
                    accepted_payment_methods: ['card', 'bank_transfer'],
                    allowed_currencies: [currency],
                    require_customer_email: true,
                    require_billing_address: false,
                    enable_3ds: true,
                    branding: {}
                });

            } catch (error) {
                console.error('Load error:', error);
                toast.error('Failed to load checkout');
            }
            setLoading(false);
        };

        loadConfig();
    }, [merchantCode, pspCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await base44.functions.invoke('processPayment', {
                merchant_id: merchant.id,
                psp_code: pspCode,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                payment_method: formData.payment_method,
                customer_email: formData.customer_email,
                customer_name: formData.customer_name,
                card_token: formData.payment_method === 'card' ? formData.card_number : null,
                order_id: orderId || `CHK-${Date.now()}`,
                description: `Payment via checkout`
            });

            console.log('Checkout response:', response.data);
            setResult(response.data);

            if (response.data.success) {
                toast.success('Payment successful!');
                // Redirect after success
                if (config.success_redirect_url) {
                    setTimeout(() => {
                        window.location.href = config.success_redirect_url;
                    }, 2000);
                }
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!merchant || !config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Checkout not available. Please check your link.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const brandingStyle = {
        backgroundColor: config.branding?.background_image_url 
            ? `url(${config.branding.background_image_url})`
            : '#ffffff'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="max-w-md mx-auto">
                {/* Header with branding */}
                <div className="text-center mb-6">
                    {config.branding?.logo_url ? (
                        <img 
                            src={config.branding.logo_url} 
                            alt="Merchant logo"
                            className="h-12 mx-auto mb-4 rounded-lg"
                        />
                    ) : (
                        <div 
                            className="w-12 h-12 rounded-lg mx-auto mb-4"
                            style={{ backgroundColor: config.branding?.primary_color || '#3b82f6' }}
                        />
                    )}
                    <h1 className="text-2xl font-bold text-slate-900">{config.form_title || merchant.trading_name}</h1>
                    <p className="text-slate-600 text-sm mt-1">{config.form_description}</p>
                </div>

                {result ? (
                    // Result Card
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                {result.success ? (
                                    <>
                                        <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                                        <h2 className="text-lg font-bold text-slate-900 mb-2">Payment Successful</h2>
                                        <p className="text-slate-600 text-sm mb-4">
                                            Transaction ID: <span className="font-mono font-semibold">{result.transaction_id}</span>
                                        </p>
                                        <Button 
                                            onClick={() => setResult(null)}
                                            className="w-full"
                                        >
                                            Make Another Payment
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                                        <h2 className="text-lg font-bold text-slate-900 mb-2">Payment Failed</h2>
                                        <p className="text-slate-600 text-sm mb-4">{result.error}</p>
                                        <Button 
                                            onClick={() => setResult(null)}
                                            className="w-full"
                                        >
                                            Try Again
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Payment Form
                    <Card>
                        <CardHeader>
                            <CardTitle>Checkout Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Amount Display */}
                                <div className="p-3 rounded-lg" style={{ backgroundColor: config.branding?.primary_color + '20' }}>
                                    <p className="text-sm text-slate-600">Amount to Pay</p>
                                    <p 
                                        className="text-2xl font-bold"
                                        style={{ color: config.branding?.primary_color || '#3b82f6' }}
                                    >
                                        {formData.currency} {parseFloat(formData.amount || 0).toFixed(2)}
                                    </p>
                                </div>

                                {/* Payment Method */}
                                {config.accepted_payment_methods?.length > 1 && (
                                    <div className="space-y-2">
                                        <Label>Payment Method</Label>
                                        <Select
                                            value={formData.payment_method}
                                            onValueChange={(val) => setFormData({...formData, payment_method: val})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {config.accepted_payment_methods.map(method => (
                                                    <SelectItem key={method} value={method}>
                                                        {method === 'card' ? 'Credit/Debit Card' : method}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Customer Email */}
                                {config.require_customer_email && (
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Customer Name */}
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                {/* Card Fields (if card payment) */}
                                {formData.payment_method === 'card' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Card Number</Label>
                                            <Input
                                                value={formData.card_number}
                                                onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                                                placeholder="4242 4242 4242 4242"
                                                maxLength="19"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>Expiry</Label>
                                                <Input
                                                    value={formData.card_expiry}
                                                    onChange={(e) => setFormData({...formData, card_expiry: e.target.value})}
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>CVC</Label>
                                                <Input
                                                    value={formData.card_cvc}
                                                    onChange={(e) => setFormData({...formData, card_cvc: e.target.value})}
                                                    placeholder="123"
                                                    maxLength="3"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 3DS Notice */}
                                {config.enable_3ds && (
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <AlertDescription className="text-xs text-blue-800">
                                            Your payment is protected with 3D Secure verification
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={processing || !formData.customer_email || !formData.customer_name}
                                    className="w-full"
                                    style={{ 
                                        backgroundColor: config.branding?.primary_color || '#3b82f6'
                                    }}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ${formData.currency} ${parseFloat(formData.amount || 0).toFixed(2)}`
                                    )}
                                </Button>

                                {/* Security Footer */}
                                <p className="text-xs text-center text-slate-500">
                                    🔒 Your payment is secure and encrypted
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}