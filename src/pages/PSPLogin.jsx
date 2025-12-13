import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Shield, KeyRound } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function PSPLogin() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [pspCode, setPspCode] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [tempUser, setTempUser] = useState(null);

    useEffect(() => {
        // Clear any existing session on login page load
        localStorage.removeItem('staff_session');
    }, []);

    const handleStep1 = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await base44.functions.invoke('pspAuth', {
                action: 'verifyPSP',
                psp_code: pspCode
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Invalid PSP code');
            }
            setStep(2);
        } catch (err) {
            setError(err.message);
        }
        setIsLoading(false);
    };

    const handleStep2 = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await base44.functions.invoke('pspAuth', {
                action: 'verifyEmail',
                email: email,
                psp_code: pspCode
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Email verification failed');
            }

            setTempUser(response.data.user);
            setStep(3);
        } catch (err) {
            setError(err.message);
        }
        setIsLoading(false);
    };

    const handleStep3 = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await base44.functions.invoke('pspAuth', {
                action: 'login',
                email: email,
                password: password,
                psp_code: pspCode
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Login failed');
            }

            // Check if 2FA is required
            if (response.data.two_factor_enabled) {
                setStep(4);
                setIsLoading(false);
                const method = response.data.two_factor_method || 'email';
                toast.success(`2FA code sent via ${method}`);
                return;
            }

            // Complete login with session data from backend
            localStorage.setItem('staff_session', JSON.stringify(response.data.session));
            window.location.href = '/Dashboard';
        } catch (err) {
            setError(err.message);
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

            // Complete login with session data
            const response = await base44.functions.invoke('pspAuth', {
                action: 'login',
                email: email,
                password: password
            });

            if (response.data.success) {
                localStorage.setItem('staff_session', JSON.stringify(response.data.session));
                window.location.href = '/Dashboard';
            }
        } catch (err) {
            setError(err.message || '2FA verification failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0">
                    <CardHeader className="space-y-4 pb-8">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-2xl font-bold text-slate-900">PaymentHub</CardTitle>
                            <CardDescription className="text-base mt-2">PSP Management Portal</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {step === 1 ? (
                            <form onSubmit={handleStep1} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="text-center mb-4">
                                    <p className="text-sm text-slate-600">Step 1 of 3</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="psp_code">PSP Code</Label>
                                    <Input
                                        id="psp_code"
                                        placeholder="Enter PSP code"
                                        value={pspCode}
                                        onChange={(e) => setPspCode(e.target.value.toUpperCase())}
                                        required
                                        disabled={isLoading}
                                        className="font-mono font-bold text-center text-xl"
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </Button>
                            </form>
                        ) : step === 2 ? (
                            <form onSubmit={handleStep2} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="text-center mb-4">
                                    <p className="text-sm text-slate-600">Step 2 of 3</p>
                                </div>

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
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-24"
                                        onClick={() => { setStep(1); setError(''); }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Continue'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : step === 3 ? (
                            <form onSubmit={handleStep3} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="text-center mb-4">
                                    <p className="text-sm text-slate-600">Step 3 of 3</p>
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
                                            autoFocus
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

                                <div className="text-right">
                                    <a href={createPageUrl('PSPPasswordReset')} className="text-sm text-blue-600 hover:underline">
                                        Forgot password?
                                    </a>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-24"
                                        onClick={() => { setStep(2); setError(''); }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6"
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
                                </div>
                            </form>
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
                                        Enter the 6-digit code sent to your {tempUser?.two_factor_method || 'email'}
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
                                        setStep(3);
                                        setOtpCode('');
                                        setError('');
                                    }}
                                >
                                    Back to Password
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