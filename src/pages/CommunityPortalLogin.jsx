import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Building2, Users, Globe, ArrowRight } from 'lucide-react';
import { FTS_COLORS, FTS_GRADIENTS, FTS_LOGOS } from '@/components/community/FTSBrandColors';

export default function CommunityPortalLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Store community portal session
            localStorage.setItem('community_portal_session', JSON.stringify({
                email,
                logged_in_at: new Date().toISOString(),
                user_type: 'community_user'
            }));

            navigate(createPageUrl('CommunityPortalDashboard'));
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => {
        window.open('https://fts.money/contact/', '_blank');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#0a0e27' }}>
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(45, 108, 223, 0.4), transparent)' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(0, 191, 255, 0.3), transparent)' }}></div>
                <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(135, 206, 235, 0.2), transparent)' }}></div>
            </div>
            
            <div className="w-full max-w-6xl relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex flex-col items-center gap-4 mb-4">
                        <img 
                            src={FTS_LOGOS.symbol} 
                            alt="FTS.Money" 
                            className="h-20 w-20 object-contain"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                FTS.Money Community
                            </h1>
                            <p className="text-lg mt-1" style={{ color: FTS_COLORS.aqua }}>
                                Fluid global payments
                            </p>
                        </div>
                    </div>
                    <p className="text-white/80 text-lg">Your Gateway to Payment Infrastructure</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Login Card */}
                    <Card className="bg-white/95 backdrop-blur border-slate-200">
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                    {loading ? 'Signing in...' : 'Sign In'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <p className="text-center text-sm text-slate-600">
                                    Forgot password? <a href="#" className="text-blue-600 hover:underline">Reset here</a>
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* New Customer Signup */}
                    <Card className="border-2" style={{ background: FTS_GRADIENTS.light2, borderColor: FTS_COLORS.sky }}>
                        <CardHeader>
                            <CardTitle style={{ color: FTS_COLORS.navy }}>New Customer?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-700">Join the FTS.Money ecosystem and access:</p>
                            
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: FTS_COLORS.royalBlue }}>
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Launch Your PSP</p>
                                        <p className="text-sm text-slate-600">Self-service provisioning in minutes</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: FTS_COLORS.navy }}>
                                        <Globe className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Service Marketplace</p>
                                        <p className="text-sm text-slate-600">150+ payment services & integrations</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: FTS_GRADIENTS.dark1 }}>
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Provider Network</p>
                                        <p className="text-sm text-slate-600">Connect with payment providers globally</p>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleSignup}
                                className="w-full text-white hover:opacity-90"
                                style={{ background: FTS_GRADIENTS.dark1 }}
                            >
                                Sign Up Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <p className="text-xs text-center text-slate-600">
                                Your request will be processed by our team within 24 hours
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <p className="text-center text-white/60 text-sm mt-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    © 2025 FTS.Money - Fluid global payments
                </p>
            </div>
        </div>
    );
}