import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getStaffSession, staffLogout } from '@/components/auth/useStaffAuth';
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
    HelpCircle,
    Check
} from 'lucide-react';
import HelpPanel from './HelpPanel';
import { useI18n } from '@/components/i18n/I18nextProvider';

export default function TopHeader({ onToggleSidebar, collapsed }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [themeSettings, setThemeSettings] = useState(null);
    const [helpOpen, setHelpOpen] = useState(false);
    const { language, setLanguage } = useI18n();

    useEffect(() => {
        // First check for staff session
        const staffSession = getStaffSession();
        if (staffSession) {
            setUser({
                full_name: staffSession.full_name,
                email: staffSession.email,
                app_role: staffSession.role
            });
            return;
        }

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

    // Theme settings loaded via PSP settings only

    const [pspSettings, setPspSettings] = useState(null);
    
    useEffect(() => {
        const loadPSPSettings = async () => {
            try {
                const session = getStaffSession();
                const pspCode = session?.psp_code;
                
                if (!pspCode) {
                    window.location.href = '/PSPLogin';
                    return;
                }
                
                const result = await base44.functions.invoke('getPSPSettings', { psp_code: pspCode });
                if (result.data.success && result.data.settings) {
                    setPspSettings(result.data.settings);
                }
            } catch (err) {
                console.error('Error loading PSP settings:', err);
            }
        };
        loadPSPSettings();
    }, []);

    const primaryColor = pspSettings?.branding?.primary_color || '#3b82f6';
    const secondaryColor = pspSettings?.branding?.secondary_color || '#06b6d4';

    const userRole = user?.app_role || 'viewer';
    const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.viewer;
    const userInitials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

    const handleLogout = () => {
        // Always use staff logout (no base44 auth in this app)
        staffLogout();
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-2 sm:gap-4">
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onToggleSidebar}
                    className="text-slate-600 hover:text-slate-900"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Breadcrumb / Environment Selector - Hidden on small screens */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 hidden sm:flex">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="hidden md:inline">Production</span>
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

                {/* Search - Hidden on mobile */}
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search transactions, merchants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 xl:w-80 bg-slate-50 border-slate-200 focus:bg-white"
                    />
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                {/* Quick Stats - Hidden on mobile/tablet */}
                <div className="hidden xl:flex items-center gap-4 mr-4 pr-4 border-r border-slate-200">
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Today's Volume</p>
                        <p className="text-sm font-semibold text-slate-900">$2,458,320</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Success Rate</p>
                        <p className="text-sm font-semibold text-emerald-600">98.7%</p>
                    </div>
                </div>

                {/* Help Button - Hidden on mobile */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-600 hidden sm:flex"
                    onClick={() => setHelpOpen(true)}
                >
                    <HelpCircle className="h-5 w-5" />
                </Button>

                {/* Language Selector - Hidden on mobile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-600 hidden md:flex">
                            <Globe className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2">
                            🇺🇸 English
                            {language === 'en' && <Check className="h-4 w-4 ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('zh')} className="gap-2">
                            🇨🇳 中文
                            {language === 'zh' && <Check className="h-4 w-4 ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('es')} className="gap-2">
                            🇪🇸 Español
                            {language === 'es' && <Check className="h-4 w-4 ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('fr')} className="gap-2">
                            🇫🇷 Français
                            {language === 'fr' && <Check className="h-4 w-4 ml-auto" />}
                        </DropdownMenuItem>
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
                        <Button variant="ghost" className="gap-2 ml-1 sm:ml-2 px-2 sm:px-4">
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                            >
                                {userInitials}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-medium text-slate-900">{user?.full_name || 'User'}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    {roleConfig.label}
                                </p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
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