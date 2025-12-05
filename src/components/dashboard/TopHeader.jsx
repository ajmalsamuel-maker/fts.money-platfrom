import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ROLE_CONFIG } from '@/components/auth/permissions';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Menu,
    Search, 
    Bell, 
    User,
    Settings,
    LogOut,
    Moon,
    Sun,
    ChevronDown,
    Globe,
    Building2,
    Shield,
    HelpCircle
} from 'lucide-react';
import HelpPanel from './HelpPanel';

export default function TopHeader({ onToggleSidebar, collapsed }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [themeSettings, setThemeSettings] = useState(null);
    const [helpOpen, setHelpOpen] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (err) {
                // User not logged in
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const settings = await base44.entities.ThemeSettings.list();
                if (settings && settings.length > 0) {
                    setThemeSettings(settings[0]);
                }
            } catch (err) {
                // Theme settings not available
            }
        };
        loadTheme();
    }, []);

    const primaryColor = themeSettings?.primary_color || '#3b82f6';
    const secondaryColor = themeSettings?.secondary_color || '#06b6d4';

    const userRole = user?.app_role || 'viewer';
    const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.viewer;
    const userInitials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

    const handleLogout = () => {
        base44.auth.logout();
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onToggleSidebar}
                    className="text-slate-600 hover:text-slate-900"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Breadcrumb / Environment Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Production</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                            Production
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                            Sandbox
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                            Development
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search transactions, merchants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-80 bg-slate-50 border-slate-200 focus:bg-white"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Quick Stats */}
                <div className="hidden lg:flex items-center gap-4 mr-4 pr-4 border-r border-slate-200">
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Today's Volume</p>
                        <p className="text-sm font-semibold text-slate-900">$2,458,320</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Success Rate</p>
                        <p className="text-sm font-semibold text-emerald-600">98.7%</p>
                    </div>
                </div>

                {/* Help Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-600"
                    onClick={() => setHelpOpen(true)}
                >
                    <HelpCircle className="h-5 w-5" />
                </Button>

                {/* Language Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-600">
                            <Globe className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>🇺🇸 English</DropdownMenuItem>
                        <DropdownMenuItem>🇨🇳 中文</DropdownMenuItem>
                        <DropdownMenuItem>🇪🇸 Español</DropdownMenuItem>
                        <DropdownMenuItem>🇫🇷 Français</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-600 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex justify-between">
                            Notifications
                            <Badge variant="secondary">3 new</Badge>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex-col items-start py-3">
                            <p className="font-medium text-sm">High-risk transaction detected</p>
                            <p className="text-xs text-slate-500">Transaction #TXN-2024-001234 flagged</p>
                            <p className="text-xs text-slate-400 mt-1">2 minutes ago</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex-col items-start py-3">
                            <p className="font-medium text-sm">Settlement completed</p>
                            <p className="text-xs text-slate-500">$125,430 settled to Merchant XYZ</p>
                            <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex-col items-start py-3">
                            <p className="font-medium text-sm">New merchant onboarded</p>
                            <p className="text-xs text-slate-500">TechCorp Ltd is now active</p>
                            <p className="text-xs text-slate-400 mt-1">3 hours ago</p>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 ml-2">
                            <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                    >
                                        {userInitials}
                                    </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-900">{user?.full_name || 'User'}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    {roleConfig.label}
                                </p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                >
                                    {userInitials}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{user?.full_name || 'User'}</p>
                                    <p className="text-xs text-slate-500">{user?.email || ''}</p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <div className="px-2 py-2">
                            <Badge className={cn("text-xs", roleConfig.bgColor, roleConfig.textColor)}>
                                {roleConfig.label}
                            </Badge>
                            <p className="text-xs text-slate-500 mt-1">{roleConfig.description}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Building2 className="h-4 w-4 mr-2" />
                            Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    </div>

                    {/* Help Panel */}
                    <HelpPanel open={helpOpen} onOpenChange={setHelpOpen} />
                    </header>
                    );
                    }