import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
    CheckCircle2, ArrowRight, ArrowLeft, CreditCard, Wallet, Shield, 
    Sparkles, Building2, Globe, DollarSign, Key, ExternalLink, Loader2,
    CheckCircle, AlertCircle, Info
} from 'lucide-react';



const complianceRequirements = [
    {
        id: 'pci_dss',
        name: 'PCI DSS Compliance',
        description: 'Payment Card Industry Data Security Standard',
        required: true,
        items: ['Secure network', 'Protect cardholder data', 'Vulnerability management', 'Access controls']
    },
    {
        id: 'kyb',
        name: 'KYB Verification',
        description: 'Know Your Business - Merchant verification',
        required: true,
        items: ['Business registration', 'Beneficial ownership', 'Business address', 'Tax ID']
    },
    {
        id: 'aml',
        name: 'AML Screening',
        description: 'Anti-Money Laundering compliance',
        required: true,
        items: ['Transaction monitoring', 'Risk assessment', 'Reporting procedures', 'Record keeping']
    },
    {
        id: 'gdpr',
        name: 'GDPR Compliance',
        description: 'Data protection and privacy',
        required: false,
        items: ['Data processing agreements', 'Privacy policy', 'Consent management', 'Data retention']
    }
];

export default function PSPSetupWizard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const pspId = searchParams.get('psp_id');
    
    const [step, setStep] = useState(1);
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [providerConfigs, setProviderConfigs] = useState({});
    const [payoutConfig, setPayoutConfig] = useState({
        default_method: 'bank_transfer',
        schedule: 'daily',
        minimum_payout: 25,
        currency: 'USD'
    });
    const [complianceConfig, setComplianceConfig] = useState({});

    const { data: psp } = useQuery({
        queryKey: ['psp', pspId],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ id: pspId }),
        select: (data) => data[0],
        enabled: !!pspId
    });

    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: payoutRoutes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list()
    });

    const updatePSPMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.ProvisionedPSP.update(pspId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psp', pspId] });
        }
    });

    const createPaymentProviderMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.PaymentProvider.create(data);
        }
    });

    const createPayoutRouteMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.PayoutRoute.create(data);
        }
    });

    const toggleProvider = (providerId) => {
        setSelectedProviders(prev => 
            prev.includes(providerId)
                ? prev.filter(id => id !== providerId)
                : [...prev, providerId]
        );
    };

    const updateProviderConfig = (providerId, field, value) => {
        setProviderConfigs(prev => ({
            ...prev,
            [providerId]: {
                ...(prev[providerId] || {}),
                [field]: value
            }
        }));
    };

    const validateProviderConfig = (providerId) => {
        return true; // No credentials needed for platform-level providers
    };

    const handleCompleteSetup = async () => {
        // Update PSP with enabled providers and routes
        await updatePSPMutation.mutateAsync({
            enabled_payment_methods: selectedProviders,
            enabled_payout_methods: [payoutConfig.default_method],
            setup_completed: true,
            setup_completed_date: new Date().toISOString(),
            compliance_config: complianceConfig
        });

        navigate(createPageUrl('MyPSPInstances'));
    };

    if (!psp) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-slate-900">PSP Setup Wizard</h1>
                            <p className="text-slate-600">{psp.psp_name}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-white">Step {step} of 4</Badge>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3, 4].map((s, idx) => (
                        <React.Fragment key={s}>
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all",
                                step >= s 
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg" 
                                    : "bg-white text-slate-400 border-2 border-slate-200"
                            )}>
                                {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
                            </div>
                            {s < 4 && (
                                <div className={cn(
                                    "h-1 w-20 mx-2 transition-all rounded",
                                    step > s ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-slate-200"
                                )} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="space-y-6">
                        <Card className="border-2 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-2xl">Welcome to Your PSP! 🎉</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-700">
                                    Your PSP infrastructure is ready. This wizard will guide you through:
                                </p>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Payment Provider Integration</h3>
                                            <p className="text-sm text-slate-600">Select from available payment gateways</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                                        <Wallet className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Payout Configuration</h3>
                                            <p className="text-sm text-slate-600">Set up merchant settlement options</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                                        <Shield className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Compliance Setup</h3>
                                            <p className="text-sm text-slate-600">Configure KYB, AML, and PCI DSS</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Review & Launch</h3>
                                            <p className="text-sm text-slate-600">Activate your PSP platform</p>
                                        </div>
                                    </div>
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-900">
                                        Setup takes approximately 15-20 minutes. You can save progress and return anytime.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button 
                                onClick={() => setStep(2)}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8"
                                size="lg"
                            >
                                Start Setup
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment Providers */}
                {step === 2 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Connect Payment Providers
                                </CardTitle>
                                <p className="text-sm text-slate-600 mt-2">
                                    Connect at least one payment gateway to start accepting payments
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {paymentProviders.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <CreditCard className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                        <p>No payment providers available</p>
                                        <p className="text-sm">Contact FTS admin to add providers to the pool</p>
                                    </div>
                                ) : (
                                    paymentProviders.map((provider) => {
                                        const isSelected = selectedProviders.includes(provider.id);
                                        
                                        return (
                                            <Card 
                                                key={provider.id}
                                                className={cn(
                                                    "transition-all",
                                                    isSelected ? "border-2 border-blue-500 shadow-lg" : "border-slate-200"
                                                )}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                                                <CreditCard className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-lg">{provider.name}</h3>
                                                                {provider.type && (
                                                                    <p className="text-sm text-slate-600 capitalize">{provider.type}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleProvider(provider.id)}
                                                        />
                                                    </div>
                                                </CardHeader>
                                                
                                                {isSelected && (
                                                    <CardContent className="space-y-4">
                                                        <Alert className="bg-emerald-50 border-emerald-200">
                                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            <AlertDescription className="text-emerald-900">
                                                                {provider.name} will be enabled for your PSP
                                                            </AlertDescription>
                                                        </Alert>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button 
                                onClick={() => setStep(3)}
                                disabled={selectedProviders.length === 0 || !selectedProviders.every(id => validateProviderConfig(id))}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                            >
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payout Configuration */}
                {step === 3 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5" />
                                    Configure Merchant Payouts
                                </CardTitle>
                                <p className="text-sm text-slate-600 mt-2">
                                    Set up how and when merchants receive their settlements
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label className="text-base mb-4 block">Default Payout Method</Label>
                                    {payoutRoutes.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <Wallet className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                            <p>No payout routes available</p>
                                            <p className="text-sm">Contact FTS admin to add payout routes</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {payoutRoutes.map((route) => {
                                                const isSelected = payoutConfig.default_method === route.id;
                                                
                                                return (
                                                    <button
                                                        key={route.id}
                                                        onClick={() => setPayoutConfig({ ...payoutConfig, default_method: route.id })}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 text-left transition-all",
                                                            isSelected 
                                                                ? "border-purple-500 bg-purple-50 shadow-lg" 
                                                                : "border-slate-200 hover:border-purple-300 bg-white"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                                <Wallet className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold">{route.route_name}</h3>
                                                                <p className="text-sm text-slate-600 mt-1 capitalize">
                                                                    {route.channel_type} • {route.settlement_speed}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <CheckCircle2 className="h-5 w-5 text-purple-600" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Payout Schedule</Label>
                                        <Select
                                            value={payoutConfig.schedule}
                                            onValueChange={(val) => setPayoutConfig({ ...payoutConfig, schedule: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="on-demand">On-demand</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Minimum Payout Amount</Label>
                                        <div className="flex gap-2">
                                            <span className="flex items-center px-3 bg-slate-100 border border-r-0 rounded-l-md">
                                                {payoutConfig.currency}
                                            </span>
                                            <Input
                                                type="number"
                                                value={payoutConfig.minimum_payout}
                                                onChange={(e) => setPayoutConfig({ ...payoutConfig, minimum_payout: parseFloat(e.target.value) })}
                                                className="rounded-l-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Merchants can override these settings. You can configure multiple payout routes for different merchant tiers.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button 
                                onClick={() => setStep(4)}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                            >
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Compliance & Review */}
                {step === 4 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Compliance Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {complianceRequirements.map((req) => (
                                    <Card key={req.id} className="border-slate-200">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        {req.name}
                                                        {req.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                                    </h3>
                                                    <p className="text-sm text-slate-600">{req.description}</p>
                                                </div>
                                                <Switch
                                                    checked={complianceConfig[req.id] !== false}
                                                    onCheckedChange={(checked) => setComplianceConfig({ ...complianceConfig, [req.id]: checked })}
                                                    disabled={req.required}
                                                />
                                            </div>
                                        </CardHeader>
                                        {complianceConfig[req.id] !== false && (
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {req.items.map((item, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-sm">
                                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Review Summary */}
                        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    Setup Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-600 mb-2">Payment Providers</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProviders.map(id => {
                                            const provider = paymentProviders.find(p => p.id === id);
                                            return provider ? (
                                                <Badge key={id} className="bg-blue-100 text-blue-700">
                                                    {provider.name}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-slate-600 mb-2">Payout Configuration</p>
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold">Method:</span> {payoutRoutes.find(r => r.id === payoutConfig.default_method)?.route_name}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Schedule:</span> {payoutConfig.schedule}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Minimum:</span> {payoutConfig.currency} {payoutConfig.minimum_payout}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-600 mb-2">Compliance Modules</p>
                                    <div className="flex flex-wrap gap-2">
                                        {complianceRequirements.filter(r => complianceConfig[r.id] !== false).map(req => (
                                            <Badge key={req.id} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                ✓ {req.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-900">
                                Once you complete setup, your PSP will be activated and ready to onboard merchants.
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(3)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button 
                                onClick={handleCompleteSetup}
                                disabled={updatePSPMutation.isPending}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8"
                                size="lg"
                            >
                                {updatePSPMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Activating...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup & Activate
                                        <Sparkles className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}