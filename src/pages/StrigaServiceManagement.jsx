import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Wallet, CreditCard, ArrowLeftRight, Building2, Users, 
    TrendingUp, AlertCircle, CheckCircle2, Clock, ExternalLink 
} from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function StrigaServiceManagement() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const { t } = useI18n();
    const [selectedTab, setSelectedTab] = useState('overview');

    // Fetch Crypto Gateway subscriptions
    const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
        queryKey: ['crypto-gateway-subscriptions'],
        queryFn: async () => {
            const subs = await base44.asServiceRole.entities.PSPServiceSubscription.filter({
                service_name: { $regex: 'FTS.Money Crypto|FTS.Money Lightning' }
            });
            return subs || [];
        }
    });

    // Fetch Crypto Gateway service catalog entries
    const { data: cryptoServices = [], isLoading: servicesLoading } = useQuery({
        queryKey: ['crypto-gateway-services'],
        queryFn: async () => {
            const services = await base44.asServiceRole.entities.ServiceCatalog.filter({
                service_category: { $in: ['crypto_banking', 'crypto_payment'] },
                provider_name: 'FTS.Money'
            });
            return services || [];
        }
    });

    if (authLoading || subsLoading || servicesLoading) {
        return (
            <div className="flex h-screen">
                <FTSPlatformSidebar currentPage="StrigaServiceManagement" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-slate-500">Loading Crypto Gateway data...</div>
                </div>
            </div>
        );
    }

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.monthly_cost || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="StrigaServiceManagement"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">FTS.Money Crypto Gateway</h1>
                                <p className="text-slate-600">Enterprise Crypto Banking Infrastructure</p>
                            </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            White-Label Ready
                        </Badge>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-600">Active Subscriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{activeSubscriptions}</div>
                                <p className="text-xs text-slate-500 mt-1">PSPs using Striga</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-600">Monthly Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    ${totalRevenue.toLocaleString()}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">From Crypto Gateway</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-600">Available Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{cryptoServices.length}</div>
                                <p className="text-xs text-slate-500 mt-1">In marketplace</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-600">Integration Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <span className="text-lg font-semibold text-slate-900">Active</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">API connected</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                            <TabsTrigger value="services">Services</TabsTrigger>
                            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Crypto Gateway Capabilities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>FTS.Money Crypto Gateway</CardTitle>
                                    <CardDescription>White-labeled crypto banking infrastructure for your PSPs</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-slate-200 rounded-lg">
                                        <Wallet className="w-8 h-8 text-blue-600 mb-3" />
                                        <h3 className="font-semibold mb-2">Crypto Wallets</h3>
                                        <p className="text-sm text-slate-600">
                                            Multi-chain custody (BTC, ETH, USDC) with Lightning Network support
                                        </p>
                                    </div>

                                    <div className="p-4 border border-slate-200 rounded-lg">
                                        <Building2 className="w-8 h-8 text-cyan-600 mb-3" />
                                        <h3 className="font-semibold mb-2">Virtual IBANs</h3>
                                        <p className="text-sm text-slate-600">
                                            Named SEPA accounts for each user with instant transfers
                                        </p>
                                    </div>

                                    <div className="p-4 border border-slate-200 rounded-lg">
                                        <CreditCard className="w-8 h-8 text-purple-600 mb-3" />
                                        <h3 className="font-semibold mb-2">Card Issuing</h3>
                                        <p className="text-sm text-slate-600">
                                            Virtual and physical cards backed by crypto/fiat
                                        </p>
                                    </div>

                                    <div className="p-4 border border-slate-200 rounded-lg">
                                        <ArrowLeftRight className="w-8 h-8 text-green-600 mb-3" />
                                        <h3 className="font-semibold mb-2">On/Off-Ramps</h3>
                                        <p className="text-sm text-slate-600">
                                            Seamless crypto ↔ fiat conversion with competitive rates
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View FTS Crypto Dashboard
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        API Documentation
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="w-4 h-4 mr-2" />
                                        Test Integration
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        White-Label Configuration
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="subscriptions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Crypto Gateway Subscriptions</CardTitle>
                                    <CardDescription>PSPs using FTS.Money Crypto Gateway</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {subscriptions.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            No active subscriptions yet
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {subscriptions.map((sub) => (
                                                <div key={sub.id} className="p-4 border border-slate-200 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="font-semibold">{sub.psp_name || 'PSP'}</div>
                                                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                                            {sub.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-slate-600">
                                                        Service: {sub.service_name}
                                                    </div>
                                                    <div className="text-sm text-slate-600">
                                                        Monthly: ${sub.monthly_cost?.toLocaleString() || 0}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="services">
                            <div className="space-y-4">
                                {cryptoServices.map((service) => (
                                    <Card key={service.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle>{service.name}</CardTitle>
                                                    <CardDescription>{service.description}</CardDescription>
                                                </div>
                                                <Badge>{service.category}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <div className="text-sm text-slate-600">Base Price</div>
                                                    <div className="text-lg font-semibold">
                                                        ${service.base_price}/month
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-slate-600">Setup Time</div>
                                                    <div className="text-lg font-semibold">
                                                        {service.setup_time_days} days
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <div className="text-sm font-medium mb-2">Features:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {service.features?.slice(0, 4).map((feature, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <Button size="sm" variant="outline">
                                                View Details
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="setup">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Integration Setup Guide</CardTitle>
                                    <CardDescription>How to enable FTS Crypto Gateway for your PSPs</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-600 font-semibold">1</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">Verify API Credentials</h3>
                                                <p className="text-sm text-slate-600">
                                                    Striga API credentials are configured in platform secrets
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-green-600">API Key configured</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-600 font-semibold">2</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">Add to Service Marketplace</h3>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    Run the seed function to add FTS Crypto Gateway to marketplace
                                                </p>
                                                <Button size="sm">Run Seed Function</Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-600 font-semibold">3</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">PSPs Enable Service</h3>
                                                <p className="text-sm text-slate-600">
                                                    PSPs can now enable Crypto Gateway and optionally white-label it
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-600 font-semibold">4</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">Monitor Usage</h3>
                                                <p className="text-sm text-slate-600">
                                                    Track subscriptions, usage, and revenue from this dashboard
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-blue-900 mb-1">Documentation</h4>
                                                <p className="text-sm text-blue-800">
                                                    Full integration docs: <a href="https://docs.fts.money/crypto-gateway" className="underline">docs.fts.money/crypto-gateway</a>
                                                </p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Internal: Infrastructure powered by Striga/Lightspark
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}