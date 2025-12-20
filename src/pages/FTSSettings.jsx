import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Settings, Users, Shield, Bell, FileCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FTSSettings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState({
        platform_name: 'FTS.Money',
        support_email: 'support@fts.money',
        auto_provisioning: true,
        require_approval: false,
        notifications_enabled: true
    });

    const [leiForm, setLeiForm] = useState({
        lei: '',
        legal_name: 'FTS.Money Ltd',
        organizational_roles: []
    });

    // Fetch platform LEI
    const { data: platformLEI } = useQuery({
        queryKey: ['platformLEI'],
        queryFn: async () => {
            const response = await base44.functions.invoke('initializePlatformLEI', { action: 'get' });
            return response.data?.platform_lei;
        }
    });

    // Initialize platform LEI
    const initializeLEIMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('initializePlatformLEI', {
                action: 'initialize',
                ...data
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platformLEI'] });
            toast.success('Platform LEI initialized successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to initialize LEI');
        }
    });

    // Issue vLEI
    const issueVLEIMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('initializePlatformLEI', {
                action: 'issue_vlei'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platformLEI'] });
            toast.success('vLEI credential issued successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to issue vLEI');
        }
    });

    const handleInitializeLEI = () => {
        if (!leiForm.lei || leiForm.lei.length !== 20) {
            toast.error('LEI must be exactly 20 characters');
            return;
        }
        initializeLEIMutation.mutate(leiForm);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="mb-3"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Platform
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
                            <p className="text-sm text-slate-600">Configure global platform settings and preferences</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs defaultValue="general">
                    <TabsList className="mb-6">
                        <TabsTrigger value="general" className="gap-2">
                            <Settings className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="lei" className="gap-2">
                            <FileCheck className="h-4 w-4" />
                            Platform LEI/vLEI
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="users" className="gap-2">
                            <Users className="h-4 w-4" />
                            User Management
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Configure basic platform settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label>Platform Name</Label>
                                    <Input
                                        value={settings.platform_name}
                                        onChange={(e) => setSettings({...settings, platform_name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Support Email</Label>
                                    <Input
                                        type="email"
                                        value={settings.support_email}
                                        onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Auto-Provisioning</Label>
                                        <p className="text-sm text-slate-600">Automatically provision PSPs upon approval</p>
                                    </div>
                                    <Switch
                                        checked={settings.auto_provisioning}
                                        onCheckedChange={(v) => setSettings({...settings, auto_provisioning: v})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Require Manual Approval</Label>
                                        <p className="text-sm text-slate-600">All new PSPs require admin approval</p>
                                    </div>
                                    <Switch
                                        checked={settings.require_approval}
                                        onCheckedChange={(v) => setSettings({...settings, require_approval: v})}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="lei">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform LEI & vLEI Credentials</CardTitle>
                                <CardDescription>
                                    Manage FTS.Money's Legal Entity Identifier and Verifiable LEI credentials
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!platformLEI ? (
                                    <>
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-sm text-amber-900 font-medium mb-2">⚠️ Platform LEI Not Initialized</p>
                                            <p className="text-sm text-amber-800">
                                                To enable full vLEI transaction signing and credential chain validation, 
                                                FTS.Money must have its own LEI registered with GLEIF.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label>LEI (20 characters)</Label>
                                                <Input
                                                    placeholder="e.g., 213800ABCDEF123456XY"
                                                    value={leiForm.lei}
                                                    onChange={(e) => setLeiForm({...leiForm, lei: e.target.value.toUpperCase()})}
                                                    maxLength={20}
                                                />
                                                <p className="text-xs text-slate-600 mt-1">
                                                    Enter FTS.Money's 20-character LEI from GLEIF registration
                                                </p>
                                            </div>

                                            <div>
                                                <Label>Legal Entity Name</Label>
                                                <Input
                                                    value={leiForm.legal_name}
                                                    onChange={(e) => setLeiForm({...leiForm, legal_name: e.target.value})}
                                                />
                                            </div>

                                            <Button
                                                onClick={handleInitializeLEI}
                                                disabled={initializeLEIMutation.isPending}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {initializeLEIMutation.isPending ? 'Initializing...' : 'Initialize Platform LEI'}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <p className="text-sm text-emerald-900 font-medium mb-2">✓ Platform LEI Active</p>
                                            <div className="space-y-1 text-sm text-emerald-800">
                                                <p><strong>LEI:</strong> {platformLEI.lei}</p>
                                                <p><strong>Legal Name:</strong> {platformLEI.legal_name}</p>
                                                <p><strong>Status:</strong> {platformLEI.lei_status}</p>
                                                <p><strong>vLEI Status:</strong> {platformLEI.vlei_status}</p>
                                            </div>
                                        </div>

                                        {platformLEI.vlei_status !== 'active' && (
                                            <div>
                                                <p className="text-sm text-slate-600 mb-3">
                                                    Issue a vLEI credential to enable cryptographic signing of all platform transactions
                                                </p>
                                                <Button
                                                    onClick={() => issueVLEIMutation.mutate()}
                                                    disabled={issueVLEIMutation.isPending}
                                                    className="bg-indigo-600 hover:bg-indigo-700"
                                                >
                                                    {issueVLEIMutation.isPending ? 'Issuing...' : 'Issue vLEI Credential'}
                                                </Button>
                                            </div>
                                        )}

                                        {platformLEI.vlei_status === 'active' && (
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-900 font-medium mb-2">🔐 vLEI Active</p>
                                                <p className="text-sm text-blue-800">
                                                    All platform transactions are now cryptographically signed with FTS.Money's vLEI credential.
                                                    PSPs and merchants inherit this credential chain.
                                                </p>
                                            </div>
                                        )}

                                        {platformLEI.gleif_data && (
                                            <div>
                                                <Label className="text-sm font-medium">GLEIF Verification Data</Label>
                                                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                                                    <p><strong>Registration Authority:</strong> {platformLEI.gleif_data.registration_authority}</p>
                                                    <p><strong>Jurisdiction:</strong> {platformLEI.gleif_data.jurisdiction}</p>
                                                    <p><strong>Category:</strong> {platformLEI.gleif_data.category}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-600">Downstream PSPs</p>
                                                <p className="text-2xl font-bold text-slate-900">
                                                    {platformLEI.downstream_entities?.total_psps || 0}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {platformLEI.downstream_entities?.lei_compliant_psps || 0} LEI-compliant
                                                </p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-600">Downstream Merchants</p>
                                                <p className="text-2xl font-bold text-slate-900">
                                                    {platformLEI.downstream_entities?.total_merchants || 0}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {platformLEI.downstream_entities?.lei_compliant_merchants || 0} LEI-compliant
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-2">OOR & ECR Application</h4>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <p><strong>OOR (Official Organizational Role):</strong> Applied at each level:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                                            <li>Platform: CEO, CFO, CTO, Compliance Officer</li>
                                            <li>PSP: PSP Admin, Operations Manager</li>
                                            <li>Merchant: Merchant Owner, Finance Manager</li>
                                        </ul>
                                        <p className="mt-3"><strong>ECR (Engagement Context Role):</strong> Defines relationships:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                                            <li>Platform ↔ PSP: Payment Service Provider Agreement</li>
                                            <li>PSP ↔ Merchant: Acquiring Agreement</li>
                                            <li>Merchant ↔ Customer: Payment Processing Agreement</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Configure platform security and access controls</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-slate-700">
                                        Role-based access control (RBAC) is enabled for Admin, Technology, and Delivery roles.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>Configure platform-wide notifications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-slate-600">Send email notifications for important events</p>
                                    </div>
                                    <Switch
                                        checked={settings.notifications_enabled}
                                        onCheckedChange={(v) => setSettings({...settings, notifications_enabled: v})}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Manage platform users and their roles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600">User management interface coming soon...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}