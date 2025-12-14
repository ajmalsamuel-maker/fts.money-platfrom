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
import { ArrowLeft, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function FTSRevenue() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const totalRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);

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
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Monthly Revenue</p>
                                    <p className="text-3xl font-bold text-slate-900">${(totalRevenue / 1000).toFixed(0)}K</p>
                                    <p className="text-xs text-emerald-600 mt-1">+18% vs last month</p>
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
                                    <p className="text-sm text-slate-600">Avg Revenue/PSP</p>
                                    <p className="text-3xl font-bold text-slate-900">${psps.length > 0 ? (totalRevenue / psps.length).toFixed(0) : 0}</p>
                                    <p className="text-xs text-slate-500 mt-1">Per month</p>
                                </div>
                                <Calendar className="h-10 w-10 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by PSP</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PSP Name</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Revenue Share %</TableHead>
                                    <TableHead>Monthly Volume</TableHead>
                                    <TableHead className="text-right">Monthly Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {psps.map((psp) => (
                                    <TableRow key={psp.id}>
                                        <TableCell className="font-medium">{psp.psp_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{psp.tier}</Badge>
                                        </TableCell>
                                        <TableCell>{psp.revenue_share_percentage}%</TableCell>
                                        <TableCell>${((psp.monthly_volume || 0) / 1000000).toFixed(2)}M</TableCell>
                                        <TableCell className="text-right font-semibold">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}K</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}