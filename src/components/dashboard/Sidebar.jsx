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
    Terminal,
    AlertTriangle,
    Repeat,
    Receipt,
    Globe,
    Key,
    Bell,
    HelpCircle,
    LogOut,
    UserPlus,
    Landmark,
    Smartphone,
    Brain,
    Zap,
    CheckSquare,
    Palette,
    UserCog,
    Monitor
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
            { icon: ArrowLeftRight, label: 'Transactions', path: 'Transactions' },
            { icon: Receipt, label: 'Settlements', path: 'Settlements' },
            { icon: Repeat, label: 'Chargebacks', path: 'Chargebacks' },
            { icon: AlertTriangle, label: 'Disputes', path: 'Disputes' },
            { icon: Brain, label: 'AI Disputes', path: 'AIDisputeResolution' },
        ]
    },
    {
        group: 'Onboarding',
        items: [
            { icon: Store, label: 'Merchant', path: 'MerchantOnboarding' },
            { icon: Landmark, label: 'Acquirer', path: 'AcquirerOnboarding' },
            { icon: Smartphone, label: 'APM', path: 'APMOnboarding' },
            { icon: CheckSquare, label: 'Approvals', path: 'Approvals' },
        ]
    },
    {
        group: 'Merchants',
        items: [
            { icon: Store, label: 'All Merchants', path: 'Merchants' },
            { icon: Terminal, label: 'Terminals', path: 'Terminals' },
            { icon: Monitor, label: 'Virtual Terminals', path: 'VirtualTerminals' },
            { icon: Key, label: 'API Credentials', path: 'MerchantCredentials' },
            { icon: Users, label: 'Merchant Users', path: 'MerchantUsers' },
        ]
    },
    {
        group: 'Finance',
        items: [
            { icon: Wallet, label: 'Balances', path: 'Balances' },
            { icon: FileText, label: 'Reports', path: 'Reports' },
            { icon: CreditCard, label: 'Payouts', path: 'Payouts' },
        ]
    },
    {
        group: 'Risk',
        items: [
            { icon: Shield, label: 'Fraud Prevention', path: 'FraudPrevention' },
            { icon: Users, label: 'Compliance', path: 'Compliance' },
        ]
    },
    {
        group: 'Configuration',
        items: [
            { icon: Zap, label: 'Smart Routing', path: 'SmartOrchestration' },
            { icon: Globe, label: 'Orchestration', path: 'PaymentOrchestration' },
            { icon: UserCog, label: 'User Management', path: 'UserManagement' },
            { icon: Palette, label: 'Appearance', path: 'Appearance' },
            { icon: Settings, label: 'Settings', path: 'Settings' },
        ]
    },
];

export default function Sidebar({ collapsed, onToggle, currentPage }) {
    const [expandedGroups, setExpandedGroups] = useState(menuItems.map(g => g.group));

    const toggleGroup = (group) => {
        setExpandedGroups(prev => 
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-slate-900 text-white z-40 transition-all duration-300 flex flex-col",
            collapsed ? "w-16" : "w-56"
        )}>
            <div className="h-14 flex items-center justify-center border-b border-slate-800 px-3">
                {collapsed ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm">PaymentHub</h1>
                            <p className="text-[10px] text-slate-400">Gateway Admin</p>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-2">
                {menuItems.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-2">
                        {!collapsed && (
                            <button
                                onClick={() => toggleGroup(group.group)}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300"
                            >
                                {group.group}
                                {expandedGroups.includes(group.group) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>
                        )}
                        
                        {(collapsed || expandedGroups.includes(group.group)) && (
                            <div className="space-y-0.5">
                                {group.items.map((item, itemIdx) => (
                                    <Link
                                        key={itemIdx}
                                        to={createPageUrl(item.path)}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-2 rounded-md transition-all text-xs",
                                            currentPage === item.path
                                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800",
                                            collapsed && "justify-center"
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" />
                                        {!collapsed && <span>{item.label}</span>}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-800 p-2">
                <Link to="#" className={cn("flex items-center gap-2 px-2 py-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-xs", collapsed && "justify-center")}>
                    <HelpCircle className="h-4 w-4" />
                    {!collapsed && <span>Help</span>}
                </Link>
                <button className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs", collapsed && "justify-center")}>
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}