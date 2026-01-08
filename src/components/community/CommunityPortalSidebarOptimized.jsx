import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FTS_COLORS, FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { 
    LayoutDashboard, Building2, Globe, Users, Settings, LogOut,
    Rocket, FileText, DollarSign, ChevronDown, ChevronRight,
    Code, GitBranch, Package, Briefcase, BarChart3, BookOpen, Wallet, Leaf, Sprout
} from 'lucide-react';

export default function CommunityPortalSidebarOptimized({ currentPage, userEmail }) {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    React.useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (sessionData) {
            setSession(JSON.parse(sessionData));
        }
    }, []);

    // Fetch counts for badges
    const { data: myPSPs = [] } = useQuery({
        queryKey: ['my-psp-instances', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ProvisionedPSP.list();
            return all.filter(psp => psp.owner_email === session?.email && !psp.is_template);
        },
        enabled: !!session?.email
    });

    const { data: myISOCustomers = [] } = useQuery({
        queryKey: ['my-iso-customers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ISOGatewayCustomer.list();
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const { data: myOrchCustomers = [] } = useQuery({
        queryKey: ['my-orch-customers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.OrchestrationCustomer.list();
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['my-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list(),
        enabled: !!session?.email
    });

    const totalServices = myPSPs.length + myISOCustomers.length + myOrchCustomers.length;

    const menuSections = [
        {
            id: 'overview',
            title: 'Overview',
            defaultOpen: true,
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: 'CommunityPortalDashboard' }
            ]
        },
        // Progressive disclosure: Show "Get Started" only for new users
        ...(totalServices === 0 ? [{
            id: 'get-started',
            title: 'Get Started',
            defaultOpen: true,
            items: [
                { icon: Rocket, label: 'Launch Services', path: 'LaunchServices', highlight: true },
                { icon: Globe, label: 'Marketplace', path: 'CommunityMarketplace' }
            ]
        }] : []),
        // Show "My Services" only when user has services
        ...(totalServices > 0 ? [{
            id: 'my-services',
            title: 'My Services',
            defaultOpen: true,
            items: [
                { icon: Package, label: 'All Services', path: 'MyAllServices', count: totalServices },
                { icon: Building2, label: 'PSP Instances', path: 'MyPSPInstances', count: myPSPs.length },
                { icon: Code, label: 'ISO Gateway', path: 'ISOGatewayLogin', count: myISOCustomers.length },
                { icon: GitBranch, label: 'Orchestration', path: 'OrchestrationLogin', count: myOrchCustomers.length },
                { icon: Wallet, label: 'Crypto Banking', path: 'CryptoGatewayLogin', count: 0 },
                { icon: Briefcase, label: 'RWA Platform', path: 'RWAWhiteLabelProvisioning', count: 0 },
                { icon: FileText, label: 'Subscriptions', path: 'MySubscriptions', count: subscriptions.length }
            ]
        }] : []),
        // "Business & Operations" for active users
        ...(totalServices > 0 ? [{
            id: 'business',
            title: 'Business & Operations',
            defaultOpen: false,
            items: [
                { icon: BarChart3, label: 'Analytics', path: 'CommunityAnalytics' },
                { icon: FileText, label: 'Service Requests', path: 'MyServiceRequests' },
                { icon: DollarSign, label: 'Billing', path: 'CommunityBilling' }
            ]
        }] : []),

        {
            id: 'provider',
            title: 'Provider Hub',
            defaultOpen: false,
            items: [
                { icon: Users, label: 'Become a Provider', path: 'ServiceProviderRegistration' },
                { icon: Briefcase, label: 'My Offerings', path: 'MyWholesaleOfferings' }
            ]
        },
        {
            id: 'documentation',
            title: 'Documentation',
            defaultOpen: false,
            items: [
                { icon: BookOpen, label: 'Platform Docs', path: 'FTSDocumentation' },
                { icon: Code, label: 'API Documentation', path: 'APIDocumentation' },
                { icon: Building2, label: 'PSP Architecture', path: 'FTSArchitectureDoc' },
                { icon: Package, label: 'Service Catalog', path: 'CommunityProductCatalog' }
            ]
        },
        {
            id: 'settings',
            title: 'Settings',
            defaultOpen: false,
            items: [
                { icon: Wallet, label: 'Identity Wallet', path: 'DigitalIdentityWallet' },
                { icon: Settings, label: 'Account Settings', path: 'CommunityAccountSettings' }
            ]
        }
    ];

    const [openSections, setOpenSections] = useState(
        menuSections.filter(s => s.defaultOpen).map(s => s.id)
    );

    const toggleSection = (sectionId) => {
        setOpenSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('community_portal_session');
        navigate(createPageUrl('CommunityPortalLogin'));
    };

    return (
        <aside className="w-64 flex flex-col h-screen bg-white border-r border-slate-200 fixed lg:static z-40" style={{ width: '256px' }}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200" style={{ height: '64px' }}>
                <div className="flex items-center gap-2">
                    <img 
                        src={FTS_LOGOS.symbol} 
                        alt="FTS.Money" 
                        className="h-10 w-10 object-contain"
                    />
                    <div>
                        <h1 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>FTS.Money</h1>
                        <p className="text-[10px] text-slate-600">Community Portal</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            {userEmail && (
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <p className="text-xs text-slate-600">Signed in as</p>
                    <p className="text-sm text-slate-900 font-medium truncate">{userEmail}</p>
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-4">
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
                                    <div className="flex items-center justify-between px-2 py-1 hover:bg-slate-50 rounded-lg transition-colors">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-slate-900">
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
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = currentPage === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={createPageUrl(item.path)}
                                                    className={cn(
                                                        "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-all text-sm group relative overflow-hidden",
                                                        isActive
                                                            ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-slate-900 font-medium"
                                                            : "text-slate-700 hover:bg-slate-50",
                                                        item.highlight && !isActive && "bg-blue-50/50 border border-blue-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Icon 
                                                            className={cn(
                                                                "h-4 w-4 flex-shrink-0",
                                                                isActive && "text-blue-600"
                                                            )}
                                                        />
                                                        <span className="truncate">{item.label}</span>
                                                    </div>
                                                    {item.count !== undefined && item.count > 0 && (
                                                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-1.5">
                                                            {item.count}
                                                        </Badge>
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-500"></div>
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

            {/* Logout */}
            <div className="p-3 border-t border-slate-200">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}