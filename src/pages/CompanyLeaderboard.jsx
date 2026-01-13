import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, TrendingUp, Menu, X, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CompanyLeaderboard() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [timeframe, setTimeframe] = useState('monthly');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const { data: leaderboard = { rankings: [] } } = useQuery({
        queryKey: ['companyLeaderboard', session.program_id, timeframe],
        queryFn: () => base44.entities.CompanyLeaderboard.filter({
            program_id: session.program_id,
            leaderboard_type: timeframe,
            status: 'active'
        }).then(boards => boards[0] || { rankings: [] })
    });

    const getMedalIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 text-gray-400" />;
            case 3: return <Medal className="h-5 w-5 text-amber-700" />;
            default: return <span className="w-5 text-center font-bold text-gray-400">#{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform shadow-xl md:shadow-none",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center gap-2 text-white">
                        <Trophy className="h-6 w-6" />
                        <span className="font-bold text-sm">Company Hub</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/CompanyDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <TrendingUp className="h-4 w-4" />Dashboard
                    </a>
                    <a href="/CompanyLeaderboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                        <Trophy className="h-4 w-4" />Leaderboard
                    </a>
                </nav>

                <div className="p-4 border-t">
                    <Button onClick={() => { 
                        localStorage.removeItem('participant_session'); 
                        window.location.href = '/ParticipantLogin'; 
                    }} variant="outline" className="w-full text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />Logout
                    </Button>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center px-6 sticky top-0 z-10">
                    <Button variant="ghost" size="icon" className="md:hidden mr-4" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Company Leaderboard
                    </h1>
                </header>

                <div className="p-6 max-w-4xl mx-auto">
                    <Tabs defaultValue="monthly" onValueChange={setTimeframe} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="all_time">All Time</TabsTrigger>
                        </TabsList>

                        <TabsContent value={timeframe} className="mt-6 space-y-3">
                            {leaderboard.rankings && leaderboard.rankings.length > 0 ? (
                                <>
                                    {leaderboard.rankings.map((entry, index) => (
                                        <Card key={entry.company_id} className={cn(
                                            "overflow-hidden transition-all hover:shadow-md",
                                            index < 3 ? "border-l-4" : "",
                                            index === 0 ? "border-l-yellow-500 bg-yellow-50/30" : "",
                                            index === 1 ? "border-l-gray-400 bg-gray-50/30" : "",
                                            index === 2 ? "border-l-amber-700 bg-amber-50/30" : ""
                                        )}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 flex justify-center">
                                                        {getMedalIcon(entry.rank)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{entry.company_name}</h3>
                                                        <p className="text-sm text-gray-600">{entry.participant_count} employees</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-indigo-600">{entry.total_points.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {entry.average_points_per_participant.toFixed(0)} avg
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </>
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center text-gray-500">
                                        No leaderboard data yet
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    {leaderboard.prizes && leaderboard.prizes.length > 0 && (
                        <Card className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                    Prizes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {leaderboard.prizes.map((prize) => (
                                    <div key={prize.rank} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">#{prize.rank} Position</p>
                                            <p className="text-sm text-gray-600">{prize.reward}</p>
                                        </div>
                                        {prize.bonus_points && (
                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                +{prize.bonus_points} points
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}