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
import { Shield, UserPlus } from 'lucide-react';
import { PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';

export default function PlatformAdminRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: PLATFORM_ROLES.PLATFORM_ADMIN
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            const response = await base44.functions.invoke('platformAuth', {
                action: 'register',
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                role: formData.role
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate(createPageUrl('PlatformAdminLogin'));
                }, 2000);
            } else {
                setError(response.data.error || 'Registration failed');
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
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
                    <p className="text-blue-200">Register Platform Administrator</p>
                </div>

                <Card className="border-2 border-blue-400/20 bg-white/95 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                            Create Admin Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <Alert className="bg-emerald-50 border-emerald-200">
                                <AlertDescription className="text-emerald-800">
                                    Account created successfully! Redirecting to login...
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <Label>Full Name</Label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="admin@fts.money"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Confirm Password</Label>
                                    <Input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        placeholder="Re-enter password"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Platform Role</Label>
                                    <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(PLATFORM_ROLES).map((roleValue) => (
                                                <SelectItem key={roleValue} value={roleValue}>
                                                    {getRoleLabel(roleValue)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create Account
                                </Button>

                                <p className="text-center text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate(createPageUrl('PlatformAdminLogin'))}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}