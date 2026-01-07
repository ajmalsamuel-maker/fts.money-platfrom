import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Code, GitBranch, Wallet, Briefcase, Menu } from 'lucide-react';
import { cn } from "@/lib/utils";
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSRevenue() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
    
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

    const pspRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const isoRevenue = isoCustomers.reduce((sum, c) => sum + (c.monthly_billing || 0), 0);
    const orchestrationRevenue = orchestrationCustomers.reduce((sum, c) => sum + (c.monthly_billing || 0), 0);
    const cryptoRevenue = cryptoCustomers.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0);
    const rwaRevenue = rwaProviders.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    
    const totalRevenue = pspRevenue + isoRevenue + orchestrationRevenue + cryptoRevenue + rwaRevenue;

    if (loading) {
        return <div className="flex items-center justify-center h-screen">{t('common:labels.loading')}</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
            
            <div className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300",
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <FTSPlatformSidebar 
                    currentPage="FTSRevenue" 
                    userRole={getRoleLabel(platformUser?.platform_role)} 
                    userEmail={platformUser?.email}
                    isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
                />
            </div>

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden flex-shrink-0"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">{t('platform:pages.revenue.title')}</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">{t('platform:pages.revenue.subtitle')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <LanguageSwitcher variant="select" showLabel={false} />
                        <div className="text-right hidden lg:block">
                            <p className="text-xs text-slate-600">{t('common:labels.loggedInAs')}</p>
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.revenue.totalMonthlyRevenue')}</p>
                                    <p className="text-3xl font-bold text-slate-900">${(totalRevenue / 1000).toFixed(0)}K</p>
                                    <p className="text-xs text-emerald-600 mt-1">{t('platform:pages.revenue.allServices')}</p>
                                </div>
                                <DollarSign className="h-10 w-10 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.revenue.annualRunRate')}</p>
                                    <p className="text-3xl font-bold text-slate-900">${((totalRevenue * 12) / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-slate-500 mt-1">{t('platform:pages.revenue.projected')}</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.revenue.activeCustomers')}</p>
                                    <p className="text-3xl font-bold text-slate-900">{psps.length + isoCustomers.length + orchestrationCustomers.length + cryptoCustomers.length + rwaProviders.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t('platform:pages.revenue.allPlatforms')}</p>
                                </div>
                                <Calendar className="h-10 w-10 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('common:labels.growth')}</p>
                                    <p className="text-3xl font-bold text-emerald-600">+28%</p>
                                    <p className="text-xs text-slate-500 mt-1">{t('platform:pages.revenue.vsLastMonth')}</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.pspRevenue')}</p>
                                    <p className="text-lg font-bold">${(pspRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <Code className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.isoGateway')}</p>
                                    <p className="text-lg font-bold">${(isoRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <GitBranch className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.orchestration')}</p>
                                    <p className="text-lg font-bold">${(orchestrationRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.cryptoBanking')}</p>
                                    <p className="text-lg font-bold">${(cryptoRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.rwaPlatform')}</p>
                                    <p className="text-lg font-bold">${(rwaRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('platform:pages.revenue.revenueByService')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('platform:pages.revenue.service')}</TableHead>
                                        <TableHead>{t('platform:pages.revenue.customers')}</TableHead>
                                        <TableHead className="text-right">{t('platform:pages.revenue.monthlyRevenue')}</TableHead>
                                        <TableHead className="text-right">{t('platform:pages.revenue.percentTotal')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">{t('platform:pages.revenue.pspPlatform')}</TableCell>
                                        <TableCell>{psps.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(pspRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((pspRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{t('platform:pages.revenue.isoGateway')}</TableCell>
                                        <TableCell>{isoCustomers.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(isoRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((isoRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{t('platform:pages.revenue.orchestration')}</TableCell>
                                        <TableCell>{orchestrationCustomers.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(orchestrationRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((orchestrationRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{t('platform:pages.revenue.cryptoBanking')}</TableCell>
                                        <TableCell>{cryptoCustomers.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(cryptoRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((cryptoRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">{t('platform:pages.revenue.rwaPlatform')}</TableCell>
                                        <TableCell>{rwaProviders.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(rwaRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((rwaRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('platform:pages.revenue.topPSPCustomers')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('platform:pages.revenue.pspName')}</TableHead>
                                        <TableHead>{t('platform:pages.revenue.tier')}</TableHead>
                                        <TableHead className="text-right">{t('platform:pages.revenue.monthlyRevenue')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {psps.slice(0, 8).map((psp) => (
                                        <TableRow key={psp.id}>
                                            <TableCell className="font-medium">{psp.psp_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{psp.tier}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}K</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                </div>
            </div>
        </div>
    );
}