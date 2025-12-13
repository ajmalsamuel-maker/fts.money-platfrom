import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
    ArrowLeft,
    Users,
    TrendingUp,
    DollarSign,
    Activity,
    Globe,
    Zap,
    Shield,
    Settings,
    BarChart3,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PSPDetails() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const pspId = urlParams.get('id');

    const { data: psp, isLoading } = useQuery({
        queryKey: ['psp', pspId],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.list();
            return psps.find(p => p.id === pspId);
        },
        enabled: !!pspId
    });

    const toggleFeatureMutation = useMutation({
        mutationFn: async ({ feature, category, enabled }) => {
            const updates = {
                ...psp,
                [category]: {
                    ...psp[category],
                    [feature]: enabled
                }
            };
            return await base44.entities.ProvisionedPSP.update(pspId, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['psp', pspId]);
        }
    });

    if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading PSP...</div>;
    if (!psp) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">PSP not found</div>;

    const volumeData = [
        { month: 'Jan', volume: 2400000 },
        { month: 'Feb', volume: 3200000 },
        { month: 'Mar', volume: 2800000 },
        { month: 'Apr', volume: 3800000 },
        { month: 'May', volume: 4200000 },
        { month: 'Jun', volume: 5100000 }
    ];

    const revenueData = [
        { month: 'Jan', revenue: 48000 },
        { month: 'Feb', revenue: 64000 },
        { month: 'Mar', revenue: 56000 },
        { month: 'Apr', revenue: 76000 },
        { month: 'May', volume: 84000 },
        { month: 'Jun', revenue: 102000 }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(createPageUrl('PSPProvisioning'))}
                    className="mb-4 text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to PSPs
                </Button>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {psp.branding?.logo_url ? (
                            <img src={psp.branding.logo_url} alt={psp.psp_name} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                            <div 
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                                style={{ background: psp.branding?.primary_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                            >
                                {psp.psp_code?.substring(0, 2)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-white">{psp.psp_name}</h1>
                            <p className="text-slate-400">{psp.legal_entity_name || psp.psp_code}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    {psp.status}
                                </Badge>
                                <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {psp.tier}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Merchants</p>
                                    <p className="text-3xl font-bold text-white mt-1">{psp.total_merchants || 0}</p>
                                    <p className="text-xs text-emerald-400 mt-1">{psp.active_merchants || 0} active</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Monthly Volume</p>
                                    <p className="text-3xl font-bold text-white mt-1">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-emerald-400 mt-1">+18.5%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Monthly Revenue</p>
                                    <p className="text-3xl font-bold text-white mt-1">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}k</p>
                                    <p className="text-xs text-slate-500 mt-1">FTS earnings</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Success Rate</p>
                                    <p className="text-3xl font-bold text-white mt-1">98.7%</p>
                                    <p className="text-xs text-emerald-400 mt-1">+0.3%</p>
                                </div>
                                <Activity className="h-8 w-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-slate-800 border border-slate-700">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">Overview</TabsTrigger>
                        <TabsTrigger value="features" className="data-[state=active]:bg-slate-700">Features</TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Analytics</TabsTrigger>
                        <TabsTrigger value="billing" className="data-[state=active]:bg-slate-700">Billing</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Volume Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={volumeData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="month" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Revenue Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="month" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="revenue" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">PSP Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">DOMAIN</p>
                                        <p className="text-white">{psp.domain || `${psp.subdomain}.fts.money`}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">LICENSE TYPE</p>
                                        <p className="text-white capitalize">{psp.license_type?.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">COUNTRY</p>
                                        <p className="text-white">{psp.country}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">REVENUE SHARE</p>
                                        <p className="text-white">{psp.revenue_share_percentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">MONTHLY FEE</p>
                                        <p className="text-white">${psp.monthly_fee?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">GO LIVE DATE</p>
                                        <p className="text-white">{psp.go_live_date ? new Date(psp.go_live_date).toLocaleDateString() : 'Not set'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-6">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Core Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(psp.core_features || {}).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <span className="text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                                            {value ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-slate-600" />}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Advanced Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(psp.advanced_features || {}).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <span className="text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                                            <Switch 
                                                checked={value} 
                                                onCheckedChange={(checked) => toggleFeatureMutation.mutate({ feature: key, category: 'advanced_features', enabled: checked })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Compliance Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(psp.compliance_features || {}).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <span className="text-slate-300 uppercase">{key.replace(/_/g, ' ')}</span>
                                            <Switch 
                                                checked={value} 
                                                onCheckedChange={(checked) => toggleFeatureMutation.mutate({ feature: key, category: 'compliance_features', enabled: checked })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Detailed Analytics</CardTitle>
                            </CardHeader>
                            <CardContent className="text-slate-400 text-center py-12">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                                <p>Advanced analytics coming soon</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="billing">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Billing & Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <p className="text-sm text-slate-400 mb-1">Total Revenue (Lifetime)</p>
                                            <p className="text-2xl font-bold text-white">${((psp.total_revenue || 0) / 1000).toFixed(1)}k</p>
                                        </div>
                                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <p className="text-sm text-slate-400 mb-1">This Month</p>
                                            <p className="text-2xl font-bold text-white">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}k</p>
                                        </div>
                                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <p className="text-sm text-slate-400 mb-1">Monthly Fee</p>
                                            <p className="text-2xl font-bold text-white">${(psp.monthly_fee || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <p className="text-sm font-medium text-blue-400 mb-2">Revenue Model</p>
                                        <p className="text-slate-300">
                                            {psp.pricing_model === 'revenue_share' ? `${psp.revenue_share_percentage}% revenue share` : 
                                            psp.pricing_model === 'fixed_fee' ? `$${psp.monthly_fee}/month fixed` : 
                                            'Hybrid model'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}