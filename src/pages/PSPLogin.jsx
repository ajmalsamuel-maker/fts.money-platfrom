import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { getStaffSession } from '@/components/auth/useStaffAuth';

export default function PSPLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { data: pspSettings } = useQuery({
        queryKey: ['psp-settings'],
        queryFn: async () => {
            const settings = await base44.entities.PSPSettings.list();
            return settings[0];
        },
    });

    const companyName = pspSettings?.company_name || 'PaymentHub';

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
            // Authenticate with base44
            const users = await base44.entities.AppUser.filter({ email });
            
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
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
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
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-2xl font-bold text-slate-900">{companyName}</CardTitle>
                            <CardDescription className="text-base mt-2">PSP Management Portal</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
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