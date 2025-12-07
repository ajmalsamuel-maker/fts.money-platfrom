import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    CreditCard, LogOut, User, Settings, DollarSign, 
    Repeat, Activity, TrendingUp, Brain, 
    ArrowDownRight, Calendar, Filter, Eye, Download, RefreshCw
} from 'lucide-react';
import { cn } from "@/lib/utils";
import MerchantSubscriptions from '@/components/merchant/MerchantSubscriptions';
import MerchantBillingConfig from '@/components/merchant/MerchantBillingConfig';
import MerchantTransactions from '@/components/merchant/MerchantTransactions';
import MerchantSettlements from '@/components/merchant/MerchantSettlements';
import MerchantAnalytics from '@/components/merchant/MerchantAnalytics';

export default function MerchantSelfServicePortal() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    const { data: merchant } = useQuery({
        queryKey: ['merchant-profile', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const merchants = await base44.entities.Merchant.filter({ contact_email: user.email });
            return merchants[0] || null;
        },
        enabled: !!user?.email
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['merchant-transactions', merchant?.merchant_id],
        queryFn: () => base44.entities.Transaction.filter({ merchant_id: merchant.merchant_id }),
        enabled: !!merchant?.merchant_id
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['merchant-subscriptions', merchant?.merchant_id],
        queryFn: () => base44.entities.RecurringPayment.filter({ merchant_id: merchant.merchant_id }),
        enabled: !!merchant?.merchant_id
    });

    const { data: aiDecisions = [] } = useQuery({
        queryKey: ['merchant-ai-decisions', merchant?.merchant_id],
        queryFn: () => base44.entities.AIPaymentDecision.list('-created_date', 50),
        enabled: !!merchant?.merchant_id
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !merchant) return null;

    // Calculate stats
    const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const successfulTxns = transactions.filter(t => t.status === 'approved' || t.status === 'settled');
    const successRate = transactions.length > 0 ? (successfulTxns.length / transactions.length * 100) : 0;
    const pendingSettlement = transactions
        .filter(t => t.status === 'approved' && !t.settlement_date)
        .reduce((sum, t) => sum + (t.net_amount || t.amount || 0), 0);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, sub) => {
        const monthlyAmount = sub.frequency === 'monthly' ? sub.amount :
                             sub.frequency === 'yearly' ? sub.amount / 12 :
                             sub.frequency === 'quarterly' ? sub.amount / 3 : sub.amount;
        return sum + monthlyAmount;
    }, 0);

    const merchantAIDecisions = aiDecisions.filter(d => 
        transactions.some(t => t.transaction_id === d.transaction_id)
    );
    const aiSuccessRate = merchantAIDecisions.length > 0 
        ? (merchantAIDecisions.filter(d => d.outcome === 'successful').length / merchantAIDecisions.length * 100) 
        : 0;

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
                            <h1 className="text-xl font-bold text-slate-900">{merchant.business_name}</h1>
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
                            <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
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

            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="settlements">Settlements</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="billing">Billing Config</TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Total Volume</p>
                                            <p className="text-2xl font-bold text-slate-900">${totalVolume.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 mt-1">All time</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Transactions</p>
                                            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
                                            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
                                                <TrendingUp className="h-4 w-4" />
                                                {successRate.toFixed(1)}% success
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                            <Activity className="h-6 w-6 text-emerald-600" />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Active Subscriptions</p>
                                            <p className="text-2xl font-bold text-slate-900">{activeSubscriptions}</p>
                                            <p className="text-xs text-purple-600 mt-1">MRR: ${mrr.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                            <Repeat className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Pending Settlement</p>
                                            <p className="text-2xl font-bold text-amber-600">${pendingSettlement.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 mt-1">Awaiting payout</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <ArrowDownRight className="h-6 w-6 text-amber-600" />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* AI Performance */}
                            {merchantAIDecisions.length > 0 && (
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="h-5 w-5 text-indigo-600" />
                                            AI-Powered Payment Processing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-slate-500">AI Decisions Made</p>
                                                <p className="text-2xl font-bold text-slate-900">{merchantAIDecisions.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500">Success Rate</p>
                                                <p className="text-2xl font-bold text-emerald-600">{aiSuccessRate.toFixed(1)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500">Avg Confidence</p>
                                                <p className="text-2xl font-bold text-indigo-600">
                                                    {(merchantAIDecisions.reduce((sum, d) => sum + d.confidence_score, 0) / merchantAIDecisions.length * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent Activity */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Recent Transactions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {transactions.slice(0, 5).map((txn) => (
                                                <div key={txn.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                                    <div>
                                                        <p className="font-medium text-sm">{txn.customer_email || 'N/A'}</p>
                                                        <p className="text-xs text-slate-500">{txn.transaction_id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">${txn.amount}</p>
                                                        <Badge className={cn("text-xs",
                                                            txn.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                            txn.status === 'declined' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        )}>
                                                            {txn.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Active Subscriptions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {subscriptions.filter(s => s.status === 'active').slice(0, 5).map((sub) => (
                                                <div key={sub.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                                    <div>
                                                        <p className="font-medium text-sm">{sub.customer_name}</p>
                                                        <p className="text-xs text-slate-500 capitalize">{sub.frequency} · {sub.plan_type}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">${sub.amount}</p>
                                                        <p className="text-xs text-slate-500">{sub.cycles_completed} cycles</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="subscriptions">
                            <MerchantSubscriptions merchant={merchant} subscriptions={subscriptions} />
                        </TabsContent>

                        <TabsContent value="transactions">
                            <MerchantTransactions merchant={merchant} transactions={transactions} aiDecisions={aiDecisions} />
                        </TabsContent>

                        <TabsContent value="settlements">
                            <MerchantSettlements merchant={merchant} transactions={transactions} />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <MerchantAnalytics 
                                merchant={merchant} 
                                transactions={transactions} 
                                subscriptions={subscriptions}
                                aiDecisions={merchantAIDecisions}
                            />
                        </TabsContent>

                        <TabsContent value="billing">
                            <MerchantBillingConfig merchant={merchant} subscriptions={subscriptions} />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}