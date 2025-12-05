import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { hasPermission, ROLE_CONFIG } from '@/components/auth/permissions';
import { Badge } from "@/components/ui/badge";
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
    BarChart3,
    Terminal,
    AlertTriangle,
    Repeat,
    Receipt,
    Globe,
    Key,
    HelpCircle,
    LogOut,
    Landmark,
    Smartphone,
    Brain,
    Zap,
    CheckSquare,
    Palette,
    UserCog,
    Monitor,
    DollarSign,
    Percent,
    Building,
    ArrowUpDown,
    Database
} from 'lucide-react';

const menuItems = [
    {
        group: 'Overview',
        icon: LayoutDashboard,
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: 'Dashboard', permission: 'VIEW_DASHBOARD' },
            { icon: BarChart3, label: 'Analytics', path: 'Analytics', permission: 'VIEW_ANALYTICS' },
        ]
    },
    {
        group: 'Transactions',
        icon: ArrowLeftRight,
        items: [
            { icon: ArrowLeftRight, label: 'Transactions', path: 'Transactions', permission: 'VIEW_TRANSACTIONS' },
            { icon: Receipt, label: 'Settlements', path: 'Settlements', permission: 'VIEW_SETTLEMENTS' },
            { icon: Repeat, label: 'Chargebacks', path: 'Chargebacks', permission: 'VIEW_CHARGEBACKS' },
            { icon: AlertTriangle, label: 'Disputes', path: 'Disputes', permission: 'VIEW_DISPUTES' },
            { icon: Brain, label: 'AI Disputes', path: 'AIDisputeResolution', permission: 'VIEW_DISPUTES' },
        ]
    },
    {
        group: 'Onboarding',
        icon: CheckSquare,
        items: [
            { icon: Store, label: 'Merchant', path: 'MerchantOnboarding', permission: 'VIEW_ONBOARDING' },
            { icon: Landmark, label: 'Acquirer', path: 'AcquirerOnboarding', permission: 'VIEW_ONBOARDING' },
            { icon: Smartphone, label: 'APM', path: 'APMOnboarding', permission: 'VIEW_ONBOARDING' },
            { icon: CheckSquare, label: 'Approvals', path: 'Approvals', permission: 'APPROVE_ONBOARDING' },
        ]
    },
    {
        group: 'Merchants',
        icon: Store,
        items: [
            { icon: Store, label: 'All Merchants', path: 'Merchants', permission: 'VIEW_MERCHANTS' },
            { icon: CreditCard, label: 'Merchant MIDs', path: 'MerchantMIDs', permission: 'VIEW_MERCHANTS' },
            { icon: Database, label: 'MIDs (PostgreSQL)', path: 'MerchantMIDsDB', permission: 'VIEW_MERCHANTS' },
            { icon: Terminal, label: 'Terminals', path: 'Terminals', permission: 'VIEW_TERMINALS' },
            { icon: Monitor, label: 'Virtual Terminals', path: 'VirtualTerminals', permission: 'VIEW_TERMINALS' },
            { icon: Key, label: 'API Credentials', path: 'MerchantCredentials', permission: 'VIEW_CREDENTIALS' },
            { icon: Users, label: 'Merchant Users', path: 'MerchantUsers', permission: 'VIEW_USERS' },
        ]
    },
    {
        group: 'Finance',
        icon: Wallet,
        items: [
            { icon: Wallet, label: 'Balances', path: 'Balances', permission: 'VIEW_BALANCES' },
            { icon: FileText, label: 'Reports', path: 'Reports', permission: 'VIEW_REPORTS' },
            { icon: BarChart3, label: 'Advanced Reports', path: 'AdvancedReports', permission: 'VIEW_REPORTS' },
            { icon: CreditCard, label: 'Payouts', path: 'Payouts', permission: 'VIEW_PAYOUTS' },
            { icon: DollarSign, label: 'Auto Payouts', path: 'AutomatedPayouts', permission: 'VIEW_PAYOUTS' },
            { icon: ArrowUpDown, label: 'Reconciliation', path: 'Reconciliation', permission: 'VIEW_BALANCES' },
            { icon: Building, label: 'Providers', path: 'PaymentProviders', permission: 'VIEW_BALANCES' },
            { icon: Percent, label: 'Buy Rates', path: 'BuyRates', permission: 'VIEW_BALANCES' },
            { icon: DollarSign, label: 'Merchant Pricing', path: 'MerchantPricing', permission: 'VIEW_BALANCES' },
        ]
    },
    {
        group: 'Risk',
        icon: Shield,
        items: [
            { icon: Shield, label: 'Fraud Prevention', path: 'FraudPrevention', permission: 'VIEW_FRAUD_PREVENTION' },
            { icon: Users, label: 'Compliance', path: 'Compliance', permission: 'VIEW_COMPLIANCE' },
        ]
    },
    {
        group: 'Configuration',
        icon: Settings,
        items: [
            { icon: Zap, label: 'Smart Routing', path: 'SmartOrchestration', permission: 'VIEW_ROUTING' },
            { icon: Globe, label: 'Orchestration', path: 'PaymentOrchestration', permission: 'VIEW_ORCHESTRATION' },
            { icon: UserCog, label: 'User Management', path: 'UserManagement', permission: 'VIEW_USERS' },
            { icon: Shield, label: 'Audit Logs', path: 'AuditLogs', permission: 'VIEW_USERS' },
            { icon: Palette, label: 'Appearance', path: 'Appearance', permission: 'VIEW_APPEARANCE' },
            { icon: Settings, label: 'Settings', path: 'Settings', permission: 'VIEW_SETTINGS' },
            { icon: Landmark, label: 'Database Setup', path: 'DatabaseSetup', permission: 'VIEW_SETTINGS' },
        ]
    },
];

