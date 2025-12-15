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
import { ArrowLeft, RefreshCw, CheckCircle, Package, DollarSign, Save, CreditCard, Shield, Activity, BarChart3, Code, Zap, Wallet, TrendingUp, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuditLogger } from '@/components/platform/EnhancedAuditLogger';

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

    const { data: services = [] } = useQuery({
        queryKey: ['service-catalog'],
        queryFn: () => base44.entities.ServiceCatalog.list()
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

    const handleViewDetails = async (service) => {
        setSelectedService(service);
        setServiceDetails(null);
        setLoadingDetails(true);

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide a comprehensive, detailed explanation of "${service.service_name}" in the context of payment processing and fintech. Include:

1. What is this service and what problem does it solve?
2. Common use cases and applications in the payment industry
3. Key benefits for Payment Service Providers (PSPs) and merchants
4. Industry standards and compliance requirements associated with this service
5. Real-world examples of how major companies use this service
6. Current trends and recent developments (2024-2025)

Service Category: ${service.service_category}
Service Description: ${service.description}

Make the response detailed, authoritative, and include the most recent information available.`,
                add_context_from_internet: true
            });

            setServiceDetails(response);
        } catch (error) {
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
                            onClick={() => seedMutation.mutate()}
                            disabled={seedMutation.isPending}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
                            {seedMutation.isPending ? 'Importing...' : 'Import from NetXHub'}
                        </Button>
                        <Button 
                            onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                            variant="ghost"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing Matrix</TabsTrigger>
                        </TabsList>

                        <TabsContent value="catalog" className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
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
                                    <p className="text-sm text-slate-600">Provider</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">FTS.Money</p>
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
                                                   <p className="font-medium text-sm">{service.service_name}</p>
                                                   <Badge className="bg-emerald-600 text-white text-xs">Active</Badge>
                                               </div>
                                               <p className="text-xs text-slate-600 mb-3">{service.description}</p>
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
                                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {serviceDetails}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}