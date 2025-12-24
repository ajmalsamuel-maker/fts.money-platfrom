import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { FTS_COLORS, FTS_GRADIENTS, FTS_LOGOS } from '@/components/community/FTSBrandColors';

export default function MerchantLogin() {
    const [merchantCode, setMerchantCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const sessionData = JSON.parse(localStorage.getItem('merchantSession') || '{}');
                if (sessionData.email && sessionData.merchant_code) {
                    // Validate session using email and merchant_code
                    const response = await base44.functions.invoke('merchantAuth', {
                        action: 'validate',
                        email: sessionData.email,
                        merchant_code: sessionData.merchant_code
                    });
                    if (response.data.success) {
                        navigate(createPageUrl('MerchantDashboard'));
                    } else {
                        localStorage.removeItem('merchantSession');
                    }
                }
            } catch (err) {
                localStorage.removeItem('merchantSession');
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await base44.functions.invoke('merchantAuth', {
                action: 'login',
                merchant_code: merchantCode,
                email,
                password
            });

            if (response.data.success) {
                // Store session in localStorage
                localStorage.setItem('merchantSession', JSON.stringify(response.data.session));
                
                // Check if password change is required
                if (response.data.must_change_password) {
                    navigate(createPageUrl('MerchantChangePassword'));
                } else {
                    navigate(createPageUrl('MerchantDashboard'));
                }
            } else {
                setError(response.data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
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
                            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Merchant Portal
                            </h1>
                            <p className="text-lg mt-1" style={{ color: FTS_COLORS.aqua }}>
                                Fluid global payments
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-700 text-lg font-medium">Access Your Payment Dashboard</p>
                </div>

                <Card className="bg-white/95 backdrop-blur border-slate-200 shadow-xl">
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                    </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="merchantCode">Merchant Code</Label>
                            <Input
                                id="merchantCode"
                                type="text"
                                placeholder="Enter merchant code"
                                value={merchantCode}
                                onChange={(e) => setMerchantCode(e.target.value.toUpperCase())}
                                required
                                disabled={loading}
                                className="font-mono"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="merchant@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full text-white"
                            style={{ background: FTS_GRADIENTS.dark1 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <Link 
                            to={createPageUrl('MerchantCodeRecovery')} 
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Merchant Code?
                        </Link>
                        <p className="text-sm text-slate-500">Need help? Contact your PSP administrator</p>
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