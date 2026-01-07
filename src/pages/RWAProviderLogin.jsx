import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { MinimalComplianceFooter } from '@/components/compliance/ComplianceFooter';

export default function RWAProviderLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ provider_code: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await base44.functions.invoke('rwaProviderAuth', credentials);
            
            localStorage.setItem('rwa_provider_session', JSON.stringify(data));
            navigate(createPageUrl('RWAProviderDashboard'));
        } catch (err) {
            setError('Invalid provider code or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-white">
            {/* Language Switcher - Below News Ticker */}
            <div className="absolute top-12 right-6 z-20">
                <LanguageSwitcher variant="select" showLabel={false} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
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

                <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur border-slate-200 shadow-xl">
                    <CardHeader className="text-center">
                        <img src={FTS_LOGOS.primary} alt="FTS.Money" className="h-10 mx-auto mb-4" />
                        <CardTitle className="text-2xl">RWA Provider Portal</CardTitle>
                        <p className="text-sm text-slate-600 mt-2">Licensed tokenization platform</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label>Provider Code</Label>
                                <Input
                                    placeholder="goldvault"
                                    value={credentials.provider_code}
                                    onChange={(e) => setCredentials({...credentials, provider_code: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    required
                                />
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <MinimalComplianceFooter />
        </div>
    );
}