import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Settings, Shield, Bell, FileCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSSettings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useI18n();
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

    const [securitySettings, setSecuritySettings] = useState({
        mfa_required: true,
        session_timeout_minutes: 30,
        ip_whitelist_enabled: false,
        ip_whitelist: '',
        password_min_length: 12,
        password_require_special: true,
        audit_retention_days: 365
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
            try {
                const response = await base44.functions.invoke('initializePlatformLEI', {
                    action: 'initialize',
                    ...data
                });
                
                if (response.data.error) {
                    throw new Error(response.data.error);
                }
                
                return response.data;
            } catch (error) {
                console.error('LEI initialization error:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            toast.dismiss();
            queryClient.invalidateQueries({ queryKey: ['platformLEI'] });
            toast.success('Platform LEI initialized and verified with GLEIF successfully!');
        },
        onError: (error) => {
            toast.dismiss();
            const errorMessage = error?.response?.data?.error || error?.message || 'Failed to initialize LEI - please check the LEI number and try again';
            toast.error(errorMessage, { duration: 5000 });
            console.error('Full error:', error);
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

    const handleInitializeLEI = async () => {
        if (!leiForm.lei || leiForm.lei.length !== 20) {
            toast.error('LEI must be exactly 20 characters');
            return;
        }
        
        toast.loading('Verifying LEI with GLEIF...');
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
                        {t('platform:pages.settings.backToPlatform')}
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{t('platform:pages.settings.title')}</h1>
                            <p className="text-sm text-slate-600">{t('platform:pages.settings.subtitle')}</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Save className="h-4 w-4" />
                            {t('common:actions.saveChanges')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs defaultValue="general">
                    <TabsList className="mb-6">
                        <TabsTrigger value="general" className="gap-2">
                            <Settings className="h-4 w-4" />
                            {t('platform:pages.settings.general')}
                        </TabsTrigger>
                        <TabsTrigger value="lei" className="gap-2">
                            <FileCheck className="h-4 w-4" />
                            {t('platform:pages.settings.platformLEI')}
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            {t('platform:pages.settings.security')}
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            {t('platform:pages.settings.notifications')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('platform:pages.settings.generalSettings')}</CardTitle>
                                <CardDescription>{t('platform:pages.settings.generalDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label>{t('platform:pages.settings.platformName')}</Label>
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
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-900 font-medium mb-2">🚨 PLATFORM LEI REQUIRED</p>
                                            <p className="text-sm text-red-800">
                                                <strong>MANDATORY:</strong> FTS.Money platform LEI must be configured before provisioning any PSPs.
                                                This is a platform-level compliance requirement with no grace period.
                                            </p>
                                            <p className="text-xs text-red-700 mt-2">
                                                Note: PSPs and merchants will have 6-month grace periods for vLEI, OOR, and ECR credentials.
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

                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-900 font-medium mb-2">📅 Grace Periods Active</p>
                                            <div className="space-y-1 text-xs text-blue-800">
                                                <p><strong>vLEI:</strong> Due by {platformLEI.vlei_grace_period_end}</p>
                                                <p><strong>OOR:</strong> Due by {platformLEI.oor_grace_period_end}</p>
                                                <p><strong>ECR:</strong> Due by {platformLEI.ecr_grace_period_end}</p>
                                            </div>
                                        </div>

                                        {platformLEI.vlei_status !== 'active' && (
                                            <div>
                                                <p className="text-sm text-slate-600 mb-3">
                                                    Issue a vLEI credential to enable cryptographic signing of all platform transactions (optional within 6-month grace period)
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
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Authentication & Access Control</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Require Multi-Factor Authentication (MFA)</Label>
                                                <p className="text-xs text-slate-600">All platform admins must use MFA</p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.mfa_required}
                                                onCheckedChange={(v) => setSecuritySettings({...securitySettings, mfa_required: v})}
                                            />
                                        </div>

                                        <div>
                                            <Label>Session Timeout (minutes)</Label>
                                            <Input
                                                type="number"
                                                value={securitySettings.session_timeout_minutes}
                                                onChange={(e) => setSecuritySettings({...securitySettings, session_timeout_minutes: parseInt(e.target.value)})}
                                                className="max-w-xs"
                                            />
                                        </div>

                                        <div>
                                            <Label>Password Minimum Length</Label>
                                            <Input
                                                type="number"
                                                value={securitySettings.password_min_length}
                                                onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value)})}
                                                className="max-w-xs"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Require Special Characters in Password</Label>
                                                <p className="text-xs text-slate-600">Enforce strong password policy</p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.password_require_special}
                                                onCheckedChange={(v) => setSecuritySettings({...securitySettings, password_require_special: v})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-medium mb-3">IP Whitelisting</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Enable IP Whitelisting</Label>
                                                <p className="text-xs text-slate-600">Restrict access to specific IP addresses</p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.ip_whitelist_enabled}
                                                onCheckedChange={(v) => setSecuritySettings({...securitySettings, ip_whitelist_enabled: v})}
                                            />
                                        </div>

                                        {securitySettings.ip_whitelist_enabled && (
                                            <div>
                                                <Label>Allowed IP Addresses (comma-separated)</Label>
                                                <Input
                                                    placeholder="192.168.1.1, 10.0.0.1"
                                                    value={securitySettings.ip_whitelist}
                                                    onChange={(e) => setSecuritySettings({...securitySettings, ip_whitelist: e.target.value})}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-medium mb-3">Audit & Compliance</h4>
                                    <div>
                                        <Label>Audit Log Retention (days)</Label>
                                        <Input
                                            type="number"
                                            value={securitySettings.audit_retention_days}
                                            onChange={(e) => setSecuritySettings({...securitySettings, audit_retention_days: parseInt(e.target.value)})}
                                            className="max-w-xs"
                                        />
                                        <p className="text-xs text-slate-600 mt-1">
                                            Compliance requirement: Minimum 365 days
                                        </p>
                                    </div>
                                </div>

                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Security Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('platform:pages.settings.notificationSettings')}</CardTitle>
                                <CardDescription>{t('platform:pages.settings.notificationDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>{t('platform:pages.settings.emailNotifications')}</Label>
                                        <p className="text-sm text-slate-600">{t('platform:pages.settings.emailNotificationDesc')}</p>
                                    </div>
                                    <Switch
                                        checked={settings.notifications_enabled}
                                        onCheckedChange={(v) => setSettings({...settings, notifications_enabled: v})}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                </Tabs>
            </div>
        </div>
    );
}