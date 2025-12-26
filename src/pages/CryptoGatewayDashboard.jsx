import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8">
                    <h1 className="text-3xl font-bold mb-2">Crypto Gateway Dashboard</h1>
                    <p className="text-blue-100">Welcome back, {session.user.email}</p>
                </div>

                {/* Stats Grid */}
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Total Volume (24h)
                                </CardTitle>
                                <Wallet className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    ${stats.totalVolume.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                    <ArrowUpRight className="h-3 w-3" />
                                    <span>+12.5%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-cyan-200 bg-gradient-to-br from-white to-cyan-50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Transactions
                                </CardTitle>
                                <Activity className="h-4 w-4 text-cyan-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {stats.totalTransactions.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                    <ArrowUpRight className="h-3 w-3" />
                                    <span>+8.2%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Active Wallets
                                </CardTitle>
                                <Users className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {stats.activeWallets}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                    <ArrowUpRight className="h-3 w-3" />
                                    <span>+5.1%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Avg Transaction
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    ${stats.avgTransactionValue}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                    <ArrowDownRight className="h-3 w-3" />
                                    <span>-2.3%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
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

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
                            <CardContent className="pt-6 text-center">
                                <Wallet className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <h3 className="font-semibold mb-1">Wallet Management</h3>
                                <p className="text-sm text-slate-500">Create and manage crypto wallets</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-cyan-200">
                            <CardContent className="pt-6 text-center">
                                <Users className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
                                <h3 className="font-semibold mb-1">User KYC</h3>
                                <p className="text-sm text-slate-500">Manage customer verification</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200">
                            <CardContent className="pt-6 text-center">
                                <Activity className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                                <h3 className="font-semibold mb-1">Transaction Monitor</h3>
                                <p className="text-sm text-slate-500">Real-time transaction tracking</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}