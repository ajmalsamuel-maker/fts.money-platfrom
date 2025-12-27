import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Palette, Key, ExternalLink, Copy, Eye } from 'lucide-react';

export default function CryptoPortalManagement() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const [selectedTab, setSelectedTab] = useState('access');
    const [copied, setCopied] = useState(false);

    const portalUrl = window.location.origin + '/CryptoGatewayLogin';

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (authLoading) {
        return (
            <div className="flex h-screen">
                <FTSPlatformSidebarRestructured currentPage="CryptoPortalManagement" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-slate-500">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="CryptoPortalManagement"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Crypto Portal Management</h1>
                                <p className="text-slate-600">Configure and customize the customer-facing crypto gateway portal</p>
                            </div>
                        </div>
                    </div>

                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList>
                            <TabsTrigger value="access">Portal Access</TabsTrigger>
                            <TabsTrigger value="branding">Branding</TabsTrigger>
                            <TabsTrigger value="features">Features</TabsTrigger>
                            <TabsTrigger value="api">API Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="access" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Portal URL</CardTitle>
                                    <CardDescription>Share this URL with your crypto banking customers</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Customer Portal URL</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Input 
                                                value={portalUrl} 
                                                readOnly 
                                                className="font-mono text-sm"
                                            />
                                            <Button 
                                                variant="outline" 
                                                onClick={() => copyToClipboard(portalUrl)}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                {copied ? 'Copied!' : 'Copy'}
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={() => window.open(portalUrl, '_blank')}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Preview
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-blue-900 mb-1">Portal Status</h4>
                                                <p className="text-sm text-blue-800 mb-2">
                                                    The crypto gateway portal is live and accessible to customers
                                                </p>
                                                <Badge className="bg-green-600">Active</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Access</CardTitle>
                                    <CardDescription>Manage customer login credentials</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 border border-slate-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">Total Active Users</h4>
                                                    <p className="text-sm text-slate-600">Customers with portal access</p>
                                                </div>
                                                <div className="text-3xl font-bold text-blue-600">0</div>
                                            </div>
                                            <Button className="w-full">
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View All Customers
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="branding" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Portal Branding</CardTitle>
                                    <CardDescription>Customize the look and feel of the customer portal</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Portal Title</Label>
                                        <Input 
                                            defaultValue="FTS.Money Crypto Banking" 
                                            placeholder="Your Crypto Banking"
                                        />
                                    </div>
                                    <div>
                                        <Label>Tagline</Label>
                                        <Input 
                                            defaultValue="Fluid global payments" 
                                            placeholder="Your tagline"
                                        />
                                    </div>
                                    <div>
                                        <Label>Logo URL</Label>
                                        <Input 
                                            placeholder="https://example.com/logo.png" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Primary Color</Label>
                                            <Input type="color" defaultValue="#0066CC" />
                                        </div>
                                        <div>
                                            <Label>Accent Color</Label>
                                            <Input type="color" defaultValue="#00BFFF" />
                                        </div>
                                    </div>
                                    <Button className="w-full">
                                        <Palette className="h-4 w-4 mr-2" />
                                        Save Branding Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="features" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Enabled Features</CardTitle>
                                    <CardDescription>Control what features are available in the portal</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Crypto Wallets', enabled: true, description: 'Multi-chain wallet management' },
                                            { name: 'Virtual IBANs', enabled: true, description: 'SEPA banking accounts' },
                                            { name: 'Card Issuing', enabled: true, description: 'Virtual/physical cards' },
                                            { name: 'On/Off-Ramp', enabled: true, description: 'Crypto ↔ Fiat conversion' },
                                            { name: 'KYC Verification', enabled: true, description: 'Identity verification' },
                                            { name: 'Transaction History', enabled: true, description: 'Complete audit trail' }
                                        ].map((feature) => (
                                            <div key={feature.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{feature.name}</h4>
                                                    <p className="text-sm text-slate-600">{feature.description}</p>
                                                </div>
                                                <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                                                    {feature.enabled ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="api" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Striga API Configuration</CardTitle>
                                    <CardDescription>Integration settings with Striga crypto banking infrastructure</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 bg-green-600 rounded-full" />
                                            <span className="font-semibold text-green-900">API Connected</span>
                                        </div>
                                        <p className="text-sm text-green-800">
                                            Striga API credentials are configured and active
                                        </p>
                                    </div>

                                    <div>
                                        <Label>API Environment</Label>
                                        <Input value="Production" readOnly className="bg-slate-50" />
                                    </div>

                                    <div>
                                        <Label>Application ID</Label>
                                        <Input value="STRIGA_APPLICATION_ID" readOnly className="bg-slate-50 font-mono" />
                                        <p className="text-xs text-slate-500 mt-1">Configured via platform secrets</p>
                                    </div>

                                    <div className="p-4 border border-slate-200 rounded-lg">
                                        <h4 className="font-semibold text-slate-900 mb-2">Available Services</h4>
                                        <div className="space-y-2">
                                            {['Wallet Management', 'IBAN Creation', 'Card Issuing', 'KYC/AML', 'Transactions'].map((service) => (
                                                <div key={service} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                                    {service}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full">
                                        <Key className="h-4 w-4 mr-2" />
                                        Test API Connection
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}