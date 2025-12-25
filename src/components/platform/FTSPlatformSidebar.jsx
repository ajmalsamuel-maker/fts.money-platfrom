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
    TestTube2
} from 'lucide-react';

const menuSections = [
    {
        title: 'Dashboard',
        items: [
            { icon: Activity, label: 'Home', path: 'FTSMoneyPlatform', description: 'Quick actions', priority: true },
            { icon: BookOpen, label: 'Setup Guide', path: 'FTSSetupGuide', description: 'How to access services', priority: true }
        ]
    },
    {
        title: 'PSP Operations',
        items: [
            { icon: Building2, label: 'PSP Instances', path: 'PSPProvisioning', description: 'Manage all PSPs', priority: true },
            { icon: Activity, label: 'Provisioning Queue', path: 'FTSProvisioningQueue', description: 'Deploy & monitor' },
            { icon: Users, label: 'Client Accounts', path: 'FTSClients', description: 'Client management' }
        ]
    },
    {
        title: 'Users & Access',
        items: [
            { icon: Users, label: 'Platform Team', path: 'PlatformUserManagement', description: 'FTS administrators' },
            { icon: Users, label: 'Community Users', path: 'CommunityUserManagement', description: 'Portal users & PSP owners' },
            { icon: Users, label: 'PSP Administrators', path: 'PSPUserManagement', description: 'PSP owners & staff' },
            { icon: Building2, label: 'Tenants', path: 'TenantManagement', description: 'Multi-tenancy control', superAdminOnly: true }
        ]
    },
    {
        title: 'Financial Management',
        items: [
            { icon: DollarSign, label: 'Master Pricing', path: 'MasterPricingManagement', description: 'All pricing control', priority: true },
            { icon: BarChart3, label: 'Revenue Dashboard', path: 'FTSRevenue', description: 'Analytics & billing' },
            { icon: DollarSign, label: 'Platform Pricing', path: 'PlatformPricingConfiguration', description: 'PSP tier pricing' },
            { icon: DollarSign, label: 'Merchant Pricing Engine', path: 'MerchantPricingEngine', description: 'Dynamic merchant pricing' },
            { icon: Zap, label: 'Accounting Integration', path: 'XeroIntegration', description: 'Xero sync' }
        ]
    },
    {
        title: 'Marketplace',
        items: [
            { icon: Database, label: 'Payment Providers', path: 'FTSProviderPool', description: 'Provider pool' },
            { icon: Wallet, label: 'Payout Routes', path: 'FTSPayoutRoutes', description: 'Payout methods' },
            { icon: Package, label: 'Available Services', path: 'FTSServiceManager', description: 'Service catalog' },
            { icon: Users, label: 'Service Providers', path: 'FTSServiceProviders', description: '3rd party vendors' },
            { icon: Building2, label: 'PSP Wholesale', path: 'PSPWholesaleMarketplace', description: 'PSP-to-PSP marketplace', priority: true },
            { icon: Package, label: 'Product Templates', path: 'ProductTemplateLibrary', description: 'Template library' },
            { icon: Workflow, label: 'Workflow Templates', path: 'WorkflowTemplateLibrary', description: 'Workflow library' },
            { icon: Package, label: 'Community Products', path: 'CommunityProductCatalog', description: 'Community catalog' }
        ]
    },
    {
        title: 'Infrastructure',
        items: [
            { icon: Activity, label: 'Resource Management', path: 'ResourceOrchestration', description: 'Capacity & auto-scaling' },
            { icon: Zap, label: 'API Gateway', path: 'APIGatewayConfiguration', description: 'Configuration & monitoring' },
            { icon: Globe, label: 'Domain Management', path: 'FTSDomainManagement', description: 'SSL & DNS' },
            { icon: Globe, label: 'Integrations Hub', path: 'FTSBlockchainIntegration', description: 'Blockchain, Open Banking, Registries' }
        ]
    },
    {
        title: 'ISO Gateway Service',
        items: [
            { icon: Code, label: 'Test Console', path: 'ISOGatewayTestConsole', description: 'API testing & docs', priority: true },
            { icon: Zap, label: 'Customers', path: 'ISOGatewayCustomers', description: 'Service subscribers' },
            { icon: GitBranch, label: 'Connections', path: 'ISOGatewayConnections', description: 'Translation routing' },
            { icon: Activity, label: 'Message Monitor', path: 'ISOMessageMonitor', description: 'Real-time logs' }
        ]
    },
    {
        title: 'Orchestration Service',
        items: [
            { icon: GitBranch, label: 'Customers', path: 'OrchestrationCustomers', description: 'Routing subscribers', priority: true }
        ]
    },
    {
        title: 'Analytics & Reports',
        items: [
            { icon: BarChart3, label: 'Platform Analytics', path: 'FTSAnalytics', description: 'Cross-PSP insights' },
            { icon: FileText, label: 'Custom Reports', path: 'FTSReporting', description: 'Report builder' }
        ]
    },
    {
        title: 'Compliance & Security',
        items: [
            { icon: Shield, label: 'LEI/vLEI Management', path: 'LEIComplianceDashboard', description: 'Credential tracking', priority: true },
            { icon: TestTube2, label: 'Testing & Validation', path: 'FTSComplianceTesting', description: 'Compliance tests' },
            { icon: FileText, label: 'Audit Trail', path: 'EnhancedAuditLogs', description: 'All logs & AI detection' },
            { icon: Shield, label: 'Policy Templates', path: 'FTSCompliance', description: 'Compliance policies' },
            { icon: GitBranch, label: 'ISO Workflows', path: 'WorkflowManagement', description: 'ISO compliance processes' },
            { icon: Database, label: 'Data Retention', path: 'DataRetentionManagement', description: 'GDPR & cleanup' }
        ]
    },
    {
        title: 'Documentation',
        collapsed: true,
        items: [
            { icon: BookOpen, label: 'Platform Architecture', path: 'FTSArchitectureDoc', description: 'System architecture' },
            { icon: Package, label: 'Product Ecosystem', path: 'FTSProductEcosystemReport', description: 'Products & revenue models' },
            { icon: Building2, label: 'Vertical Solutions', path: 'FTSVerticalSolutions', description: 'Industry-specific offerings' }
        ]
    },
    {
        title: 'Settings',
        collapsed: true,
        items: [
            { icon: Settings, label: 'Platform Configuration', path: 'FTSSettings', description: 'System settings' },
            { icon: Code, label: 'Advanced Tools', path: 'ModuleCatalogTest', description: 'Module testing' }
        ]
    }
];

