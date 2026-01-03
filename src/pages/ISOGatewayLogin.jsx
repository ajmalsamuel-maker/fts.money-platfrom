import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function ISOGatewayLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('iso_gateway_session');
        if (session) {
            window.location.href = '/ISOGatewayCustomerPortal';
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await base44.functions.invoke('isoGatewayAuth', {
                action: 'login',
                email,
                password
            });

            if (data.success) {
                localStorage.setItem('iso_gateway_session', JSON.stringify({
                    customer_id: data.customer.id,
                    email: data.customer.contact_email,
                    company_name: data.customer.company_name
                }));
                window.location.href = '/ISOGatewayCustomerPortal';
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Login error: ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">ISO Gateway</CardTitle>
                                <p className="text-sm text-slate-600">by FTS.Money</p>
                            </div>
                        </div>
                        <LanguageSwitcher variant="select" showLabel={false} />
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800 font-medium">Login Instructions:</p>
                        <p className="text-xs text-blue-700 mt-1">Use customer email and password set in Control Panel → ISO Gateway → Customers</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}