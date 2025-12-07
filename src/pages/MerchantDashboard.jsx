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
    const { session, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalVolume: 0,
        totalTransactions: 0,
        successRate: 0,
        pendingSettlement: 0
    });

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        if (session?.merchant_id) {
            loadMerchantStats();
        }
    }, [session]);

    const loadMerchantStats = async () => {
        try {
            const { data: result } = await base44.functions.invoke('dbCore', {
                action: 'query',
                sql: `
                    SELECT 
                        COUNT(*) as total_transactions,
                        COALESCE(SUM(amount), 0) as total_volume,
                        COALESCE(AVG(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) * 100, 0) as success_rate,
                        COALESCE(SUM(CASE WHEN status = 'approved' AND settlement_date IS NULL THEN amount ELSE 0 END), 0) as pending_settlement
                    FROM transactions
                    WHERE merchant_id = $1
                `,
                params: [session.merchant_id]
            });

            if (result.rows && result.rows.length > 0) {
                const row = result.rows[0];
                setStats({
                    totalVolume: parseFloat(row.total_volume) || 0,
                    totalTransactions: parseInt(row.total_transactions) || 0,
                    successRate: parseFloat(row.success_rate) || 0,
                    pendingSettlement: parseFloat(row.pending_settlement) || 0
                });
            }
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

    if (!session) return null;

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
                            <h1 className="text-xl font-bold text-slate-900">{session.merchant_name}</h1>
                            <p className="text-sm text-slate-500">Merchant Portal</p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                                    {session.full_name?.charAt(0) || 'M'}
                                </div>
                                <span className="hidden sm:inline">{session.full_name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-2">
                                <p className="font-medium">{session.full_name}</p>
                                <p className="text-sm text-slate-500">{session.email}</p>
                                <Badge className="mt-1 text-xs">{session.role}</Badge>
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
                        <p className="text-slate-500">Welcome back, {session.full_name}</p>
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
                                <Button variant="outline" className="justify-start h-auto py-3">
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