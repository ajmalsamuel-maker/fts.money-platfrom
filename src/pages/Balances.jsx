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
    Wallet, TrendingUp, RefreshCw, Download, DollarSign, Euro, ChevronDown, ChevronRight, Building2, Store, Bitcoin
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockBalanceData = [
    { date: '2024-01-01', balance: 1250000 }, { date: '2024-01-05', balance: 1320000 }, { date: '2024-01-10', balance: 1180000 },
    { date: '2024-01-15', balance: 1450000 }, { date: '2024-01-20', balance: 1380000 }, { date: '2024-01-25', balance: 1520000 },
    { date: '2024-01-30', balance: 1680000 },
];

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

    // Mock PSP-level balances with merchant breakdown
    const pspBalances = [
        {
            psp_id: 'psp_stripe', psp_name: 'Stripe', currency: 'USD',
            total_available: 1250000, total_pending: 180000, total_reserved: 45000, total_fees: 32500,
            merchants: [
                { merchant_id: 'm1', name: 'TechCorp Solutions', available: 450000, pending: 65000, reserved: 15000, fees: 11700, volume: 520000, transactions: 3420 },
                { merchant_id: 'm2', name: 'Global Retail Inc', available: 380000, pending: 55000, reserved: 12000, fees: 9880, volume: 435000, transactions: 2890 },
                { merchant_id: 'm3', name: 'GameZone Entertainment', available: 420000, pending: 60000, reserved: 18000, fees: 10920, volume: 498000, transactions: 4120 },
            ]
        },
        {
            psp_id: 'psp_adyen', psp_name: 'Adyen', currency: 'USD',
            total_available: 890000, total_pending: 120000, total_reserved: 30000, total_fees: 23140,
            merchants: [
                { merchant_id: 'm1', name: 'TechCorp Solutions', available: 280000, pending: 40000, reserved: 10000, fees: 7280, volume: 320000, transactions: 2100 },
                { merchant_id: 'm4', name: 'Fashion Forward', available: 310000, pending: 45000, reserved: 12000, fees: 8060, volume: 355000, transactions: 2340 },
                { merchant_id: 'm5', name: 'Digital Services Ltd', available: 300000, pending: 35000, reserved: 8000, fees: 7800, volume: 335000, transactions: 2200 },
            ]
        },
        {
            psp_id: 'psp_checkout', psp_name: 'Checkout.com', currency: 'EUR',
            total_available: 650000, total_pending: 85000, total_reserved: 22000, total_fees: 16900,
            merchants: [
                { merchant_id: 'm2', name: 'Global Retail Inc', available: 350000, pending: 45000, reserved: 12000, fees: 9100, volume: 395000, transactions: 2600 },
                { merchant_id: 'm6', name: 'Euro Commerce GmbH', available: 300000, pending: 40000, reserved: 10000, fees: 7800, volume: 340000, transactions: 2240 },
            ]
        },
        {
            psp_id: 'psp_crypto', psp_name: 'CryptoPayments', currency: 'USDT',
            total_available: 520000, total_pending: 45000, total_reserved: 10000, total_fees: 5200,
            merchants: [
                { merchant_id: 'm7', name: 'Crypto Exchange Co', available: 320000, pending: 25000, reserved: 6000, fees: 3200, volume: 345000, transactions: 1850 },
                { merchant_id: 'm8', name: 'Web3 Services', available: 200000, pending: 20000, reserved: 4000, fees: 2000, volume: 220000, transactions: 1200 },
            ]
        },
    ];

    const togglePSP = (pspId) => {
        setExpandedPSPs(prev => ({ ...prev, [pspId]: !prev[pspId] }));
    };

    const totalAvailable = pspBalances.reduce((s, p) => s + p.total_available, 0);
    const totalPending = pspBalances.reduce((s, p) => s + p.total_pending, 0);
    const totalReserved = pspBalances.reduce((s, p) => s + p.total_reserved, 0);
    const totalFees = pspBalances.reduce((s, p) => s + p.total_fees, 0);

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
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <p className="text-sm opacity-80">Total Available</p>
                            <p className="text-3xl font-bold">${(totalAvailable / 1000000).toFixed(2)}M</p>
                            <p className="text-xs opacity-70 mt-1">Across {pspBalances.length} PSPs</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Pending Settlement</p>
                            <p className="text-2xl font-bold text-amber-600">${(totalPending / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-400 mt-1">Awaiting clearing</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Reserved</p>
                            <p className="text-2xl font-bold text-slate-600">${(totalReserved / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-400 mt-1">Chargeback reserve</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Fees Collected</p>
                            <p className="text-2xl font-bold text-blue-600">${(totalFees / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-400 mt-1">This period</p>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* Balance Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader><CardTitle>Balance Trend (All PSPs)</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
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

                        {/* PSP Summary */}
                        <Card>
                            <CardHeader><CardTitle>By PSP</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {pspBalances.map((psp) => (
                                    <div key={psp.psp_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                <Building2 className="h-4 w-4 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{psp.psp_name}</p>
                                                <p className="text-xs text-slate-500">{psp.merchants.length} merchants</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{getCurrencySymbol(psp.currency)}{(psp.total_available / 1000).toFixed(0)}K</p>
                                            <p className="text-xs text-slate-500">{psp.currency}</p>
                                        </div>
                                    </div>
                                ))}
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
                        <CardContent className="p-0">
                            {activeView === 'psp' ? (
                                <div className="divide-y">
                                    {pspBalances.map((psp) => (
                                        <Collapsible key={psp.psp_id} open={expandedPSPs[psp.psp_id]} onOpenChange={() => togglePSP(psp.psp_id)}>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        {expandedPSPs[psp.psp_id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-600" /></div>
                                                        <div className="text-left">
                                                            <p className="font-semibold">{psp.psp_name}</p>
                                                            <p className="text-xs text-slate-500">{psp.merchants.length} merchants · {psp.currency}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8 text-right">
                                                        <div><p className="text-xs text-slate-500">Available</p><p className="font-semibold text-emerald-600">{getCurrencySymbol(psp.currency)}{psp.total_available.toLocaleString()}</p></div>
                                                        <div><p className="text-xs text-slate-500">Pending</p><p className="font-semibold text-amber-600">{getCurrencySymbol(psp.currency)}{psp.total_pending.toLocaleString()}</p></div>
                                                        <div><p className="text-xs text-slate-500">Fees</p><p className="font-semibold text-blue-600">{getCurrencySymbol(psp.currency)}{psp.total_fees.toLocaleString()}</p></div>
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="bg-slate-50 border-t">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-slate-100"><TableHead>Merchant</TableHead><TableHead className="text-right">Volume</TableHead><TableHead className="text-right">Available</TableHead><TableHead className="text-right">Pending</TableHead><TableHead className="text-right">Reserved</TableHead><TableHead className="text-right">Fees</TableHead><TableHead className="text-right">TXN Count</TableHead></TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {psp.merchants.map((m) => (
                                                                <TableRow key={m.merchant_id}>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /><span className="font-medium">{m.name}</span></div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">{getCurrencySymbol(psp.currency)}{m.volume.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right text-emerald-600">{getCurrencySymbol(psp.currency)}{m.available.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right text-amber-600">{getCurrencySymbol(psp.currency)}{m.pending.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right">{getCurrencySymbol(psp.currency)}{m.reserved.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right text-blue-600">{getCurrencySymbol(psp.currency)}{m.fees.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right">{m.transactions.toLocaleString()}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow><TableHead>Merchant</TableHead><TableHead>PSPs</TableHead><TableHead className="text-right">Total Available</TableHead><TableHead className="text-right">Total Pending</TableHead><TableHead className="text-right">Total Fees</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...new Set(pspBalances.flatMap(p => p.merchants.map(m => m.name)))].map((merchantName) => {
                                            const merchantData = pspBalances.flatMap(p => p.merchants.filter(m => m.name === merchantName).map(m => ({ ...m, psp: p.psp_name, currency: p.currency })));
                                            const totalAvail = merchantData.reduce((s, m) => s + m.available, 0);
                                            const totalPend = merchantData.reduce((s, m) => s + m.pending, 0);
                                            const totalFee = merchantData.reduce((s, m) => s + m.fees, 0);
                                            return (
                                                <TableRow key={merchantName}>
                                                    <TableCell><div className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /><span className="font-medium">{merchantName}</span></div></TableCell>
                                                    <TableCell><div className="flex gap-1">{merchantData.map(m => <Badge key={m.psp} variant="outline" className="text-xs">{m.psp}</Badge>)}</div></TableCell>
                                                    <TableCell className="text-right text-emerald-600 font-semibold">${totalAvail.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-amber-600">${totalPend.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-blue-600">${totalFee.toLocaleString()}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}