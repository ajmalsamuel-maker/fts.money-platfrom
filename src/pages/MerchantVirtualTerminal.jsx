import React, { useState } from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantVirtualTerminal() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    
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

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            const merchantData = merchants[0];
            if (merchantData && !merchantData.merchant_code && user.merchant_code) {
                merchantData.merchant_code = user.merchant_code;
            }
            return merchantData;
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

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
        
        try {
            // Create transaction record
            await base44.entities.Transaction.create({
                merchant_id: user.merchant_id,
                merchant_name: merchant?.business_name,
                type: 'sale',
                status: 'approved',
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                payment_method: 'card',
                card_last_four: formData.cardNumber.slice(-4),
                customer_email: formData.customerEmail,
                customer_name: formData.cardholderName,
                description: formData.description,
                terminal_id: selectedMID,
                auth_code: Math.random().toString(36).substr(2, 9).toUpperCase(),
                response_code: '00',
                response_message: 'Approved',
                is_3ds: false
            });

            setSuccess(true);
            toast.success('Payment processed successfully');
            
            setTimeout(() => {
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
                setSuccess(false);
            }, 3000);
        } catch (error) {
            toast.error('Payment processing failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID} 
                mids={mids} 
                onMIDChange={setSelectedMID} 
                currentPage="MerchantVirtualTerminal"
                user={user}
                merchant={merchant}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Virtual Terminal</h1>
                            <p className="text-slate-500">Process card payments manually</p>
                        </div>

                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
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
                                            <Label>Currency</Label>
                                            <Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                    <SelectItem value="GBP">GBP</SelectItem>
                                                    <SelectItem value="HKD">HKD</SelectItem>
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
                                            disabled={processing || success}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : success ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Success
                                                </>
                                            ) : (
                                                'Process Payment'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}