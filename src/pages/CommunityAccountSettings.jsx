import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    User, Mail, Phone, Building2, MapPin, Lock, CheckCircle2, Bell, Globe
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

export default function CommunityAccountSettings() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        country: ''
    });
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [notifications, setNotifications] = useState({
        email_marketing: true,
        email_updates: true,
        email_billing: true,
        sms_alerts: false
    });
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        const parsed = JSON.parse(sessionData);
        setSession(parsed);
        setProfileData(prev => ({ ...prev, email: parsed.email }));
    }, [navigate]);

    const handleSaveProfile = () => {
        // Save profile changes
        const updatedSession = { ...session, ...profileData };
        localStorage.setItem('community_portal_session', JSON.stringify(updatedSession));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleChangePassword = () => {
        if (passwordData.new !== passwordData.confirm) {
            alert('New passwords do not match');
            return;
        }
        setSaveSuccess(true);
        setTimeout(() => {
            setSaveSuccess(false);
            setPasswordData({ current: '', new: '', confirm: '' });
        }, 3000);
    };

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="CommunityAccountSettings" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Account Settings</h2>
                        <p className="text-xs text-slate-600">Manage your profile and preferences</p>
                    </div>
                </header>

                <div className="p-6 max-w-4xl">
                    {saveSuccess && (
                        <Alert className="mb-6 bg-emerald-50 border-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <AlertDescription className="text-emerald-700">
                                Settings saved successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={profileData.full_name}
                                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                                    placeholder="John Doe"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    type="email"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Company</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={profileData.company}
                                                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                                    placeholder="Acme Inc"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label>Country</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={profileData.country}
                                                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                                    placeholder="United States"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button 
                                            onClick={handleSaveProfile}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Change Password
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Current Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="password"
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                placeholder="••••••••"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="password"
                                                value={passwordData.new}
                                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                placeholder="••••••••"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Confirm New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="password"
                                                value={passwordData.confirm}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                placeholder="••••••••"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button 
                                            onClick={handleChangePassword}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Notification Preferences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Marketing Emails</p>
                                            <p className="text-sm text-slate-600">Receive updates about new features and services</p>
                                        </div>
                                        <Switch 
                                            checked={notifications.email_marketing}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, email_marketing: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Product Updates</p>
                                            <p className="text-sm text-slate-600">Get notified about platform updates and improvements</p>
                                        </div>
                                        <Switch 
                                            checked={notifications.email_updates}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, email_updates: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Billing Notifications</p>
                                            <p className="text-sm text-slate-600">Receive invoices and payment confirmations</p>
                                        </div>
                                        <Switch 
                                            checked={notifications.email_billing}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, email_billing: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">SMS Alerts</p>
                                            <p className="text-sm text-slate-600">Critical system alerts via SMS</p>
                                        </div>
                                        <Switch 
                                            checked={notifications.sms_alerts}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, sms_alerts: checked })}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button 
                                            onClick={handleSaveProfile}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                                        >
                                            Save Preferences
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Preferences Tab */}
                        <TabsContent value="preferences">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Regional Preferences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Language</Label>
                                        <Input value="English (US)" disabled />
                                    </div>
                                    <div>
                                        <Label>Timezone</Label>
                                        <Input value="UTC-5 (Eastern Time)" disabled />
                                    </div>
                                    <div>
                                        <Label>Currency</Label>
                                        <Input value="USD ($)" disabled />
                                    </div>
                                    <Alert>
                                        <AlertDescription>
                                            Contact support to change regional preferences
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}