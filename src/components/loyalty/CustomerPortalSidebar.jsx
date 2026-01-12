import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Activity, Settings, LogOut, Target, CreditCard, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CustomerPortalSidebar({ session, currentPage, mobileMenuOpen, setMobileMenuOpen }) {
    const menuItems = [
        { label: 'Overview', path: '/LoyaltyCustomerPortal', icon: Activity },
        { label: 'Subscription & Billing', path: '/LoyaltySubscriptionBilling', icon: CreditCard },
        { label: 'Leaderboards', path: '/LoyaltyLeaderboards', icon: Trophy },
        { label: 'Earning Rules', path: '/LoyaltyEarningRules', icon: Activity },
        { label: 'Rewards Catalog', path: '/LoyaltyRewardsCatalog', icon: Activity },
        { label: 'Challenges', path: '/LoyaltyChallenges', icon: Target },
        { label: 'Redemption Catalog', path: '/LoyaltyRedemptionCatalog', icon: Activity },
        { label: 'Redemption Approvals', path: '/LoyaltyRedemptionApprovals', icon: Activity },
        { label: 'Blockchain Tokens', path: '/LoyaltyTokenManager', icon: Activity },
        { label: 'Impact Index', path: '/LoyaltyImpactIndex', icon: Activity },
        { label: 'Settings', path: '#settings', icon: Settings }
    ];

    return (
        <aside className={cn("fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
            <div className="h-16 flex items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-purple-600" />
                    <span className="font-bold">Loyalty Portal</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="p-4 border-b bg-purple-50">
                <p className="text-xs text-slate-600">Organization</p>
                <p className="font-semibold">{session.organization_name}</p>
                <Badge className="mt-2 capitalize">{session.subscription_tier}</Badge>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.path;
                    return (
                        <a 
                            key={item.path}
                            href={item.path} 
                            className={cn(
                                "block px-3 py-2 rounded-lg",
                                isActive ? "bg-purple-50 text-purple-700 font-medium" : "hover:bg-slate-50"
                            )}
                        >
                            <Icon className="h-4 w-4 inline mr-2" />{item.label}
                        </a>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <Button onClick={() => { localStorage.removeItem('loyalty_customer_session'); window.location.href = '/LoyaltyCustomerLogin'; }} 
                    variant="outline" className="w-full text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />Logout
                </Button>
            </div>
        </aside>
    );
}