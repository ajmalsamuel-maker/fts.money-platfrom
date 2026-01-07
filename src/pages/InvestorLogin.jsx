import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import ComplianceFooter from '@/components/compliance/ComplianceFooter';
import { Shield, Mail, Lock } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function InvestorLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // For demo: auto-login
            const mockInvestor = {
                investor_id: 'inv_123',
                full_name: 'Demo Investor',
                email: email,
                investor_type: 'individual',
                accreditation_status: 'verified'
            };

            localStorage.setItem('rwa_investor_session', JSON.stringify(mockInvestor));
            window.location.href = createPageUrl('InvestorMarketplace');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="py-4 px-6 flex justify-end">
                <LanguageSwitcher variant="select" />
            </div>

            <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="space-y-4 text-center pb-8">
                        <img src={FTS_LOGOS.primary} alt="RWA Platform" className="h-12 mx-auto" />
                        <CardTitle className="text-2xl">Investor Portal</CardTitle>
                        <p className="text-slate-600 text-sm">Access tokenized real-world assets</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label>Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="investor@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>

                            <div className="text-center">
                                <a href={createPageUrl('InvestorOnboarding')} className="text-sm text-blue-600 hover:underline">
                                    New investor? Register here
                                </a>
                            </div>
                        </form>
                    </CardContent>
                </Card>
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

            <ComplianceFooter />
        </div>
    );
}