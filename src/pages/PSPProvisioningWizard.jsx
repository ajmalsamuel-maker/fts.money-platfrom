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
    Wallet
} from 'lucide-react';
import { cn } from "@/lib/utils";

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
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState('professional');
    const [useTemplate, setUseTemplate] = useState(true);
    
    const [formData, setFormData] = useState({
        psp_code: '',
        psp_name: '',
        legal_entity_name: '',
        domain: '',
        subdomain: '',
        contact_email: '',
        contact_phone: '',
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

    const provisionMutation = useMutation({
        mutationFn: async (data) => {
            // Create PSP record
            const psp = await base44.entities.ProvisionedPSP.create(data);
            
            // Automatically provision PCI Level 1 & GDPR compliant isolated schema
            await base44.functions.invoke('provisionPSPSchema', {
                psp_code: data.psp_code,
                template_psp_code: 'NETXHUB' // Copy payment providers from template
            });
            
            return psp;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provisioned-psps']);
            navigate(createPageUrl('PSPProvisioning'));
        }
    });

    const handleProvision = async () => {
        const tier = tiers.find(t => t.id === selectedTier);
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
        
        // Create audit log
        await base44.entities.PSPAuditTrail.create({
            psp_id: psp.id,
            psp_code: psp.psp_code,
            action: 'created',
            user_email: 'admin@fts.money',
            user_role: 'platform_operator',
            metadata: { tier: selectedTier }
        });
        
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
                    {[1, 2, 3, 4, 5].map((s) => (
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
                                        {s === 3 && 'Fee Structure'}
                                        {s === 4 && 'Payment Providers'}
                                        {s === 5 && 'Deploy'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {s === 1 && 'Select tier & limits'}
                                        {s === 2 && 'Network & identity'}
                                        {s === 3 && 'Pricing config'}
                                        {s === 4 && 'Provider mapping'}
                                        {s === 5 && 'Review & launch'}
                                    </p>
                                </div>
                            </div>
                            {s < 5 && (
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
                                    {tiers.map((tier) => {
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
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">Pricing:</span> {tier.price}</p>
                                                    <p><span className="font-medium">Revenue Share:</span> {tier.revenue_share}%</p>
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
                                    <Label>PSP Code *</Label>
                                    <Input
                                        value={formData.psp_code}
                                        onChange={(e) => setFormData({...formData, psp_code: e.target.value.toUpperCase()})}
                                        placeholder="ACME"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Unique identifier for routing and API access</p>
                                </div>
                                <div>
                                    <Label>PSP Name *</Label>
                                    <Input
                                        value={formData.psp_name}
                                        onChange={(e) => setFormData({...formData, psp_name: e.target.value})}
                                        placeholder="Acme Payments"
                                    />
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
                                    <Label>Operating Country</Label>
                                    <Input
                                        value={formData.country}
                                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        placeholder="US"
                                    />
                                </div>
                                <div>
                                    <Label>Default Currency</Label>
                                    <Select value={formData.currency} onValueChange={(v) => setFormData({...formData, currency: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="SGD">SGD</SelectItem>
                                            <SelectItem value="HKD">HKD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Timezone</Label>
                                    <Select value={formData.timezone} onValueChange={(v) => setFormData({...formData, timezone: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">EST (New York)</SelectItem>
                                            <SelectItem value="Europe/London">GMT (London)</SelectItem>
                                            <SelectItem value="Asia/Singapore">SGT (Singapore)</SelectItem>
                                            <SelectItem value="Asia/Hong_Kong">HKT (Hong Kong)</SelectItem>
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
                                Continue to Fee Structure
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 3: Fee Structure */}
                {step === 3 && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Fee Structure Configuration</CardTitle>
                            <CardDescription>Configure automated pricing based on commercial tier</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-1">Automated Configuration</p>
                                <p className="text-xs text-blue-700">Fee structures will be auto-generated based on the selected tier ({tiers.find(t => t.id === selectedTier)?.name}) and can be customized post-deployment.</p>
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
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700">
                                Configure Payment Providers
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 4: Provider Mapping */}
                {step === 4 && (
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
                            <Button variant="outline" onClick={() => setStep(3)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(5)} className="bg-blue-600 hover:bg-blue-700">
                                Review Configuration
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 5: Deploy */}
                {step === 5 && (
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
                                    <Badge variant="outline">{tiers.find(t => t.id === selectedTier)?.name}</Badge>
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
                            <Button variant="outline" onClick={() => setStep(4)}>
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
            </div>
        </div>
    );
}