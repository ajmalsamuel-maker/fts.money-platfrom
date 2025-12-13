import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Building2, Users, Globe, ArrowRight } from 'lucide-react';

export default function CommunityPortalLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Store community portal session
            localStorage.setItem('community_portal_session', JSON.stringify({
                email,
                logged_in_at: new Date().toISOString(),
                user_type: 'community_user'
            }));

            navigate(createPageUrl('CommunityPortalDashboard'));
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => {
        window.open('https://fts.money/contact/', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-6xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-white">FTS.Money</h1>
                            <p className="text-blue-200">Community Portal</p>
                        </div>
                    </div>
                    <p className="text-slate-300 text-lg">Your Gateway to Payment Infrastructure</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Login Card */}
                    <Card className="bg-white/95 backdrop-blur border-slate-200">
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Password</Label>
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
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <p className="text-center text-sm text-slate-600">
                                    Forgot password? <a href="#" className="text-blue-600 hover:underline">Reset here</a>
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* New Customer Signup */}
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-900">New Customer?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-700">Join the FTS.Money ecosystem and access:</p>
                            
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Launch Your PSP</p>
                                        <p className="text-sm text-slate-600">Self-service provisioning in minutes</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Globe className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Service Marketplace</p>
                                        <p className="text-sm text-slate-600">150+ payment services & integrations</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Provider Network</p>
                                        <p className="text-sm text-slate-600">Connect with payment providers globally</p>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleSignup}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            >
                                Sign Up Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <p className="text-xs text-center text-slate-600">
                                Your request will be processed by our team within 24 hours
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <p className="text-center text-slate-400 text-sm mt-6">
                    © 2025 FTS.Money - Payment Infrastructure for the Modern World
                </p>
            </div>
        </div>
    );
}