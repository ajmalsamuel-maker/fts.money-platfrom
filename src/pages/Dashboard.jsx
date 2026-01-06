import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import UnifiedCommandPalette from '@/components/system/UnifiedCommandPalette';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import TransactionTable from '@/components/dashboard/TransactionTable';
import VolumeChart from '@/components/dashboard/VolumeChart';
import SuccessRateChart from '@/components/dashboard/SuccessRateChart';
import TopMerchants from '@/components/dashboard/TopMerchants';
import PaymentMethodsChart from '@/components/dashboard/PaymentMethodsChart';
import TPSCounter from '@/components/dashboard/TPSCounter';
import RiskAlertsCard from '@/components/dashboard/RiskAlertsCard';
import ExchangeRates from '@/components/dashboard/ExchangeRates';
import BusinessMetrics from '@/components/dashboard/BusinessMetrics';
import HelpPanel from '@/components/dashboard/HelpPanel';

import RecurringRevenueCard from '@/components/dashboard/RecurringRevenueCard';
import AIPerformanceCard from '@/components/dashboard/AIPerformanceCard';
import SubscriptionHealthCard from '@/components/dashboard/SubscriptionHealthCard';
import CryptoAnalyticsCard from '@/components/dashboard/CryptoAnalyticsCard';
import VATMetricsCard from '@/components/dashboard/VATMetricsCard';
import EInvoicingMetricsCard from '@/components/dashboard/EInvoicingMetricsCard';
import RWAMetricsCard from '@/components/dashboard/RWAMetricsCard';
import VASPComplianceCard from '@/components/dashboard/VASPComplianceCard';

