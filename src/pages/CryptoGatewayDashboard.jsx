import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FTS_COLORS } from '@/components/community/FTSBrandColors';
import { 
    Wallet, TrendingUp, Users, Activity, Bitcoin, 
    ArrowUpRight, ArrowDownRight, Zap 
} from 'lucide-react';

export default function CryptoGatewayDashboard() {
    const [session, setSession] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    if (!session) return null;

    // Mock data - replace with real API calls
    const stats = {
        totalVolume: 4250000,
        totalTransactions: 12453,
        activeWallets: 847,
        avgTransactionValue: 341.23
    };

    const recentActivity = [
        { id: 1, type: 'deposit', asset: 'BTC', amount: 0.5, usd: 21500, time: '2 min ago' },
        { id: 2, type: 'withdrawal', asset: 'ETH', amount: 12.4, usd: 29800, time: '5 min ago' },
        { id: 3, type: 'exchange', asset: 'USDC', amount: 50000, usd: 50000, time: '12 min ago' },
        { id: 4, type: 'deposit', asset: 'BTC', amount: 1.2, usd: 51600, time: '18 min ago' }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoGatewayDashboard" userEmail={session.user.email} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <FintechNewsTicker />
                
                <div className="flex-1 overflow-auto">
                    <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Crypto Gateway Dashboard
                                </h1>
                                <p className="text-slate-600 mt-1">Welcome back, {session.user.company_name || session.user.email}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8">

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Total Volume (24h)</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    ${stats.totalVolume.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    <span>+12.5%</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <Wallet className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Transactions</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    {stats.totalTransactions.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    <span>+8.2%</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                                                <Activity className="h-6 w-6 text-cyan-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Active Wallets</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    {stats.activeWallets}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    <span>+5.1%</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Avg Transaction</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    ${stats.avgTransactionValue}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                                    <ArrowDownRight className="h-3 w-3" />
                                                    <span>-2.3%</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-amber-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        activity.type === 'deposit' ? 'bg-green-100' :
                                                        activity.type === 'withdrawal' ? 'bg-red-100' :
                                                        'bg-blue-100'
                                                    }`}>
                                                        {activity.type === 'deposit' ? <ArrowDownRight className="w-5 h-5 text-green-600" /> :
                                                         activity.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-600" /> :
                                                         <Zap className="w-5 h-5 text-blue-600" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold capitalize">{activity.type}</div>
                                                        <div className="text-sm text-slate-500">{activity.time}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">
                                                        {activity.amount} {activity.asset}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        ${activity.usd.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-3 gap-6">
                                <Card className="bg-white border-slate-200 cursor-pointer hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                            <Wallet className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold mb-1">Wallet Management</h3>
                                        <p className="text-sm text-slate-500">Create and manage crypto wallets</p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-white border-slate-200 cursor-pointer hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-6 h-6 text-cyan-600" />
                                        </div>
                                        <h3 className="font-semibold mb-1">User KYC</h3>
                                        <p className="text-sm text-slate-500">Manage customer verification</p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-white border-slate-200 cursor-pointer hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                                            <Activity className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold mb-1">Transaction Monitor</h3>
                                        <p className="text-sm text-slate-500">Real-time transaction tracking</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}