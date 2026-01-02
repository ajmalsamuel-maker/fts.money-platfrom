import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle, XCircle, Globe, Shield, CreditCard, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalStandardsRegistry() {
    const [platformUser] = useState(() => JSON.parse(localStorage.getItem('platform_admin_session') || '{}'));
    const queryClient = useQueryClient();
    const [syncing, setSyncing] = useState(false);

    const standards = [
        {
            category: 'ISO Standards',
            icon: Shield,
            items: [
                { name: 'ISO 4217', description: 'Currency Codes', status: 'active', path: 'components/utils/iso4217' },
                { name: 'ISO 8583', description: 'Card Payment Messaging', status: 'active', path: 'components/utils/iso8583' },
                { name: 'ISO 20022', description: 'Financial Messaging', status: 'active', path: 'components/utils/iso20022' },
                { name: 'ISO 23257', description: 'Blockchain/DLT', status: 'active', path: 'components/utils/iso23257' },
                { name: 'ISO 24165', description: 'Digital Token Identifiers', status: 'active', path: 'components/utils/iso24165' },
                { name: 'ISO 3166', description: 'Country Codes', status: 'active', path: 'components/utils/countries' },
                { name: 'ISO 13616', description: 'IBAN', status: 'active', path: 'components/utils/ibanBic' },
                { name: 'ISO 9362', description: 'BIC/SWIFT Codes', status: 'active', path: 'components/utils/ibanBic' }
            ]
        },
        {
            category: 'Payment Standards',
            icon: CreditCard,
            items: [
                { name: 'Stripe API', description: 'Payment Methods Catalog', status: 'active', path: 'functions/stripePaymentMethodsSync' },
                { name: 'Adyen Catalog', description: 'Global Payment Methods', status: 'active', path: 'functions/adyenPaymentMethodsSync' },
                { name: 'W3C Payment Request', description: 'Browser Payment API', status: 'active', path: 'components/utils/w3cPaymentRequestAPI' },
                { name: 'EMVCo Tokenization', description: 'Network Tokens (VTS, MDES)', status: 'active', path: 'components/utils/emvcoTokenization' },
                { name: 'SWIFT Payment Market', description: 'Cross-border Standards', status: 'active', path: 'components/utils/swiftPaymentMarket' },
                { name: 'PayAtlas', description: 'PSP Directory', status: 'active', path: 'functions/payatlasSync' }
            ]
        },
        {
            category: 'Financial Registries',
            icon: Database,
            items: [
                { name: 'GLEIF', description: 'Legal Entity Identifiers', status: 'active', path: 'functions/gleifIntegration' },
                { name: 'Crypto Registry', description: 'Digital Assets', status: 'active', path: 'components/utils/cryptoRegistry' }
            ]
        },
        {
            category: 'Logo Sources',
            icon: Globe,
            items: [
                { name: 'mpay24', description: 'Payment Method Logos', status: 'active', url: 'https://github.com/mpay24/payment-logos' },
                { name: 'CryptoLogos.cc', description: 'Cryptocurrency Logos', status: 'active', url: 'https://cryptologos.cc' },
                { name: 'Clearbit', description: 'Company Logos', status: 'active', url: 'https://clearbit.com' }
            ]
        }
    ];

    const syncAllRegistries = async () => {
        setSyncing(true);
        try {
            const response = await base44.functions.invoke('syncPaymentMethodsRegistry', {});
            if (response.data.success) {
                toast.success('All registries synced successfully!');
                queryClient.invalidateQueries(['payment-providers']);
                queryClient.invalidateQueries(['master-pricing']);
            }
        } catch (error) {
            toast.error(`Sync failed: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="GlobalStandardsRegistry"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Global Standards & Registries</h1>
                            <p className="text-sm text-slate-600 mt-1">Manage integrations with ISO standards, payment networks, and global registries</p>
                        </div>
                        <Button 
                            onClick={syncAllRegistries}
                            disabled={syncing}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync All Registries'}
                        </Button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">ISO Standards</p>
                                        <p className="text-2xl font-bold text-slate-900">8</p>
                                    </div>
                                    <Shield className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Payment Standards</p>
                                        <p className="text-2xl font-bold text-slate-900">6</p>
                                    </div>
                                    <CreditCard className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Registries</p>
                                        <p className="text-2xl font-bold text-slate-900">2</p>
                                    </div>
                                    <Database className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Sources</p>
                                        <p className="text-2xl font-bold text-slate-900">19</p>
                                    </div>
                                    <Globe className="h-8 w-8 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Standards List */}
                    <div className="space-y-6">
                        {standards.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Card key={category.category}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Icon className="h-5 w-5" />
                                            {category.category}
                                        </CardTitle>
                                        <CardDescription>
                                            {category.items.length} integration{category.items.length !== 1 ? 's' : ''} active
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {category.items.map((item) => (
                                                <div 
                                                    key={item.name}
                                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.status === 'active' ? (
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-slate-400" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900">{item.name}</p>
                                                            <p className="text-sm text-slate-600">{item.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {item.path && (
                                                            <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200">
                                                                {item.path}
                                                            </code>
                                                        )}
                                                        {item.url && (
                                                            <a 
                                                                href={item.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                View Source →
                                                            </a>
                                                        )}
                                                        <Badge className={item.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Integration Guide */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>How to Use These Integrations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">1. Automatic Sync</h4>
                                <p className="text-sm text-slate-600">
                                    Click "Sync All Registries" to update payment methods, currencies, and country codes from all sources.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">2. Payment Provider Management</h4>
                                <p className="text-sm text-slate-600">
                                    Go to Payment Provider Management to add providers and auto-select from 300+ payment methods across 60+ countries.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">3. Compliance & Standards</h4>
                                <p className="text-sm text-slate-600">
                                    All transactions automatically validated against ISO standards (20022, 8583, 4217, etc.) and SWIFT formats.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">4. Token Services</h4>
                                <p className="text-sm text-slate-600">
                                    EMVCo tokenization supports Visa VTS, Mastercard MDES, Amex, Discover, JCB, and UnionPay network tokens.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}