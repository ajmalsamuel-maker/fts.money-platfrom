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
    Briefcase
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuSections = [
    {
        id: 'overview',
        title: 'Overview & Insights',
        defaultOpen: true,
        items: [
            { label: 'Platform Dashboard', path: 'FTSMoneyPlatform', icon: Activity, description: 'Platform overview', priority: true },
            { label: 'System Health', path: 'FTSSystemHealth', icon: Activity, description: 'Real-time monitoring' },
            { label: 'Revenue Dashboard', path: 'FTSRevenue', icon: BarChart3, description: 'Financial overview', priority: true },
            { label: 'Platform Analytics', path: 'FTSAnalytics', icon: BarChart3, description: 'Cross-platform insights' },
            { label: 'Setup Guide', path: 'FTSSetupGuide', icon: BookOpen, description: 'Quick start guide' }
        ]
    },
    {
        id: 'psp-operations',
        title: 'PSP Operations',
        defaultOpen: false,
        items: [
            { label: 'PSP Management', path: 'PSPProvisioning', icon: Building2, description: 'Manage all PSPs', priority: true },
            { label: 'Provisioning Queue', path: 'FTSProvisioningQueue', icon: Activity, description: 'Deploy & monitor' },
            { label: 'PSP Administrators', path: 'PSPUserManagement', icon: Users, description: 'PSP staff' },
            { label: 'Resource Orchestration', path: 'ResourceOrchestration', icon: Workflow, description: 'Auto-scaling' }
        ]
    },
    {
        id: 'crypto-gateway',
        title: 'Crypto Banking Gateway',
        defaultOpen: false,
        items: [
            { label: 'Gateway Dashboard', path: 'CryptoGatewayDashboard', icon: CreditCard, description: 'Crypto overview', priority: true },
            { label: 'Crypto Customers', path: 'CryptoGatewayCustomers', icon: Users, description: 'White-label clients' },
            { label: 'Crypto Transactions', path: 'CryptoGatewayTransactions', icon: Activity, description: 'Transaction monitor' },
            { label: 'Wallets & IBANs', path: 'CryptoWallets', icon: Wallet, description: 'Wallet management' },
            { label: 'Compliance/KYC', path: 'CryptoCompliance', icon: Shield, description: 'KYC management' },
            { label: 'Striga Settings', path: 'StrigaServiceManagement', icon: Settings, description: 'Integration config' }
        ]
    },
    {
        id: 'rwa-platform',
        title: 'RWA Tokenization Platform',
        defaultOpen: false,
        items: [
            { label: 'RWA Dashboard', path: 'RWAPlatform', icon: Briefcase, description: 'RWA overview', priority: true },
            { label: 'RWA Providers', path: 'RWAWhiteLabelProvisioning', icon: Building2, description: 'White-label customers' },
            { label: 'Asset Issuers', path: 'RWAProviderIssuers', icon: Users, description: 'Issuer management' },
            { label: 'Tokenized Assets', path: 'RWAProviderAssets', icon: Package, description: 'Asset catalog' },
            { label: 'Investors', path: 'RWAProviderInvestors', icon: Users, description: 'Investor base' },
            { label: 'RWA Analytics', path: 'RWAProviderAnalytics', icon: BarChart3, description: 'Performance metrics' }
        ]
    },
    {
        id: 'services-marketplace',
        title: 'Services & Marketplace',
        defaultOpen: false,
        items: [
            { label: 'Service Catalog', path: 'FTSServiceManager', icon: Package, description: 'All services', priority: true },
            { label: 'ISO Gateway', path: 'ISOGatewayCustomers', icon: Code, description: 'ISO customers', priority: true },
            { label: 'ISO Connections', path: 'ISOGatewayConnections', icon: GitBranch, description: 'Translation routing' },
            { label: 'ISO Test Console', path: 'ISOGatewayTestConsole', icon: TestTube2, description: 'API testing' },
            { label: 'ISO Message Monitor', path: 'ISOMessageMonitor', icon: Activity, description: 'Real-time logs' },
            { label: 'Orchestration', path: 'OrchestrationCustomers', icon: Workflow, description: 'Routing customers', priority: true },
            { label: 'Payment Providers', path: 'FTSProviderPool', icon: Database, description: 'Provider pool' },
            { label: 'Payout Routes', path: 'FTSPayoutRoutes', icon: Wallet, description: 'Payout methods' },
            { label: 'Service Providers', path: 'FTSServiceProviders', icon: Users, description: 'Vendors' },
            { label: 'Wholesale Marketplace', path: 'PSPWholesaleMarketplace', icon: Building2, description: 'PSP-to-PSP' }
        ]
    },
    {
        id: 'user-management',
        title: 'User & Access Management',
        defaultOpen: false,
        items: [
            { label: 'Platform Admins', path: 'PlatformUserManagement', icon: Shield, description: 'FTS administrators', priority: true },
            { label: 'Community Users', path: 'CommunityUserManagement', icon: Users, description: 'Portal users' },
            { label: 'ISO Gateway Users', path: 'ISOGatewayUserManagement', icon: Code, description: 'ISO RBAC' },
            { label: 'Orchestration Users', path: 'OrchestrationUserManagement', icon: GitBranch, description: 'Orch RBAC' },
            { label: 'Crypto Banking Users', path: 'CryptoGatewayUserManagement', icon: Wallet, description: 'Crypto RBAC' },
            { label: 'RWA Platform Users', path: 'RWAProviderUserManagement', icon: Briefcase, description: 'RWA RBAC' },
            { label: 'Role & Permissions', path: 'RolePermissionManagement', icon: Shield, description: 'Edit matrix', priority: true },
            { label: 'Client Accounts', path: 'FTSClients', icon: Users, description: 'Client management' },
            { label: 'Tenant Management', path: 'TenantManagement', icon: Building2, description: 'Multi-tenancy', superAdminOnly: true }
        ]
    },
    {
        id: 'financial',
        title: 'Financial Operations',
        defaultOpen: false,
        items: [
            { label: 'Service Billing', path: 'FTSServiceBilling', icon: FileText, description: 'ISO & Orchestration', priority: true },
            { label: 'Master Pricing', path: 'MasterPricingManagement', icon: DollarSign, description: 'All pricing control' },
            { label: 'Platform Pricing', path: 'PlatformPricingConfiguration', icon: DollarSign, description: 'PSP tier pricing' },
            { label: 'Custom Reports', path: 'FTSReporting', icon: FileText, description: 'Report builder' },
            { label: 'Accounting', path: 'XeroIntegration', icon: Zap, description: 'Xero integration' }
        ]
    },
    {
        id: 'compliance',
        title: 'Compliance & Security',
        defaultOpen: false,
        items: [
            { label: 'LEI/vLEI Dashboard', path: 'LEIComplianceDashboard', icon: Shield, description: 'Credentials', priority: true },
            { label: 'Compliance Testing', path: 'FTSComplianceTesting', icon: TestTube2, description: 'Validation' },
            { label: 'Platform Audit Logs', path: 'PlatformAuditLogs', icon: FileText, description: 'Complete audit trail', priority: true },
            { label: 'Access Logs', path: 'EnhancedAuditLogs', icon: FileText, description: 'Access analytics' },
            { label: 'Policy Management', path: 'FTSCompliance', icon: Shield, description: 'Policies' },
            { label: 'Workflows', path: 'WorkflowManagement', icon: GitBranch, description: 'ISO processes' },
            { label: 'Data Retention', path: 'DataRetentionManagement', icon: Database, description: 'GDPR' }
        ]
    },
    {
        id: 'infrastructure',
        title: 'Infrastructure',
        defaultOpen: false,
        items: [
            { label: 'Domain Management', path: 'FTSDomainManagement', icon: Globe, description: 'SSL & DNS' },
            { label: 'API Gateway', path: 'APIGatewayConfiguration', icon: Zap, description: 'Configuration' },
            { label: 'Blockchain', path: 'FTSBlockchainIntegration', icon: Globe, description: 'Blockchain integrations' }
        ]
    },
    {
        id: 'resources',
        title: 'Settings & Resources',
        defaultOpen: false,
        items: [
            { label: 'Platform Config', path: 'FTSSettings', icon: Settings, description: 'System settings' },
            { label: 'Documentation', path: 'FTSDocumentation', icon: BookOpen, description: 'Complete platform docs', priority: true },
            { label: 'Architecture', path: 'FTSArchitectureDoc', icon: BookOpen, description: 'System design' },
            { label: 'Product Ecosystem', path: 'FTSProductEcosystemReport', icon: Package, description: 'Products & models' },
            { label: 'Vertical Solutions', path: 'FTSVerticalSolutions', icon: Building2, description: 'Industry offerings' },
            { label: 'Advanced Tools', path: 'ModuleCatalogTest', icon: Code, description: 'Module testing' },
            { label: 'LEI Phase 1 Testing', path: 'LEIPhase1Testing', icon: TestTube2, description: 'Test LEI integration' }
        ]
    }
];

export default function FTSPlatformSidebar({ currentPage, userRole, userEmail, isSuperAdmin }) {
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
                                        {section.title}
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
                                                            <span className="text-sm font-medium truncate">{item.label}</span>
                                                            {item.priority && <span className="text-xs">⭐</span>}
                                                            {item.superAdminOnly && <Badge className="text-[9px] px-1 py-0 bg-red-100 text-red-700 border-red-300">ADMIN</Badge>}
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-xs text-slate-500 truncate">{item.description}</p>
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