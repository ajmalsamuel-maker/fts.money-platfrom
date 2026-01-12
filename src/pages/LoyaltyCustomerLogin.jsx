import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Mail, Lock } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LoyaltyCustomerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const customers = await base44.entities.LoyaltyCustomer.filter({
                admin_email: email,
                password_hash: password
            });

            if (customers.length > 0) {
                const customer = customers[0];
                localStorage.setItem('loyalty_customer_session', JSON.stringify({
                    id: customer.id,
                    customer_code: customer.customer_code,
                    organization_name: customer.organization_name,
                    admin_email: customer.admin_email,
                    subscription_tier: customer.subscription_tier,
                    organization_type: customer.organization_type
                }));
                window.location.href = '/LoyaltyCustomerPortal';
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('Login failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher variant="select" showLabel={false} />
            </div>
            
            <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">FTS Loyalty Platform</CardTitle>
                    <p className="text-sm text-slate-600 mt-2">Customer Portal Login</p>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@organization.org"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        <p>Need help? Contact <a href="mailto:support@fts.money" className="text-purple-600 hover:underline">support@fts.money</a></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}