import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    DollarSign, 
    Save, 
    RefreshCw,
    Zap,
    TrendingUp,
    Building2,
    Building,
    Check,
    Wallet,
    Code,
    GitBranch,
    Package,
    FileText,
    Shield,
    Leaf,
    Info
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getServicePricingTemplate, getServiceTierDefaults } from '@/components/pricing/ServicePricingTemplates';

const TIER_ICONS = {
    starter: Zap,
    growth: TrendingUp,
    professional: Building2,
    enterprise: Building
};

const DEFAULT_TIERS = [
    {
        tier_name: 'starter',
        display_name: 'Starter',
        setup_fee: 0,
        monthly_hosting_fee: 0,
        transaction_fee_percentage: 3.5,
        transaction_fee_fixed: 0.50,
        max_merchants: 100,
        max_transactions_per_month: 10000,
        max_transaction_amount: 10000,
        support_level: 'email',
        sla_uptime: 99.5,
        sort_order: 1
    },
    {
        tier_name: 'growth',
        display_name: 'Growth',
        setup_fee: 999,
        monthly_hosting_fee: 299,
        transaction_fee_percentage: 2.9,
        transaction_fee_fixed: 0.30,
        max_merchants: 500,
        max_transactions_per_month: 100000,
        max_transaction_amount: 50000,
        support_level: 'priority',
        sla_uptime: 99.9,
        sort_order: 2
    },
    {
        tier_name: 'professional',
        display_name: 'Professional',
        setup_fee: 4999,
        monthly_hosting_fee: 999,
        transaction_fee_percentage: 2.5,
        transaction_fee_fixed: 0.25,
        max_merchants: 2500,
        max_transactions_per_month: 500000,
        max_transaction_amount: 250000,
        support_level: 'priority',
        sla_uptime: 99.95,
        sort_order: 3
    },
    {
        tier_name: 'enterprise',
        display_name: 'Enterprise',
        setup_fee: 15000,
        monthly_hosting_fee: 5000,
        transaction_fee_percentage: 0,
        transaction_fee_fixed: 0,
        max_merchants: null,
        max_transactions_per_month: null,
        max_transaction_amount: null,
        support_level: 'dedicated',
        sla_uptime: 99.99,
        sort_order: 4
    }
];

const serviceTypes = [
    { value: 'psp_payment_processing', label: 'PSP Payment Processing', icon: Building2 },
    { value: 'crypto_vasp', label: 'Crypto Banking / VASP', icon: Wallet },
    { value: 'iso_gateway', label: 'ISO Gateway', icon: Code },
    { value: 'orchestration', label: 'Orchestration', icon: GitBranch },
    { value: 'rwa_tokenization', label: 'RWA Tokenization', icon: Package },
    { value: 'tax_management', label: 'Tax Management', icon: FileText },
    { value: 'einvoicing', label: 'E-Invoicing', icon: FileText },
    { value: 'nano_marketplace', label: 'NANO Marketplace', icon: Leaf },
    { value: 'pci_compliance', label: 'PCI Compliance', icon: Shield },
    { value: 'lei_compliance', label: 'LEI Compliance', icon: Shield },
    { value: 'digital_identity', label: 'Digital Identity', icon: Shield }
];

