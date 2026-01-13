import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Gift, Settings, LogOut, Target, CreditCard, X, LayoutDashboard, TrendingUp, Award, Coins, ShieldCheck, ChevronDown, ChevronRight, Shield, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CustomerPortalSidebar({ session, currentPage, mobileMenuOpen, setMobileMenuOpen }) {
    const [expandedSections, setExpandedSections] = useState(['program', 'engage']);

    const toggleSection = (section) => {
        setExpandedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const menuStructure = [
        {
            id: 'overview',
            label: 'Overview',
            path: '/LoyaltyCustomerPortal',
            icon: LayoutDashboard,
            standalone: true
        },
        {
            id: 'blockchain',
            label: 'Blockchain Config',
            path: '/LoyaltyCustomerBlockchain',
            icon: Shield,
            standalone: true
        },
        {
            id: 'program',
            label: 'Program Setup',
            icon: Settings,
            items: [
                { label: 'Earning Rules', path: '/LoyaltyEarningRules', icon: TrendingUp },
                { label: 'Rewards Catalog', path: '/LoyaltyRewardsCatalog', icon: Gift },
                { label: 'Tiers & Benefits', path: '/LoyaltyTierManagement', icon: Award },
                { label: 'Blockchain Tokens', path: '/LoyaltyTokenManager', icon: Coins }
            ]
        },
        {
            id: 'engage',
            label: 'Engagement',
            icon: Target,
            items: [
                { label: 'Challenges', path: '/LoyaltyChallenges', icon: Target },
                { label: 'Achievements', path: '/LoyaltyAchievements', icon: Trophy },
                { label: 'Leaderboards', path: '/LoyaltyLeaderboards', icon: Users }
            ]
        },
        {
            id: 'redemptions',
            label: 'Redemptions',
            icon: Gift,
            items: [
                { label: 'Catalog', path: '/LoyaltyRedemptionCatalog', icon: Gift },
                { label: 'Pending Approvals', path: '/LoyaltyRedemptionApprovals', icon: ShieldCheck, badge: 'admin' }
            ]
        },
        {
            id: 'analytics',
            label: 'Analytics & Impact',
            icon: TrendingUp,
            items: [
                { label: 'Impact Index (IMI)', path: '/LoyaltyImpactIndex', icon: TrendingUp },
                { label: 'KPIs & Metrics', path: '/LoyaltyImpactKPIs', icon: LayoutDashboard }
            ]
        },
        {
            id: 'billing',
            label: 'Billing',
            path: '/LoyaltySubscriptionBilling',
            icon: CreditCard,
            standalone: true
        },
        {
            id: 'faq',
            label: 'FAQ Manager',
            path: '/LoyaltyFAQManager',
            icon: HelpCircle,
            standalone: true
        },
        {
            id: 'settings',
            label: 'Settings',
            path: '/LoyaltyPortalSettings',
            icon: Settings,
            standalone: true
        }
    ];

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.path;

        return (
            <a 
                key={item.path}
                href={item.path} 
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                    isActive 
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-md" 
                        : "text-slate-700 hover:bg-slate-100"
                )}
            >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge === 'admin' && (
                    <Badge variant="outline" className="text-xs py-0 px-1.5 border-purple-300 text-purple-700 bg-purple-50">
                        Admin
                    </Badge>
                )}
            </a>
        );
    };

    const renderSection = (section) => {
        if (section.standalone) {
            return renderMenuItem(section);
        }

        const Icon = section.icon;
        const isExpanded = expandedSections.includes(section.id);
        const hasActiveChild = section.items?.some(item => item.path === currentPage);

        return (
            <div key={section.id}>
                <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                        hasActiveChild 
                            ? "text-purple-700 bg-purple-50" 
                            : "text-slate-700 hover:bg-slate-50"
                    )}
                >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{section.label}</span>
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                </button>
                {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-2">
                        {section.items.map(item => renderMenuItem(item))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className={cn(
            "fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform shadow-xl md:shadow-none",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            {/* Header */}
            <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="flex items-center gap-2 text-white">
                    <Trophy className="h-6 w-6" />
                    <span className="font-bold text-sm">Impact Loyalty Cloud</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Organization Info */}
            <div className="p-4 border-b bg-gradient-to-br from-purple-50 to-blue-50">
                <p className="text-xs text-slate-600 font-medium mb-1">Organization</p>
                <p className="font-semibold text-slate-900 truncate">{session?.organization_name || 'Organization'}</p>
                <div className="flex items-center gap-2 mt-2">
                    <Badge className="capitalize bg-purple-100 text-purple-800 border-purple-200">
                        {session?.subscription_tier || 'starter'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {session?.organization_type || 'ngo'}
                    </Badge>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuStructure.map(section => renderSection(section))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t bg-slate-50">
                <Button 
                    onClick={() => { 
                        localStorage.removeItem('loyalty_customer_session'); 
                        window.location.href = '/LoyaltyCustomerLogin'; 
                    }} 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}