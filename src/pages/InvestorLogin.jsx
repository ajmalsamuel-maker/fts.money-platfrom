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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher variant="compact" />
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
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

            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <ComplianceFooter />
        </div>
    );
}