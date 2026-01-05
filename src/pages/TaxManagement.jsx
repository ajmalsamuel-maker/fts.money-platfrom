import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Tag, Settings, Plus, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import JurisdictionManager from '@/components/tax/JurisdictionManager';
import CategoryManager from '@/components/tax/CategoryManager';
import ServiceVATConfig from '@/components/tax/ServiceVATConfig';
import TaxAnalytics from '@/components/tax/TaxAnalytics';
import InvoiceTemplateManager from '@/components/tax/InvoiceTemplateManager';

export default function TaxManagement() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const queryClient = useQueryClient();

    // Fetch stats
    const { data: jurisdictions = [] } = useQuery({
        queryKey: ['tax-jurisdictions'],
        queryFn: async () => {
            const result = await base44.entities.TaxJurisdiction.list();
            return result || [];
        }
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['tax-categories'],
        queryFn: async () => {
            const result = await base44.entities.TaxCategory.list();
            return result || [];
        }
    });

    const { data: configurations = [] } = useQuery({
        queryKey: ['tax-configurations'],
        queryFn: async () => {
            const result = await base44.entities.TaxConfiguration.list();
            return result || [];
        }
    });

    const activeJurisdictions = jurisdictions.filter(j => j.status === 'active').length;
    const activeCategories = categories.filter(c => c.status === 'active').length;
    const servicesWithVAT = configurations.filter(c => c.vat_enabled).length;

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="TaxManagement" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Global VAT & Tax Management</h1>
                        <p className="text-slate-600 mt-1">Configure VAT/GST/Sales Tax for all services and jurisdictions</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Active Jurisdictions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{activeJurisdictions}</div>
                                <p className="text-xs text-slate-500 mt-1">Countries/States configured</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Tax Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{activeCategories}</div>
                                <p className="text-xs text-slate-500 mt-1">Product/Service categories</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Services with VAT</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{servicesWithVAT}</div>
                                <p className="text-xs text-slate-500 mt-1">VAT enabled</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">System Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">Operational</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="jurisdictions" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="jurisdictions">
                                <Globe className="h-4 w-4 mr-2" />
                                Jurisdictions
                            </TabsTrigger>
                            <TabsTrigger value="categories">
                                <Tag className="h-4 w-4 mr-2" />
                                Categories
                            </TabsTrigger>
                            <TabsTrigger value="services">
                                <Settings className="h-4 w-4 mr-2" />
                                Service Configuration
                            </TabsTrigger>
                            <TabsTrigger value="analytics">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="templates">
                                <FileText className="h-4 w-4 mr-2" />
                                Invoice Templates
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="jurisdictions">
                            <JurisdictionManager jurisdictions={jurisdictions} />
                        </TabsContent>

                        <TabsContent value="categories">
                            <CategoryManager categories={categories} />
                        </TabsContent>

                        <TabsContent value="services">
                            <ServiceVATConfig configurations={configurations} />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <TaxAnalytics />
                        </TabsContent>

                        <TabsContent value="templates">
                            <InvoiceTemplateManager />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}