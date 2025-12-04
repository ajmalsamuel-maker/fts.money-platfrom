import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    ArrowLeftRight, 
    Store, 
    CreditCard,
    Wallet,
    FileText,
    Settings,
    Users,
    Shield,
    ChevronDown,
    ChevronRight,
    BarChart3,
    Building2,
    Terminal,
    AlertTriangle,
    Repeat,
    Receipt,
    Globe,
    Key,
    Bell,
    HelpCircle,
    LogOut
} from 'lucide-react';

const menuItems = [
    {
        group: 'Overview',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: 'Dashboard' },
            { icon: BarChart3, label: 'Analytics', path: 'Analytics' },
        ]
    },
    {
        group: 'Transactions',
        items: [
            { icon: ArrowLeftRight, label: 'All Transactions', path: 'Transactions' },
            { icon: Receipt, label: 'Settlements', path: 'Settlements' },
            { icon: Repeat, label: 'Chargebacks', path: 'Chargebacks' },
            { icon: AlertTriangle, label: 'Disputes', path: 'Disputes' },
        ]
    },
    {
        group: 'Onboarding',
        items: [
            { icon: Users, label: 'Self Onboarding', path: 'MerchantSelfOnboarding' },
        ]
    },
    {
        group: 'Merchant Management',
        items: [
            { icon: Store, label: 'Merchants', path: 'Merchants' },
            { icon: Terminal, label: 'Terminals', path: 'Terminals' },
            { icon: Building2, label: 'Acquirers', path: 'Acquirers' },
        ]
    },
    {
        group: 'Financial',
        items: [
            { icon: Wallet, label: 'Balances', path: 'Balances' },
            { icon: FileText, label: 'Reports', path: 'Reports' },
            { icon: CreditCard, label: 'Payouts', path: 'Payouts' },
        ]
    },
    {
        group: 'Risk & Compliance',
        items: [
            { icon: Shield, label: 'Fraud Prevention', path: 'FraudPrevention' },
            { icon: Users, label: 'KYC/AML', path: 'Compliance' },
        ]
    },
    {
        group: 'Configuration',
        items: [
            { icon: Globe, label: 'Payment Orchestration', path: 'PaymentOrchestration' },
            { icon: Key, label: 'API Keys', path: 'ApiKeys' },
            { icon: Bell, label: 'Webhooks', path: 'Webhooks' },
            { icon: Settings, label: 'Settings', path: 'Settings' },
        ]
    },
];

export default function Sidebar({ collapsed, onToggle, currentPage }) {
    const [expandedGroups, setExpandedGroups] = useState(
        menuItems.map(g => g.group)
    );

    const toggleGroup = (group) => {
        setExpandedGroups(prev => 
            prev.includes(group) 
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-slate-900 text-white z-40 transition-all duration-300 flex flex-col",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
                {collapsed ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">PaymentHub</h1>
                            <p className="text-xs text-slate-400">Service Provider</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {menuItems.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-4">
                        {!collapsed && (
                            <button
                                onClick={() => toggleGroup(group.group)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300"
                            >
                                {group.group}
                                {expandedGroups.includes(group.group) ? (
                                    <ChevronDown className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                            </button>
                        )}
                        
                        {(collapsed || expandedGroups.includes(group.group)) && (
                            <div className="space-y-1">
                                {group.items.map((item, itemIdx) => (
                                    <Link
                                        key={itemIdx}
                                        to={createPageUrl(item.path)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                            currentPage === item.path
                                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800",
                                            collapsed && "justify-center"
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="h-5 w-5 flex-shrink-0" />
                                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-800 p-3">
                <Link
                    to="#"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all",
                        collapsed && "justify-center"
                    )}
                >
                    <HelpCircle className="h-5 w-5" />
                    {!collapsed && <span className="text-sm">Help & Support</span>}
                </Link>
                <button
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-1",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span className="text-sm">Logout</span>}
                </button>
            </div>
        </aside>
    );
}