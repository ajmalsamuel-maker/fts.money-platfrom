import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebarOptimized from '@/components/community/CommunityPortalSidebarOptimized';
import Breadcrumbs from '@/components/community/Breadcrumbs';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Activity, Package } from 'lucide-react';

export default function CommunityAnalytics() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    const { data: myPSPs = [] } = useQuery({
        queryKey: ['my-psp-instances', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ProvisionedPSP.list();
            return all.filter(psp => psp.owner_email === session?.email && !psp.is_template);
        },
        enabled: !!session?.email
    });

    const totalVolume = myPSPs.reduce((sum, psp) => sum + (psp.monthly_volume || 0), 0);
    const totalMerchants = myPSPs.reduce((sum, psp) => sum + (psp.total_merchants || 0), 0);
    const totalRevenue = myPSPs.reduce((sum, psp) => sum + (psp.monthly_revenue || 0), 0);

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebarOptimized currentPage="CommunityAnalytics" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-10" style={{ height: '64px' }}>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Analytics Dashboard</h2>
                        <p className="text-xs text-slate-600">Performance metrics across all your services</p>
                    </div>
                </header>

                <div className="p-6">
                    <Breadcrumbs currentPage="CommunityAnalytics" />

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Services</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{myPSPs.length}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Monthly Volume</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${(totalVolume / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Merchants</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalMerchants}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Revenue</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${(totalRevenue / 1000).toFixed(1)}K</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-cyan-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Performance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={myPSPs.map((psp, i) => ({
                                    name: psp.psp_name,
                                    volume: psp.monthly_volume || 0,
                                    merchants: psp.total_merchants || 0
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <ComplianceFooter />
            </div>
        </div>
    );
}