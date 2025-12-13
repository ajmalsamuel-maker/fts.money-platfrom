import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FTS_COLORS, FTS_LOGOS } from '@/components/community/FTSBrandColors';
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
        <aside className="w-64 flex flex-col h-screen bg-white border-r border-slate-200">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <img 
                        src={FTS_LOGOS.symbol} 
                        alt="FTS.Money" 
                        className="h-10 w-10 object-contain"
                    />
                    <div>
                        <h1 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>FTS.Money</h1>
                        <p className="text-[10px] text-slate-600">Community Portal</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            {userEmail && (
                <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-xs text-slate-600">Signed in as</p>
                    <p className="text-sm text-slate-900 font-medium truncate">{userEmail}</p>
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
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-slate-900 font-medium"
                                        : "text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <Icon 
                                    className={cn(
                                        "h-4 w-4 flex-shrink-0",
                                        isActive && "text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text"
                                    )}
                                    style={isActive ? { 
                                        strokeWidth: 2,
                                        filter: 'drop-shadow(0 0 2px rgba(0, 191, 255, 0.3))'
                                    } : {}}
                                />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-500"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-slate-200">
                <Button
                    onClick={handleLogout}
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