import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebarOptimized from '@/components/community/CommunityPortalSidebarOptimized';
import Breadcrumbs from '@/components/community/Breadcrumbs';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Code, GitBranch, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function LaunchServices() {
    const navigate = useNavigate();
    const { t } = useI18n();
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
        queryKey: ['my-psp-instances', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ProvisionedPSP.list();
            return all.filter(psp => psp.owner_email === session?.email);
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

    const services = [
        {
            id: 'psp',
            icon: Building2,
            name: 'PSP Instance',
            tagline: 'Full Payment Service Provider Platform',
            description: 'Launch a complete payment processing platform with merchant portal, transaction processing, and comprehensive reporting',
            features: [
                'Multi-merchant management',
                'Payment gateway integration',
                'Transaction processing engine',
                'Merchant portal & virtual terminal',
                'Reporting & analytics',
                'Settlement management'
            ],
            pricing: 'From $1,500/month',
            setupTime: '24-48 hours',
            myCount: myPSPs.length,
            color: 'from-blue-600 to-cyan-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            action: () => navigate(createPageUrl('CommunityPSPProvisioning'))
        },
        {
            id: 'iso-gateway',
            icon: Code,
            name: 'ISO Gateway',
            tagline: 'Message Translation & Enrichment Service',
            description: 'Translate between ISO 8583, ISO 20022, and SWIFT MT formats with automatic enrichment and validation',
            features: [
                'ISO 8583 ↔ ISO 20022 translation',
                'SWIFT MT message support',
                'Automatic LEI enrichment',
                'Structured remittance parsing',
                'Purpose code addition',
                'End-to-end reference tracking'
            ],
            pricing: 'From $499/month',
            setupTime: 'Instant activation',
            myCount: myISOCustomers.length,
            color: 'from-indigo-600 to-purple-500',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            textColor: 'text-indigo-700',
            action: () => navigate(createPageUrl('ISOGatewayLogin'))
        },
        {
            id: 'orchestration',
            icon: GitBranch,
            name: 'Orchestration Service',
            tagline: 'Smart Payment & Payout Routing',
            description: 'Intelligent routing engine for payment and payout optimization with real-time decisioning and failover',
            features: [
                'Smart payment routing',
                'Payout orchestration',
                'Multi-provider failover',
                'Cost optimization',
                'Success rate tracking',
                'Real-time analytics'
            ],
            pricing: 'From $199/month',
            setupTime: 'Instant activation',
            myCount: myOrchCustomers.length,
            color: 'from-purple-600 to-pink-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700',
            action: () => navigate(createPageUrl('OrchestrationLogin'))
        }
    ];

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebarOptimized currentPage="LaunchServices" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Launch Services
                        </h2>
                        <p className="text-xs text-slate-600">Choose your service to get started</p>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto">
                    <Breadcrumbs currentPage="LaunchServices" />
                    
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            What Would You Like to Launch?
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Choose from our suite of payment infrastructure services. Each service is instantly deployable and fully managed.
                        </p>
                    </div>

                    {/* Service Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <Card key={service.id} className="relative overflow-hidden hover:shadow-2xl transition-all border-2 border-slate-200 hover:border-transparent hover:ring-4 hover:ring-blue-100">
                                    {service.myCount > 0 && (
                                        <Badge className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 border-emerald-300">
                                            {service.myCount} Active
                                        </Badge>
                                    )}
                                    
                                    <CardHeader className={service.bgColor + ' border-b ' + service.borderColor}>
                                        <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${service.color}`}>
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <CardTitle className="text-2xl">{service.name}</CardTitle>
                                        <p className={`text-sm font-medium ${service.textColor}`}>{service.tagline}</p>
                                    </CardHeader>

                                    <CardContent className="pt-6">
                                        <p className="text-sm text-slate-600 mb-6">{service.description}</p>

                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-700 mb-2">KEY FEATURES</p>
                                                <ul className="space-y-2">
                                                    {service.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-4 border-t border-slate-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-slate-600">PRICING</span>
                                                    <span className="text-sm font-semibold text-slate-900">{service.pricing}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-600">SETUP TIME</span>
                                                    <Badge variant="outline" className="text-xs">{service.setupTime}</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={service.action}
                                            className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white`}
                                        >
                                            {service.myCount > 0 ? 'Launch Another' : 'Get Started'}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Info Section */}
                    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Zap className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Need Help Choosing?</h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        <strong>PSP Instance:</strong> Choose this if you want to run a complete payment platform with multiple merchants.<br />
                                        <strong>ISO Gateway:</strong> Choose this if you need to translate payment messages between different formats.<br />
                                        <strong>Orchestration:</strong> Choose this if you need intelligent routing across multiple payment providers.
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        💡 You can launch multiple services and integrate them together for maximum flexibility.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <ComplianceFooter />
            </div>
        </div>
    );
}