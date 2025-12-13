import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

export default function PSPInstanceConfig() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const pspId = urlParams.get('id');

    const [activeTab, setActiveTab] = useState('appearance');

    const { data: psp, isLoading } = useQuery({
        queryKey: ['psp-config', pspId],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.list();
            return psps.find(p => p.id === pspId);
        },
        enabled: !!pspId
    });

    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: payoutMethods = [] } = useQuery({
        queryKey: ['payout-methods'],
        queryFn: () => base44.entities.PayoutRoute.list()
    });

    const [config, setConfig] = useState({
        branding: {},
        transaction_fees: {},
        region_settings: {},
        enabled_payment_methods: [],
        enabled_payout_methods: []
    });

    // Populate config when PSP data loads
    React.useEffect(() => {
        if (psp) {
            setConfig({
                branding: psp.branding || { company_name: psp.psp_name },
                transaction_fees: psp.transaction_fees || {},
                region_settings: {
                    default_currency: psp.currency || 'USD',
                    timezone: psp.timezone || 'UTC',
                    region: psp.country || '',
                    language: 'en'
                },
                enabled_payment_methods: psp.enabled_payment_methods || [],
                enabled_payout_methods: psp.enabled_payout_methods || []
            });
        }
    }, [psp]);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.ProvisionedPSP.update(pspId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-config']);
            queryClient.invalidateQueries(['provisioned-psps']);
        }
    });

    const handleSave = () => {
        updateMutation.mutate(config);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="mb-3"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Platform
                    </Button>
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
                    </TabsList>

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
                                <CardTitle>Payment Method Configuration</CardTitle>
                                <CardDescription>Select which payment methods to enable for this PSP</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {paymentProviders.map((provider) => (
                                    <div key={provider.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{provider.provider_name}</p>
                                                <p className="text-xs text-slate-500">{provider.provider_type}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={config.enabled_payment_methods?.includes(provider.id)}
                                            onCheckedChange={(checked) => {
                                                const methods = checked
                                                    ? [...(config.enabled_payment_methods || []), provider.id]
                                                    : (config.enabled_payment_methods || []).filter(id => id !== provider.id);
                                                setConfig({...config, enabled_payment_methods: methods});
                                            }}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payout Methods Tab */}
                    <TabsContent value="payouts">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>Payout Method Configuration</CardTitle>
                                <CardDescription>Configure available payout methods based on commercial agreements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {['Bank Transfer', 'Instant Payout', 'Crypto Payout', 'Digital Wallet'].map((method) => (
                                        <div key={method} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Wallet className="h-5 w-5 text-slate-600" />
                                                <span className="font-medium text-slate-900">{method}</span>
                                            </div>
                                            <Switch
                                                checked={config.enabled_payout_methods?.includes(method)}
                                                onCheckedChange={(checked) => {
                                                    const methods = checked
                                                        ? [...(config.enabled_payout_methods || []), method]
                                                        : (config.enabled_payout_methods || []).filter(m => m !== method);
                                                    setConfig({...config, enabled_payout_methods: methods});
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
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
                                        <Label>Default Currency</Label>
                                        <Select 
                                            value={config.region_settings?.default_currency || 'USD'}
                                            onValueChange={(v) => setConfig({...config, region_settings: {...config.region_settings, default_currency: v}})}
                                        >
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
                </Tabs>
            </div>
        </div>
    );
}