import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { hasPermission, ROLE_CONFIG } from '@/components/auth/permissions';
import { getStaffSession, staffLogout } from '@/components/auth/useStaffAuth';
import { Badge } from "@/components/ui/badge";
import HelpPanel from './HelpPanel';
import { useTranslation } from '@/components/i18n/LanguageContext';
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
    Database,
    Headphones,
    Scale,
    Building2,
    FileCheck,
    Coins,
    TrendingUp
} from 'lucide-react';

const menuItems = [
        {
            group: 'overview',
            icon: LayoutDashboard,
            items: [
                { icon: LayoutDashboard, label: 'dashboard', path: 'Dashboard', permission: 'VIEW_DASHBOARD' },
                { icon: BarChart3, label: 'analytics', path: 'Analytics', permission: 'VIEW_ANALYTICS' },
            ]
        },
        {
            group: 'transactions',
            icon: ArrowLeftRight,
            items: [
                { icon: ArrowLeftRight, label: 'transactions', path: 'Transactions', permission: 'VIEW_TRANSACTIONS' },
                { icon: Coins, label: 'cryptoTransactions', path: 'CryptoTransactions', permission: 'VIEW_TRANSACTIONS' },
                { icon: Receipt, label: 'settlements', path: 'Settlements', permission: 'VIEW_SETTLEMENTS' },
                { icon: Repeat, label: 'chargebacks', path: 'Chargebacks', permission: 'VIEW_CHARGEBACKS' },
                { icon: AlertTriangle, label: 'disputes', path: 'Disputes', permission: 'VIEW_DISPUTES' },
                { icon: Brain, label: 'aiDisputes', path: 'AIDisputeResolution', permission: 'VIEW_DISPUTES' },
            ]
        },
        {
            group: 'onboarding',
            icon: CheckSquare,
            items: [
                { icon: Store, label: 'merchantManualOnboarding', path: 'MerchantOnboarding', permission: 'VIEW_ONBOARDING' },
                { icon: Globe, label: 'merchantSelfOnboarding', path: 'MerchantSelfOnboarding', permission: 'VIEW_ONBOARDING' },
                { icon: Landmark, label: 'acquirer', path: 'AcquirerOnboarding', permission: 'VIEW_ONBOARDING' },
                { icon: Smartphone, label: 'apm', path: 'APMOnboarding', permission: 'VIEW_ONBOARDING' },
                { icon: CheckSquare, label: 'approvals', path: 'Approvals', permission: 'APPROVE_ONBOARDING' },
            ]
        },
        {
            group: 'merchants',
            icon: Store,
            items: [
                { icon: Store, label: 'allMerchants', path: 'Merchants', permission: 'VIEW_MERCHANTS' },
                { icon: BarChart3, label: 'merchantAnalytics', path: 'MerchantAnalytics', permission: 'VIEW_MERCHANTS' },
                { icon: Brain, label: 'aiInsights', path: 'AIMerchantInsights', permission: 'VIEW_MERCHANTS' },
                { icon: CreditCard, label: 'merchantMIDs', path: 'MerchantMIDs', permission: 'VIEW_MERCHANTS' },
                { icon: Database, label: 'midsPostgreSQL', path: 'MerchantMIDsDB', permission: 'VIEW_MERCHANTS' },
                { icon: Terminal, label: 'terminals', path: 'Terminals', permission: 'VIEW_TERMINALS' },
                { icon: Monitor, label: 'virtualTerminals', path: 'VirtualTerminals', permission: 'VIEW_TERMINALS' },
                { icon: Key, label: 'apiCredentials', path: 'MerchantCredentials', permission: 'VIEW_CREDENTIALS' },
                { icon: Users, label: 'merchantUsers', path: 'MerchantUsers', permission: 'VIEW_USERS' },
            ]
        },
        {
            group: 'orchestration',
            icon: Zap,
            items: [
                { icon: Globe, label: 'orchestration', path: 'PaymentOrchestration', permission: 'VIEW_ORCHESTRATION' },
                { icon: Zap, label: 'smartRouting', path: 'SmartOrchestration', permission: 'VIEW_ROUTING' },
                { icon: Landmark, label: 'bankMIDs', path: 'BankMIDs', permission: 'VIEW_BALANCES' },
                { icon: ArrowUpDown, label: 'midRouting', path: 'MIDRouting', permission: 'VIEW_BALANCES' },
            ]
        },
        {
            group: 'finance',
            icon: Wallet,
            items: [
                { icon: Wallet, label: 'balances', path: 'Balances', permission: 'VIEW_BALANCES' },
                { icon: FileText, label: 'reports', path: 'Reports', permission: 'VIEW_REPORTS' },
                { icon: BarChart3, label: 'advancedReports', path: 'AdvancedReports', permission: 'VIEW_REPORTS' },
                { icon: CreditCard, label: 'payouts', path: 'Payouts', permission: 'VIEW_PAYOUTS' },
                { icon: DollarSign, label: 'autoPayouts', path: 'AutomatedPayouts', permission: 'VIEW_PAYOUTS' },
                { icon: ArrowUpDown, label: 'reconciliation', path: 'Reconciliation', permission: 'VIEW_BALANCES' },
                { icon: Building, label: 'providers', path: 'PaymentProviders', permission: 'VIEW_BALANCES' },
                { icon: Percent, label: 'buyRates', path: 'BuyRates', permission: 'VIEW_BALANCES' },
                { icon: DollarSign, label: 'merchantPricing', path: 'MerchantPricing', permission: 'VIEW_BALANCES' },
            ]
        },
        {
            group: 'risk',
            icon: Shield,
            items: [
                { icon: Shield, label: 'fraudPrevention', path: 'FraudPrevention', permission: 'VIEW_FRAUD_PREVENTION' },
                { icon: AlertTriangle, label: 'fraudMonitoring', path: 'FraudMonitoring', permission: 'VIEW_FRAUD_PREVENTION' },
                { icon: Users, label: 'compliance', path: 'Compliance', permission: 'VIEW_COMPLIANCE' },
            ]
        },
        {
            group: 'configuration',
            icon: Settings,
            items: [
                { icon: Brain, label: 'aiAutomation', path: 'AIAutomationPlatform', permission: 'VIEW_ROUTING' },
                { icon: CreditCard, label: 'paymentGateways', path: 'PaymentGateways', permission: 'VIEW_SETTINGS' },
                { icon: Shield, label: 'securityManagement', path: 'SecurityManagement', permission: 'VIEW_SETTINGS' },
                { icon: Shield, label: 'fatfCompliance', path: 'FATFCompliance', permission: 'VIEW_COMPLIANCE' },
                { icon: Coins, label: 'blockchainConnectors', path: 'BlockchainConnectors', permission: 'VIEW_SETTINGS' },
                { icon: TrendingUp, label: 'exchangeIntegrations', path: 'ExchangeIntegrations', permission: 'VIEW_SETTINGS' },
                { icon: DollarSign, label: 'cryptoPayouts', path: 'CryptoPayouts', permission: 'VIEW_PAYOUTS' },
                { icon: UserCog, label: 'userManagement', path: 'UserManagement', permission: 'VIEW_USERS' },
                { icon: Shield, label: 'auditLogs', path: 'AuditLogs', permission: 'VIEW_USERS' },
                { icon: Palette, label: 'appearance', path: 'Appearance', permission: 'VIEW_APPEARANCE' },
                { icon: Settings, label: 'settings', path: 'Settings', permission: 'VIEW_SETTINGS' },
                { icon: FileCheck, label: 'isoStandards', path: 'ISOConfiguration', permission: 'VIEW_SETTINGS' },
                { icon: CreditCard, label: 'binTable', path: 'BINTable', permission: 'VIEW_SETTINGS' },
                { icon: Landmark, label: 'databaseSetup', path: 'DatabaseSetup', permission: 'VIEW_SETTINGS' },
                { icon: Database, label: 'databaseMigration', path: 'DatabaseMigration', permission: 'VIEW_SETTINGS' },
                ]
                },
                {
                    group: 'resources',
                icon: HelpCircle,
                items: [
                { icon: FileText, label: 'documentation', path: 'Documentation', permission: 'VIEW_DASHBOARD' },
                { icon: Headphones, label: 'supportCenter', path: 'Support', permission: 'VIEW_DASHBOARD' },
                { icon: Shield, label: 'privacyPolicy', path: 'PrivacyPolicy', permission: 'VIEW_DASHBOARD' },
                { icon: Scale, label: 'termsOfService', path: 'TermsOfService', permission: 'VIEW_DASHBOARD' },
                ]
                },
        ];

