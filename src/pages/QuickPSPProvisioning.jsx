import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PSP_TEMPLATES, applyTemplate } from '@/components/platform/PSPTemplates';
import { 
    ModuleSelector, 
    FeatureToggles, 
    BrandingConfig, 
    LimitsConfig, 
    PricingModelConfig 
} from '@/components/platform/PSPComponentLibrary';
import { 
    Building2, 
    Zap, 
    Coins, 
    CheckCircle,
    Sparkles,
    ArrowRight,
    Loader2
} from 'lucide-react';

export default function QuickPSPProvisioning() {
    const { user, requirePermission } = usePlatformAuth('PROVISION_PSP');
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [pspConfig, setPspConfig] = useState({
        instance_name: '',
        psp_code: '',
        branding: {
            company_name: '',
            primary_color: '#3b82f6',
            secondary_color: '#06b6d4',
            logo_url: ''
        },
        enabled_modules: [],
        features: {},
        limits: {},
        pricing_model: {}
    });

    const provisionMutation = useMutation({
        mutationFn: async (config) => {
            // Create ProvisionedPSP entity
            const psp = await base44.entities.ProvisionedPSP.create({
                psp_code: config.psp_code,
                instance_name: config.instance_name,
                status: 'provisioning',
                branding: config.branding,
                enabled_modules: config.enabled_modules,
                features: config.features
            });

            // Create PSPSettings
            await base44.entities.PSPSettings.create({
                psp_id: psp.id,
                psp_code: config.psp_code,
                psp_name: config.instance_name,
                branding: config.branding,
                limits: config.limits,
                pricing_model: config.pricing_model
            });

            // Create MerchantPortalConfig based on template
            await base44.entities.MerchantPortalConfig.create({
                config_id: `PORTAL-${psp.id}`,
                psp_id: psp.id,
                psp_code: config.psp_code,
                portal_name: `${config.instance_name} Merchant Portal`,
                theme: {
                    primary_color: config.branding.primary_color,
                    secondary_color: config.branding.secondary_color,
                    logo_url: config.branding.logo_url,
                    font_family: 'Inter',
                    background_pattern: 'dots'
                },
                layout: {
                    sidebar_position: 'left',
                    sidebar_style: 'full',
                    header_style: 'full'
                },
                enabled_features: config.enabled_modules,
                status: 'active',
                version: '1.0.0'
            });

            return psp;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['provisioned-psps'] });
            setStep(4);
        }
    });

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        const applied = applyTemplate(template, {
            instance_name: pspConfig.instance_name,
            psp_code: pspConfig.psp_code,
            branding: pspConfig.branding
        });
        setPspConfig(applied);
        setStep(2);
    };

    const handleProvision = () => {
        provisionMutation.mutate(pspConfig);
    };

    const getTemplateIcon = (iconName) => {
        const icons = {
            Building2,
            Zap,
            Coins
        };
        return icons[iconName] || Building2;
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="QuickPSPProvisioning"
                userEmail={user?.email}
                userRole={user?.role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quick PSP Provisioning</h1>
                        <p className="text-slate-600">Deploy a new PSP instance in minutes using NetXHub templates</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map(s => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {s}
                                </div>
                                {s < 3 && <div className={`h-0.5 w-12 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Template Selection */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Enter PSP details to get started</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Instance Name</Label>
                                        <Input
                                            value={pspConfig.instance_name}
                                            onChange={(e) => setPspConfig({...pspConfig, instance_name: e.target.value})}
                                            placeholder="e.g., Global Payments Hub"
                                        />
                                    </div>
                                    <div>
                                        <Label>PSP Code (unique identifier)</Label>
                                        <Input
                                            value={pspConfig.psp_code}
                                            onChange={(e) => setPspConfig({...pspConfig, psp_code: e.target.value.toUpperCase()})}
                                            placeholder="e.g., GLOBALPAY"
                                            className="uppercase"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.values(PSP_TEMPLATES).map(template => {
                                        const Icon = getTemplateIcon(template.icon);
                                        return (
                                            <Card 
                                                key={template.id}
                                                className="cursor-pointer hover:border-blue-500 transition-all"
                                                onClick={() => handleTemplateSelect(template)}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-blue-50 rounded-lg">
                                                            <Icon className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base">{template.name}</CardTitle>
                                                            <CardDescription className="text-xs">{template.description}</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-600">Modules</span>
                                                            <Badge variant="secondary">{template.config.enabled_modules.length}</Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-600">Max Merchants</span>
                                                            <Badge variant="secondary">{template.config.limits.max_merchants.toLocaleString()}</Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Configuration */}
                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Configure PSP</CardTitle>
                                <CardDescription>Customize modules, features, and settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="modules">
                                    <TabsList className="grid grid-cols-5 w-full">
                                        <TabsTrigger value="modules">Modules</TabsTrigger>
                                        <TabsTrigger value="features">Features</TabsTrigger>
                                        <TabsTrigger value="branding">Branding</TabsTrigger>
                                        <TabsTrigger value="limits">Limits</TabsTrigger>
                                        <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="modules" className="mt-6">
                                        <ModuleSelector
                                            selectedModules={pspConfig.enabled_modules}
                                            onChange={(modules) => setPspConfig({...pspConfig, enabled_modules: modules})}
                                        />
                                    </TabsContent>

                                    <TabsContent value="features" className="mt-6">
                                        <FeatureToggles
                                            features={pspConfig.features}
                                            onChange={(features) => setPspConfig({...pspConfig, features})}
                                        />
                                    </TabsContent>

                                    <TabsContent value="branding" className="mt-6">
                                        <BrandingConfig
                                            branding={pspConfig.branding}
                                            onChange={(branding) => setPspConfig({...pspConfig, branding})}
                                        />
                                    </TabsContent>

                                    <TabsContent value="limits" className="mt-6">
                                        <LimitsConfig
                                            limits={pspConfig.limits}
                                            onChange={(limits) => setPspConfig({...pspConfig, limits})}
                                        />
                                    </TabsContent>

                                    <TabsContent value="pricing" className="mt-6">
                                        <PricingModelConfig
                                            pricingModel={pspConfig.pricing_model}
                                            onChange={(pricing_model) => setPspConfig({...pspConfig, pricing_model})}
                                        />
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-between mt-6">
                                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={() => setStep(3)}>
                                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Review & Deploy */}
                    {step === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review & Deploy</CardTitle>
                                <CardDescription>Confirm your configuration and deploy</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-3">Basic Info</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Name:</span>
                                                <span className="font-medium">{pspConfig.instance_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Code:</span>
                                                <Badge>{pspConfig.psp_code}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3">Configuration</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Modules:</span>
                                                <Badge variant="secondary">{pspConfig.enabled_modules.length}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Max Merchants:</span>
                                                <span className="font-medium">{pspConfig.limits.max_merchants?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                    <Button 
                                        onClick={handleProvision}
                                        disabled={provisionMutation.isPending}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {provisionMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Provisioning...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Deploy PSP
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <Card className="text-center">
                            <CardContent className="pt-12 pb-12">
                                <div className="inline-block p-4 bg-emerald-100 rounded-full mb-6">
                                    <CheckCircle className="h-12 w-12 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">PSP Provisioned Successfully!</h3>
                                <p className="text-slate-600 mb-6">Your new PSP instance is ready to use</p>
                                <div className="flex gap-3 justify-center">
                                    <Button onClick={() => window.location.href = '/PSPProvisioning'}>
                                        View All PSPs
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        setStep(1);
                                        setPspConfig({
                                            instance_name: '',
                                            psp_code: '',
                                            branding: { company_name: '', primary_color: '#3b82f6', secondary_color: '#06b6d4', logo_url: '' },
                                            enabled_modules: [],
                                            features: {},
                                            limits: {},
                                            pricing_model: {}
                                        });
                                    }}>
                                        Provision Another
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}