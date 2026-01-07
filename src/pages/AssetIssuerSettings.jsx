import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { Building2, Mail, Shield, Key, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetIssuerSettings() {
    const { issuer, loading } = useAssetIssuerAuth();
    const queryClient = useQueryClient();

    const [companyName, setCompanyName] = useState(issuer?.company_name || '');
    const [email, setEmail] = useState(issuer?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const issuers = await base44.entities.AssetIssuer.filter({ id: issuer.issuer_id });
            if (issuers.length === 0) throw new Error('Issuer not found');
            return base44.entities.AssetIssuer.update(issuers[0].id, data);
        },
        onSuccess: () => {
            toast.success('Settings updated successfully');
            const sessionData = JSON.parse(localStorage.getItem('asset_issuer_session'));
            sessionData.company_name = companyName;
            sessionData.email = email;
            localStorage.setItem('asset_issuer_session', JSON.stringify(sessionData));
            queryClient.invalidateQueries(['asset-issuer']);
        }
    });

    const handleSaveProfile = () => {
        updateMutation.mutate({
            company_name: companyName,
            email: email
        });
    };

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        updateMutation.mutate({
            password_hash: newPassword
        });
        setNewPassword('');
        setConfirmPassword('');
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerSettings"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6 max-w-4xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                        <p className="text-slate-600">Manage your account settings</p>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Company Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Company Name</Label>
                                    <Input 
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Provider Code</Label>
                                    <Input value={issuer?.provider_code} disabled />
                                </div>
                                <div>
                                    <Label>Issuer Code</Label>
                                    <Input value={issuer?.issuer_code} disabled />
                                </div>
                                <Button onClick={handleSaveProfile} disabled={updateMutation.isPending}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>New Password</Label>
                                    <Input 
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <Label>Confirm Password</Label>
                                    <Input 
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <Button 
                                    onClick={handleChangePassword} 
                                    disabled={updateMutation.isPending || !newPassword}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Update Password
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Account Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Status:</span>
                                        <span className="text-sm font-medium text-green-600">Active</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">KYB Status:</span>
                                        <span className="text-sm font-medium">Approved</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}