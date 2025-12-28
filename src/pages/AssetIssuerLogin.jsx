import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AssetIssuerLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ 
        provider_code: '', 
        issuer_code: '', 
        password: '' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await base44.functions.invoke('assetIssuerAuth', credentials);
            
            localStorage.setItem('asset_issuer_session', JSON.stringify(data));
            navigate(createPageUrl('AssetIssuerDashboard'));
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Asset Issuer Portal</CardTitle>
                    <p className="text-sm text-slate-600 mt-2">Tokenize your real-world assets</p>
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
                            <Label>Issuer Code</Label>
                            <Input
                                placeholder="acme-corp"
                                value={credentials.issuer_code}
                                onChange={(e) => setCredentials({...credentials, issuer_code: e.target.value})}
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