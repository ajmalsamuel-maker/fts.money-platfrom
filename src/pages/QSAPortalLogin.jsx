import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
            // Simple auth - store QSA session
            if (credentials.email && credentials.password) {
                localStorage.setItem('qsa_session', JSON.stringify({
                    email: credentials.email,
                    loginTime: new Date().toISOString()
                }));
                window.location.href = createPageUrl('QSAPortalDashboard');
            } else {
                setError('Please enter email and password');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
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
                            <label className="text-sm font-medium">Access Code</label>
                            <Input 
                                type="password"
                                placeholder="Enter access code"
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                required
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
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