export default function FTSPlatformSidebar({ currentPage, userRole, userEmail, isSuperAdmin }) {
    const [pinnedSection, setPinnedSection] = React.useState(null);
    
    // Auto-pin the section containing the current page
    React.useEffect(() => {
        const currentSection = menuSections.find(section => 
            section.items.some(item => item.path === currentPage)
        );
        if (currentSection && !pinnedSection) {
            setPinnedSection(currentSection.title);
        }
    }, [currentPage]);
    
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center border-b border-slate-200 px-3 py-2">
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
                <div className="space-y-5">
                    {menuSections.map((section) => {
                            const [isCollapsed, setIsCollapsed] = React.useState(section.collapsed || false);
                            const isPinned = pinnedSection === section.title;
                            const hasCurrentPage = section.items.some(item => item.path === currentPage);

                            return (
                                <div key={section.title} className={hasCurrentPage ? 'bg-blue-50/50 -mx-2 px-2 py-1 rounded-lg' : ''}>
                                    <div className="flex items-center justify-between px-3 mb-2">
                                        <h3 className={cn(
                                            "text-xs font-semibold uppercase tracking-wider",
                                            hasCurrentPage ? "text-blue-700" : "text-slate-500"
                                        )}>
                                            {section.title}
                                            {hasCurrentPage && <span className="ml-1">📍</span>}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            {!section.collapsed && (
                                                <button
                                                    onClick={() => setPinnedSection(isPinned ? null : section.title)}
                                                    className="text-slate-400 hover:text-blue-600 text-xs"
                                                    title={isPinned ? "Unpin" : "Pin section"}
                                                >
                                                    {isPinned ? '📌' : '📍'}
                                                </button>
                                            )}
                                            {section.collapsed !== undefined && (
                                                <button
                                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                                    className="text-slate-400 hover:text-slate-600"
                                                >
                                                    {isCollapsed ? '▶' : '▼'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {(!isCollapsed || isPinned) && (
                                    <div className="space-y-1">
                                        {section.items.filter(item => !item.superAdminOnly || isSuperAdmin).map((item) => {
                                            const Icon = item.icon;
                                            const isActive = currentPage === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={createPageUrl(item.path)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                                                        isActive
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium truncate">{item.label}</span>
                                                            {item.priority && <span className="text-xs">⭐</span>}
                                                            {item.superAdminOnly && <Badge className="text-[9px] px-1 py-0 bg-red-100 text-red-700 border-red-300">ADMIN</Badge>}
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{item.description}</p>
                                                    </div>
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