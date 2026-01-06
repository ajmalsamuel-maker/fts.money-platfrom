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
import UnifiedCommandPalette from '@/components/system/UnifiedCommandPalette';
import { StatusBadge } from '@/components/system/StatusConfig';
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
    ChevronDown,
    Rocket,
    BarChart3,
    Wallet,
    Briefcase,
    Menu
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

    const { data: myCryptoCustomers = [] } = useQuery({
        queryKey: ['my-crypto-customers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.CryptoGatewayCustomer.list('-created_date');
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const { data: myRWAProviders = [] } = useQuery({
        queryKey: ['my-rwa-providers', session?.email],
        queryFn: async () => {
            const all = await base44.entities.RWAProvider.list('-created_date');
            return all.filter(c => c.contact_email === session?.email);
        },
        enabled: !!session?.email
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const totalServices = myPSPs.length + myISOCustomers.length + myOrchCustomers.length + myCryptoCustomers.length + myRWAProviders.length;
    const isNewUser = totalServices === 0;

    const quickActions = [
        {
            icon: Building2,
            title: 'PSP Instance',
            description: 'Full payment processing platform',
            path: 'CommunityPSPProvisioning',
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            badge: myPSPs.length > 0 ? `${myPSPs.length} Active` : 'Launch',
            category: 'core'
        },
        {
            icon: Code,
            title: 'ISO Gateway',
            description: 'ISO 8583/20022 message translation',
            path: 'ISOGatewayLogin',
            color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            badge: myISOCustomers.length > 0 ? `${myISOCustomers.length} Active` : 'Launch',
            category: 'core'
        },
        {
            icon: GitBranch,
            title: 'Orchestration',
            description: 'Smart payment routing & optimization',
            path: 'OrchestrationLogin',
            color: 'bg-purple-50 text-purple-700 border-purple-200',
            badge: myOrchCustomers.length > 0 ? `${myOrchCustomers.length} Active` : 'Launch',
            category: 'core'
        },
        {
            icon: Wallet,
            title: 'Crypto Banking',
            description: 'Multi-chain wallets, IBANs & cards',
            path: 'CryptoGatewayLogin',
            color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            badge: myCryptoCustomers.length > 0 ? `${myCryptoCustomers.length} Active` : 'Launch',
            category: 'advanced'
        },
        {
            icon: Briefcase,
            title: 'RWA Platform',
            description: 'Tokenize real-world assets',
            path: 'RWAWhiteLabelProvisioning',
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            badge: myRWAProviders.length > 0 ? `${myRWAProviders.length} Active` : 'Coming Q1 2026',
            category: 'advanced'
        },
        {
            icon: Globe,
            title: 'Service Marketplace',
            description: '150+ pre-integrated services',
            path: 'CommunityMarketplace',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            badge: 'Explore',
            category: 'marketplace'
        }
    ];

    const benefits = [
        { icon: Sparkles, text: 'PSP, ISO Gateway, Orchestration, Crypto & RWA', color: 'text-blue-600' },
        { icon: Globe, text: 'Multi-protocol payment infrastructure', color: 'text-purple-600' },
        { icon: Shield, text: 'Enterprise-grade security & compliance', color: 'text-emerald-600' },
        { icon: TrendingUp, text: '150+ services • Global scale • White-label ready', color: 'text-amber-600' }
    ];

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <div className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <CommunityPortalSidebarOptimized currentPage="CommunityPortalDashboard" userEmail={session?.email} />
            </div>
            
            <UnifiedCommandPalette 
                open={commandPaletteOpen} 
                onOpenChange={setCommandPaletteOpen}
                portalType="community"
            />

            <div className="flex-1 overflow-auto">
                {/* Header - FTS.Money Style */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10" style={{ height: '64px' }}>
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
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
                                <DropdownMenuItem onClick={() => navigate(createPageUrl('CryptoGatewayLogin'))}>
                                <Wallet className="h-4 w-4 mr-3 text-cyan-600" />
                                <div>
                                <p className="font-medium">Crypto Banking</p>
                                <p className="text-xs text-slate-600">Wallets & IBANs</p>
                                </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(createPageUrl('RWAWhiteLabelProvisioning'))}>
                                <Briefcase className="h-4 w-4 mr-3 text-amber-600" />
                                <div>
                                <p className="font-medium">RWA Platform</p>
                                <p className="text-xs text-slate-600">Asset tokenization</p>
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

                    {/* Hero Section with Wave & Arrow - Always visible */}
                    <Card className="mb-6 border-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}>
                        <CardContent className="p-12 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="max-w-xl">
                                    <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        Fluid Global Payments
                                    </h1>
                                    <p className="mb-8 text-xl text-slate-700 font-medium">
                                        Complete payment infrastructure ecosystem in 24 hours
                                    </p>
                                    <div className="grid grid-cols-1 gap-3 mb-8">
                                        {benefits.map((benefit, i) => {
                                            const Icon = benefit.icon;
                                            return (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-lg">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-800">{benefit.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Button 
                                        onClick={() => navigate(createPageUrl('LaunchServices'))}
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        <Rocket className="mr-2 h-5 w-5" />
                                        Launch Your First Service
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="relative">
                                        {/* Animated Arrow Graphic pointing to Launch Services */}
                                        <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-2xl">
                                            <defs>
                                                <linearGradient id="arrow-gradient-new" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" style={{ stopColor: '#0066CC' }} />
                                                    <stop offset="50%" style={{ stopColor: '#00BFFF' }} />
                                                    <stop offset="100%" style={{ stopColor: '#87CEEB' }} />
                                                </linearGradient>
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur"/>
                                                        <feMergeNode in="SourceGraphic"/>
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                            {/* Main Arrow */}
                                            <path 
                                                d="M80 200 L200 80 M200 80 L150 80 M200 80 L200 130" 
                                                stroke="url(#arrow-gradient-new)" 
                                                strokeWidth="12" 
                                                fill="none" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                filter="url(#glow)"
                                                className="animate-pulse"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        
                        {/* Fluid Wave Bottom - More Dynamic */}
                        <div className="absolute bottom-0 left-0 right-0 h-32">
                            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="hero-wave-fluid" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" style={{ stopColor: '#0066CC', stopOpacity: 0.4 }} />
                                        <stop offset="25%" style={{ stopColor: '#00BFFF', stopOpacity: 0.5 }} />
                                        <stop offset="50%" style={{ stopColor: '#87CEEB', stopOpacity: 0.4 }} />
                                        <stop offset="75%" style={{ stopColor: '#00BFFF', stopOpacity: 0.5 }} />
                                        <stop offset="100%" style={{ stopColor: '#0066CC', stopOpacity: 0.4 }} />
                                    </linearGradient>
                                </defs>
                                {/* First wave layer */}
                                <path 
                                    fill="url(#hero-wave-fluid)" 
                                    fillOpacity="0.6" 
                                    d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,144C672,139,768,149,864,154.7C960,160,1056,160,1152,149.3C1248,139,1344,117,1392,106.7L1440,96L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
                                    className="animate-pulse"
                                    style={{ animationDuration: '3s' }}
                                />
                                {/* Second wave layer */}
                                <path 
                                    fill="url(#hero-wave-fluid)" 
                                    fillOpacity="0.4" 
                                    d="M0,128L48,133.3C96,139,192,149,288,138.7C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
                                    className="animate-pulse"
                                    style={{ animationDuration: '4s', animationDelay: '0.5s' }}
                                />
                            </svg>
                        </div>
                    </Card>

                    {/* NEW USER ONBOARDING VIEW */}
                    {isNewUser ? (
                        <>
                            {/* Core Services */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Core Payment Infrastructure</h3>
                                <p className="text-slate-600 mb-4">Choose from 5 enterprise-grade infrastructure services</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {quickActions.filter(a => a.category === 'core').map((action, i) => {
                                        const Icon = action.icon;
                                        return (
                                            <Card key={i} className="hover:shadow-xl transition-all border-2 hover:border-blue-300">
                                                <CardContent className="p-6">
                                                    <div className={cn("w-14 h-14 rounded-xl mb-4 flex items-center justify-center", action.color)}>
                                                        <Icon className="h-7 w-7" />
                                                    </div>
                                                    <Badge className="mb-2 bg-blue-100 text-blue-700">{action.badge}</Badge>
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

                            {/* Advanced Services */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Digital Asset Infrastructure</h3>
                                <p className="text-slate-600 mb-4">Crypto banking wallets, IBANs & real-world asset tokenization</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {quickActions.filter(a => a.category === 'advanced').map((action, i) => {
                                        const Icon = action.icon;
                                        return (
                                            <Card key={i} className="hover:shadow-xl transition-all border-2 hover:border-cyan-300">
                                                <CardContent className="p-6">
                                                    <div className={cn("w-14 h-14 rounded-xl mb-4 flex items-center justify-center", action.color)}>
                                                        <Icon className="h-7 w-7" />
                                                    </div>
                                                    <Badge className="mb-2">{action.badge}</Badge>
                                                    <h4 className="font-bold text-lg mb-2">{action.title}</h4>
                                                    <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                                                    <Button 
                                                        onClick={() => navigate(createPageUrl(action.path))}
                                                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-500"
                                                    >
                                                        Learn More
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
                                            <h4 className="font-semibold text-slate-900 mb-3">Payment Infrastructure</h4>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    White-label PSP in 24-48 hours
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    ISO 8583/20022 message translation
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Smart routing & orchestration
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3">Digital Assets & Growth</h4>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Crypto wallets, IBANs & cards
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    Real-world asset tokenization
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    150+ integrated services & APIs
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{myPSPs.length}</p>
                                    <p className="text-xs text-slate-600">PSP</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
                                        <Code className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{myISOCustomers.length}</p>
                                    <p className="text-xs text-slate-600">ISO Gateway</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-2">
                                        <GitBranch className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{myOrchCustomers.length}</p>
                                    <p className="text-xs text-slate-600">Orchestration</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-2">
                                        <Wallet className="h-6 w-6 text-cyan-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{myCryptoCustomers.length}</p>
                                    <p className="text-xs text-slate-600">Crypto Banking</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                                        <Briefcase className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{myRWAProviders.length}</p>
                                    <p className="text-xs text-slate-600">RWA Platform</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
                                        <Globe className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{services.length}</p>
                                    <p className="text-xs text-slate-600">Services</p>
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
                                                    <StatusBadge status={psp.status} />
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
                                                    <StatusBadge status={customer.status} />
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

                        {/* Crypto Banking Services */}
                        {myCryptoCustomers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-cyan-600" />
                                        My Crypto Banking Services
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {myCryptoCustomers.map((customer) => (
                                            <div 
                                                key={customer.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                                        <Wallet className="h-5 w-5 text-cyan-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{customer.company_name}</p>
                                                        <p className="text-sm text-slate-600">{customer.subscription_tier} • {customer.kyc_status || 'Pending'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={customer.status} />
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => navigate(createPageUrl('CryptoGatewayLogin'))}
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

                        {/* RWA Platform Services */}
                        {myRWAProviders.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-amber-600" />
                                        My RWA Tokenization Platforms
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {myRWAProviders.map((provider) => (
                                            <div 
                                                key={provider.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                                        <Briefcase className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{provider.company_name}</p>
                                                        <p className="text-sm text-slate-600">{provider.subscription_tier} • {provider.blockchain_network || 'Ethereum'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={provider.status} />
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => navigate(createPageUrl('RWAProviderLogin'))}
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