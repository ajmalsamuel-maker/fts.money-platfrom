import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FTS_COLORS, FTS_GRADIENTS, FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { Shield, Lock } from 'lucide-react';
import { PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';

export default function PlatformAdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(PLATFORM_ROLES.PLATFORM_ADMIN);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        try {
            const response = await base44.functions.invoke('platformAuth', {
                action: 'login',
                email,
                password
            });

            if (response.data.success) {
                localStorage.setItem('platform_admin_session', JSON.stringify(response.data.user));
                navigate(createPageUrl('FTSMoneyPlatform'));
            } else {
                setError(response.data.error || 'Login failed');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
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
                        <img 
                            src={FTS_LOGOS.symbol} 
                            alt="FTS.Money" 
                            className="h-32 w-32 object-contain"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                FTS.Money Platform
                            </h1>
                            <p className="text-lg mt-1" style={{ color: FTS_COLORS.aqua }}>
                                Fluid global payments
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-700 text-lg font-medium">Control Panel Administration</p>
                </div>

                <Card className="bg-white/95 backdrop-blur border-slate-200 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Platform Admin Login
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@fts.money"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>



                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full text-white"
                                style={{ background: FTS_GRADIENTS.dark1 }}
                            >
                                Sign In to Control Panel
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>

                            <p className="text-center text-sm text-slate-600 mt-4">
                                Need an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate(createPageUrl('PlatformAdminRegister'))}
                                    className="text-blue-600 hover:underline"
                                >
                                    Register here
                                </button>
                            </p>
                        </form>
                        </CardContent>
                        </Card>

                        <p className="text-center text-slate-600 text-sm mt-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        © 2025 FTS.Money - Fluid global payments
                        </p>
                        </div>
                        </div>
                        );
                        }