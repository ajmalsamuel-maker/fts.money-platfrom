import React from 'react';
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
    Key,
    AlertCircle,
    TrendingUp,
    Brain,
    Leaf,
    Trophy,
    RefreshCw,
    Rocket,
    Menu,
    X,
    Target
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useI18n } from '@/components/i18n/I18nextProvider';
import AuditLogger from '@/components/audit/AuditLogger';

// Flatten subsections for rendering
const flattenMenuSections = (sections) => {
    return sections.map(section => {
        if (section.subsections) {
            // Flatten subsections into items with group headers
            const allItems = [];
            section.subsections.forEach(subsection => {
                allItems.push({ isSubsectionHeader: true, label: subsection.label, id: subsection.id });
                if (subsection.items) {
                    allItems.push(...subsection.items);
                }
                // Handle nested subsections
                if (subsection.subsections) {
                    subsection.subsections.forEach(nestedSub => {
                        allItems.push({ isNestedSubsectionHeader: true, label: nestedSub.label, id: nestedSub.id, parentId: subsection.id });
                        if (nestedSub.items) {
                            // Mark items as nested so they get extra indentation
                            allItems.push(...nestedSub.items.map(item => ({ ...item, isNestedItem: true })));
                        }
                    });
                }
            });
            return { ...section, items: allItems };
        }
        return section;
    });
};

