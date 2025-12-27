import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Wallet, Activity } from 'lucide-react';

export default function CryptoAnalytics() {
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
            <CryptoGatewaySidebar currentPage="CryptoAnalytics" userEmail={session.user.email} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <FintechNewsTicker />
                
                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
                        <p className="text-slate-600 mb-8">Performance metrics and insights</p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$4.2M</div>
                                    <p className="text-xs text-slate-500">+12.5% from last month</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <Users className="h-4 w-4 text-cyan-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">847</div>
                                    <p className="text-xs text-slate-500">+5.1% from last month</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                                    <Activity className="h-4 w-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12,453</div>
                                    <p className="text-xs text-slate-500">+8.2% from last month</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Wallets</CardTitle>
                                    <Wallet className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1,234</div>
                                    <p className="text-xs text-slate-500">+3.2% from last month</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Analytics Dashboard Coming Soon</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">Detailed analytics and reporting features will be available here.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}