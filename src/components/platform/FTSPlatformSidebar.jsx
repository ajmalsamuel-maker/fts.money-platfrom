import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
    Building2, 
    BarChart3, 
    DollarSign, 
    Users,
    Settings,
    Shield,
    Sparkles,
    Database,
    Globe,
    CreditCard,
    Wallet,
    Zap,
    FileText,
    Activity,
    BookOpen,
    Plus,
    LogOut,
    Package,
    GitBranch,
    Workflow,
    Code,
    TestTube2,
    ChevronDown,
    ChevronRight,
    Briefcase,
    Key
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useI18n } from '@/components/i18n/I18nextProvider';

const menuSections = [
    {
        id: 'overview',
        title: 'Overview & Insights',
        defaultOpen: true,
        items: [
            { labelKey: 'platformDashboard', descKey: 'platformDashboardDesc', path: 'FTSMoneyPlatform', icon: Activity, priority: true },
            { labelKey: 'systemHealth', descKey: 'systemHealthDesc', path: 'FTSSystemHealth', icon: Activity },
            { labelKey: 'revenueDashboard', descKey: 'revenueDashboardDesc', path: 'FTSRevenue', icon: BarChart3, priority: true },
            { labelKey: 'platformAnalytics', descKey: 'platformAnalyticsDesc', path: 'FTSAnalytics', icon: BarChart3 },
            { labelKey: 'setupGuide', descKey: 'setupGuideDesc', path: 'FTSSetupGuide', icon: BookOpen }
        ]
    },
    {
        id: 'psp-operations',
        title: 'PSP Operations',
        defaultOpen: false,
        items: [
            { labelKey: 'pspManagement', descKey: 'pspManagementDesc', path: 'PSPProvisioning', icon: Building2, priority: true },
            { labelKey: 'provisioningQueue', descKey: 'provisioningQueueDesc', path: 'FTSProvisioningQueue', icon: Activity },
            { labelKey: 'pspAdministrators', descKey: 'pspAdministratorsDesc', path: 'PSPUserManagement', icon: Users },
            { labelKey: 'resourceOrchestration', descKey: 'resourceOrchestrationDesc', path: 'ResourceOrchestration', icon: Workflow }
        ]
    },
    {
        id: 'crypto-gateway',
        title: 'Crypto Banking / VASP',
        defaultOpen: false,
        items: [
            { labelKey: 'vaspManagement', descKey: 'vaspManagementDesc', path: 'CryptoBankingVASPManagement', icon: Wallet, priority: true },
            { labelKey: 'cryptoCustomers', descKey: 'cryptoCustomersDesc', path: 'CryptoGatewayCustomers', icon: Users },
            { labelKey: 'cryptoTransactions', descKey: 'cryptoTransactionsDesc', path: 'CryptoGatewayTransactions', icon: Activity },
            { labelKey: 'walletsIBANs', descKey: 'walletsIBANsDesc', path: 'CryptoWallets', icon: Wallet },
            { labelKey: 'complianceKYC', descKey: 'complianceKYCDesc', path: 'CryptoCompliance', icon: Shield },
            { labelKey: 'strigaSettings', descKey: 'strigaSettingsDesc', path: 'StrigaServiceManagement', icon: Settings }
        ]
    },
    {
        id: 'rwa-platform',
        title: 'RWA Tokenization Platform',
        defaultOpen: false,
        items: [
            { labelKey: 'rwaDashboard', descKey: 'rwaDashboardDesc', path: 'RWAPlatform', icon: Briefcase, priority: true },
            { labelKey: 'rwaProviders', descKey: 'rwaProvidersDesc', path: 'RWAWhiteLabelProvisioning', icon: Building2 },
            { labelKey: 'assetIssuers', descKey: 'assetIssuersDesc', path: 'RWAProviderIssuers', icon: Users },
            { labelKey: 'tokenizedAssets', descKey: 'tokenizedAssetsDesc', path: 'RWAProviderAssets', icon: Package },
            { labelKey: 'investors', descKey: 'investorsDesc', path: 'RWAProviderInvestors', icon: Users },
            { labelKey: 'rwaAnalytics', descKey: 'rwaAnalyticsDesc', path: 'RWAProviderAnalytics', icon: BarChart3 }
        ]
    },
    {
        id: 'services-marketplace',
        title: 'Services & Marketplace',
        defaultOpen: false,
        items: [
            { labelKey: 'serviceCatalog', descKey: 'serviceCatalogDesc', path: 'FTSServiceManager', icon: Package, priority: true },
            { labelKey: 'paymentProviders', descKey: 'paymentProvidersDesc', path: 'PaymentProviderManagement', icon: CreditCard, priority: true },
            { labelKey: 'globalStandards', descKey: 'globalStandardsDesc', path: 'GlobalStandardsRegistry', icon: Globe, priority: true },
            { labelKey: 'isoGateway', descKey: 'isoGatewayDesc', path: 'ISOGatewayCustomers', icon: Code, priority: true },
            { labelKey: 'isoConnections', descKey: 'isoConnectionsDesc', path: 'ISOGatewayConnections', icon: GitBranch },
            { labelKey: 'isoTestConsole', descKey: 'isoTestConsoleDesc', path: 'ISOGatewayTestConsole', icon: TestTube2 },
            { labelKey: 'isoMessageMonitor', descKey: 'isoMessageMonitorDesc', path: 'ISOMessageMonitor', icon: Activity },
            { labelKey: 'orchestration', descKey: 'orchestrationDesc', path: 'OrchestrationCustomers', icon: Workflow, priority: true },
            { labelKey: 'payoutRoutes', descKey: 'payoutRoutesDesc', path: 'FTSPayoutRoutes', icon: Wallet },
            { labelKey: 'serviceProviders', descKey: 'serviceProvidersDesc', path: 'FTSServiceProviders', icon: Users },
            { labelKey: 'wholesaleMarketplace', descKey: 'wholesaleMarketplaceDesc', path: 'PSPWholesaleMarketplace', icon: Building2 }
        ]
    },
    {
        id: 'user-management',
        title: 'User & Access Management',
        defaultOpen: false,
        items: [
            { labelKey: 'platformAdmins', descKey: 'platformAdminsDesc', path: 'PlatformUserManagement', icon: Shield, priority: true },
            { labelKey: 'communityUsers', descKey: 'communityUsersDesc', path: 'CommunityUserManagement', icon: Users },
            { labelKey: 'isoGatewayUsers', descKey: 'isoGatewayUsersDesc', path: 'ISOGatewayUserManagement', icon: Code },
            { labelKey: 'orchestrationUsers', descKey: 'orchestrationUsersDesc', path: 'OrchestrationUserManagement', icon: GitBranch },
            { labelKey: 'cryptoBankingUsers', descKey: 'cryptoBankingUsersDesc', path: 'CryptoGatewayUserManagement', icon: Wallet },
            { labelKey: 'rwaPlatformUsers', descKey: 'rwaPlatformUsersDesc', path: 'RWAProviderUserManagement', icon: Briefcase },
            { labelKey: 'rolePermissions', descKey: 'rolePermissionsDesc', path: 'RolePermissionManagement', icon: Shield, priority: true },
            { labelKey: 'clientAccounts', descKey: 'clientAccountsDesc', path: 'FTSClients', icon: Users },
            { labelKey: 'tenantManagement', descKey: 'tenantManagementDesc', path: 'TenantManagement', icon: Building2, superAdminOnly: true }
        ]
    },
    {
        id: 'financial',
        title: 'Financial Operations',
        defaultOpen: false,
        items: [
            { labelKey: 'serviceBilling', descKey: 'serviceBillingDesc', path: 'FTSServiceBilling', icon: FileText, priority: true },
            { labelKey: 'masterPricing', descKey: 'masterPricingDesc', path: 'MasterPricingManagement', icon: DollarSign },
            { labelKey: 'platformPricing', descKey: 'platformPricingDesc', path: 'PlatformPricingConfiguration', icon: DollarSign },
            { labelKey: 'customReports', descKey: 'customReportsDesc', path: 'FTSReporting', icon: FileText },
            { labelKey: 'accounting', descKey: 'accountingDesc', path: 'XeroIntegration', icon: Zap }
        ]
    },
    {
        id: 'compliance',
        title: 'Compliance & Security',
        defaultOpen: false,
        items: [
            { labelKey: 'leiDashboard', descKey: 'leiDashboardDesc', path: 'LEIComplianceDashboard', icon: Shield, priority: true },
            { labelKey: 'complianceTesting', descKey: 'complianceTestingDesc', path: 'FTSComplianceTesting', icon: TestTube2 },
            { labelKey: 'platformAuditLogs', descKey: 'platformAuditLogsDesc', path: 'PlatformAuditLogs', icon: FileText, priority: true },
            { labelKey: 'accessLogs', descKey: 'accessLogsDesc', path: 'EnhancedAuditLogs', icon: FileText },
            { labelKey: 'policyManagement', descKey: 'policyManagementDesc', path: 'FTSCompliance', icon: Shield },
            { labelKey: 'workflows', descKey: 'workflowsDesc', path: 'WorkflowManagement', icon: GitBranch },
            { labelKey: 'dataRetention', descKey: 'dataRetentionDesc', path: 'DataRetentionManagement', icon: Database }
        ]
    },
    {
        id: 'infrastructure',
        title: 'Infrastructure',
        defaultOpen: false,
        items: [
            { labelKey: 'kongGatewaySetup', descKey: 'kongGatewaySetupDesc', path: 'KongGatewaySetup', icon: Zap, priority: true },
            { labelKey: 'kongAPIKeys', descKey: 'kongAPIKeysDesc', path: 'KongAPIKeyManagement', icon: Key, priority: true },
            { labelKey: 'kongAPIIntegration', descKey: 'kongAPIIntegrationDesc', path: 'KongAPIIntegrationGuide', icon: Code, priority: true },
            { labelKey: 'domainManagement', descKey: 'domainManagementDesc', path: 'FTSDomainManagement', icon: Globe },
            { labelKey: 'apiGatewayConfig', descKey: 'apiGatewayConfigDesc', path: 'APIGatewayConfiguration', icon: Zap },
            { labelKey: 'blockchain', descKey: 'blockchainDesc', path: 'FTSBlockchainIntegration', icon: Globe }
        ]
    },
    {
        id: 'documentation',
        title: 'Documentation',
        defaultOpen: false,
        items: [
            { labelKey: 'documentationHub', descKey: 'documentationHubDesc', path: 'FTSDocumentation', icon: BookOpen, priority: true },
            { labelKey: 'architectureDocs', descKey: 'architectureDocsDesc', path: 'FTSArchitectureDoc', icon: BookOpen }
        ]
    },
    {
        id: 'resources',
        title: 'Settings & Resources',
        defaultOpen: false,
        items: [
            { labelKey: 'platformConfig', descKey: 'platformConfigDesc', path: 'FTSSettings', icon: Settings },
            { labelKey: 'multilingualSystem', descKey: 'multilingualSystemDesc', path: 'PlatformLanguageManagement', icon: Globe, priority: true },
            { labelKey: 'aiTranslationStudio', descKey: 'aiTranslationStudioDesc', path: 'AITranslationStudio', icon: Sparkles, priority: true },
            { labelKey: 'productEcosystem', descKey: 'productEcosystemDesc', path: 'FTSProductEcosystemReport', icon: Package },
            { labelKey: 'verticalSolutions', descKey: 'verticalSolutionsDesc', path: 'FTSVerticalSolutions', icon: Building2 },
            { labelKey: 'advancedTools', descKey: 'advancedToolsDesc', path: 'ModuleCatalogTest', icon: Code },
            { labelKey: 'leiPhase1Testing', descKey: 'leiPhase1TestingDesc', path: 'LEIPhase1Testing', icon: TestTube2 }
        ]
    }
];

