import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Shield, KeyRound, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { FTS_COLORS, FTS_GRADIENTS, FTS_LOGOS } from '@/components/community/FTSBrandColors';

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
            const { data } = await base44.functions.invoke('pspAuth', {
                action: 'verifyPSP',
                psp_code: pspCode.trim()
            });

            if (!data.success) {
                throw new Error(data.error || 'Invalid PSP code');
            }
            setStep(2);
        } catch (err) {
            setError(err.message || 'Invalid PSP code');
        }
        setIsLoading(false);
    };

    const handleStep2 = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data } = await base44.functions.invoke('pspAuth', {
                action: 'verifyEmail',
                email: email,
                psp_code: pspCode
            });

            if (!data.success) {
                throw new Error(data.error || 'Email verification failed');
            }

            setTempUser(data.user);
            setStep(3);
        } catch (err) {
            setError(err.message || 'Email verification failed');
        }
        setIsLoading(false);
    };

    const handleStep3 = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data } = await base44.functions.invoke('pspAuth', {
                action: 'login',
                email: email,
                password: password,
                psp_code: pspCode
            });

            if (!data.success) {
                throw new Error(data.error || 'Login failed');
            }

            // Check if 2FA is required
            if (data.two_factor_enabled) {
                setStep(4);
                setIsLoading(false);
                const method = data.two_factor_method || 'email';
                toast.success(`2FA code sent via ${method}`);
                return;
            }

            // Complete login with session data from backend
            console.log('Login successful, storing session with PSP code:', data.session.psp_code);
            console.log('Session data:', data.session);

            // CRITICAL: Clear ALL storage before setting new session
            localStorage.clear();
            sessionStorage.clear();

            // Set new session with PSP code
            const sessionToStore = {
                email: data.session.email,
                full_name: data.session.full_name,
                role: data.session.role,
                user_id: data.session.user_id,
                psp_code: pspCode, // Use the PSP code from state, not from response
                schema: data.session.schema,
                timestamp: data.session.timestamp,
                expires: data.session.expires
            };

            console.log('Storing session:', sessionToStore);
            localStorage.setItem('staff_session', JSON.stringify(sessionToStore));

            // Verify storage
            const storedSession = JSON.parse(localStorage.getItem('staff_session'));
            console.log('Verified stored session:', storedSession);

            // Force hard reload to clear any cached state
            window.location.href = '/Dashboard';
        } catch (err) {
            setError(err.message || 'Login failed');
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
            const { data } = await base44.functions.invoke('pspAuth', {
                action: 'login',
                email: email,
                password: password,
                psp_code: pspCode
            });

            if (data.success) {
                localStorage.setItem('staff_session', JSON.stringify(data.session));
                window.location.href = '/Dashboard';
            }
        } catch (err) {
            setError(err.message || '2FA verification failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
            {/* FTS.Money Wave Background - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3">
                <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="url(#wave-gradient)" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <defs>
                        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#0066CC', stopOpacity: 0.8 }} />
                            <stop offset="50%" style={{ stopColor: '#00BFFF', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: '#87CEEB', stopOpacity: 0.7 }} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex flex-col items-center gap-4 mb-4">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Shield className="h-16 w-16 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                PSP Portal
                            </h1>
                            <p className="text-lg mt-1 text-blue-600">
                                Fluid global payments
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-700 text-lg font-medium">Management Portal Access</p>
                </div>

                <Card className="bg-white/95 backdrop-blur border-slate-200 shadow-xl">
                    <CardHeader>
                        <CardTitle>
                            {step === 1 ? 'Enter PSP Code' : step === 2 ? 'Enter Email' : step === 3 ? 'Enter Password' : 'Two-Factor Authentication'}
                        </CardTitle>
                        {step < 4 && (
                            <CardDescription>Step {step} of 3</CardDescription>
                        )}
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
                                    className="w-full text-white"
                                    style={{ background: FTS_GRADIENTS.dark1 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
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
                                        className="flex-1 text-white"
                                        style={{ background: FTS_GRADIENTS.dark1 }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
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
                                        className="flex-1 text-white"
                                        style={{ background: FTS_GRADIENTS.dark1 }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="ml-2 h-4 w-4" />
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
                                    className="w-full text-white"
                                    style={{ background: FTS_GRADIENTS.dark1 }}
                                    disabled={isLoading || otpCode.length !== 6}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Verify Code
                                            <ArrowRight className="ml-2 h-4 w-4" />
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

                <p className="text-center text-slate-600 text-sm mt-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    © 2025 FTS.Money - Fluid global payments
                </p>
            </div>
        </div>
    );
}