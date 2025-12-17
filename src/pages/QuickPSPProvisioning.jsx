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
    BrandingConfig, 
    LimitsConfig, 
    PricingModelConfig 
} from '@/components/platform/PSPComponentLibrary';
import MenuConfigEditor from '@/components/platform/MenuConfigEditor';
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
    const { user } = usePlatformAuth(['PROVISION_PSP']);
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
        pricing_model: {},
        menu_config: [],
        admin_user: {
            email: '',
            full_name: '',
            password: ''
        }
    });

    const provisionMutation = useMutation({
        mutationFn: async (config) => {
            // Step 1: Provision database schema (ensures clean, empty database)
            const schemaResult = await base44.functions.invoke('provisionPSPSchema', {
                psp_code: config.psp_code,
                template_psp_code: selectedTemplate?.id === 'netxhub_full' ? 'NETXHUB' : null
            });

            if (!schemaResult.data.success) {
                throw new Error('Schema provisioning failed');
            }

            // Step 2: Create first admin user
            const userResult = await base44.functions.invoke('getPSPSettings', {
                psp_code: config.psp_code,
                action: 'createUser',
                user_data: {
                    email: config.admin_user.email,
                    full_name: config.admin_user.full_name,
                    role: 'admin',
                    password: config.admin_user.password
                }
            });

            if (!userResult.data.success) {
                throw new Error('Failed to create admin user');
            }

            // Step 3: Create ProvisionedPSP entity
            const psp = await base44.asServiceRole.entities.ProvisionedPSP.create({
                psp_code: config.psp_code,
                psp_name: config.instance_name,
                status: 'active',
                branding: config.branding,
                enabled_modules: config.enabled_modules,
                features: config.features
            });

            // Step 4: Update PSP settings with menu configuration
            await base44.functions.invoke('getPSPSettings', {
                psp_code: config.psp_code,
                action: 'update',
                settings: {
                    company_name: config.instance_name,
                    branding: config.branding,
                    menu_config: config.menu_config,
                    limits: config.limits,
                    pricing_model: config.pricing_model
                }
            });

            // Step 5: Create MerchantPortalConfig
            await base44.asServiceRole.entities.MerchantPortalConfig.create({
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
                navigation_menu: config.menu_config,
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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <FTSPlatformSidebar 
                currentPage="QuickPSPProvisioning"
                userEmail={user?.email}
                userRole={user?.role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header with NetXHub style */}
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-5 blur-3xl" />
                        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-8">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                    <Sparkles className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Quick PSP Provisioning
                                    </h1>
                                    <p className="text-slate-600">Deploy a new PSP instance in minutes using NetXHub templates</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[
                            { num: 1, label: 'Choose Template' },
                            { num: 2, label: 'Configure' },
                            { num: 3, label: 'Deploy' }
                        ].map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-semibold transition-all ${
                                        step >= s.num 
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                                            : 'bg-white border-2 border-slate-200 text-slate-400 shadow-sm'
                                    }`}>
                                        {step > s.num ? <CheckCircle className="h-6 w-6" /> : s.num}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 2 && <div className={`h-1 w-20 rounded-full mt-[-24px] transition-all ${step > s.num ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Template Selection */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2 text-slate-900">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>Enter PSP details to get started</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
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
                                <h3 className="text-lg font-semibold mb-4 text-slate-900">Choose a Template</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.values(PSP_TEMPLATES).map(template => {
                                        const Icon = getTemplateIcon(template.icon);
                                        return (
                                            <Card 
                                                key={template.id}
                                                className="cursor-pointer bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group"
                                                onClick={() => handleTemplateSelect(template)}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/30 transition-all">
                                                            <Icon className="h-6 w-6 text-white" />
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
                        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100">
                                <CardTitle className="text-slate-900">Configure PSP</CardTitle>
                                <CardDescription>Customize modules, features, and settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="admin">
                                    <TabsList className="grid grid-cols-6 w-full">
                                        <TabsTrigger value="admin">Admin User</TabsTrigger>
                                        <TabsTrigger value="modules">Modules</TabsTrigger>
                                        <TabsTrigger value="menus">Menus</TabsTrigger>
                                        <TabsTrigger value="branding">Branding</TabsTrigger>
                                        <TabsTrigger value="limits">Limits</TabsTrigger>
                                        <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="admin" className="mt-6">
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-blue-800">
                                                    <strong>First Admin User:</strong> This user will have full access to the PSP. They can create additional users later.
                                                </p>
                                            </div>
                                            <div>
                                                <Label>Admin Email *</Label>
                                                <Input
                                                    type="email"
                                                    value={pspConfig.admin_user.email}
                                                    onChange={(e) => setPspConfig({
                                                        ...pspConfig,
                                                        admin_user: { ...pspConfig.admin_user, email: e.target.value }
                                                    })}
                                                    placeholder="admin@example.com"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Full Name *</Label>
                                                <Input
                                                    value={pspConfig.admin_user.full_name}
                                                    onChange={(e) => setPspConfig({
                                                        ...pspConfig,
                                                        admin_user: { ...pspConfig.admin_user, full_name: e.target.value }
                                                    })}
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Password *</Label>
                                                <Input
                                                    type="password"
                                                    value={pspConfig.admin_user.password}
                                                    onChange={(e) => setPspConfig({
                                                        ...pspConfig,
                                                        admin_user: { ...pspConfig.admin_user, password: e.target.value }
                                                    })}
                                                    placeholder="Minimum 8 characters"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="modules" className="mt-6">
                                        <ModuleSelector
                                            selectedModules={pspConfig.enabled_modules}
                                            onChange={(modules) => setPspConfig({...pspConfig, enabled_modules: modules})}
                                        />
                                    </TabsContent>

                                    <TabsContent value="menus" className="mt-6">
                                        <MenuConfigEditor
                                            menuConfig={pspConfig.menu_config}
                                            enabledModules={pspConfig.enabled_modules}
                                            onChange={(menu_config) => setPspConfig({...pspConfig, menu_config})}
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
                        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100">
                                <CardTitle className="text-slate-900">Review & Deploy</CardTitle>
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
                        <Card className="text-center bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
                            <CardContent className="pt-12 pb-12">
                                <div className="inline-block p-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl shadow-emerald-500/30 mb-6">
                                    <CheckCircle className="h-16 w-16 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                    PSP Provisioned Successfully!
                                </h3>
                                <p className="text-slate-600 mb-8">Your new PSP instance is ready to use</p>
                                <div className="flex gap-3 justify-center">
                                    <Button 
                                        onClick={() => window.location.href = '/PSPProvisioning'}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                                    >
                                        View All PSPs
                                    </Button>
                                    <Button variant="outline" className="border-slate-300 hover:bg-slate-50" onClick={() => {
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