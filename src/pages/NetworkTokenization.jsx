import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, TrendingUp, CreditCard, Activity } from 'lucide-react';

export default function NetworkTokenization() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: tokens = [] } = useQuery({
        queryKey: ['network-tokens'],
        queryFn: () => base44.entities.NetworkToken.list('-created_date')
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const activeTokens = tokens.filter(t => t.status === 'active');
    const avgAuthImprovement = tokens.reduce((sum, t) => sum + (t.authorization_rate_improvement || 0), 0) / tokens.length || 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="NetworkTokenization" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Network Tokenization</h1>
                                <p className="text-slate-500">Visa & Mastercard Token Service integration</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Active Tokens</p>
                                        <p className="text-2xl font-bold">{activeTokens.length}</p>
                                    </div>
                                    <CreditCard className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Avg Auth Improvement</p>
                                        <p className="text-2xl font-bold text-emerald-600">+{avgAuthImprovement.toFixed(1)}%</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Usage</p>
                                        <p className="text-2xl font-bold">{tokens.reduce((sum, t) => sum + (t.usage_count || 0), 0)}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Networks</p>
                                        <p className="text-2xl font-bold">4</p>
                                    </div>
                                    <ShieldCheck className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>What is Network Tokenization?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm text-slate-700">
                                <p>
                                    Network tokenization replaces card PANs with network-specific tokens that improve authorization rates 
                                    and reduce fraud. When cards are used for transactions, the token dynamically updates with each use.
                                </p>
                                <div className="grid md:grid-cols-3 gap-4 mt-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold mb-1">📈 Higher Approval Rates</h4>
                                        <p className="text-xs">2-3% improvement in authorization rates</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-lg">
                                        <h4 className="font-semibold mb-1">🔒 Enhanced Security</h4>
                                        <p className="text-xs">Dynamic cryptograms prevent fraud</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <h4 className="font-semibold mb-1">♻️ Auto Updates</h4>
                                        <p className="text-xs">Tokens update when cards are replaced</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Network Tokens</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Token ID</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Network</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Auth Improvement</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tokens.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                No network tokens yet. Enable for merchants to improve authorization rates.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tokens.map((token) => (
                                            <TableRow key={token.id}>
                                                <TableCell className="font-mono text-xs">{token.token_id}</TableCell>
                                                <TableCell>{merchants.find(m => m.id === token.merchant_id)?.business_name || 'Unknown'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">{token.network}</Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">{token.tokenization_method?.replace(/_/g, ' ')}</TableCell>
                                                <TableCell>{token.usage_count || 0}</TableCell>
                                                <TableCell>
                                                    <span className="text-emerald-600 font-semibold">
                                                        +{(token.authorization_rate_improvement || 0).toFixed(1)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        token.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        token.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {token.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}