import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
    LayoutDashboard, CreditCard, Users, FileText, Terminal,
    BarChart3, Settings, LogOut, ChevronDown, ChevronRight,
    Wallet, Receipt, DollarSign, Package, Globe
} from 'lucide-react';

/**
 * Optimized Merchant Portal Sidebar
 * Progressive disclosure based on merchant status
 */
export default function MerchantSidebarOptimized({ currentPage, merchantData, onLogout }) {
    const isNewMerchant = !merchantData?.kyb_status || merchantData.kyb_status === 'not_started';
    
    const menuSections = [
        {
            id: 'overview',
            title: 'Overview',
            defaultOpen: true,
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: 'MerchantDashboard' }
            ]
        },
        // Progressive: Show setup for new merchants
        ...(isNewMerchant ? [{
            id: 'getting-started',
            title: 'Getting Started',
            defaultOpen: true,
            items: [
                { icon: FileText, label: 'Complete Setup', path: 'MerchantInfo', highlight: true },
                { icon: BarChart3, label: 'Quick Tour', path: 'MerchantHelpCenter' }
            ]
        }] : []),
        {
            id: 'operations',
            title: 'Operations',
            defaultOpen: !isNewMerchant,
            items: [
                { icon: CreditCard, label: 'Transactions', path: 'MerchantTransactionList' },
                { icon: Terminal, label: 'Virtual Terminal', path: 'MerchantVirtualTerminal' },
                { icon: Receipt, label: 'Settlements', path: 'MerchantSettlements' }
            ]
        },
        {
            id: 'customers',
            title: 'Customers & Billing',
            defaultOpen: false,
            items: [
                { icon: Users, label: 'Customers', path: 'MerchantCustomers' },
                { icon: FileText, label: 'Invoices', path: 'MerchantInvoicing' },
                { icon: Package, label: 'Products', path: 'MerchantProducts' },
                { icon: Globe, label: 'Payment Links', path: 'MerchantPaymentLinks' }
            ]
        },
        {
            id: 'analytics',
            title: 'Analytics & Reports',
            defaultOpen: false,
            items: [
                { icon: BarChart3, label: 'Analytics', path: 'MerchantAnalytics' },
                { icon: Users, label: 'Customer Insights', path: 'MerchantCustomerAnalytics' }
            ]
        },
        {
            id: 'settings',
            title: 'Settings',
            defaultOpen: false,
            items: [
                { icon: Settings, label: 'Account', path: 'MerchantSettings' },
                { icon: Users, label: 'Team', path: 'MerchantOperators' },
                { icon: DollarSign, label: 'Pricing', path: 'MerchantPricingView' }
            ]
        }
    ];

    const [openSections, setOpenSections] = useState(
        menuSections.filter(s => s.defaultOpen).map(s => s.id)
    );

    const toggleSection = (sectionId) => {
        setOpenSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    return (
        <aside className="w-64 flex flex-col h-screen bg-white border-r border-slate-200" style={{ width: '256px' }}>
            {/* Logo/Header */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200" style={{ height: '64px' }}>
                <div className="flex items-center gap-2">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-sm font-bold text-slate-900">Merchant Portal</h1>
                        <p className="text-[10px] text-slate-600">{merchantData?.merchant_code}</p>
                    </div>
                </div>
            </div>

            {/* Merchant Info */}
            {merchantData && (
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <p className="text-xs text-slate-600">Business</p>
                    <p className="text-sm text-slate-900 font-medium truncate">{merchantData.business_name}</p>
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-4">
                    {menuSections.map((section) => {
                        const isOpen = openSections.includes(section.id);
                        const hasActivePage = section.items.some(item => item.path === currentPage);

                        return (
                            <Collapsible
                                key={section.id}
                                open={isOpen}
                                onOpenChange={() => toggleSection(section.id)}
                            >
                                <CollapsibleTrigger className="w-full group">
                                    <div className="flex items-center justify-between px-2 py-1 hover:bg-slate-50 rounded-lg transition-colors">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-slate-900">
                                            {section.title}
                                        </span>
                                        {isOpen ? (
                                            <ChevronDown className="h-3 w-3 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="h-3 w-3 text-slate-400" />
                                        )}
                                    </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="mt-1">
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = currentPage === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={createPageUrl(item.path)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group relative overflow-hidden",
                                                        isActive
                                                            ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-slate-900 font-medium"
                                                            : "text-slate-700 hover:bg-slate-50",
                                                        item.highlight && !isActive && "bg-blue-50/50 border border-blue-200"
                                                    )}
                                                >
                                                    <Icon 
                                                        className={cn(
                                                            "h-4 w-4 flex-shrink-0",
                                                            isActive && "text-blue-600"
                                                        )}
                                                    />
                                                    <span className="truncate">{item.label}</span>
                                                    {isActive && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-500"></div>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-slate-200">
                <Button
                    onClick={onLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}