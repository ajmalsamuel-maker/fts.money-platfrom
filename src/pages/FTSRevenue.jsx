import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function FTSRevenue() {
    const navigate = useNavigate();
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const totalRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="mb-3"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Platform
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">Revenue Management</h1>
                    <p className="text-sm text-slate-600">Track revenue share and billing across all PSPs</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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