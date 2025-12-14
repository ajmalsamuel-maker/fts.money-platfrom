import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    TrendingUp,
    Users,
    DollarSign,
    Activity,
    BarChart3
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FTSAnalytics() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const volumeData = [
        { month: 'Jan', volume: 2.5 },
        { month: 'Feb', volume: 3.2 },
        { month: 'Mar', volume: 4.1 },
        { month: 'Apr', volume: 3.8 },
        { month: 'May', volume: 5.2 },
        { month: 'Jun', volume: 6.1 }
    ];

    const revenueData = [
        { month: 'Jan', revenue: 45 },
        { month: 'Feb', revenue: 52 },
        { month: 'Mar', revenue: 61 },
        { month: 'Apr', revenue: 58 },
        { month: 'May', revenue: 73 },
        { month: 'Jun', revenue: 82 }
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSAnalytics" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Platform Analytics</h2>
                        <p className="text-xs text-slate-600">Comprehensive performance metrics and insights</p>
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
                                    <p className="text-sm text-slate-600">Total Volume (6M)</p>
                                    <p className="text-2xl font-bold text-slate-900">$24.9M</p>
                                    <p className="text-xs text-emerald-600 mt-1">+28% growth</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-slate-900">$371K</p>
                                    <p className="text-xs text-emerald-600 mt-1">+32% growth</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Active PSPs</p>
                                    <p className="text-2xl font-bold text-slate-900">{psps.filter(p => p.status === 'active').length}</p>
                                    <p className="text-xs text-slate-500 mt-1">Across all tiers</p>
                                </div>
                                <Activity className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Merchants</p>
                                    <p className="text-2xl font-bold text-slate-900">{psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0)}</p>
                                    <p className="text-xs text-slate-500 mt-1">All PSPs combined</p>
                                </div>
                                <Users className="h-8 w-8 text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Volume Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                </div>
            </div>
        </div>
    );
}