import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useStaffAuth } from '@/components/auth/useStaffAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import WidgetLibrary, { AVAILABLE_WIDGETS } from '@/components/portal-builder/WidgetLibrary';
import ThemeCustomizer from '@/components/portal-builder/ThemeCustomizer';
import LayoutEditor from '@/components/portal-builder/LayoutEditor';
import PortalTemplates from '@/components/portal-builder/PortalTemplates';
import ModuleSelector from '@/components/platform/ModuleSelector';
import { 
    Palette, 
    Layout as LayoutIcon, 
    Plus, 
    Eye, 
    Save,
    Grid,
    Settings,
    Rocket,
    Copy,
    Trash2,
    Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MerchantPortalBuilder() {
    const queryClient = useQueryClient();
    const { user, loading } = useStaffAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPspCode, setCurrentPspCode] = useState(null);
    const [currentPspId, setCurrentPspId] = useState(null);
    const [activeTab, setActiveTab] = useState('theme');
    const [showWidgetDialog, setShowWidgetDialog] = useState(false);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);

    const [portalConfig, setPortalConfig] = useState({
        portal_name: 'Merchant Portal',
        theme: {
            primary_color: '#3b82f6',
            secondary_color: '#06b6d4',
            accent_color: '#8b5cf6',
            logo_url: '',
            font_family: 'Inter',
            background_pattern: 'none'
        },
        layout: {
            sidebar_position: 'left',
            sidebar_style: 'full',
            header_style: 'full'
        },
        dashboard_widgets: [],
        branding: {
            company_name: '',
            tagline: '',
            support_email: '',
            support_phone: ''
        },
        enabled_modules: [],
        merchant_tier: 'growth'
    });

    useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            setCurrentPspCode(session.psp_code);
        }
    }, []);

    useEffect(() => {
        const fetchPsp = async () => {
            if (currentPspCode) {
                const psps = await base44.entities.ProvisionedPSP.filter({ psp_code: currentPspCode });
                if (psps && psps.length > 0) {
                    setCurrentPspId(psps[0].id);
                }
            }
        };
        fetchPsp();
    }, [currentPspCode]);

    // Fetch existing portal configs
    const { data: configs = [] } = useQuery({
        queryKey: ['portal-configs', currentPspCode],
        queryFn: async () => {
            if (!currentPspCode) return [];
            return await base44.entities.MerchantPortalConfig.filter({ psp_code: currentPspCode });
        },
        enabled: !!currentPspCode
    });

    // Save configuration mutation
    const saveConfigMutation = useMutation({
        mutationFn: async (config) => {
            if (selectedConfig) {
                return await base44.entities.MerchantPortalConfig.update(selectedConfig.id, config);
            } else {
                return await base44.entities.MerchantPortalConfig.create({
                    ...config,
                    config_id: `CONFIG-${Date.now()}`,
                    psp_id: currentPspId,
                    psp_code: currentPspCode,
                    status: 'draft',
                    version: '1.0.0'
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-configs'] });
        }
    });

    // Publish configuration mutation
    const publishMutation = useMutation({
        mutationFn: async (configId) => {
            return await base44.entities.MerchantPortalConfig.update(configId, {
                status: 'active',
                published_at: new Date().toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-configs'] });
        }
    });

    const handleAddWidget = (widget) => {
        const newWidget = {
            widget_id: `widget-${Date.now()}`,
            widget_type: widget.id,
            position: {
                row: portalConfig.dashboard_widgets.length,
                col: 0,
                width: 6,
                height: 4
            },
            config: widget.defaultConfig
        };
        setPortalConfig({
            ...portalConfig,
            dashboard_widgets: [...portalConfig.dashboard_widgets, newWidget]
        });
        setShowWidgetDialog(false);
    };

    const handleSave = () => {
        saveConfigMutation.mutate(portalConfig);
    };

    const handleLoadConfig = (config) => {
        setSelectedConfig(config);
        setPortalConfig({
            portal_name: config.portal_name,
            theme: config.theme,
            layout: config.layout,
            dashboard_widgets: config.dashboard_widgets || [],
            branding: config.branding || {},
            enabled_features: config.enabled_features || []
        });
    };

    const handleLoadTemplate = (template) => {
        setPortalConfig(template.config);
        setSelectedConfig(null);
        setShowTemplateDialog(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="MerchantPortalBuilder"
            />
            
            <div className="transition-all duration-300 lg:ml-20">
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <div className="p-4 sm:p-6 max-w-full overflow-x-hidden">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Merchant Portal Builder</h2>
                            <p className="text-sm text-slate-600">Design and customize your merchant portal</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button 
                                variant="outline"
                                onClick={() => setShowTemplateDialog(true)}
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Templates
                            </Button>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button 
                                onClick={handleSave}
                                disabled={saveConfigMutation.isPending}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                            </Button>
                            {selectedConfig && selectedConfig.status === 'draft' && (
                                <Button
                                    onClick={() => publishMutation.mutate(selectedConfig.id)}
                                    disabled={publishMutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Rocket className="h-4 w-4 mr-2" />
                                    Publish
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Saved Configurations */}
                    {configs.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Saved Configurations</CardTitle>
                                <CardDescription>Load a previously saved configuration</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {configs.map(config => (
                                        <button
                                            key={config.id}
                                            onClick={() => handleLoadConfig(config)}
                                            className={cn(
                                                "p-4 border rounded-lg hover:border-blue-500 transition-all text-left",
                                                selectedConfig?.id === config.id && "border-blue-500 bg-blue-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-sm">{config.portal_name}</p>
                                                <Badge className={
                                                    config.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }>
                                                    {config.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-600">v{config.version}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Builder */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel - Configuration */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="grid grid-cols-4">
                                            <TabsTrigger value="modules">
                                                <Settings className="h-4 w-4" />
                                            </TabsTrigger>
                                            <TabsTrigger value="theme">
                                                <Palette className="h-4 w-4" />
                                            </TabsTrigger>
                                            <TabsTrigger value="layout">
                                                <LayoutIcon className="h-4 w-4" />
                                            </TabsTrigger>
                                            <TabsTrigger value="widgets">
                                                <Grid className="h-4 w-4" />
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="modules" className="mt-4">
                                            <div className="space-y-4">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Module-Driven Portal:</strong> Select which features this merchant portal should include. Menus will auto-generate.
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label>Merchant Tier</Label>
                                                    <div className="flex gap-2 mt-2">
                                                        {['startup', 'growth', 'enterprise', 'vip'].map(tier => (
                                                            <Button
                                                                key={tier}
                                                                variant={portalConfig.merchant_tier === tier ? 'default' : 'outline'}
                                                                onClick={() => setPortalConfig({...portalConfig, merchant_tier: tier})}
                                                                size="sm"
                                                            >
                                                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <ModuleSelector
                                                    selectedModules={portalConfig.enabled_modules}
                                                    subscriptionTier={portalConfig.merchant_tier}
                                                    onChange={(modules) => setPortalConfig({...portalConfig, enabled_modules: modules})}
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="theme" className="mt-4">
                                            <ThemeCustomizer
                                                theme={portalConfig.theme}
                                                onChange={(theme) => setPortalConfig({...portalConfig, theme})}
                                            />
                                        </TabsContent>

                                        <TabsContent value="layout" className="mt-4">
                                            <LayoutEditor
                                                layout={portalConfig.layout}
                                                onChange={(layout) => setPortalConfig({...portalConfig, layout})}
                                            />
                                        </TabsContent>

                                        <TabsContent value="widgets" className="mt-4">
                                            <div className="space-y-4">
                                                <Button
                                                    onClick={() => setShowWidgetDialog(true)}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Widget
                                                </Button>

                                                <div className="space-y-2">
                                                    {portalConfig.dashboard_widgets.map((widget, idx) => {
                                                        const widgetDef = AVAILABLE_WIDGETS[widget.widget_type];
                                                        return (
                                                            <div key={widget.widget_id} className="flex items-center justify-between p-3 border rounded-lg">
                                                                <span className="text-sm">{widgetDef?.name}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newWidgets = [...portalConfig.dashboard_widgets];
                                                                        newWidgets.splice(idx, 1);
                                                                        setPortalConfig({...portalConfig, dashboard_widgets: newWidgets});
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Panel - Preview */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Live Preview</CardTitle>
                                    <CardDescription>See how your portal will look</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div 
                                        className="border rounded-lg p-4 min-h-[600px]"
                                        style={{ 
                                            backgroundColor: '#f8fafc',
                                            fontFamily: portalConfig.theme.font_family
                                        }}
                                    >
                                        {/* Header */}
                                        {portalConfig.layout.header_style !== 'none' && (
                                            <div 
                                                className="h-16 rounded-lg mb-4 flex items-center px-6"
                                                style={{ backgroundColor: portalConfig.theme.primary_color }}
                                            >
                                                <p className="text-white font-semibold">{portalConfig.portal_name}</p>
                                            </div>
                                        )}

                                        {/* Widgets Grid */}
                                        <div className="grid grid-cols-12 gap-4">
                                            {portalConfig.dashboard_widgets.map(widget => {
                                                const WidgetPreview = AVAILABLE_WIDGETS[widget.widget_type]?.preview;
                                                return (
                                                    <div 
                                                        key={widget.widget_id}
                                                        className={`col-span-${widget.position.width || 6}`}
                                                    >
                                                        {WidgetPreview && <WidgetPreview config={widget.config} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Widget Library Dialog */}
                    <Dialog open={showWidgetDialog} onOpenChange={setShowWidgetDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add Widget</DialogTitle>
                            </DialogHeader>
                            <WidgetLibrary onSelectWidget={handleAddWidget} />
                        </DialogContent>
                    </Dialog>

                    {/* Templates Dialog */}
                    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Choose a Portal Template</DialogTitle>
                            </DialogHeader>
                            <PortalTemplates onSelectTemplate={handleLoadTemplate} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}