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
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Welcome to FTS.Money Community</h2>
                        <p className="text-xs text-slate-600">{session?.email}</p>
                    </div>
                </header>

                <div className="p-6">
                    {/* Hero Section */}
                    <Card className="mb-6 border-0 text-white" style={{ background: FTS_GRADIENTS.dark1 }}>
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        Build Your Payment Infrastructure
                                    </h1>
                                    <p className="mb-6 text-lg" style={{ color: FTS_COLORS.mist }}>
                                        Everything you need to launch and scale your PSP business
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {benefits.map((benefit, i) => {
                                            const Icon = benefit.icon;
                                            return (
                                                <div key={i} className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-cyan-200" />
                                                    <span className="text-sm">{benefit.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Button 
                                        onClick={() => navigate(createPageUrl('CommunityPSPProvisioning'))}
                                        className="bg-white hover:bg-white/90"
                                        style={{ color: FTS_COLORS.royalBlue, fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="w-64 h-64 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                                        <Sparkles className="h-32 w-32 text-white/50" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
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