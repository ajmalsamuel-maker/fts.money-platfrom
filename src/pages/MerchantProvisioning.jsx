import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useStaffAuth } from '@/components/auth/useStaffAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ModuleSelector from '@/components/platform/ModuleSelector';
import ModuleDependencyEngine from '@/components/platform/ModuleDependencyEngine';
import SmartMenuGenerator from '@/components/platform/SmartMenuGenerator';
import { 
    Store, 
    Sparkles, 
    CheckCircle,
    ArrowRight,
    Loader2,
    Info
} from 'lucide-react';

export default function MerchantProvisioning() {
    const queryClient = useQueryClient();
    const { user } = useStaffAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPspCode, setCurrentPspCode] = useState(null);
    const [currentPspId, setCurrentPspId] = useState(null);
    const [pspModules, setPspModules] = useState([]);
    const [step, setStep] = useState(1);
    const [merchantConfig, setMerchantConfig] = useState({
        merchant_name: '',
        merchant_code: '',
        contact_email: '',
        tier: 'startup',
        enabled_modules: [],
        portal_config: {
            theme: {
                primary_color: '#3b82f6',
                secondary_color: '#06b6d4',
                logo_url: ''
            }
        }
    });

    useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            setCurrentPspCode(session.psp_code);
        }
    }, []);

    // Fetch PSP data and available modules
    const { data: pspData } = useQuery({
        queryKey: ['psp-data', currentPspCode],
        queryFn: async () => {
            if (!currentPspCode) return null;
            const psps = await base44.entities.ProvisionedPSP.filter({ psp_code: currentPspCode });
            if (psps && psps.length > 0) {
                setCurrentPspId(psps[0].id);
                setPspModules(psps[0].enabled_modules || []);
                return psps[0];
            }
            return null;
        },
        enabled: !!currentPspCode
    });

    const provisionMutation = useMutation({
        mutationFn: async (config) => {
            // Generate merchant portal menu based on selected modules
            const menuGen = new SmartMenuGenerator(config.enabled_modules, 'editor');
            const generatedMenus = menuGen.generateMenus();

            // Create merchant
            const merchant = await base44.entities.Merchant.create({
                psp_id: currentPspId,
                psp_code: currentPspCode,
                merchant_code: config.merchant_code,
                business_name: config.merchant_name,
                contact_email: config.contact_email,
                status: 'active',
                tier: config.tier
            });

            // Create merchant portal configuration
            await base44.entities.MerchantPortalConfig.create({
                config_id: `MERCHANT-PORTAL-${merchant.id}`,
                psp_id: currentPspId,
                psp_code: currentPspCode,
                portal_name: `${config.merchant_name} Portal`,
                theme: config.portal_config.theme,
                layout: {
                    sidebar_position: 'left',
                    sidebar_style: 'full',
                    header_style: 'full'
                },
                enabled_features: config.enabled_modules,
                navigation_menu: generatedMenus,
                status: 'active',
                version: '1.0.0',
                branding: {
                    company_name: config.merchant_name,
                    support_email: config.contact_email
                }
            });

            return merchant;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            setStep(3);
        }
    });

    const handleProvision = () => {
        provisionMutation.mutate(merchantConfig);
    };

    // Get available modules (subset of PSP's modules that can be offered to merchants)
    const merchantAvailableModules = pspModules.filter(mod => 
        // Filter out PSP-only modules
        !mod.includes('psp_admin') && 
        !mod.includes('platform_') &&
        !mod.includes('core_system')
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="MerchantProvisioning"
            />
            
            <div className="lg:ml-20">
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="bg-white rounded-2xl border shadow-lg p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                    <Store className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">
                                        Merchant Provisioning
                                    </h1>
                                    <p className="text-slate-600">Set up a new merchant with module-based portal configuration</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[
                            { num: 1, label: 'Basic Info' },
                            { num: 2, label: 'Modules & Portal' },
                            { num: 3, label: 'Complete' }
                        ].map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-semibold transition-all ${
                                        step >= s.num 
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                                            : 'bg-white border-2 border-slate-200 text-slate-400'
                                    }`}>
                                        {step > s.num ? <CheckCircle className="h-6 w-6" /> : s.num}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 2 && <div className={`h-1 w-20 rounded-full mt-[-24px] ${step > s.num ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Merchant Information</CardTitle>
                                <CardDescription>Enter basic details for the new merchant</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        This merchant will inherit from your PSP's available modules: <strong>{merchantAvailableModules.length} modules</strong>
                                    </AlertDescription>
                                </Alert>

                                <div>
                                    <Label>Merchant Name *</Label>
                                    <Input
                                        value={merchantConfig.merchant_name}
                                        onChange={(e) => setMerchantConfig({...merchantConfig, merchant_name: e.target.value})}
                                        placeholder="e.g., Acme Corp"
                                    />
                                </div>
                                <div>
                                    <Label>Merchant Code (unique) *</Label>
                                    <Input
                                        value={merchantConfig.merchant_code}
                                        onChange={(e) => setMerchantConfig({...merchantConfig, merchant_code: e.target.value.toUpperCase()})}
                                        placeholder="e.g., ACME001"
                                        className="uppercase"
                                    />
                                </div>
                                <div>
                                    <Label>Contact Email *</Label>
                                    <Input
                                        type="email"
                                        value={merchantConfig.contact_email}
                                        onChange={(e) => setMerchantConfig({...merchantConfig, contact_email: e.target.value})}
                                        placeholder="contact@acme.com"
                                    />
                                </div>
                                <div>
                                    <Label>Merchant Tier</Label>
                                    <div className="flex gap-2 mt-2">
                                        {['startup', 'growth', 'enterprise', 'vip'].map(tier => (
                                            <Button
                                                key={tier}
                                                variant={merchantConfig.tier === tier ? 'default' : 'outline'}
                                                onClick={() => setMerchantConfig({...merchantConfig, tier})}
                                            >
                                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button onClick={() => setStep(2)}>
                                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Module Selection & Portal Config */}
                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Module Selection & Portal Configuration</CardTitle>
                                <CardDescription>Choose which features this merchant can access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="modules">
                                    <TabsList>
                                        <TabsTrigger value="modules">Modules</TabsTrigger>
                                        <TabsTrigger value="branding">Portal Branding</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="modules" className="space-y-4">
                                        <Alert>
                                            <Sparkles className="h-4 w-4" />
                                            <AlertDescription>
                                                Select modules to enable for this merchant. Their portal menu will be auto-generated based on selections.
                                            </AlertDescription>
                                        </Alert>
                                        
                                        <ModuleSelector
                                            selectedModules={merchantConfig.enabled_modules}
                                            subscriptionTier={merchantConfig.tier}
                                            onChange={(modules) => setMerchantConfig({...merchantConfig, enabled_modules: modules})}
                                            availableModules={merchantAvailableModules}
                                        />
                                    </TabsContent>

                                    <TabsContent value="branding" className="space-y-4">
                                        <div>
                                            <Label>Portal Primary Color</Label>
                                            <Input
                                                type="color"
                                                value={merchantConfig.portal_config.theme.primary_color}
                                                onChange={(e) => setMerchantConfig({
                                                    ...merchantConfig,
                                                    portal_config: {
                                                        ...merchantConfig.portal_config,
                                                        theme: {
                                                            ...merchantConfig.portal_config.theme,
                                                            primary_color: e.target.value
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Secondary Color</Label>
                                            <Input
                                                type="color"
                                                value={merchantConfig.portal_config.theme.secondary_color}
                                                onChange={(e) => setMerchantConfig({
                                                    ...merchantConfig,
                                                    portal_config: {
                                                        ...merchantConfig.portal_config,
                                                        theme: {
                                                            ...merchantConfig.portal_config.theme,
                                                            secondary_color: e.target.value
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Logo URL (optional)</Label>
                                            <Input
                                                value={merchantConfig.portal_config.theme.logo_url}
                                                onChange={(e) => setMerchantConfig({
                                                    ...merchantConfig,
                                                    portal_config: {
                                                        ...merchantConfig.portal_config,
                                                        theme: {
                                                            ...merchantConfig.portal_config.theme,
                                                            logo_url: e.target.value
                                                        }
                                                    }
                                                })}
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-between mt-6">
                                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button 
                                        onClick={handleProvision}
                                        disabled={provisionMutation.isPending || merchantConfig.enabled_modules.length === 0}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {provisionMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Merchant...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Provision Merchant
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <Card className="text-center">
                            <CardContent className="pt-12 pb-12">
                                <div className="inline-block p-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl mb-6">
                                    <CheckCircle className="h-16 w-16 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-2 text-slate-900">
                                    Merchant Provisioned Successfully!
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {merchantConfig.merchant_name} is now ready with their custom portal
                                </p>
                                <div className="bg-slate-50 rounded-lg p-4 mb-8 inline-block">
                                    <p className="text-sm text-slate-600 mb-2">Portal Configuration:</p>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">{merchantConfig.enabled_modules.length} modules enabled</Badge>
                                        <Badge variant="secondary">Menu auto-generated</Badge>
                                        <Badge variant="secondary">{merchantConfig.tier} tier</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <Button onClick={() => window.location.href = '/Merchants'}>
                                        View All Merchants
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        setStep(1);
                                        setMerchantConfig({
                                            merchant_name: '',
                                            merchant_code: '',
                                            contact_email: '',
                                            tier: 'startup',
                                            enabled_modules: [],
                                            portal_config: {
                                                theme: {
                                                    primary_color: '#3b82f6',
                                                    secondary_color: '#06b6d4',
                                                    logo_url: ''
                                                }
                                            }
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