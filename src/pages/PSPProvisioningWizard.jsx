import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { COUNTRIES } from '@/components/utils/countries';
import { TIMEZONES } from '@/components/utils/timezones';
import { ISO4217_CURRENCIES, getCurrencySymbol } from '@/components/utils/iso4217';
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowRight, 
    ArrowLeft, 
    Check, 
    Sparkles, 
    Building2,
    Zap,
    Shield,
    Rocket,
    Wallet,
    CheckCircle2,
    Loader2
} from 'lucide-react';

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
    
    const loadSavedState = () => {
        const saved = localStorage.getItem('psp_wizard_state');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
        return null;
    };
    
    const savedState = loadSavedState();
    
    const [step, setStep] = useState(savedState?.step || 1);
    const [selectedTier, setSelectedTier] = useState(savedState?.selectedTier || 'professional');
    const [useTemplate, setUseTemplate] = useState(savedState?.useTemplate ?? true);
    const [customTiers, setCustomTiers] = useState(savedState?.customTiers || tiers);
    
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

    const [formData, setFormData] = useState(savedState?.formData || {
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
        lei: '',
        vlei: '',
        lei_waived: false,
        use_tas: false,
        tas_number: '',
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
        },
        admin_user: {
            email: '',
            full_name: '',
            password: ''
        }
    });
    
    useEffect(() => {
        const stateToSave = {
            step,
            selectedTier,
            useTemplate,
            customTiers,
            formData
        };
        localStorage.setItem('psp_wizard_state', JSON.stringify(stateToSave));
    }, [step, selectedTier, useTemplate, customTiers, formData]);

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
            const psp = await base44.entities.ProvisionedPSP.create({
                ...data,
                status: 'provisioning'
            });
            
            await base44.entities.ApprovalRequest.create({
                request_type: 'psp_creation',
                entity_type: 'ProvisionedPSP',
                entity_id: psp.id,
                entity_data: data,
                submitted_by: platformUser?.email || 'admin@fts.money',
                submitted_by_name: platformUser?.email || 'Admin',
                priority: 'high'
            });
            
            return { psp };
        },
        onSuccess: (result) => {
            setProvisioningComplete(true);
            queryClient.invalidateQueries(['provisioned-psps']);
            queryClient.invalidateQueries(['approval-requests']);
            localStorage.removeItem('psp_wizard_state');
        }
    });

    const handleProvision = async () => {
        const tier = customTiers.find(t => t.id === selectedTier);
        
        const gracePeriodEnd = formData.lei_waived 
            ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : null;
        
        const data = {
            ...formData,
            tier: selectedTier,
            pricing_model: 'revenue_share',
            revenue_share_percentage: tier.revenue_share,
            status: 'active',
            provisioning_progress: 100,
            lei_status: formData.lei ? 'active' : (formData.lei_waived ? 'pending' : 'not_required'),
            lei_grace_period_end: gracePeriodEnd,
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

        await base44.entities.PSPAuditTrail.create({
            psp_id: psp.psp.id,
            psp_code: data.psp_code,
            action: 'psp_creation_requested',
            field_changed: 'status',
            old_value: null,
            new_value: 'provisioning',
            user_email: platformUser?.email || 'admin@fts.money',
            user_role: platformUser?.platform_role || 'platform_admin',
            ip_address: 'system',
            metadata: { tier: selectedTier, submitted_for_approval: true }
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
                <div className="mb-8 bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Platform
                        </Button>
                        {savedState && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    if (confirm('Clear saved progress? This cannot be undone.')) {
                                        localStorage.removeItem('psp_wizard_state');
                                        window.location.reload();
                                    }
                                }}
                            >
                                Clear Saved Progress
                            </Button>
                        )}
                    </div>
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

                <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-6 border border-slate-200">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <React.Fragment key={`step-${s}`}>
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
                            {s < 7 && (
                                <div className={cn(
                                    "flex-1 h-0.5 mx-4",
                                    step > s ? "bg-blue-600" : "bg-slate-200"
                                )} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

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

                {step === 2 && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Instance Configuration</CardTitle>
                            <CardDescription>Network identity, domain setup, and regional configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-slate-600">Configuration form - Step 2 content here</p>
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

                {provisioningComplete && (
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-blue-900">PSP Submitted for Approval</CardTitle>
                                    <CardDescription className="text-blue-700">
                                        Your request is now in the provisioning queue
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button 
                                onClick={() => navigate(createPageUrl('FTSProvisioningQueue'))}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                View Provisioning Queue
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}