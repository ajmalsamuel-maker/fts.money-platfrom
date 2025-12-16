import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
    DollarSign, 
    Plus, 
    Edit, 
    Trash2, 
    TrendingUp,
    Calculator,
    Percent,
    Target,
    Gift
} from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantPricingEngine() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('rules');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    // Fetch data
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: pricingRules = [] } = useQuery({
        queryKey: ['merchant-pricing-rules'],
        queryFn: () => base44.entities.MerchantPricingRule.list()
    });

    const { data: campaigns = [] } = useQuery({
        queryKey: ['promotional-campaigns'],
        queryFn: () => base44.entities.PromotionalPricing.list()
    });

    const { data: products = [] } = useQuery({
        queryKey: ['psp-products'],
        queryFn: () => base44.entities.PSPProductTemplate.list()
    });

    // Forms
    const [ruleForm, setRuleForm] = useState({
        psp_id: '',
        rule_name: '',
        description: '',
        pricing_type: 'percentage',
        applies_to: 'all_merchants',
        base_percentage: 2.9,
        base_fixed: 0.30,
        tiers: [],
        volume_discounts: [],
        status: 'draft'
    });

    const [campaignForm, setCampaignForm] = useState({
        psp_id: '',
        campaign_name: '',
        description: '',
        campaign_type: 'percentage_discount',
        discount_percentage: 20,
        applies_to: 'new_merchants',
        start_date: '',
        end_date: '',
        status: 'scheduled'
    });

    const [simulatorForm, setSimulatorForm] = useState({
        rule_id: '',
        transaction_amount: 100,
        transaction_count: 1000,
        monthly_volume: 100000
    });

    // Mutations
    const createRuleMutation = useMutation({
        mutationFn: (data) => {
            const psp = psps.find(p => p.id === data.psp_id);
            return base44.entities.MerchantPricingRule.create({
                ...data,
                rule_id: `RULE-${Date.now()}`,
                psp_code: psp?.psp_code || 'UNKNOWN'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant-pricing-rules']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Pricing rule created');
        }
    });

    const updateRuleMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MerchantPricingRule.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant-pricing-rules']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Pricing rule updated');
        }
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (id) => base44.entities.MerchantPricingRule.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant-pricing-rules']);
            toast.success('Pricing rule deleted');
        }
    });

    const createCampaignMutation = useMutation({
        mutationFn: (data) => {
            const psp = psps.find(p => p.id === data.psp_id);
            return base44.entities.PromotionalPricing.create({
                ...data,
                campaign_id: `PROMO-${Date.now()}`,
                psp_code: psp?.psp_code || 'UNKNOWN'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['promotional-campaigns']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Campaign created');
        }
    });

    const updateCampaignMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PromotionalPricing.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['promotional-campaigns']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Campaign updated');
        }
    });

    const addTier = () => {
        const lastTier = ruleForm.tiers[ruleForm.tiers.length - 1];
        const newMin = lastTier ? lastTier.volume_max : 0;
        setRuleForm({
            ...ruleForm,
            tiers: [...ruleForm.tiers, {
                tier_name: `Tier ${ruleForm.tiers.length + 1}`,
                volume_min: newMin,
                volume_max: newMin + 10000,
                percentage: 2.5,
                fixed: 0.30
            }]
        });
    };

    const addVolumeDiscount = () => {
        setRuleForm({
            ...ruleForm,
            volume_discounts: [...ruleForm.volume_discounts, {
                threshold: 100000,
                discount_percentage: 0.2,
                discount_fixed: 0
            }]
        });
    };

    const calculatePricing = () => {
        const rule = pricingRules.find(r => r.id === simulatorForm.rule_id);
        if (!rule) return null;

        const amount = simulatorForm.transaction_amount;
        let fee = 0;

        if (rule.pricing_type === 'percentage') {
            fee = (amount * (rule.base_percentage / 100)) + rule.base_fixed;
        } else if (rule.pricing_type === 'tiered' && rule.tiers) {
            const tier = rule.tiers.find(t => 
                simulatorForm.monthly_volume >= t.volume_min && 
                simulatorForm.monthly_volume <= t.volume_max
            );
            if (tier) {
                fee = (amount * (tier.percentage / 100)) + tier.fixed;
            }
        }

        // Apply volume discounts
        if (rule.volume_discounts) {
            for (const discount of rule.volume_discounts) {
                if (simulatorForm.monthly_volume >= discount.threshold) {
                    fee -= (amount * (discount.discount_percentage / 100)) + discount.discount_fixed;
                }
            }
        }

        const totalFees = fee * simulatorForm.transaction_count;
        const totalRevenue = totalFees;

        return {
            feePerTransaction: fee,
            totalFees,
            totalRevenue,
            effectiveRate: (fee / amount) * 100
        };
    };

    const simulation = calculatePricing();

    // Stats
    const activeRules = pricingRules.filter(r => r.status === 'active').length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalRevenue = pricingRules.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="MerchantPricingEngine" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Merchant Pricing Engine</h2>
                        <p className="text-xs text-slate-600">Dynamic pricing rules for PSP merchants</p>
                    </div>
                </header>

                <main className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Rules</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{activeRules}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Rules</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{pricingRules.length}</p>
                                    </div>
                                    <Target className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Campaigns</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCampaigns}</p>
                                    </div>
                                    <Gift className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Revenue</p>
                                        <p className="text-3xl font-bold text-indigo-600 mt-1">${totalRevenue.toFixed(2)}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
                            <TabsTrigger value="campaigns">Promotional Campaigns</TabsTrigger>
                            <TabsTrigger value="simulator">Pricing Simulator</TabsTrigger>
                        </TabsList>

                        {/* Pricing Rules */}
                        <TabsContent value="rules" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{pricingRules.length} pricing rules configured</p>
                                <Button onClick={() => { 
                                    setDialogType('rule'); 
                                    setEditingItem(null);
                                    setRuleForm({
                                        psp_id: '',
                                        rule_name: '',
                                        description: '',
                                        pricing_type: 'percentage',
                                        applies_to: 'all_merchants',
                                        base_percentage: 2.9,
                                        base_fixed: 0.30,
                                        tiers: [],
                                        volume_discounts: [],
                                        status: 'draft'
                                    });
                                    setShowDialog(true); 
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Pricing Rule
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {pricingRules.map(rule => {
                                    const psp = psps.find(p => p.id === rule.psp_id);
                                    return (
                                        <Card key={rule.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="font-semibold">{rule.rule_name}</h4>
                                                            <Badge className={
                                                                rule.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                rule.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }>
                                                                {rule.status}
                                                            </Badge>
                                                            <Badge variant="outline">{psp?.psp_name || rule.psp_code}</Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-3">{rule.description}</p>
                                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-slate-600">Pricing Type</p>
                                                                <p className="font-medium capitalize">{rule.pricing_type}</p>
                                                            </div>
                                                            {rule.pricing_type === 'percentage' && (
                                                                <>
                                                                    <div>
                                                                        <p className="text-slate-600">Percentage</p>
                                                                        <p className="font-medium">{rule.base_percentage}%</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-600">Fixed Fee</p>
                                                                        <p className="font-medium">${rule.base_fixed}</p>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {rule.pricing_type === 'tiered' && (
                                                                <div>
                                                                    <p className="text-slate-600">Tiers</p>
                                                                    <p className="font-medium">{rule.tiers?.length || 0} tiers</p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-slate-600">Total Revenue</p>
                                                                <p className="font-medium">${(rule.total_revenue || 0).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingItem(rule);
                                                                setRuleForm(rule);
                                                                setDialogType('rule');
                                                                setShowDialog(true);
                                                            }}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                if (confirm('Delete this pricing rule?')) {
                                                                    deleteRuleMutation.mutate(rule.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                {pricingRules.length === 0 && (
                                    <div className="text-center py-12">
                                        <DollarSign className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 mb-4">No pricing rules configured</p>
                                        <Button onClick={() => { setDialogType('rule'); setShowDialog(true); }}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create First Pricing Rule
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Promotional Campaigns */}
                        <TabsContent value="campaigns" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{campaigns.length} promotional campaigns</p>
                                <Button onClick={() => { 
                                    setDialogType('campaign'); 
                                    setEditingItem(null);
                                    setCampaignForm({
                                        psp_id: '',
                                        campaign_name: '',
                                        description: '',
                                        campaign_type: 'percentage_discount',
                                        discount_percentage: 20,
                                        applies_to: 'new_merchants',
                                        start_date: '',
                                        end_date: '',
                                        status: 'scheduled'
                                    });
                                    setShowDialog(true); 
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Campaign
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {campaigns.map(campaign => {
                                    const psp = psps.find(p => p.id === campaign.psp_id);
                                    return (
                                        <Card key={campaign.id}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">{campaign.campaign_name}</CardTitle>
                                                    <Badge className={
                                                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-slate-600 mb-3">{campaign.description}</p>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">PSP:</span>
                                                        <span className="font-medium">{psp?.psp_name || campaign.psp_code}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Discount:</span>
                                                        <span className="font-medium">{campaign.discount_percentage}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Period:</span>
                                                        <span className="font-medium">
                                                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Uses:</span>
                                                        <span className="font-medium">{campaign.current_uses || 0} / {campaign.max_uses || '∞'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => {
                                                            setEditingItem(campaign);
                                                            setCampaignForm(campaign);
                                                            setDialogType('campaign');
                                                            setShowDialog(true);
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        {/* Pricing Simulator */}
                        <TabsContent value="simulator" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Pricing Simulator
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Select Pricing Rule</Label>
                                                <Select 
                                                    value={simulatorForm.rule_id}
                                                    onValueChange={(v) => setSimulatorForm({...simulatorForm, rule_id: v})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select rule" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {pricingRules.filter(r => r.status === 'active').map(rule => (
                                                            <SelectItem key={rule.id} value={rule.id}>{rule.rule_name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Transaction Amount ($)</Label>
                                                <Input
                                                    type="number"
                                                    value={simulatorForm.transaction_amount}
                                                    onChange={(e) => setSimulatorForm({...simulatorForm, transaction_amount: parseFloat(e.target.value)})}
                                                />
                                            </div>
                                            <div>
                                                <Label>Transaction Count</Label>
                                                <Input
                                                    type="number"
                                                    value={simulatorForm.transaction_count}
                                                    onChange={(e) => setSimulatorForm({...simulatorForm, transaction_count: parseInt(e.target.value)})}
                                                />
                                            </div>
                                            <div>
                                                <Label>Monthly Volume ($)</Label>
                                                <Input
                                                    type="number"
                                                    value={simulatorForm.monthly_volume}
                                                    onChange={(e) => setSimulatorForm({...simulatorForm, monthly_volume: parseFloat(e.target.value)})}
                                                />
                                            </div>
                                        </div>

                                        {simulation && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                                                <h3 className="font-semibold text-slate-900 mb-4">Simulation Results</h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Fee per Transaction:</span>
                                                        <span className="font-bold text-blue-600">${simulation.feePerTransaction.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Effective Rate:</span>
                                                        <span className="font-bold text-blue-600">{simulation.effectiveRate.toFixed(2)}%</span>
                                                    </div>
                                                    <div className="border-t border-blue-200 my-3"></div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Total Fees ({simulatorForm.transaction_count} txns):</span>
                                                        <span className="font-bold text-slate-900">${simulation.totalFees.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Total Revenue:</span>
                                                        <span className="font-bold text-emerald-600">${simulation.totalRevenue.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Pricing Rule Dialog */}
            <Dialog open={showDialog && dialogType === 'rule'} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Create'} Pricing Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>PSP</Label>
                                <Select 
                                    value={ruleForm.psp_id}
                                    onValueChange={(v) => setRuleForm({...ruleForm, psp_id: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select PSP" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {psps.map(psp => (
                                            <SelectItem key={psp.id} value={psp.id}>{psp.psp_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Rule Name</Label>
                                <Input
                                    value={ruleForm.rule_name}
                                    onChange={(e) => setRuleForm({...ruleForm, rule_name: e.target.value})}
                                    placeholder="Standard Card Processing"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={ruleForm.description}
                                onChange={(e) => setRuleForm({...ruleForm, description: e.target.value})}
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Pricing Type</Label>
                                <Select 
                                    value={ruleForm.pricing_type}
                                    onValueChange={(v) => setRuleForm({...ruleForm, pricing_type: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed">Fixed</SelectItem>
                                        <SelectItem value="tiered">Tiered</SelectItem>
                                        <SelectItem value="volume_based">Volume Based</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Applies To</Label>
                                <Select 
                                    value={ruleForm.applies_to}
                                    onValueChange={(v) => setRuleForm({...ruleForm, applies_to: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_merchants">All Merchants</SelectItem>
                                        <SelectItem value="merchant_tier">By Tier</SelectItem>
                                        <SelectItem value="specific_merchants">Specific Merchants</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {ruleForm.pricing_type === 'percentage' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Percentage Rate (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={ruleForm.base_percentage}
                                        onChange={(e) => setRuleForm({...ruleForm, base_percentage: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <Label>Fixed Fee ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={ruleForm.base_fixed}
                                        onChange={(e) => setRuleForm({...ruleForm, base_fixed: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                        )}

                        {ruleForm.pricing_type === 'tiered' && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>Pricing Tiers</Label>
                                    <Button size="sm" variant="outline" onClick={addTier}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Tier
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {ruleForm.tiers?.map((tier, idx) => (
                                        <div key={idx} className="flex gap-2 items-center p-3 bg-slate-50 rounded-lg">
                                            <Input
                                                placeholder="Tier name"
                                                value={tier.tier_name}
                                                onChange={(e) => {
                                                    const newTiers = [...ruleForm.tiers];
                                                    newTiers[idx].tier_name = e.target.value;
                                                    setRuleForm({...ruleForm, tiers: newTiers});
                                                }}
                                                className="flex-1"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Min volume"
                                                value={tier.volume_min}
                                                onChange={(e) => {
                                                    const newTiers = [...ruleForm.tiers];
                                                    newTiers[idx].volume_min = parseFloat(e.target.value);
                                                    setRuleForm({...ruleForm, tiers: newTiers});
                                                }}
                                                className="w-24"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Rate %"
                                                value={tier.percentage}
                                                onChange={(e) => {
                                                    const newTiers = [...ruleForm.tiers];
                                                    newTiers[idx].percentage = parseFloat(e.target.value);
                                                    setRuleForm({...ruleForm, tiers: newTiers});
                                                }}
                                                className="w-20"
                                            />
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    const newTiers = ruleForm.tiers.filter((_, i) => i !== idx);
                                                    setRuleForm({...ruleForm, tiers: newTiers});
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Volume Discounts (Optional)</Label>
                                <Button size="sm" variant="outline" onClick={addVolumeDiscount}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Discount
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {ruleForm.volume_discounts?.map((discount, idx) => (
                                    <div key={idx} className="flex gap-2 items-center p-3 bg-emerald-50 rounded-lg">
                                        <Input
                                            type="number"
                                            placeholder="Threshold"
                                            value={discount.threshold}
                                            onChange={(e) => {
                                                const newDiscounts = [...ruleForm.volume_discounts];
                                                newDiscounts[idx].threshold = parseFloat(e.target.value);
                                                setRuleForm({...ruleForm, volume_discounts: newDiscounts});
                                            }}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Discount %"
                                            value={discount.discount_percentage}
                                            onChange={(e) => {
                                                const newDiscounts = [...ruleForm.volume_discounts];
                                                newDiscounts[idx].discount_percentage = parseFloat(e.target.value);
                                                setRuleForm({...ruleForm, volume_discounts: newDiscounts});
                                            }}
                                            className="w-24"
                                        />
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                                const newDiscounts = ruleForm.volume_discounts.filter((_, i) => i !== idx);
                                                setRuleForm({...ruleForm, volume_discounts: newDiscounts});
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Select 
                                value={ruleForm.status}
                                onValueChange={(v) => setRuleForm({...ruleForm, status: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                                if (editingItem) {
                                    updateRuleMutation.mutate({ id: editingItem.id, data: ruleForm });
                                } else {
                                    createRuleMutation.mutate(ruleForm);
                                }
                            }}>
                                {editingItem ? 'Update' : 'Create'} Rule
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Campaign Dialog */}
            <Dialog open={showDialog && dialogType === 'campaign'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Create'} Promotional Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>PSP</Label>
                            <Select 
                                value={campaignForm.psp_id}
                                onValueChange={(v) => setCampaignForm({...campaignForm, psp_id: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PSP" />
                                </SelectTrigger>
                                <SelectContent>
                                    {psps.map(psp => (
                                        <SelectItem key={psp.id} value={psp.id}>{psp.psp_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Campaign Name</Label>
                            <Input
                                value={campaignForm.campaign_name}
                                onChange={(e) => setCampaignForm({...campaignForm, campaign_name: e.target.value})}
                                placeholder="Q1 2025 Launch Promo"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={campaignForm.description}
                                onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Campaign Type</Label>
                                <Select 
                                    value={campaignForm.campaign_type}
                                    onValueChange={(v) => setCampaignForm({...campaignForm, campaign_type: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage_discount">Percentage Discount</SelectItem>
                                        <SelectItem value="fixed_discount">Fixed Discount</SelectItem>
                                        <SelectItem value="free_trial">Free Trial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Discount (%)</Label>
                                <Input
                                    type="number"
                                    value={campaignForm.discount_percentage}
                                    onChange={(e) => setCampaignForm({...campaignForm, discount_percentage: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={campaignForm.start_date}
                                    onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={campaignForm.end_date}
                                    onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Applies To</Label>
                            <Select 
                                value={campaignForm.applies_to}
                                onValueChange={(v) => setCampaignForm({...campaignForm, applies_to: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_merchants">All Merchants</SelectItem>
                                    <SelectItem value="new_merchants">New Merchants Only</SelectItem>
                                    <SelectItem value="specific_merchants">Specific Merchants</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                                if (editingItem) {
                                    updateCampaignMutation.mutate({ id: editingItem.id, data: campaignForm });
                                } else {
                                    createCampaignMutation.mutate(campaignForm);
                                }
                            }}>
                                {editingItem ? 'Update' : 'Create'} Campaign
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}