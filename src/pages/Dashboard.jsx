import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import TransactionTable from '@/components/dashboard/TransactionTable';
import VolumeChart from '@/components/dashboard/VolumeChart';
import SuccessRateChart from '@/components/dashboard/SuccessRateChart';
import TopMerchants from '@/components/dashboard/TopMerchants';
import PaymentMethodsChart from '@/components/dashboard/PaymentMethodsChart';
import TPSCounter from '@/components/dashboard/TPSCounter';
import PaymentNews from '@/components/dashboard/PaymentNews';
import ExchangeRates from '@/components/dashboard/ExchangeRates';
import BusinessMetrics from '@/components/dashboard/BusinessMetrics';
import HelpPanel from '@/components/dashboard/HelpPanel';
import RecurringRevenueCard from '@/components/dashboard/RecurringRevenueCard';
import AIPerformanceCard from '@/components/dashboard/AIPerformanceCard';
import SubscriptionHealthCard from '@/components/dashboard/SubscriptionHealthCard';
import { 
    DollarSign, 
    ArrowLeftRight, 
    TrendingUp, 
    Store,
    RefreshCw,
    HelpCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function Dashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const { t, language } = useTranslation();

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 10),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

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
            label: t('activeMerchants'),
            value: merchants.filter(m => m.status === 'active').length || "156",
            change: "+3",
            changeType: "positive",
            icon: Store,
            bgColor: "bg-amber-50",
            iconColor: "text-amber-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="Dashboard"
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
                        </div>
                        <div className="flex items-center gap-2">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatsCards stats={stats} />
                    </div>

                    {/* Recurring & AI Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <RecurringRevenueCard />
                        <SubscriptionHealthCard />
                        <AIPerformanceCard />
                        <TPSCounter />
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
                        </div>
                    </div>

                    {/* News, Exchange Rates, and Payment Methods Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <PaymentNews />
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