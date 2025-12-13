import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
    LayoutDashboard,
    Building2,
    Globe,
    Users,
    Settings,
    LogOut,
    Sparkles,
    Zap,
    FileText
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'CommunityPortalDashboard' },
    { icon: Building2, label: 'Launch PSP', path: 'CommunityPSPProvisioning' },
    { icon: Globe, label: 'Marketplace', path: 'CommunityMarketplace' },
    { icon: Zap, label: 'My PSP Instances', path: 'MyPSPInstances' },
    { icon: FileText, label: 'My Subscriptions', path: 'MySubscriptions' },
    { icon: Users, label: 'Provider Registration', path: 'ServiceProviderRegistration' },
    { icon: Settings, label: 'Account Settings', path: 'CommunityAccountSettings' },
];

export default function CommunityPortalSidebar({ currentPage, userEmail }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('community_portal_session');
        navigate(createPageUrl('CommunityPortalLogin'));
    };

    return (
        <aside className="w-64 bg-slate-900 flex flex-col h-screen">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">FTS.Money</h1>
                        <p className="text-[10px] text-slate-400">Community Portal</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            {userEmail && (
                <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm text-white truncate">{userEmail}</p>
                </div>
            )}

            {/* Menu */}
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
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm",
                                    isActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                )}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-800 p-3">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}