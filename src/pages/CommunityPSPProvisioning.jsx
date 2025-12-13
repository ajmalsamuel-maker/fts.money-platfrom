import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FTS_COLORS } from '@/components/community/FTSBrandColors';
import { 
    Building2, ArrowRight, CheckCircle2, Sparkles, Zap, Shield, DollarSign,
    Globe, CreditCard, Wallet, TrendingUp, Lock, Code, BarChart3, Brain
} from 'lucide-react';

const frameworks = [
    {
        id: 'monolithic',
        name: 'Monolithic Platform',
        description: 'All-in-one solution, fastest to launch',
        icon: Building2,
        timeToLaunch: '24-48 hours',
        complexity: 'Low',
        benefits: ['Quick setup', 'Unified management', 'Lower initial cost'],
        price: 1500,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'modular',
        name: 'Modular Stack',
        description: 'Best-of-breed components you control',
        icon: Zap,
        timeToLaunch: '3-5 days',
        complexity: 'Medium',
        benefits: ['Flexible', 'Customizable', 'Scalable'],
        price: 3000,
        popular: true,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'microservices',
        name: 'Microservices Architecture',
        description: 'Enterprise-grade, fully distributed',
        icon: Brain,
        timeToLaunch: '1-2 weeks',
        complexity: 'High',
        benefits: ['Maximum flexibility', 'Independent scaling', 'Future-proof'],
        price: 5000,
        color: 'from-amber-500 to-orange-500'
    }
];

const coreComponents = [
    { id: 'payment_gateway', name: 'Payment Gateway', icon: CreditCard, required: true, monthlyFee: 0 },
    { id: 'merchant_portal', name: 'Merchant Portal', icon: Globe, required: true, monthlyFee: 0 },
    { id: 'transaction_processing', name: 'Transaction Engine', icon: Zap, required: true, monthlyFee: 0 },
    { id: 'reporting', name: 'Reporting & Analytics', icon: BarChart3, required: true, monthlyFee: 0 }
];

const advancedComponents = [
    { id: 'smart_routing', name: 'AI Smart Routing', icon: Brain, monthlyFee: 500, description: 'ML-powered payment routing' },
    { id: 'fraud_detection', name: 'Advanced Fraud Detection', icon: Shield, monthlyFee: 800, description: 'Real-time fraud analysis' },
    { id: 'network_tokenization', name: 'Network Tokenization', icon: Lock, monthlyFee: 400, description: 'Boost authorization rates' },
    { id: 'crypto_payments', name: 'Crypto Payments', icon: DollarSign, monthlyFee: 600, description: 'Accept cryptocurrency' },
    { id: 'instant_settlements', name: 'Instant Settlements', icon: Wallet, monthlyFee: 350, description: 'Real-time payouts' },
    { id: 'api_orchestration', name: 'API Orchestration', icon: Code, monthlyFee: 450, description: 'Multi-gateway management' }
];

const pricingModels = [
    {
        id: 'revenue_share',
        name: 'Revenue Share',
        description: 'Pay % of transaction volume',
        percentage: 0.5,
        setup: 0,
        icon: TrendingUp,
        bestFor: 'Startups & SMBs'
    },
    {
        id: 'fixed_fee',
        name: 'Fixed Monthly',
        description: 'Predictable monthly cost',
        monthlyFee: 2000,
        setup: 5000,
        icon: DollarSign,
        bestFor: 'Growing businesses'
    },
    {
        id: 'hybrid',
        name: 'Hybrid Model',
        description: 'Low fixed + small % share',
        monthlyFee: 1000,
        percentage: 0.25,
        setup: 2500,
        icon: Zap,
        bestFor: 'Balanced approach',
        popular: true
    }
];

