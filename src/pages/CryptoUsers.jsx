import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function CryptoUsers() {
    const [session] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    if (!session) return null;

    const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', kycStatus: 'verified', wallets: 3 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', kycStatus: 'pending', wallets: 1 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', kycStatus: 'verified', wallets: 5 }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoUsers" userEmail={session.user.email} />
            
            <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Users & KYC</h1>
                        <p className="text-slate-600 mb-8">Manage customer verification</p>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customer List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{user.name}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'}>
                                                    {user.kycStatus === 'verified' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                                    {user.kycStatus}
                                                </Badge>
                                                <span className="text-sm text-slate-500">{user.wallets} wallets</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
        </div>
    );
}