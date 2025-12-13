import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Settings, Users, Shield, Bell } from 'lucide-react';

export default function FTSSettings() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        platform_name: 'FTS.Money',
        support_email: 'support@fts.money',
        auto_provisioning: true,
        require_approval: false,
        notifications_enabled: true
    });

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