export default function CommunityPSPProvisioning() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [session, setSession] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedFramework, setSelectedFramework] = useState('modular');
    const [selectedComponents, setSelectedComponents] = useState([]);
    const [selectedPricing, setSelectedPricing] = useState('hybrid');
    const [formData, setFormData] = useState({
        psp_name: '',
        psp_code: '',
        legal_entity_name: '',
        contact_email: '',
        contact_phone: '',
        country: '',
        subdomain: ''
    });

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        const parsed = JSON.parse(sessionData);
        setSession(parsed);
        setFormData(prev => ({ ...prev, contact_email: parsed.email }));
    }, [navigate]);

    const provisionMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.ProvisionedPSP.create(data);
        },
        onSuccess: (psp) => {
            queryClient.invalidateQueries({ queryKey: ['my-psp-instances'] });
            navigate(createPageUrl('MyPSPInstances'));
        }
    });

    const handleProvision = async () => {
        const framework = frameworks.find(f => f.id === selectedFramework);
        const pricing = pricingModels.find(p => p.id === selectedPricing);
        
        const advancedFees = selectedComponents.reduce((sum, compId) => {
            const comp = advancedComponents.find(c => c.id === compId);
            return sum + (comp?.monthlyFee || 0);
        }, 0);

        const totalMonthlyFee = (framework.price || 0) + advancedFees + (pricing.monthlyFee || 0);

        const pspData = {
            ...formData,
            tier: selectedFramework,
            status: 'provisioning',
            provisioning_progress: 0,
            subdomain: formData.subdomain || formData.psp_code.toLowerCase(),
            pricing_model: selectedPricing,
            revenue_share_percentage: pricing.percentage || 0,
            monthly_fee: totalMonthlyFee,
            setup_fee: pricing.setup || 0,
            enabled_features: [...coreComponents.map(c => c.id), ...selectedComponents]
        };

        provisionMutation.mutate(pspData);
    };

    const toggleComponent = (componentId) => {
        setSelectedComponents(prev => 
            prev.includes(componentId) 
                ? prev.filter(id => id !== componentId)
                : [...prev, componentId]
        );
    };

    const calculateTotalCost = () => {
        const framework = frameworks.find(f => f.id === selectedFramework);
        const pricing = pricingModels.find(p => p.id === selectedPricing);
        const advancedFees = selectedComponents.reduce((sum, compId) => {
            const comp = advancedComponents.find(c => c.id === compId);
            return sum + (comp?.monthlyFee || 0);
        }, 0);
        return (framework.price || 0) + advancedFees + (pricing.monthlyFee || 0);
    };

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="CommunityPSPProvisioning" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Launch Your PSP</h2>
                        <p className="text-xs text-slate-600">Configure your payment infrastructure</p>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0">
                        Step {step} of 4
                    </Badge>
                </header>

                <div className="p-6 max-w-6xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        {[1, 2, 3, 4].map((s, idx) => (
                            <React.Fragment key={s}>
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all",
                                    step >= s 
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg" 
                                        : "bg-slate-200 text-slate-600"
                                )}>
                                    {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
                                </div>
                                {s < 4 && (
                                    <div className={cn(
                                        "h-1 w-16 mx-2 transition-all",
                                        step > s ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-slate-200"
                                    )} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Select Framework */}
                    {step === 1 && (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Choose Your Platform Architecture
                                </h2>
                                <p className="text-slate-600 text-lg">Select the technical foundation that matches your business goals</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {frameworks.map((framework) => {
                                    const Icon = framework.icon;
                                    return (
                                        <button
                                            key={framework.id}
                                            onClick={() => setSelectedFramework(framework.id)}
                                            className={cn(
                                                "p-6 rounded-xl border-2 text-left hover:shadow-2xl transition-all relative group bg-white",
                                                selectedFramework === framework.id 
                                                    ? "ring-4 ring-blue-200 border-transparent shadow-xl" 
                                                    : "border-slate-200 hover:border-blue-300"
                                            )}
                                        >
                                            {framework.popular && (
                                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    Recommended
                                                </Badge>
                                            )}
                                            
                                            <div className={cn(
                                                "w-16 h-16 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br",
                                                framework.color
                                            )}>
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            
                                            <h3 className="text-xl font-bold mb-2">{framework.name}</h3>
                                            <p className="text-sm text-slate-600 mb-4">{framework.description}</p>
                                            
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600">Setup Time</span>
                                                    <Badge variant="outline">{framework.timeToLaunch}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600">Complexity</span>
                                                    <Badge variant="outline">{framework.complexity}</Badge>
                                                </div>
                                            </div>

                                            <ul className="space-y-2 mb-4">
                                                {framework.benefits.map((benefit, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="pt-4 border-t">
                                                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                                    ${framework.price.toLocaleString()}/mo
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end">
                                <Button 
                                    onClick={() => setStep(2)} 
                                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Components */}
                    {step === 2 && (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Build Your Feature Stack
                                </h2>
                                <p className="text-slate-600 text-lg">Core features included • Select advanced capabilities</p>
                            </div>

                            {/* Core Components */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        Core Platform Features (Included)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {coreComponents.map(comp => {
                                            const Icon = comp.icon;
                                            return (
                                                <div key={comp.id} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <Icon className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm">{comp.name}</p>
                                                        <p className="text-xs text-emerald-700">✓ Included</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Advanced Components */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Advanced Features (Optional Add-ons)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {advancedComponents.map(comp => {
                                            const Icon = comp.icon;
                                            const selected = selectedComponents.includes(comp.id);
                                            return (
                                                <button
                                                    key={comp.id}
                                                    onClick={() => toggleComponent(comp.id)}
                                                    className={cn(
                                                        "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                                                        selected 
                                                            ? "border-blue-500 bg-blue-50" 
                                                            : "border-slate-200 hover:border-blue-300 bg-white"
                                                    )}
                                                >
                                                    <Checkbox checked={selected} className="mt-1" />
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{comp.name}</p>
                                                        <p className="text-xs text-slate-600 mb-2">{comp.description}</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            +${comp.monthlyFee}/mo
                                                        </Badge>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-between mt-6">
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button 
                                    onClick={() => setStep(3)}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Pricing Model */}
                    {step === 3 && (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Choose Your Pricing Model
                                </h2>
                                <p className="text-slate-600 text-lg">Select how you want to pay for your platform</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {pricingModels.map((pricing) => {
                                    const Icon = pricing.icon;
                                    return (
                                        <button
                                            key={pricing.id}
                                            onClick={() => setSelectedPricing(pricing.id)}
                                            className={cn(
                                                "p-6 rounded-xl border-2 text-left hover:shadow-2xl transition-all relative bg-white",
                                                selectedPricing === pricing.id 
                                                    ? "ring-4 ring-purple-200 border-transparent shadow-xl" 
                                                    : "border-slate-200 hover:border-purple-300"
                                            )}
                                        >
                                            {pricing.popular && (
                                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                                                    Most Popular
                                                </Badge>
                                            )}
                                            
                                            <div className="w-14 h-14 rounded-xl mb-4 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <Icon className="h-7 w-7 text-white" />
                                            </div>
                                            
                                            <h3 className="text-xl font-bold mb-2">{pricing.name}</h3>
                                            <p className="text-sm text-slate-600 mb-4">{pricing.description}</p>
                                            
                                            <div className="space-y-2 mb-4">
                                                {pricing.monthlyFee > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-600">Monthly Fee</span>
                                                        <span className="font-semibold">${pricing.monthlyFee.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {pricing.percentage > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-600">Transaction %</span>
                                                        <span className="font-semibold">{pricing.percentage}%</span>
                                                    </div>
                                                )}
                                                {pricing.setup > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-600">Setup Fee</span>
                                                        <span className="font-semibold">${pricing.setup.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Badge variant="outline" className="text-xs">{pricing.bestFor}</Badge>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
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

                    {/* Step 4: Business Details & Review */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Final Step: Business Details
                                </h2>
                                <p className="text-slate-600 text-lg">Complete your information and launch your PSP</p>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>PSP Name *</Label>
                                            <Input
                                                value={formData.psp_name}
                                                onChange={(e) => setFormData({ ...formData, psp_name: e.target.value })}
                                                placeholder="Acme Payments"
                                            />
                                        </div>
                                        <div>
                                            <Label>PSP Code *</Label>
                                            <Input
                                                value={formData.psp_code}
                                                onChange={(e) => setFormData({ ...formData, psp_code: e.target.value.toUpperCase() })}
                                                placeholder="ACME"
                                                maxLength={10}
                                            />
                                        </div>
                                        <div>
                                            <Label>Legal Entity Name *</Label>
                                            <Input
                                                value={formData.legal_entity_name}
                                                onChange={(e) => setFormData({ ...formData, legal_entity_name: e.target.value })}
                                                placeholder="Acme Payments Ltd"
                                            />
                                        </div>
                                        <div>
                                            <Label>Country *</Label>
                                            <Input
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                placeholder="United States"
                                            />
                                        </div>
                                        <div>
                                            <Label>Contact Email *</Label>
                                            <Input
                                                value={formData.contact_email}
                                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                                type="email"
                                            />
                                        </div>
                                        <div>
                                            <Label>Contact Phone</Label>
                                            <Input
                                                value={formData.contact_phone}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label>Subdomain</Label>
                                            <Input
                                                value={formData.subdomain}
                                                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                                                placeholder="acme"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                Your PSP will be available at: <span className="font-semibold text-blue-600">{formData.subdomain || 'yourname'}.fts.money</span>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Configuration Summary */}
                            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        Configuration Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-600">Architecture</p>
                                            <p className="font-semibold">{frameworks.find(f => f.id === selectedFramework)?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600">Pricing Model</p>
                                            <p className="font-semibold">{pricingModels.find(p => p.id === selectedPricing)?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600">Core Features</p>
                                            <p className="font-semibold">{coreComponents.length} included</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600">Add-ons Selected</p>
                                            <p className="font-semibold">{selectedComponents.length} features</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-700">Platform Base</span>
                                            <span className="font-semibold">${frameworks.find(f => f.id === selectedFramework)?.price}/mo</span>
                                        </div>
                                        {selectedComponents.length > 0 && (
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-slate-700">Add-on Features</span>
                                                <span className="font-semibold">
                                                    +${selectedComponents.reduce((sum, id) => {
                                                        const comp = advancedComponents.find(c => c.id === id);
                                                        return sum + (comp?.monthlyFee || 0);
                                                    }, 0)}/mo
                                                </span>
                                            </div>
                                        )}
                                        {pricingModels.find(p => p.id === selectedPricing)?.monthlyFee > 0 && (
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-slate-700">Pricing Plan</span>
                                                <span className="font-semibold">
                                                    +${pricingModels.find(p => p.id === selectedPricing)?.monthlyFee}/mo
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-lg font-bold pt-4 border-t border-blue-200">
                                            <span>Total Monthly Cost</span>
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                                ${calculateTotalCost().toLocaleString()}/mo
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertDescription>
                                    Your PSP will be automatically provisioned within 24-48 hours. You'll receive login credentials via email once ready.
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                                <Button 
                                    onClick={handleProvision}
                                    disabled={provisionMutation.isPending || !formData.psp_name || !formData.psp_code}
                                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8"
                                    size="lg"
                                >
                                    {provisionMutation.isPending ? 'Launching...' : 'Launch My PSP'}
                                    <Sparkles className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}