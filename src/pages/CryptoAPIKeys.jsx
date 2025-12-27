import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Plus, Copy } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CryptoAPIKeys() {
    const [session] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    if (!session) return null;

    const mockKeys = [
        { id: 1, name: 'Production API', key: 'pk_live_xxxxxxxxxxxxx', created: '2025-01-15', status: 'active' },
        { id: 2, name: 'Sandbox API', key: 'pk_test_xxxxxxxxxxxxx', created: '2025-01-10', status: 'active' }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoAPIKeys" userEmail={session.user.email} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <FintechNewsTicker />
                
                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">API Keys</h1>
                                <p className="text-slate-600">Manage your integration credentials</p>
                            </div>
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                <Plus className="w-4 h-4 mr-2" />
                                Generate Key
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active API Keys</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockKeys.map((apiKey) => (
                                        <div key={apiKey.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                    <Key className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{apiKey.name}</div>
                                                    <div className="text-sm text-slate-500 font-mono">{apiKey.key}</div>
                                                    <div className="text-xs text-slate-400">Created: {apiKey.created}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default">Active</Badge>
                                                <Button variant="ghost" size="sm">
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}