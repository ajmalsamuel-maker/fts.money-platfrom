import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CryptoCompliance() {
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
            <CryptoGatewaySidebar currentPage="CryptoCompliance" userEmail={session.user.email} />
            
            <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance</h1>
                        <p className="text-slate-600 mb-8">Regulatory compliance status</p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        VASP License
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className="bg-green-600">Active</Badge>
                                    <p className="text-sm text-slate-500 mt-2">EU Virtual Asset Service Provider</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        MiCA Ready
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className="bg-green-600">Compliant</Badge>
                                    <p className="text-sm text-slate-500 mt-2">Markets in Crypto-Assets Regulation</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        AML/KYC
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className="bg-green-600">Active</Badge>
                                    <p className="text-sm text-slate-500 mt-2">Anti-Money Laundering & Know Your Customer</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Travel Rule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className="bg-green-600">Implemented</Badge>
                                    <p className="text-sm text-slate-500 mt-2">FATF Travel Rule Compliance</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
        </div>
    );
}