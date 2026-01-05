import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { 
    Building2, BarChart3, DollarSign, Users, Settings, Shield, Database,
    Globe, Wallet, Zap, FileText, Activity, BookOpen, LogOut, Package,
    GitBranch, Workflow, Code, TestTube2, ChevronDown, ChevronRight, Rocket
} from 'lucide-react';

/**
 * Fully restructured Platform Admin Sidebar
 * Implements 3-level hierarchy with progressive disclosure
 */
export default function FTSPlatformSidebarRestructured({ currentPage, userRole, userEmail, isSuperAdmin }) {
    const menuSections = [
        {
            id: 'control-plane',
            title: 'Control Plane',
            defaultOpen: true,
            items: [
                { label: 'Dashboard', path: 'FTSMoneyPlatform', icon: Activity, description: 'Overview', priority: true },
                { label: 'System Health', path: 'FTSSystemHealth', icon: Activity, description: 'Monitoring' },
                { label: 'Setup Guide', path: 'FTSSetupGuide', icon: BookOpen, description: 'Quick start' }
            ]
        },
        {
            id: 'customer-management',
            title: 'Customer Management',
            defaultOpen: false,
            items: [
                { label: 'PSP Operations', path: 'PSPProvisioning', icon: Building2, description: 'All PSPs', priority: true },
                { label: 'Provisioning Queue', path: 'FTSProvisioningQueue', icon: Activity, description: 'Deploy status' },
                { label: 'Community Users', path: 'CommunityUserManagement', icon: Users, description: 'Portal users' },
                { label: 'PSP Staff', path: 'PSPUserManagement', icon: Users, description: 'PSP admin' },
                { label: 'ISO Gateway Users', path: 'ISOGatewayUserManagement', icon: Code, description: 'ISO RBAC' },
                { label: 'Orchestration Users', path: 'OrchestrationUserManagement', icon: GitBranch, description: 'Orch RBAC' },
                { label: 'Crypto Banking Users', path: 'CryptoGatewayUserManagement', icon: Wallet, description: 'Crypto RBAC' },
                { label: 'RWA Platform Users', path: 'RWAProviderUserManagement', icon: Rocket, description: 'RWA RBAC' },
                { label: 'Role & Permissions', path: 'RolePermissionManagement', icon: Shield, description: 'Edit matrix', priority: true },
                { label: 'Client Accounts', path: 'FTSClients', icon: Users, description: 'Customers' },
                { label: 'Tenants', path: 'TenantManagement', icon: Building2, description: 'Multi-tenancy', superAdminOnly: true }
            ]
        },
        {
            id: 'financial',
            title: 'Financial Operations',
            defaultOpen: false,
            items: [
                { label: 'Revenue Dashboard', path: 'FTSRevenue', icon: BarChart3, description: 'Consolidated', priority: true },
                { label: 'Service Billing', path: 'FTSServiceBilling', icon: FileText, description: 'ISO & Orch', priority: true },
                { label: 'Master Pricing', path: 'MasterPricingManagement', icon: DollarSign, description: 'All pricing' },
                { label: 'Platform Pricing', path: 'PlatformPricingConfiguration', icon: DollarSign, description: 'PSP tiers' },
                { label: 'Xero Integration', path: 'XeroIntegration', icon: Zap, description: 'Accounting' }
            ]
        },
        {
            id: 'marketplace',
            title: 'Marketplace & Services',
            defaultOpen: false,
            items: [
                { label: 'Service Catalog', path: 'FTSServiceManager', icon: Package, description: 'All services', priority: true },
                { label: 'Payment Providers', path: 'FTSProviderPool', icon: Database, description: 'Provider pool' },
                { label: 'Payout Routes', path: 'FTSPayoutRoutes', icon: Wallet, description: 'Methods' },
                { label: 'Service Providers', path: 'FTSServiceProviders', icon: Users, description: 'Vendors' },
                { label: 'Wholesale Marketplace', path: 'PSPWholesaleMarketplace', icon: Building2, description: 'PSP-to-PSP' }
            ]
        },
        {
            id: 'infrastructure',
            title: 'Infrastructure',
            defaultOpen: false,
            items: [
                { label: 'Resource Orchestration', path: 'ResourceOrchestration', icon: Activity, description: 'Auto-scale' },
                { label: 'API Gateway', path: 'APIGatewayConfiguration', icon: Zap, description: 'Config' },
                { label: 'Domain Management', path: 'FTSDomainManagement', icon: Globe, description: 'SSL/DNS' },
                { label: 'Integrations', path: 'FTSBlockchainIntegration', icon: Globe, description: 'Blockchain' }
            ]
        },
        {
            id: 'crypto-banking',
            title: 'Crypto Banking Service',
            defaultOpen: false,
            collapsed: true,
            items: [
                { label: 'Overview', path: 'StrigaServiceManagement', icon: BarChart3, description: 'Dashboard', priority: true },
                { label: 'Customers', path: 'CryptoGatewayCustomers', icon: Users, description: 'All customers', priority: true },
                { label: 'User Management', path: 'CryptoGatewayUserManagement', icon: Users, description: 'RBAC' },
                { label: 'KYC/KYB Verification', path: 'CryptoKYCManagement', icon: Shield, description: 'Compliance' },
                { label: 'Transactions', path: 'CryptoGatewayTransactions', icon: Activity, description: 'All txns' },
                { label: 'Portal Management', path: 'CryptoPortalManagement', icon: Settings, description: 'Customize' }
            ]
        },
        {
            id: 'iso-gateway',
            title: 'ISO Gateway Service',
            defaultOpen: false,
            items: [
                { label: 'Test Console', path: 'ISOGatewayTestConsole', icon: Code, description: 'API test', priority: true },
                { label: 'Customers', path: 'ISOGatewayCustomers', icon: Zap, description: 'Subscribers' },
                { label: 'User Management', path: 'ISOGatewayUserManagement', icon: Users, description: 'RBAC' },
                { label: 'Connections', path: 'ISOGatewayConnections', icon: GitBranch, description: 'Routing' },
                { label: 'Message Monitor', path: 'ISOMessageMonitor', icon: Activity, description: 'Logs' }
            ]
        },
        {
            id: 'orchestration',
            title: 'Orchestration Service',
            defaultOpen: false,
            items: [
                { label: 'Customers', path: 'OrchestrationCustomers', icon: GitBranch, description: 'Subscribers', priority: true },
                { label: 'User Management', path: 'OrchestrationUserManagement', icon: Users, description: 'RBAC' }
            ]
        },
        {
            id: 'rwa-platform',
            title: 'RWA Platform',
            defaultOpen: false,
            items: [
                { label: 'Smart Contracts', path: 'RWAPlatform', icon: Code, description: 'View/download', priority: true },
                { label: 'Provision Customers', path: 'RWAWhiteLabelProvisioning', icon: Rocket, description: 'White-label', priority: true },
                { label: 'User Management', path: 'RWAProviderUserManagement', icon: Users, description: 'RBAC' }
            ]
        },
        {
            id: 'analytics',
            title: 'Analytics & Reports',
            defaultOpen: false,
            items: [
                { label: 'Platform Analytics', path: 'FTSAnalytics', icon: BarChart3, description: 'Insights' },
                { label: 'Custom Reports', path: 'FTSReporting', icon: FileText, description: 'Builder' }
            ]
        },
        {
            id: 'compliance',
            title: 'Compliance & Security',
            defaultOpen: false,
            items: [
                { label: 'LEI/vLEI Dashboard', path: 'LEIComplianceDashboard', icon: Shield, description: 'Credentials', priority: true },
                { label: 'Testing', path: 'FTSComplianceTesting', icon: TestTube2, description: 'Validation' },
                { label: 'Audit Logs', path: 'EnhancedAuditLogs', icon: FileText, description: 'All logs' },
                { label: 'Policies', path: 'FTSCompliance', icon: Shield, description: 'Framework' },
                { label: 'Workflows', path: 'WorkflowManagement', icon: GitBranch, description: 'Processes' },
                { label: 'Data Retention', path: 'DataRetentionManagement', icon: Database, description: 'GDPR' }
            ]
        },
        {
            id: 'documentation',
            title: 'Documentation',
            defaultOpen: false,
            collapsed: true,
            items: [
                { label: 'Portal Guides', path: 'FTSDocumentation', icon: BookOpen, description: 'All 6 portals', priority: true },
                { label: 'Architecture', path: 'FTSArchitectureDoc', icon: BookOpen, description: 'System design' },
                { label: 'Product Ecosystem', path: 'FTSProductEcosystemReport', icon: Package, description: 'Products' },
                { label: 'Vertical Solutions', path: 'FTSVerticalSolutions', icon: Building2, description: 'Industries' }
            ]
        },
        {
            id: 'settings',
            title: 'Settings',
            defaultOpen: false,
            collapsed: true,
            items: [
                { label: 'Platform Config', path: 'FTSSettings', icon: Settings, description: 'System' },
                { label: 'Advanced Tools', path: 'ModuleCatalogTest', icon: Code, description: 'Testing' }
            ]
        }
    ];

    const [openSections, setOpenSections] = useState(
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
            <div className="h-16 flex items-center justify-center border-b border-slate-200 px-3" style={{ height: '64px' }}>
                <img 
                    src={FTS_LOGOS.primary}
                    alt="FTS.Money"
                    className="w-full h-auto max-h-12 object-contain"
                />
            </div>

            {/* User Info */}
            {userEmail && (
                <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
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
                <div className="space-y-3">
                    {menuSections.map((section) => {
                        const isOpen = openSections.includes(section.id);
                        const hasActivePage = section.items.some(item => item.path === currentPage);

                        return (
                            <Collapsible
                                key={section.id}
                                open={isOpen}
                                onOpenChange={() => toggleSection(section.id)}
                            >
                                <CollapsibleTrigger className="w-full group">
                                    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                                        <span className={cn(
                                            "text-xs font-semibold uppercase tracking-wider",
                                            hasActivePage ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
                                        )}>
                                            {section.title}
                                        </span>
                                        {isOpen ? (
                                            <ChevronDown className="h-3 w-3 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="h-3 w-3 text-slate-400" />
                                        )}
                                    </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="mt-1">
                                    <div className="space-y-0.5">
                                        {section.items.filter(item => !item.superAdminOnly || isSuperAdmin).map((item) => {
                                            const Icon = item.icon;
                                            const isActive = currentPage === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={createPageUrl(item.path)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden",
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
                                                            {item.superAdminOnly && (
                                                                <Badge className="text-[9px] px-1 py-0 bg-red-100 text-red-700 border-red-300">
                                                                    ADMIN
                                                                </Badge>
                                                            )}
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
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 p-3">
                <button
                    onClick={() => {
                        localStorage.removeItem('platform_admin_session');
                        window.location.href = '/PlatformAdminLogin';
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
                <div className="mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>All systems operational</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}