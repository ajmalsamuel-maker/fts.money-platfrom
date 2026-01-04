import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
    Settings, 
    Save, 
    ArrowLeft,
    DollarSign,
    Lock,
    Webhook,
    Shield,
    Copy,
    RefreshCw,
    Trash2,
    Plus,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function CryptoVASPSettings() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Get VASP ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const vaspId = urlParams.get('id');

    const [settings, setSettings] = useState({
        supported_currencies: ['BTC', 'ETH', 'USDT', 'USDC', 'EUR'],
        daily_limit: 100000,
        per_transaction_limit: 10000,
        monthly_limit: 2000000,
        api_enabled: true,
        webhooks_enabled: true
    });

    const [webhooks, setWebhooks] = useState([
        { id: '1', url: '', events: ['transaction.completed', 'kyc.approved'], active: true }
    ]);

    const [apiKeys, setApiKeys] = useState([]);
    const [showNewKey, setShowNewKey] = useState(false);

    // Fetch VASP details
    const { data: vasp, isLoading } = useQuery({
        queryKey: ['vasp', vaspId],
        queryFn: async () => {
            if (!vaspId) return null;
            const result = await base44.entities.CryptoGatewayCustomer.filter({ id: vaspId });
            return result?.[0] || null;
        },
        enabled: !!vaspId
    });

    // Save settings mutation
    const saveSettingsMutation = useMutation({
        mutationFn: async (newSettings) => {
            await base44.entities.CryptoGatewayCustomer.update(vaspId, {
                settings: newSettings,
                updated_at: new Date().toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vasp', vaspId] });
        }
    });

    const handleSaveSettings = () => {
        saveSettingsMutation.mutate(settings);
    };

    const generateAPIKey = () => {
        const newKey = {
            id: Date.now().toString(),
            key: `vasp_${Math.random().toString(36).substr(2, 32)}`,
            secret: `secret_${Math.random().toString(36).substr(2, 48)}`,
            name: `API Key ${apiKeys.length + 1}`,
            created_at: new Date().toISOString(),
            active: true
        };
        setApiKeys([...apiKeys, newKey]);
        setShowNewKey(newKey);
    };

    const deleteAPIKey = (keyId) => {
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
    };

    const addWebhook = () => {
        setWebhooks([...webhooks, {
            id: Date.now().toString(),
            url: '',
            events: [],
            active: true
        }]);
    };

    const updateWebhook = (id, updates) => {
        setWebhooks(webhooks.map(w => w.id === id ? { ...w, ...updates } : w));
    };

    const deleteWebhook = (id) => {
        setWebhooks(webhooks.filter(w => w.id !== id));
    };

    const availableCurrencies = ['BTC', 'ETH', 'USDT', 'USDC', 'EUR', 'USD', 'GBP', 'LTC', 'XRP', 'ADA', 'DOT', 'SOL'];
    const webhookEvents = [
        'transaction.completed',
        'transaction.failed',
        'kyc.approved',
        'kyc.rejected',
        'withdrawal.requested',
        'deposit.confirmed',
        'user.created'
    ];

    if (authLoading || isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!vaspId || !vasp) {
        return (
            <div className="flex h-screen bg-slate-50">
                <FTSPlatformSidebar 
                    currentPage="CryptoVASPSettings" 
                    userRole={platformUser?.platform_role}
                    userEmail={platformUser?.email}
                />
                <div className="flex-1 flex items-center justify-center">
                    <Card className="max-w-md">
                        <CardContent className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">VASP Not Found</h3>
                            <p className="text-slate-600 mb-4">The requested VASP instance could not be found.</p>
                            <Button onClick={() => navigate(createPageUrl('CryptoBankingVASPManagement'))}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to VASP Management
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CryptoVASPSettings" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate(createPageUrl('CryptoBankingVASPManagement'))}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to VASP Management
                        </Button>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">VASP Settings</h1>
                                <p className="text-slate-600 mt-1">{vasp.company_name || vasp.name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">ID: {vasp.id}</Badge>
                                    <Badge variant="outline">{vasp.jurisdiction}</Badge>
                                </div>
                            </div>
                            <Button 
                                onClick={handleSaveSettings}
                                disabled={saveSettingsMutation.isPending}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saveSettingsMutation.isPending ? 'Saving...' : 'Save All Settings'}
                            </Button>
                        </div>

                        {saveSettingsMutation.isSuccess && (
                            <Alert className="mt-4 bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    Settings saved successfully
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <Tabs defaultValue="currencies" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="currencies">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Currencies & Limits
                            </TabsTrigger>
                            <TabsTrigger value="api">
                                <Lock className="h-4 w-4 mr-2" />
                                API Keys
                            </TabsTrigger>
                            <TabsTrigger value="webhooks">
                                <Webhook className="h-4 w-4 mr-2" />
                                Webhooks
                            </TabsTrigger>
                            <TabsTrigger value="security">
                                <Shield className="h-4 w-4 mr-2" />
                                Security
                            </TabsTrigger>
                        </TabsList>

                        {/* Currencies & Limits Tab */}
                        <TabsContent value="currencies" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Supported Currencies</CardTitle>
                                    <CardDescription>
                                        Select which cryptocurrencies and fiat currencies this VASP instance supports
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-3">
                                        {availableCurrencies.map(currency => (
                                            <div key={currency} className="flex items-center space-x-2">
                                                <Switch
                                                    checked={settings.supported_currencies.includes(currency)}
                                                    onCheckedChange={(checked) => {
                                                        setSettings({
                                                            ...settings,
                                                            supported_currencies: checked
                                                                ? [...settings.supported_currencies, currency]
                                                                : settings.supported_currencies.filter(c => c !== currency)
                                                        });
                                                    }}
                                                />
                                                <Label className="cursor-pointer">{currency}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Transaction Limits</CardTitle>
                                    <CardDescription>
                                        Configure transaction limits for this VASP instance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Per Transaction Limit (USD)</Label>
                                            <Input
                                                type="number"
                                                value={settings.per_transaction_limit}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    per_transaction_limit: Number(e.target.value)
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Daily Limit (USD)</Label>
                                            <Input
                                                type="number"
                                                value={settings.daily_limit}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    daily_limit: Number(e.target.value)
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Monthly Limit (USD)</Label>
                                            <Input
                                                type="number"
                                                value={settings.monthly_limit}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    monthly_limit: Number(e.target.value)
                                                })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* API Keys Tab */}
                        <TabsContent value="api" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>API Keys</CardTitle>
                                            <CardDescription>
                                                Manage API keys for this VASP's integrations
                                            </CardDescription>
                                        </div>
                                        <Button onClick={generateAPIKey}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Generate New Key
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {showNewKey && (
                                        <Alert className="mb-4 bg-blue-50 border-blue-200">
                                            <Lock className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-900">
                                                <div className="font-medium mb-2">New API Key Generated</div>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <span className="font-medium">API Key:</span>
                                                        <code className="ml-2 bg-white px-2 py-1 rounded">{showNewKey.key}</code>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => navigator.clipboard.writeText(showNewKey.key)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Secret:</span>
                                                        <code className="ml-2 bg-white px-2 py-1 rounded">{showNewKey.secret}</code>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => navigator.clipboard.writeText(showNewKey.secret)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-xs mt-2 text-blue-700">
                                                    ⚠️ Save these credentials now - the secret will not be shown again
                                                </p>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {apiKeys.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            No API keys generated yet
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {apiKeys.map(key => (
                                                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">{key.name}</div>
                                                        <div className="text-sm text-slate-600 font-mono">{key.key}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            Created: {new Date(key.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={key.active ? 'default' : 'secondary'}>
                                                            {key.active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        <Button variant="ghost" size="sm" onClick={() => deleteAPIKey(key.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Webhooks Tab */}
                        <TabsContent value="webhooks" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Webhook Endpoints</CardTitle>
                                            <CardDescription>
                                                Configure webhooks for real-time event notifications
                                            </CardDescription>
                                        </div>
                                        <Button onClick={addWebhook}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Webhook
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {webhooks.map((webhook, index) => (
                                        <Card key={webhook.id}>
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <Label>Webhook URL</Label>
                                                                <Input
                                                                    placeholder="https://your-domain.com/webhook"
                                                                    value={webhook.url}
                                                                    onChange={(e) => updateWebhook(webhook.id, { url: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Events</Label>
                                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                                    {webhookEvents.map(event => (
                                                                        <div key={event} className="flex items-center space-x-2">
                                                                            <Switch
                                                                                checked={webhook.events.includes(event)}
                                                                                onCheckedChange={(checked) => {
                                                                                    updateWebhook(webhook.id, {
                                                                                        events: checked
                                                                                            ? [...webhook.events, event]
                                                                                            : webhook.events.filter(e => e !== event)
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <Label className="text-sm">{event}</Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => deleteWebhook(webhook.id)}
                                                            className="ml-4"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={webhook.active}
                                                                onCheckedChange={(checked) => updateWebhook(webhook.id, { active: checked })}
                                                            />
                                                            <Label>Active</Label>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            <RefreshCw className="h-4 w-4 mr-2" />
                                                            Test Webhook
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                    <CardDescription>
                                        Configure security and compliance settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base">API Access</Label>
                                            <p className="text-sm text-slate-600">Enable API access for this VASP</p>
                                        </div>
                                        <Switch
                                            checked={settings.api_enabled}
                                            onCheckedChange={(checked) => setSettings({...settings, api_enabled: checked})}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base">Webhook Notifications</Label>
                                            <p className="text-sm text-slate-600">Enable webhook event notifications</p>
                                        </div>
                                        <Switch
                                            checked={settings.webhooks_enabled}
                                            onCheckedChange={(checked) => setSettings({...settings, webhooks_enabled: checked})}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base">Two-Factor Authentication</Label>
                                            <p className="text-sm text-slate-600">Require 2FA for admin access</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base">IP Whitelisting</Label>
                                            <p className="text-sm text-slate-600">Restrict API access to specific IPs</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}