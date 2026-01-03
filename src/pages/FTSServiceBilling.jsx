import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Code, GitBranch, FileText, TrendingUp } from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSServiceBilling() {
    const { t } = useI18n();
    const [selectedService, setSelectedService] = useState(null);
    const [showPricingDialog, setShowPricingDialog] = useState(false);

    const queryClient = useQueryClient();

    const { data: isoCustomers = [] } = useQuery({
        queryKey: ['iso-gateway-customers'],
        queryFn: async () => await base44.entities.ISOGatewayCustomer.list() || []
    });

    const { data: orchCustomers = [] } = useQuery({
        queryKey: ['orchestration-customers'],
        queryFn: async () => await base44.entities.OrchestrationCustomer.list() || []
    });

    const { data: pricingConfig = [] } = useQuery({
        queryKey: ['service-pricing-config'],
        queryFn: async () => await base44.entities.ServicePricingConfig.filter({ status: 'active' }) || []
    });

    // Calculate totals
    const isoRevenue = isoCustomers.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
    const orchRevenue = orchCustomers.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
    const totalRevenue = isoRevenue + orchRevenue;

    // Convert pricing config to structured format with defaults
    const tierPricing = {
        iso_gateway: {
            developer: { 
                monthly: 499, 
                perUnit: 0.001, 
                limit: 50000,
                features: ['iso8583_translation', 'iso20022_translation'],
                enrichment_fees: {}
            },
            business: { 
                monthly: 1999, 
                perUnit: 0.0008, 
                limit: 500000,
                features: ['iso8583_translation', 'iso20022_translation', 'mt_translation', 'lei_enrichment', 'structured_remittance'],
                enrichment_fees: { lei: 0.0001, structured_remittance: 0.00005 }
            },
            enterprise: { 
                monthly: 4999, 
                perUnit: 0.0005, 
                limit: 999999999,
                features: ['iso8583_translation', 'iso20022_translation', 'mt_translation', 'lei_enrichment', 'structured_remittance', 'purpose_codes', 'end_to_end_refs', 'ultimate_party_id'],
                enrichment_fees: { lei: 0.0001, structured_remittance: 0.00005, purpose_codes: 0.00002, mt: 0.0003 }
            }
        },
        orchestration: {
            starter: { monthly: 199, perUnit: 0.002, limit: 50000 },
            professional: { monthly: 999, perUnit: 0.0015, limit: 500000 },
            enterprise: { monthly: 2999, perUnit: 0.001, limit: 999999999 }
        }
    };

    // Override with config from database if exists (preserve features)
    pricingConfig.forEach(config => {
        if (!tierPricing[config.service_type]) tierPricing[config.service_type] = {};
        const existingTier = tierPricing[config.service_type][config.tier_name] || {};
        tierPricing[config.service_type][config.tier_name] = {
            ...existingTier,
            monthly: config.monthly_fee,
            perUnit: config.overage_rate,
            limit: config.included_units,
            features: config.features_included || existingTier.features || [],
            enrichment_fees: config.enrichment_fees || existingTier.enrichment_fees || {}
        };
    });

    const generateInvoice = async (customer, service) => {
        const isISO = service === 'iso_gateway';
        const tier = customer.subscription_tier;
        const usage = customer.current_month_usage || 0;
        const pricing = isISO ? tierPricing.iso_gateway[tier] : tierPricing.orchestration[tier];
        
        const baseCharge = pricing.monthly;
        const overageCharge = usage > pricing.limit 
            ? (usage - pricing.limit) * pricing.perUnit
            : 0;
        const totalCharge = baseCharge + overageCharge;

        alert(`Invoice Generated:\n\nService: ${isISO ? 'ISO Gateway' : 'Orchestration'}\nCustomer: ${customer.company_name}\nTier: ${tier}\nBase: $${baseCharge}\nOverage: $${overageCharge.toFixed(2)}\nTotal: $${totalCharge.toFixed(2)}`);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <FTSPlatformSidebar currentPage="FTSServiceBilling" />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Service Billing & Revenue</h1>
                        <p className="text-gray-600 mt-1">Manage billing for ISO Gateway and Orchestration services</p>
                    </div>

                    {/* Revenue Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-slate-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">
                                            ${totalRevenue.toLocaleString()}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-slate-600">ISO Gateway</p>
                                        <p className="text-2xl font-bold text-indigo-600 mt-1">
                                            ${isoRevenue.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-500">{isoCustomers.length} customers</p>
                                    </div>
                                    <Code className="h-8 w-8 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-slate-600">Orchestration</p>
                                        <p className="text-2xl font-bold text-purple-600 mt-1">
                                            ${orchRevenue.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-500">{orchCustomers.length} customers</p>
                                    </div>
                                    <GitBranch className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-slate-600">MRR Growth</p>
                                        <p className="text-2xl font-bold text-emerald-600 mt-1">+23.5%</p>
                                        <p className="text-xs text-slate-500">Month over month</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="iso" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="iso">ISO Gateway Billing</TabsTrigger>
                            <TabsTrigger value="orchestration">Orchestration Billing</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
                            <TabsTrigger value="config">Configure Pricing</TabsTrigger>
                        </TabsList>

                        {/* ISO Gateway Billing */}
                        <TabsContent value="iso">
                            <Card>
                                <CardHeader>
                                    <CardTitle>ISO Gateway Customers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {isoCustomers.map(customer => {
                                            const tier = tierPricing.iso_gateway?.[customer.subscription_tier] || tierPricing.iso_gateway?.developer;
                                            if (!tier) return null;
                                            const usage = customer.current_month_usage || 0;
                                            const baseCharge = tier.monthly;
                                            const overageCharge = usage > tier.limit 
                                                ? (usage - tier.limit) * tier.perUnit 
                                                : 0;
                                            const totalCharge = baseCharge + overageCharge;

                                            return (
                                                <div key={customer.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{customer.company_name}</p>
                                                            <p className="text-sm text-slate-600">{customer.contact_email}</p>
                                                        </div>
                                                        <Badge className="bg-indigo-100 text-indigo-700">
                                                            {customer.subscription_tier}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-5 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-slate-600">Usage</p>
                                                            <p className="font-semibold">{usage.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Base Fee</p>
                                                            <p className="font-semibold">${baseCharge}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Overage</p>
                                                            <p className="font-semibold">${overageCharge.toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Total</p>
                                                            <p className="font-semibold text-emerald-600">${totalCharge.toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => generateInvoice(customer, 'iso_gateway')}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Invoice
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Orchestration Billing */}
                        <TabsContent value="orchestration">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Orchestration Customers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {orchCustomers.map(customer => {
                                            const tier = tierPricing.orchestration?.[customer.subscription_tier] || tierPricing.orchestration?.starter;
                                            if (!tier) return null;
                                            const usage = customer.current_month_usage || 0;
                                            const baseCharge = tier.monthly;
                                            const overageCharge = usage > tier.limit 
                                                ? (usage - tier.limit) * tier.perUnit 
                                                : 0;
                                            const totalCharge = baseCharge + overageCharge;

                                            return (
                                                <div key={customer.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{customer.company_name}</p>
                                                            <p className="text-sm text-slate-600">{customer.contact_email}</p>
                                                        </div>
                                                        <Badge className="bg-purple-100 text-purple-700">
                                                            {customer.subscription_tier}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-5 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-slate-600">Executions</p>
                                                            <p className="font-semibold">{usage.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Base Fee</p>
                                                            <p className="font-semibold">${baseCharge}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Overage</p>
                                                            <p className="font-semibold">${overageCharge.toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Total</p>
                                                            <p className="font-semibold text-emerald-600">${totalCharge.toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => generateInvoice(customer, 'orchestration')}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Invoice
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pricing Tiers */}
                        <TabsContent value="pricing">
                            <div className="grid grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Code className="h-5 w-5 text-indigo-600" />
                                            ISO Gateway Pricing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {Object.entries(tierPricing.iso_gateway).map(([tier, price]) => (
                                            <div key={tier} className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-semibold capitalize">{tier}</p>
                                                    <Badge className="bg-indigo-100 text-indigo-700">
                                                        ${price.monthly}/mo
                                                    </Badge>
                                                </div>
                                                <div className="text-sm space-y-1 text-slate-600">
                                                    <p>• {price.limit.toLocaleString()} messages/month</p>
                                                    <p>• ${price.perUnit} per message overage</p>
                                                    {price.features && (
                                                        <div className="mt-2 pt-2 border-t">
                                                            <p className="font-medium text-slate-700 mb-1">Included Features:</p>
                                                            {price.features.includes('mt_translation') && <p>✓ SWIFT MT Translation</p>}
                                                            {price.features.includes('lei_enrichment') && <p>✓ LEI Enrichment</p>}
                                                            {price.features.includes('structured_remittance') && <p>✓ Structured Remittance</p>}
                                                            {price.features.includes('purpose_codes') && <p>✓ Purpose Codes</p>}
                                                            {price.features.includes('end_to_end_refs') && <p>✓ End-to-End Tracking</p>}
                                                        </div>
                                                    )}
                                                    {price.enrichment_fees && Object.keys(price.enrichment_fees).length > 0 && (
                                                        <div className="mt-2 pt-2 border-t">
                                                            <p className="font-medium text-slate-700 mb-1">Enrichment Fees:</p>
                                                            {price.enrichment_fees.lei && <p>• LEI: +${price.enrichment_fees.lei}/msg</p>}
                                                            {price.enrichment_fees.structured_remittance && <p>• Structured Remittance: +${price.enrichment_fees.structured_remittance}/msg</p>}
                                                            {price.enrichment_fees.mt && <p>• MT Translation: +${price.enrichment_fees.mt}/msg</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GitBranch className="h-5 w-5 text-purple-600" />
                                            Orchestration Pricing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {Object.entries(tierPricing.orchestration).map(([tier, price]) => (
                                            <div key={tier} className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-semibold capitalize">{tier}</p>
                                                    <Badge className="bg-purple-100 text-purple-700">
                                                        ${price.monthly}/mo
                                                    </Badge>
                                                </div>
                                                <div className="text-sm space-y-1 text-slate-600">
                                                    <p>• {price.limit.toLocaleString()} executions/month</p>
                                                    <p>• ${price.perUnit} per execution overage</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Configure Pricing */}
                        <TabsContent value="config">
                            <div className="grid grid-cols-2 gap-6">
                                <PricingConfigCard 
                                    serviceType="iso_gateway" 
                                    serviceName="ISO Gateway"
                                    pricingConfig={pricingConfig.filter(p => p.service_type === 'iso_gateway')}
                                    queryClient={queryClient}
                                />
                                <PricingConfigCard 
                                    serviceType="orchestration" 
                                    serviceName="Orchestration"
                                    pricingConfig={pricingConfig.filter(p => p.service_type === 'orchestration')}
                                    queryClient={queryClient}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function PricingConfigCard({ serviceType, serviceName, pricingConfig, queryClient }) {
    const [editMode, setEditMode] = useState(false);
    const [editingTier, setEditingTier] = useState(null);

    const createOrUpdateMutation = useMutation({
        mutationFn: async (data) => {
            if (data.id) {
                return await base44.entities.ServicePricingConfig.update(data.id, data);
            } else {
                return await base44.entities.ServicePricingConfig.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['service-pricing-config']);
            setEditMode(false);
            setEditingTier(null);
        }
    });

    const defaultTiers = serviceType === 'iso_gateway' 
        ? [
            { tier_name: 'developer', monthly_fee: 499, included_units: 50000, overage_rate: 0.001 },
            { tier_name: 'business', monthly_fee: 1999, included_units: 500000, overage_rate: 0.0008 },
            { tier_name: 'enterprise', monthly_fee: 4999, included_units: 999999999, overage_rate: 0.0005 }
        ]
        : [
            { tier_name: 'starter', monthly_fee: 199, included_units: 50000, overage_rate: 0.002 },
            { tier_name: 'professional', monthly_fee: 999, included_units: 500000, overage_rate: 0.0015 },
            { tier_name: 'enterprise', monthly_fee: 2999, included_units: 999999999, overage_rate: 0.001 }
        ];

    const initializeDefaults = async () => {
        for (const tier of defaultTiers) {
            await base44.entities.ServicePricingConfig.create({
                service_type: serviceType,
                ...tier,
                status: 'active'
            });
        }
        queryClient.invalidateQueries(['service-pricing-config']);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{serviceName} Pricing</CardTitle>
                    {pricingConfig.length === 0 && (
                        <Button size="sm" onClick={initializeDefaults} className="bg-blue-600 hover:bg-blue-700">
                            Initialize Defaults
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {pricingConfig.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                        <p>No pricing configured. Click "Initialize Defaults" to set up standard pricing tiers.</p>
                    </div>
                ) : (
                    pricingConfig.map(config => (
                        <div key={config.id} className="p-4 border rounded-lg">
                            {editMode && editingTier?.id === config.id ? (
                                <div className="space-y-3">
                                    <Input
                                        type="number"
                                        placeholder="Monthly Fee"
                                        value={editingTier.monthly_fee}
                                        onChange={(e) => setEditingTier({...editingTier, monthly_fee: parseFloat(e.target.value)})}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Included Units"
                                        value={editingTier.included_units}
                                        onChange={(e) => setEditingTier({...editingTier, included_units: parseInt(e.target.value)})}
                                    />
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        placeholder="Overage Rate"
                                        value={editingTier.overage_rate}
                                        onChange={(e) => setEditingTier({...editingTier, overage_rate: parseFloat(e.target.value)})}
                                    />
                                    {serviceType === 'iso_gateway' && (
                                        <>
                                            <div className="pt-2 border-t">
                                                <label className="text-xs font-medium text-slate-700">Enrichment Fees (per message)</label>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="LEI"
                                                        value={editingTier.enrichment_fees?.lei_enrichment || ''}
                                                        onChange={(e) => setEditingTier({
                                                            ...editingTier, 
                                                            enrichment_fees: {...(editingTier.enrichment_fees || {}), lei_enrichment: parseFloat(e.target.value) || 0}
                                                        })}
                                                    />
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="Structured Remittance"
                                                        value={editingTier.enrichment_fees?.structured_remittance || ''}
                                                        onChange={(e) => setEditingTier({
                                                            ...editingTier, 
                                                            enrichment_fees: {...(editingTier.enrichment_fees || {}), structured_remittance: parseFloat(e.target.value) || 0}
                                                        })}
                                                    />
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="Purpose Codes"
                                                        value={editingTier.enrichment_fees?.purpose_codes || ''}
                                                        onChange={(e) => setEditingTier({
                                                            ...editingTier, 
                                                            enrichment_fees: {...(editingTier.enrichment_fees || {}), purpose_codes: parseFloat(e.target.value) || 0}
                                                        })}
                                                    />
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="MT Translation"
                                                        value={editingTier.enrichment_fees?.mt_translation || ''}
                                                        onChange={(e) => setEditingTier({
                                                            ...editingTier, 
                                                            enrichment_fees: {...(editingTier.enrichment_fees || {}), mt_translation: parseFloat(e.target.value) || 0}
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            onClick={() => createOrUpdateMutation.mutate(editingTier)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Save
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                                setEditMode(false);
                                                setEditingTier(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold capitalize">{config.tier_name}</p>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => {
                                                setEditMode(true);
                                                setEditingTier({...config});
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                    <div className="text-sm space-y-1 text-slate-600">
                                        <p>• Monthly Fee: ${config.monthly_fee}</p>
                                        <p>• Included: {config.included_units.toLocaleString()} units</p>
                                        <p>• Overage: ${config.overage_rate} per unit</p>
                                        {serviceType === 'iso_gateway' && config.enrichment_fees && Object.keys(config.enrichment_fees).length > 0 && (
                                            <div className="mt-2 pt-2 border-t">
                                                <p className="font-medium text-slate-700">Enrichment Fees:</p>
                                                {config.enrichment_fees.lei_enrichment > 0 && <p>• LEI: +${config.enrichment_fees.lei_enrichment}/msg</p>}
                                                {config.enrichment_fees.structured_remittance > 0 && <p>• Structured Remittance: +${config.enrichment_fees.structured_remittance}/msg</p>}
                                                {config.enrichment_fees.purpose_codes > 0 && <p>• Purpose Codes: +${config.enrichment_fees.purpose_codes}/msg</p>}
                                                {config.enrichment_fees.mt_translation > 0 && <p>• MT Translation: +${config.enrichment_fees.mt_translation}/msg</p>}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}