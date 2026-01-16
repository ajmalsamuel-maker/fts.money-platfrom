import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createPageUrl } from '@/utils';
import { Building2, Lock, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuditLogger from '@/components/audit/AuditLogger';

export default function BusinessEInvoiceLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await base44.functions.invoke('businessEInvoiceAuth', {
                action: 'login',
                email,
                password
            });

            if (response.data.success) {
                localStorage.setItem('business_einvoice_session', JSON.stringify(response.data.business));
                
                // Audit log successful login
                await AuditLogger.log({
                    event_type: 'user_login',
                    category: 'authentication',
                    severity: 'info',
                    user_email: email,
                    user_role: 'business_admin',
                    action: 'login',
                    description: `Business e-invoice user ${email} logged in`,
                    status: 'success',
                    retention_period: '3_years'
                });
                
                window.location.href = createPageUrl('BusinessEInvoicePortal');
            } else {
                // Audit log failed login
                await AuditLogger.log({
                    event_type: 'user_login_failed',
                    category: 'authentication',
                    severity: 'warning',
                    user_email: email,
                    action: 'login',
                    description: `Failed business e-invoice login attempt for ${email}`,
                    status: 'failure',
                    error_message: response.data.error,
                    retention_period: '3_years'
                });
                
                setError(response.data.error || 'Login failed');
            }
        } catch (err) {
            // Audit log failed login
            await AuditLogger.log({
                event_type: 'user_login_failed',
                category: 'authentication',
                severity: 'warning',
                user_email: email,
                action: 'login',
                description: `Failed business e-invoice login attempt for ${email}`,
                status: 'failure',
                error_message: err.message,
                retention_period: '3_years'
            });
            
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Business E-Invoice Portal</CardTitle>
                    <p className="text-sm text-slate-600 mt-2">Login to manage your e-invoices</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="business@company.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>

                        <div className="text-center space-y-2">
                            <Button
                                type="button"
                                variant="link"
                                className="text-sm"
                                onClick={() => window.location.href = createPageUrl('BusinessEInvoiceRegister')}
                            >
                                Don't have an account? Register
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}