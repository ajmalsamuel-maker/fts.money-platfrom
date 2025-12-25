import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import CommunityPortalSidebarOptimized from '@/components/community/CommunityPortalSidebarOptimized';
import Breadcrumbs from '@/components/community/Breadcrumbs';
import CommandPalette from '@/components/community/CommandPalette';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import { FTS_COLORS, FTS_GRADIENTS } from '@/components/community/FTSBrandColors';
import { 
    Building2, 
    Plus, 
    Globe, 
    Users,
    Sparkles,
    ArrowRight,
    Zap,
    Shield,
    TrendingUp,
    CheckCircle2,
    LogOut,
    Code,
    GitBranch,
    ChevronDown
} from 'lucide-react';

export default function CommunityPortalDashboard() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    const { data: myPSPs = [] } = useQuery({
        queryKey: ['my-psp-instances', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ProvisionedPSP.list('-created_date');
            // Filter to only show PSPs owned by current user (exclude templates)
            return all.filter(psp => 
                psp.owner_email === session?.email && 
                !psp.is_template && 
                psp.visibility !== 'template'
            );
        },
        enabled: !!session?.email
    });

    const { data: services = [] } = useQuery({
        queryKey: ['active-services'],
        queryFn: () => base44.entities.ServiceCatalog.filter({ status: 'active' })
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['my-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list()
    });

    const { data: myISOCustomers = [] } = useQuery({
        queryKey: ['my-iso-customers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ISOGatewayCustomer.list('-created_date');
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const { data: myOrchCustomers = [] } = useQuery({
        queryKey: ['my-orch-customers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.OrchestrationCustomer.list('-created_date');
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const totalServices = myPSPs.length + myISOCustomers.length + myOrchCustomers.length;
    const isNewUser = totalServices === 0;

    const quickActions = [
        {
            icon: Building2,
            title: 'Launch PSP Instance',
            description: 'Full payment processing platform',
            path: 'CommunityPSPProvisioning',
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            badge: myPSPs.length > 0 ? `${myPSPs.length} Active` : 'New'
        },
        {
            icon: Code,
            title: 'ISO Gateway Service',
            description: 'Message translation & enrichment',
            path: 'ISOGatewayLogin',
            color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            badge: myISOCustomers.length > 0 ? `${myISOCustomers.length} Active` : 'New'
        },
        {
            icon: GitBranch,
            title: 'Orchestration Service',
            description: 'Smart payment routing',
            path: 'OrchestrationLogin',
            color: 'bg-purple-50 text-purple-700 border-purple-200',
            badge: myOrchCustomers.length > 0 ? `${myOrchCustomers.length} Active` : 'New'
        },
        {
            icon: Globe,
            title: 'Browse Marketplace',
            description: '150+ payment services',
            path: 'CommunityMarketplace',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            badge: 'Explore'
        }
    ];

    const benefits = [
        { icon: Sparkles, text: 'White-label PSP infrastructure', color: 'text-blue-600' },
        { icon: Globe, text: '150+ payment services & integrations', color: 'text-purple-600' },
        { icon: Shield, text: 'Enterprise-grade security & compliance', color: 'text-emerald-600' },
        { icon: TrendingUp, text: 'Scalable from startup to enterprise', color: 'text-amber-600' }
    ];

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebarOptimized currentPage="CommunityPortalDashboard" userEmail={session?.email} />
            <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

            <div className="flex-1 overflow-auto">
                {/* Header - FTS.Money Style */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Community Portal
                        </h2>
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <button 
                                onClick={() => navigate(createPageUrl('CommunityPortalDashboard'))}
                                className="text-slate-700 hover:text-blue-600 transition-colors"
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={() => navigate(createPageUrl('MyPSPInstances'))}
                                className="text-slate-700 hover:text-blue-600 transition-colors"
                            >
                                My PSPs
                            </button>
                            <button 
                                onClick={() => navigate(createPageUrl('CommunityMarketplace'))}
                                className="text-slate-700 hover:text-blue-600 transition-colors"
                            >
                                Marketplace
                            </button>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCommandPaletteOpen(true)}
                            className="hidden md:flex gap-2 text-slate-600"
                        >
                            <span className="text-xs">Search</span>
                            <Badge variant="secondary" className="text-xs">⌘K</Badge>
                        </Button>
                        <span className="text-xs text-slate-600">{session?.email}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Launch Services
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuItem onClick={() => navigate(createPageUrl('CommunityPSPProvisioning'))}>
                                    <Building2 className="h-4 w-4 mr-3 text-blue-600" />
                                    <div>
                                        <p className="font-medium">PSP Instance</p>
                                        <p className="text-xs text-slate-600">Full payment platform</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(createPageUrl('ISOGatewayLogin'))}>
                                    <Code className="h-4 w-4 mr-3 text-indigo-600" />
                                    <div>
                                        <p className="font-medium">ISO Gateway</p>
                                        <p className="text-xs text-slate-600">Message translation</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(createPageUrl('OrchestrationLogin'))}>
                                    <GitBranch className="h-4 w-4 mr-3 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Orchestration</p>
                                        <p className="text-xs text-slate-600">Smart routing</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                localStorage.removeItem('community_portal_session');
                                navigate(createPageUrl('CommunityPortalLogin'));
                            }}
                            className="gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Breadcrumbs currentPage="CommunityPortalDashboard" />

                    {/* NEW USER ONBOARDING VIEW */}
                    {isNewUser ? (
                        <>
                            {/* Hero Section with Wave */}
                    <Card className="mb-6 border-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                        <CardContent className="p-8 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        Fluid Global Payments
                                    </h1>
                                    <p className="mb-6 text-lg text-slate-700">
                                        Everything you need to launch and scale your PSP business
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {benefits.map((benefit, i) => {
                                            const Icon = benefit.icon;
                                            return (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="text-sm text-slate-700">{benefit.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Button 
                                        onClick={() => navigate(createPageUrl('CommunityPSPProvisioning'))}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="relative">
                                        {/* Dynamic Arrow Graphic */}
                                        <svg width="240" height="240" viewBox="0 0 240 240" className="opacity-20">
                                            <defs>
                                                <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" style={{ stopColor: '#0066CC' }} />
                                                    <stop offset="100%" style={{ stopColor: '#00BFFF' }} />
                                                </linearGradient>
                                            </defs>
                                            <path d="M60 180 L180 60 M180 60 L140 60 M180 60 L180 100" stroke="url(#arrow-gradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        
                        {/* Flat Wave Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30">
                            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
                                <path fill="url(#hero-wave)" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,58.7C672,64,768,96,864,96C960,96,1056,64,1152,58.7C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                                <defs>
                                    <linearGradient id="hero-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" style={{ stopColor: '#0066CC' }} />
                                        <stop offset="50%" style={{ stopColor: '#00BFFF' }} />
                                        <stop offset="100%" style={{ stopColor: '#87CEEB' }} />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </Card>

                            {/* Service Comparison Cards */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Choose Your First Service</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {quickActions.slice(0, 3).map((action, i) => {
                                        const Icon = action.icon;
                                        return (
                                            <Card key={i} className="hover:shadow-xl transition-all border-2 hover:border-blue-300">
                                                <CardContent className="p-6">
                                                    <div className={cn("w-14 h-14 rounded-xl mb-4 flex items-center justify-center", action.color)}>
                                                        <Icon className="h-7 w-7" />
                                                    </div>
                                                    <h4 className="font-bold text-lg mb-2">{action.title}</h4>
                                                    <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                                                    <Button 
                                                        onClick={() => navigate(createPageUrl(action.path))}
                                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                                                    >
                                                        Get Started
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* What You Can Do Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>What You Can Do</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3">Build & Launch</h4>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Launch white-label PSP in 24-48 hours
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Deploy ISO message translation gateway
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Set up smart payment routing
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3">Integrate & Grow</h4>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Access 150+ payment services
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Offer services to other PSPs
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Enterprise compliance built-in
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* ACTIVE USER DASHBOARD VIEW */}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">PSP Instances</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{myPSPs.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">ISO Gateway</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{myISOCustomers.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                        <Code className="h-6 w-6 text-indigo-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Orchestration</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{myOrchCustomers.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <GitBranch className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Marketplace</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{services.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Globe className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                            {/* Recent Activity Feed */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        {myPSPs.slice(0, 3).map(psp => (
                                            <div key={psp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                                <span className="flex-1 text-slate-700">PSP <strong>{psp.psp_name}</strong> is {psp.status}</span>
                                                <span className="text-xs text-slate-500">{new Date(psp.created_date).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                        {myISOCustomers.slice(0, 2).map(c => (
                                            <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Code className="h-4 w-4 text-indigo-600" />
                                                <span className="flex-1 text-slate-700">ISO Gateway <strong>{c.company_name}</strong> processed {c.total_messages_processed || 0} messages</span>
                                            </div>
                                        ))}
                                        {totalServices === 0 && (
                                            <p className="text-center text-slate-500 py-4">No recent activity</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommended Actions */}
                            {myPSPs.length > 0 && myISOCustomers.length === 0 && (
                                <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Code className="h-10 w-10 text-blue-600" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900 mb-1">Add ISO Gateway to Your Stack</h4>
                                                <p className="text-sm text-slate-600 mb-3">
                                                    Translate payment messages between ISO 8583, ISO 20022, and SWIFT MT
                                                </p>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => navigate(createPageUrl('LaunchServices'))}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Learn More
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* My Services */}
                            <div className="grid gap-6">
                        {/* PSP Instances */}
                        {myPSPs.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        My PSP Instances
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {myPSPs.map((psp) => (
                                            <div 
                                                key={psp.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                                        style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                                    >
                                                        {psp.psp_code?.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{psp.psp_name}</p>
                                                        <p className="text-sm text-slate-600">{psp.psp_code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn(
                                                        psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    )}>
                                                        {psp.status}
                                                    </Badge>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => navigate(createPageUrl('PSPInstanceConfig', `?id=${psp.id}`))}
                                                    >
                                                        Manage
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* ISO Gateway Services */}
                        {myISOCustomers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code className="h-5 w-5 text-indigo-600" />
                                        My ISO Gateway Services
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {myISOCustomers.map((customer) => (
                                            <div 
                                                key={customer.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                        <Code className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{customer.company_name}</p>
                                                        <p className="text-sm text-slate-600">{customer.subscription_tier} • {customer.total_messages_processed || 0} messages</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn(
                                                        customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    )}>
                                                        {customer.status}
                                                    </Badge>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => navigate(createPageUrl('ISOGatewayLogin'))}
                                                    >
                                                        Access
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Orchestration Services */}
                        {myOrchCustomers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="h-5 w-5 text-purple-600" />
                                        My Orchestration Services
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {myOrchCustomers.map((customer) => (
                                            <div 
                                                key={customer.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                        <GitBranch className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{customer.company_name}</p>
                                                        <p className="text-sm text-slate-600">{customer.subscription_tier} • {customer.total_executions || 0} executions</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn(
                                                        customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    )}>
                                                        {customer.status}
                                                    </Badge>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => navigate(createPageUrl('OrchestrationLogin'))}
                                                    >
                                                        Access
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                        </>
                    )}
                </div>

                <ComplianceFooter />
            </div>
        </div>
    );
}