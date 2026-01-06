import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { Building2, Coins, Users, DollarSign, TrendingUp, Activity, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function RWAProviderDashboard() {
    const { provider, loading } = useRWAProviderAuth();
    const { t } = useI18n();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { data: issuers = [] } = useQuery({
        queryKey: ['issuers', provider?.provider_code],
        queryFn: () => base44.entities.AssetIssuer.filter({ provider_code: provider.provider_code }),
        enabled: !!provider
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['assets', provider?.provider_code],
        queryFn: () => base44.entities.RWAAsset.filter({ issuer_lei: provider.provider_code }),
        enabled: !!provider
    });

    const { data: investors = [] } = useQuery({
        queryKey: ['investors', provider?.provider_code],
        queryFn: () => base44.entities.RWAInvestor.list(),
        enabled: !!provider
    });

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const totalAUM = assets.reduce((sum, a) => sum + (a.total_value || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <div className={cn(
                "lg:block",
                sidebarOpen ? "block" : "hidden"
            )}>
                <RWAProviderSidebar 
                    currentPage="RWAProviderDashboard"
                    providerName={provider?.company_name}
                    providerEmail={provider?.email}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>
            
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6 flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-600">Welcome to {provider?.company_name}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Asset Issuers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{issuers.length}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    +{issuers.filter(i => i.status === 'active').length} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Coins className="h-4 w-4" />
                                    Tokenized Assets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{assets.length}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {assets.filter(a => a.status === 'active').length} live
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Total AUM
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${(totalAUM / 1000000).toFixed(1)}M</p>
                                <p className="text-xs text-slate-500 mt-1">Assets under management</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Total Investors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{investors.length}</p>
                                <p className="text-xs text-purple-600 mt-1">Verified accounts</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Asset Issuers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {issuers.slice(0, 5).map(issuer => (
                                    <div key={issuer.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium text-sm">{issuer.company_name}</p>
                                            <p className="text-xs text-slate-500">{issuer.email}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            issuer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {issuer.status}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Assets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {assets.slice(0, 5).map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium text-sm">{asset.name}</p>
                                            <p className="text-xs text-slate-500">{asset.asset_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">${(asset.total_value / 1000000).toFixed(1)}M</p>
                                            <p className="text-xs text-slate-500">{asset.symbol}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}