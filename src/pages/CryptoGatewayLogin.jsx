import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, ArrowRight, Shield, Zap } from 'lucide-react';
import { FTS_COLORS, FTS_LOGOS } from '@/components/community/FTSBrandColors';

function CryptoGatewayLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('crypto_gateway_session');
        if (session) {
            navigate(createPageUrl('CryptoGatewayDashboard'));
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/cryptoGatewayAuth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('crypto_gateway_session', JSON.stringify({
                    user: data.user,
                    customer_id: data.customer_id,
                    timestamp: Date.now()
                }));
                navigate(createPageUrl('CryptoGatewayDashboard'));
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
                <div className="text-white space-y-8">
                    <div>
                        <img src={FTS_LOGOS.primary} alt="FTS.Money" className="h-12 mb-6" />
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                            Crypto Gateway
                        </h1>
                        <p className="text-xl text-slate-300">
                            Enterprise crypto banking infrastructure for exchanges & DeFi platforms
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <Wallet className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold mb-1">Multi-Chain Wallets</h3>
                                <p className="text-sm text-slate-400">BTC, ETH, USDC, Lightning Network</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold mb-1">EU Compliant</h3>
                                <p className="text-sm text-slate-400">VASP, MiCA, AML/KYC ready</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold mb-1">Instant Settlements</h3>
                                <p className="text-sm text-slate-400">Lightning fast crypto-to-fiat</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Sign In</CardTitle>
                        <CardDescription className="text-slate-400">
                            Access your Crypto Gateway dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@exchange.com"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>

                            <div className="text-center text-sm text-slate-400">
                                <a href="#" className="hover:text-white transition-colors">Forgot password?</a>
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <p className="text-sm text-slate-400 text-center">
                                Don't have an account?{' '}
                                <a href="mailto:crypto@fts.money" className="text-cyan-400 hover:text-cyan-300">
                                    Contact Sales
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default CryptoGatewayLogin;