const menuSections = [
        {
            id: 'overview',
            title: 'Overview & Insights',
            defaultOpen: true,
            items: [
                { labelKey: 'platformDashboard', descKey: 'platformDashboardDesc', path: 'FTSMoneyPlatform', icon: Activity, priority: true },
                { label: 'FIX Score Management', description: 'FTS Index merchant scores', path: 'PlatformFIXManagement', icon: Trophy, priority: true },
                { labelKey: 'systemHealth', descKey: 'systemHealthDesc', path: 'FTSSystemHealth', icon: Activity },
                { labelKey: 'revenueDashboard', descKey: 'revenueDashboardDesc', path: 'FTSRevenue', icon: BarChart3, priority: true },
                { labelKey: 'platformAnalytics', descKey: 'platformAnalyticsDesc', path: 'FTSAnalytics', icon: BarChart3 },
                { labelKey: 'setupGuide', descKey: 'setupGuideDesc', path: 'FTSSetupGuide', icon: BookOpen },
                { label: 'Custom Reports', description: 'Report builder', path: 'FTSReporting', icon: FileText },
                { label: 'Business E-Invoicing', description: 'Manage white-label org instances', path: 'BusinessEInvoiceManagement', icon: FileText, priority: true }
            ]
        },
    {
        id: 'psp-operations',
        title: 'PSP Operations',
        defaultOpen: true,
        items: [
            { labelKey: 'pspManagement', descKey: 'pspManagementDesc', path: 'PSPProvisioning', icon: Building2, priority: true },
            { labelKey: 'provisioningQueue', descKey: 'provisioningQueueDesc', path: 'FTSProvisioningQueue', icon: Activity },
            { labelKey: 'pspAdministrators', descKey: 'pspAdministratorsDesc', path: 'PlatformUserManagement', icon: Users },
            { labelKey: 'resourceOrchestration', descKey: 'resourceOrchestrationDesc', path: 'ResourceOrchestration', icon: Workflow }
        ]
    },
    {
        id: 'crypto-gateway',
        title: 'Crypto Banking / VASP',
        defaultOpen: true,
        items: [
            { labelKey: 'vaspManagement', descKey: 'vaspManagementDesc', path: 'CryptoBankingVASPManagement', icon: Wallet, priority: true },
            { labelKey: 'cryptoCustomers', descKey: 'cryptoCustomersDesc', path: 'CryptoGatewayCustomers', icon: Users },
            { labelKey: 'cryptoTransactions', descKey: 'cryptoTransactionsDesc', path: 'CryptoGatewayTransactions', icon: Activity },
            { labelKey: 'walletsIBANs', descKey: 'walletsIBANsDesc', path: 'CryptoBankingWallets', icon: Wallet },
            { labelKey: 'complianceKYC', descKey: 'complianceKYCDesc', path: 'CryptoBankingCompliance', icon: Shield },
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
            { labelKey: 'assetIssuers', descKey: 'assetIssuersDesc', path: 'RWAPlatformIssuers', icon: Users },
            { labelKey: 'tokenizedAssets', descKey: 'tokenizedAssetsDesc', path: 'RWAPlatformAssets', icon: Package },
            { labelKey: 'investors', descKey: 'investorsDesc', path: 'RWAPlatformInvestors', icon: Users },
            { labelKey: 'rwaAnalytics', descKey: 'rwaAnalyticsDesc', path: 'RWAPlatformAnalytics', icon: BarChart3 }
        ]
    },
    {
        id: 'services-marketplace',
        title: 'Services & Marketplace',
        defaultOpen: true,
        items: [
            { label: 'Service Publication Manager', description: 'Go-to-Market rollout control', path: 'ServicePublicationManager', icon: Rocket, priority: true },
            { labelKey: 'serviceCatalog', descKey: 'serviceCatalogDesc', path: 'FTSServiceManager', icon: Package, priority: true },
            { label: 'Payment Providers', description: 'Provider pool', path: 'PaymentProviderManagement', icon: Database, priority: true },
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
        defaultOpen: true,
        subsections: [
            {
                id: 'pricing-config',
                label: 'Pricing & Configuration',
                items: [
                    { label: 'Service Configuration Hub', description: 'Configure all services', path: 'ServiceConfigurationHub', icon: Settings, priority: true },
                    { labelKey: 'masterPricing', descKey: 'masterPricingDesc', path: 'MasterPricingManagement', icon: DollarSign, priority: true },
                    { labelKey: 'platformPricing', descKey: 'platformPricingDesc', path: 'PlatformPricingConfiguration', icon: DollarSign, priority: true },
                    { label: 'Service Pricing Config', description: 'Tier pricing & FX spreads', path: 'ServicePricingConfiguration', icon: DollarSign, priority: true }
                ]
            },
            {
                id: 'billing-invoicing',
                label: 'Billing & Invoicing',
                items: [
                    { label: 'Unified Billing Dashboard', description: 'Real-time billing overview', path: 'UnifiedBillingDashboard', icon: Activity, priority: true },
                    { label: 'Usage Metering Engine', description: 'Track usage across services', path: 'UsageMeteringEngine', icon: Zap, priority: true },
                    { label: 'Invoice Generation Center', description: 'Generate multi-service invoices', path: 'InvoiceGenerationCenter', icon: FileText, priority: true }
                ]
            },
            {
                id: 'tax-compliance',
                label: 'Tax & Compliance Operations',
                items: [
                    { labelKey: 'taxManagement', descKey: 'taxManagementDesc', path: 'TaxManagement', icon: FileText, priority: true },
                    { label: 'Tax Rate Updates', description: 'Auto-sync global tax rates', path: 'TaxRateUpdateManager', icon: RefreshCw, priority: true },
                    { labelKey: 'eInvoicing', descKey: 'eInvoicingDesc', path: 'EInvoicingDashboard', icon: FileText, priority: true },
                    { label: 'E-Invoice Generator', description: 'Create & submit e-invoices', path: 'EInvoiceGenerator', icon: FileText, priority: true },
                    { label: 'Business E-Invoicing', description: 'Manage white-label org instances', path: 'BusinessEInvoiceManagement', icon: FileText, priority: true },
                    { label: 'Tax Reports & Analytics', description: 'Advanced tax reporting', path: 'TaxAdvancedReports', icon: BarChart3 },
                    { label: 'Tax Calculation Tester', description: 'Test complex tax scenarios', path: 'TaxCalculationTester', icon: Activity }
                ]
            },
            {
                id: 'integrations',
                label: 'Financial Integrations',
                items: [
                    { labelKey: 'accounting', descKey: 'accountingDesc', path: 'AccountingIntegrations', icon: Zap, priority: true },
                    { labelKey: 'customReports', descKey: 'customReportsDesc', path: 'FTSReporting', icon: FileText }
                ]
            }
        ]
    },
    {
        id: 'compliance',
        title: 'Compliance & Security',
        defaultOpen: true,
        items: [
            { label: 'E-Invoicing Compliance', description: 'Global mandates & deadlines', path: 'ComplianceMonitoringDashboard', icon: Shield, priority: true },
            { labelKey: 'leiDashboard', descKey: 'leiDashboardDesc', path: 'LEIComplianceDashboard', icon: Shield, priority: true },
            { label: 'Carbon Dashboard', description: 'Track & offset carbon footprint', path: 'CarbonDashboard', icon: Leaf, priority: true },
            { label: 'ESG Reporting', description: 'Environmental & sustainability analytics', path: 'ESGReportingDashboard', icon: TrendingUp, priority: true },
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
            { label: 'Blockchain Provisioning', description: 'Permissioned chains per customer', path: 'PlatformBlockchainProvisioning', icon: Shield, priority: true },
            { label: 'Blockchain Network Dashboard', description: 'Monitor chain performance', path: 'BlockchainNetworkDashboard', icon: Activity, priority: true },
            { label: 'Blockchain Process Flow', description: 'Detailed provisioning workflow', path: 'BlockchainProcessFlow', icon: GitBranch, priority: true },
            { labelKey: 'blockchain', descKey: 'blockchainDesc', path: 'FTSBlockchainIntegration', icon: Globe }
        ]
    },
    {
        id: 'pci-compliance',
        title: 'PCI DSS Compliance',
        defaultOpen: true,
        items: [
            { labelKey: 'pciDashboard', descKey: 'pciDashboardDesc', path: 'PCIComplianceDashboard', icon: Shield, priority: true },
            { label: 'Continuous Monitoring', description: 'Real-time automated compliance checks', path: 'PCIContinuousMonitoring', icon: Activity, priority: true },
            { label: 'Predictive Analytics', description: 'AI-powered compliance forecasting', path: 'PCIPredictiveAnalytics', icon: Brain, priority: true },
            { label: 'Workflow Automation', description: 'Automated remediation workflows', path: 'PCIWorkflowManager', icon: GitBranch, priority: true },
            { label: 'Advanced Reporting', description: 'Interactive dashboards & reports', path: 'PCIReportingDashboard', icon: BarChart3, priority: true },
            { labelKey: 'requirementsTracker', descKey: 'requirementsTrackerDesc', path: 'PCIRequirementsTracker', icon: Shield },
            { labelKey: 'evidenceVault', descKey: 'evidenceVaultDesc', path: 'PCIEvidenceVault', icon: FileText },
            { labelKey: 'controlTesting', descKey: 'controlTestingDesc', path: 'PCIControlTesting', icon: Shield },
            { labelKey: 'policyLibrary', descKey: 'policyLibraryDesc', path: 'PCIPolicyLibrary', icon: FileText },
            { labelKey: 'gapAnalysis', descKey: 'gapAnalysisDesc', path: 'PCIGapAnalysis', icon: AlertCircle },
            { labelKey: 'auditReports', descKey: 'auditReportsDesc', path: 'PCIAuditReports', icon: TrendingUp },
            { labelKey: 'qsaUserManagement', descKey: 'qsaUserManagementDesc', path: 'QSAUserManagement', icon: Users, priority: true }
        ]
    },
    {
        id: 'documentation',
        title: 'Documentation',
        defaultOpen: false,
        subsections: [
            {
                id: 'doc-hub',
                label: 'Documentation Hub',
                items: [
                    { labelKey: 'documentationHub', descKey: 'documentationHubDesc', path: 'FTSDocumentation', icon: BookOpen, priority: true }
                ],
                subsections: [

                ]
            }
        ]
    },
    {
        id: 'identity',
        title: 'Digital Identity',
        defaultOpen: true,
        items: [
            { label: 'Identity Wallet', description: 'Verifiable credentials', path: 'DigitalIdentityWallet', icon: Wallet, priority: true },
            { label: 'Credential Presentation', description: 'Share credentials', path: 'CredentialPresentation', icon: Shield, priority: true }
        ]
    },
    {
        id: 'loyalty-platform',
        title: 'Loyalty & Impact Platform',
        defaultOpen: true,
        items: [
            { label: 'Loyalty Dashboard', description: 'White-label loyalty engine', path: 'LoyaltyPlatformDashboard', icon: Trophy, priority: true },
            { label: 'Customer Onboarding', description: 'Onboard new organizations', path: 'LoyaltyCustomerOnboarding', icon: Plus, priority: true }
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
            { labelKey: 'advancedTools', descKey: 'advancedToolsDesc', path: 'ModuleCatalogTest', icon: Code },
            { labelKey: 'leiPhase1Testing', descKey: 'leiPhase1TestingDesc', path: 'LEIPhase1Testing', icon: TestTube2 }
        ]
    }
];

const processedMenuSections = flattenMenuSections(menuSections);

export default function FTSPlatformSidebar({ currentPage, userRole, userEmail, isSuperAdmin, mobileMenuOpen, setMobileMenuOpen }) {
    const { t } = useI18n();
    
    // Initialize from localStorage or default to just 'overview'
    const [openSections, setOpenSections] = React.useState(() => {
        const saved = localStorage.getItem('ftsPlatformSidebarSections');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return ['overview'];
            }
        }
        return ['overview'];
    });
    
    // Persist open sections to localStorage
    React.useEffect(() => {
        localStorage.setItem('ftsPlatformSidebarSections', JSON.stringify(openSections));
    }, [openSections]);
    
    // Auto-open section containing current page
    React.useEffect(() => {
        const currentSection = processedMenuSections.find(section => 
            section.items && section.items.some(item => item.path === currentPage)
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
        <aside className={cn(
            "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-screen",
            "transform transition-transform duration-200 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )} style={{ width: '256px' }}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between border-b border-slate-200 px-3 py-2" style={{ height: '64px' }}>
                <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/865871aa1_FTSMoney-primary-logo-RGB.jpg"
                    alt="FTS.Money"
                    className="h-auto max-h-16 object-contain flex-1"
                />
                <button
                    onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                    className="md:hidden ml-2 p-1 hover:bg-slate-100 rounded"
                >
                    <X className="h-5 w-5 text-slate-600" />
                </button>
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
                    {processedMenuSections.map((section) => {
                        const isOpen = openSections.includes(section.id);
                        const hasCurrentPage = section.items && section.items.some(item => item.path === currentPage);

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
                                        {section.items.filter(item => !item.superAdminOnly || isSuperAdmin).map((item, idx) => {
                                            // Render nested subsection header
                                            if (item.isNestedSubsectionHeader) {
                                                return (
                                                    <div key={item.id} className={cn("px-4 py-1.5", idx > 0 && "mt-2")}>
                                                        <h5 className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                            {item.label}
                                                        </h5>
                                                    </div>
                                                );
                                            }

                                            // Render subsection header
                                            if (item.isSubsectionHeader) {
                                                return (
                                                    <div key={item.id} className={cn("px-2 py-1.5", idx > 0 && "mt-3")}>
                                                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                            {item.label}
                                                        </h4>
                                                    </div>
                                                );
                                            }

                                            // Skip if no path (safety check)
                                            if (!item.path) return null;

                                            const Icon = item.icon;
                                            const isActive = currentPage === item.path;
                                            return (
                                                <a
                                                    key={item.path}
                                                    href={createPageUrl(item.path)}
                                                    onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 py-2.5 rounded-lg transition-all group",
                                                        item.isNestedItem ? "px-6" : "px-3",
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
                                                        </a>
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
                    onClick={async () => {
                        const session = localStorage.getItem('platform_admin_session');
                        if (session) {
                            const user = JSON.parse(session);
                            await AuditLogger.logLogout(
                                user.email,
                                user.id,
                                user.platform_role,
                                'client'
                            );
                        }
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