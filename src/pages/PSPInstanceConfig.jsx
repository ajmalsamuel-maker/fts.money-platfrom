import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
    ArrowLeft, 
    Save, 
    Palette,
    DollarSign,
    CreditCard,
    Wallet,
    Settings,
    Globe,
    Shield,
    Check,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { logAuditAction } from '@/components/platform/AuditLogger';
import { cn } from "@/lib/utils";
import { PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { ISO4217_CURRENCIES, getCurrencySymbol } from '@/components/utils/iso4217';
import { getPaymentMethodLogo, getPaymentMethodDisplayName, getPaymentMethodLogoAsync } from '@/components/utils/paymentLogos';

export default function PSPInstanceConfig() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const pspId = urlParams.get('id');

    const [activeTab, setActiveTab] = useState('services');
    
    const platformUser = JSON.parse(localStorage.getItem('platform_admin_session') || '{}');

    const { data: psp, isLoading, refetch } = useQuery({
        queryKey: ['psp-config', pspId],
        queryFn: async () => {
            console.log('📥 Fetching PSP data for ID:', pspId);
            const psps = await base44.entities.ProvisionedPSP.list();
            const foundPsp = psps.find(p => p.id === pspId);
            console.log('📥 Found PSP with saved config:', {
                id: foundPsp?.id,
                enabled_payment_methods: foundPsp?.enabled_payment_methods,
                enabled_payout_methods: foundPsp?.enabled_payout_methods,
                enabled_services: foundPsp?.enabled_services,
                branding: foundPsp?.branding
            });
            return foundPsp;
        },
        enabled: !!pspId,
        staleTime: 0,
        cacheTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true
    });

    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list(),
        enabled: !!pspId
    });

    const { data: paymentGateways = [] } = useQuery({
        queryKey: ['payment-gateways', psp?.psp_code],
        queryFn: async () => {
            if (!psp?.psp_code) return [];
            const allGateways = await base44.entities.PaymentGateway.list();
            // Filter for GP-PAY system gateways or PSP-specific gateways
            return allGateways.filter(g => 
                g.merchant_id === 'GP-PAY-SYSTEM' || 
                g.merchant_id === psp.psp_code
            );
        },
        enabled: !!psp?.psp_code
    });

    const { data: payoutRoutes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list(),
        enabled: !!pspId
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => base44.entities.ServiceCatalog.list(),
        enabled: !!pspId
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['psp-subscriptions', psp?.psp_code],
        queryFn: async () => {
            if (!psp?.psp_code) return [];
            const subs = await base44.entities.PSPServiceSubscription.filter({ psp_code: psp.psp_code });
            console.log('🔍 Loaded subscriptions for PSP:', psp.psp_code, subs);
            return subs;
        },
        enabled: !!psp?.psp_code
    });

    const [config, setConfig] = useState({
        branding: {},
        transaction_fees: {},
        region_settings: {},
        enabled_payment_methods: [],
        enabled_payout_methods: [],
        enabled_services: []
    });
    const [methodLogos, setMethodLogos] = useState({});

    // Populate config when PSP data loads - map from provisioning fields
    React.useEffect(() => {
        if (psp) {
            console.log('🔄 PSP data changed, reloading config...');
            
            // Ensure arrays are properly parsed if they're stored as strings
            const parseArray = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val);
                    } catch {
                        return [];
                    }
                }
                return [];
            };

            // Get service IDs from active subscriptions
            const subscribedServiceIds = subscriptions
                .filter(sub => sub.status === 'active')
                .map(sub => sub.service_id);

            const newConfig = {
                branding: {
                    company_name: psp.psp_name || '',
                    logo_url: psp.branding?.logo_url || '',
                    primary_color: psp.branding?.primary_color || '#3b82f6',
                    secondary_color: psp.branding?.secondary_color || '#8b5cf6',
                    favicon_url: psp.branding?.favicon_url || ''
                },
                transaction_fees: psp.transaction_fees || {},
                region_settings: {
                    default_currency: psp.currency || 'USD',
                    timezone: psp.timezone || 'UTC',
                    region: psp.country || '',
                    language: 'en'
                },
                enabled_payment_methods: parseArray(psp.enabled_payment_methods),
                enabled_payout_methods: parseArray(psp.enabled_payout_methods),
                // Combine both enabled_services and active subscriptions
                enabled_services: [...new Set([...parseArray(psp.enabled_services), ...subscribedServiceIds])]
            };
            
            console.log('✅ Config loaded from database:', {
                psp_code: psp.psp_code,
                psp_id: psp.id,
                branding: newConfig.branding,
                enabled_payment_methods_count: newConfig.enabled_payment_methods.length,
                enabled_payout_methods_count: newConfig.enabled_payout_methods.length,
                enabled_services_count: newConfig.enabled_services.length,
                payment_methods: newConfig.enabled_payment_methods,
                payout_methods: newConfig.enabled_payout_methods,
                services: newConfig.enabled_services
            });
            
            setConfig(newConfig);
        }
    }, [psp, subscriptions]);

    // Fetch dynamic logos for enabled payment/payout methods
    React.useEffect(() => {
        const fetchLogos = async () => {
            const allMethods = [...(config.enabled_payment_methods || []), ...(config.enabled_payout_methods || [])];
            const logoPromises = allMethods.map(async (method) => {
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

        if (config.enabled_payment_methods?.length > 0 || config.enabled_payout_methods?.length > 0) {
            fetchLogos();
        }
    }, [config.enabled_payment_methods, config.enabled_payout_methods]);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            console.log('🚀 Mutation started with data:', data);
            
            // Permission check - only platform admins can modify PSP config
            if (!platformUser?.email) {
                console.error('❌ No user session found');
                throw new Error('Unauthorized: No active session');
            }
            
            console.log('🔐 Permission check - User session:', platformUser);
            
            const allowedRoles = ['super_admin', 'platform_admin', 'operations', 'admin'];
            const userRole = platformUser?.platform_role || platformUser?.role;
            
            if (!allowedRoles.includes(userRole)) {
                console.error('❌ Insufficient permissions:', userRole);
                throw new Error(`Unauthorized: Role "${userRole}" cannot modify PSP configuration. Allowed roles: ${allowedRoles.join(', ')}`);
            }
            
            console.log('💾 Saving config for PSP ID:', pspId);
            console.log('💾 Config data:', data);
            
            // Ensure arrays are properly formatted (not stringified)
            const pspUpdateData = {
                branding: data.branding,
                transaction_fees: data.transaction_fees,
                currency: data.region_settings?.default_currency,
                timezone: data.region_settings?.timezone,
                country: data.region_settings?.region,
                // Ensure these are arrays, not strings
                enabled_payment_methods: Array.isArray(data.enabled_payment_methods) ? data.enabled_payment_methods : [],
                enabled_payout_methods: Array.isArray(data.enabled_payout_methods) ? data.enabled_payout_methods : [],
                enabled_services: Array.isArray(data.enabled_services) ? data.enabled_services : []
            };
            
            console.log('📤 Sending to database:', JSON.stringify(pspUpdateData, null, 2));
            
            try {
                const result = await base44.entities.ProvisionedPSP.update(pspId, pspUpdateData);
                console.log('✅ Database update successful:', result);
                return result;
            } catch (dbError) {
                console.error('❌ Database update failed:', dbError);
                throw dbError;
            }
        },
        onSuccess: async (updatedPSP, variables) => {
            console.log('✅ Update successful, returned PSP:', {
                enabled_payment_methods: updatedPSP.enabled_payment_methods,
                enabled_payout_methods: updatedPSP.enabled_payout_methods,
                enabled_services: updatedPSP.enabled_services
            });
            
            // Update local state immediately
            setConfig({
                branding: updatedPSP.branding || config.branding,
                transaction_fees: updatedPSP.transaction_fees || config.transaction_fees,
                region_settings: {
                    default_currency: updatedPSP.currency || config.region_settings?.default_currency,
                    timezone: updatedPSP.timezone || config.region_settings?.timezone,
                    region: updatedPSP.country || config.region_settings?.region,
                    language: config.region_settings?.language || 'en'
                },
                enabled_payment_methods: updatedPSP.enabled_payment_methods || [],
                enabled_payout_methods: updatedPSP.enabled_payout_methods || [],
                enabled_services: updatedPSP.enabled_services || []
            });
            
            // Invalidate and refetch
            await queryClient.invalidateQueries(['psp-config', pspId]);
            await queryClient.refetchQueries(['psp-config', pspId]);
            
            toast.success('✅ Configuration saved successfully!');
            
            // Comprehensive audit logging for compliance
            try {
                const session = JSON.parse(localStorage.getItem('platform_admin_session') || '{}');
                if (session.email) {
                    // Log each configuration change separately for detailed audit trail
                    const changes = [];
                    
                    if (activeTab === 'services' && variables.enabled_services) {
                        changes.push({
                            field: 'enabled_services',
                            action: 'services_updated',
                            new_value: JSON.stringify(variables.enabled_services)
                        });
                    }
                    
                    if (activeTab === 'appearance' && variables.branding) {
                        changes.push({
                            field: 'branding',
                            action: 'branding_updated',
                            new_value: JSON.stringify(variables.branding)
                        });
                    }
                    
                    if (activeTab === 'fees' && variables.transaction_fees) {
                        changes.push({
                            field: 'transaction_fees',
                            action: 'fees_updated',
                            new_value: JSON.stringify(variables.transaction_fees)
                        });
                    }
                    
                    if (activeTab === 'payments' && variables.enabled_payment_methods) {
                        changes.push({
                            field: 'enabled_payment_methods',
                            action: 'payment_methods_updated',
                            new_value: JSON.stringify(variables.enabled_payment_methods)
                        });
                    }
                    
                    if (activeTab === 'payouts' && variables.enabled_payout_methods) {
                        changes.push({
                            field: 'enabled_payout_methods',
                            action: 'payout_methods_updated',
                            new_value: JSON.stringify(variables.enabled_payout_methods)
                        });
                    }
                    
                    if (activeTab === 'regions' && variables.region_settings) {
                        changes.push({
                            field: 'region_settings',
                            action: 'regional_settings_updated',
                            new_value: JSON.stringify(variables.region_settings)
                        });
                    }
                    
                    // Log all changes
                    for (const change of changes) {
                        await logAuditAction({
                            psp_id: pspId,
                            psp_code: psp?.psp_code,
                            action: change.action,
                            field_changed: change.field,
                            new_value: change.new_value,
                            user_email: session.email,
                            user_role: session.platform_role || 'platform_admin',
                            metadata: { tab: activeTab, timestamp: new Date().toISOString() }
                        });
                    }
                }
            } catch (auditError) {
                console.warn('Audit logging failed, but save was successful:', auditError);
            }
        },
        onError: (error) => {
            console.error('❌ Save failed:', error);
            toast.error(`Failed to save: ${error.message}`);
        }
    });

    const handleSave = () => {
        console.log('🔒 Save triggered by user:', platformUser?.email, 'Role:', platformUser?.platform_role);
        console.log('🔒 Current config to save:', {
            enabled_payment_methods: config.enabled_payment_methods,
            enabled_payout_methods: config.enabled_payout_methods,
            enabled_services: config.enabled_services
        });
        
        // Preserve existing PSP data and only update config fields
        const updateData = {
            ...config,
            // Explicitly ensure arrays are preserved
            enabled_payment_methods: config.enabled_payment_methods || [],
            enabled_payout_methods: config.enabled_payout_methods || [],
            enabled_services: config.enabled_services || []
        };
        
        console.log('📤 Final update data:', updateData);
        updateMutation.mutate(updateData);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Platform
                        </Button>
                        <div className="text-right">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div 
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                style={{ background: psp?.branding?.primary_color || '#3b82f6' }}
                            >
                                {psp?.psp_code?.substring(0, 2)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{psp?.psp_name}</h1>
                                <p className="text-sm text-slate-600">Configure PSP instance settings</p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="h-4 w-4" />
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-white border border-slate-200 mb-6">
                        <TabsTrigger value="services" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Services
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="gap-2">
                            <Palette className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                        <TabsTrigger value="fees" className="gap-2">
                            <DollarSign className="h-4 w-4" />
                            Transaction Fees
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Methods
                        </TabsTrigger>
                        <TabsTrigger value="payouts" className="gap-2">
                            <Wallet className="h-4 w-4" />
                            Payout Methods
                        </TabsTrigger>
                        <TabsTrigger value="regions" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Regional Settings
                        </TabsTrigger>
                        <TabsTrigger value="premium" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Premium Features
                        </TabsTrigger>
                    </TabsList>

                    {/* Services Tab */}
                    <TabsContent value="services">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>FTS.Money Services</CardTitle>
                                <CardDescription>Enable or disable services for this PSP instance based on tier and commercial agreements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {['payment_rail', 'orchestration', 'fraud_detection', 'compliance', 'payout', 'analytics', 'developer_tools'].map((category) => {
                                    const categoryServices = services.filter(s => s.service_category === category);
                                    if (categoryServices.length === 0) return null;
                                    
                                    return (
                                        <div key={category}>
                                            <h3 className="font-semibold text-slate-900 mb-3 capitalize flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                {category.replace(/_/g, ' ')}
                                            </h3>
                                            <div className="space-y-2">
                                                {categoryServices.map((service) => {
                                                    const serviceIdentifier = service.service_id || service.id;
                                                    // Check both service.id and service.service_id against enabled_services
                                                    const isEnabled = config.enabled_services?.includes(service.id) || 
                                                                      config.enabled_services?.includes(serviceIdentifier);
                                                    
                                                    return (
                                                        <div
                                                            key={service.id}
                                                            className={cn(
                                                                "flex items-center justify-between p-4 border-2 rounded-lg transition-all",
                                                                isEnabled ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded flex items-center justify-center",
                                                                    isEnabled ? "bg-emerald-600" : "bg-slate-100"
                                                                )}>
                                                                    {isEnabled ? <Check className="h-5 w-5 text-white" /> : <X className="h-5 w-5 text-slate-400" />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">{service.service_name}</p>
                                                                    <p className="text-xs text-slate-600">{service.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {service.pricing_model === 'per_transaction' && (
                                                                    <Badge variant="outline">{service.variable_price}% per txn</Badge>
                                                                )}
                                                                {service.base_price > 0 && (
                                                                    <Badge variant="outline">${service.base_price}/mo</Badge>
                                                                )}
                                                                <Switch 
                                                                    checked={isEnabled}
                                                                    onCheckedChange={(checked) => {
                                                                        const newServices = checked
                                                                            ? [...(config.enabled_services || []), serviceIdentifier]
                                                                            : (config.enabled_services || []).filter(s => s !== serviceIdentifier);
                                                                        setConfig({...config, enabled_services: newServices});
                                                                    }}
                                                                    />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>Branding & Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of the PSP instance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label>Company Name</Label>
                                        <Input
                                            value={config.branding.company_name || ''}
                                            onChange={(e) => setConfig({...config, branding: {...config.branding, company_name: e.target.value}})}
                                            placeholder="Enter company name"
                                        />
                                    </div>
                                    <div>
                                        <Label>Logo URL</Label>
                                        <Input
                                            value={config.branding.logo_url || ''}
                                            onChange={(e) => setConfig({...config, branding: {...config.branding, logo_url: e.target.value}})}
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                    <div>
                                        <Label>Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={config.branding.primary_color || '#3b82f6'}
                                                onChange={(e) => setConfig({...config, branding: {...config.branding, primary_color: e.target.value}})}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                value={config.branding.primary_color || '#3b82f6'}
                                                onChange={(e) => setConfig({...config, branding: {...config.branding, primary_color: e.target.value}})}
                                                placeholder="#3b82f6"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={config.branding.secondary_color || '#8b5cf6'}
                                                onChange={(e) => setConfig({...config, branding: {...config.branding, secondary_color: e.target.value}})}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                value={config.branding.secondary_color || '#8b5cf6'}
                                                onChange={(e) => setConfig({...config, branding: {...config.branding, secondary_color: e.target.value}})}
                                                placeholder="#8b5cf6"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Favicon URL</Label>
                                        <Input
                                            value={config.branding.favicon_url || ''}
                                            onChange={(e) => setConfig({...config, branding: {...config.branding, favicon_url: e.target.value}})}
                                            placeholder="https://example.com/favicon.ico"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Transaction Fees Tab */}
                    <TabsContent value="fees">
                        <div className="space-y-6">
                            {/* Base Fee Configuration */}
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle>Base Fee Structure</CardTitle>
                                    <CardDescription>Default transaction fees applied to all merchants in this PSP instance</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label>Card Processing Fee (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={config.transaction_fees?.card_percentage || ''}
                                                onChange={(e) => setConfig({...config, transaction_fees: {...config.transaction_fees, card_percentage: parseFloat(e.target.value)}})}
                                                placeholder="2.9"
                                            />
                                        </div>
                                        <div>
                                            <Label>Fixed Fee per Transaction</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={config.transaction_fees?.fixed_fee || ''}
                                                onChange={(e) => setConfig({...config, transaction_fees: {...config.transaction_fees, fixed_fee: parseFloat(e.target.value)}})}
                                                placeholder="0.30"
                                            />
                                        </div>
                                        <div>
                                            <Label>International Fee (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={config.transaction_fees?.international_percentage || ''}
                                                onChange={(e) => setConfig({...config, transaction_fees: {...config.transaction_fees, international_percentage: parseFloat(e.target.value)}})}
                                                placeholder="3.9"
                                            />
                                        </div>
                                        <div>
                                            <Label>Crypto Processing Fee (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={config.transaction_fees?.crypto_percentage || ''}
                                                onChange={(e) => setConfig({...config, transaction_fees: {...config.transaction_fees, crypto_percentage: parseFloat(e.target.value)}})}
                                                placeholder="1.5"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Volume-Based Tiered Fees */}
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle>Volume-Based Fee Tiers</CardTitle>
                                    <CardDescription>Automatic fee reductions based on merchant transaction volume</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { min: 0, max: 100000, discount: 0, label: 'Base Tier (Standard rates)' },
                                            { min: 100000, max: 1000000, discount: 0.2, label: 'Volume Tier 1 (-0.2% discount)' },
                                            { min: 1000000, max: null, discount: 0.5, label: 'Volume Tier 2 (-0.5% discount)' }
                                        ].map((tier, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">${(tier.min / 1000).toFixed(0)}k - {tier.max ? `$${(tier.max / 1000).toFixed(0)}k` : '∞'} monthly volume</p>
                                                    <p className="text-xs text-slate-600">{tier.label}</p>
                                                </div>
                                                <Badge variant="outline">{tier.discount}% discount</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Currency-Specific Fees */}
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle>Currency-Specific Fees</CardTitle>
                                    <CardDescription>Override base fees for specific currencies</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {['USD', 'EUR', 'GBP', 'SGD', 'HKD'].map((currency) => (
                                            <div key={currency} className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono">{currency}</Badge>
                                                    <span className="text-sm font-medium">{currency === 'USD' ? 'US Dollar' : currency === 'EUR' ? 'Euro' : currency === 'GBP' ? 'British Pound' : currency === 'SGD' ? 'Singapore Dollar' : 'Hong Kong Dollar'}</span>
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Percentage (%)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="2.9"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Fixed Fee</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.30"
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fee Type Controls */}
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle>Additional Fee Types</CardTitle>
                                    <CardDescription>Enable/disable specific fee types for this PSP instance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'chargeback', name: 'Chargeback Fees', description: 'Fee charged when a chargeback occurs', defaultAmount: 15 },
                                            { id: 'refund', name: 'Refund Processing Fees', description: 'Fee for processing refunds', defaultAmount: 0.50 },
                                            { id: 'monthly_minimum', name: 'Monthly Minimum Fee', description: 'Minimum monthly fee charged to merchants', defaultAmount: 25 },
                                            { id: 'retrieval', name: 'Retrieval Request Fee', description: 'Fee for dispute retrieval requests', defaultAmount: 10 },
                                            { id: 'batch', name: 'Batch Processing Fee', description: 'Fee per batch settlement', defaultAmount: 0.25 }
                                        ].map((feeType) => (
                                            <div key={feeType.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Switch />
                                                    <div>
                                                        <p className="font-medium text-sm">{feeType.name}</p>
                                                        <p className="text-xs text-slate-600">{feeType.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder={feeType.defaultAmount.toString()}
                                                        className="w-24 h-9"
                                                    />
                                                    <span className="text-sm text-slate-600">{feeType.id === 'refund' || feeType.id === 'batch' ? 'per transaction' : 'USD'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Payment Methods Tab */}
                    <TabsContent value="payments">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>Payment Methods</CardTitle>
                                <CardDescription>Enable payment methods for this PSP instance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Mock/Test Payment Gateways Section */}
                                {paymentGateways.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Mock Payment Gateways</h3>
                                                <p className="text-xs text-slate-600">Test payment gateways for development and testing</p>
                                            </div>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                                {paymentGateways.length} Available
                                            </Badge>
                                        </div>
                                        {paymentGateways.map((gateway) => {
                                            const methods = gateway.supported_methods || [];
                                            const displayName = gateway.metadata?.display_name || gateway.gateway_name;
                                            const isAnyEnabled = methods.some(m => config.enabled_payment_methods?.includes(m));
                                            
                                            return (
                                                <div 
                                                    key={gateway.id} 
                                                    className={cn(
                                                        "border-2 rounded-lg p-4 transition-all",
                                                        isAnyEnabled 
                                                            ? "border-blue-500 bg-blue-50" 
                                                            : "border-slate-200 hover:border-blue-300"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                                                <CreditCard className="h-6 w-6 text-slate-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">{displayName}</p>
                                                                <p className="text-xs text-slate-600">
                                                                    {gateway.status === 'active' ? '🟢 Active' : '⚪ Inactive'} • 
                                                                    {gateway.gateway_mode === 'test' ? ' Test Mode' : ' Live Mode'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className={isAnyEnabled ? "bg-blue-600" : "bg-slate-200 text-slate-600"}>
                                                            {methods.filter(m => config.enabled_payment_methods?.includes(m)).length}/{methods.length} Methods
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {methods.map((method) => {
                                                            const isEnabled = config.enabled_payment_methods?.includes(method);
                                                            const displayMethodName = getPaymentMethodDisplayName(method);
                                                            const logoUrl = getPaymentMethodLogo(method);
                                                            
                                                            return (
                                                                <div 
                                                                    key={method}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-2 rounded border",
                                                                        isEnabled ? "border-blue-500 bg-blue-100" : "border-slate-200 bg-white"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-5 rounded flex items-center justify-center bg-white border border-slate-200">
                                                                            {logoUrl ? (
                                                                                <img src={logoUrl} alt={displayMethodName} className="max-w-full max-h-full object-contain" />
                                                                            ) : (
                                                                                <CreditCard className="h-3 w-3 text-slate-400" />
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs font-medium">{displayMethodName}</span>
                                                                    </div>
                                                                    <Switch
                                                                        checked={isEnabled}
                                                                        onCheckedChange={(checked) => {
                                                                            const methods = checked
                                                                                ? [...(config.enabled_payment_methods || []), method]
                                                                                : (config.enabled_payment_methods || []).filter(m => m !== method);
                                                                            setConfig({...config, enabled_payment_methods: methods});
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Standard Payment Methods Section */}
                                {paymentProviders.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <CreditCard className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                        <p className="font-semibold mb-2">No payment providers available</p>
                                        <p className="text-xs">Contact FTS admin to add payment providers to the pool</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Standard Payment Methods</h3>
                                                <p className="text-xs text-slate-600">Production payment methods and alternative payment options</p>
                                            </div>
                                        </div>
                                        {['visa', 'mastercard', 'amex', 'discover', 'unionpay', 'diners_club', 'jcb', 'alipay', 'wechat', 'apple_pay', 'google_pay', 'paypal', 'ach', 'sepa', 'faster_payments', 'bitcoin', 'ethereum', 'usdt', 'usdc', 'bitcoin_cash', 'litecoin', 'ideal', 'sofort', 'giropay', 'bancontact', 'multibanco', 'p24', 'eps', 'sezzle', 'afterpay'].map((method) => {
                                            const isEnabled = config.enabled_payment_methods?.includes(method);
                                            const displayName = getPaymentMethodDisplayName(method);
                                            const logoUrl = getPaymentMethodLogo(method) || methodLogos[method];
                                            return (
                                                <div 
                                                    key={method} 
                                                    className={cn(
                                                        "flex items-center justify-between p-4 border-2 rounded-lg transition-all",
                                                        isEnabled 
                                                            ? "border-blue-500 bg-blue-50" 
                                                            : "border-slate-200 hover:border-blue-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-16 h-10 rounded flex items-center justify-center bg-white border border-slate-200 p-1"
                                                        )}>
                                                            {logoUrl ? (
                                                                <img src={logoUrl} alt={displayName} className="max-w-full max-h-full object-contain" />
                                                            ) : (
                                                                <CreditCard className="h-5 w-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{displayName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {isEnabled && <Badge className="bg-emerald-600">Enabled</Badge>}
                                                        <Switch
                                                            checked={isEnabled}
                                                            onCheckedChange={(checked) => {
                                                                const methods = checked
                                                                    ? [...(config.enabled_payment_methods || []), method]
                                                                    : (config.enabled_payment_methods || []).filter(m => m !== method);
                                                                setConfig({...config, enabled_payment_methods: methods});
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payout Methods Tab */}
                    <TabsContent value="payouts">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>Payout Route Configuration</CardTitle>
                                <CardDescription>Enable payout routes for merchant settlements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {payoutRoutes.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <Wallet className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                        <p>No payout routes configured in the platform</p>
                                    </div>
                                ) : (
                                    ['sepa', 'wire', 'visa_debit', 'mastercard_debit', 'cash_app', 'venmo', 'paypal', 'ethereum', 'usdt', 'usdc', 'bitcoin', 'real_time_payments', 'push_to_card'].map((method) => {
                                        const isEnabled = config.enabled_payout_methods?.includes(method);
                                        const displayName = getPaymentMethodDisplayName(method);
                                        const logoUrl = getPaymentMethodLogo(method) || methodLogos[method];
                                        return (
                                            <div key={method} className={cn(
                                                "flex items-center justify-between p-4 border-2 rounded-lg transition-all",
                                                isEnabled ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                                            )}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-10 rounded flex items-center justify-center bg-white border border-slate-200 p-1">
                                                        {logoUrl ? (
                                                            <img src={logoUrl} alt={displayName} className="max-w-full max-h-full object-contain" />
                                                        ) : (
                                                            <Wallet className="h-5 w-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{displayName}</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={(checked) => {
                                                        const methods = checked
                                                            ? [...(config.enabled_payout_methods || []), method]
                                                            : (config.enabled_payout_methods || []).filter(m => m !== method);
                                                        setConfig({...config, enabled_payout_methods: methods});
                                                    }}
                                                />
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Regional Settings Tab */}
                    <TabsContent value="regions">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>Regional Configuration</CardTitle>
                                <CardDescription>Set region-specific settings and compliance requirements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label>Default Currency (ISO 4217)</Label>
                                        <Select 
                                            value={config.region_settings?.default_currency || 'USD'}
                                            onValueChange={(v) => setConfig({...config, region_settings: {...config.region_settings, default_currency: v}})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {ISO4217_CURRENCIES.map(currency => (
                                                    <SelectItem key={currency.code} value={currency.code}>
                                                        {getCurrencySymbol(currency.code)} {currency.code} - {currency.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Timezone</Label>
                                        <Select 
                                            value={config.region_settings?.timezone || 'UTC'}
                                            onValueChange={(v) => setConfig({...config, region_settings: {...config.region_settings, timezone: v}})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                                <SelectItem value="America/New_York">EST</SelectItem>
                                                <SelectItem value="Europe/London">GMT</SelectItem>
                                                <SelectItem value="Asia/Singapore">SGT</SelectItem>
                                                <SelectItem value="Asia/Hong_Kong">HKT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Operating Region</Label>
                                        <Select 
                                            value={config.region_settings?.region || ''}
                                            onValueChange={(v) => setConfig({...config, region_settings: {...config.region_settings, region: v}})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="APAC">Asia Pacific</SelectItem>
                                                <SelectItem value="EU">Europe</SelectItem>
                                                <SelectItem value="NA">North America</SelectItem>
                                                <SelectItem value="LATAM">Latin America</SelectItem>
                                                <SelectItem value="MENA">Middle East & Africa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Language</Label>
                                        <Select 
                                            value={config.region_settings?.language || 'en'}
                                            onValueChange={(v) => setConfig({...config, region_settings: {...config.region_settings, language: v}})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="zh">Chinese</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Premium Features Tab */}
                    <TabsContent value="premium">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-600" />
                                    Premium Features
                                </CardTitle>
                                <CardDescription>Enable enterprise-grade premium features for this PSP (additional charges apply)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Card className="border-2 border-amber-200 bg-amber-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-slate-900">Direct Acquirer Connection</h3>
                                                    <Badge className="bg-amber-600 text-white">Enterprise</Badge>
                                                </div>
                                                <p className="text-sm text-slate-700 mb-3">
                                                    Allow this PSP to configure their own acquirer and bank connections directly, 
                                                    bypassing FTS-assigned connectors for full autonomy over payment processing infrastructure.
                                                </p>
                                                <div className="space-y-1 text-xs text-slate-600">
                                                    <p>✓ Configure own acquiring banks and processors</p>
                                                    <p>✓ Access to Bank MID management menu</p>
                                                    <p>✓ Custom MID routing configuration</p>
                                                    <p>✓ Direct settlement control</p>
                                                </div>
                                                <div className="mt-3 p-3 bg-white border border-amber-200 rounded">
                                                    <p className="text-xs font-semibold text-amber-900 mb-1">Pricing</p>
                                                    <p className="text-xs text-slate-700">Additional $2,500/month + 0.15% transaction fee</p>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex flex-col items-end gap-2">
                                                <Switch
                                                    checked={psp?.allow_direct_acquirer_connection || false}
                                                    onCheckedChange={(checked) => {
                                                        updateMutation.mutate({
                                                            ...config,
                                                            allow_direct_acquirer_connection: checked
                                                        });
                                                    }}
                                                />
                                                {psp?.allow_direct_acquirer_connection ? (
                                                    <Badge className="bg-emerald-600">Enabled</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-600">Disabled</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-900 mb-1">Premium Feature Management</p>
                                            <p className="text-sm text-blue-700">
                                                Premium features are billed separately and require approval from FTS Finance. 
                                                Toggle the switch to enable/disable features instantly. Changes are logged for compliance.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            
            <ComplianceFooter />
        </div>
    );
}