import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { Shield, Lock } from 'lucide-react';
import { PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';

export default function PlatformAdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(PLATFORM_ROLES.PLATFORM_ADMIN);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        try {
            const response = await base44.functions.invoke('platformAuth', {
                action: 'login',
                email,
                password
            });

            if (response.data.success) {
                localStorage.setItem('platform_admin_session', JSON.stringify(response.data.user));
                navigate(createPageUrl('FTSMoneyPlatform'));
            } else {
                setError(response.data.error || 'Login failed');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img 
                        src={FTS_LOGOS.symbol} 
                        alt="FTS.Money" 
                        className="h-16 w-16 mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        FTS.Money Platform
                    </h1>
                    <p className="text-blue-200">Control Plane Administration</p>
                </div>

                <Card className="border-2 border-blue-400/20 bg-white/95 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Platform Admin Login
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@fts.money"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>



                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Sign In to Control Plane
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}