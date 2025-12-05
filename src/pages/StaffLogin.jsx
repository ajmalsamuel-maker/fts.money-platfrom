import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function StaffLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if already logged in
    useEffect(() => {
        const session = localStorage.getItem('staff_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.expires > Date.now()) {
                    navigate(createPageUrl('Dashboard'));
                } else {
                    localStorage.removeItem('staff_session');
                }
            } catch {
                localStorage.removeItem('staff_session');
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Find user by email
            const users = await base44.entities.AppUser.filter({ email: email.toLowerCase().trim() });
            
            if (!users || users.length === 0) {
                setError('Invalid email or password');
                setIsLoading(false);
                return;
            }

            const user = users[0];

            // Check if user is active
            if (user.status !== 'active') {
                setError('Your account is not active. Please contact an administrator.');
                setIsLoading(false);
                return;
            }

            // Validate password
            if (user.password_hash !== password) {
                setError('Invalid email or password');
                setIsLoading(false);
                return;
            }

            // Create session
            const session = {
                user_id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                department: user.department,
                expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
            };

            localStorage.setItem('staff_session', JSON.stringify(session));

            // Update last login
            await base44.entities.AppUser.update(user.id, {
                last_login: new Date().toISOString()
            });

            // Redirect to dashboard
            navigate(createPageUrl('Dashboard'));

        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                        <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">PaymentHub</h1>
                    <p className="text-slate-400 mt-1">Staff Portal</p>
                </div>

                {/* Login Card */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">Sign In</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter your credentials to access the portal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Contact your administrator if you need access
                </p>
            </div>
        </div>
    );
}