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
        <aside className="w-64 flex flex-col h-screen" style={{ backgroundColor: FTS_COLORS.navy }}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-center px-4" style={{ borderBottom: `1px solid ${FTS_COLORS.royalBlue}` }}>
                <div className="flex items-center gap-2">
                    <img 
                        src={FTS_LOGOS.symbol} 
                        alt="FTS.Money" 
                        className="h-10 w-10 object-contain"
                    />
                    <div>
                        <h1 className="text-sm font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>FTS.Money</h1>
                        <p className="text-[10px]" style={{ color: FTS_COLORS.aqua }}>Community Portal</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            {userEmail && (
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${FTS_COLORS.royalBlue}` }}>
                    <p className="text-xs" style={{ color: FTS_COLORS.sky }}>Signed in as</p>
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
                                        ? "text-white"
                                        : "hover:text-white"
                                )}
                                style={isActive 
                                    ? { backgroundColor: FTS_COLORS.royalBlue }
                                    : { color: FTS_COLORS.sky }
                                }
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Logout */}
            <div className="p-3" style={{ borderTop: `1px solid ${FTS_COLORS.royalBlue}` }}>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start hover:text-white"
                    style={{ color: FTS_COLORS.sky }}
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}