import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    CreditCard, 
    LogOut, 
    User, 
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    TrendingUp
} from 'lucide-react';

export default function MerchantDashboard() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalVolume: 0,
        totalTransactions: 0,
        successRate: 0,
        pendingSettlement: 0,
        merchantName: ''
    });

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        if (user) {
            loadMerchantStats();
        }
    }, [user]);

    const loadMerchantStats = async () => {
        try {
            // Find merchant by contact email
            const merchants = await base44.entities.Merchant.filter({ contact_email: user.email });
            if (!merchants || merchants.length === 0) {
                console.error('Merchant not found');
                return;
            }
            
            const merchant = merchants[0];
            
            // Get transactions for this merchant
            const transactions = await base44.entities.Transaction.filter({ merchant_id: merchant.merchant_id });
            
            // Calculate stats
            const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const successfulTxns = transactions.filter(t => t.status === 'approved' || t.status === 'settled');
            const successRate = transactions.length > 0 ? (successfulTxns.length / transactions.length * 100) : 0;
            const pendingSettlement = transactions
                .filter(t => t.status === 'approved' && !t.settlement_date)
                .reduce((sum, t) => sum + (t.net_amount || t.amount || 0), 0);

            setStats({
                totalVolume,
                totalTransactions: transactions.length,
                successRate,
                pendingSettlement,
                merchantName: merchant.business_name
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{stats.merchantName || 'Merchant Portal'}</h1>
                            <p className="text-sm text-slate-500">Merchant Portal</p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                                    {user.full_name?.charAt(0) || 'M'}
                                </div>
                                <span className="hidden sm:inline">{user.full_name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-2">
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <Badge className="mt-1 text-xs">{user.role}</Badge>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-red-600">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                        <p className="text-slate-500">Welcome back, {user.full_name}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Total Volume
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    ${stats.totalVolume.toLocaleString()}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">All time</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Transactions
                                </CardTitle>
                                <Activity className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {stats.totalTransactions.toLocaleString()}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Total count</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Success Rate
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {stats.successRate.toFixed(1)}%
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Approval rate</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    Pending Settlement
                                </CardTitle>
                                <ArrowDownRight className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">
                                    ${stats.pendingSettlement.toLocaleString()}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Awaiting payout</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <Button variant="outline" className="justify-start h-auto py-3">
                                    <div className="text-left">
                                        <div className="font-medium">View Transactions</div>
                                        <div className="text-sm text-slate-500">Browse payment history</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="justify-start h-auto py-3">
                                    <div className="text-left">
                                        <div className="font-medium">Generate Report</div>
                                        <div className="text-sm text-slate-500">Export financial data</div>
                                    </div>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-auto py-3"
                                    onClick={() => navigate(createPageUrl('MerchantAPIDocumentation'))}
                                >
                                    <div className="text-left">
                                        <div className="font-medium">API Documentation</div>
                                        <div className="text-sm text-slate-500">Integration guides</div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}