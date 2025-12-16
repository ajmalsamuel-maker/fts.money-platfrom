import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, RefreshCw, CheckCircle, Package, DollarSign, Save, CreditCard, Shield, Activity, BarChart3, Code, Zap, Wallet, TrendingUp, Info, Loader2, Plus, FileText, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { AuditLogger } from '@/components/platform/EnhancedAuditLogger';
import ServiceEditor from '@/components/services/ServiceEditor';

const categoryIcons = {
    payment_rail: CreditCard,
    compliance: Shield,
    fraud_detection: Activity,
    analytics: BarChart3,
    developer_tools: Code,
    orchestration: Zap,
    payout: Wallet,
    crypto: TrendingUp
};

export default function FTSServiceManager() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [editedPrices, setEditedPrices] = useState({});
    const [activeTab, setActiveTab] = useState('catalog');
    const [selectedService, setSelectedService] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [updatingCache, setUpdatingCache] = useState(false);
    const [showServiceEditor, setShowServiceEditor] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [runningHealthChecks, setRunningHealthChecks] = useState(false);
    const [generatingDocs, setGeneratingDocs] = useState(false);

    const { data: services = [] } = useQuery({
        queryKey: ['service-catalog'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const { data: cacheData = [], refetch: refetchCache } = useQuery({
        queryKey: ['service-cache'],
        queryFn: () => base44.entities.ServiceCatalogCache.list(),
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const seedMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('seedNetXHubServices', { action: 'seed' });
            return response.data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries(['service-catalog']);
            
            // Log service import to audit trail
            await AuditLogger.logServiceImport(
                data.count,
                data.iso_standards || [],
                { email: platformUser?.email || 'admin@fts.money', platform_role: platformUser?.platform_role || 'platform_admin' },
                { source: 'netxhub' }
            );
            
            // Switch to pricing matrix tab after import
            setActiveTab('pricing');
            
            toast.success(`Successfully imported ${data.count} services from NetXHub - Review pricing matrix`);
        },
        onError: (error) => {
            toast.error('Failed to seed services: ' + error.message);
        }
    });

    const updatePricingMutation = useMutation({
        mutationFn: async (updates) => {
            const promises = updates.map(({ id, base_price, variable_price }) => 
                base44.entities.ServiceCatalog.update(id, { base_price, variable_price })
            );
            await Promise.all(promises);
            return updates;
        },
        onSuccess: async (updates) => {
            queryClient.invalidateQueries(['service-catalog']);
            
            // Log pricing changes
            for (const update of updates) {
                const service = services.find(s => s.id === update.id);
                if (service) {
                    await AuditLogger.logPricingUpdate(
                        service.service_id,
                        service.service_name,
                        service.base_price || 0,
                        update.base_price,
                        { email: platformUser?.email || 'admin@fts.money', platform_role: platformUser?.platform_role || 'platform_admin' }
                    );
                }
            }
            
            setEditedPrices({});
            toast.success('Pricing updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update pricing: ' + error.message);
        }
    });

    const handlePriceChange = (serviceId, field, value) => {
        setEditedPrices(prev => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                [field]: parseFloat(value) || 0
            }
        }));
    };

    const handleSavePricing = () => {
        const updates = Object.entries(editedPrices).map(([serviceId, prices]) => {
            const service = services.find(s => s.id === serviceId);
            return {
                id: serviceId,
                base_price: prices.base_price ?? service.base_price ?? 0,
                variable_price: prices.variable_price ?? service.variable_price ?? 0
            };
        });
        updatePricingMutation.mutate(updates);
    };

    const handleUpdateAllCache = async () => {
        setUpdatingCache(true);
        try {
            const response = await base44.functions.invoke('serviceCatalogUpdateScheduler', {});
            toast.success(`Updated ${response.data.updated} services, ${response.data.failed} failed`);
            refetchCache();
        } catch (error) {
            toast.error('Failed to update cache: ' + error.message);
        } finally {
            setUpdatingCache(false);
        }
    };

    const handleClearCache = async (cacheId) => {
        try {
            await base44.entities.ServiceCatalogCache.delete(cacheId);
            toast.success('Cache entry deleted');
            refetchCache();
        } catch (error) {
            toast.error('Failed to delete cache: ' + error.message);
        }
    };

    const createServiceMutation = useMutation({
        mutationFn: (data) => base44.entities.ServiceCatalog.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-catalog']);
            setShowServiceEditor(false);
            setEditingService(null);
            toast.success('Service created successfully');
        }
    });

    const updateServiceMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ServiceCatalog.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-catalog']);
            setShowServiceEditor(false);
            setEditingService(null);
            toast.success('Service updated successfully');
        }
    });

    const handleServiceSave = (data) => {
        if (editingService) {
            updateServiceMutation.mutate({ id: editingService.id, data });
        } else {
            createServiceMutation.mutate(data);
        }
    };

    const handleRunHealthChecks = async () => {
        setRunningHealthChecks(true);
        try {
            const response = await base44.functions.invoke('serviceHealthCheck', { check_all: true });
            toast.success(`Health check completed for ${response.data.checked} services`);
            queryClient.invalidateQueries(['service-catalog']);
        } catch (error) {
            toast.error('Health check failed: ' + error.message);
        } finally {
            setRunningHealthChecks(false);
        }
    };

    const handleGenerateDocs = async (serviceId) => {
        setGeneratingDocs(true);
        try {
            const response = await base44.functions.invoke('generateServiceDocs', {
                service_id: serviceId || null,
                regenerate_all: !serviceId
            });
            toast.success(response.data.message || 'Documentation generated');
            queryClient.invalidateQueries(['service-catalog']);
        } catch (error) {
            toast.error('Documentation generation failed: ' + error.message);
        } finally {
            setGeneratingDocs(false);
        }
    };

    const handleViewDetails = async (service) => {
        setSelectedService(service);
        setServiceDetails(null);
        setLoadingDetails(true);

        try {
            // Check cache first
            try {
                const cacheResponse = await base44.functions.invoke('serviceCatalogCache', {
                    action: 'get',
                    service_id: service.service_id
                });

                if (cacheResponse.data.success && cacheResponse.data.cached) {
                    // Use cached data immediately
                    setServiceDetails(cacheResponse.data.data);
                    setLoadingDetails(false);
                    return;
                }
            } catch (cacheError) {
                console.log('Cache check failed, fetching fresh data:', cacheError.message);
            }

            // Not cached or cache failed, fetch fresh data
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide a comprehensive, detailed explanation of "${service.service_name}" in the context of payment processing and fintech. Include:

1. What is this service and what problem does it solve?
2. Common use cases and applications in the payment industry
3. Key benefits for Payment Service Providers (PSPs) and merchants
4. Industry standards and compliance requirements associated with this service
5. Real-world examples of how major companies use this service
6. Current trends and recent developments (2024-2025)

**FTS.Money Platform Business Use Cases:**
7. How Payment Service Providers (PSPs) on FTS.Money can use this service for their merchant customers
8. Specific scenarios where PSPs would provision this service to their clients
9. Revenue opportunities and business models for PSPs using this service
10. Integration workflows within the FTS.Money platform ecosystem

Service Category: ${service.service_category}
Service Description: ${service.description}

Context: FTS.Money is a white-label payment platform that provisions isolated PSP instances. Each PSP serves multiple merchants. All services are provisioned and managed by FTS.Money, who then makes them available to PSPs, who in turn offer them to their merchants.

Make the response detailed, authoritative, and include the most recent information available. Format the response in markdown with proper headings, bold text, and bullet points.`,
                add_context_from_internet: true
            });

            setServiceDetails(response);

            // Cache the response for future use (non-blocking)
            try {
                await base44.functions.invoke('serviceCatalogCache', {
                    action: 'set',
                    service_id: service.service_id,
                    service_name: service.service_name,
                    data: response,
                    source_url: 'llm_generated'
                });
            } catch (cacheError) {
                console.log('Failed to cache response:', cacheError.message);
            }

        } catch (error) {
            console.error('Service details error:', error);
            setServiceDetails('Failed to load service details. Please try again.');
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const servicesByCategory = services.reduce((acc, service) => {
        const cat = service.service_category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(service);
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSServiceManager" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">FTS.Money Service Catalog</h2>
                        <p className="text-xs text-slate-600">Services seeded from NetXHub development platform for provisioning to PSP customers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => handleRunHealthChecks()}
                            disabled={runningHealthChecks}
                            variant="outline"
                            className="gap-2"
                        >
                            <Heart className={`h-4 w-4 ${runningHealthChecks ? 'animate-pulse' : ''}`} />
                            {runningHealthChecks ? 'Checking...' : 'Run Health Checks'}
                        </Button>
                        <Button 
                            onClick={() => handleGenerateDocs()}
                            disabled={generatingDocs}
                            variant="outline"
                            className="gap-2"
                        >
                            <FileText className={`h-4 w-4 ${generatingDocs ? 'animate-spin' : ''}`} />
                            {generatingDocs ? 'Generating...' : 'Generate Docs'}
                        </Button>
                        <Button 
                            onClick={() => { setEditingService(null); setShowServiceEditor(true); }}
                            className="gap-2 bg-blue-600"
                        >
                            <Plus className="h-4 w-4" />
                            New Service
                        </Button>
                        <Button 
                            onClick={() => seedMutation.mutate()}
                            disabled={seedMutation.isPending}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
                            Import NetXHub
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing Matrix</TabsTrigger>
                            <TabsTrigger value="health">Health & Monitoring</TabsTrigger>
                            <TabsTrigger value="cache">Cache Management</TabsTrigger>
                        </TabsList>

                        <TabsContent value="catalog" className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Services</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{services.length}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Categories</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{Object.keys(servicesByCategory).length}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Most Common</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">Payment Rails</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Bundles</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">
                                        {services.filter(s => s.is_bundle).length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Health Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-3 h-3 rounded-full ${
                                            services.filter(s => s.health_status === 'healthy').length > services.length * 0.9
                                                ? 'bg-emerald-500'
                                                : 'bg-amber-500'
                                        }`} />
                                        <p className="text-xl font-bold text-slate-900">
                                            {services.filter(s => s.health_status === 'healthy').length}/{services.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Category Navigation */}
                    {services.length > 0 && (
                        <Card className="bg-white border-slate-200 mb-6">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 overflow-x-auto">
                                    {Object.keys(servicesByCategory).map((category) => {
                                        const Icon = categoryIcons[category] || Package;
                                        return (
                                            <a
                                                key={category}
                                                href={`#${category}`}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-colors whitespace-nowrap"
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span className="text-sm font-medium capitalize">{category.replace(/_/g, ' ')}</span>
                                                <Badge variant="outline" className="ml-1 text-xs">
                                                    {servicesByCategory[category].length}
                                                </Badge>
                                            </a>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Services by Category */}
                    <div className="space-y-6">
                        {Object.entries(servicesByCategory).map(([category, categoryServices]) => {
                            const Icon = categoryIcons[category] || Package;
                            return (
                                <Card key={category} id={category} className="bg-white border-slate-200 scroll-mt-6">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="capitalize">{category.replace(/_/g, ' ')}</CardTitle>
                                                <p className="text-xs text-slate-500 mt-1">{categoryServices.length} services available</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                    <div className="grid grid-cols-3 gap-3">
                                       {categoryServices.map((service) => (
                                           <div
                                               key={service.id}
                                               className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                                           >
                                               <div className="flex items-start justify-between mb-2">
                                                   <div className="flex items-center gap-2">
                                                       <p className="font-medium text-sm">{service.service_name}</p>
                                                       {service.is_bundle && (
                                                           <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                               Bundle
                                                           </Badge>
                                                       )}
                                                   </div>
                                                   <div className="flex items-center gap-2">
                                                       <Badge className={
                                                           service.lifecycle_state === 'GA' ? 'bg-emerald-600 text-white text-xs' :
                                                           service.lifecycle_state === 'beta' ? 'bg-blue-600 text-white text-xs' :
                                                           service.lifecycle_state === 'deprecated' ? 'bg-red-600 text-white text-xs' :
                                                           'bg-slate-600 text-white text-xs'
                                                       }>
                                                           {service.lifecycle_state || 'GA'}
                                                       </Badge>
                                                       {service.health_check_enabled && (
                                                           <div className={`w-2 h-2 rounded-full ${
                                                               service.health_status === 'healthy' ? 'bg-emerald-500' :
                                                               service.health_status === 'degraded' ? 'bg-amber-500' :
                                                               service.health_status === 'down' ? 'bg-red-500' :
                                                               'bg-slate-300'
                                                           }`} title={service.health_status || 'unknown'} />
                                                       )}
                                                   </div>
                                               </div>
                                               <p className="text-xs text-slate-600 mb-2">{service.description}</p>
                                               {service.version && (
                                                   <p className="text-xs text-slate-500 mb-3">v{service.version}</p>
                                               )}
                                               {service.dependencies && service.dependencies.length > 0 && (
                                                   <div className="mb-3">
                                                       <p className="text-xs text-slate-500 mb-1">Requires:</p>
                                                       <div className="flex flex-wrap gap-1">
                                                           {service.dependencies.map((dep, i) => (
                                                               <Badge key={i} variant="outline" className="text-xs">
                                                                   {dep.service_name}
                                                               </Badge>
                                                           ))}
                                                       </div>
                                                   </div>
                                               )}
                                               <div className="flex items-center justify-between gap-2">
                                                   <div className="flex gap-2 flex-wrap">
                                                       {service.pricing_model === 'per_transaction' && (
                                                           <Badge variant="outline" className="text-xs">
                                                               {service.variable_price}% per txn
                                                           </Badge>
                                                       )}
                                                       {service.base_price > 0 && (
                                                           <Badge variant="outline" className="text-xs">
                                                               ${service.base_price}/mo
                                                           </Badge>
                                                       )}
                                                       {service.pricing_model === 'fixed' && service.base_price === 0 && (
                                                           <Badge variant="outline" className="text-xs">Free</Badge>
                                                       )}
                                                   </div>
                                                   <div className="flex gap-1">
                                                       <Button
                                                           variant="ghost"
                                                           size="sm"
                                                           onClick={() => handleViewDetails(service)}
                                                           className="h-7 px-2 text-xs"
                                                       >
                                                           <Info className="h-3 w-3 mr-1" />
                                                           Details
                                                       </Button>
                                                   </div>
                                               </div>
                                           </div>
                                       ))}
                                    </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {services.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 mb-4">No services imported yet</p>
                            <p className="text-xs text-slate-500 mb-6">Import services from NetXHub development platform to make them available for PSP provisioning</p>
                            <Button 
                                onClick={() => seedMutation.mutate()}
                                disabled={seedMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Import Services from NetXHub
                            </Button>
                        </div>
                    )}
                        </TabsContent>

                        <TabsContent value="pricing">
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Master Pricing Matrix</CardTitle>
                                            <p className="text-sm text-slate-600 mt-1">Edit pricing for all NetXHub services</p>
                                        </div>
                                        <Button 
                                            onClick={handleSavePricing}
                                            disabled={Object.keys(editedPrices).length === 0 || updatePricingMutation.isPending}
                                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Save className="h-4 w-4" />
                                            {updatePricingMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Service</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Pricing Model</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Base Price ($/mo)</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Variable Price</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {services.map((service) => {
                                                    const currentBase = editedPrices[service.id]?.base_price ?? service.base_price ?? 0;
                                                    const currentVariable = editedPrices[service.id]?.variable_price ?? service.variable_price ?? 0;
                                                    const isEdited = !!editedPrices[service.id];
                                                    
                                                    return (
                                                        <tr key={service.id} className={`border-b border-slate-100 hover:bg-slate-50 ${isEdited ? 'bg-blue-50' : ''}`}>
                                                            <td className="py-3 px-4">
                                                                <p className="font-medium text-slate-900">{service.service_name}</p>
                                                                <p className="text-xs text-slate-500">{service.service_id}</p>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <Badge variant="outline" className="text-xs capitalize">
                                                                    {service.service_category?.replace(/_/g, ' ')}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 px-4 capitalize text-slate-600">
                                                                {service.pricing_model?.replace(/_/g, ' ')}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={currentBase}
                                                                    onChange={(e) => handlePriceChange(service.id, 'base_price', e.target.value)}
                                                                    className="w-24 text-right"
                                                                />
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {service.pricing_model === 'per_transaction' || service.pricing_model === 'tiered' ? (
                                                                    <Input
                                                                        type="number"
                                                                        step="0.001"
                                                                        value={currentVariable}
                                                                        onChange={(e) => handlePriceChange(service.id, 'variable_price', e.target.value)}
                                                                        className="w-24 text-right"
                                                                    />
                                                                ) : (
                                                                    <span className="text-slate-400 text-right block pr-4">N/A</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <Badge className={service.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                                    {service.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {services.length === 0 && (
                                        <div className="text-center py-12">
                                            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-slate-600">No services available for pricing</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="health">
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Service Health & Monitoring</CardTitle>
                                            <p className="text-sm text-slate-600 mt-1">Automated health checks and uptime tracking</p>
                                        </div>
                                        <Button 
                                            onClick={handleRunHealthChecks} 
                                            disabled={runningHealthChecks}
                                            className="gap-2 bg-emerald-600"
                                        >
                                            <Heart className={`h-4 w-4 ${runningHealthChecks ? 'animate-pulse' : ''}`} />
                                            {runningHealthChecks ? 'Running Checks...' : 'Run All Health Checks'}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 px-4 font-semibold">Service</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Version</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Lifecycle</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Health Status</th>
                                                    <th className="text-right py-3 px-4 font-semibold">Uptime (30d)</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Last Check</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Dependencies</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {services.map((service) => (
                                                    <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-3 px-4">
                                                            <div>
                                                                <p className="font-medium text-slate-900">{service.service_name}</p>
                                                                {service.is_bundle && (
                                                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 mt-1">
                                                                        {service.bundle_components?.length || 0} components
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600 text-xs">
                                                            {service.version || '1.0.0'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge className={
                                                                service.lifecycle_state === 'GA' ? 'bg-emerald-100 text-emerald-700' :
                                                                service.lifecycle_state === 'beta' ? 'bg-blue-100 text-blue-700' :
                                                                service.lifecycle_state === 'deprecated' ? 'bg-red-100 text-red-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {service.lifecycle_state || 'GA'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {service.health_check_enabled ? (
                                                                <Badge className={
                                                                    service.health_status === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
                                                                    service.health_status === 'degraded' ? 'bg-amber-100 text-amber-700' :
                                                                    service.health_status === 'down' ? 'bg-red-100 text-red-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                                }>
                                                                    {service.health_status || 'Unknown'}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-slate-400">Disabled</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="font-medium text-slate-900">
                                                                {service.uptime_percentage ? `${service.uptime_percentage.toFixed(2)}%` : 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600 text-xs">
                                                            {service.last_health_check 
                                                                ? new Date(service.last_health_check).toLocaleString()
                                                                : 'Never'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {service.dependencies && service.dependencies.length > 0 ? (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {service.dependencies.length} deps
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-slate-400">None</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="cache">
                            <Card className="bg-white border-slate-200 mb-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Service Information Cache</CardTitle>
                                            <p className="text-sm text-slate-600 mt-1">Cached service details are refreshed monthly automatically</p>
                                        </div>
                                        <Button 
                                            onClick={handleUpdateAllCache}
                                            disabled={updatingCache}
                                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${updatingCache ? 'animate-spin' : ''}`} />
                                            {updatingCache ? 'Updating...' : 'Update All Now'}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <Card className="bg-slate-50 border-slate-200">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-slate-600">Cached Services</p>
                                                <p className="text-2xl font-bold text-slate-900 mt-1">{cacheData.length}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-slate-50 border-slate-200">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-slate-600">Due for Update</p>
                                                <p className="text-2xl font-bold text-orange-600 mt-1">
                                                    {cacheData.filter(c => c.next_check_date && c.next_check_date <= new Date().toISOString().split('T')[0]).length}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-slate-50 border-slate-200">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-slate-600">Avg. Cache Age</p>
                                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                                    {cacheData.length > 0 ? Math.round(
                                                        cacheData.reduce((acc, c) => {
                                                            const days = Math.floor((new Date() - new Date(c.last_fetched)) / (1000 * 60 * 60 * 24));
                                                            return acc + days;
                                                        }, 0) / cacheData.length
                                                    ) : 0} days
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-slate-50 border-slate-200">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-slate-600">Next Auto Update</p>
                                                <p className="text-sm font-bold text-slate-900 mt-1">
                                                    {cacheData.length > 0 && cacheData[0]?.next_check_date 
                                                        ? new Date(cacheData[0].next_check_date).toLocaleDateString() 
                                                        : 'N/A'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Service</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Last Fetched</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Next Check</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Cache Age</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cacheData.map((cache) => {
                                                    const daysOld = Math.floor((new Date() - new Date(cache.last_fetched)) / (1000 * 60 * 60 * 24));
                                                    const needsUpdate = cache.next_check_date && cache.next_check_date <= new Date().toISOString().split('T')[0];
                                                    
                                                    return (
                                                        <tr key={cache.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                            <td className="py-3 px-4">
                                                                <p className="font-medium text-slate-900">{cache.service_name}</p>
                                                                <p className="text-xs text-slate-500">{cache.service_id}</p>
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-600">
                                                                {new Date(cache.last_fetched).toLocaleString()}
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-600">
                                                                {cache.next_check_date ? new Date(cache.next_check_date).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <Badge variant={daysOld > 30 ? 'destructive' : 'outline'}>
                                                                    {daysOld} {daysOld === 1 ? 'day' : 'days'}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <Badge className={needsUpdate ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}>
                                                                    {needsUpdate ? 'Update Due' : 'Fresh'}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleClearCache(cache.id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    Clear
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {cacheData.length === 0 && (
                                            <div className="text-center py-12">
                                                <Activity className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                                <p className="text-slate-600">No cached data yet</p>
                                                <p className="text-xs text-slate-500 mt-1">Service details will be cached as you view them</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Service Details Dialog */}
                    <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {selectedService && (
                                        <>
                                            {React.createElement(categoryIcons[selectedService.service_category] || Package, {
                                                className: "h-5 w-5 text-blue-600"
                                            })}
                                            {selectedService.service_name}
                                        </>
                                    )}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedService?.description}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {selectedService?.auto_generated_docs && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <span className="font-semibold text-blue-900">Auto-Generated Documentation</span>
                                            </div>
                                            {selectedService.docs_last_generated && (
                                                <span className="text-xs text-blue-700">
                                                    Generated: {new Date(selectedService.docs_last_generated).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="prose prose-sm max-w-none mt-3">
                                            <ReactMarkdown className="text-slate-700 leading-relaxed">
                                                {selectedService.auto_generated_docs}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {loadingDetails ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        <p className="ml-3 text-slate-600">Gathering latest information from industry sources...</p>
                                    </div>
                                ) : serviceDetails ? (
                                    <div className="prose prose-sm max-w-none">
                                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-600">Category:</span>
                                                    <Badge variant="outline" className="ml-2 capitalize">
                                                        {selectedService?.service_category?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <span className="text-slate-600">Pricing Model:</span>
                                                    <Badge variant="outline" className="ml-2 capitalize">
                                                        {selectedService?.pricing_model?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t pt-4 mt-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Info className="h-4 w-4 text-slate-600" />
                                                <span className="font-semibold text-slate-900">AI-Enhanced Industry Insights</span>
                                            </div>
                                            <ReactMarkdown className="text-slate-700 leading-relaxed">
                                                {serviceDetails}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Service Editor */}
                    {showServiceEditor && (
                        <ServiceEditor
                            service={editingService}
                            allServices={services}
                            onSave={handleServiceSave}
                            onClose={() => {
                                setShowServiceEditor(false);
                                setEditingService(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}