import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Building2, Users, Globe, ArrowRight } from 'lucide-react';
import { FTS_COLORS, FTS_GRADIENTS, FTS_LOGOS } from '@/components/community/FTSBrandColors';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

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

        if (!email || !password) {
            setError('Please enter email and password');
            setLoading(false);
            return;
        }

        try {
            const response = await base44.functions.invoke('communityAuth', {
                action: 'login',
                email,
                password
            });

            if (response.data.success) {
                localStorage.setItem('community_portal_session', JSON.stringify(response.data.user));
                navigate(createPageUrl('CommunityPortalDashboard'));
            } else {
                setError(response.data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => {
        window.open('https://fts.money/contact/', '_blank');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
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
                
                <div className="w-full max-w-6xl relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex flex-col items-center gap-4 mb-4">
                            <img 
                                src={FTS_LOGOS.symbol} 
                                alt="FTS.Money" 
                                className="h-32 w-32 object-contain"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    FTS.Money Community
                                </h1>
                                <p className="text-lg mt-1" style={{ color: FTS_COLORS.aqua }}>
                                    Fluid global payments
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-700 text-lg font-medium">Your Gateway to Global Payment Infrastructure</p>
                    </div>

                    <div className="max-w-md mx-auto">
                        {/* Login Card */}
                        <Card className="bg-white/95 backdrop-blur border-slate-200 shadow-xl">
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
                                    
                                    <div className="flex justify-center mb-4">
                                        <LanguageSwitcher variant="select" showLabel={false} />
                                    </div>
                                    
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
                    </div>
                </div>
            </div>

            {/* Footer at Bottom */}
            <footer className="relative z-20 bg-slate-900 text-white py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2" style={{ background: FTS_GRADIENTS.fluid, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Enterprise-Grade Fluid Payment Infrastructure
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Secure • Compliant • Borderless • Instant
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                            <span>© {new Date().getFullYear()} FTS.Money</span>
                            <span>•</span>
                            <span>PCI DSS Level 1</span>
                            <span>•</span>
                            <span>LEI/vLEI Certified</span>
                            <span>•</span>
                            <span>ISO 20022 Compliant</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}