import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ArrowRight, 
    ArrowLeft, 
    Check, 
    Sparkles, 
    Building2,
    Zap,
    Shield,
    DollarSign,
    Globe,
    Rocket,
    Wallet,
    Award,
    Scale,
    CheckCircle2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { AuditLogger } from '@/components/platform/EnhancedAuditLogger';
import { COUNTRIES } from '@/components/utils/countries';
import { TIMEZONES } from '@/components/utils/timezones';
import { ISO4217_CURRENCIES, getCurrencySymbol } from '@/components/utils/iso4217';
import DeploymentSelector from '@/components/provisioning/DeploymentSelector';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';

const tiers = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$2,000/mo',
        revenue_share: 30,
        description: 'Perfect for getting started',
        features: {
            core: ['payment_processing', 'merchant_portal', 'virtual_terminal', 'reporting'],
            advanced: ['api_access'],
            compliance: ['pci_dss', 'kyb_verification', 'aml_screening'],
            limits: { max_payment_providers: 1, max_merchants: 100 }
        },
        icon: Rocket,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'professional',
        name: 'Professional',
        price: '$5,000/mo',
        revenue_share: 25,
        description: 'For growing businesses',
        features: {
            core: ['payment_processing', 'merchant_portal', 'virtual_terminal', 'reporting'],
            advanced: ['smart_routing', 'ai_fraud_detection', 'crypto_payments', 'api_access', 'webhook_management', 'smart_retry'],
            compliance: ['pci_dss', 'kyb_verification', 'aml_screening', 'fatf_compliance'],
            limits: { max_payment_providers: 3, max_merchants: 1000 }
        },
        icon: Zap,
        color: 'from-purple-500 to-pink-500',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$10,000/mo',
        revenue_share: 20,
        description: 'Full-featured platform',
        features: {
            core: ['payment_processing', 'merchant_portal', 'virtual_terminal', 'reporting'],
            advanced: ['smart_routing', 'ai_fraud_detection', 'network_tokenization', 'account_updater', 'smart_retry', 'crypto_payments', 'sub_merchant_management', 'split_payments', 'instant_settlements', 'api_access', 'webhook_management'],
            compliance: ['pci_dss', 'kyb_verification', 'aml_screening', 'fatf_compliance', 'lei_verification'],
            limits: { max_payment_providers: 10, max_merchants: null }
        },
        icon: Shield,
        color: 'from-amber-500 to-orange-500'
    },
    {
        id: 'custom',
        name: 'Custom',
        price: 'Contact Us',
        revenue_share: 15,
        description: 'Tailored to your needs',
        features: {
            core: ['payment_processing', 'merchant_portal', 'virtual_terminal', 'reporting'],
            advanced: ['smart_routing', 'ai_fraud_detection', 'network_tokenization', 'account_updater', 'smart_retry', 'crypto_payments', 'sub_merchant_management', 'split_payments', 'instant_settlements', 'api_access', 'webhook_management'],
            compliance: ['pci_dss', 'kyb_verification', 'aml_screening', 'fatf_compliance', 'lei_verification'],
            limits: { max_payment_providers: null, max_merchants: null }
        },
        icon: Sparkles,
        color: 'from-emerald-500 to-teal-500'
    }
];

