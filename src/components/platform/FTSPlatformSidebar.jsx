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
    BookOpen
} from 'lucide-react';

const menuItems = [
    { icon: Building2, label: 'PSP Instances', path: 'PSPProvisioning', description: 'Manage PSPs' },
    { icon: Activity, label: 'Provisioning Queue', path: 'FTSProvisioningQueue', description: 'Deploy PSPs', new: true },
    { icon: Sparkles, label: 'Community Market', path: 'CommunityMarketplace', description: 'Browse & subscribe', new: true },
    { icon: BarChart3, label: 'Analytics', path: 'FTSAnalytics', description: 'Cross-PSP metrics' },
    { icon: DollarSign, label: 'Revenue', path: 'FTSRevenue', description: 'Billing & revenue' },
    { icon: Users, label: 'Clients', path: 'FTSClients', description: 'Client management' },
    { icon: Database, label: 'Provider Pool', path: 'FTSProviderPool', description: 'Payment providers', new: true },
    { icon: Wallet, label: 'Payout Routes', path: 'FTSPayoutRoutes', description: 'Payout methods', new: true },
    { icon: Zap, label: 'Fee Templates', path: 'FTSFeeTemplates', description: 'Pricing templates', new: true },
    { icon: Sparkles, label: 'Service Registry', path: 'FTSServiceRegistry', description: 'Marketplace services', new: true },
    { icon: Users, label: 'Service Providers', path: 'FTSServiceProviders', description: '3rd party providers', new: true },
    { icon: Shield, label: 'Compliance', path: 'FTSCompliance', description: 'Policy templates', new: true },
    { icon: FileText, label: 'Audit Logs', path: 'FTSAuditLogs', description: 'System audit', new: true },
    { icon: Settings, label: 'Platform Settings', path: 'FTSSettings', description: 'Configuration' },
    { icon: BookOpen, label: 'Architecture Docs', path: 'FTSArchitectureDoc', description: 'System blueprint', new: true }
];

export default function FTSPlatformSidebar({ currentPage, userRole }) {
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
                        <p className="text-[10px] text-slate-600">Control Plane</p>
                    </div>
                </div>
            </div>

            {/* Role Badge */}
            {userRole && (
                <div className="px-4 py-3 border-b border-slate-200">
                    <Badge className="bg-blue-100 text-blue-700">
                        {userRole}
                    </Badge>
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                    {menuItems.map((item) => {
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
            <div className="border-t border-slate-200 p-4">
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