export default function Sidebar({ collapsed, onToggle, currentPage }) {
    const [user, setUser] = useState(null);
    const [themeSettings, setThemeSettings] = useState(null);
    const [pspSettings, setPspSettings] = useState(null);
    const [activeGroup, setActiveGroup] = useState(null);
    const [helpOpen, setHelpOpen] = useState(false);
    const { t } = useTranslation();

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
        
        // Fallback to base44 auth
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
        // Check if using staff session
        const staffSession = getStaffSession();
        if (staffSession) {
            staffLogout();
            return;
        }
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
        <>
            {/* Mobile Overlay */}
            {collapsed === false && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => onToggle && onToggle()}
                />
            )}
            
            <div 
                className={cn(
                    "fixed left-0 top-0 h-screen z-40 flex transition-transform duration-300",
                    "lg:translate-x-0",
                    collapsed ? "-translate-x-full" : "translate-x-0"
                )}
                onMouseLeave={() => setActiveGroup(null)}
            >
                {/* Main Menu Column */}
                <aside 
                    className="h-full flex flex-col w-20"
                    style={{ backgroundColor: sidebarBg }}
                >
                {/* Branding - Lighter Background */}
                <div 
                   className="h-16 flex items-center justify-center border-b"
                   style={{ backgroundColor: '#374151', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                   {logoUrl ? (
                       <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain rounded-lg" />
                   ) : (
                       <div 
                           className="w-12 h-12 rounded-lg flex items-center justify-center"
                           style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                       >
                           <CreditCard className="h-6 w-6 text-white" />
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
                                    title={t(group.group)}
                                >
                                    <GroupIcon className="h-5 w-5" />
                                    <span className="text-[9px] mt-1 text-center leading-tight">{t(group.group)}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Actions */}
                <div className="border-t p-2 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setHelpOpen(true)}
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
                
                <HelpPanel open={helpOpen} onOpenChange={setHelpOpen} />
            </aside>

            {/* Submenu Panel */}
            {activeGroupData && (
                <aside 
                    className="h-full w-56 border-r flex flex-col"
                    style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    {/* Group Header */}
                    <div 
                        className="h-16 flex items-center px-4 border-b"
                        style={{ backgroundColor: '#374151', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                        <div>
                            <h2 className="font-semibold text-white text-sm">{companyName}</h2>
                            <p className="text-[10px]" style={{ color: sidebarText }}>{t(activeGroup)}</p>
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
                                        <span>{t(item.label)}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </aside>
            )}
        </div>
        </>
    );
}