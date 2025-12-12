import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function AccountUpdater() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: updates = [] } = useQuery({
        queryKey: ['account-updates'],
        queryFn: () => base44.entities.AccountUpdater.list('-update_date')
    });

    const pendingUpdates = updates.filter(u => u.status === 'pending');
    const appliedUpdates = updates.filter(u => u.status === 'applied');

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="AccountUpdater" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <RefreshCw className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Account Updater Service</h1>
                                <p className="text-slate-500">Automatic card credential updates</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Pending Updates</p>
                                        <p className="text-2xl font-bold">{pendingUpdates.length}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Applied Updates</p>
                                        <p className="text-2xl font-bold text-emerald-600">{appliedUpdates.length}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Success Rate</p>
                                        <p className="text-2xl font-bold">
                                            {updates.length > 0 ? ((appliedUpdates.length / updates.length) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                    <RefreshCw className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>How Account Updater Works</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm text-slate-700">
                                <p>
                                    Account Updater automatically retrieves updated card information from card networks when cards are renewed, 
                                    replaced, or closed. This prevents subscription payment failures and reduces customer churn.
                                </p>
                                <div className="grid md:grid-cols-4 gap-3 mt-4">
                                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                                        <div className="text-2xl mb-1">🔍</div>
                                        <p className="text-xs font-semibold">Daily Checks</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                        <div className="text-2xl mb-1">♻️</div>
                                        <p className="text-xs font-semibold">Auto Update</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                                        <div className="text-2xl mb-1">📧</div>
                                        <p className="text-xs font-semibold">Customer Notice</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg text-center">
                                        <div className="text-2xl mb-1">✅</div>
                                        <p className="text-xs font-semibold">Seamless Billing</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Card Update History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Original Card</TableHead>
                                        <TableHead>Updated Card</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Update Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {updates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                No card updates yet. Service monitors cards daily.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        updates.map((update) => (
                                            <TableRow key={update.id}>
                                                <TableCell className="text-sm">{update.customer_id}</TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    •••• {update.original_last_four} ({update.original_expiry_month}/{update.original_expiry_year})
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    •••• {update.updated_last_four} ({update.updated_expiry_month}/{update.updated_expiry_year})
                                                </TableCell>
                                                <TableCell className="capitalize text-xs">{update.update_reason?.replace(/_/g, ' ')}</TableCell>
                                                <TableCell className="text-xs">{update.update_source?.replace(/_/g, ' ')}</TableCell>
                                                <TableCell className="text-xs">{new Date(update.update_date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        update.status === 'applied' ? 'bg-emerald-100 text-emerald-700' :
                                                        update.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }>
                                                        {update.status}
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