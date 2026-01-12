import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Filter, Calendar, TrendingUp, Users, Menu, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LoyaltyLeaderboards() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [dateRange, setDateRange] = useState('all_time');
    const [activityTypeFilter, setActivityTypeFilter] = useState('all');
    const [tierFilter, setTierFilter] = useState('all');

    if (!session.id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const programId = selectedProgram || programs[0]?.id;

    const { data: participants = [] } = useQuery({
        queryKey: ['leaderboard-participants', programId, tierFilter],
        queryFn: async () => {
            if (!programId) return [];
            const query = { program_id: programId };
            if (tierFilter !== 'all') query.current_tier = tierFilter;
            return base44.entities.LoyaltyParticipant.filter(query);
        },
        enabled: !!programId
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['leaderboard-activities', programId, dateRange, activityTypeFilter],
        queryFn: async () => {
            if (!programId) return [];
            const query = { program_id: programId };
            if (activityTypeFilter !== 'all') query.activity_type = activityTypeFilter;
            return base44.entities.ActivityLog.filter(query, '-created_date', 1000);
        },
        enabled: !!programId
    });

    // Filter activities by date range
    const filteredActivities = activities.filter(activity => {
        if (!activity.created_date) return false;
        const activityDate = new Date(activity.created_date);
        const now = new Date();
        
        if (dateRange === 'today') {
            return activityDate.toDateString() === now.toDateString();
        } else if (dateRange === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return activityDate >= weekAgo;
        } else if (dateRange === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return activityDate >= monthAgo;
        }
        return true; // all_time
    });

    // Calculate leaderboard rankings
    const rankings = participants.map(participant => {
        const participantActivities = filteredActivities.filter(a => a.participant_id === participant.id);
        const totalPoints = participantActivities.reduce((sum, a) => sum + (a.points_earned || 0), 0);
        const activitiesCount = participantActivities.length;
        
        return {
            participant,
            totalPoints,
            activitiesCount
        };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    const getRankIcon = (rank) => {
        if (rank === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (rank === 1) return <Medal className="h-6 w-6 text-slate-400" />;
        if (rank === 2) return <Award className="h-6 w-6 text-amber-600" />;
        return <span className="text-lg font-bold text-slate-600">#{rank + 1}</span>;
    };

    const getTierColor = (tier) => {
        const colors = {
            bronze: 'bg-amber-100 text-amber-800',
            silver: 'bg-slate-100 text-slate-700',
            gold: 'bg-yellow-100 text-yellow-800',
            platinum: 'bg-purple-100 text-purple-700'
        };
        return colors[tier] || 'bg-slate-100';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            {/* Sidebar */}
            <aside className={cn("fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <span className="font-bold">Leaderboards</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600">Organization</p>
                    <p className="font-semibold">{session.organization_name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/LoyaltyCustomerPortal" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        Dashboard
                    </a>
                    <a href="/LoyaltyLeaderboards" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        Leaderboards
                    </a>
                    <a href="/LoyaltyChallenges" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        Challenges
                    </a>
                </nav>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">Leaderboards</h1>
                            <p className="text-xs text-slate-600">Gamified rankings & competition</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                <CardTitle>Filters</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Program</Label>
                                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select program" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programs.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Date Range</Label>
                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="all_time">All Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Activity Type</Label>
                                    <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Activities</SelectItem>
                                            <SelectItem value="distance">Distance</SelectItem>
                                            <SelectItem value="volunteer">Volunteer</SelectItem>
                                            <SelectItem value="purchase">Purchase</SelectItem>
                                            <SelectItem value="sustainability">Sustainability</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Tier</Label>
                                    <Select value={tierFilter} onValueChange={setTierFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Tiers</SelectItem>
                                            <SelectItem value="bronze">Bronze</SelectItem>
                                            <SelectItem value="silver">Silver</SelectItem>
                                            <SelectItem value="gold">Gold</SelectItem>
                                            <SelectItem value="platinum">Platinum</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {rankings.slice(0, 3).map((ranking, idx) => (
                            <Card key={ranking.participant.id} className={cn(
                                "relative overflow-hidden",
                                idx === 0 && "ring-2 ring-yellow-400",
                                idx === 1 && "ring-2 ring-slate-300",
                                idx === 2 && "ring-2 ring-amber-500"
                            )}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        {getRankIcon(idx)}
                                        <h3 className="text-xl font-bold mt-3">{ranking.participant.full_name}</h3>
                                        <Badge className={cn("mt-2", getTierColor(ranking.participant.current_tier))}>
                                            {ranking.participant.current_tier}
                                        </Badge>
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                                <span className="text-2xl font-bold text-purple-600">{ranking.totalPoints}</span>
                                                <span className="text-sm text-slate-600">points</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <Users className="h-4 w-4 text-slate-500" />
                                                <span className="text-sm text-slate-600">{ranking.activitiesCount} activities</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Full Leaderboard */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Full Rankings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {rankings.map((ranking, idx) => (
                                    <div key={ranking.participant.id} className={cn(
                                        "flex items-center justify-between p-4 rounded-lg border",
                                        idx < 3 && "bg-gradient-to-r from-purple-50/50 to-blue-50/50"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 flex items-center justify-center">
                                                {idx < 3 ? getRankIcon(idx) : <span className="text-lg font-bold text-slate-600">#{idx + 1}</span>}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{ranking.participant.full_name}</p>
                                                <p className="text-sm text-slate-600">{ranking.participant.participant_email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <Badge className={getTierColor(ranking.participant.current_tier)}>
                                                {ranking.participant.current_tier}
                                            </Badge>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-purple-600">{ranking.totalPoints}</p>
                                                <p className="text-xs text-slate-500">{ranking.activitiesCount} activities</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {rankings.length === 0 && (
                                    <div className="text-center py-12">
                                        <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600">No participants yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}