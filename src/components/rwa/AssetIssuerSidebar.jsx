import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { BarChart3, Briefcase, Users, Plus, DollarSign, Settings, LogOut } from 'lucide-react';

export default function AssetIssuerSidebar({ currentPage, issuerName, issuerEmail, providerBranding }) {
    const menuItems = [
        { label: 'Dashboard', path: 'AssetIssuerDashboard', icon: BarChart3 },
        { label: 'Tokenize Asset', path: 'AssetIssuerTokenize', icon: Plus },
        { label: 'My Assets', path: 'AssetIssuerAssets', icon: Briefcase },
        { label: 'Investors', path: 'AssetIssuerInvestors', icon: Users },
        { label: 'Dividends', path: 'AssetIssuerDividends', icon: DollarSign },
        { label: 'Settings', path: 'AssetIssuerSettings', icon: Settings }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
            <div className="h-16 flex items-center justify-center border-b border-slate-200 px-3">
                {providerBranding?.logo_url ? (
                    <img src={providerBranding.logo_url} alt={providerBranding.company_name} className="h-8" />
                ) : (
                    <span className="font-bold text-lg">{providerBranding?.company_name || 'RWA Platform'}</span>
                )}
            </div>

            {issuerEmail && (
                <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <p className="text-xs font-medium text-slate-900">{issuerName}</p>
                    <p className="text-xs text-slate-600">{issuerEmail}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Asset Issuer</p>
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
                                        ? "bg-blue-100 text-blue-900 font-medium"
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
                        localStorage.removeItem('asset_issuer_session');
                        window.location.href = createPageUrl('AssetIssuerLogin');
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