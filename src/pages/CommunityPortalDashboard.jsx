import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
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
    CheckCircle2
} from 'lucide-react';

export default function CommunityPortalDashboard() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    const { data: myPSPs = [] } = useQuery({
        queryKey: ['my-psp-instances'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: services = [] } = useQuery({
        queryKey: ['active-services'],
        queryFn: () => base44.entities.ServiceCatalog.filter({ status: 'active' })
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['my-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list()
    });

    const quickActions = [
        {
            icon: Building2,
            title: 'Launch New PSP',
            description: 'Self-service provisioning wizard',
            path: 'CommunityPSPProvisioning',
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            badge: 'Get Started'
        },
        {
            icon: Globe,
            title: 'Browse Marketplace',
            description: '150+ payment services',
            path: 'CommunityMarketplace',
            color: 'bg-purple-50 text-purple-700 border-purple-200',
            badge: 'Explore'
        },
        {
            icon: Users,
            title: 'Register as Provider',
            description: 'Offer your services',
            path: 'ServiceProviderRegistration',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            badge: 'Provider'
        },
        {
            icon: Zap,
            title: 'My PSP Instances',
            description: 'Manage existing PSPs',
            path: 'MyPSPInstances',
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            badge: myPSPs.length > 0 ? `${myPSPs.length} Active` : 'None'
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
            <CommunityPortalSidebar currentPage="CommunityPortalDashboard" userEmail={session?.email} />

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
                        <span className="text-xs text-slate-600">{session?.email}</span>
                        <Button 
                            onClick={() => navigate(createPageUrl('CommunityPSPProvisioning'))}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                        >
                            Launch PSP
                        </Button>
                    </div>
                </header>

                <div className="p-6">
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

                    {/* Quick Actions */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => navigate(createPageUrl(action.path))}
                                        className={cn(
                                            "p-6 rounded-xl border-2 text-left hover:shadow-lg transition-all",
                                            action.color
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <Icon className="h-8 w-8" />
                                            <Badge variant="secondary" className="text-xs">
                                                {action.badge}
                                            </Badge>
                                        </div>
                                        <h4 className="font-semibold mb-1">{action.title}</h4>
                                        <p className="text-sm opacity-80">{action.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">My PSP Instances</p>
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
                                        <p className="text-sm text-slate-600">Active Subscriptions</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{subscriptions.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Zap className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Available Services</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{services.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Globe className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* My PSP Instances */}
                    {myPSPs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>My PSP Instances</CardTitle>
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
                </div>
            </div>
        </div>
    );
}