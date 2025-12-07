import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function MerchantUserProvisioning() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const handleProvision = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Check if merchant exists with this email
            const merchant = merchants.find(m => m.contact_email === email);
            if (!merchant) {
                setMessage({
                    type: 'error',
                    text: `No merchant found with email: ${email}`
                });
                setLoading(false);
                return;
            }

            // Create user in built-in User entity
            await base44.entities.User.create({
                email: email,
                full_name: fullName || merchant.contact_name,
                role: 'merchant'
            });

            setMessage({
                type: 'success',
                text: `Merchant user created successfully! They can now login at /MerchantLogin`
            });
            setEmail('');
            setFullName('');
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to create merchant user'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="MerchantUserProvisioning" />
            
            <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarCollapsed ? '0' : '0' }}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-slate-900">Merchant User Provisioning</h1>
                            <p className="text-slate-500 mt-1">Create login credentials for merchants</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Provision Merchant User
                                </CardTitle>
                                <CardDescription>
                                    Create a login account for a merchant. The email must match an existing merchant's contact_email.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProvision} className="space-y-4">
                                    {message && (
                                        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                                            {message.type === 'success' ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4" />
                                            )}
                                            <AlertDescription>{message.text}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Merchant Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="merchant@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <p className="text-sm text-slate-500">
                                            Must match the contact_email of an existing merchant
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="John Doe (optional, will use merchant contact name if empty)"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating User...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Create Merchant User
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
                                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                        <li>Enter the merchant's email (must exist in Merchants page)</li>
                                        <li>Optionally enter their full name</li>
                                        <li>Click "Create Merchant User"</li>
                                        <li>Merchant can then login at /MerchantLogin</li>
                                        <li>They'll need to reset password via email or contact admin</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}