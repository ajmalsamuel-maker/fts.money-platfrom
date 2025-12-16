import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, 
    Trash2, 
    Play, 
    TrendingUp,
    Copy,
    TestTube,
    Sparkles,
    Target,
    BarChart3,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function PricingEnhancedManager() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('templates');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [simulationResults, setSimulationResults] = useState(null);
    const [optimizationResults, setOptimizationResults] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch data
    const { data: templates = [] } = useQuery({
        queryKey: ['pricing-templates'],
        queryFn: () => base44.entities.PricingTemplate.list()
    });

    const { data: abTests = [] } = useQuery({
        queryKey: ['pricing-ab-tests'],
        queryFn: () => base44.entities.PricingABTest.list()
    });

    const { data: campaigns = [] } = useQuery({
        queryKey: ['pricing-campaigns'],
        queryFn: () => base44.entities.PricingCampaign.list()
    });

    const { data: masterPricing = [] } = useQuery({
        queryKey: ['master-pricing'],
        queryFn: () => base44.entities.MasterPricing.list()
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    // Template form
    const [templateForm, setTemplateForm] = useState({
        template_name: '',
        description: '',
        target_segment: 'startup',
        pricing_items: []
    });

    // A/B Test form
    const [abTestForm, setAbTestForm] = useState({
        test_name: '',
        description: '',
        target_segment: 'all_new_psps',
        pricing_items: []
    });

    // Campaign form
    const [campaignForm, setCampaignForm] = useState({
        campaign_name: '',
        description: '',
        campaign_type: 'discount',
        discount_type: 'percentage',
        discount_value: 0,
        start_date: '',
        end_date: ''
    });

    // Mutations
    const createTemplateMutation = useMutation({
        mutationFn: (data) => base44.entities.PricingTemplate.create({
            ...data,
            template_id: `TPL-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['pricing-templates']);
            setShowDialog(false);
            toast.success('Template created');
        }
    });

    const createABTestMutation = useMutation({
        mutationFn: (data) => base44.entities.PricingABTest.create({
            ...data,
            test_id: `ABT-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['pricing-ab-tests']);
            setShowDialog(false);
            toast.success('A/B Test created');
        }
    });

    const createCampaignMutation = useMutation({
        mutationFn: (data) => base44.entities.PricingCampaign.create({
            ...data,
            campaign_id: `CMP-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['pricing-campaigns']);
            setShowDialog(false);
            toast.success('Campaign created');
        }
    });

    // Simulation
    const handleSimulation = async (pricingId) => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('pricingSimulator', {
                pricing_id: pricingId,
                scenario: {
                    monthly_volumes: [10000, 50000, 100000, 500000, 1000000],
                    avg_transaction_size: 100,
                    psp_count: 10
                }
            });
            setSimulationResults(response.data.results);
            setDialogType('simulation');
            setShowDialog(true);
        } catch (error) {
            toast.error('Simulation failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Optimization
    const handleOptimization = async (pricingId) => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('pricingOptimizer', {
                action: 'analyze',
                pricing_id: pricingId,
                market_data: {
                    average_rate: 2.9
                }
            });
            setOptimizationResults(response.data);
            setDialogType('optimization');
            setShowDialog(true);
        } catch (error) {
            toast.error('Optimization failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Enhanced Pricing Management</h3>
                    <p className="text-sm text-slate-600">Templates, A/B Tests, Campaigns & Optimization</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="simulation">Simulation</TabsTrigger>
                    <TabsTrigger value="optimization">Optimization</TabsTrigger>
                </TabsList>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">{templates.length} pricing templates</p>
                        <Button onClick={() => { setDialogType('template'); setShowDialog(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Template
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {templates.map(template => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{template.template_name}</CardTitle>
                                        <Badge className="capitalize">{template.target_segment}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Used by:</span>
                                        <Badge variant="outline">{template.usage_count || 0} PSPs</Badge>
                                    </div>
                                    {template.is_default && (
                                        <Badge className="mt-2 bg-blue-100 text-blue-700">Default</Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-3 text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                                <p className="text-slate-600">No templates yet. Create your first pricing template!</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* A/B Tests Tab */}
                <TabsContent value="ab-tests" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">{abTests.length} active tests</p>
                        <Button onClick={() => { setDialogType('abtest'); setShowDialog(true); }}>
                            <TestTube className="h-4 w-4 mr-2" />
                            New A/B Test
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {abTests.map(test => (
                            <Card key={test.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold">{test.test_name}</h4>
                                                <Badge className={
                                                    test.status === 'running' ? 'bg-green-100 text-green-700' :
                                                    test.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }>
                                                    {test.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">{test.description}</p>
                                            <div className="flex gap-4 mt-2 text-sm">
                                                <span>Target: {test.target_segment}</span>
                                                <span>Metric: {test.success_metric}</span>
                                            </div>
                                        </div>
                                        {test.results && (
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">Winner:</p>
                                                <Badge className="bg-emerald-100 text-emerald-700">
                                                    {test.results.winner || 'TBD'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {abTests.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                                <p className="text-slate-600">No A/B tests running. Start testing pricing strategies!</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Campaigns Tab */}
                <TabsContent value="campaigns" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">{campaigns.length} campaigns</p>
                        <Button onClick={() => { setDialogType('campaign'); setShowDialog(true); }}>
                            <Target className="h-4 w-4 mr-2" />
                            New Campaign
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {campaigns.map(campaign => (
                            <Card key={campaign.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold">{campaign.campaign_name}</h4>
                                                <Badge className={
                                                    campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }>
                                                    {campaign.status}
                                                </Badge>
                                                <Badge variant="outline" className="capitalize">
                                                    {campaign.campaign_type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{campaign.description}</p>
                                            <div className="flex gap-4 text-sm">
                                                <span>Discount: {campaign.discount_value}%</span>
                                                <span>Target: {campaign.target_segment}</span>
                                                <span>{campaign.start_date} to {campaign.end_date}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600">Usage:</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {campaign.usage_count || 0}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {campaigns.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                                <p className="text-slate-600">No campaigns yet. Create promotional pricing campaigns!</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Simulation Tab */}
                <TabsContent value="simulation" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Simulator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">
                                Simulate pricing scenarios across different volume levels to forecast revenue and margins.
                            </p>
                            <div className="space-y-3">
                                {masterPricing.slice(0, 5).map(pricing => (
                                    <div key={pricing.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{pricing.item_name}</p>
                                            <p className="text-sm text-slate-600">
                                                Sell: {pricing.sell_rate_percentage}% | Margin: {pricing.margin_percentage}%
                                            </p>
                                        </div>
                                        <Button 
                                            onClick={() => handleSimulation(pricing.id)}
                                            disabled={loading}
                                            size="sm"
                                            className="gap-2"
                                        >
                                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                            Simulate
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Optimization Tab */}
                <TabsContent value="optimization" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Optimizer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">
                                AI-powered pricing analysis with market benchmarks and optimization recommendations.
                            </p>
                            <div className="space-y-3">
                                {masterPricing.slice(0, 5).map(pricing => (
                                    <div key={pricing.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{pricing.item_name}</p>
                                            <div className="flex gap-3 mt-1">
                                                <p className="text-sm text-slate-600">
                                                    Optimization Score: {pricing.optimization_score || 'N/A'}
                                                </p>
                                                {pricing.market_benchmark && (
                                                    <Badge variant="outline" className="capitalize text-xs">
                                                        {pricing.market_benchmark.competitive_position}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => handleOptimization(pricing.id)}
                                            disabled={loading}
                                            size="sm"
                                            className="gap-2"
                                        >
                                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                            Optimize
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Template Dialog */}
            <Dialog open={showDialog && dialogType === 'template'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Pricing Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Template Name</Label>
                            <Input
                                value={templateForm.template_name}
                                onChange={(e) => setTemplateForm({...templateForm, template_name: e.target.value})}
                                placeholder="e.g., Startup Bundle"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={templateForm.description}
                                onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                                placeholder="Template description..."
                            />
                        </div>
                        <div>
                            <Label>Target Segment</Label>
                            <Select value={templateForm.target_segment} onValueChange={(v) => setTemplateForm({...templateForm, target_segment: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="startup">Startup</SelectItem>
                                    <SelectItem value="smb">SMB</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                    <SelectItem value="high_risk">High Risk</SelectItem>
                                    <SelectItem value="low_risk">Low Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => createTemplateMutation.mutate(templateForm)}>Create</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create A/B Test Dialog */}
            <Dialog open={showDialog && dialogType === 'abtest'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create A/B Test</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Test Name</Label>
                            <Input
                                value={abTestForm.test_name}
                                onChange={(e) => setAbTestForm({...abTestForm, test_name: e.target.value})}
                                placeholder="e.g., Pricing Strategy A vs B"
                            />
                        </div>
                        <div>
                            <Label>Hypothesis</Label>
                            <Textarea
                                value={abTestForm.description}
                                onChange={(e) => setAbTestForm({...abTestForm, description: e.target.value})}
                                placeholder="What are you testing?"
                            />
                        </div>
                        <div>
                            <Label>Target Segment</Label>
                            <Select value={abTestForm.target_segment} onValueChange={(v) => setAbTestForm({...abTestForm, target_segment: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_new_psps">All New PSPs</SelectItem>
                                    <SelectItem value="startup">Startup</SelectItem>
                                    <SelectItem value="smb">SMB</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => createABTestMutation.mutate(abTestForm)}>Create Test</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Campaign Dialog */}
            <Dialog open={showDialog && dialogType === 'campaign'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Promotional Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Campaign Name</Label>
                            <Input
                                value={campaignForm.campaign_name}
                                onChange={(e) => setCampaignForm({...campaignForm, campaign_name: e.target.value})}
                                placeholder="e.g., Q1 2025 Promotion"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={campaignForm.description}
                                onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                                placeholder="Campaign objectives..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Discount Type</Label>
                                <Select value={campaignForm.discount_type} onValueChange={(v) => setCampaignForm({...campaignForm, discount_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Discount Value</Label>
                                <Input
                                    type="number"
                                    value={campaignForm.discount_value}
                                    onChange={(e) => setCampaignForm({...campaignForm, discount_value: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
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
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => createCampaignMutation.mutate(campaignForm)}>Create Campaign</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Simulation Results Dialog */}
            <Dialog open={showDialog && dialogType === 'simulation'} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Pricing Simulation Results</DialogTitle>
                    </DialogHeader>
                    {simulationResults && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="font-semibold text-blue-900">Pricing Item: {simulationResults.pricing_item}</p>
                                <p className="text-sm text-blue-700">Optimization Score: {simulationResults.optimization_score}/100</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="py-2 px-3 text-left text-sm">Volume</th>
                                            <th className="py-2 px-3 text-right text-sm">Transactions</th>
                                            <th className="py-2 px-3 text-right text-sm">Cost</th>
                                            <th className="py-2 px-3 text-right text-sm">Revenue</th>
                                            <th className="py-2 px-3 text-right text-sm">Margin</th>
                                            <th className="py-2 px-3 text-right text-sm">Margin %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {simulationResults.simulations.map((sim, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="py-2 px-3 text-sm">${sim.monthly_volume.toLocaleString()}</td>
                                                <td className="py-2 px-3 text-right text-sm">{sim.transaction_count}</td>
                                                <td className="py-2 px-3 text-right text-sm">${sim.total_cost}</td>
                                                <td className="py-2 px-3 text-right text-sm">${sim.total_revenue}</td>
                                                <td className="py-2 px-3 text-right text-sm font-semibold text-emerald-600">${sim.total_margin}</td>
                                                <td className="py-2 px-3 text-right text-sm font-semibold">{sim.margin_percentage}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {simulationResults.recommendations && simulationResults.recommendations.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-900">Recommendations:</h4>
                                    {simulationResults.recommendations.map((rec, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${
                                            rec.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                                        }`}>
                                            <p className="font-medium text-sm">{rec.message}</p>
                                            {rec.suggested_sell_rate_percentage && (
                                                <p className="text-sm mt-1">Suggested rate: {rec.suggested_sell_rate_percentage}%</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Optimization Results Dialog */}
            <Dialog open={showDialog && dialogType === 'optimization'} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Pricing Optimization Analysis</DialogTitle>
                    </DialogHeader>
                    {optimizationResults && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-semibold text-slate-900">Optimization Score</p>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {optimizationResults.optimization_score}/100
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <p className="text-slate-600">Current Rate</p>
                                        <p className="font-semibold">{optimizationResults.current_pricing?.sell_rate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600">Margin</p>
                                        <p className="font-semibold">{optimizationResults.current_pricing?.margin}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600">Market Position</p>
                                        <Badge variant="outline" className="capitalize">
                                            {optimizationResults.current_pricing?.competitive_position}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900">Optimization Suggestions:</h4>
                                {optimizationResults.suggestions?.map((suggestion, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border ${
                                        suggestion.priority === 'high' ? 'bg-red-50 border-red-200' :
                                        suggestion.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                                        'bg-blue-50 border-blue-200'
                                    }`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className={
                                                    suggestion.priority === 'high' ? 'bg-red-600' :
                                                    suggestion.priority === 'medium' ? 'bg-amber-600' :
                                                    'bg-blue-600'
                                                }>
                                                    {suggestion.priority} priority
                                                </Badge>
                                                <Badge variant="outline" className="capitalize">
                                                    {suggestion.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="font-medium text-slate-900 mb-2">{suggestion.message}</p>
                                        <p className="text-sm text-slate-700 mb-3">{suggestion.recommendation}</p>
                                        {suggestion.impact && (
                                            <div className="flex gap-3 text-sm">
                                                {Object.entries(suggestion.impact).map(([key, value]) => (
                                                    <Badge key={key} variant="outline" className="bg-white">
                                                        {key.replace(/_/g, ' ')}: {value}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!optimizationResults.suggestions || optimizationResults.suggestions.length === 0) && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                                        <p className="text-emerald-900 font-medium">✓ Pricing is well optimized!</p>
                                        <p className="text-sm text-emerald-700 mt-1">No critical recommendations at this time.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}