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
    BarChart3,
    Code,
    GitBranch,
    Wallet,
    Briefcase,
    Building2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FTSAnalytics() {
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
                <div className="grid grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">All Services</p>
                                    <p className="text-2xl font-bold text-blue-600">{psps.length + isoCustomers.length + orchestrationCustomers.length + cryptoCustomers.length + rwaProviders.length}</p>
                                </div>
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">PSP</p>
                                    <p className="text-2xl font-bold text-emerald-600">{psps.filter(p => p.status === 'active').length}</p>
                                </div>
                                <Building2 className="h-6 w-6 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">ISO Gateway</p>
                                    <p className="text-2xl font-bold text-indigo-600">{isoCustomers.filter(c => c.status === 'active').length}</p>
                                </div>
                                <Code className="h-6 w-6 text-indigo-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">Orchestration</p>
                                    <p className="text-2xl font-bold text-purple-600">{orchestrationCustomers.filter(c => c.status === 'active').length}</p>
                                </div>
                                <GitBranch className="h-6 w-6 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">Crypto</p>
                                    <p className="text-2xl font-bold text-cyan-600">{cryptoCustomers.filter(c => c.status === 'active').length}</p>
                                </div>
                                <Wallet className="h-6 w-6 text-cyan-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-600">RWA</p>
                                    <p className="text-2xl font-bold text-amber-600">{rwaProviders.filter(p => p.status === 'active').length}</p>
                                </div>
                                <Briefcase className="h-6 w-6 text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Platform Volume (6M)</p>
                                    <p className="text-3xl font-bold text-slate-900">$24.9M</p>
                                    <p className="text-xs text-emerald-600 mt-1">+28% growth</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Revenue</p>
                                    <p className="text-3xl font-bold text-slate-900">$371K</p>
                                    <p className="text-xs text-emerald-600 mt-1">+32% growth</p>
                                </div>
                                <DollarSign className="h-10 w-10 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total End Users</p>
                                    <p className="text-3xl font-bold text-slate-900">{psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0)}</p>
                                    <p className="text-xs text-slate-500 mt-1">Across all services</p>
                                </div>
                                <Users className="h-10 w-10 text-purple-600" />
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