import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from 'lucide-react';

export default function CryptoSettings() {
    const [session] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoSettings" userEmail={session.user.email} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <FintechNewsTicker />
                
                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
                        <p className="text-slate-600 mb-8">Manage your account preferences</p>

                        <Card>
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Company Name</Label>
                                    <Input value={session.user.company_name} readOnly />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input value={session.user.email} readOnly />
                                </div>
                                <div>
                                    <Label>Subscription Tier</Label>
                                    <Input value="Professional" readOnly />
                                </div>
                                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                    Update Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}