export default function Sidebar({ collapsed, onToggle, currentPage }) {
    const [user, setUser] = useState(null);
    const [themeSettings, setThemeSettings] = useState(null);
    const [pspSettings, setPspSettings] = useState(null);
    const [activeGroup, setActiveGroup] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (err) {}
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
            } catch (err) {}
        };
        loadTheme();
    }, []);

    useEffect(() => {
        const loadPspSettings = async () => {
            try {
                const settings = await base44.entities.PSPSettings.list();
                if (settings && settings.length > 0) {
                    setPspSettings(settings[0]);
                }
            } catch (err) {}
        };
        loadPspSettings();
    }, []);

    // Set active group based on current page (for highlighting only, not for showing submenu)
    const currentGroupName = menuItems.find(g => g.items.some(item => item.path === currentPage))?.group;

    const userRole = user?.app_role || 'viewer';
    const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.viewer;

    const filteredMenuItems = menuItems.map(group => ({
        ...group,
        items: group.items.filter(item => 
            !item.permission || hasPermission(userRole, item.permission)
        )
    })).filter(group => group.items.length > 0);

    const handleLogout = () => {
        base44.auth.logout();
    };

    const sidebarBg = themeSettings?.sidebar_bg || '#0f172a';
    const sidebarText = themeSettings?.sidebar_text || '#94a3b8';
    const primaryColor = themeSettings?.primary_color || '#3b82f6';
    const secondaryColor = themeSettings?.secondary_color || '#06b6d4';
    const companyName = pspSettings?.company_name || themeSettings?.company_name || 'PaymentHub';
    const logoUrl = themeSettings?.logo_url;

    const activeGroupData = filteredMenuItems.find(g => g.group === activeGroup);

    return (
        <div 
            className="fixed left-0 top-0 h-screen z-40 flex"
            onMouseLeave={() => setActiveGroup(null)}
        >
            {/* Main Menu Column */}
            <aside 
                className="h-full flex flex-col w-16"
                style={{ backgroundColor: sidebarBg }}
            >
                {/* Branding - Lighter Background */}
                <div 
                    className="h-16 flex items-center justify-center border-b"
                    style={{ backgroundColor: '#374151', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-9 w-9 object-contain rounded-lg" />
                    ) : (
                        <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                    )}
                </div>

                {/* Main Menu Items */}
                <nav className="flex-1 overflow-y-auto py-3 px-2">
                    <div className="space-y-1">
                        {filteredMenuItems.map((group) => {
                            const GroupIcon = group.icon;
                            const isHovered = activeGroup === group.group;
                            const isCurrentGroup = currentGroupName === group.group;
                            return (
                                <button
                                    key={group.group}
                                    onMouseEnter={() => setActiveGroup(group.group)}
                                    className={cn(
                                        "w-full flex flex-col items-center justify-center py-3 px-1 rounded-lg transition-all",
                                        (isHovered || isCurrentGroup)
                                            ? "text-white" 
                                            : "hover:bg-white/10"
                                    )}
                                    style={(isHovered || isCurrentGroup) ? { backgroundColor: '#4b5563' } : { color: sidebarText }}
                                    title={group.group}
                                >
                                    <GroupIcon className="h-5 w-5" />
                                    <span className="text-[9px] mt-1 text-center leading-tight">{group.group}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Actions */}
                <div className="border-t p-2 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <button
                        className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/10 transition-all"
                        style={{ color: sidebarText }}
                        title="Help"
                    >
                        <HelpCircle className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </aside>

            {/* Submenu Panel */}
            {activeGroupData && (
                <aside 
                    className="h-full w-48 border-r flex flex-col"
                    style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    {/* Group Header */}
                    <div 
                        className="h-16 flex items-center px-4 border-b"
                        style={{ backgroundColor: '#374151', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                        <div>
                            <h2 className="font-semibold text-white text-sm">{companyName}</h2>
                            <p className="text-[10px]" style={{ color: sidebarText }}>{activeGroup}</p>
                        </div>
                    </div>

                    {/* Role Badge */}
                    {user && (
                        <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <Badge className={cn("text-[10px]", roleConfig.bgColor, roleConfig.textColor)}>
                                {roleConfig.label}
                            </Badge>
                        </div>
                    )}

                    {/* Submenu Items */}
                    <nav className="flex-1 overflow-y-auto py-3 px-2">
                        <div className="space-y-1">
                            {activeGroupData.items.map((item) => {
                                const isActive = currentPage === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={createPageUrl(item.path)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm"
                                        )}
                                        style={isActive 
                                            ? { backgroundColor: '#4b5563', color: '#ffffff' }
                                            : { color: sidebarText }
                                        }
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </aside>
            )}
        </div>
    );
}