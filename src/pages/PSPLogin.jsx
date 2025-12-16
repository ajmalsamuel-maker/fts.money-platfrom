import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PSPLogin() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [pspCode, setPspCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
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

            localStorage.clear();
            sessionStorage.clear();

            const sessionToStore = {
                email: data.session.email,
                full_name: data.session.full_name,
                role: data.session.role,
                user_id: data.session.user_id,
                psp_code: pspCode,
                schema: data.session.schema,
                timestamp: data.session.timestamp,
                expires: data.session.expires
            };

            localStorage.setItem('staff_session', JSON.stringify(sessionToStore));
            window.location.href = '/Dashboard';
        } catch (err) {
            setError(err.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">PSP Portal</h1>
                    <p className="text-slate-600">Management Portal Access</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {step === 1 ? 'Enter PSP Code' : step === 2 ? 'Enter Email' : 'Enter Password'}
                        </CardTitle>
                        <CardDescription>Step {step} of 3</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 1 ? (
                            <form onSubmit={handleStep1} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

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
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Continue'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        ) : step === 2 ? (
                            <form onSubmit={handleStep2} className="space-y-4">
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
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setStep(1); setError(''); }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Verifying...' : 'Continue'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleStep3} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

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
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setStep(2); setError(''); }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}