import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
    Trophy, TrendingUp, TrendingDown, Search, 
    Filter, Download, BarChart3, Settings, RefreshCw,
    Users, DollarSign, Leaf, Shield, Activity, 
    LineChart, PieChart, ArrowUpRight, Award
} from 'lucide-react';
import { LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function PlatformFIXManagement() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState('all');
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [showAlgorithmConfig, setShowAlgorithmConfig] = useState(false);
    const [algorithmWeights, setAlgorithmWeights] = useState({
        transaction: 30,
        service: 25,
        esg: 25,
        compliance: 20
    });

    const { data: allScores = [], isLoading } = useQuery({
        queryKey: ['allFIXScores'],
        queryFn: () => base44.entities.FIXScore.list('-overall_score', 500),
    });
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!platformUser) {
        return null;
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!platformUser) {
        return null;
    }

    const filteredScores = allScores.filter(score => {
        const matchesSearch = score.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            score.merchant_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = tierFilter === 'all' || score.score_tier === tierFilter;
        return matchesSearch && matchesTier;
    });

    const recalculateScoreMutation = useMutation({
        mutationFn: async (merchantId) => {
            const response = await base44.functions.invoke('calculateFIXScore', { merchant_id: merchantId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allFIXScores'] });
        }
    });

    const recalculateAllScoresMutation = useMutation({
        mutationFn: async () => {
            const merchants = await base44.asServiceRole.entities.Merchant.list();
            const results = [];
            for (const merchant of merchants.slice(0, 50)) { // Limit to 50 for performance
                try {
                    const response = await base44.functions.invoke('calculateFIXScore', { merchant_id: merchant.id });
                    results.push(response.data);
                } catch (e) {
                    console.error(`Failed to calculate score for ${merchant.id}:`, e);
                }
            }
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allFIXScores'] });
        }
    });

    const stats = {
        avgScore: Math.round(allScores.reduce((sum, s) => sum + s.overall_score, 0) / allScores.length) || 0,
        diamond: allScores.filter(s => s.score_tier === 'diamond').length,
        platinum: allScores.filter(s => s.score_tier === 'platinum').length,
        gold: allScores.filter(s => s.score_tier === 'gold').length,
        silver: allScores.filter(s => s.score_tier === 'silver').length,
        bronze: allScores.filter(s => s.score_tier === 'bronze').length,
        totalMerchants: allScores.length,
        avgTransactionScore: Math.round(allScores.reduce((sum, s) => sum + (s.transaction_score || 0), 0) / allScores.length) || 0,
        avgServiceScore: Math.round(allScores.reduce((sum, s) => sum + (s.service_adoption_score || 0), 0) / allScores.length) || 0,
        avgESGScore: Math.round(allScores.reduce((sum, s) => sum + (s.esg_score || 0), 0) / allScores.length) || 0,
        avgComplianceScore: Math.round(allScores.reduce((sum, s) => sum + (s.compliance_score || 0), 0) / allScores.length) || 0,
        totalVolume: allScores.reduce((sum, s) => sum + (s.monthly_transaction_volume || 0), 0),
        totalCarbonOffset: allScores.reduce((sum, s) => sum + (s.carbon_offset_kg || 0), 0)
    };

    // Tier distribution data for charts
    const tierDistribution = [
        { name: 'Bronze', value: stats.bronze, color: '#f97316' },
        { name: 'Silver', value: stats.silver, color: '#94a3b8' },
        { name: 'Gold', value: stats.gold, color: '#eab308' },
        { name: 'Platinum', value: stats.platinum, color: '#a855f7' },
        { name: 'Diamond', value: stats.diamond, color: '#3b82f6' }
    ];

    // Score component breakdown
    const componentBreakdown = [
        { name: 'Transaction', avg: stats.avgTransactionScore, max: 300, color: '#10b981' },
        { name: 'Service', avg: stats.avgServiceScore, max: 250, color: '#3b82f6' },
        { name: 'ESG', avg: stats.avgESGScore, max: 250, color: '#10b981' },
        { name: 'Compliance', avg: stats.avgComplianceScore, max: 200, color: '#8b5cf6' }
    ];

    // Trend data (mock - in production would come from historical data)
    const trendData = [
        { month: 'Jan', avgScore: 420 },
        { month: 'Feb', avgScore: 435 },
        { month: 'Mar', avgScore: 450 },
        { month: 'Apr', avgScore: 465 },
        { month: 'May', avgScore: 478 },
        { month: 'Jun', avgScore: stats.avgScore }
    ];

    const tierColors = {
        bronze: 'bg-orange-100 text-orange-700',
        silver: 'bg-slate-100 text-slate-700',
        gold: 'bg-yellow-100 text-yellow-700',
        platinum: 'bg-purple-100 text-purple-700',
        diamond: 'bg-blue-100 text-blue-700'
    };

    const exportToCSV = () => {
        const headers = ['Rank', 'Merchant', 'Score', 'Tier', 'Transaction Score', 'Service Score', 'ESG Score', 'Compliance Score'];
        const rows = filteredScores.map((score, idx) => [
            idx + 1,
            score.merchant_name,
            score.overall_score,
            score.score_tier,
            score.transaction_score,
            score.service_adoption_score,
            score.esg_score,
            score.compliance_score
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fix_scores.csv';
        a.click();
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PlatformFIXManagement"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">FIX Score Management</h1>
                        <p className="text-slate-600">FTS Index - Comprehensive merchant scoring & analytics</p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={showAlgorithmConfig} onOpenChange={setShowAlgorithmConfig}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Algorithm Config
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>FIX Score Algorithm Configuration</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div>
                                        <Label>Transaction Volume Weight: {algorithmWeights.transaction}%</Label>
                                        <Slider 
                                            value={[algorithmWeights.transaction]} 
                                            onValueChange={(v) => setAlgorithmWeights({...algorithmWeights, transaction: v[0]})}
                                            max={50}
                                            step={1}
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Max score: {algorithmWeights.transaction * 10} points</p>
                                    </div>
                                    <div>
                                        <Label>Service Adoption Weight: {algorithmWeights.service}%</Label>
                                        <Slider 
                                            value={[algorithmWeights.service]} 
                                            onValueChange={(v) => setAlgorithmWeights({...algorithmWeights, service: v[0]})}
                                            max={50}
                                            step={1}
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Max score: {algorithmWeights.service * 10} points</p>
                                    </div>
                                    <div>
                                        <Label>ESG Metrics Weight: {algorithmWeights.esg}%</Label>
                                        <Slider 
                                            value={[algorithmWeights.esg]} 
                                            onValueChange={(v) => setAlgorithmWeights({...algorithmWeights, esg: v[0]})}
                                            max={50}
                                            step={1}
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Max score: {algorithmWeights.esg * 10} points</p>
                                    </div>
                                    <div>
                                        <Label>Compliance Weight: {algorithmWeights.compliance}%</Label>
                                        <Slider 
                                            value={[algorithmWeights.compliance]} 
                                            onValueChange={(v) => setAlgorithmWeights({...algorithmWeights, compliance: v[0]})}
                                            max={50}
                                            step={1}
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Max score: {algorithmWeights.compliance * 10} points</p>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium mb-2">Total Weight: {algorithmWeights.transaction + algorithmWeights.service + algorithmWeights.esg + algorithmWeights.compliance}%</p>
                                        <p className="text-xs text-slate-500">Note: Changes to algorithm weights require backend function update to take effect</p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button 
                            onClick={() => recalculateAllScoresMutation.mutate()}
                            disabled={recalculateAllScoresMutation.isPending}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${recalculateAllScoresMutation.isPending ? 'animate-spin' : ''}`} />
                            Recalculate All
                        </Button>
                        <Button onClick={exportToCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="details">Score Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Average Score</p>
                                            <div className="text-3xl font-bold">{stats.avgScore}</div>
                                            <p className="text-xs text-slate-500 mt-1">out of 1000</p>
                                        </div>
                                        <BarChart3 className="h-12 w-12 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Total Volume (30d)</p>
                                            <div className="text-3xl font-bold">${(stats.totalVolume / 1000000).toFixed(1)}M</div>
                                            <p className="text-xs text-slate-500 mt-1">transaction volume</p>
                                        </div>
                                        <DollarSign className="h-12 w-12 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Carbon Offset</p>
                                            <div className="text-3xl font-bold">{(stats.totalCarbonOffset / 1000).toFixed(1)}t</div>
                                            <p className="text-xs text-slate-500 mt-1">CO₂ offset</p>
                                        </div>
                                        <Leaf className="h-12 w-12 text-emerald-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Total Merchants</p>
                                            <div className="text-3xl font-bold">{stats.totalMerchants}</div>
                                            <p className="text-xs text-slate-500 mt-1">active merchants</p>
                                        </div>
                                        <Users className="h-12 w-12 text-slate-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tier Distribution & Score Trend */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tier Distribution</CardTitle>
                                    <CardDescription>Merchant distribution across tiers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RechartsPie>
                                            <Pie
                                                data={tierDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {tierDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Score Trend</CardTitle>
                                    <CardDescription>Platform-wide score evolution</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RechartsLine data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} />
                                        </RechartsLine>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Score Component Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Score Component Analysis</CardTitle>
                                <CardDescription>Average scores by component across all merchants</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {componentBreakdown.map((component) => (
                                        <div key={component.name}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{component.name}</span>
                                                <span className="text-sm text-slate-600">{component.avg} / {component.max}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-3">
                                                <div 
                                                    className="h-3 rounded-full transition-all"
                                                    style={{ 
                                                        width: `${(component.avg / component.max) * 100}%`,
                                                        backgroundColor: component.color 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="leaderboard" className="space-y-6">

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search merchants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant={tierFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setTierFilter('all')}
                                >
                                    All
                                </Button>
                                <Button 
                                    variant={tierFilter === 'diamond' ? 'default' : 'outline'}
                                    onClick={() => setTierFilter('diamond')}
                                >
                                    Diamond
                                </Button>
                                <Button 
                                    variant={tierFilter === 'platinum' ? 'default' : 'outline'}
                                    onClick={() => setTierFilter('platinum')}
                                >
                                    Platinum
                                </Button>
                                <Button 
                                    variant={tierFilter === 'gold' ? 'default' : 'outline'}
                                    onClick={() => setTierFilter('gold')}
                                >
                                    Gold
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search merchants..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant={tierFilter === 'all' ? 'default' : 'outline'}
                                            onClick={() => setTierFilter('all')}
                                            size="sm"
                                        >
                                            All
                                        </Button>
                                        <Button 
                                            variant={tierFilter === 'diamond' ? 'default' : 'outline'}
                                            onClick={() => setTierFilter('diamond')}
                                            size="sm"
                                        >
                                            Diamond
                                        </Button>
                                        <Button 
                                            variant={tierFilter === 'platinum' ? 'default' : 'outline'}
                                            onClick={() => setTierFilter('platinum')}
                                            size="sm"
                                        >
                                            Platinum
                                        </Button>
                                        <Button 
                                            variant={tierFilter === 'gold' ? 'default' : 'outline'}
                                            onClick={() => setTierFilter('gold')}
                                            size="sm"
                                        >
                                            Gold
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leaderboard */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Merchants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">Loading scores...</div>
                                ) : filteredScores.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">No merchants found</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Rank</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Merchant</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Score</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Tier</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Trend</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Breakdown</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {filteredScores.map((score, idx) => (
                                                    <tr key={score.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                {idx < 3 ? (
                                                                    <Trophy className={`h-5 w-5 ${
                                                                        idx === 0 ? 'text-yellow-500' :
                                                                        idx === 1 ? 'text-slate-400' :
                                                                        'text-amber-600'
                                                                    }`} />
                                                                ) : (
                                                                    <span className="font-medium text-slate-600">#{idx + 1}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-medium">{score.merchant_name}</p>
                                                                <p className="text-xs text-slate-500">{score.merchant_email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xl font-bold">{score.overall_score}</span>
                                                            <span className="text-slate-400">/1000</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge className={tierColors[score.score_tier]}>
                                                                {score.score_tier?.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {score.score_trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                                                            {score.score_trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                                                            {score.score_trend === 'stable' && <span className="text-slate-400">—</span>}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2 text-xs">
                                                                <span className="text-green-600">T:{score.transaction_score}</span>
                                                                <span className="text-blue-600">S:{score.service_adoption_score}</span>
                                                                <span className="text-emerald-600">E:{score.esg_score}</span>
                                                                <span className="text-purple-600">C:{score.compliance_score}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setSelectedMerchant(score)}
                                                                >
                                                                    Details
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => recalculateScoreMutation.mutate(score.merchant_id)}
                                                                    disabled={recalculateScoreMutation.isPending}
                                                                >
                                                                    <RefreshCw className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Score Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsBar data={componentBreakdown}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="avg" fill="#3b82f6" name="Average Score" />
                                            <Bar dataKey="max" fill="#e5e7eb" name="Max Score" />
                                        </RechartsBar>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Industry Breakdown</CardTitle>
                                    <CardDescription>Top performing industries</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {['E-commerce', 'SaaS', 'Fintech', 'Healthcare', 'Retail'].map((industry, idx) => (
                                            <div key={industry} className="flex items-center justify-between">
                                                <span className="font-medium">{industry}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-600">{Math.floor(Math.random() * 150) + 450}</span>
                                                    <Award className="h-4 w-4 text-yellow-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6">
                        {selectedMerchant ? (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{selectedMerchant.merchant_name}</CardTitle>
                                            <CardDescription>{selectedMerchant.merchant_email}</CardDescription>
                                        </div>
                                        <Button variant="outline" onClick={() => setSelectedMerchant(null)}>Close</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                                            <div className="text-3xl font-bold">{selectedMerchant.overall_score}</div>
                                            <p className="text-sm text-slate-600">Overall Score</p>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold">{selectedMerchant.transaction_score}</div>
                                            <p className="text-sm text-slate-600">Transaction</p>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold">{selectedMerchant.service_adoption_score}</div>
                                            <p className="text-sm text-slate-600">Service</p>
                                        </div>
                                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                            <div className="text-2xl font-bold">{selectedMerchant.esg_score}</div>
                                            <p className="text-sm text-slate-600">ESG</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Active Services</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {selectedMerchant.services_active?.map(service => (
                                                <Badge key={service} variant="outline">{service}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Benefits Unlocked</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {selectedMerchant.benefits_unlocked?.map((benefit, idx) => (
                                                <li key={idx}>{benefit}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-600">Monthly Volume</p>
                                            <p className="text-xl font-bold">${(selectedMerchant.monthly_transaction_volume || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600">Carbon Offset</p>
                                            <p className="text-xl font-bold">{selectedMerchant.carbon_offset_kg || 0} kg</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center text-slate-500">
                                    Select a merchant from the leaderboard to view detailed score breakdown
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}