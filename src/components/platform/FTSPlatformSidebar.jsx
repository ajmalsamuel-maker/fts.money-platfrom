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
    GitBranch
} from 'lucide-react';

const menuSections = [
    {
        title: 'Dashboard',
        items: [
            { icon: Activity, label: 'Home', path: 'FTSMoneyPlatform', description: 'Quick Actions' }
        ]
    },
    {
        title: 'Core Management',
        items: [
            { icon: Building2, label: 'Tenants', path: 'TenantManagement', description: 'Multi-tenancy', superAdminOnly: true },
            { icon: Building2, label: 'PSP Instances', path: 'PSPProvisioning', description: 'Manage PSPs' },
            { icon: Activity, label: 'Provisioning Queue', path: 'FTSProvisioningQueue', description: 'Deploy PSPs' },
            { icon: Users, label: 'Platform Users', path: 'PlatformUserManagement', description: 'Admin users' },
            { icon: Users, label: 'PSP Users', path: 'PSPUserManagement', description: 'PSP access' },
            { icon: Users, label: 'Clients', path: 'FTSClients', description: 'Client accounts' }
        ]
    },
    {
        title: 'Analytics & Reporting',
        items: [
            { icon: BarChart3, label: 'Analytics', path: 'FTSAnalytics', description: 'Cross-PSP metrics' },
            { icon: FileText, label: 'Reports', path: 'FTSReporting', description: 'Advanced reporting' },
            { icon: DollarSign, label: 'Revenue', path: 'FTSRevenue', description: 'Billing & revenue' }
        ]
    },
    {
        title: 'PSP Empowerment',
        items: [
            { icon: Package, label: 'PSP Product Catalog', path: 'PSPProductCatalog', description: 'PSP product definitions' }
        ]
    },
    {
        title: 'Marketplace & Services',
        items: [
            { icon: Package, label: 'Service Catalog', path: 'FTSServiceManager', description: 'NetXHub services' },
            { icon: Users, label: 'Service Providers', path: 'FTSServiceProviders', description: '3rd party providers' },
            { icon: Package, label: 'Product Catalog', path: 'CommunityProductCatalog', description: 'Community products' },
            { icon: Database, label: 'Provider Pool', path: 'FTSProviderPool', description: 'Payment providers' },
            { icon: Wallet, label: 'Payout Routes', path: 'FTSPayoutRoutes', description: 'Payout methods' }
        ]
    },
    {
        title: 'Infrastructure',
        items: [
            { icon: Activity, label: 'Resource Orchestration', path: 'ResourceOrchestration', description: 'Capacity & auto-scaling' },
            { icon: Zap, label: 'API Gateway', path: 'APIGatewayConfiguration', description: 'Kong + Orchestration' },
            { icon: Globe, label: 'Domain & SSL', path: 'FTSDomainManagement', description: 'Domains & certificates' },
            { icon: Globe, label: 'Blockchain', path: 'FTSBlockchainIntegration', description: 'Crypto rails & ISO' },
            { icon: CreditCard, label: 'Open Banking', path: 'OpenBankingConfiguration', description: 'TrueLayer, Tink, Brankas' },
            { icon: Database, label: 'Financial Registries', path: 'FTSFinancialRegistries', description: 'BIN, IBAN, BIC/SWIFT' }
        ]
    },
    {
        title: 'Financial Management',
        items: [
            { icon: DollarSign, label: 'Master Pricing', path: 'MasterPricingManagement', description: 'Comprehensive pricing & fee control' },
            { icon: DollarSign, label: 'Xero Integration', path: 'XeroIntegration', description: 'Accounting sync' }
        ]
    },
    {
        title: 'Compliance & Security',
        items: [
            { icon: Shield, label: 'Compliance', path: 'FTSCompliance', description: 'Policy templates' },
            { icon: GitBranch, label: 'Workflow Management', path: 'WorkflowManagement', description: 'ISO standards compliance' },
            { icon: FileText, label: 'Audit Logs', path: 'PlatformAuditLogs', description: 'Activity tracking' },
            { icon: Activity, label: 'Enhanced Audit Logs', path: 'EnhancedAuditLogs', description: 'AI anomaly detection' },
            { icon: Database, label: 'Data Retention', path: 'DataRetentionManagement', description: 'Automated cleanup' }
        ]
    },
    {
        title: 'System',
        items: [
            { icon: Settings, label: 'Platform Settings', path: 'FTSSettings', description: 'Configuration' },
            { icon: BookOpen, label: 'Architecture Docs', path: 'FTSArchitectureDoc', description: 'System blueprint' },
            { icon: BookOpen, label: 'Implementation Roadmap', path: 'PSPEmpowermentRoadmap', description: 'Feature development plan' }
        ]
    }
];

export default function FTSPlatformSidebar({ currentPage, userRole, userEmail, isSuperAdmin }) {
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
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                                {section.title}
                            </h3>
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
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{item.description}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
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