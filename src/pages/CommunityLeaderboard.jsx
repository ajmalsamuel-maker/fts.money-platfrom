import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Leaf, Zap, TrendingUp, Award } from 'lucide-react';

export default function CommunityLeaderboard() {
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('consumer_session') || localStorage.getItem('community_portal_session');
        if (session) setUser(JSON.parse(session));
    }, []);

    const { data: completions = [] } = useQuery({
        queryKey: ['allCompletions'],
        queryFn: () => base44.entities.TaskCompletion.list('-created_date', 1000),
    });

    const { data: tokens = [] } = useQuery({
        queryKey: ['allTokens'],
        queryFn: () => base44.entities.NanoToken.list('-total_earned', 100),
    });

    // Calculate leaderboards
    const taskLeaders = Object.values(
        completions.reduce((acc, c) => {
            if (!acc[c.user_email]) {
                acc[c.user_email] = { email: c.user_email, count: 0, carbon: 0 };
            }
            acc[c.user_email].count++;
            acc[c.user_email].carbon += c.carbon_impact || 0;
            return acc;
        }, {})
    ).sort((a, b) => b.count - a.count).slice(0, 10);

    const carbonLeaders = [...taskLeaders].sort((a, b) => b.carbon - a.carbon).slice(0, 10);
    const tokenLeaders = tokens.slice(0, 10);

    const LeaderboardList = ({ leaders, metric, icon: Icon }) => (
        <div className="space-y-3">
            {leaders.map((leader, index) => (
                <Card key={leader.email || leader.user_email} className={index < 3 ? 'border-2 border-yellow-300' : ''}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                                {index < 3 ? (
                                    <Trophy className={`h-6 w-6 ${
                                        index === 0 ? 'text-yellow-500' : 
                                        index === 1 ? 'text-slate-400' : 
                                        'text-amber-600'
                                    }`} />
                                ) : (
                                    <span className="text-slate-400 font-bold">#{index + 1}</span>
                                )}
                            </div>
                            <Avatar>
                                <AvatarFallback className="bg-green-100 text-green-700">
                                    {(leader.email || leader.user_email)?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{leader.email || leader.user_email}</p>
                                {index < 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        <Award className="h-3 w-3 mr-1" />
                                        Top {index + 1}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-green-600" />
                            <span className="text-xl font-bold">
                                {metric === 'tasks' && leader.count}
                                {metric === 'carbon' && `${leader.carbon.toFixed(1)} kg`}
                                {metric === 'tokens' && (leader.total_earned || 0)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <>
            <ConsumerNavbar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-slate-900">Community Leaderboard</h1>
                        <p className="text-slate-600">See who's making the biggest impact</p>
                    </div>

                    <Tabs defaultValue="tasks" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="tasks">Most Tasks</TabsTrigger>
                            <TabsTrigger value="carbon">CO₂ Offset</TabsTrigger>
                            <TabsTrigger value="tokens">Top Earners</TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks">
                            <LeaderboardList leaders={taskLeaders} metric="tasks" icon={Zap} />
                        </TabsContent>

                        <TabsContent value="carbon">
                            <LeaderboardList leaders={carbonLeaders} metric="carbon" icon={Leaf} />
                        </TabsContent>

                        <TabsContent value="tokens">
                            <LeaderboardList leaders={tokenLeaders} metric="tokens" icon={TrendingUp} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}