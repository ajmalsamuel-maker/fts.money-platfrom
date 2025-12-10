import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

export default function MerchantLogin() {
    const [merchantCode, setMerchantCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const sessionData = JSON.parse(localStorage.getItem('merchantSession') || '{}');
                if (sessionData.email && sessionData.merchant_code) {
                    // Validate session using email and merchant_code
                    const response = await base44.functions.invoke('merchantAuth', {
                        action: 'validate',
                        email: sessionData.email,
                        merchant_code: sessionData.merchant_code
                    });
                    if (response.data.success) {
                        navigate(createPageUrl('MerchantDashboard'));
                    } else {
                        localStorage.removeItem('merchantSession');
                    }
                }
            } catch (err) {
                localStorage.removeItem('merchantSession');
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await base44.functions.invoke('merchantAuth', {
                action: 'login',
                merchant_code: merchantCode,
                email,
                password
            });

            if (response.data.success) {
                // Store session in localStorage
                localStorage.setItem('merchantSession', JSON.stringify(response.data.session));
                
                // Check if password change is required
                if (response.data.must_change_password) {
                    navigate(createPageUrl('MerchantChangePassword'));
                } else {
                    navigate(createPageUrl('MerchantDashboard'));
                }
            } else {
                setError(response.data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Merchant Portal</CardTitle>
                    <CardDescription>
                        Sign in to access your merchant dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="merchantCode">Merchant Code</Label>
                            <Input
                                id="merchantCode"
                                type="text"
                                placeholder="Enter merchant code"
                                value={merchantCode}
                                onChange={(e) => setMerchantCode(e.target.value.toUpperCase())}
                                required
                                disabled={loading}
                                className="font-mono"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="merchant@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <Link 
                            to={createPageUrl('MerchantCodeRecovery')} 
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Forgot Merchant Code?
                        </Link>
                        <p className="text-sm text-slate-500">Need help? Contact your PSP administrator</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}