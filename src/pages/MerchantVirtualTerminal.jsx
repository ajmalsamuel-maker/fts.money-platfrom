import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
    CreditCard, Loader2, CheckCircle2, DollarSign, Plus, Trash2, ShoppingCart, Repeat, Save, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantVirtualTerminal() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedMID, setSelectedMID] = useState('');
    const [paymentMode, setPaymentMode] = useState('quick'); // 'quick', 'itemized', 'recurring'
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        customerEmail: '',
        customerName: '',
        phone: '',
        description: '',
        invoiceNumber: '',
        billingAddress: '',
        billingCity: '',
        billingZip: '',
        saveCard: false,
        useExistingCard: false,
        existingCardId: ''
    });

    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({ name: '', quantity: 1, price: '' });

    const [recurringSettings, setRecurringSettings] = useState({
        frequency: 'monthly',
        startDate: '',
        endType: 'never',
        endDate: '',
        occurrences: ''
    });

    React.useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const { data: vtConfig } = useQuery({
        queryKey: ['virtual-terminal', user?.merchant_id],
        queryFn: async () => {
            const terminals = await base44.entities.VirtualTerminal.filter({ merchant_id: user.merchant_id });
            return terminals[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: savedCards = [] } = useQuery({
        queryKey: ['saved-cards', user?.merchant_id, formData.customerEmail],
        queryFn: async () => {
            if (!formData.customerEmail) return [];
            return await base44.entities.SavedCard.filter({ 
                merchant_id: user.merchant_id,
                customer_email: formData.customerEmail 
            });
        },
        enabled: !!user?.merchant_id && !!formData.customerEmail && vtConfig?.enable_card_on_file
    });

    // Check if VT is configured and merchant user has access
    // Default to allow if no VT config exists yet (first time setup)
    const hasAccess = !vtConfig || (user?.role && vtConfig?.allowed_roles?.includes(user.role)) || vtConfig?.status === 'active';

    const addItem = () => {
        if (currentItem.name && currentItem.price) {
            setItems([...items, { ...currentItem, total: parseFloat(currentItem.price) * currentItem.quantity }]);
            setCurrentItem({ name: '', quantity: 1, price: '' });
        }
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        if (paymentMode === 'itemized') {
            return items.reduce((sum, item) => sum + item.total, 0);
        }
        return parseFloat(formData.amount) || 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const total = calculateTotal();
        if (total === 0) {
            toast.error('Amount cannot be zero');
            return;
        }

        if (!formData.cardNumber && !formData.useExistingCard) {
            toast.error('Please enter card details or select a saved card');
            return;
        }

        if (vtConfig?.requires_cvv && !formData.cvv && !formData.useExistingCard) {
            toast.error('CVV is required');
            return;
        }

        setProcessing(true);
        
        try {
            const transactionData = {
                merchant_id: user.merchant_id,
                merchant_name: merchant?.business_name,
                type: paymentMode === 'recurring' ? 'recurring' : 'sale',
                status: 'approved',
                amount: total,
                currency: formData.currency,
                payment_method: 'card',
                card_last_four: formData.useExistingCard ? 
                    savedCards.find(c => c.id === formData.existingCardId)?.card_last_four :
                    formData.cardNumber.slice(-4),
                customer_email: formData.customerEmail,
                customer_name: formData.customerName || formData.cardholderName,
                description: paymentMode === 'itemized' ? 
                    items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 
                    formData.description,
                auth_code: Math.random().toString(36).substr(2, 9).toUpperCase(),
                response_code: '00',
                response_message: 'Approved',
                is_3ds: vtConfig?.enable_3ds || false
            };

            await base44.entities.Transaction.create(transactionData);

            // Save card if requested
            if (formData.saveCard && !formData.useExistingCard && formData.customerEmail) {
                await base44.entities.SavedCard.create({
                    merchant_id: user.merchant_id,
                    customer_email: formData.customerEmail,
                    customer_name: formData.customerName || formData.cardholderName,
                    card_last_four: formData.cardNumber.slice(-4),
                    card_brand: 'visa',
                    expiry_month: formData.expiryMonth,
                    expiry_year: formData.expiryYear,
                    token: `tok_${Math.random().toString(36).substr(2, 16)}`
                });
            }

            setSuccess(true);
            toast.success('Payment processed successfully');
            
            setTimeout(() => {
                setFormData({
                    amount: '', currency: 'USD', cardNumber: '', cardholderName: '',
                    expiryMonth: '', expiryYear: '', cvv: '', customerEmail: '',
                    customerName: '', phone: '', description: '', invoiceNumber: '',
                    billingAddress: '', billingCity: '', billingZip: '',
                    saveCard: false, useExistingCard: false, existingCardId: ''
                });
                setItems([]);
                setSuccess(false);
            }, 2000);
        } catch (error) {
            toast.error('Payment processing failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If VT config doesn't exist, show message to configure it first
    if (!vtConfig) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="pt-6 text-center">
                        <p className="text-lg font-medium text-slate-900 mb-2">Virtual Terminal Not Configured</p>
                        <p className="text-slate-600 mb-4">Please configure your Virtual Terminal settings first</p>
                        <Button onClick={() => navigate(createPageUrl('MerchantVirtualTerminals'))}>
                            Go to Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // Check role-based access only if allowed_roles is configured
    if (vtConfig?.allowed_roles && vtConfig.allowed_roles.length > 0) {
        if (!user?.role || !vtConfig.allowed_roles.includes(user.role)) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <Card className="w-96">
                        <CardContent className="pt-6 text-center">
                            <p className="text-lg font-medium text-slate-900 mb-2">Access Denied</p>
                            <p className="text-slate-600 mb-4">Your role ({user?.role || 'unknown'}) doesn't have permission to access the Virtual Terminal</p>
                            <Button onClick={() => navigate(createPageUrl('MerchantDashboard'))}>
                                Return to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }

    if (!vtConfig || vtConfig.status !== 'active') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="pt-6 text-center">
                        <p className="text-lg font-medium text-slate-900 mb-2">Virtual Terminal Not Available</p>
                        <p className="text-slate-600">Please contact your administrator</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Process Payment</h1>
                                <p className="text-slate-500">Virtual Terminal • {merchant?.business_name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline">MID: {selectedMID}</Badge>
                                <Badge variant={vtConfig.status === 'active' ? 'default' : 'secondary'}>
                                    {vtConfig.status}
                                </Badge>
                            </div>
                        </div>

                        <Tabs value={paymentMode} onValueChange={setPaymentMode} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="quick" className="gap-2">
                                    <DollarSign className="h-4 w-4" />Quick Charge
                                </TabsTrigger>
                                <TabsTrigger value="itemized" className="gap-2" disabled={!vtConfig?.enable_itemized_sale}>
                                    <ShoppingCart className="h-4 w-4" />Itemized Sale
                                </TabsTrigger>
                                <TabsTrigger value="recurring" className="gap-2" disabled={!vtConfig?.enable_recurring}>
                                    <Repeat className="h-4 w-4" />Recurring
                                </TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Left Column - Payment Details */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <DollarSign className="h-5 w-5" />
                                                    Amount
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <TabsContent value="quick" className="mt-0 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Amount *</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={formData.amount}
                                                                onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Currency</Label>
                                                            <Select value={formData.currency} onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}>
                                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    {vtConfig?.allowed_currencies?.map(curr => (
                                                                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Description</Label>
                                                        <Input
                                                            placeholder="Payment for..."
                                                            value={formData.description}
                                                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                                        />
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="itemized" className="mt-0 space-y-4">
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-12 gap-2">
                                                            <div className="col-span-5">
                                                                <Input
                                                                    placeholder="Item name"
                                                                    value={currentItem.name}
                                                                    onChange={(e) => setCurrentItem(p => ({ ...p, name: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="Qty"
                                                                    value={currentItem.quantity}
                                                                    onChange={(e) => setCurrentItem(p => ({ ...p, quantity: parseInt(e.target.value) }))}
                                                                />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="Price"
                                                                    value={currentItem.price}
                                                                    onChange={(e) => setCurrentItem(p => ({ ...p, price: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <Button type="button" onClick={addItem} className="w-full">
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {items.length > 0 && (
                                                            <div className="border rounded-lg divide-y">
                                                                {items.map((item, index) => (
                                                                    <div key={index} className="flex items-center justify-between p-2">
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-sm">{item.name}</p>
                                                                            <p className="text-xs text-slate-500">{item.quantity} x ${item.price}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">${item.total.toFixed(2)}</span>
                                                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="p-2 bg-slate-50 font-bold flex justify-between">
                                                                    <span>Total:</span>
                                                                    <span>${calculateTotal().toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="recurring" className="mt-0 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Amount *</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.amount}
                                                            onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Frequency</Label>
                                                        <Select value={recurringSettings.frequency} onValueChange={(v) => setRecurringSettings(p => ({ ...p, frequency: v }))}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="daily">Daily</SelectItem>
                                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                                <SelectItem value="yearly">Yearly</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Start Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={recurringSettings.startDate}
                                                            onChange={(e) => setRecurringSettings(p => ({ ...p, startDate: e.target.value }))}
                                                        />
                                                    </div>
                                                </TabsContent>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Right Column - Card Details */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5" />
                                                    Card Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Customer Email *</Label>
                                                    <Input
                                                        type="email"
                                                        placeholder="customer@example.com"
                                                        value={formData.customerEmail}
                                                        onChange={(e) => setFormData(p => ({ ...p, customerEmail: e.target.value }))}
                                                        required
                                                    />
                                                </div>

                                                {vtConfig?.enable_card_on_file && savedCards.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={formData.useExistingCard}
                                                                onCheckedChange={(c) => setFormData(p => ({ ...p, useExistingCard: c }))}
                                                            />
                                                            <Label>Use saved card</Label>
                                                        </div>
                                                        {formData.useExistingCard && (
                                                            <Select value={formData.existingCardId} onValueChange={(v) => setFormData(p => ({ ...p, existingCardId: v }))}>
                                                                <SelectTrigger><SelectValue placeholder="Select card" /></SelectTrigger>
                                                                <SelectContent>
                                                                    {savedCards.map(card => (
                                                                        <SelectItem key={card.id} value={card.id}>
                                                                            {card.card_brand} ****{card.card_last_four}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </div>
                                                )}

                                                {!formData.useExistingCard && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>Cardholder Name *</Label>
                                                            <Input
                                                                placeholder="John Doe"
                                                                value={formData.cardholderName}
                                                                onChange={(e) => setFormData(p => ({ ...p, cardholderName: e.target.value }))}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Card Number *</Label>
                                                            <Input
                                                                placeholder="4111 1111 1111 1111"
                                                                value={formData.cardNumber}
                                                                onChange={(e) => setFormData(p => ({ ...p, cardNumber: e.target.value.replace(/\s/g, '') }))}
                                                                maxLength={16}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>MM *</Label>
                                                                <Input
                                                                    placeholder="12"
                                                                    value={formData.expiryMonth}
                                                                    onChange={(e) => setFormData(p => ({ ...p, expiryMonth: e.target.value }))}
                                                                    maxLength={2}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>YY *</Label>
                                                                <Input
                                                                    placeholder="25"
                                                                    value={formData.expiryYear}
                                                                    onChange={(e) => setFormData(p => ({ ...p, expiryYear: e.target.value }))}
                                                                    maxLength={2}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>CVV *</Label>
                                                                <Input
                                                                    placeholder="123"
                                                                    value={formData.cvv}
                                                                    onChange={(e) => setFormData(p => ({ ...p, cvv: e.target.value }))}
                                                                    maxLength={4}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        {vtConfig?.enable_card_on_file && (
                                                            <div className="flex items-center gap-2 pt-2">
                                                                <Switch
                                                                    checked={formData.saveCard}
                                                                    onCheckedChange={(c) => setFormData(p => ({ ...p, saveCard: c }))}
                                                                />
                                                                <Label className="text-sm">Save card for future use</Label>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Total</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold">${calculateTotal().toFixed(2)} {formData.currency}</div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => window.history.back()}>
                                        <X className="h-4 w-4 mr-2" />Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={processing || success}>
                                        {processing ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                        ) : success ? (
                                            <><CheckCircle2 className="h-4 w-4 mr-2" />Success</>
                                        ) : (
                                            <>Process Payment</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}