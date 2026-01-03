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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <img src={FTS_LOGOS.primary} alt="FTS.Money" className="h-10 mx-auto mb-4" />
                    <CardTitle className="text-2xl">RWA Provider Portal</CardTitle>
                    <p className="text-sm text-slate-600 mt-2">Licensed tokenization platform</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <LanguageSwitcher variant="select" showLabel={false} />
                        </div>
                        
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
    );
}