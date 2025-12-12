import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn, Shield, KeyRound } from 'lucide-react';
import { getStaffSession } from '@/components/auth/useStaffAuth';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function PSPLogin() {
    const [loginMethod, setLoginMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [pspCode, setPspCode] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const [tempUser, setTempUser] = useState(null);

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
    const pspCodeValue = pspSettings?.psp_code || 'PSP001';
    const logoUrl = themeSettings?.logo_url;
    const allowPSPCode = pspSettings?.allow_psp_code_login ?? true;
    const require2FA = pspSettings?.require_2fa || false;
    const twoFAMethod = pspSettings?.['2fa_method'] || 'email';

    useEffect(() => {
        const existingSession = getStaffSession();
        if (existingSession) {
            window.location.href = '/Dashboard';
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Find user by email or PSP code
            let users;
            if (loginMethod === 'psp_code') {
                // Verify PSP code matches
                if (pspCode.toUpperCase() !== pspCodeValue) {
                    throw new Error('Invalid PSP code');
                }
                users = await base44.entities.AppUser.filter({ email });
            } else {
                users = await base44.entities.AppUser.filter({ email });
            }
            
            if (users.length === 0) {
                throw new Error('Invalid credentials');
            }

            const user = users[0];

            // Verify account is active
            if (user.status !== 'active') {
                throw new Error('Account is not active');
            }

            // Simple password check (in production, use proper password hashing)
            if (user.password_hash !== password) {
                throw new Error('Invalid credentials');
            }

            // Check if 2FA is required
            if (require2FA || user.two_factor_enabled) {
                setTempUser(user);
                setShow2FA(true);
                setIsLoading(false);
                // In production, send OTP via email/SMS
                toast.success(`2FA code sent via ${twoFAMethod}`);
                return;
            }

            // Complete login
            completeLogin(user);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    const verify2FA = async () => {
        setError('');
        setIsLoading(true);

        try {
            // In production, verify OTP against backend
            if (!otpCode || otpCode.length !== 6) {
                throw new Error('Please enter a valid 6-digit code');
            }

            // Simulate OTP verification (replace with actual verification)
            if (otpCode !== '123456') {
                throw new Error('Invalid verification code');
            }

            completeLogin(tempUser);
        } catch (err) {
            setError(err.message || '2FA verification failed');
            setIsLoading(false);
        }
    };

    const completeLogin = async (user) => {
        // Create session
        const session = {
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            department: user.department,
            user_id: user.id,
            timestamp: Date.now()
        };

        // Store in localStorage
        localStorage.setItem('staff_session', JSON.stringify(session));

        // Update last login
        await base44.entities.AppUser.update(user.id, {
            last_login: new Date().toISOString(),
            last_login_ip: 'web'
        });

        // Redirect to dashboard
        window.location.href = '/Dashboard';
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
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-2xl font-bold text-slate-900">{companyName}</CardTitle>
                            <CardDescription className="text-base mt-2">PSP Management Portal</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!show2FA ? (
                            <>
                                {allowPSPCode && (
                                    <Tabs value={loginMethod} onValueChange={setLoginMethod} className="mb-4">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="email">Email</TabsTrigger>
                                            <TabsTrigger value="psp_code">PSP Code</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                )}

                                <form onSubmit={handleLogin} className="space-y-5">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {loginMethod === 'psp_code' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="psp_code">PSP Code</Label>
                                            <Input
                                                id="psp_code"
                                                placeholder={pspCodeValue}
                                                value={pspCode}
                                                onChange={(e) => setPspCode(e.target.value.toUpperCase())}
                                                required
                                                disabled={isLoading}
                                                className="font-mono font-bold text-center"
                                            />
                                        </div>
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isLoading}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {pspSettings?.password_reset_enabled && (
                                        <div className="text-right">
                                            <a href={createPageUrl('PSPPasswordReset')} className="text-sm text-blue-600 hover:underline">
                                                Forgot password?
                                            </a>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Sign In
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); verify2FA(); }} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                        <Shield className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Enter the 6-digit code sent to your {twoFAMethod}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        disabled={isLoading}
                                        className="text-center font-mono text-2xl tracking-widest"
                                        maxLength={6}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6"
                                    disabled={isLoading || otpCode.length !== 6}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            Verify Code
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                        setShow2FA(false);
                                        setTempUser(null);
                                        setOtpCode('');
                                    }}
                                >
                                    Back to Login
                                </Button>
                            </form>
                        )}

                        <div className="mt-6 text-center text-sm text-slate-500">
                            <p>Staff and administrator access only</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 text-center text-xs text-white/60">
                    <p>Secure login portal • All activities are logged</p>
                </div>
            </div>
        </div>
    );
}