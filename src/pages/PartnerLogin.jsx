import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function PartnerLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const partners = await base44.entities.PartnerMerchant.filter({
                contact_email: email
            });

            if (partners.length > 0 && password) {
                localStorage.setItem('partner_session', JSON.stringify(partners[0]));
                toast.success('Login successful!');
                navigate(createPageUrl('PartnerDashboard'));
            } else {
                toast.error('Invalid email or password');
            }
        } catch (err) {
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle>Partner Portal</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Label>Email</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Password</Label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Button type="button" variant="link" className="w-full" onClick={() => navigate(createPageUrl('PartnerRegister'))}>
                            Become a Partner
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}