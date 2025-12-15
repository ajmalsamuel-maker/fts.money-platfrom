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
    Package
} from 'lucide-react';

const menuItems = [
    { icon: Building2, label: 'Tenants', path: 'TenantManagement', description: 'Multi-tenancy', new: true, superAdminOnly: true },
    { icon: Building2, label: 'PSP Instances', path: 'PSPProvisioning', description: 'Manage PSPs' },
    { icon: Activity, label: 'Provisioning Queue', path: 'FTSProvisioningQueue', description: 'Deploy PSPs', new: true },
    { icon: Users, label: 'Platform Users', path: 'PlatformUserManagement', description: 'Admin users', new: true },
    { icon: Users, label: 'PSP Users', path: 'PSPUserManagement', description: 'Manage PSP users' },
    { icon: BarChart3, label: 'Analytics', path: 'FTSAnalytics', description: 'Cross-PSP metrics' },
    { icon: DollarSign, label: 'Revenue', path: 'FTSRevenue', description: 'Billing & revenue' },
    { icon: Users, label: 'Clients', path: 'FTSClients', description: 'Client management' },
    { icon: Package, label: 'Service Catalog', path: 'FTSServiceManager', description: 'NetXHub services', new: true },
    { icon: Database, label: 'Provider Pool', path: 'FTSProviderPool', description: 'Payment providers', new: true },
    { icon: Wallet, label: 'Payout Routes', path: 'FTSPayoutRoutes', description: 'Payout methods', new: true },
    { icon: Zap, label: 'Fee Templates', path: 'FTSFeeTemplates', description: 'Pricing templates', new: true },
    { icon: Sparkles, label: 'Service Registry', path: 'FTSServiceRegistry', description: 'Marketplace services', new: true },
    { icon: Users, label: 'Service Providers', path: 'FTSServiceProviders', description: '3rd party providers', new: true },
    { icon: Shield, label: 'Compliance', path: 'FTSCompliance', description: 'Policy templates', new: true },
    { icon: FileText, label: 'Audit Logs', path: 'PlatformAuditLogs', description: 'Activity tracking', new: true },
    { icon: Settings, label: 'Platform Settings', path: 'FTSSettings', description: 'Configuration' },
    { icon: BookOpen, label: 'Architecture Docs', path: 'FTSArchitectureDoc', description: 'System blueprint', new: true }
];

export default function FTSPlatformSidebar({ currentPage, userRole, userEmail, isSuperAdmin }) {
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">FTS.Money</h1>
                        <p className="text-[10px] text-slate-600">Control Panel</p>
                    </div>
                </div>
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
                <div className="space-y-1">
                    {menuItems.filter(item => !item.superAdminOnly || isSuperAdmin).map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={createPageUrl(item.path)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {item.new && <Badge variant="secondary" className="text-[10px] px-1 py-0">NEW</Badge>}
                                    </div>
                                    <p className="text-xs text-slate-500">{item.description}</p>
                                </div>
                            </Link>
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