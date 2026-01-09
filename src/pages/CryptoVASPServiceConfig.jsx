import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Wallet, Save, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function CryptoVASPServiceConfig() {
    const { platformUser } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('provider');

    const [providerSettings, setProviderSettings] = useState({
        provider: 'striga',
        api_key: 'sk_live_***********',
        api_secret_configured: true,
        application_id: 'app_prod_001',
        webhook_url: 'https://crypto.fts.money/webhooks/striga',
        environment: 'production'
    });

    const [kycConfig, setKycConfig] = useState({
        tier1_enabled: true,
        tier2_enabled: true,
        tier3_enabled: true,
        auto_verification: false,
        document_types: ['passport', 'drivers_license', 'national_id'],
        liveness_check: true,
        address_verification: true
    });

    const [travelRule, setTravelRule] = useState({
        enabled: true,
        threshold_usd: 1000,
        provider: 'notabene',
        vasp_did: 'did:vasp:fts.money',
        counterparty_validation: true
    });

    const [cardIssuance, setCardIssuance] = useState({
        enabled: true,
        physical_cards: true,
        virtual_cards: true,
        card_provider: 'striga',
        issuance_fee: 10,
        monthly_fee: 2
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CryptoVASPServiceConfig"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Wallet className="h-8 w-8 text-blue-600" />
                            Crypto VASP Service Configuration
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Configure provider integration, KYC settings, travel rule compliance, and card issuance
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="provider">Provider Settings</TabsTrigger>
                            <TabsTrigger value="kyc">KYC Configuration</TabsTrigger>
                            <TabsTrigger value="travel">Travel Rule</TabsTrigger>
                            <TabsTrigger value="cards">Card Issuance</TabsTrigger>
                        </TabsList>

                        <TabsContent value="provider" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Striga Integration</CardTitle>
                                    <CardDescription>
                                        Configure Striga API credentials and webhook settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Provider</Label>
                                        <Input value={providerSettings.provider} disabled className="mt-1" />
                                    </div>

                                    <div>
                                        <Label>Application ID</Label>
                                        <Input value={providerSettings.application_id} className="mt-1" />
                                    </div>

                                    <div>
                                        <Label>Environment</Label>
                                        <select className="w-full mt-1 px-3 py-2 border rounded-md" value={providerSettings.environment}>
                                            <option value="sandbox">Sandbox</option>
                                            <option value="production">Production</option>
                                        </select>
                                    </div>

                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            <div>
                                                <p className="font-medium text-emerald-900">API Credentials Configured</p>
                                                <p className="text-sm text-emerald-700">Connected to Striga production environment</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Webhook URL</Label>
                                        <Input value={providerSettings.webhook_url} className="mt-1" />
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Provider Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="kyc" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>KYC Verification Configuration</CardTitle>
                                    <CardDescription>
                                        Configure verification tiers and document requirements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Tier 1 Verification</p>
                                            <p className="text-sm text-slate-600">Email and phone verification</p>
                                        </div>
                                        <Switch checked={kycConfig.tier1_enabled} onCheckedChange={(checked) => setKycConfig({...kycConfig, tier1_enabled: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Tier 2 Verification</p>
                                            <p className="text-sm text-slate-600">Identity document verification</p>
                                        </div>
                                        <Switch checked={kycConfig.tier2_enabled} onCheckedChange={(checked) => setKycConfig({...kycConfig, tier2_enabled: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Tier 3 Verification</p>
                                            <p className="text-sm text-slate-600">Enhanced due diligence</p>
                                        </div>
                                        <Switch checked={kycConfig.tier3_enabled} onCheckedChange={(checked) => setKycConfig({...kycConfig, tier3_enabled: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Auto Verification</p>
                                            <p className="text-sm text-slate-600">Automatically approve low-risk users</p>
                                        </div>
                                        <Switch checked={kycConfig.auto_verification} onCheckedChange={(checked) => setKycConfig({...kycConfig, auto_verification: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Liveness Check</p>
                                            <p className="text-sm text-slate-600">Real-time selfie verification</p>
                                        </div>
                                        <Switch checked={kycConfig.liveness_check} onCheckedChange={(checked) => setKycConfig({...kycConfig, liveness_check: checked})} />
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save KYC Configuration
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="travel" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Travel Rule Compliance</CardTitle>
                                    <CardDescription>
                                        Configure FATF Travel Rule compliance settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Travel Rule Enabled</p>
                                            <p className="text-sm text-slate-600">FATF compliance for transfers over threshold</p>
                                        </div>
                                        <Switch checked={travelRule.enabled} onCheckedChange={(checked) => setTravelRule({...travelRule, enabled: checked})} />
                                    </div>

                                    <div>
                                        <Label>Threshold Amount (USD)</Label>
                                        <Input 
                                            type="number" 
                                            value={travelRule.threshold_usd} 
                                            onChange={(e) => setTravelRule({...travelRule, threshold_usd: parseInt(e.target.value)})}
                                            className="mt-1" 
                                        />
                                    </div>

                                    <div>
                                        <Label>Travel Rule Provider</Label>
                                        <select className="w-full mt-1 px-3 py-2 border rounded-md" value={travelRule.provider}>
                                            <option value="notabene">Notabene</option>
                                            <option value="sygna">Sygna</option>
                                            <option value="trisa">TRISA</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label>VASP DID</Label>
                                        <Input value={travelRule.vasp_did} className="mt-1" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Counterparty Validation</p>
                                            <p className="text-sm text-slate-600">Verify recipient VASP compliance</p>
                                        </div>
                                        <Switch checked={travelRule.counterparty_validation} onCheckedChange={(checked) => setTravelRule({...travelRule, counterparty_validation: checked})} />
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Travel Rule Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="cards" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Card Issuance Configuration</CardTitle>
                                    <CardDescription>
                                        Configure physical and virtual card issuance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Card Issuance Enabled</p>
                                            <p className="text-sm text-slate-600">Allow users to request debit cards</p>
                                        </div>
                                        <Switch checked={cardIssuance.enabled} onCheckedChange={(checked) => setCardIssuance({...cardIssuance, enabled: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Physical Cards</p>
                                            <p className="text-sm text-slate-600">Ship physical cards to customers</p>
                                        </div>
                                        <Switch checked={cardIssuance.physical_cards} onCheckedChange={(checked) => setCardIssuance({...cardIssuance, physical_cards: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Virtual Cards</p>
                                            <p className="text-sm text-slate-600">Instant virtual card issuance</p>
                                        </div>
                                        <Switch checked={cardIssuance.virtual_cards} onCheckedChange={(checked) => setCardIssuance({...cardIssuance, virtual_cards: checked})} />
                                    </div>

                                    <div>
                                        <Label>Card Provider</Label>
                                        <Input value={cardIssuance.card_provider} disabled className="mt-1" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Issuance Fee (USD)</Label>
                                            <Input type="number" value={cardIssuance.issuance_fee} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Monthly Fee (USD)</Label>
                                            <Input type="number" value={cardIssuance.monthly_fee} className="mt-1" />
                                        </div>
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Card Settings
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