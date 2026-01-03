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
import { getPaymentMethodLogo, getPaymentMethodDisplayName, getPaymentMethodLogoAsync } from '@/components/utils/paymentLogos';
import PaymentMethodSelector from '@/components/providers/PaymentMethodSelector';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

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
    const [showMethodSelector, setShowMethodSelector] = useState(false);
    const [methodLogos, setMethodLogos] = useState({});

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
            const response = await base44.functions.invoke('fetchDynamicLogo', {
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

    // Fetch dynamic logos for payment methods
    React.useEffect(() => {
        const fetchMethodLogos = async () => {
            const methods = providerForm.supported_methods;
            const logoPromises = methods.map(async (method) => {
                const logo = await getPaymentMethodLogoAsync(method);
                return { method, logo };
            });
            const results = await Promise.all(logoPromises);
            const logosMap = results.reduce((acc, { method, logo }) => {
                if (logo) acc[method] = logo;
                return acc;
            }, {});
            setMethodLogos(logosMap);
        };
        
        if (providerForm.supported_methods.length > 0) {
            fetchMethodLogos();
        }
    }, [providerForm.supported_methods]);

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
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Payment Provider Management</h2>
                        <p className="text-xs text-slate-600">Configure payment providers and auto-populate Master Pricing</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher variant="select" showLabel={true} />
                        <Button className="gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}>
                            <Plus className="h-4 w-4" />
                            Add Provider
                        </Button>
                    </div>
                </header>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
...
                    </DialogContent>
                </Dialog>

                {/* Payment Method Selector Modal */}
                <PaymentMethodSelector
                    open={showMethodSelector}
                    onOpenChange={setShowMethodSelector}
                    selectedMethods={providerForm.supported_methods}
                    onSelectionChange={(methods) => setProviderForm({...providerForm, supported_methods: methods})}
                />

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