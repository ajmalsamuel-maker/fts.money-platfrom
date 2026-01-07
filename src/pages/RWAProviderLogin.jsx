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
import ComplianceFooter from '@/components/compliance/ComplianceFooter';

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
        <div className="min-h-screen bg-white flex flex-col">
            {/* Language Switcher - Top Right */}
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher variant="select" showLabel={false} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <Card className="w-full max-w-md relative z-10">
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

                {/* Background Wave */}
                <svg 
                    className="absolute bottom-0 left-0 w-full" 
                    style={{ height: '40vh' }}
                    viewBox="0 0 1440 320" 
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#0ea5e9" />
                        </linearGradient>
                    </defs>
                    <path 
                        fill="url(#waveGradient)" 
                        fillOpacity="0.15"
                        d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,197.3C672,203,768,181,864,154.7C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    />
                </svg>
            </div>

            <ComplianceFooter />
        </div>
    );
}