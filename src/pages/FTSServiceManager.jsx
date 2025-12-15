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
import { ArrowLeft, RefreshCw, CheckCircle, Package, DollarSign, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function FTSServiceManager() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [editedPrices, setEditedPrices] = useState({});

    const { data: services = [] } = useQuery({
        queryKey: ['service-catalog'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const seedMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('seedNetXHubServices', { action: 'seed' });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['service-catalog']);
            toast.success(`Successfully imported ${data.count} services from NetXHub`);
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
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['service-catalog']);
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
                    <Tabs defaultValue="catalog" className="w-full">
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

                    {/* Services by Category */}
                    <div className="space-y-6">
                        {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                            <Card key={category} className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle className="capitalize">{category.replace(/_/g, ' ')}</CardTitle>
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
                                                <div className="flex gap-2">
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
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                </div>
            </div>
        </div>
    );
}