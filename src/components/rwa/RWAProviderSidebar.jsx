import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { BarChart3, Users, Briefcase, Settings, LogOut, Building2, Coins, X, Wallet } from 'lucide-react';

export default function RWAProviderSidebar({ currentPage, providerName, providerEmail, onClose }) {
    const menuItems = [
        { label: 'Dashboard', path: 'RWAProviderDashboard', icon: BarChart3 },
        { label: 'Asset Issuers', path: 'RWAProviderIssuers', icon: Building2 },
        { label: 'All Assets', path: 'RWAProviderAssets', icon: Coins },
        { label: 'All Investors', path: 'RWAProviderInvestors', icon: Users },
        { label: 'Analytics', path: 'RWAProviderAnalytics', icon: BarChart3 },
        { label: 'Identity Wallet', path: 'DigitalIdentityWallet', icon: Wallet },
        { label: 'Settings', path: 'RWAProviderSettings', icon: Settings }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed lg:static z-40">
            <div className="h-16 flex items-center justify-between border-b border-slate-200 px-3">
                <img src={FTS_LOGOS.primary} alt="RWA Platform" className="h-8" />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {providerEmail && (
                <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <p className="text-xs font-medium text-slate-900">{providerName}</p>
                    <p className="text-xs text-slate-600">{providerEmail}</p>
                </div>
            )}

            <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={createPageUrl(item.path)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-green-100 text-green-900 font-medium"
                                        : "text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-slate-200 p-3">
                <button
                    onClick={() => {
                        localStorage.removeItem('rwa_provider_session');
                        window.location.href = createPageUrl('RWAProviderLogin');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}