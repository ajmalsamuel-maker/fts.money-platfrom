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
import { 
    DollarSign, 
    ArrowLeftRight, 
    TrendingUp, 
    Store,
    RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            label: "Today's Volume",
            value: "$2,458,320",
            change: "+12.5%",
            changeType: "positive",
            icon: DollarSign,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600"
        },
        {
            label: "Total Transactions",
            value: "12,847",
            change: "+8.3%",
            changeType: "positive",
            icon: ArrowLeftRight,
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600"
        },
        {
            label: "Success Rate",
            value: "98.7%",
            change: "+0.5%",
            changeType: "positive",
            icon: TrendingUp,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600"
        },
        {
            label: "Active Merchants",
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
                sidebarCollapsed ? "ml-20" : "ml-64"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                            <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <StatsCards stats={stats} />

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <VolumeChart />
                        </div>
                        <SuccessRateChart />
                    </div>

                    {/* Second Row */}
                    <div className="grid lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <TransactionTable transactions={transactions} />
                        </div>
                        <TopMerchants />
                    </div>

                    {/* Payment Methods */}
                    <div className="mt-6">
                        <PaymentMethodsChart />
                    </div>
                </main>
            </div>
        </div>
    );
}