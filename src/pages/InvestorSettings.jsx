import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { User, Mail, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function InvestorSettings() {
    const session = localStorage.getItem('rwa_investor_session');
    const investor = session ? JSON.parse(session) : null;

    const [fullName, setFullName] = useState(investor?.full_name || '');
    const [email, setEmail] = useState(investor?.email || '');

    const handleSave = () => {
        const updated = { ...investor, full_name: fullName, email: email };
        localStorage.setItem('rwa_investor_session', JSON.stringify(updated));
        toast.success('Settings updated successfully');
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorSettings"
                investorName={investor?.full_name}
                investorEmail={investor?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6 max-w-4xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                        <p className="text-slate-600">Manage your account preferences</p>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Full Name</Label>
                                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <Button onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Account Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Investor Type:</span>
                                        <span className="text-sm font-medium">{investor?.investor_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Accreditation:</span>
                                        <span className="text-sm font-medium text-green-600">{investor?.accreditation_status}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}