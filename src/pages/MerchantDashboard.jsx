import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
    DollarSign,
    Activity,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function MerchantDashboard() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [selectedMID, setSelectedMID] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    // Fetch merchant data
    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    // Fetch merchant MIDs
    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id,
        onSuccess: (data) => {
            if (data && data.length > 0 && !selectedMID) {
                setSelectedMID(data[0].mid);
            }
        }
    });

    // Set first MID as selected if not set
    useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    // Fetch transactions for selected MID
    const { data: transactions = [], refetch: refetchTransactions } = useQuery({
        queryKey: ['transactions', user?.merchant_id, selectedMID],
        queryFn: async () => {
            const query = { merchant_id: user.merchant_id };
            if (selectedMID) {
                query.terminal_id = selectedMID;
            }
            return await base44.entities.Transaction.filter(query);
        },
        enabled: !!user?.merchant_id && !!selectedMID
    });

    // Calculate stats by time period
    const statsData = React.useMemo(() => {
        if (!transactions.length) return {
            summary: { 
                today: { amount: 0, count: 0 }, 
                last7Days: { amount: 0, count: 0 }, 
                thisMonth: { amount: 0, count: 0 }, 
                lastMonth: { amount: 0, count: 0 }
            },
            authData: [],
            payoutData: [],
            saleData: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const todayTxns = transactions.filter(t => new Date(t.created_date) >= today);
        const last7DaysTxns = transactions.filter(t => new Date(t.created_date) >= last7Days);
        const thisMonthTxns = transactions.filter(t => new Date(t.created_date) >= thisMonthStart);
        const lastMonthTxns = transactions.filter(t => new Date(t.created_date) >= lastMonthStart && new Date(t.created_date) <= lastMonthEnd);

        // Chart data for last 7 days
        const authData = [];
        const payoutData = [];
        const saleData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
            
            const dayTxns = transactions.filter(t => {
                const txnDate = new Date(t.created_date);
                return txnDate >= dayStart && txnDate <= dayEnd;
            });

            authData.push({
                date: dateStr,
                amount: dayTxns.reduce((sum, t) => sum + (t.amount || 0), 0) / 1000,
                count: dayTxns.length
            });

            const settledTxns = dayTxns.filter(t => t.status === 'settled');
            payoutData.push({
                date: dateStr,
                amount: settledTxns.reduce((sum, t) => sum + ((t.net_amount || t.amount) || 0), 0) / 1000,
                count: settledTxns.length
            });

            const salesTxns = dayTxns.filter(t => t.type === 'sale');
            saleData.push({
                date: dateStr,
                amount: salesTxns.reduce((sum, t) => sum + (t.amount || 0), 0) / 1000,
                count: salesTxns.length
            });
        }

        return {
            summary: {
                today: { amount: todayTxns.reduce((s, t) => s + (t.amount || 0), 0), count: todayTxns.length },
                last7Days: { amount: last7DaysTxns.reduce((s, t) => s + (t.amount || 0), 0), count: last7DaysTxns.length },
                thisMonth: { amount: thisMonthTxns.reduce((s, t) => s + (t.amount || 0), 0), count: thisMonthTxns.length },
                lastMonth: { amount: lastMonthTxns.reduce((s, t) => s + (t.amount || 0), 0), count: lastMonthTxns.length }
            },
            authData,
            payoutData,
            saleData
        };
    }, [transactions]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantDashboard"
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Today's Volume</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${statsData.summary.today.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                    <p className="text-xs text-slate-500 mt-1">{statsData.summary.today.count} transactions</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Total Transactions</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{transactions.length}</div>
                                    <p className="text-xs text-slate-500 mt-1">All time</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Success Rate</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {transactions.length > 0 ? ((transactions.filter(t => t.status === 'approved').length / transactions.length) * 100).toFixed(1) : 0}%
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Monthly Volume</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">${statsData.summary.thisMonth.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                    <p className="text-xs text-slate-500 mt-1">{statsData.summary.thisMonth.count} transactions</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Account Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Account Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Sum-Today', data: statsData.summary.today },
                                        { label: 'Sum-ThisWeek', data: statsData.summary.last7Days },
                                        { label: 'This Month', data: statsData.summary.thisMonth },
                                        { label: 'Last Month', data: statsData.summary.lastMonth }
                                    ].map((period, idx) => (
                                        <div key={idx} className="border-r last:border-r-0 pr-4 last:pr-0">
                                            <div className="text-xs text-slate-500 mb-2">{period.label}</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Sale Count:</span>
                                                    <span className="font-medium">{period.data.count}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Sales:</span>
                                                    <span className="font-medium">${(period.data.amount / 1000).toFixed(2)}K</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Refund:</span>
                                                    <span className="font-medium">0</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Sale/Capture Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Sale/Capture Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={statsData.saleData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="amount" fill="#3b82f6" name="Amount (K)" />
                                            <Bar dataKey="count" fill="#06b6d4" name="Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                            <span>Amount</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                                            <span># of Transactions</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Auth Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Auth Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={statsData.authData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Amount (K)" />
                                            <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} name="Count" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                            <span>Amount</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                                            <span># of Transactions</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payout Summary */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-sm">Payout Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={statsData.payoutData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="amount" fill="#10b981" name="Amount (K)" />
                                            <Bar dataKey="count" fill="#06b6d4" name="Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                                            <span>Amount</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                                            <span># of Transactions</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>


                    </div>
                </main>
            </div>
        </div>
    );
}