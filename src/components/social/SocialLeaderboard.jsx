import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function SocialLeaderboard({ programId }) {
    const [timeframe, setTimeframe] = React.useState('weekly');

    const { data: leaderboards = [] } = useQuery({
        queryKey: ['socialLeaderboard', programId, timeframe],
        queryFn: async () => {
            const boards = await base44.entities.LoyaltyLeaderboard.filter({
                program_id: programId,
                leaderboard_type: timeframe,
                activity_type: 'social_share'
            });
            return boards;
        }
    });

    const getMedalIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 text-gray-400" />;
            case 3: return <Medal className="h-5 w-5 text-amber-700" />;
            default: return <span className="w-5 text-center font-bold text-gray-400">#{rank}</span>;
        }
    };

    const leaderboard = leaderboards[0] || { rankings: [] };

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Social Task Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="weekly" onValueChange={setTimeframe} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>

                    <TabsContent value={timeframe} className="mt-4 space-y-3">
                        {leaderboard.rankings && leaderboard.rankings.length > 0 ? (
                            <>
                                {leaderboard.rankings.map((entry, index) => (
                                    <div
                                        key={entry.participant_id}
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-all"
                                    >
                                        <div className="w-8 flex justify-center">
                                            {getMedalIcon(entry.rank)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">
                                                {entry.participant_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {entry.units || 0} tasks completed
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-600">
                                                {entry.score?.toLocaleString() || 0}
                                            </p>
                                            <p className="text-xs text-slate-500">pts</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No participants yet</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}