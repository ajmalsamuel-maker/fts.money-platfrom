import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Eye, EyeOff, DollarSign, Settings, CreditCard, Globe, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { getPaymentMethodLogo, getPaymentMethodDisplayName } from '@/components/utils/paymentLogos';

export default function PaymentProviderManagement() {
    const [platformUser] = useState(() => JSON.parse(localStorage.getItem('platform_admin_session') || '{}'));
    const queryClient = useQueryClient();
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);
    
    const [providerForm, setProviderForm] = useState({
        name: '',
        provider_type: 'gateway',
        logo_url: '',
        merchant_id: '',
        api_base_url: '',
        api_key: '',
        api_secret: '',
        webhook_url: '',
        supported_methods: [],
        supported_currencies: ['USD', 'EUR', 'GBP'],
        supported_regions: ['US', 'EU', 'APAC'],
        status: 'active',
        pricing: {} // { method: { percentage: X, fixed: Y } }
    });
    
    const [searchingLogo, setSearchingLogo] = useState(false);

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: masterPricing = [] } = useQuery({
        queryKey: ['master-pricing'],
        queryFn: () => base44.entities.MasterPricing.list()
    });

    const createProviderMutation = useMutation({
        mutationFn: async (data) => {
            // Create payment provider
            const provider = await base44.entities.PaymentProvider.create({
                name: data.name,
                type: data.provider_type,
                logo_url: data.logo_url,
                merchant_id: data.merchant_id,
                api_base_url: data.api_base_url,
                api_key: data.api_key,
                api_secret: data.api_secret,
                webhook_url: data.webhook_url,
                supported_currencies: data.supported_currencies,
                supported_regions: data.supported_regions,
                status: data.status,
                notes: data.notes
            });

            // Auto-create Master Pricing entries for each supported payment method
            const pricingPromises = data.supported_methods.map(method => {
                const methodPricing = data.pricing[method] || {};
                return base44.entities.MasterPricing.create({
                    item_id: `${provider.name}_${method}`.toLowerCase().replace(/\s+/g, '_'),
                    category: 'payment_rail',
                    item_name: `${provider.name} - ${getPaymentMethodDisplayName(method)}`,
                    item_description: `${getPaymentMethodDisplayName(method)} processing via ${provider.name}`,
                    provider_name: provider.name,
                    buy_rate_type: methodPricing.buy_rate_type || 'percentage',
                    buy_rate_percentage: methodPricing.buy_rate_percentage || 0,
                    buy_rate_fixed: methodPricing.buy_rate_fixed || 0,
                    sell_rate_type: methodPricing.sell_rate_type || 'percentage',
                    sell_rate_percentage: methodPricing.sell_rate_percentage || (methodPricing.buy_rate_percentage || 0) + 0.5,
                    sell_rate_fixed: methodPricing.sell_rate_fixed || (methodPricing.buy_rate_fixed || 0) + 0.10,
                    currency: 'USD',
                    status: 'active'
                });
            });

            await Promise.all(pricingPromises);
            return provider;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-providers']);
            queryClient.invalidateQueries(['master-pricing']);
            setDialogOpen(false);
            resetForm();
            toast.success('Payment provider created and pricing added to Master Pricing!');
        },
        onError: (error) => {
            toast.error(`Failed to create provider: ${error.message}`);
        }
    });

    const updateProviderMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return base44.entities.PaymentProvider.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-providers']);
            setDialogOpen(false);
            setEditingProvider(null);
            resetForm();
            toast.success('Payment provider updated!');
        }
    });

    const resetForm = () => {
        setProviderForm({
            name: '',
            provider_type: 'gateway',
            logo_url: '',
            merchant_id: '',
            api_base_url: '',
            api_key: '',
            api_secret: '',
            webhook_url: '',
            supported_methods: [],
            supported_currencies: ['USD', 'EUR', 'GBP'],
            supported_regions: ['US', 'EU', 'APAC'],
            status: 'active',
            pricing: {}
        });
        setEditingProvider(null);
    };
    
    const handleAutoFindLogo = async () => {
        if (!providerForm.name) {
            toast.error('Enter provider name first');
            return;
        }
        
        setSearchingLogo(true);
        try {
            const response = await base44.functions.invoke('searchProviderLogo', {
                providerName: providerForm.name
            });
            
            if (response.data?.logo_url) {
                setProviderForm({...providerForm, logo_url: response.data.logo_url});
                toast.success('Logo found!');
            } else {
                toast.error('No logo found. Please enter manually.');
            }
        } catch (error) {
            toast.error('Failed to search for logo');
        } finally {
            setSearchingLogo(false);
        }
    };

    const handleSave = () => {
        if (editingProvider) {
            updateProviderMutation.mutate({ id: editingProvider.id, data: providerForm });
        } else {
            createProviderMutation.mutate(providerForm);
        }
    };

    const togglePaymentMethod = (method) => {
        const newMethods = providerForm.supported_methods.includes(method)
            ? providerForm.supported_methods.filter(m => m !== method)
            : [...providerForm.supported_methods, method];
        
        setProviderForm({ ...providerForm, supported_methods: newMethods });
    };

    const updateMethodPricing = (method, field, value) => {
        setProviderForm({
            ...providerForm,
            pricing: {
                ...providerForm.pricing,
                [method]: {
                    ...(providerForm.pricing[method] || {}),
                    [field]: parseFloat(value) || 0
                }
            }
        });
    };

    const allPaymentMethods = [
        'visa', 'mastercard', 'amex', 'discover', 'unionpay', 'jcb',
        'paypal', 'apple_pay', 'google_pay', 
        'bitcoin', 'ethereum', 'usdt', 'usdc',
        'alipay', 'wechat', 'ideal', 'sofort', 'giropay',
        'ach', 'sepa', 'faster_payments'
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PaymentProviderManagement"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Payment Provider Management</h1>
                            <p className="text-sm text-slate-600 mt-1">Configure payment providers and auto-populate Master Pricing</p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2" onClick={resetForm}>
                                    <Plus className="h-4 w-4" />
                                    Add Provider
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingProvider ? 'Edit Payment Provider' : 'Add New Payment Provider'}
                                    </DialogTitle>
                                </DialogHeader>

                                <Tabs defaultValue="basic">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="api">API Config</TabsTrigger>
                                        <TabsTrigger value="methods">Payment Methods</TabsTrigger>
                                        <TabsTrigger value="pricing">Provider Pricing</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Provider Name *</Label>
                                                <Input
                                                    value={providerForm.name}
                                                    onChange={(e) => setProviderForm({...providerForm, name: e.target.value})}
                                                    placeholder="Stripe, PayPal, Adyen..."
                                                />
                                            </div>
                                            <div>
                                                <Label>Provider Type</Label>
                                                <Select 
                                                    value={providerForm.provider_type}
                                                    onValueChange={(v) => setProviderForm({...providerForm, provider_type: v})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="gateway">Payment Gateway</SelectItem>
                                                        <SelectItem value="acquirer">Acquirer</SelectItem>
                                                        <SelectItem value="wallet">Digital Wallet</SelectItem>
                                                        <SelectItem value="crypto">Crypto Exchange</SelectItem>
                                                        <SelectItem value="bank">Bank/PSP</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Logo URL</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={providerForm.logo_url}
                                                        onChange={(e) => setProviderForm({...providerForm, logo_url: e.target.value})}
                                                        placeholder="https://..."
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleAutoFindLogo}
                                                        disabled={searchingLogo || !providerForm.name}
                                                    >
                                                        {searchingLogo ? 'Searching...' : '🔍 Auto-find'}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Notes</Label>
                                                <Textarea
                                                    value={providerForm.notes || ''}
                                                    onChange={(e) => setProviderForm({...providerForm, notes: e.target.value})}
                                                    placeholder="Additional information..."
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="api" className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Merchant ID / Bank MID</Label>
                                                <Input
                                                    value={providerForm.merchant_id}
                                                    onChange={(e) => setProviderForm({...providerForm, merchant_id: e.target.value})}
                                                    placeholder="MID assigned by provider"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">The Merchant ID or Bank MID provided by this payment provider</p>
                                            </div>
                                            <div>
                                                <Label>API Base URL *</Label>
                                                <Input
                                                    value={providerForm.api_base_url}
                                                    onChange={(e) => setProviderForm({...providerForm, api_base_url: e.target.value})}
                                                    placeholder="https://api.provider.com/v1"
                                                />
                                            </div>
                                            <div>
                                                <Label>API Key *</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type={showApiKey ? 'text' : 'password'}
                                                        value={providerForm.api_key}
                                                        onChange={(e) => setProviderForm({...providerForm, api_key: e.target.value})}
                                                        placeholder="pk_live_..."
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setShowApiKey(!showApiKey)}
                                                    >
                                                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>API Secret</Label>
                                                <Input
                                                    type="password"
                                                    value={providerForm.api_secret}
                                                    onChange={(e) => setProviderForm({...providerForm, api_secret: e.target.value})}
                                                    placeholder="sk_live_..."
                                                />
                                            </div>
                                            <div>
                                                <Label>Webhook URL</Label>
                                                <Input
                                                    value={providerForm.webhook_url}
                                                    onChange={(e) => setProviderForm({...providerForm, webhook_url: e.target.value})}
                                                    placeholder="https://your-platform.com/webhooks/provider"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="methods" className="space-y-4">
                                        <div className="space-y-3">
                                            <Label>Select Supported Payment Methods</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {allPaymentMethods.map(method => {
                                                    const isEnabled = providerForm.supported_methods.includes(method);
                                                    const logoUrl = getPaymentMethodLogo(method);
                                                    return (
                                                        <div
                                                            key={method}
                                                            onClick={() => togglePaymentMethod(method)}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all",
                                                                isEnabled ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                                                            )}
                                                        >
                                                            <div className="w-12 h-8 rounded flex items-center justify-center bg-white border border-slate-200">
                                                                {logoUrl ? (
                                                                    <img src={logoUrl} alt={method} className="max-w-full max-h-full object-contain" />
                                                                ) : (
                                                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-medium flex-1">{getPaymentMethodDisplayName(method)}</span>
                                                            {isEnabled && <Check className="h-4 w-4 text-blue-600" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="pricing" className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Buy Rates:</strong> What the provider charges you<br />
                                                    <strong>Sell Rates:</strong> FTS.Money markup (auto-calculated, can be adjusted in Master Pricing)
                                                </p>
                                            </div>
                                            {providerForm.supported_methods.length === 0 ? (
                                                <p className="text-center text-slate-500 py-8">Select payment methods first</p>
                                            ) : (
                                                providerForm.supported_methods.map(method => (
                                                    <Card key={method}>
                                                        <CardHeader>
                                                            <CardTitle className="text-sm flex items-center gap-2">
                                                                <div className="w-10 h-6 rounded flex items-center justify-center bg-white border">
                                                                    {getPaymentMethodLogo(method) ? (
                                                                        <img src={getPaymentMethodLogo(method)} alt={method} className="max-w-full max-h-full" />
                                                                    ) : (
                                                                        <CreditCard className="h-3 w-3" />
                                                                    )}
                                                                </div>
                                                                {getPaymentMethodDisplayName(method)}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <Label className="text-xs">Buy Rate Type</Label>
                                                                    <Select
                                                                        value={providerForm.pricing[method]?.buy_rate_type || 'percentage'}
                                                                        onValueChange={(v) => updateMethodPricing(method, 'buy_rate_type', v)}
                                                                    >
                                                                        <SelectTrigger className="h-8">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="percentage">Percentage</SelectItem>
                                                                            <SelectItem value="fixed">Fixed</SelectItem>
                                                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs">Buy Rate %</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={providerForm.pricing[method]?.buy_rate_percentage || ''}
                                                                        onChange={(e) => updateMethodPricing(method, 'buy_rate_percentage', e.target.value)}
                                                                        placeholder="2.9"
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs">Buy Fixed Fee (USD)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={providerForm.pricing[method]?.buy_rate_fixed || ''}
                                                                        onChange={(e) => updateMethodPricing(method, 'buy_rate_fixed', e.target.value)}
                                                                        placeholder="0.30"
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs">Suggested Sell Rate %</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={providerForm.pricing[method]?.sell_rate_percentage || ''}
                                                                        onChange={(e) => updateMethodPricing(method, 'sell_rate_percentage', e.target.value)}
                                                                        placeholder="3.4"
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={createProviderMutation.isPending}>
                                        {createProviderMutation.isPending ? 'Saving...' : 'Save Provider'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Providers List */}
                <div className="p-6">
                    <div className="grid gap-4">
                        {providers.map(provider => (
                            <Card key={provider.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg border border-slate-200 flex items-center justify-center bg-white">
                                                {provider.logo_url ? (
                                                    <img src={provider.logo_url} alt={provider.name} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <CreditCard className="h-8 w-8 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{provider.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline">{provider.type}</Badge>
                                                    <Badge className={provider.status === 'active' ? 'bg-green-600' : 'bg-slate-400'}>
                                                        {provider.status}
                                                    </Badge>
                                                </div>
                                                {provider.supported_currencies && (
                                                    <p className="text-xs text-slate-600 mt-2">
                                                        <Globe className="h-3 w-3 inline mr-1" />
                                                        {provider.supported_currencies.join(', ')} • {provider.supported_regions?.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingProvider(provider);
                                                    setProviderForm({
                                                        name: provider.name,
                                                        provider_type: provider.type,
                                                        logo_url: provider.logo_url || '',
                                                        merchant_id: provider.merchant_id || '',
                                                        api_base_url: provider.api_base_url || '',
                                                        api_key: provider.api_key || '',
                                                        api_secret: provider.api_secret || '',
                                                        webhook_url: provider.webhook_url || '',
                                                        supported_methods: provider.supported_methods || [],
                                                        supported_currencies: provider.supported_currencies || [],
                                                        supported_regions: provider.supported_regions || [],
                                                        status: provider.status,
                                                        pricing: {}
                                                    });
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {providers.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <CreditCard className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                <p className="font-semibold mb-2">No payment providers configured</p>
                                <p className="text-sm">Add your first payment provider to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}