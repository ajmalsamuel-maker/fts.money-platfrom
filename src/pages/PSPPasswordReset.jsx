import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function PSPPasswordReset() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');

    const { data: pspSettings } = useQuery({
        queryKey: ['psp-settings'],
        queryFn: async () => {
            const settings = await base44.entities.PSPSettings.list();
            return settings[0];
        },
    });

    const { data: themeSettings } = useQuery({
        queryKey: ['theme-settings'],
        queryFn: async () => {
            const settings = await base44.entities.ThemeSettings.list();
            return settings[0];
        },
    });

    const companyName = pspSettings?.company_name || 'PaymentHub';
    const logoUrl = themeSettings?.logo_url;

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Find user by email
            const users = await base44.entities.AppUser.filter({ email });
            
            if (users.length === 0) {
                throw new Error('No account found with this email address');
            }

            const user = users[0];

            // Generate temporary password
            const tempPassword = 'Reset' + Math.random().toString(36).slice(-8) + '!';

            // Update user with temporary password
            await base44.entities.AppUser.update(user.id, {
                password_hash: tempPassword,
                must_change_password: true
            });

            // Send password reset email
            await base44.integrations.Core.SendEmail({
                to: email,
                subject: `Password Reset - ${companyName}`,
                body: `
Hello ${user.full_name},

Your password has been reset. Your temporary password is:

${tempPassword}

Please login and change your password immediately.

Login URL: ${window.location.origin}${createPageUrl('PSPLogin')}

This is an automated email. Please do not reply.

Best regards,
${companyName} Security Team
                `
            });

            setEmailSent(true);
            toast.success('Password reset email sent');
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0">
                    <CardHeader className="space-y-4 pb-8">
                        <div className="flex justify-center">
                            {logoUrl ? (
                                <img src={logoUrl} alt={companyName} className="h-16 w-16 object-contain rounded-2xl" />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                    <KeyRound className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-2xl font-bold text-slate-900">Reset Password</CardTitle>
                            <CardDescription className="text-base mt-2">{companyName} - PSP Portal</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!emailSent ? (
                            <form onSubmit={handleReset} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-slate-500">
                                        We'll send a temporary password to this email address
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Reset Email
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full gap-2"
                                    onClick={() => window.location.href = createPageUrl('PSPLogin')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Login
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Check Your Email</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        We've sent a temporary password to <strong>{email}</strong>
                                    </p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                    <p className="text-xs text-blue-800">
                                        <strong>Next steps:</strong><br/>
                                        1. Check your email inbox<br/>
                                        2. Use the temporary password to login<br/>
                                        3. Change your password immediately after logging in
                                    </p>
                                </div>
                                <Button
                                    className="w-full gap-2"
                                    onClick={() => window.location.href = createPageUrl('PSPLogin')}
                                >
                                    <LogIn className="h-4 w-4" />
                                    Return to Login
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}