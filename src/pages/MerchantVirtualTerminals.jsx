import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
    Monitor, Settings, ExternalLink, Loader2, Save, CheckCircle2
} from 'lucide-react';

const ROLE_PERMISSIONS = {
    admin: 'Full access to Virtual Terminal',
    manager: 'Can process payments and view transactions',
    operator: 'Can process payments only',
    viewer: 'Read-only access'
};

export default function MerchantVirtualTerminals() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [selectedMID, setSelectedMID] = useState('');
    const [saving, setSaving] = useState(false);
    const queryClient = useQueryClient();

    React.useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const { data: vtConfig, isLoading: loadingVT } = useQuery({
        queryKey: ['virtual-terminal', user?.merchant_id],
        queryFn: async () => {
            const terminals = await base44.entities.VirtualTerminal.filter({ 
                merchant_id: user.merchant_id 
            });
            return terminals[0] || null;
        },
        enabled: !!user?.merchant_id
    });

    const [settings, setSettings] = useState({
        status: 'active',
        allowed_currencies: ['USD', 'EUR', 'GBP'],
        daily_limit: 50000,
        per_transaction_limit: 10000,
        requires_cvv: true,
        requires_billing_address: false,
        enable_3ds: true,
        enable_card_on_file: true,
        enable_recurring: true,
        enable_split_tender: true,
        enable_itemized_sale: true,
        send_receipts_email: true,
        send_receipts_sms: false,
        allowed_roles: ['admin', 'manager', 'operator']
    });

    React.useEffect(() => {
        if (vtConfig) {
            setSettings(vtConfig);
        }
    }, [vtConfig]);

    const saveSettings = useMutation({
        mutationFn: async (data) => {
            if (vtConfig) {
                return await base44.entities.VirtualTerminal.update(vtConfig.id, data);
            } else {
                return await base44.entities.VirtualTerminal.create({
                    ...data,
                    merchant_id: user.merchant_id,
                    merchant_name: merchant?.business_name
                });
            }
        },
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['virtual-terminal'] }); 
            setSaving(false);
        }
    });

    const handleSave = async () => {
        setSaving(true);
        await saveSettings.mutateAsync(settings);
    };

    const hasAccess = user?.role && settings.allowed_roles?.includes(user.role);

    if (loading || loadingVT) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantVirtualTerminals"
                user={user}
                merchant={merchant}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Virtual Terminal</h1>
                                <p className="text-slate-500">Configure settings for your payment terminal</p>
                            </div>
                            <div className="flex gap-2">
                                {vtConfig && hasAccess && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => window.open(createPageUrl('MerchantVirtualTerminal'), '_blank')}
                                        className="gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Open Terminal
                                    </Button>
                                )}
                                <Button 
                                    onClick={handleSave} 
                                    disabled={saving}
                                    className="gap-2"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Settings
                                </Button>
                            </div>
                        </div>

                        {!vtConfig && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-900">Virtual Terminal Not Configured</p>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Configure your settings below and click "Save Settings" to activate your virtual terminal.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {vtConfig && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${settings.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            <div>
                                                <p className="font-medium">Terminal Status</p>
                                                <p className="text-sm text-slate-500">
                                                    {settings.status === 'active' ? 'Active and ready to process payments' : 'Inactive'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={settings.status === 'active' ? 'default' : 'secondary'}>
                                            {settings.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Tabs defaultValue="general" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="features">Features</TabsTrigger>
                                <TabsTrigger value="limits">Limits</TabsTrigger>
                                <TabsTrigger value="access">Access Control</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>General Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <Label>Status</Label>
                                            <Select 
                                                value={settings.status} 
                                                onValueChange={(v) => setSettings(p => ({ ...p, status: v }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Allowed Currencies</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'HKD'].map(curr => (
                                                    <Button
                                                        key={curr}
                                                        type="button"
                                                        variant={settings.allowed_currencies?.includes(curr) ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => {
                                                            const current = settings.allowed_currencies || [];
                                                            if (current.includes(curr)) {
                                                                setSettings(p => ({ ...p, allowed_currencies: current.filter(c => c !== curr) }));
                                                            } else {
                                                                setSettings(p => ({ ...p, allowed_currencies: [...current, curr] }));
                                                            }
                                                        }}
                                                    >
                                                        {curr}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Require CVV</p>
                                                    <p className="text-sm text-slate-500">Card verification value required</p>
                                                </div>
                                                <Switch 
                                                    checked={settings.requires_cvv} 
                                                    onCheckedChange={(c) => setSettings(p => ({ ...p, requires_cvv: c }))} 
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Require Billing Address</p>
                                                    <p className="text-sm text-slate-500">Customer billing address required</p>
                                                </div>
                                                <Switch 
                                                    checked={settings.requires_billing_address} 
                                                    onCheckedChange={(c) => setSettings(p => ({ ...p, requires_billing_address: c }))} 
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Enable 3D Secure</p>
                                                    <p className="text-sm text-slate-500">Additional authentication for cards</p>
                                                </div>
                                                <Switch 
                                                    checked={settings.enable_3ds} 
                                                    onCheckedChange={(c) => setSettings(p => ({ ...p, enable_3ds: c }))} 
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="features" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Features</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Card on File</p>
                                                <p className="text-sm text-slate-500">Save customer cards for future use</p>
                                            </div>
                                            <Switch 
                                                checked={settings.enable_card_on_file} 
                                                onCheckedChange={(c) => setSettings(p => ({ ...p, enable_card_on_file: c }))} 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Recurring Payments</p>
                                                <p className="text-sm text-slate-500">Schedule automatic recurring charges</p>
                                            </div>
                                            <Switch 
                                                checked={settings.enable_recurring} 
                                                onCheckedChange={(c) => setSettings(p => ({ ...p, enable_recurring: c }))} 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Split Tender Payments</p>
                                                <p className="text-sm text-slate-500">Allow multiple payment methods per transaction</p>
                                            </div>
                                            <Switch 
                                                checked={settings.enable_split_tender} 
                                                onCheckedChange={(c) => setSettings(p => ({ ...p, enable_split_tender: c }))} 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Itemized Sales</p>
                                                <p className="text-sm text-slate-500">Add line items and manage inventory</p>
                                            </div>
                                            <Switch 
                                                checked={settings.enable_itemized_sale} 
                                                onCheckedChange={(c) => setSettings(p => ({ ...p, enable_itemized_sale: c }))} 
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Receipt Options</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Email Receipts</p>
                                                <p className="text-sm text-slate-500">Send receipts via email</p>
                                            </div>
                                            <Switch 
                                                checked={settings.send_receipts_email} 
                                                onCheckedChange={(c) => setSettings(p => ({ ...p, send_receipts_email: c }))} 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">SMS Receipts</p>
                                                <p className="text-sm text-slate-500">Send receipts via text message</p>
                                            </div>
                                            <Switch 
                                                checked={settings.send_receipts_sms} 
                                                onCheckedChange={(c) => setSettings(p => ({ ...p, send_receipts_sms: c }))} 
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="limits" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transaction Limits</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Daily Limit ($)</Label>
                                            <Input 
                                                type="number" 
                                                value={settings.daily_limit} 
                                                onChange={(e) => setSettings(p => ({ ...p, daily_limit: parseInt(e.target.value) }))} 
                                            />
                                            <p className="text-xs text-slate-500">Maximum daily transaction volume</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Per Transaction Limit ($)</Label>
                                            <Input 
                                                type="number" 
                                                value={settings.per_transaction_limit} 
                                                onChange={(e) => setSettings(p => ({ ...p, per_transaction_limit: parseInt(e.target.value) }))} 
                                            />
                                            <p className="text-xs text-slate-500">Maximum amount per single transaction</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="access" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Role-Based Access Control</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-slate-600">Select which user roles can access the Virtual Terminal:</p>
                                        
                                        {Object.entries(ROLE_PERMISSIONS).map(([role, description]) => (
                                            <div key={role} className="flex items-start gap-3 p-3 border rounded-lg">
                                                <Switch 
                                                    checked={settings.allowed_roles?.includes(role)} 
                                                    onCheckedChange={(checked) => {
                                                        const current = settings.allowed_roles || [];
                                                        if (checked) {
                                                            setSettings(p => ({ ...p, allowed_roles: [...current, role] }));
                                                        } else {
                                                            setSettings(p => ({ ...p, allowed_roles: current.filter(r => r !== role) }));
                                                        }
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-medium capitalize">{role}</p>
                                                    <p className="text-sm text-slate-500">{description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {user?.role && (
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                {hasAccess ? (
                                                    <>
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                        <div>
                                                            <p className="font-medium text-emerald-900">You have access</p>
                                                            <p className="text-sm text-emerald-700">Your role ({user.role}) can access the Virtual Terminal</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Monitor className="h-5 w-5 text-amber-600" />
                                                        <div>
                                                            <p className="font-medium text-amber-900">Limited access</p>
                                                            <p className="text-sm text-amber-700">Your role ({user.role}) does not have Virtual Terminal access</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}