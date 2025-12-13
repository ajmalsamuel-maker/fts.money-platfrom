import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    Menu
} from 'lucide-react';

const menuItems = [
    { icon: Building2, label: 'PSP Instances', path: 'PSPProvisioning' },
    { icon: BarChart3, label: 'Analytics', path: 'FTSAnalytics' },
    { icon: DollarSign, label: 'Revenue', path: 'FTSRevenue' },
    { icon: Users, label: 'Clients', path: 'FTSClients' },
    { icon: Settings, label: 'Platform Settings', path: 'FTSSettings' }
];

export default function FTSMoneyPlatform() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const totalVolume = psps.reduce((sum, p) => sum + (p.monthly_volume || 0), 0);
    const totalRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const totalMerchants = psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0);
    const activePSPs = psps.filter(p => p.status === 'active').length;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside 
                className={cn(
                    "bg-white border-r border-slate-200 flex flex-col transition-all shadow-sm",
                    sidebarCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4 bg-white">
                    {sidebarCollapsed ? (
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">FTS.Money</h1>
                                <p className="text-[10px] text-slate-600">PSP Platform</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 p-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(createPageUrl(item.path))}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all",
                                    sidebarCollapsed && "justify-center"
                                )}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-200 p-3">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-slate-50">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Platform Overview</h2>
                            <p className="text-xs text-slate-600">Manage your white-label PSP infrastructure</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Provision New PSP
                    </Button>
                </header>

                <div className="p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total PSPs</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{psps.length}</p>
                                        <p className="text-xs text-emerald-600 mt-1">{activePSPs} active</p>
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
                                        <p className="text-sm text-slate-600">Total Merchants</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalMerchants.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">Across all PSPs</p>
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
                                        <p className="text-sm text-slate-600">Monthly Volume</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${(totalVolume / 1000000).toFixed(1)}M</p>
                                        <p className="text-xs text-emerald-600 mt-1">+12.5% vs last month</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Monthly Revenue</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${(totalRevenue / 1000).toFixed(0)}k</p>
                                        <p className="text-xs text-slate-500 mt-1">FTS.Money earnings</p>
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
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Active PSP Instances</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {psps.map((psp) => (
                                <Card 
                                    key={psp.id} 
                                    className="bg-white border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => navigate(createPageUrl('PSPInstanceConfig', `?id=${psp.id}`))}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                    style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                                >
                                                    {psp.psp_code?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{psp.psp_name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{psp.psp_code}</p>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "text-xs",
                                                psp.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                'bg-blue-100 text-blue-700 border-blue-200'
                                            )}>
                                                {psp.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-slate-500 text-xs">Merchants</p>
                                                <p className="text-slate-900 font-semibold">{psp.total_merchants || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs">Volume</p>
                                                <p className="text-slate-900 font-semibold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {psps.length === 0 && (
                                <div className="col-span-3 text-center py-12">
                                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">No PSPs provisioned yet</p>
                                    <Button onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))} className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Provision Your First PSP
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}