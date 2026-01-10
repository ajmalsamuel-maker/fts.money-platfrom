import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Code, GitBranch, Wallet, Briefcase } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { toast } from 'sonner';

export default function ServicePricingConfiguration() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();

    const { data: pricingConfig = [] } = useQuery({
        queryKey: ['service-pricing-config'],
        queryFn: async () => await base44.entities.ServicePricingConfig.filter({ status: 'active' }) || []
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ServicePricingConfiguration"
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Service Pricing Configuration</h2>
                        <p className="text-xs text-slate-600">Configure pricing tiers for all FTS services</p>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    <Tabs defaultValue="iso" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="iso">ISO Gateway</TabsTrigger>
                            <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
                            <TabsTrigger value="crypto">Crypto VASP</TabsTrigger>
                            <TabsTrigger value="rwa">RWA Tokenization</TabsTrigger>
                        </TabsList>

                        <TabsContent value="iso">
                            <PricingConfigCard 
                                serviceType="iso_gateway" 
                                serviceName="ISO Gateway"
                                icon={Code}
                                iconColor="text-indigo-600"
                                pricingConfig={pricingConfig.filter(p => p.service_type === 'iso_gateway')}
                                queryClient={queryClient}
                                showEnrichmentFees={true}
                            />
                        </TabsContent>

                        <TabsContent value="orchestration">
                            <PricingConfigCard 
                                serviceType="orchestration" 
                                serviceName="Payment Orchestration"
                                icon={GitBranch}
                                iconColor="text-purple-600"
                                pricingConfig={pricingConfig.filter(p => p.service_type === 'orchestration')}
                                queryClient={queryClient}
                            />
                        </TabsContent>

                        <TabsContent value="crypto">
                            <PricingConfigCard 
                                serviceType="crypto_vasp" 
                                serviceName="Crypto VASP"
                                icon={Wallet}
                                iconColor="text-orange-600"
                                pricingConfig={pricingConfig.filter(p => p.service_type === 'crypto_vasp')}
                                queryClient={queryClient}
                            />
                        </TabsContent>

                        <TabsContent value="rwa">
                            <PricingConfigCard 
                                serviceType="rwa_tokenization" 
                                serviceName="RWA Tokenization"
                                icon={Briefcase}
                                iconColor="text-emerald-600"
                                pricingConfig={pricingConfig.filter(p => p.service_type === 'rwa_tokenization')}
                                queryClient={queryClient}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function PricingConfigCard({ serviceType, serviceName, icon: Icon, iconColor, pricingConfig, queryClient, showEnrichmentFees = false }) {
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
            toast.success('Pricing updated successfully');
        }
    });

    const defaultTiers = {
        iso_gateway: [
            { tier_name: 'developer', monthly_fee: 499, included_units: 50000, overage_rate: 0.001 },
            { tier_name: 'business', monthly_fee: 1999, included_units: 500000, overage_rate: 0.0008 },
            { tier_name: 'enterprise', monthly_fee: 4999, included_units: 999999999, overage_rate: 0.0005 }
        ],
        orchestration: [
            { tier_name: 'starter', monthly_fee: 199, included_units: 50000, overage_rate: 0.002 },
            { tier_name: 'professional', monthly_fee: 999, included_units: 500000, overage_rate: 0.0015 },
            { tier_name: 'enterprise', monthly_fee: 2999, included_units: 999999999, overage_rate: 0.001 }
        ],
        crypto_vasp: [
            { tier_name: 'starter', monthly_fee: 999, included_units: 1000, overage_rate: 0.5 },
            { tier_name: 'business', monthly_fee: 4999, included_units: 10000, overage_rate: 0.3 },
            { tier_name: 'enterprise', monthly_fee: 14999, included_units: 999999999, overage_rate: 0.2 }
        ],
        rwa_tokenization: [
            { tier_name: 'starter', monthly_fee: 1999, included_units: 10, overage_rate: 100 },
            { tier_name: 'professional', monthly_fee: 9999, included_units: 100, overage_rate: 75 },
            { tier_name: 'enterprise', monthly_fee: 29999, included_units: 999999, overage_rate: 50 }
        ]
    };

    const initializeDefaults = async () => {
        for (const tier of defaultTiers[serviceType]) {
            await base44.entities.ServicePricingConfig.create({
                service_type: serviceType,
                ...tier,
                status: 'active'
            });
        }
        queryClient.invalidateQueries(['service-pricing-config']);
        toast.success('Default pricing initialized');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                        {serviceName} Pricing Tiers
                    </CardTitle>
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
                        <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                        <p>No pricing configured for {serviceName}</p>
                        <p className="text-sm text-slate-500 mt-1">Click "Initialize Defaults" to set up standard pricing tiers</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {pricingConfig.map(config => (
                            <div key={config.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                {editMode && editingTier?.id === config.id ? (
                                    <div className="space-y-3">
                                        <div>
                                            <Label>Monthly Fee</Label>
                                            <Input
                                                type="number"
                                                value={editingTier.monthly_fee}
                                                onChange={(e) => setEditingTier({...editingTier, monthly_fee: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Included Units</Label>
                                            <Input
                                                type="number"
                                                value={editingTier.included_units}
                                                onChange={(e) => setEditingTier({...editingTier, included_units: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Overage Rate</Label>
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                value={editingTier.overage_rate}
                                                onChange={(e) => setEditingTier({...editingTier, overage_rate: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        {showEnrichmentFees && (
                                            <div className="pt-2 border-t">
                                                <Label className="text-xs">Enrichment Fees</Label>
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
                                                        placeholder="MT Translation"
                                                        value={editingTier.enrichment_fees?.mt_translation || ''}
                                                        onChange={(e) => setEditingTier({
                                                            ...editingTier, 
                                                            enrichment_fees: {...(editingTier.enrichment_fees || {}), mt_translation: parseFloat(e.target.value) || 0}
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                onClick={() => createOrUpdateMutation.mutate(editingTier)}
                                                className="flex-1"
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
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge className="capitalize">{config.tier_name}</Badge>
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
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-600">Monthly:</span>
                                                <span className="font-bold text-lg">${config.monthly_fee}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Included:</span>
                                                <span>{config.included_units.toLocaleString()} units</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Overage:</span>
                                                <span>${config.overage_rate}/unit</span>
                                            </div>
                                            {showEnrichmentFees && config.enrichment_fees && Object.keys(config.enrichment_fees).length > 0 && (
                                                <div className="mt-2 pt-2 border-t text-xs">
                                                    <p className="font-medium text-slate-700 mb-1">Add-ons:</p>
                                                    {config.enrichment_fees.lei_enrichment > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">LEI:</span>
                                                            <span>+${config.enrichment_fees.lei_enrichment}/msg</span>
                                                        </div>
                                                    )}
                                                    {config.enrichment_fees.mt_translation > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">MT:</span>
                                                            <span>+${config.enrichment_fees.mt_translation}/msg</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}