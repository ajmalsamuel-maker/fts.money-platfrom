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
    Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw, Download, Filter, DollarSign, Euro, PoundSterling, Bitcoin
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockBalanceData = [
    { date: '2024-01-01', balance: 1250000 }, { date: '2024-01-05', balance: 1320000 }, { date: '2024-01-10', balance: 1180000 },
    { date: '2024-01-15', balance: 1450000 }, { date: '2024-01-20', balance: 1380000 }, { date: '2024-01-25', balance: 1520000 },
    { date: '2024-01-30', balance: 1680000 },
];

const currencyIcons = { USD: DollarSign, EUR: Euro, GBP: PoundSterling, BTC: Bitcoin };

export default function Balances() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list('-created_date'),
    });

    const balances = [
        { currency: 'USD', available: 1680450.32, pending: 245000.00, reserved: 50000.00, icon: DollarSign, color: 'text-emerald-600' },
        { currency: 'EUR', available: 856230.18, pending: 125000.00, reserved: 25000.00, icon: Euro, color: 'text-blue-600' },
        { currency: 'GBP', available: 423150.75, pending: 75000.00, reserved: 15000.00, icon: PoundSterling, color: 'text-purple-600' },
        { currency: 'USDT', available: 520000.00, pending: 45000.00, reserved: 10000.00, icon: Bitcoin, color: 'text-teal-600' },
        { currency: 'USDC', available: 380000.00, pending: 32000.00, reserved: 8000.00, icon: Bitcoin, color: 'text-blue-500' },
    ];

    const recentTransactions = [
        { id: 'TXN001', type: 'credit', amount: 25000, currency: 'USD', description: 'Settlement - Batch #1234', date: new Date(), status: 'completed' },
        { id: 'TXN002', type: 'debit', amount: 15000, currency: 'USD', description: 'Payout - Merchant ABC', date: new Date(Date.now() - 3600000), status: 'completed' },
        { id: 'TXN003', type: 'credit', amount: 8500, currency: 'EUR', description: 'Settlement - Batch #1235', date: new Date(Date.now() - 7200000), status: 'pending' },
        { id: 'TXN004', type: 'debit', amount: 5000, currency: 'GBP', description: 'Fee Deduction', date: new Date(Date.now() - 10800000), status: 'completed' },
        { id: 'TXN005', type: 'credit', amount: 12000, currency: 'USDT', description: 'Crypto Settlement', date: new Date(Date.now() - 14400000), status: 'completed' },
    ];

    const totalBalance = balances.reduce((sum, b) => sum + b.available, 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Balances" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold">Account Balances</h1><p className="text-slate-500">Multi-currency balance management</p></div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
                            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <p className="text-sm opacity-80">Total Available</p>
                            <p className="text-3xl font-bold">${(totalBalance / 1000000).toFixed(2)}M</p>
                            <div className="flex items-center gap-1 mt-2 text-sm"><TrendingUp className="h-4 w-4" />+12.5% from last month</div>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Pending Settlement</p>
                            <p className="text-2xl font-bold text-amber-600">${(balances.reduce((s, b) => s + b.pending, 0) / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-400 mt-1">Across all currencies</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Reserved</p>
                            <p className="text-2xl font-bold text-slate-600">${(balances.reduce((s, b) => s + b.reserved, 0) / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-400 mt-1">Chargeback reserve</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Active Currencies</p>
                            <p className="text-2xl font-bold">{balances.length}</p>
                            <p className="text-xs text-slate-400 mt-1">Fiat + Crypto</p>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Balance Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader><CardTitle>Balance Trend (USD)</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={mockBalanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'MMM d')} stroke="#94a3b8" fontSize={12} />
                                        <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" fontSize={12} />
                                        <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Balance']} />
                                        <Area type="monotone" dataKey="balance" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Currency Breakdown */}
                        <Card>
                            <CardHeader><CardTitle>By Currency</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {balances.map((bal) => {
                                    const Icon = bal.icon;
                                    return (
                                        <div key={bal.currency} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-8 h-8 rounded-full bg-white flex items-center justify-center", bal.color)}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{bal.currency}</p>
                                                    <p className="text-xs text-slate-500">Available</p>
                                                </div>
                                            </div>
                                            <p className="font-bold">{bal.currency === 'USD' || bal.currency === 'USDT' || bal.currency === 'USDC' ? '$' : bal.currency === 'EUR' ? '€' : '£'}{bal.available.toLocaleString()}</p>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transactions */}
                    <Card className="mt-6">
                        <CardHeader><CardTitle>Recent Balance Movements</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {recentTransactions.map((txn) => (
                                        <TableRow key={txn.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", txn.type === 'credit' ? "bg-emerald-100" : "bg-red-100")}>
                                                        {txn.type === 'credit' ? <ArrowDownRight className="h-4 w-4 text-emerald-600" /> : <ArrowUpRight className="h-4 w-4 text-red-600" />}
                                                    </div>
                                                    <span className="font-mono text-sm">{txn.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{txn.description}</TableCell>
                                            <TableCell className={cn("font-semibold", txn.type === 'credit' ? "text-emerald-600" : "text-red-600")}>
                                                {txn.type === 'credit' ? '+' : '-'}{txn.currency === 'USD' || txn.currency === 'USDT' ? '$' : txn.currency === 'EUR' ? '€' : '£'}{txn.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell><Badge className={txn.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{txn.status}</Badge></TableCell>
                                            <TableCell className="text-slate-500">{format(txn.date, 'MMM d, HH:mm')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}