import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function QSAPortalLogin() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await base44.functions.invoke('qsaAuth', {
                email: credentials.email,
                access_token: credentials.password
            });

            if (response.data?.success) {
                localStorage.setItem('qsa_session', JSON.stringify({
                    ...response.data.qsa_user,
                    loginTime: new Date().toISOString()
                }));
                window.location.href = createPageUrl('QSAPortalDashboard');
            } else {
                setError(response.data?.error || 'Login failed');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Shield className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">QSA Portal Access</CardTitle>
                    <CardDescription>
                        Qualified Security Assessor Portal - Read-Only Access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">QSA Email</label>
                            <Input 
                                type="email"
                                placeholder="qsa@auditfirm.com"
                                value={credentials.email}
                                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Access Token</label>
                            <Input 
                                type="password"
                                placeholder="Enter your access token"
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Your access token was provided by the FTS.Money administrator
                            </p>
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Access Portal'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}