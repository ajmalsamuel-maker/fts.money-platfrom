import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VerifiablePresentationFlow from '@/components/identity/VerifiablePresentationFlow';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { 
    Shield, Send, History, Rocket, Wallet, Building2, 
    Code, CheckCircle2, Clock, ArrowRight, FileCheck, Globe, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CredentialPresentation() {
    const { platformUser } = usePlatformAuth();
    const navigate = useNavigate();
    const [activeService, setActiveService] = useState(null);
    const [presentationHistory, setPresentationHistory] = useState([]);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: credentials = [] } = useQuery({
        queryKey: ['user-credentials'],
        queryFn: () => base44.entities.UserCredential.filter({ 
            created_by: user?.email,
            status: 'active'
        }),
        enabled: !!user
    });

    const services = [
        {
            id: 'vasp-onboarding',
            name: 'VASP Onboarding',
            icon: Wallet,
            description: 'Present credentials for instant crypto banking KYB verification',
            requiredType: 'lei',
            color: 'from-cyan-500 to-blue-500',
            benefits: [
                'Skip 10-step KYB process',
                'Instant verification (2 minutes vs 5-7 days)',
                'Auto-approve up to €500K/month limits',
                '95% faster onboarding'
            ]
        },
        {
            id: 'rwa-issuer',
            name: 'RWA Asset Issuance',
            icon: Rocket,
            description: 'Verify entity identity for real-world asset tokenization',
            requiredType: 'vlei',
            color: 'from-amber-500 to-orange-500',
            benefits: [
                'Instant issuer verification',
                'Blockchain-anchored provenance',
                'Regulatory compliance built-in',
                'Trust score carries over'
            ]
        },
        {
            id: 'iso-gateway',
            name: 'ISO Gateway Access',
            icon: Code,
            description: 'Enhanced compliance for ISO 8583/20022 message translation',
            requiredType: 'lei',
            color: 'from-indigo-500 to-purple-500',
            benefits: [
                'LEI auto-enrichment in messages',
                'SWIFT compliance verification',
                'Reduced manual review',
                'Higher transaction limits'
            ]
        },
        {
            id: 'psp-admin',
            name: 'PSP Admin Login',
            icon: Building2,
            description: 'Passwordless authentication for PSP platform access',
            requiredType: 'vlei',
            color: 'from-blue-500 to-indigo-500',
            benefits: [
                'Zero password risk',
                'Phishing impossible',
                'Cryptographic proof of identity',
                'Audit trail built-in'
            ]
        }
    ];

    const handlePresentationCreated = (presentation) => {
        const service = services.find(s => s.id === activeService);
        
        setPresentationHistory([
            {
                id: Date.now(),
                service: service.name,
                timestamp: new Date().toISOString(),
                credentials: presentation.verifiableCredential.length,
                status: 'presented'
            },
            ...presentationHistory
        ]);

        setActiveService(null);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="CredentialPresentation" 
                userEmail={platformUser?.email} 
                userRole={platformUser?.platform_role}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 overflow-auto">
                <Toaster position="top-right" />
                
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                                <Send className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Credential Presentation</h2>
                                <p className="text-xs text-slate-600">Share verified credentials securely</p>
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(createPageUrl('DigitalIdentityWallet'))}
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        My Wallet
                    </Button>
                </header>

                <div className="p-6 max-w-7xl mx-auto">
                {!activeService ? (
                    <div className="space-y-6">
                        {/* Info Banner */}
                        <Alert className="border-purple-200 bg-purple-50">
                            <FileCheck className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-purple-900">
                                <strong>W3C Verifiable Presentations</strong> enable you to selectively share verified credentials 
                                with third-party services while maintaining cryptographic proof of authenticity. 
                                The recipient can verify without contacting the credential issuer.
                            </AlertDescription>
                        </Alert>

                        {/* Credential Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-2xl font-bold">{credentials.length}</p>
                                            <p className="text-xs text-slate-600">Active Credentials</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Send className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-2xl font-bold">{presentationHistory.length}</p>
                                            <p className="text-xs text-slate-600">Presentations Sent</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-8 w-8 text-emerald-600" />
                                        <div>
                                            <p className="text-2xl font-bold">{services.length}</p>
                                            <p className="text-xs text-slate-600">Available Services</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs defaultValue="services">
                            <TabsList>
                                <TabsTrigger value="services">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Available Services
                                </TabsTrigger>
                                <TabsTrigger value="history">
                                    <History className="h-4 w-4 mr-2" />
                                    Presentation History
                                </TabsTrigger>
                            </TabsList>

                            {/* Services Tab */}
                            <TabsContent value="services" className="space-y-4 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {services.map((service) => {
                                        const Icon = service.icon;
                                        const hasRequiredCred = credentials.some(c => 
                                            c.credential_type === service.requiredType && c.status === 'active'
                                        );

                                        return (
                                            <Card 
                                                key={service.id}
                                                className={`border-2 transition-all ${hasRequiredCred ? 'hover:border-blue-300 hover:shadow-lg cursor-pointer' : 'opacity-60'}`}
                                                onClick={() => hasRequiredCred && setActiveService(service.id)}
                                            >
                                                <CardContent className="p-6">
                                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                                                        <Icon className="h-7 w-7 text-white" />
                                                    </div>
                                                    
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="font-bold text-lg text-slate-900">{service.name}</h3>
                                                        <Badge className="text-xs">
                                                            {service.requiredType.toUpperCase()} Required
                                                        </Badge>
                                                    </div>
                                                    
                                                    <p className="text-sm text-slate-600 mb-4">{service.description}</p>
                                                    
                                                    <div className="space-y-1.5 mb-4">
                                                        {service.benefits.map((benefit, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                                                                <span>{benefit}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {hasRequiredCred ? (
                                                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
                                                            Present Credentials
                                                            <ArrowRight className="h-4 w-4 ml-2" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" className="w-full" disabled>
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            Add {service.requiredType.toUpperCase()} First
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Presentation History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {presentationHistory.length === 0 ? (
                                            <div className="text-center py-12">
                                                <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-600">No presentations sent yet</p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Select a service to create your first Verifiable Presentation
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {presentationHistory.map((record) => (
                                                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{record.service}</p>
                                                                <p className="text-xs text-slate-600">
                                                                    {record.credentials} credential(s) • {format(new Date(record.timestamp), 'MMM dd, yyyy HH:mm')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-emerald-100 text-emerald-700">
                                                            {record.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div>
                        <Button 
                            variant="ghost" 
                            onClick={() => setActiveService(null)}
                            className="mb-4"
                        >
                            ← Back to Services
                        </Button>
                        
                        <VerifiablePresentationFlow
                            recipientService={services.find(s => s.id === activeService)?.name}
                            requiredCredentialType={services.find(s => s.id === activeService)?.requiredType}
                            onPresentationCreated={handlePresentationCreated}
                            onCancel={() => setActiveService(null)}
                        />
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}