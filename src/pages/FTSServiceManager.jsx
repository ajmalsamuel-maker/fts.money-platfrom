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
import { ArrowLeft, RefreshCw, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function FTSServiceManager() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();

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
            toast.success(`Successfully seeded ${data.count} services from NetXHub`);
        },
        onError: (error) => {
            toast.error('Failed to seed services: ' + error.message);
        }
    });

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
                        <h2 className="text-lg font-semibold text-slate-900">NetXHub Service Catalog</h2>
                        <p className="text-xs text-slate-600">Manage granular services available to all PSPs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => seedMutation.mutate()}
                            disabled={seedMutation.isPending}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
                            {seedMutation.isPending ? 'Seeding...' : 'Seed Services from NetXHub'}
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
                            <p className="text-slate-600 mb-4">No services configured yet</p>
                            <Button 
                                onClick={() => seedMutation.mutate()}
                                disabled={seedMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Seed Services from NetXHub
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}