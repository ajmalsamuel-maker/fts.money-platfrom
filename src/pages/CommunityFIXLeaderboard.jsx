import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebarOptimized from '@/components/community/CommunityPortalSidebarOptimized';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Award, Star, Zap, Target, Users, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommunityFIXLeaderboard() {
    const [session, setSession] = useState(null);

    React.useEffect(() => {
        const storedSession = localStorage.getItem('community_portal_session');
        if (storedSession) setSession(JSON.parse(storedSession));
    }, []);

    const { data: allScores = [], isLoading } = useQuery({
        queryKey: ['fixScores'],
        queryFn: () => base44.entities.FIXScore.list('-overall_score', 100),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    // Calculate aggregate stats
    const avgScore = allScores.length > 0 
        ? allScores.reduce((sum, s) => sum + s.overall_score, 0) / allScores.length 
        : 0;

    const tierCounts = {
        diamond: allScores.filter(s => s.score_tier === 'diamond').length,
        platinum: allScores.filter(s => s.score_tier === 'platinum').length,
        gold: allScores.filter(s => s.score_tier === 'gold').length,
        silver: allScores.filter(s => s.score_tier === 'silver').length,
        bronze: allScores.filter(s => s.score_tier === 'bronze').length,
    };

    const tierColors = {
        diamond: 'from-cyan-400 to-blue-600',
        platinum: 'from-slate-300 to-slate-500',
        gold: 'from-yellow-400 to-yellow-600',
        silver: 'from-gray-300 to-gray-500',
        bronze: 'from-orange-400 to-orange-600'
    };

    const tierIcons = {
        diamond: '💎',
        platinum: '⚪',
        gold: '🥇',
        silver: '🥈',
        bronze: '🥉'
    };

    if (isLoading) {
        return (
            <div className="flex h-screen">
                <CommunityPortalSidebarOptimized currentPage="CommunityFIXLeaderboard" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Loading FIX scores...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebarOptimized currentPage="CommunityFIXLeaderboard" />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="h-8 w-8 text-yellow-600" />
                            <h1 className="text-3xl font-bold text-slate-900">FIX Score Leaderboard</h1>
                        </div>
                        <p className="text-slate-600">Track your merchants' FTS Index performance and sustainability impact</p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Merchants</p>
                                        <p className="text-3xl font-bold text-slate-900">{allScores.length}</p>
                                    </div>
                                    <Building className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Average Score</p>
                                        <p className="text-3xl font-bold text-slate-900">{avgScore.toFixed(0)}</p>
                                    </div>
                                    <Target className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Top Tier</p>
                                        <p className="text-3xl font-bold text-slate-900">{tierCounts.diamond + tierCounts.platinum}</p>
                                        <p className="text-xs text-slate-600">Diamond + Platinum</p>
                                    </div>
                                    <Award className="h-8 w-8 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Rising Stars</p>
                                        <p className="text-3xl font-bold text-slate-900">
                                            {allScores.filter(s => s.score_trend === 'up').length}
                                        </p>
                                        <p className="text-xs text-slate-600">Improving scores</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="leaderboard" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                            <TabsTrigger value="tiers">By Tier</TabsTrigger>
                            <TabsTrigger value="trending">Trending</TabsTrigger>
                        </TabsList>

                        {/* Leaderboard Tab */}
                        <TabsContent value="leaderboard" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        Top Performing Merchants
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {allScores.slice(0, 20).map((score, index) => (
                                            <div 
                                                key={score.id}
                                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-white border-slate-200'
                                                }`}
                                            >
                                                {/* Rank */}
                                                <div className="flex-shrink-0 w-12 text-center">
                                                    {index === 0 && <span className="text-3xl">🥇</span>}
                                                    {index === 1 && <span className="text-3xl">🥈</span>}
                                                    {index === 2 && <span className="text-3xl">🥉</span>}
                                                    {index > 2 && (
                                                        <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                                                    )}
                                                </div>

                                                {/* Merchant Info */}
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                        {score.merchant_name?.charAt(0) || 'M'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">{score.merchant_name}</h4>
                                                    <p className="text-sm text-slate-600">{score.merchant_email}</p>
                                                </div>

                                                {/* Score */}
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-slate-900">{score.overall_score}</div>
                                                    <Badge className={`bg-gradient-to-r ${tierColors[score.score_tier]} text-white border-0`}>
                                                        {tierIcons[score.score_tier]} {score.score_tier}
                                                    </Badge>
                                                </div>

                                                {/* Trend */}
                                                {score.score_trend === 'up' && (
                                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* By Tier Tab */}
                        <TabsContent value="tiers" className="space-y-4">
                            {['diamond', 'platinum', 'gold', 'silver', 'bronze'].map(tier => {
                                const tierScores = allScores.filter(s => s.score_tier === tier);
                                if (tierScores.length === 0) return null;

                                return (
                                    <Card key={tier}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span className="text-2xl">{tierIcons[tier]}</span>
                                                <span className="capitalize">{tier} Tier</span>
                                                <Badge variant="outline">{tierScores.length} merchants</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {tierScores.map(score => (
                                                    <div key={score.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                        <Avatar>
                                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                {score.merchant_name?.charAt(0) || 'M'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-slate-900 truncate">{score.merchant_name}</p>
                                                            <p className="text-sm text-slate-600">Score: {score.overall_score}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </TabsContent>

                        {/* Trending Tab */}
                        <TabsContent value="trending" className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Rising Stars */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                            Rising Stars
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {allScores.filter(s => s.score_trend === 'up').slice(0, 10).map(score => (
                                                <div key={score.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-green-100 text-green-700">
                                                            {score.merchant_name?.charAt(0) || 'M'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{score.merchant_name}</p>
                                                        <p className="text-sm text-slate-600">{score.overall_score} points</p>
                                                    </div>
                                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* High Impact */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-blue-600" />
                                            High Impact Merchants
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {allScores
                                                .sort((a, b) => (b.carbon_offset_kg || 0) - (a.carbon_offset_kg || 0))
                                                .slice(0, 10)
                                                .map(score => (
                                                    <div key={score.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                        <Avatar>
                                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                {score.merchant_name?.charAt(0) || 'M'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-slate-900">{score.merchant_name}</p>
                                                            <p className="text-sm text-slate-600">{score.carbon_offset_kg?.toFixed(0) || 0} kg CO₂</p>
                                                        </div>
                                                        <Star className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}