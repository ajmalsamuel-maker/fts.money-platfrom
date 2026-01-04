import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    TrendingUp,
    Users,
    DollarSign,
    Activity,
    BarChart3,
    Code,
    GitBranch,
    Wallet,
    Briefcase,
    Building2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSAnalytics() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const { data: isoCustomers = [] } = useQuery({
        queryKey: ['iso-customers'],
        queryFn: () => base44.entities.ISOGatewayCustomer.list()
    });

    const { data: orchestrationCustomers = [] } = useQuery({
        queryKey: ['orchestration-customers'],
        queryFn: () => base44.entities.OrchestrationCustomer.list()
    });

    const { data: cryptoCustomers = [] } = useQuery({
        queryKey: ['crypto-customers'],
        queryFn: () => base44.entities.CryptoGatewayCustomer.list()
    });

    const { data: rwaProviders = [] } = useQuery({
        queryKey: ['rwa-providers'],
        queryFn: () => base44.entities.RWAWhiteLabelCustomer.list()
    });

    const volumeData = [
        { month: 'Jan', volume: 2.5 },
        { month: 'Feb', volume: 3.2 },
        { month: 'Mar', volume: 4.1 },
        { month: 'Apr', volume: 3.8 },
        { month: 'May', volume: 5.2 },
        { month: 'Jun', volume: 6.1 }
    ];

    const revenueData = [
        { month: 'Jan', revenue: 45 },
        { month: 'Feb', revenue: 52 },
        { month: 'Mar', revenue: 61 },
        { month: 'Apr', revenue: 58 },
        { month: 'May', revenue: 73 },
        { month: 'Jun', revenue: 82 }
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-screen">{t('common:labels.loading')}</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSAnalytics" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:pages.analytics.title')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:pages.analytics.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher variant="select" showLabel={true} />
                        <div className="text-right">
                            <p className="text-xs text-slate-600">{t('platform:dashboard.loggedInAs')}</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                <div className="grid grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.analytics.allServices')}</p>
                                    <p className="text-2xl font-bold text-blue-600">{psps.length + isoCustomers.length + orchestrationCustomers.length + cryptoCustomers.length + rwaProviders.length}</p>
                                </div>
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.analytics.psp')}</p>
                                    <p className="text-2xl font-bold text-emerald-600">{psps.filter(p => p.status === 'active').length}</p>
                                </div>
                                <Building2 className="h-6 w-6 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.analytics.isoGateway')}</p>
                                    <p className="text-2xl font-bold text-indigo-600">{isoCustomers.filter(c => c.status === 'active').length}</p>
                                </div>
                                <Code className="h-6 w-6 text-indigo-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.analytics.orchestration')}</p>
                                    <p className="text-2xl font-bold text-purple-600">{orchestrationCustomers.filter(c => c.status === 'active').length}</p>
                                </div>
                                <GitBranch className="h-6 w-6 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.analytics.crypto')}</p>
                                    <p className="text-2xl font-bold text-cyan-600">{cryptoCustomers.filter(c => c.status === 'active').length}</p>
                                </div>
                                <Wallet className="h-6 w-6 text-cyan-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.analytics.rwa')}</p>
                                    <p className="text-2xl font-bold text-amber-600">{rwaProviders.filter(p => p.status === 'active').length}</p>
                                </div>
                                <Briefcase className="h-6 w-6 text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.analytics.platformVolume')}</p>
                                    <p className="text-3xl font-bold text-slate-900">$24.9M</p>
                                    <p className="text-xs text-emerald-600 mt-1">+28% {t('common:labels.growth')}</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.analytics.totalRevenue')}</p>
                                    <p className="text-3xl font-bold text-slate-900">$371K</p>
                                    <p className="text-xs text-emerald-600 mt-1">+32% {t('common:labels.growth')}</p>
                                </div>
                                <DollarSign className="h-10 w-10 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.analytics.totalEndUsers')}</p>
                                    <p className="text-3xl font-bold text-slate-900">{psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0)}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t('platform:pages.analytics.acrossAllServices')}</p>
                                </div>
                                <Users className="h-10 w-10 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('platform:pages.analytics.volumeTrend')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('platform:pages.analytics.platformRevenue')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                </div>
            </div>
        </div>
    );
}