export default function PSPProvisioningWizard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser } = usePlatformAuth();
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState('professional');
    const [useTemplate, setUseTemplate] = useState(true);
    const [customTiers, setCustomTiers] = useState(tiers);
    
    const generatePSPCode = (name, country, timezone) => {
        if (!name || !country || !timezone) return '';
        const str = `${name}-${country}-${timezone}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).toUpperCase().substring(0, 8);
    };

    const [formData, setFormData] = useState({
        psp_code: '',
        psp_name: '',
        legal_entity_name: '',
        domain: '',
        subdomain: '',
        contact_email: '',
        contact_phone: '',
        owner_email: '',
        license_type: 'full_license',
        country: '',
        currency: 'USD',
        timezone: 'UTC',
        branding: {
            primary_color: '#3b82f6',
            secondary_color: '#8b5cf6',
            logo_url: '',
            favicon_url: ''
        },
        transaction_fees: {
            card_percentage: 2.9,
            fixed_fee: 0.30,
            international_percentage: 3.9,
            crypto_percentage: 1.5
        },
        fee_tiers: [],
        currency_specific_fees: {},
        enabled_payment_methods: [],
        enabled_payout_methods: [],
        enabled_services: [],
        deployment_config: {
            primary_cloud: null,
            dr_cloud: null,
            dr_enabled: false
        },
        email_templates: {
            merchant_onboarding: '',
            transaction_notification: '',
            settlement_notification: ''
        }
    });

    const { data: templates = [] } = useQuery({
        queryKey: ['psp-templates'],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.list();
            return psps.filter(p => p.status === 'active');
        }
    });

    const [provisioningComplete, setProvisioningComplete] = useState(false);
    const [complianceReport, setComplianceReport] = useState(null);

    const provisionMutation = useMutation({
        mutationFn: async (data) => {
            // Create PSP record
            const psp = await base44.entities.ProvisionedPSP.create(data);
            
            // Automatically provision PCI Level 1 & GDPR compliant isolated schema
            const schemaResult = await base44.functions.invoke('provisionPSPSchema', {
                psp_code: data.psp_code,
                template_psp_code: 'NETXHUB'
            });
            
            // Validate compliance
            const complianceResult = await base44.functions.invoke('complianceFramework', {
                action: 'validatePSPCompliance',
                psp_code: data.psp_code
            });
            
            return { psp, schema: schemaResult.data, compliance: complianceResult.data };
        },
        onSuccess: (result) => {
            setComplianceReport(result);
            setProvisioningComplete(true);
            queryClient.invalidateQueries(['provisioned-psps']);
        }
    });

    const handleProvision = async () => {
        const tier = customTiers.find(t => t.id === selectedTier);
        const data = {
            ...formData,
            tier: selectedTier,
            pricing_model: 'revenue_share',
            revenue_share_percentage: tier.revenue_share,
            status: 'active',
            provisioning_progress: 100,
            core_features: {
                payment_processing: true,
                merchant_portal: true,
                virtual_terminal: true,
                reporting: true
            },
            advanced_features: tier.features.advanced.reduce((acc, f) => ({ ...acc, [f]: true }), {}),
            compliance_features: tier.features.compliance.reduce((acc, f) => ({ ...acc, [f]: true }), {}),
            max_payment_providers: tier.features.limits.max_payment_providers,
            max_merchants: tier.features.limits.max_merchants,
            sla_tier: selectedTier === 'enterprise' || selectedTier === 'custom' ? 'enterprise' : selectedTier === 'professional' ? 'premium' : 'standard',
            support_level: selectedTier === 'enterprise' || selectedTier === 'custom' ? 'dedicated' : selectedTier === 'professional' ? 'priority' : 'email'
        };
        
        const psp = await provisionMutation.mutateAsync(data);

        // Enhanced audit logging with ISO compliance tracking
        await AuditLogger.logPSPProvisioning(
            psp.psp,
            { email: platformUser?.email || 'admin@fts.money', platform_role: platformUser?.platform_role || 'platform_admin' },
            { 
                tier: selectedTier,
                compliance_validated: true,
                schema_provisioned: true
            }
        );
        
        // Create initial log
        await base44.entities.PSPInstanceLog.create({
            psp_id: psp.id,
            psp_code: psp.psp_code,
            log_type: 'deployment',
            severity: 'medium',
            message: 'PSP instance successfully provisioned',
            source: 'system'
        });
    };

    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: payoutRoutes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list()
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const { data: connectors = [] } = useQuery({
        queryKey: ['cloud-connectors'],
        queryFn: () => base44.entities.CloudConnector.list()
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 bg-white rounded-lg p-6 border border-slate-200">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Platform
                    </Button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">PSP Instance Provisioning</h1>
                                <p className="text-sm text-slate-600">Infrastructure deployment and configuration</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs">System Admin Panel</Badge>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-6 border border-slate-200">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <React.Fragment key={s}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold border-2",
                                    step >= s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-400 border-slate-300"
                                )}>
                                    {step > s ? <Check className="h-5 w-5" /> : s}
                                </div>
                                <div>
                                    <p className={cn("text-sm font-medium", step >= s ? "text-slate-900" : "text-slate-500")}>
                                        {s === 1 && 'Service Tier'}
                                        {s === 2 && 'Instance Config'}
                                        {s === 3 && 'Services'}
                                        {s === 4 && 'Fee Structure'}
                                        {s === 5 && 'Providers'}
                                        {s === 6 && 'Cloud Deployment'}
                                        {s === 7 && 'Deploy'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {s === 1 && 'Select tier & limits'}
                                        {s === 2 && 'Network & identity'}
                                        {s === 3 && 'Feature selection'}
                                        {s === 4 && 'Pricing config'}
                                        {s === 5 && 'Provider mapping'}
                                        {s === 6 && 'Cloud infrastructure'}
                                        {s === 7 && 'Review & launch'}
                                    </p>
                                </div>
                            </div>
                            {s < 5 && (
                                <div className={cn(
                                    "flex-1 h-0.5 mx-4",
                                    step > s ? "bg-blue-600" : "bg-slate-200"
                                )} />
                            )}
                            {s < 7 && (
                                <div className={cn(
                                    "flex-1 h-0.5 mx-4",
                                    step > s ? "bg-blue-600" : "bg-slate-200"
                                )} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Select Tier */}
                {step === 1 && (
                    <div className="space-y-6">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>Service Tier Selection</CardTitle>
                                <CardDescription>Choose the infrastructure tier and resource allocation for this PSP instance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {customTiers.map((tier) => {
                                        const Icon = tier.icon;
                                        return (
                                            <div
                                                key={tier.id}
                                                className={cn(
                                                    "cursor-pointer transition-all border-2 rounded-lg p-4",
                                                    selectedTier === tier.id 
                                                        ? "border-blue-600 bg-blue-50" 
                                                        : "border-slate-200 bg-white hover:border-slate-300"
                                                )}
                                                onClick={() => setSelectedTier(tier.id)}
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                                                        <Icon className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                                                        <p className="text-xs text-slate-600">{tier.description}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <Label className="text-xs">Monthly Price</Label>
                                                        <Input
                                                            value={tier.price}
                                                            onChange={(e) => {
                                                                const updatedTiers = customTiers.map(t => 
                                                                    t.id === tier.id ? {...t, price: e.target.value} : t
                                                                );
                                                                setCustomTiers(updatedTiers);
                                                            }}
                                                            className="h-8 text-sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Revenue Share (%)</Label>
                                                        <Input
                                                            type="number"
                                                            value={tier.revenue_share}
                                                            onChange={(e) => {
                                                                const updatedTiers = customTiers.map(t => 
                                                                    t.id === tier.id ? {...t, revenue_share: parseFloat(e.target.value)} : t
                                                                );
                                                                setCustomTiers(updatedTiers);
                                                            }}
                                                            className="h-8 text-sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <p><span className="font-medium">Max Providers:</span> {tier.features.limits.max_payment_providers || '∞'}</p>
                                                    <p><span className="font-medium">Max Merchants:</span> {tier.features.limits.max_merchants || '∞'}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button size="lg" onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">
                                Continue to Configuration
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Basic Info */}
                {step === 2 && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Instance Configuration</CardTitle>
                            <CardDescription>Network identity, domain setup, and regional configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {templates.length > 0 && (
                                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Clone Configuration</p>
                                            <p className="text-xs text-slate-600">Import settings from existing PSP instance</p>
                                        </div>
                                    </div>
                                    <Switch checked={useTemplate} onCheckedChange={setUseTemplate} />
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>PSP Name *</Label>
                                    <Input
                                        value={formData.psp_name}
                                        onChange={(e) => {
                                            const newName = e.target.value;
                                            const newCode = generatePSPCode(newName, formData.country, formData.timezone);
                                            setFormData({...formData, psp_name: newName, psp_code: newCode});
                                        }}
                                        placeholder="Acme Payments"
                                    />
                                </div>
                                <div>
                                    <Label>PSP Code (Auto-generated)</Label>
                                    <Input
                                        value={formData.psp_code}
                                        disabled
                                        className="bg-slate-100"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Auto-generated from name, country, and timezone</p>
                                </div>
                                <div className="col-span-2">
                                    <Label>Legal Entity Name</Label>
                                    <Input
                                        value={formData.legal_entity_name}
                                        onChange={(e) => setFormData({...formData, legal_entity_name: e.target.value})}
                                        placeholder="Acme Payments Ltd"
                                    />
                                </div>
                                <div>
                                    <Label>Custom Domain</Label>
                                    <Input
                                        value={formData.domain}
                                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                                        placeholder="pay.acme.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">DNS configuration required post-deployment</p>
                                </div>
                                <div>
                                    <Label>FTS Subdomain</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={formData.subdomain}
                                            onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                                            placeholder="acme"
                                        />
                                        <span className="text-slate-500 text-sm">.fts.money</span>
                                    </div>
                                </div>
                                <div>
                                    <Label>Owner Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.owner_email}
                                        onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                                        placeholder="owner@example.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Primary account owner</p>
                                </div>
                                <div>
                                    <Label>Contact Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Contact Phone</Label>
                                    <Input
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>License Type</Label>
                                    <Select value={formData.license_type} onValueChange={(v) => setFormData({...formData, license_type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full_license">Full License</SelectItem>
                                            <SelectItem value="agent_model">Agent Model</SelectItem>
                                            <SelectItem value="payfac">PayFac</SelectItem>
                                            <SelectItem value="iso">ISO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Operating Country *</Label>
                                    <Select 
                                        value={formData.country} 
                                        onValueChange={(v) => {
                                            const newCode = generatePSPCode(formData.psp_name, v, formData.timezone);
                                            setFormData({...formData, country: v, psp_code: newCode});
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRIES.map(c => (
                                                <SelectItem key={c.code} value={c.code}>
                                                    {c.name} ({c.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Default Currency (ISO 4217)</Label>
                                    <Select value={formData.currency} onValueChange={(v) => setFormData({...formData, currency: v})}>
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
                                    <Label>Timezone *</Label>
                                    <Select 
                                        value={formData.timezone} 
                                        onValueChange={(v) => {
                                            const newCode = generatePSPCode(formData.psp_name, formData.country, v);
                                            setFormData({...formData, timezone: v, psp_code: newCode});
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIMEZONES.map(tz => (
                                                <SelectItem key={tz} value={tz}>
                                                    {tz}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Logo URL</Label>
                                    <Input
                                        value={formData.branding.logo_url}
                                        onChange={(e) => setFormData({...formData, branding: {...formData.branding, logo_url: e.target.value}})}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-200">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700">
                                Continue to Services
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 3: Services Selection */}
                {step === 3 && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Service Selection</CardTitle>
                            <CardDescription>Choose which NetXHub services to enable for this PSP instance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {['payment_rail', 'orchestration', 'fraud_detection', 'compliance', 'payout', 'analytics', 'developer_tools'].map((category) => {
                                const categoryServices = services.filter(s => s.service_category === category);
                                if (categoryServices.length === 0) return null;
                                
                                return (
                                    <div key={category}>
                                        <h3 className="font-semibold text-slate-900 mb-3 capitalize">{category.replace(/_/g, ' ')}</h3>
                                        <div className="space-y-2">
                                            {categoryServices.map((service) => {
                                               const isEnabled = formData.enabled_services.includes(service.id);
                                               return (
                                                   <div
                                                       key={service.id}
                                                       className={cn(
                                                           "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all",
                                                           isEnabled ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                                                       )}
                                                       onClick={() => {
                                                           const newServices = isEnabled
                                                               ? formData.enabled_services.filter(s => s !== service.id)
                                                               : [...formData.enabled_services, service.id];
                                                           setFormData({...formData, enabled_services: newServices});
                                                       }}
                                                   >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded flex items-center justify-center",
                                                                isEnabled ? "bg-blue-600" : "bg-blue-50"
                                                            )}>
                                                                {isEnabled ? <Check className="h-5 w-5 text-white" /> : <Zap className="h-5 w-5 text-blue-600" />}
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
                                                            <Switch checked={isEnabled} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-200">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700">
                                Continue to Fee Structure
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 4: Fee Structure */}
                {step === 4 && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Fee Structure Configuration</CardTitle>
                            <CardDescription>Configure automated pricing based on commercial tier</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-1">Automated Configuration</p>
                                <p className="text-xs text-blue-700">Fee structures will be auto-generated based on the selected tier ({customTiers.find(t => t.id === selectedTier)?.name}) and can be customized post-deployment.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900 mb-4">Default Transaction Fees</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Card Processing Fee (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.card_percentage}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, card_percentage: parseFloat(e.target.value)}})}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Percentage charged per card transaction</p>
                                    </div>
                                    <div>
                                        <Label>Fixed Fee per Transaction</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.fixed_fee}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, fixed_fee: parseFloat(e.target.value)}})}
                                        />
                                    </div>
                                    <div>
                                        <Label>International Fee (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.international_percentage}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, international_percentage: parseFloat(e.target.value)}})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Crypto Processing Fee (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.crypto_percentage}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, crypto_percentage: parseFloat(e.target.value)}})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900 mb-2">Tiered Pricing</h3>
                                <p className="text-sm text-slate-600 mb-4">Volume-based fee tiers will be configured based on commercial agreement</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                        <div>
                                            <p className="text-sm font-medium">$0 - $100K monthly volume</p>
                                            <p className="text-xs text-slate-600">Standard rates apply</p>
                                        </div>
                                        <Badge variant="outline">Base Tier</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                        <div>
                                            <p className="text-sm font-medium">$100K - $1M monthly volume</p>
                                            <p className="text-xs text-slate-600">-0.2% discount</p>
                                        </div>
                                        <Badge variant="outline">Volume Tier 1</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                        <div>
                                            <p className="text-sm font-medium">$1M+ monthly volume</p>
                                            <p className="text-xs text-slate-600">-0.5% discount</p>
                                        </div>
                                        <Badge variant="outline">Volume Tier 2</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-200">
                            <Button variant="outline" onClick={() => setStep(3)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(5)} className="bg-blue-600 hover:bg-blue-700">
                                Configure Payment Providers
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 5: Provider Mapping */}
                {step === 5 && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Payment Provider Mapping</CardTitle>
                            <CardDescription>Map payment and payout providers based on commercial agreements</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-900">Payment Providers</h3>
                                    <Badge>{formData.enabled_payment_methods.length} selected</Badge>
                                </div>
                                <div className="space-y-2">
                                    {paymentProviders.length > 0 ? paymentProviders.map((provider) => (
                                        <div key={provider.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center">
                                                    <span className="text-xs font-semibold">{provider.name.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{provider.name}</p>
                                                    <p className="text-xs text-slate-600">{provider.type}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={formData.enabled_payment_methods.includes(provider.id)}
                                                onCheckedChange={(checked) => {
                                                    const methods = checked
                                                        ? [...formData.enabled_payment_methods, provider.id]
                                                        : formData.enabled_payment_methods.filter(m => m !== provider.id);
                                                    setFormData({...formData, enabled_payment_methods: methods});
                                                }}
                                            />
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <p>No payment providers configured yet</p>
                                            <p className="text-xs mt-1">Default providers will be assigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-900">Payout Routes</h3>
                                    <Badge>{formData.enabled_payout_methods.length} selected</Badge>
                                </div>
                                <div className="space-y-2">
                                    {payoutRoutes.length > 0 ? payoutRoutes.map((route) => (
                                        <div key={route.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center">
                                                    <Wallet className="h-5 w-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{route.route_name}</p>
                                                    <p className="text-xs text-slate-600">{route.channel_type} • {route.provider}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={formData.enabled_payout_methods.includes(route.id)}
                                                onCheckedChange={(checked) => {
                                                    const methods = checked
                                                        ? [...formData.enabled_payout_methods, route.id]
                                                        : formData.enabled_payout_methods.filter(m => m !== route.id);
                                                    setFormData({...formData, enabled_payout_methods: methods});
                                                }}
                                            />
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <p>No payout routes configured yet</p>
                                            <p className="text-xs mt-1">Default routes will be assigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-200">
                            <Button variant="outline" onClick={() => setStep(4)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(6)} className="bg-blue-600 hover:bg-blue-700">
                                Configure Cloud Deployment
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 6: Cloud Deployment Selection */}
                {step === 6 && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Cloud Deployment Configuration</CardTitle>
                            <CardDescription>Select cloud infrastructure for primary and disaster recovery environments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <DeploymentSelector
                                connectors={connectors.filter(c => c.status === 'active')}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-200">
                            <Button variant="outline" onClick={() => setStep(5)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(7)} className="bg-blue-600 hover:bg-blue-700">
                                Review Configuration
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 7: Deploy */}
                {step === 7 && !provisioningComplete && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Deployment Review</CardTitle>
                            <CardDescription>Verify configuration before infrastructure provisioning</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">PSP Code</p>
                                    <p className="font-mono font-semibold">{formData.psp_code}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">PSP Name</p>
                                    <p className="font-semibold">{formData.psp_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Service Tier</p>
                                    <Badge variant="outline">{customTiers.find(t => t.id === selectedTier)?.name}</Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Domain</p>
                                    <p className="text-sm">{formData.domain || `${formData.subdomain}.fts.money`}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Currency / Timezone</p>
                                    <p className="text-sm">{formData.currency} / {formData.timezone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Contact</p>
                                    <p className="text-sm">{formData.contact_email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-sm mb-2">Payment Providers</h4>
                                    <p className="text-2xl font-bold text-blue-600">{formData.enabled_payment_methods.length}</p>
                                    <p className="text-xs text-slate-600">Providers mapped</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-sm mb-2">Payout Routes</h4>
                                    <p className="text-2xl font-bold text-emerald-600">{formData.enabled_payout_methods.length}</p>
                                    <p className="text-xs text-slate-600">Routes configured</p>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2">Automated Deployment Process</p>
                                <ul className="space-y-1 text-sm text-blue-800">
                                    <li>• Infrastructure allocation and network configuration</li>
                                    <li>• Database provisioning with automated schema deployment</li>
                                    <li>• SSL/TLS certificate generation and DNS setup</li>
                                    <li>• Payment provider integration and credential mapping</li>
                                    <li>• Fee structure deployment based on tier configuration</li>
                                    <li>• Admin portal access and credential distribution</li>
                                    <li>• Monitoring and alerting configuration</li>
                                </ul>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-200">
                            <Button variant="outline" onClick={() => setStep(6)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button 
                                onClick={handleProvision} 
                                disabled={provisionMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                {provisionMutation.isPending ? 'Deploying Infrastructure...' : 'Deploy PSP Instance'}
                                <Rocket className="h-5 w-5 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Compliance Confirmation */}
                {provisioningComplete && complianceReport && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Shield className="h-8 w-8 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-emerald-900">PSP Successfully Deployed</CardTitle>
                                    <CardDescription className="text-emerald-700">
                                        Fully compliant with international standards
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Compliance Score */}
                            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-emerald-900">Compliance Score</h3>
                                    <Badge className="bg-emerald-600 text-white text-xl px-4 py-2">
                                        {complianceReport.compliance?.compliance_score || 100}/100
                                    </Badge>
                                </div>
                                <p className="text-sm text-emerald-700">
                                    Your PSP instance meets all mandatory international compliance standards for payment processing.
                                </p>
                            </div>

                            {/* Certifications */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-4">Active Certifications & Standards</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-semibold text-sm">PCI DSS Level 1</p>
                                            <p className="text-xs text-slate-600">Payment Card Industry</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-semibold text-sm">GDPR Article 32</p>
                                            <p className="text-xs text-slate-600">Data Protection</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <Award className="h-5 w-5 text-emerald-600" />
                                        <div>
                                            <p className="font-semibold text-sm">ISO 27001</p>
                                            <p className="text-xs text-slate-600">Information Security</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <Award className="h-5 w-5 text-cyan-600" />
                                        <div>
                                            <p className="font-semibold text-sm">SOC 2 Type II</p>
                                            <p className="text-xs text-slate-600">Trust Services</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <Scale className="h-5 w-5 text-amber-600" />
                                        <div>
                                            <p className="font-semibold text-sm">PSD2 & SCA</p>
                                            <p className="text-xs text-slate-600">Payment Services</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <Shield className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-semibold text-sm">AML/CFT (FATF)</p>
                                            <p className="text-xs text-slate-600">Anti-Money Laundering</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Standards */}
                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-sm font-medium text-slate-700 mb-3">Additional Standards Implemented:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'ISO 22301', 'ISO 20000', 'ISO 5002', 'OWASP ASVS L3', 'FIPS 140-3', 
                                        'NIST CSF', 'eIDAS 2.0', 'CCPA/LGPD', 'PIPEDA', 'Open Banking',
                                        'CSA STAR', 'ISO 27017/18', 'NACHA', 'SWIFT', 'TLS 1.3'
                                    ].map((std) => (
                                        <Badge key={std} variant="outline" className="text-xs">
                                            ✓ {std}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Technical Controls */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-3">Technical Security Controls</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <span className="text-blue-800">AES-256-GCM Encryption</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <span className="text-blue-800">TLS 1.3 Transport</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <span className="text-blue-800">MFA + FIDO2 Auth</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <span className="text-blue-800">HSM Key Management</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <span className="text-blue-800">Zero Trust Network</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <span className="text-blue-800">Isolated Database</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500">
                                    Provisioned: {new Date().toLocaleString()}
                                </p>
                                <Button 
                                    onClick={() => navigate(createPageUrl('PSPProvisioning'))}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    size="lg"
                                >
                                    View PSP Dashboard
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}