import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Trophy, TrendingUp, TrendingDown, Search, 
    Filter, Download, BarChart3 
} from 'lucide-react';
export default function PlatformFIXManagement() {
    const { platformUser, loading } = usePlatformAuth();
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!platformUser) {
        return null;
    }
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState('all');

    const { data: allScores = [], isLoading } = useQuery({
        queryKey: ['allFIXScores'],
        queryFn: () => base44.entities.FIXScore.list('-overall_score', 500),
    });

    const filteredScores = allScores.filter(score => {
        const matchesSearch = score.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            score.merchant_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = tierFilter === 'all' || score.score_tier === tierFilter;
        return matchesSearch && matchesTier;
    });

    const stats = {
        avgScore: Math.round(allScores.reduce((sum, s) => sum + s.overall_score, 0) / allScores.length) || 0,
        diamond: allScores.filter(s => s.score_tier === 'diamond').length,
        platinum: allScores.filter(s => s.score_tier === 'platinum').length,
        gold: allScores.filter(s => s.score_tier === 'gold').length,
        totalMerchants: allScores.length
    };

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
                        <p className="text-slate-600">FTS Index - Platform-wide merchant scores</p>
                    </div>
                    <Button onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-3xl font-bold">{stats.avgScore}</div>
                            <p className="text-sm text-slate-600">Average Score</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-3xl font-bold">{stats.diamond}</div>
                            <p className="text-sm text-slate-600">Diamond Tier</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <div className="text-3xl font-bold">{stats.platinum}</div>
                            <p className="text-sm text-slate-600">Platinum Tier</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                            <div className="text-3xl font-bold">{stats.gold}</div>
                            <p className="text-sm text-slate-600">Gold Tier</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                            <div className="text-3xl font-bold">{stats.totalMerchants}</div>
                            <p className="text-sm text-slate-600">Total Merchants</p>
                        </CardContent>
                    </Card>
                </div>

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

                {/* Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle>FIX Score Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}