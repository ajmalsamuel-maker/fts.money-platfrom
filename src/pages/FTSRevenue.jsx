import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Code, GitBranch, Wallet, Briefcase } from 'lucide-react';

export default function FTSRevenue() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const { data: isoCustomers = [] } = useQuery({
        queryKey: ['iso-customers'],
        queryFn: () => base44.entities.ISOGatewayCustomer.list()
    });

    const { data: orchestrationCustomers = [] } = useQuery({
        queryKey: ['orchestration-customers'],
        queryFn: () => base44.entities.OrchestrationCustomer.list()
    });

    const { data: cryptoCustomers = [] } = useQuery({
        queryKey: ['crypto-customers'],
        queryFn: () => base44.entities.CryptoGatewayCustomer.list()
    });

    const { data: rwaProviders = [] } = useQuery({
        queryKey: ['rwa-providers'],
        queryFn: () => base44.entities.RWAWhiteLabelCustomer.list()
    });

    const pspRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const isoRevenue = isoCustomers.reduce((sum, c) => sum + (c.monthly_billing || 0), 0);
    const orchestrationRevenue = orchestrationCustomers.reduce((sum, c) => sum + (c.monthly_billing || 0), 0);
    const cryptoRevenue = cryptoCustomers.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0);
    const rwaRevenue = rwaProviders.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    
    const totalRevenue = pspRevenue + isoRevenue + orchestrationRevenue + cryptoRevenue + rwaRevenue;

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSRevenue" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Revenue Management</h2>
                        <p className="text-xs text-slate-600">Track revenue share and billing across all PSPs</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-600">Logged in as</p>
                        <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                        <Badge className="mt-1 bg-blue-600 text-white text-xs">
                            {getRoleLabel(platformUser?.platform_role)}
                        </Badge>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Monthly Revenue</p>
                                    <p className="text-3xl font-bold text-slate-900">${(totalRevenue / 1000).toFixed(0)}K</p>
                                    <p className="text-xs text-emerald-600 mt-1">All services</p>
                                </div>
                                <DollarSign className="h-10 w-10 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Annual Run Rate</p>
                                    <p className="text-3xl font-bold text-slate-900">${((totalRevenue * 12) / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-slate-500 mt-1">Projected</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Active Customers</p>
                                    <p className="text-3xl font-bold text-slate-900">{psps.length + isoCustomers.length + orchestrationCustomers.length + cryptoCustomers.length + rwaProviders.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">All platforms</p>
                                </div>
                                <Calendar className="h-10 w-10 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Growth</p>
                                    <p className="text-3xl font-bold text-emerald-600">+28%</p>
                                    <p className="text-xs text-slate-500 mt-1">vs last month</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">PSP Revenue</p>
                                    <p className="text-lg font-bold">${(pspRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <Code className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">ISO Gateway</p>
                                    <p className="text-lg font-bold">${(isoRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <GitBranch className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">Orchestration</p>
                                    <p className="text-lg font-bold">${(orchestrationRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">Crypto</p>
                                    <p className="text-lg font-bold">${(cryptoRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">RWA</p>
                                    <p className="text-lg font-bold">${(rwaRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Service Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Customers</TableHead>
                                        <TableHead className="text-right">Monthly Revenue</TableHead>
                                        <TableHead className="text-right">% of Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">PSP Platform</TableCell>
                                        <TableCell>{psps.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(pspRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((pspRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">ISO Gateway</TableCell>
                                        <TableCell>{isoCustomers.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(isoRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((isoRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Orchestration</TableCell>
                                        <TableCell>{orchestrationCustomers.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(orchestrationRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((orchestrationRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Crypto Banking</TableCell>
                                        <TableCell>{cryptoCustomers.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(cryptoRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((cryptoRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">RWA Platform</TableCell>
                                        <TableCell>{rwaProviders.length}</TableCell>
                                        <TableCell className="text-right font-semibold">${(rwaRevenue / 1000).toFixed(1)}K</TableCell>
                                        <TableCell className="text-right">{totalRevenue > 0 ? ((rwaRevenue / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top PSP Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PSP Name</TableHead>
                                        <TableHead>Tier</TableHead>
                                        <TableHead className="text-right">Monthly Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {psps.slice(0, 8).map((psp) => (
                                        <TableRow key={psp.id}>
                                            <TableCell className="font-medium">{psp.psp_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{psp.tier}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}K</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                </div>
            </div>
        </div>
    );
}