export default function PlatformPricingConfiguration() {
    const { platformUser } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [editingTier, setEditingTier] = useState(null);
    const [selectedService, setSelectedService] = useState('psp_payment_processing');

    const { data: tiers = [], isLoading } = useQuery({
        queryKey: ['platform-pricing'],
        queryFn: () => base44.entities.PlatformPricingConfig.list('sort_order')
    });

    const { data: serviceBillingConfigs = [] } = useQuery({
        queryKey: ['service-billing-configs'],
        queryFn: () => base44.entities.ServiceBillingConfig.list()
    });

    const saveMutation = useMutation({
        mutationFn: async (tier) => {
            if (tier.id) {
                return base44.entities.PlatformPricingConfig.update(tier.id, tier);
            } else {
                return base44.entities.PlatformPricingConfig.create(tier);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-pricing'] });
            setEditingTier(null);
        }
    });

    const resetDefaultsMutation = useMutation({
        mutationFn: async () => {
            // Delete all existing
            for (const tier of tiers) {
                await base44.entities.PlatformPricingConfig.delete(tier.id);
            }
            // Create defaults
            for (const defaultTier of DEFAULT_TIERS) {
                await base44.entities.PlatformPricingConfig.create(defaultTier);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-pricing'] });
        }
    });

    // Filter tiers by selected service
    const filteredTiers = tiers.filter(t => t.service_type === selectedService);
    
    // Get service pricing template
    const serviceTemplate = getServicePricingTemplate(selectedService);
    
    // Use service-specific defaults if available, otherwise fall back to generic PSP defaults
    const getDefaultTiersForService = () => {
        if (!serviceTemplate) return DEFAULT_TIERS.map(t => ({...t, service_type: selectedService}));
        
        return Object.keys(serviceTemplate.tiers).map((tierName, idx) => {
            const tierDefaults = serviceTemplate.tiers[tierName];
            return {
                tier_name: tierName,
                service_type: selectedService,
                display_name: tierName.charAt(0).toUpperCase() + tierName.slice(1),
                ...tierDefaults,
                sort_order: idx + 1
            };
        });
    };
    
    const displayTiers = filteredTiers.length > 0 ? filteredTiers : getDefaultTiersForService();

    // Get service billing config status
    const serviceConfig = serviceBillingConfigs.find(s => s.service_type === selectedService);
    const isPricingComplete = serviceConfig?.platform_tiers_complete || false;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PlatformPricingConfiguration"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                    Platform Pricing Configuration
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Configure tier pricing for all FTS.Money services
                                </p>
                            </div>
                            <Button
                                onClick={() => resetDefaultsMutation.mutate()}
                                variant="outline"
                                disabled={resetDefaultsMutation.isPending}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset to Defaults
                            </Button>
                        </div>
                        
                        {/* Service Selector */}
                        <div className="flex items-center gap-4 mb-6">
                            <Label>Select Service:</Label>
                            <Select value={selectedService} onValueChange={setSelectedService}>
                                <SelectTrigger className="w-64">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {serviceTypes.map(st => {
                                        const Icon = st.icon;
                                        return (
                                            <SelectItem key={st.value} value={st.value}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {st.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {!isPricingComplete && (
                                <Badge className="bg-amber-100 text-amber-700">
                                    Pricing Configuration Needed
                                </Badge>
                            )}
                        </div>
                        
                        {/* Configuration Guidance */}
                        {!isPricingComplete && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">
                                            Configure Tier Pricing for {serviceTypes.find(s => s.value === selectedService)?.label}
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            Click "Edit" on any tier below to set setup fees, monthly hosting costs, and service-specific pricing. 
                                            Save your changes to mark this service as configured.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-4 gap-6">
                        {displayTiers.map((tier) => {
                            const Icon = TIER_ICONS[tier.tier_name] || Building;
                            const isEditing = editingTier?.tier_name === tier.tier_name;
                            const currentTier = isEditing ? editingTier : tier;

                            return (
                                <Card key={tier.tier_name} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <CardTitle className="text-lg">{tier.display_name}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <div>
                                            <Label className="text-xs text-slate-600">Setup Fee (USD)</Label>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={currentTier.setup_fee}
                                                    onChange={(e) => setEditingTier({
                                                        ...currentTier,
                                                        setup_fee: parseFloat(e.target.value)
                                                    })}
                                                    className="mt-1"
                                                />
                                            ) : (
                                                <p className="text-2xl font-bold text-slate-900">
                                                    {tier.tier_name === 'enterprise' && tier.setup_fee >= 10000
                                                        ? 'Custom'
                                                        : `$${tier.setup_fee.toLocaleString()}`
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-xs text-slate-600">Monthly Hosting (USD)</Label>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={currentTier.monthly_hosting_fee}
                                                    onChange={(e) => setEditingTier({
                                                        ...currentTier,
                                                        monthly_hosting_fee: parseFloat(e.target.value)
                                                    })}
                                                    className="mt-1"
                                                />
                                            ) : (
                                                <p className="text-xl font-semibold text-blue-600">
                                                    {tier.tier_name === 'enterprise' && tier.monthly_hosting_fee >= 5000
                                                        ? 'From $5K'
                                                        : `$${tier.monthly_hosting_fee.toLocaleString()}/mo`
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t space-y-2">
                                            <div className="flex items-center text-xs">
                                                <Check className="h-3 w-3 text-emerald-600 mr-2" />
                                                <span className="text-slate-600">
                                                    {tier.max_merchants ? `${tier.max_merchants} merchants` : 'Unlimited merchants'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs">
                                                <Check className="h-3 w-3 text-emerald-600 mr-2" />
                                                <span className="text-slate-600">
                                                    {tier.transaction_fee_percentage}% + ${tier.transaction_fee_fixed}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs">
                                                <Check className="h-3 w-3 text-emerald-600 mr-2" />
                                                <span className="text-slate-600">{tier.sla_uptime}% uptime</span>
                                            </div>
                                            <div className="flex items-center text-xs">
                                                <Check className="h-3 w-3 text-emerald-600 mr-2" />
                                                <span className="text-slate-600 capitalize">{tier.support_level} support</span>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            {isEditing ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => saveMutation.mutate(currentTier)}
                                                        disabled={saveMutation.isPending}
                                                        className="flex-1"
                                                    >
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setEditingTier(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setEditingTier(tier)}
                                                    className="w-full"
                                                >
                                                    Edit Pricing
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Service-Specific Info */}
                    {serviceTemplate && (
                        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-3">
                                            {serviceTemplate.service_name} Pricing Model
                                        </h3>
                                        <div className="text-sm text-blue-800 space-y-2">
                                            <p className="font-medium">
                                                Pricing Model: <span className="text-blue-900">{serviceTemplate.pricing_model.replace(/_/g, ' ').toUpperCase()}</span>
                                            </p>
                                            <div>
                                                <p className="font-medium mb-2">Key Pricing Parameters:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {serviceTemplate.parameters.slice(0, 6).map(param => (
                                                        <div key={param.key} className="flex items-center gap-2 text-xs bg-white/50 px-2 py-1 rounded">
                                                            <Check className="h-3 w-3 text-emerald-600" />
                                                            <span>{param.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="pt-2 text-xs italic">
                                                💡 Pricing templates are based on market research including competitors like {
                                                    selectedService === 'iso_gateway' ? 'SWIFT, IXOPAY' :
                                                    selectedService === 'orchestration' ? 'Spreedly, Primer, Gr4vy' :
                                                    selectedService === 'rwa_tokenization' ? 'Polymath, Securitize, Tokeny' :
                                                    selectedService === 'crypto_vasp' ? 'Striga, Fireblocks' :
                                                    selectedService === 'tax_management' ? 'Avalara, TaxJar' :
                                                    selectedService === 'einvoicing' ? 'Peppol Access Points, Edicom' :
                                                    'industry standards'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}