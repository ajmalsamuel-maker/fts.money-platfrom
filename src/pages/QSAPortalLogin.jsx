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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Wave decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="url(#gradient)" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: '#3b82f6'}} />
                            <stop offset="100%" style={{stopColor: '#06b6d4'}} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/865871aa1_FTSMoney-primary-logo-RGB.jpg"
                            alt="FTS.Money"
                            className="h-16 object-contain"
                        />
                    </div>
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