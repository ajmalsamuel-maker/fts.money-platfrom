import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import UnifiedCommandPalette from '@/components/system/UnifiedCommandPalette';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_PERMISSIONS, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { 
    Building2, 
    Plus, 
    TrendingUp, 
    Users, 
    DollarSign, 
    Activity,
    Sparkles,
    Settings,
    BarChart3,
    Shield,
    Zap,
    Globe,
    LogOut,
    Menu,
    Database,
    Wallet,
    Trash2,
    Star,
    Package,
    Cpu,
    HardDrive,
    Cloud,
    GitBranch,
    Rocket,
    ArrowRight,
    CheckCircle2,
    Clock,
    Receipt,
    Trophy
} from 'lucide-react';
import VATMetricsCard from '@/components/dashboard/VATMetricsCard';
import EInvoicingMetricsCard from '@/components/dashboard/EInvoicingMetricsCard';
import RWAMetricsCard from '@/components/dashboard/RWAMetricsCard';
import VASPComplianceCard from '@/components/dashboard/VASPComplianceCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

const quickActions = [
    { icon: Building2, labelKey: 'pspInstances', path: 'PSPProvisioning', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { icon: Zap, labelKey: 'isoGateway', path: 'ISOGatewayTestConsole', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { icon: Package, labelKey: 'serviceCatalog', path: 'FTSServiceManager', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { icon: Database, labelKey: 'providerPool', path: 'FTSProviderPool', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { icon: Wallet, labelKey: 'payoutRoutes', path: 'FTSPayoutRoutes', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { icon: BarChart3, labelKey: 'analytics', path: 'FTSAnalytics', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { icon: DollarSign, labelKey: 'revenue', path: 'FTSRevenue', color: 'bg-pink-50 text-pink-700 border-pink-200' }
];

export default function FTSMoneyPlatform() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showServiceSelector, setShowServiceSelector] = useState(false);
    const { t, language } = useI18n();
    
    // Debug: Log translation test
    console.log('Language:', language);
    console.log('Test translation:', t('platform:dashboard.title'));
    console.log('Test common:', t('common:actions.manage'));
    
    // Debug: Check current language
    console.log('Current language:', language);
    console.log('Dashboard title:', t('platform:dashboard.title'));

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: routes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list()
    });

    const { data: cloudConnectors = [] } = useQuery({
        queryKey: ['cloud-connectors'],
        queryFn: () => base44.entities.CloudConnector.list()
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['recent-transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 1000),
        refetchInterval: 5000
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

    const { data: rwaCustomers = [] } = useQuery({
        queryKey: ['rwa-customers'],
        queryFn: () => base44.entities.RWAWhiteLabelCustomer.list()
    });

    const { data: loyaltyPrograms = [] } = useQuery({
        queryKey: ['loyalty-programs'],
        queryFn: () => base44.entities.LoyaltyProgram.list()
    });

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => base44.entities.Invoice.list()
    });
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>{t('common:labels.loading')}</p>
                </div>
            </div>
        );
    }

    const totalVolume = psps.reduce((sum, p) => sum + (Number(p.monthly_volume) || 0), 0);
    const totalRevenue = psps.reduce((sum, p) => sum + (Number(p.monthly_revenue) || 0), 0);
    const totalMerchants = psps.reduce((sum, p) => sum + (Number(p.total_merchants) || 0), 0);
    const activePSPs = psps.filter(p => p.status === 'active').length;

    // Calculate TPS from recent transactions (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentTxns = transactions.filter(t => new Date(t.created_date) > fiveMinutesAgo);
    const tps = (recentTxns.length / 300).toFixed(2); // 300 seconds = 5 minutes

    // Cloud resource aggregation
    const cloudStats = cloudConnectors.reduce((acc, connector) => {
        if (connector.status === 'active') {
            acc.activeRegions.add(connector.region || 'Unknown');
            acc.providers.add(connector.provider_name || 'Unknown');
            acc.totalInstances += connector.active_instances || 0;
            acc.totalCPU += connector.cpu_allocated || 0;
            acc.totalMemory += connector.memory_allocated_gb || 0;
            acc.totalStorage += connector.storage_allocated_gb || 0;
        }
        return acc;
    }, { activeRegions: new Set(), providers: new Set(), totalInstances: 0, totalCPU: 0, totalMemory: 0, totalStorage: 0 });

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <FTSPlatformSidebar 
                currentPage="FTSMoneyPlatform" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
                mobileMenuOpen={mobileSidebarOpen}
                setMobileMenuOpen={setMobileSidebarOpen}
            />
            <UnifiedCommandPalette 
                open={commandPaletteOpen} 
                onOpenChange={setCommandPaletteOpen}
                portalType="platform"
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-slate-50">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10" style={{ height: '64px' }}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-slate-900 truncate">{t('platform:dashboard.title')}</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">{t('platform:dashboard.subtitle')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <LanguageSwitcher variant="select" showLabel={false} />
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCommandPaletteOpen(true)}
                            className="gap-2 text-slate-600 hidden md:flex"
                        >
                            <span className="text-xs">{t('platform:dashboard.search')}</span>
                            <Badge variant="secondary" className="text-xs">⌘K</Badge>
                        </Button>
                        <div className="text-right mr-2 hidden lg:block">
                            <p className="text-xs text-slate-600">{t('platform:dashboard.loggedInAs')}</p>
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{platformUser?.email}</p>
                        </div>
                        <Button 
                            onClick={() => setShowServiceSelector(true)}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            {t('platform:addService')}
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    {/* Services Overview */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('platform:services.title')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {/* PSP Service */}
                            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-900 text-sm truncate">{t('platform:services.psp')}</p>
                                            <Badge variant="outline" className="text-xs">
                                                {psps.filter(p => p.status === 'active').length} {t('platform:dashboard.active')}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.total')} {t('common:labels.instances')}</span>
                                            <span className="font-semibold">{psps.length}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.merchants')}</span>
                                            <span className="font-semibold">{totalMerchants}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 text-xs h-7" onClick={() => window.location.href = createPageUrl('PSPProvisioning')}>
                                            {t('common:actions.manage')}
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.location.href = createPageUrl('PSPProvisioningWizard')}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ISO Gateway */}
                            <Card className="border-2 border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all group">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                            <Zap className="h-5 w-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{t('platform:services.iso')}</p>
                                            <Badge variant="outline" className="text-xs">
                                                {isoCustomers.filter(c => c.status === 'active').length} {t('platform:dashboard.active')}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.customers')}</span>
                                            <span className="font-semibold">{isoCustomers.length}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.service')}</span>
                                            <span className="font-semibold text-emerald-600">{t('common:status.live')}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 text-xs h-7 bg-violet-600 hover:bg-violet-700" onClick={() => window.location.href = createPageUrl('ISOGatewayCustomers')}>
                                            {t('common:actions.manage')}
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.location.href = createPageUrl('ISOGatewayTestConsole')}>
                                            {t('common:actions.test')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Orchestration */}
                            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all group">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <GitBranch className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{t('platform:services.orchestration')}</p>
                                            <Badge variant="outline" className="text-xs">
                                                {orchestrationCustomers.filter(c => c.status === 'active').length} {t('platform:dashboard.active')}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.customers')}</span>
                                            <span className="font-semibold">{orchestrationCustomers.length}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.service')}</span>
                                            <span className="font-semibold text-emerald-600">{t('common:status.live')}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 text-xs h-7 bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = createPageUrl('OrchestrationCustomers')}>
                                            {t('common:actions.manage')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Crypto Banking */}
                            <Card className="border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg transition-all group">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                                            <Wallet className="h-5 w-5 text-cyan-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{t('platform:services.crypto')}</p>
                                            <Badge variant="outline" className="text-xs">
                                                {cryptoCustomers.filter(c => c.status === 'active').length} {t('platform:dashboard.active')}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.customers')}</span>
                                            <span className="font-semibold">{cryptoCustomers.length}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">{t('common:labels.service')}</span>
                                            <span className="font-semibold text-emerald-600">{t('common:status.live')}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 text-xs h-7 bg-cyan-600 hover:bg-cyan-700" onClick={() => window.location.href = createPageUrl('CryptoGatewayCustomers')}>
                                            {t('common:actions.manage')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* RWA Platform */}
                             <Card className="border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all group">
                                 <CardContent className="p-4">
                                     <div className="flex items-center gap-2 mb-3">
                                         <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                             <Rocket className="h-5 w-5 text-emerald-600" />
                                         </div>
                                         <div>
                                             <p className="font-semibold text-slate-900 text-sm">{t('platform:services.rwa')}</p>
                                             <Badge variant="outline" className="text-xs">
                                                 {rwaCustomers.filter(c => c.status === 'active').length} {t('platform:dashboard.active')}
                                             </Badge>
                                         </div>
                                     </div>
                                     <div className="space-y-2 mb-3">
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-600">{t('common:labels.customers')}</span>
                                             <span className="font-semibold">{rwaCustomers.length}</span>
                                         </div>
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-600">AUM</span>
                                             <span className="font-semibold">${(rwaCustomers.reduce((sum, c) => sum + (c.total_value_locked || 0), 0) / 1000000).toFixed(1)}M</span>
                                         </div>
                                     </div>
                                     <div className="flex gap-2">
                                         <Button size="sm" className="flex-1 text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = createPageUrl('RWAWhiteLabelProvisioning')}>
                                             {t('common:actions.manage')}
                                         </Button>
                                         <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.location.href = createPageUrl('RWAPlatform')}>
                                             {t('platform:pages.dashboard.contracts')}
                                         </Button>
                                     </div>
                                 </CardContent>
                             </Card>

                             {/* E-Invoicing VAT/TAX Management */}
                             <Card className="border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all group">
                                 <CardContent className="p-4">
                                     <div className="flex items-center gap-2 mb-3">
                                         <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                             <Receipt className="h-5 w-5 text-orange-600" />
                                         </div>
                                         <div>
                                             <p className="font-semibold text-slate-900 text-sm">E-Invoicing & VAT</p>
                                             <Badge variant="outline" className="text-xs">
                                                 {invoices.filter(i => i.status === 'submitted').length} Pending
                                             </Badge>
                                         </div>
                                     </div>
                                     <div className="space-y-2 mb-3">
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-600">Invoices</span>
                                             <span className="font-semibold">{invoices.length}</span>
                                         </div>
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-600">Service</span>
                                             <span className="font-semibold text-emerald-600">Live</span>
                                         </div>
                                     </div>
                                     <Button size="sm" className="w-full text-xs h-7 bg-orange-600 hover:bg-orange-700" onClick={() => window.location.href = createPageUrl('TaxManagement')}>
                                         {t('common:actions.manage')}
                                     </Button>
                                 </CardContent>
                             </Card>

                             {/* Impact Loyalty Program */}
                             <Card className="border-2 border-rose-200 hover:border-rose-400 hover:shadow-lg transition-all group">
                                 <CardContent className="p-4">
                                     <div className="flex items-center gap-2 mb-3">
                                         <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                             <Trophy className="h-5 w-5 text-rose-600" />
                                         </div>
                                         <div>
                                             <p className="font-semibold text-slate-900 text-sm">Impact Loyalty</p>
                                             <Badge variant="outline" className="text-xs">
                                                 {loyaltyPrograms.filter(p => p.status === 'active').length} {t('platform:dashboard.active')}
                                             </Badge>
                                         </div>
                                     </div>
                                     <div className="space-y-2 mb-3">
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-600">Programs</span>
                                             <span className="font-semibold">{loyaltyPrograms.length}</span>
                                         </div>
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-600">Total Participants</span>
                                             <span className="font-semibold">{loyaltyPrograms.reduce((sum, p) => sum + (p.total_participants || 0), 0).toLocaleString()}</span>
                                         </div>
                                     </div>
                                     <Button size="sm" className="w-full text-xs h-7 bg-rose-600 hover:bg-rose-700" onClick={() => window.location.href = createPageUrl('LoyaltyPlatformDashboard')}>
                                         {t('common:actions.manage')}
                                     </Button>
                                 </CardContent>
                             </Card>
                            </div>
                            </div>

                    {/* Quick Actions */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('platform:quickActions')}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.path}
                                        onClick={() => window.location.href = createPageUrl(action.path)}
                                        className={cn(
                                            "p-4 rounded-lg border-2 hover:shadow-md transition-all text-left",
                                            action.color
                                        )}
                                    >
                                        <Icon className="h-6 w-6 mb-2 flex-shrink-0" />
                                        <p className="text-sm font-medium truncate">{t(`platform:quickActionItems.${action.labelKey}`)}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Platform Performance Metrics */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-900">{t('platform:performance')}</h3>
                            <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {t('platform:pages.dashboard.simulationMode')}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <Activity className="h-6 w-6 opacity-80" />
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    </div>
                                    <p className="text-xs text-emerald-100 mb-1">{t('platform:performanceCards.platformTPS')}</p>
                                    <p className="text-2xl font-bold">{tps}</p>
                                    <p className="text-xs text-emerald-100 mt-1">{t('platform:performanceCards.transactionsPerSec')}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-4">
                                    <Cloud className="h-6 w-6 opacity-80 mb-1" />
                                    <p className="text-xs text-blue-100 mb-1">{t('platform:performanceCards.cloudInstances')}</p>
                                    <p className="text-2xl font-bold">{cloudStats.totalInstances}</p>
                                    <p className="text-xs text-blue-100 mt-1">{cloudStats.activeRegions.size} {t('platform:performanceCards.regions')}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <CardContent className="p-4">
                                    <Cpu className="h-6 w-6 opacity-80 mb-1" />
                                    <p className="text-xs text-purple-100 mb-1">{t('platform:performanceCards.cpuCores')}</p>
                                    <p className="text-2xl font-bold">{cloudStats.totalCPU}</p>
                                    <p className="text-xs text-purple-100 mt-1">{cloudStats.totalMemory} {t('platform:performanceCards.ram')}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                                <CardContent className="p-4">
                                    <HardDrive className="h-6 w-6 opacity-80 mb-1" />
                                    <p className="text-xs text-amber-100 mb-1">{t('platform:performanceCards.storage')}</p>
                                    <p className="text-2xl font-bold">{(cloudStats.totalStorage / 1024).toFixed(1)}</p>
                                    <p className="text-xs text-amber-100 mt-1">{t('platform:performanceCards.tbAllocated')}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* New Services Metrics: VAT, E-Invoicing, RWA, VASP */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Service Metrics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <VATMetricsCard />
                            <EInvoicingMetricsCard />
                            <RWAMetricsCard />
                            <VASPComplianceCard />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-slate-600 truncate">{t('platform:stats.pspInstances')}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{psps.length}</p>
                                        <p className="text-xs text-emerald-600 mt-1 truncate">{activePSPs} {t('platform:dashboard.active')}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">{t('platform:stats.totalMerchants')}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalMerchants.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">{t('platform:pages.dashboard.acrossAllPSPs')}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">{t('platform:stats.paymentProviders')}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{providers.length}</p>
                                        <p className="text-xs text-slate-500 mt-1">{t('platform:pages.dashboard.inProviderPool')}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                                        <Database className="h-6 w-6 text-cyan-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">{t('platform:stats.payoutRoutes')}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{routes.length}</p>
                                        <p className="text-xs text-slate-500 mt-1">{t('platform:pages.dashboard.availableMethods')}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Wallet className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">{t('platform:stats.platformRevenue')}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${(totalRevenue / 1000).toFixed(0)}k</p>
                                        <p className="text-xs text-emerald-600 mt-1">+15.3% {t('platform:pages.dashboard.mom')}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PSP Cards Grid */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('platform:activePSPs')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {psps.map((psp) => {
                                const isTemplate = psp.is_template;
                                
                                return (
                                    <Card 
                                        key={psp.id} 
                                        className={cn(
                                            "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group relative",
                                            isTemplate && "border-amber-300 bg-amber-50/30"
                                        )}
                                    >
                                        <CardContent className="p-4">
                                            {isTemplate && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
                                                        <Star className="h-3 w-3" />
                                                        {t('platform:pages.dashboard.template')}
                                                    </Badge>
                                                </div>
                                            )}
                                            
                                            <div 
                                                className="flex items-start justify-between mb-3 cursor-pointer"
                                                onClick={() => window.location.href = createPageUrl('PSPInstanceConfig') + `?id=${psp.id}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                        style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                                    >
                                                        {psp.psp_code?.substring(0, 2)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-slate-900 truncate">{psp.psp_name}</p>
                                                        <p className="text-xs text-slate-500 font-mono truncate">{psp.psp_code}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                <div>
                                                    <p className="text-slate-500 text-xs">{t('common:labels.merchants')}</p>
                                                    <p className="text-slate-900 font-semibold">{psp.total_merchants || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs">{t('common:labels.volume')}</p>
                                                    <p className="text-slate-900 font-semibold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                                </div>
                                            </div>
                                            
                                            {!isTemplate && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const action = psp.status === 'active' ? 'suspend' : 'activate';
                                                            const newStatus = psp.status === 'active' ? 'suspended' : 'active';
                                                            const confirmMsg = action === 'suspend' 
                                                                ? `${t('platform:pages.dashboard.suspend')} ${psp.psp_name}?`
                                                                : `${t('platform:pages.dashboard.activate')} ${psp.psp_name}?`;
                                                            if (confirm(confirmMsg)) {
                                                                await base44.entities.ApprovalRequest.create({
                                                                    request_type: 'psp_status_change',
                                                                    entity_type: 'ProvisionedPSP',
                                                                    entity_id: psp.id,
                                                                    entity_data: psp,
                                                                    action_data: { new_status: newStatus },
                                                                    submitted_by: platformUser?.email || 'admin@fts.money',
                                                                    submitted_by_name: platformUser?.email || 'Admin',
                                                                    priority: 'high'
                                                                });
                                                                alert(t('platform:pages.dashboard.statusChangeSubmitted'));
                                                            }
                                                        }}
                                                    >
                                                        {psp.status === 'active' ? `⏸ ${t('platform:pages.dashboard.suspend')}` : `▶ ${t('platform:pages.dashboard.activate')}`}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`${t('platform:pages.dashboard.delete')} ${psp.psp_name}? ${t('platform:pages.dashboard.cannotUndo')}`)) {
                                                                await base44.entities.ApprovalRequest.create({
                                                                    request_type: 'psp_deletion',
                                                                    entity_type: 'ProvisionedPSP',
                                                                    entity_id: psp.id,
                                                                    entity_data: psp,
                                                                    submitted_by: platformUser?.email || 'admin@fts.money',
                                                                    submitted_by_name: platformUser?.email || 'Admin',
                                                                    priority: 'urgent'
                                                                });
                                                                alert(t('platform:pages.dashboard.deletionSubmitted'));
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t('platform:pages.dashboard.delete')}
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            {isTemplate && (
                                                <div className="text-xs text-amber-700 text-center pt-2 border-t border-amber-200">
                                                    {t('platform:pages.dashboard.protectedTemplate')}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            
                            {psps.length === 0 && (
                                <div className="col-span-3 text-center py-12">
                                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">{t('platform:pages.pspProvisioning.noPSPs')}</p>
                                    <Button onClick={() => window.location.href = createPageUrl('PSPProvisioningWizard')} className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('platform:pages.pspProvisioning.provisionFirst')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Service Selector Dialog */}
                <Dialog open={showServiceSelector} onOpenChange={setShowServiceSelector}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Add New Service</DialogTitle>
                            <DialogDescription>
                                Choose the type of service you want to add to the FTS.Money platform
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid md:grid-cols-3 gap-4 py-4">
                            <Card 
                                className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                                onClick={() => {
                                    setShowServiceSelector(false);
                                    navigate(createPageUrl('PSPProvisioningWizard'));
                                }}
                            >
                                <CardContent className="p-6">
                                    <Building2 className="h-8 w-8 text-blue-600 mb-3" />
                                    <h3 className="font-semibold mb-2">PSP Instance</h3>
                                    <p className="text-sm text-slate-600">Complete payment service provider platform with merchant portal</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:border-violet-500 hover:shadow-lg transition-all"
                                onClick={() => {
                                    setShowServiceSelector(false);
                                    navigate(createPageUrl('ISOGatewayCustomers'));
                                }}
                            >
                                <CardContent className="p-6">
                                    <Zap className="h-8 w-8 text-violet-600 mb-3" />
                                    <h3 className="font-semibold mb-2">ISO Gateway</h3>
                                    <p className="text-sm text-slate-600">Message translation for ISO 8583 and ISO 20022</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all"
                                onClick={() => {
                                    setShowServiceSelector(false);
                                    navigate(createPageUrl('OrchestrationCustomers'));
                                }}
                            >
                                <CardContent className="p-6">
                                    <GitBranch className="h-8 w-8 text-purple-600 mb-3" />
                                    <h3 className="font-semibold mb-2">Orchestration</h3>
                                    <p className="text-sm text-slate-600">Smart payment routing and optimization</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:border-cyan-500 hover:shadow-lg transition-all"
                                onClick={() => {
                                    setShowServiceSelector(false);
                                    navigate(createPageUrl('CryptoGatewayCustomers'));
                                }}
                            >
                                <CardContent className="p-6">
                                    <Wallet className="h-8 w-8 text-cyan-600 mb-3" />
                                    <h3 className="font-semibold mb-2">Crypto Gateway</h3>
                                    <p className="text-sm text-slate-600">Cryptocurrency payment processing and VASP compliance</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all"
                                onClick={() => {
                                    setShowServiceSelector(false);
                                    navigate(createPageUrl('RWAWhiteLabelProvisioning'));
                                }}
                            >
                                <CardContent className="p-6">
                                    <Rocket className="h-8 w-8 text-emerald-600 mb-3" />
                                    <h3 className="font-semibold mb-2">RWA Platform</h3>
                                    <p className="text-sm text-slate-600">Real-World Asset tokenization infrastructure</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all"
                                onClick={() => {
                                    setShowServiceSelector(false);
                                    navigate(createPageUrl('FTSServiceManager'));
                                }}
                            >
                                <CardContent className="p-6">
                                    <Package className="h-8 w-8 text-indigo-600 mb-3" />
                                    <h3 className="font-semibold mb-2">Payment Service</h3>
                                    <p className="text-sm text-slate-600">Add payment APIs and integrations to the catalog</p>
                                </CardContent>
                            </Card>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}