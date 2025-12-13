import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
                    <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
                    <p className="text-sm text-slate-600">Comprehensive performance metrics and insights</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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
    );
}