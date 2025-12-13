import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { 
    Building2,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Zap,
    Shield,
    DollarSign
} from 'lucide-react';

const tiers = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$2,000/mo',
        description: 'Perfect for launching your PSP',
        features: [
            'Up to 100 merchants',
            '1 payment provider',
            'Basic routing',
            'Email support',
            'Standard compliance'
        ],
        color: 'border-blue-300 bg-blue-50'
    },
    {
        id: 'professional',
        name: 'Professional',
        price: '$5,000/mo',
        description: 'For growing PSPs',
        features: [
            'Up to 500 merchants',
            '3 payment providers',
            'Smart routing',
            'Priority support',
            'Advanced features'
        ],
        color: 'border-purple-300 bg-purple-50',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$10,000/mo',
        description: 'For established PSPs',
        features: [
            'Unlimited merchants',
            'Unlimited providers',
            'AI routing',
            'Dedicated support',
            'Full feature suite'
        ],
        color: 'border-amber-300 bg-amber-50'
    }
];

export default function CommunityPSPProvisioning() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [session, setSession] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState('professional');
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
        const tierConfig = tiers.find(t => t.id === selectedTier);
        
        const pspData = {
            ...formData,
            tier: selectedTier,
            status: 'provisioning',
            provisioning_progress: 0,
            subdomain: formData.subdomain || formData.psp_code.toLowerCase()
        };

        provisionMutation.mutate(pspData);
    };

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="CommunityPSPProvisioning" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Launch Your PSP</h2>
                        <p className="text-xs text-slate-600">Self-service provisioning wizard</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Step {step} of 3</Badge>
                    </div>
                </header>

                <div className="p-6 max-w-5xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                    step >= s ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                                )}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={cn(
                                        "w-24 h-1",
                                        step > s ? "bg-blue-600" : "bg-slate-200"
                                    )} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Select Tier */}
                    {step === 1 && (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Service Tier</h2>
                                <p className="text-slate-600">Select the plan that fits your business needs</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {tiers.map((tier) => (
                                    <button
                                        key={tier.id}
                                        onClick={() => setSelectedTier(tier.id)}
                                        className={cn(
                                            "p-6 rounded-xl border-2 text-left hover:shadow-lg transition-all relative",
                                            tier.color,
                                            selectedTier === tier.id && "ring-4 ring-blue-200"
                                        )}
                                    >
                                        {tier.popular && (
                                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                                                Most Popular
                                            </Badge>
                                        )}
                                        <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                                        <p className="text-2xl font-bold text-blue-600 mb-2">{tier.price}</p>
                                        <p className="text-sm text-slate-600 mb-4">{tier.description}</p>
                                        <ul className="space-y-2">
                                            {tier.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end mt-8">
                                <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Business Details */}
                    {step === 2 && (
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
                                    <div>
                                        <Label>Subdomain</Label>
                                        <Input
                                            value={formData.subdomain}
                                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                                            placeholder="acme"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">{formData.subdomain || 'yourname'}.fts.money</p>
                                    </div>
                                </div>

                                <div className="flex justify-between mt-6">
                                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button 
                                        onClick={() => setStep(3)}
                                        disabled={!formData.psp_name || !formData.psp_code}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Review & Launch */}
                    {step === 3 && (
                        <div>
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Review Your PSP Configuration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-slate-600">Service Tier</p>
                                                <p className="font-semibold">{tiers.find(t => t.id === selectedTier)?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">Monthly Cost</p>
                                                <p className="font-semibold">{tiers.find(t => t.id === selectedTier)?.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">PSP Name</p>
                                                <p className="font-semibold">{formData.psp_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">PSP Code</p>
                                                <p className="font-semibold font-mono">{formData.psp_code}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">URL</p>
                                                <p className="font-semibold text-blue-600">
                                                    {formData.subdomain || formData.psp_code.toLowerCase()}.fts.money
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">Contact Email</p>
                                                <p className="font-semibold">{formData.contact_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Alert className="mb-6">
                                <Sparkles className="h-4 w-4" />
                                <AlertDescription>
                                    Your PSP instance will be provisioned automatically. This typically takes 5-10 minutes.
                                    You'll receive an email when it's ready.
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                <Button 
                                    onClick={handleProvision}
                                    disabled={provisionMutation.isPending}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                >
                                    {provisionMutation.isPending ? 'Provisioning...' : 'Launch My PSP'}
                                    <Sparkles className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}