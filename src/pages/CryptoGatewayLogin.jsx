import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FTS_COLORS, FTS_GRADIENTS, FTS_LOGOS } from '@/components/community/FTSBrandColors';
import StrigaDisclaimer from '@/components/crypto/StrigaDisclaimer';
import { Wallet, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function CryptoGatewayLogin() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await base44.functions.invoke('cryptoGatewayAuth', credentials);
            const data = response.data;

            if (data.success) {
                localStorage.setItem('crypto_gateway_session', JSON.stringify({
                    user: data.user,
                    customer_id: data.customer_id,
                    timestamp: Date.now()
                }));
                window.location.href = '/CryptoGatewayDashboard';
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
            {/* Language Switcher - Top Right */}
            <div className="absolute top-16 right-6 z-20">
                <LanguageSwitcher variant="select" showLabel={false} />
            </div>
            
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
                <div className="text-center mb-6">
                    <div className="inline-flex flex-col items-center gap-1 mb-3">
                        <img 
                            src={FTS_LOGOS.symbol} 
                            alt="FTS.Money" 
                            className="h-32 w-32 object-contain"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                FTS.Money Crypto Banking
                            </h1>
                            <p className="text-lg mt-1" style={{ color: FTS_COLORS.aqua }}>
                                Fluid global payments
                            </p>
                        </div>
                        </div>
                        <p className="text-slate-700 text-lg font-medium">Enterprise Crypto Banking Infrastructure</p>
                </div>

                <Card className="bg-white/95 backdrop-blur border-slate-200 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            Banking Portal Login
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                    placeholder="you@exchange.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full text-white"
                                style={{ background: FTS_GRADIENTS.dark1 }}
                                disabled={loading}
                                >
                                {loading ? 'Signing in...' : 'Access Banking Portal'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                            <p className="text-center text-sm text-slate-600">
                                Forgot password? <a href="#" className="text-blue-600 hover:underline">Reset here</a>
                            </p>
                        </form>
                    </CardContent>
                    </Card>

                    <StrigaDisclaimer />
                    </div>
                    </div>
                    );
                    }