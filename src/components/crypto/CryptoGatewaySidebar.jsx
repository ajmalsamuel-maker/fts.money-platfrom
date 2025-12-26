import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { 
    LayoutDashboard, Wallet, Users, Activity, Settings, 
    Key, FileText, LogOut, Shield, TrendingUp
} from 'lucide-react';

export default function CryptoGatewaySidebar({ currentPage, userEmail }) {
    const menuItems = [
        {
            section: 'Overview',
            items: [
                { label: 'Dashboard', path: 'CryptoGatewayDashboard', icon: LayoutDashboard },
                { label: 'Analytics', path: 'CryptoAnalytics', icon: TrendingUp }
            ]
        },
        {
            section: 'Operations',
            items: [
                { label: 'Wallets', path: 'CryptoWallets', icon: Wallet },
                { label: 'Transactions', path: 'CryptoTransactions', icon: Activity },
                { label: 'Users & KYC', path: 'CryptoUsers', icon: Users }
            ]
        },
        {
            section: 'Integration',
            items: [
                { label: 'API Keys', path: 'CryptoAPIKeys', icon: Key },
                { label: 'Documentation', path: 'CryptoDocs', icon: FileText }
            ]
        },
        {
            section: 'Settings',
            items: [
                { label: 'Compliance', path: 'CryptoCompliance', icon: Shield },
                { label: 'Settings', path: 'CryptoSettings', icon: Settings }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
                <img src={FTS_LOGOS.dark} alt="FTS.Money Crypto" className="h-8" />
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{userEmail}</p>
                        <p className="text-xs text-slate-400">Crypto Gateway</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    {menuItems.map((section) => (
                        <div key={section.section}>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {section.section}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentPage === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={createPageUrl(item.path)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                                    : "text-slate-300 hover:bg-slate-800"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => {
                        localStorage.removeItem('crypto_gateway_session');
                        window.location.href = '/CryptoGatewayLogin';
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}