// Suppress MetaMask connection errors if wallet not installed
if (typeof window !== 'undefined' && !window.ethereum) {
    const originalConsoleInfo = console.info;
    console.info = (...args) => {
        if (args[0]?.includes?.('MetaMask')) return;
        originalConsoleInfo.apply(console, args);
    };
}
import { 
    DollarSign, 
    ArrowLeftRight, 
    TrendingUp, 
    Store,
    RefreshCw,
    HelpCircle,
    Coins,
    Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from '@/components/i18n/I18nextProvider';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const { t, language } = useI18n();

    // Get current PSP session - CRITICAL: Each PSP must be completely isolated
    const [userPspCode, setUserPspCode] = useState(null);
    const [isReady, setIsReady] = useState(false);

    React.useEffect(() => {
        console.log('📊 Dashboard: Checking for session...');
        const sessionData = localStorage.getItem('staff_session');
        console.log('📊 Dashboard: Session found:', !!sessionData);
        
        if (!sessionData) {
            console.log('📊 Dashboard: No session, redirecting to PSPLogin...');
            navigate('/PSPLogin');
            return;
        }
        
        try {
            const session = JSON.parse(sessionData);
            console.log('📊 Dashboard: Session parsed:', session);
            
            if (session?.psp_code) {
                console.log('📊 Dashboard: Valid PSP code:', session.psp_code);
                setUserPspCode(session.psp_code);
                setIsReady(true);
            } else {
                console.log('📊 Dashboard: No PSP code in session, redirecting...');
                localStorage.removeItem('staff_session');
                navigate('/PSPLogin');
            }
        } catch (err) {
            console.error('📊 Dashboard: Session parse error:', err);
            localStorage.removeItem('staff_session');
            navigate('/PSPLogin');
        }
    }, [navigate]);

    // Fetch data from isolated PSP schema (PCI Level 1 & GDPR compliant)
    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions', userPspCode],
        queryFn: async () => {
            console.log('🔍 FETCHING TRANSACTIONS with PSP Code:', userPspCode);
            const response = await base44.functions.invoke('pspData', {
                action: 'listTransactions',
                psp_code: userPspCode,
                limit: 10
            });
            console.log('📊 Transactions response:', response.data);
            return response.data.data || [];
        },
        enabled: !!userPspCode
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants', userPspCode],
        queryFn: async () => {
            console.log('🔍 FETCHING MERCHANTS with PSP Code:', userPspCode);
            const response = await base44.functions.invoke('pspData', {
                action: 'listMerchants',
                psp_code: userPspCode
            });
            console.log('🏪 Merchants response:', response.data);
            return response.data.data || [];
        },
        enabled: !!userPspCode
    });

    // Separate crypto and fiat transactions
    const cryptoTransactions = transactions.filter(t => t.crypto_asset || t.payment_method === 'crypto_currency' || t.payment_method === 'bitcoin' || t.payment_method === 'bitcoin_cash');
    const cryptoVolume = cryptoTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    if (!isReady) {
        return null; // Don't show anything while redirecting
    }

    const stats = [
        {
            label: t('todaysVolume'),
            value: "$2,458,320",
            change: "+12.5%",
            changeType: "positive",
            icon: DollarSign,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600"
        },
        {
            label: t('totalTransactions'),
            value: "12,847",
            change: "+8.3%",
            changeType: "positive",
            icon: ArrowLeftRight,
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600"
        },
        {
            label: t('successRate'),
            value: "98.7%",
            change: "+0.5%",
            changeType: "positive",
            icon: TrendingUp,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600"
        },
        {
            label: 'Crypto Volume',
            value: `$${(cryptoVolume / 1000).toFixed(1)}K`,
            change: "+18.2%",
            changeType: "positive",
            icon: Coins,
            bgColor: "bg-amber-50",
            iconColor: "text-amber-600"
        },
        {
            label: t('activeMerchants'),
            value: merchants.filter(m => m.status === 'active').length || "156",
            change: "+3",
            changeType: "positive",
            icon: Store,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
            
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="Dashboard"
            />
            <UnifiedCommandPalette 
                open={commandPaletteOpen} 
                onOpenChange={setCommandPaletteOpen}
                portalType="psp"
            />
            
            <div className={cn(
                "transition-all duration-300",
                "lg:ml-20",
                sidebarCollapsed && "ml-0"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-3 sm:p-6">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('dashboard')}</h1>
                            <p className="text-sm sm:text-base text-slate-500">
                                {language === 'es' ? '¡Bienvenido de nuevo! Esto es lo que está pasando hoy.' :
                                 language === 'fr' ? "Bon retour ! Voici ce qui se passe aujourd'hui." :
                                 language === 'zh' ? '欢迎回来！这是今天的情况。' :
                                 "Welcome back! Here's what's happening today."}
                            </p>
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
                                <span className="text-xs font-semibold text-white">🔒 PSP Instance:</span>
                                <span className="text-sm font-mono font-bold text-white tracking-wider">{userPspCode || 'LOADING...'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCommandPaletteOpen(true)}
                                className="gap-2 text-slate-600"
                            >
                                <span className="text-xs">Search</span>
                                <Badge variant="secondary" className="text-xs">⌘K</Badge>
                            </Button>
                            <Button variant="outline" className="gap-2 text-sm" onClick={() => setHelpOpen(true)}>
                                <HelpCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {language === 'es' ? 'Ayuda' : language === 'fr' ? 'Aide' : language === 'zh' ? '帮助' : 'Help'}
                                </span>
                            </Button>
                            <Button variant="outline" className="gap-2 text-sm">
                                <RefreshCw className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('refresh')}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <StatsCards stats={stats} cryptoTransactions={cryptoTransactions} />
                    </div>

                    {/* Recurring & AI Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <RecurringRevenueCard />
                        <SubscriptionHealthCard />
                        <AIPerformanceCard />
                        <TPSCounter />
                    </div>

                    {/* New Services Metrics: VAT, E-Invoicing, RWA, VASP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <VATMetricsCard />
                        <EInvoicingMetricsCard />
                        <RWAMetricsCard />
                        <VASPComplianceCard />
                    </div>

                    {/* Charts and Business Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <div className="md:col-span-2">
                            <VolumeChart />
                        </div>
                        <div className="md:col-span-1">
                            <SuccessRateChart />
                        </div>
                        <div className="md:col-span-1">
                            <BusinessMetrics />
                        </div>
                    </div>

                    {/* Transactions, Merchants, and News Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <div className="lg:col-span-2">
                            <TransactionTable transactions={transactions} />
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <TopMerchants />
                            <CryptoAnalyticsCard />
                        </div>
                    </div>

                    {/* Risk Alerts, Exchange Rates, and Payment Methods Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <RiskAlertsCard />
                        <ExchangeRates />
                        <PaymentMethodsChart />
                    </div>

                    {/* Help Panel */}
                    <HelpPanel open={helpOpen} onOpenChange={setHelpOpen} />
                </main>
            </div>
        </div>
    );
}