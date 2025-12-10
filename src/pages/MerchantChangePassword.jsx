import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { toast } from 'sonner';

export default function MerchantChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMID, setSelectedMID] = React.useState('');
    const navigate = useNavigate();
    const { user, session, updateSession, logout } = useMerchantAuth();

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
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    useEffect(() => {
        if (!session) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [session, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await base44.functions.invoke('merchantAuth', {
                action: 'change_password',
                user_id: session.user_id,
                new_password: newPassword
            });

            if (response.data.success) {
                updateSession({ must_change_password: false });
                toast.success('Password changed successfully');
                
                // If it was a mandatory password change, redirect to dashboard
                if (session.must_change_password) {
                    navigate(createPageUrl('MerchantDashboard'));
                }
            } else {
                setError(response.data.error || 'Failed to change password');
            }
        } catch (err) {
            setError('Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    // If it's a mandatory password change (first login), show full-screen
    if (session.must_change_password) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <CreditCard className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
                        <CardDescription>
                            You must change your temporary password before continuing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                Password must be at least 8 characters long
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        );
    }

    // Normal password change page with sidebar
    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID} 
                mids={mids} 
                onMIDChange={setSelectedMID} 
                currentPage="MerchantChangePassword" 
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
                                <p className="text-slate-500">Update your account password</p>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Password Settings</CardTitle>
                                <CardDescription>
                                    Choose a strong password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            placeholder="Enter current password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-slate-500">
                                            Must be at least 8 characters long
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => navigate(-1)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="bg-blue-600 hover:bg-blue-700"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update Password'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}