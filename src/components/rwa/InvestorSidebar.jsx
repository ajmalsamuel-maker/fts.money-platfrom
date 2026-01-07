import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { ShoppingCart, Briefcase, TrendingUp, DollarSign, Settings, LogOut, User } from 'lucide-react';

export default function InvestorSidebar({ currentPage, investorName, investorEmail }) {
    const menuItems = [
        { label: 'Marketplace', path: 'InvestorMarketplace', icon: ShoppingCart },
        { label: 'My Portfolio', path: 'InvestorPortfolio', icon: Briefcase },
        { label: 'My Holdings', path: 'InvestorHoldings', icon: TrendingUp },
        { label: 'Dividends', path: 'InvestorDividends', icon: DollarSign },
        { label: 'Settings', path: 'InvestorSettings', icon: Settings }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
            <div className="h-16 flex items-center justify-center border-b border-slate-200 px-3">
                <img src={FTS_LOGOS.primary} alt="RWA Platform" className="h-8" />
            </div>

            {investorEmail && (
                <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-purple-600" />
                        <p className="text-xs font-medium text-slate-900">{investorName}</p>
                    </div>
                    <p className="text-xs text-slate-600">{investorEmail}</p>
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
                                        ? "bg-purple-100 text-purple-900 font-medium"
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
                        localStorage.removeItem('rwa_investor_session');
                        window.location.href = createPageUrl('InvestorLogin');
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