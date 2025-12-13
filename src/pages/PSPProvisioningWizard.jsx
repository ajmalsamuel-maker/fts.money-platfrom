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
    Rocket
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
            return await base44.entities.ProvisionedPSP.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provisioned-psps']);
            navigate(createPageUrl('PSPProvisioning'));
        }
    });

    const handleProvision = () => {
        const tier = tiers.find(t => t.id === selectedTier);
        const data = {
            ...formData,
            tier: selectedTier,
            pricing_model: 'revenue_share',
            revenue_share_percentage: tier.revenue_share,
            status: 'provisioning',
            provisioning_progress: 0,
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
        provisionMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('PSPProvisioning'))}
                        className="mb-4 text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Provision New PSP</h1>
                            <p className="text-slate-400">Launch your white-label payment platform in minutes</p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <React.Fragment key={s}>
                            <div className={cn(
                                "flex flex-col items-center"
                            )}>
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold",
                                    step >= s ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"
                                )}>
                                    {step > s ? <Check className="h-5 w-5" /> : s}
                                </div>
                                <span className={cn(
                                    "text-xs mt-1",
                                    step >= s ? "text-slate-900" : "text-slate-500"
                                )}>
                                    {s === 1 && 'Tier'}
                                    {s === 2 && 'Info'}
                                    {s === 3 && 'Branding'}
                                    {s === 4 && 'Methods'}
                                    {s === 5 && 'Review'}
                                </span>
                            </div>
                            {s < 5 && (
                                <div className={cn(
                                    "w-16 h-1 mx-2 mt-[-20px]",
                                    step > s ? "bg-blue-600" : "bg-slate-300"
                                )} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Select Tier */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
                            <p className="text-slate-400">Select the tier that best fits your needs</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {tiers.map((tier) => {
                                const Icon = tier.icon;
                                return (
                                    <Card
                                        key={tier.id}
                                        className={cn(
                                            "cursor-pointer transition-all border-2",
                                            selectedTier === tier.id 
                                                ? "border-blue-500 bg-slate-800/80 shadow-lg shadow-blue-500/20" 
                                                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                        )}
                                        onClick={() => setSelectedTier(tier.id)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", tier.color)}>
                                                        <Icon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-white">{tier.name}</CardTitle>
                                                        <CardDescription className="text-slate-400">{tier.description}</CardDescription>
                                                    </div>
                                                </div>
                                                {tier.popular && (
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Popular</Badge>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-3xl font-bold text-white">{tier.price}</p>
                                                <p className="text-sm text-slate-400 mt-1">or {tier.revenue_share}% revenue share</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 mb-2">CORE FEATURES</p>
                                                <div className="space-y-1">
                                                    {tier.features.core.map(f => (
                                                        <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                                                            <Check className="h-4 w-4 text-emerald-400" />
                                                            {f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 mb-2">ADVANCED FEATURES</p>
                                                <div className="space-y-1">
                                                    {tier.features.advanced.slice(0, 3).map(f => (
                                                        <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                                                            <Check className="h-4 w-4 text-blue-400" />
                                                            {f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </div>
                                                    ))}
                                                    {tier.features.advanced.length > 3 && (
                                                        <p className="text-xs text-slate-500">+ {tier.features.advanced.length - 3} more...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        <div className="flex justify-end">
                            <Button size="lg" onClick={() => setStep(2)} className="gap-2">
                                Continue
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Basic Info */}
                {step === 2 && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Basic Information</CardTitle>
                            <CardDescription className="text-slate-400">Configure your PSP identity</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {templates.length > 0 && (
                                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                        <div>
                                            <p className="text-sm font-medium text-white">Clone from existing PSP</p>
                                            <p className="text-xs text-slate-400">Use NetXHub configuration as template</p>
                                        </div>
                                    </div>
                                    <Switch checked={useTemplate} onCheckedChange={setUseTemplate} />
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-300">PSP Code *</Label>
                                    <Input
                                        value={formData.psp_code}
                                        onChange={(e) => setFormData({...formData, psp_code: e.target.value.toUpperCase()})}
                                        placeholder="ACME"
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">PSP Name *</Label>
                                    <Input
                                        value={formData.psp_name}
                                        onChange={(e) => setFormData({...formData, psp_name: e.target.value})}
                                        placeholder="Acme Payments"
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-slate-300">Legal Entity Name</Label>
                                    <Input
                                        value={formData.legal_entity_name}
                                        onChange={(e) => setFormData({...formData, legal_entity_name: e.target.value})}
                                        placeholder="Acme Payments Ltd"
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Custom Domain</Label>
                                    <Input
                                        value={formData.domain}
                                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                                        placeholder="pay.acme.com"
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">FTS Subdomain</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={formData.subdomain}
                                            onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                                            placeholder="acme"
                                            className="bg-slate-900 border-slate-700 text-white"
                                        />
                                        <span className="text-slate-500 text-sm">.fts.money</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-slate-300">Contact Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Contact Phone</Label>
                                    <Input
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">License Type</Label>
                                    <Select value={formData.license_type} onValueChange={(v) => setFormData({...formData, license_type: v})}>
                                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
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
                                    <Label className="text-slate-300">Country</Label>
                                    <Input
                                        value={formData.country}
                                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        placeholder="US"
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Primary Color</Label>
                                    <Input
                                        type="color"
                                        value={formData.branding.primary_color}
                                        onChange={(e) => setFormData({...formData, branding: {...formData.branding, primary_color: e.target.value}})}
                                        className="bg-slate-900 border-slate-700 h-10"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Secondary Color</Label>
                                    <Input
                                        type="color"
                                        value={formData.branding.secondary_color}
                                        onChange={(e) => setFormData({...formData, branding: {...formData.branding, secondary_color: e.target.value}})}
                                        className="bg-slate-900 border-slate-700 h-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-700">
                            <Button variant="outline" onClick={() => setStep(1)} className="border-slate-600 text-slate-300">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(3)} className="gap-2">
                                Continue
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 3: Branding & Fees */}
                {step === 3 && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Branding & Fee Configuration</CardTitle>
                            <CardDescription className="text-slate-400">Configure appearance and fee structure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-white font-semibold mb-4">Branding</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300">Logo URL</Label>
                                        <Input
                                            value={formData.branding.logo_url}
                                            onChange={(e) => setFormData({...formData, branding: {...formData.branding, logo_url: e.target.value}})}
                                            placeholder="https://example.com/logo.png"
                                            className="bg-slate-900 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">Favicon URL</Label>
                                        <Input
                                            value={formData.branding.favicon_url}
                                            onChange={(e) => setFormData({...formData, branding: {...formData.branding, favicon_url: e.target.value}})}
                                            placeholder="https://example.com/favicon.ico"
                                            className="bg-slate-900 border-slate-700 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold mb-4">Transaction Fees</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300">Card Processing Fee (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.card_percentage}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, card_percentage: parseFloat(e.target.value)}})}
                                            className="bg-slate-900 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">Fixed Fee per Transaction</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.fixed_fee}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, fixed_fee: parseFloat(e.target.value)}})}
                                            className="bg-slate-900 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">International Fee (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.international_percentage}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, international_percentage: parseFloat(e.target.value)}})}
                                            className="bg-slate-900 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">Crypto Processing Fee (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.transaction_fees.crypto_percentage}
                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, crypto_percentage: parseFloat(e.target.value)}})}
                                            className="bg-slate-900 border-slate-700 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-700">
                            <Button variant="outline" onClick={() => setStep(2)} className="border-slate-600 text-slate-300">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(4)} className="gap-2">
                                Continue
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 4: Payment & Payout Methods */}
                {step === 4 && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Payment & Payout Methods</CardTitle>
                            <CardDescription className="text-slate-400">Select available methods for this PSP</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-white font-semibold mb-4">Payment Methods</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Visa', 'Mastercard', 'Amex', 'Crypto', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer'].map((method) => (
                                        <div key={method} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                                            <span className="text-slate-300">{method}</span>
                                            <Switch
                                                checked={formData.enabled_payment_methods.includes(method)}
                                                onCheckedChange={(checked) => {
                                                    const methods = checked
                                                        ? [...formData.enabled_payment_methods, method]
                                                        : formData.enabled_payment_methods.filter(m => m !== method);
                                                    setFormData({...formData, enabled_payment_methods: methods});
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold mb-4">Payout Methods</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Bank Transfer', 'Instant Payout', 'Crypto Payout', 'Digital Wallet'].map((method) => (
                                        <div key={method} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                                            <span className="text-slate-300">{method}</span>
                                            <Switch
                                                checked={formData.enabled_payout_methods.includes(method)}
                                                onCheckedChange={(checked) => {
                                                    const methods = checked
                                                        ? [...formData.enabled_payout_methods, method]
                                                        : formData.enabled_payout_methods.filter(m => m !== method);
                                                    setFormData({...formData, enabled_payout_methods: methods});
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-700">
                            <Button variant="outline" onClick={() => setStep(3)} className="border-slate-600 text-slate-300">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(5)} className="gap-2">
                                Continue
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 5: Review & Launch */}
                {step === 5 && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Review & Launch</CardTitle>
                            <CardDescription className="text-slate-400">Confirm your configuration and provision</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">PSP NAME</p>
                                        <p className="text-white font-medium">{formData.psp_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">PSP CODE</p>
                                        <p className="text-white font-mono">{formData.psp_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">DOMAIN</p>
                                        <p className="text-white">{formData.domain || `${formData.subdomain}.fts.money`}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">TIER</p>
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                            {tiers.find(t => t.id === selectedTier)?.name}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">PRICING</p>
                                        <p className="text-white">{tiers.find(t => t.id === selectedTier)?.price}</p>
                                        <p className="text-xs text-slate-500">or {tiers.find(t => t.id === selectedTier)?.revenue_share}% revenue share</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-400 font-medium mb-2">What happens next?</p>
                                <ul className="space-y-1 text-sm text-slate-300">
                                    <li>✓ Instant infrastructure provisioning</li>
                                    <li>✓ Database and storage allocation</li>
                                    <li>✓ SSL certificate generation</li>
                                    <li>✓ Feature activation based on tier</li>
                                    <li>✓ Admin credentials sent to email</li>
                                </ul>
                            </div>
                        </CardContent>
                        <div className="flex justify-between p-6 border-t border-slate-700">
                            <Button variant="outline" onClick={() => setStep(4)} className="border-slate-600 text-slate-300">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button 
                                onClick={handleProvision} 
                                disabled={provisionMutation.isPending}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                                size="lg"
                            >
                                {provisionMutation.isPending ? 'Provisioning...' : 'Launch PSP'}
                                <Rocket className="h-5 w-5" />
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}