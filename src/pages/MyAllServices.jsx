import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebarOptimized from '@/components/community/CommunityPortalSidebarOptimized';
import Breadcrumbs from '@/components/community/Breadcrumbs';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Building2, Code, GitBranch, Package, ArrowRight, Plus } from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function MyAllServices() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    const { data: myPSPs = [] } = useQuery({
        queryKey: ['my-psp-instances', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ProvisionedPSP.list('-created_date');
            return all.filter(psp => psp.owner_email === session?.email && !psp.is_template);
        },
        enabled: !!session?.email
    });

    const { data: myISOCustomers = [] } = useQuery({
        queryKey: ['my-iso-customers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ISOGatewayCustomer.list('-created_date');
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const { data: myOrchCustomers = [] } = useQuery({
        queryKey: ['my-orch-customers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.OrchestrationCustomer.list('-created_date');
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['my-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list(),
        enabled: !!session?.email
    });

    const totalServices = myPSPs.length + myISOCustomers.length + myOrchCustomers.length;

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebarOptimized currentPage="MyAllServices" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            My Services
                        </h2>
                        <p className="text-xs text-slate-600">{totalServices} active service{totalServices !== 1 ? 's' : ''}</p>
                    </div>
                    <Button 
                        onClick={() => navigate(createPageUrl('LaunchServices'))}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Launch New Service
                    </Button>
                </header>

                <div className="p-6 max-w-7xl mx-auto">
                    <Breadcrumbs currentPage="MyAllServices" />

                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">All Services ({totalServices})</TabsTrigger>
                            <TabsTrigger value="psp">PSP Instances ({myPSPs.length})</TabsTrigger>
                            <TabsTrigger value="iso">ISO Gateway ({myISOCustomers.length})</TabsTrigger>
                            <TabsTrigger value="orch">Orchestration ({myOrchCustomers.length})</TabsTrigger>
                            <TabsTrigger value="marketplace">Marketplace ({subscriptions.length})</TabsTrigger>
                        </TabsList>

                        {/* All Services */}
                        <TabsContent value="all" className="space-y-6">
                            {totalServices === 0 && (
                                <Card className="border-2 border-dashed border-slate-300">
                                    <CardContent className="p-12 text-center">
                                        <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Services Yet</h3>
                                        <p className="text-slate-600 mb-6">Get started by launching your first service</p>
                                        <Button 
                                            onClick={() => navigate(createPageUrl('LaunchServices'))}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-500"
                                        >
                                            Launch Your First Service
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {myPSPs.length > 0 && <PSPList psps={myPSPs} navigate={navigate} />}
                            {myISOCustomers.length > 0 && <ISOList customers={myISOCustomers} navigate={navigate} />}
                            {myOrchCustomers.length > 0 && <OrchList customers={myOrchCustomers} navigate={navigate} />}
                        </TabsContent>

                        {/* PSP Tab */}
                        <TabsContent value="psp">
                            {myPSPs.length === 0 ? (
                                <EmptyState 
                                    icon={Building2}
                                    title="No PSP Instances"
                                    description="Launch a complete payment processing platform"
                                    action={() => navigate(createPageUrl('CommunityPSPProvisioning'))}
                                />
                            ) : (
                                <PSPList psps={myPSPs} navigate={navigate} />
                            )}
                        </TabsContent>

                        {/* ISO Tab */}
                        <TabsContent value="iso">
                            {myISOCustomers.length === 0 ? (
                                <EmptyState 
                                    icon={Code}
                                    title="No ISO Gateway Services"
                                    description="Translate messages between ISO 8583, ISO 20022, and SWIFT MT"
                                    action={() => navigate(createPageUrl('ISOGatewayLogin'))}
                                />
                            ) : (
                                <ISOList customers={myISOCustomers} navigate={navigate} />
                            )}
                        </TabsContent>

                        {/* Orchestration Tab */}
                        <TabsContent value="orch">
                            {myOrchCustomers.length === 0 ? (
                                <EmptyState 
                                    icon={GitBranch}
                                    title="No Orchestration Services"
                                    description="Smart routing for payment and payout optimization"
                                    action={() => navigate(createPageUrl('OrchestrationLogin'))}
                                />
                            ) : (
                                <OrchList customers={myOrchCustomers} navigate={navigate} />
                            )}
                        </TabsContent>

                        {/* Marketplace Subscriptions */}
                        <TabsContent value="marketplace">
                            {subscriptions.length === 0 ? (
                                <EmptyState 
                                    icon={Globe}
                                    title="No Marketplace Subscriptions"
                                    description="Browse 150+ payment services and integrations"
                                    action={() => navigate(createPageUrl('CommunityMarketplace'))}
                                />
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Marketplace Subscriptions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {subscriptions.map((sub) => (
                                                <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{sub.service_name}</p>
                                                        <p className="text-sm text-slate-600">{sub.psp_name}</p>
                                                    </div>
                                                    <Badge className="bg-emerald-100 text-emerald-700">
                                                        {sub.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <ComplianceFooter />
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="p-12 text-center">
                <Icon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 mb-6">{description}</p>
                <Button onClick={action} className="bg-gradient-to-r from-blue-600 to-cyan-500">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}

function PSPList({ psps, navigate }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    PSP Instances
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {psps.map((psp) => (
                        <div key={psp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                >
                                    {psp.psp_code?.substring(0, 2)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{psp.psp_name}</p>
                                    <p className="text-sm text-slate-600">{psp.psp_code} • {psp.tier}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className={cn(
                                    psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                )}>
                                    {psp.status}
                                </Badge>
                                <Button size="sm" onClick={() => navigate(createPageUrl('PSPInstanceConfig', `?id=${psp.id}`))}>
                                    Manage
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ISOList({ customers, navigate }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    ISO Gateway Services
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {customers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <Code className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{customer.company_name}</p>
                                    <p className="text-sm text-slate-600">
                                        {customer.subscription_tier} • {customer.total_messages_processed || 0} messages
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className={cn(
                                    customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                )}>
                                    {customer.status}
                                </Badge>
                                <Button size="sm" onClick={() => navigate(createPageUrl('ISOGatewayLogin'))}>
                                    Access Portal
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function OrchList({ customers, navigate }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-purple-600" />
                    Orchestration Services
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {customers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <GitBranch className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{customer.company_name}</p>
                                    <p className="text-sm text-slate-600">
                                        {customer.subscription_tier} • {customer.total_executions || 0} executions
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className={cn(
                                    customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                )}>
                                    {customer.status}
                                </Badge>
                                <Button size="sm" onClick={() => navigate(createPageUrl('OrchestrationLogin'))}>
                                    Access Portal
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}