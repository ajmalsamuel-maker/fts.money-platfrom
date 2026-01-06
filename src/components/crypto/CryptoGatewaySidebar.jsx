import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
    LayoutDashboard, Wallet, Users, Activity, Settings, 
    Key, FileText, LogOut, Shield, TrendingUp, X
} from 'lucide-react';

export default function CryptoGatewaySidebar({ currentPage, userEmail, onClose }) {
    const menuItems = [
        {
            section: 'Overview',
            items: [
                { label: 'Dashboard', path: 'CryptoGatewayDashboard', icon: LayoutDashboard },
                { label: 'Analytics', path: 'CryptoAnalytics', icon: TrendingUp }
            ]
        },
        {
            section: 'Banking',
            items: [
                { label: 'Wallets', path: 'CryptoWallets', icon: Wallet },
                { label: 'Virtual IBANs', path: 'CryptoIBANs', icon: Shield },
                { label: 'Payment Cards', path: 'CryptoCards', icon: Key }
            ]
        },
        {
            section: 'Operations',
            items: [
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
                { label: 'Identity Wallet', path: 'DigitalIdentityWallet', icon: Wallet },
                { label: 'Compliance', path: 'CryptoCompliance', icon: Shield },
                { label: 'Settings', path: 'CryptoSettings', icon: Settings }
            ]
        }
    ];

    return (
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col overflow-y-auto flex-shrink-0 fixed lg:static h-screen z-40">
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-end p-2 border-b border-slate-200">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            
            <nav className="flex-1 p-3">
                <div className="space-y-5">
                    {menuItems.map((section) => (
                        <div key={section.section}>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                                {section.section}
                            </h3>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentPage === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={createPageUrl(item.path)}
                                            className={cn(
                                                "flex items-center gap-2 px-2 py-2 rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                                    : "text-slate-700 hover:bg-slate-100"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>
        </aside>
    );
}