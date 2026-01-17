import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
    Wallet, TrendingUp, RefreshCw, Download, DollarSign, Euro, ChevronDown, ChevronRight, Building2, Store, Bitcoin, Repeat
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



export default function Balances() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedPSPs, setExpandedPSPs] = useState({});
    const [activeView, setActiveView] = useState('psp');

    const { data: processors = [] } = useQuery({
        queryKey: ['payment-processors'],
        queryFn: () => base44.entities.PaymentProcessor.list(),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['subscriptions-balances'],
        queryFn: () => base44.entities.RecurringPayment.filter({ status: 'active' }),
    });

    const pspBalances = [];

    const togglePSP = (pspId) => {
        setExpandedPSPs(prev => ({ ...prev, [pspId]: !prev[pspId] }));
    };

    const totalAvailable = pspBalances.reduce((s, p) => s + p.total_available, 0);
    const totalPending = pspBalances.reduce((s, p) => s + p.total_pending, 0);
    const totalReserved = pspBalances.reduce((s, p) => s + p.total_reserved, 0);
    const totalFees = pspBalances.reduce((s, p) => s + p.total_fees, 0);

    const mrr = subscriptions.reduce((sum, sub) => {
        const monthlyAmount = sub.frequency === 'monthly' ? sub.amount :
                             sub.frequency === 'yearly' ? sub.amount / 12 :
                             sub.frequency === 'quarterly' ? sub.amount / 3 : sub.amount;
        return sum + monthlyAmount;
    }, 0);
    const arr = mrr * 12;

    const getCurrencySymbol = (currency) => {
        const symbols = { USD: '$', EUR: '€', GBP: '£', USDT: '$', USDC: '$' };
        return symbols[currency] || currency;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Balances" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold">Account Balances</h1><p className="text-slate-500">PSP and merchant-level balance aggregation</p></div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Reconcile</Button>
                            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <p className="text-sm opacity-80">Total Available</p>
                            <p className="text-3xl font-bold">$0</p>
                            <p className="text-xs opacity-70 mt-1">No PSPs connected yet</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Pending Settlement</p>
                            <p className="text-2xl font-bold text-amber-600">$0</p>
                            <p className="text-xs text-slate-400 mt-1">Awaiting clearing</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Reserved</p>
                            <p className="text-2xl font-bold text-slate-600">$0</p>
                            <p className="text-xs text-slate-400 mt-1">Chargeback reserve</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Fees Collected</p>
                            <p className="text-2xl font-bold text-blue-600">$0</p>
                            <p className="text-xs text-slate-400 mt-1">This period</p>
                        </Card>
                    </div>

                    {/* Recurring Revenue Cards */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <p className="text-sm opacity-80">Monthly Recurring Revenue</p>
                            <p className="text-3xl font-bold">${(mrr / 1000).toFixed(1)}K</p>
                            <p className="text-xs opacity-70 mt-1">{subscriptions.length} active subscriptions</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Annual Run Rate (ARR)</p>
                            <p className="text-2xl font-bold text-purple-600">${(arr / 1000).toFixed(1)}K</p>
                            <p className="text-xs text-slate-400 mt-1">MRR × 12</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Revenue at Risk</p>
                            <p className="text-2xl font-bold text-amber-600">
                                ${(subscriptions.filter(s => s.status === 'dunning').reduce((sum, s) => sum + s.amount, 0) / 1000).toFixed(1)}K
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Failed payments in dunning</p>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* Balance Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader><CardTitle>Balance Trend (All PSPs)</CardTitle></CardHeader>
                            <CardContent>
                                <div className="h-56 flex items-center justify-center text-slate-400">
                                    Balance trends available after PSP connections are established
                                </div>
                            </CardContent>
                        </Card>

                        {/* PSP Summary */}
                        <Card>
                            <CardHeader><CardTitle>By PSP</CardTitle></CardHeader>
                            <CardContent>
                                <div className="py-12 text-center text-slate-400">
                                    No PSP connections yet
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PSP & Merchant Breakdown */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>PSP & Merchant Breakdown</CardTitle>
                                <Tabs value={activeView} onValueChange={setActiveView}>
                                    <TabsList><TabsTrigger value="psp">By PSP</TabsTrigger><TabsTrigger value="merchant">By Merchant</TabsTrigger></TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="py-12 text-center text-slate-400">
                                No balance data - connect PSPs and process transactions to see balances
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}