export default function FTSPlatformSidebar({ currentPage, userRole, userEmail, isSuperAdmin }) {
    const { t } = useI18n();
    const [openSections, setOpenSections] = React.useState(
        menuSections.filter(s => s.defaultOpen).map(s => s.id)
    );
    
    // Auto-open section containing current page
    React.useEffect(() => {
        const currentSection = menuSections.find(section => 
            section.items.some(item => item.path === currentPage)
        );
        if (currentSection && !openSections.includes(currentSection.id)) {
            setOpenSections(prev => [...prev, currentSection.id]);
        }
    }, [currentPage]);
    
    const toggleSection = (sectionId) => {
        setOpenSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };
    
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen" style={{ width: '256px' }}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-200 px-3 py-2" style={{ height: '64px' }}>
                <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/865871aa1_FTSMoney-primary-logo-RGB.jpg"
                    alt="FTS.Money"
                    className="w-full h-auto max-h-16 object-contain"
                />
            </div>

            {/* User Info */}
            {userEmail && (
                <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-900 truncate">{userEmail}</p>
                                        <p className="text-[10px] text-slate-600">Role: {userRole || 'Admin'}</p>
                                    </div>
                                </div>
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-4">
                    {menuSections.map((section) => {
                        const isOpen = openSections.includes(section.id);
                        const hasCurrentPage = section.items.some(item => item.path === currentPage);

                        return (
                            <div key={section.id}>
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-2 py-1 rounded-lg transition-colors",
                                        isOpen ? "bg-blue-600 text-white" : "hover:bg-slate-50"
                                    )}
                                >
                                    <h3 className={cn(
                                        "text-xs font-semibold uppercase tracking-wider text-left",
                                        isOpen ? "text-white" : hasCurrentPage ? "text-blue-700" : "text-slate-600"
                                        )}>
                                        {t(`platform:sidebar.${section.id}`)}
                                        </h3>
                                    <span className={cn("text-xs", isOpen ? "text-white" : "text-slate-400")}>
                                        {isOpen ? '▼' : '▶'}
                                    </span>
                                </button>
                                
                                {isOpen && (
                                    <div className="space-y-1 mt-1">
                                        {section.items.filter(item => !item.superAdminOnly || isSuperAdmin).map((item) => {
                                            const Icon = item.icon;
                                            const isActive = currentPage === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={createPageUrl(item.path)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                                        isActive
                                                            ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-blue-600")} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium truncate">
                                                                {item.labelKey ? t(`platform:subMenuItems.${item.labelKey}`) : item.label}
                                                            </span>
                                                            {item.priority && <span className="text-xs">⭐</span>}
                                                            {item.superAdminOnly && <Badge className="text-[9px] px-1 py-0 bg-red-100 text-red-700 border-red-300">ADMIN</Badge>}
                                                        </div>
                                                        {(item.descKey || item.description) && (
                                                            <p className="text-xs text-slate-500 truncate">
                                                                {item.descKey ? t(`platform:subMenuItems.${item.descKey}`) : item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isActive && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-r-full"></div>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 space-y-3">
                <button
                    onClick={() => {
                        localStorage.removeItem('platform_admin_session');
                        window.location.href = '/PlatformAdminLogin';
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
                <div className="text-xs text-slate-500">
                    <p className="font-medium">Platform Status</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>All systems operational</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}