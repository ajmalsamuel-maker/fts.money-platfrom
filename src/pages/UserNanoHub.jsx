import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import BadgeDisplay from '@/components/consumer/BadgeDisplay';
import StreakTracker from '@/components/consumer/StreakTracker';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UserNanoHub() {
    // Check for community session or Base44 auth
    const [communityUser, setCommunityUser] = useState(null);
    
    React.useEffect(() => {
        // Check both consumer and community sessions
        const consumerSession = localStorage.getItem('consumer_session');
        const communitySession = localStorage.getItem('community_portal_session');
        
        if (consumerSession) {
            setCommunityUser(JSON.parse(consumerSession));
        } else if (communitySession) {
            setCommunityUser(JSON.parse(communitySession));
        }
    }, []);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            try {
                return await base44.auth.me();
            } catch (error) {
                return null;
            }
        },
    });

    const currentUser = communityUser || user;

    const { data: tokenBalance } = useQuery({
        queryKey: ['nanoTokens', currentUser?.email],
        queryFn: () => base44.entities.NanoToken.filter({ user_email: currentUser?.email }),
        enabled: !!currentUser?.email,
    });

    const { data: completedTasks = [] } = useQuery({
        queryKey: ['taskCompletions', currentUser?.email],
        queryFn: () => base44.entities.TaskCompletion.filter({ user_email: currentUser?.email }),
        enabled: !!currentUser?.email,
    });

    const { data: achievements = [] } = useQuery({
        queryKey: ['achievements', currentUser?.email],
        queryFn: () => base44.entities.UserAchievement.filter({ user_email: currentUser?.email }),
        enabled: !!currentUser?.email,
    });

    const { data: streaks = [] } = useQuery({
        queryKey: ['streaks', currentUser?.email],
        queryFn: () => base44.entities.UserStreak.filter({ user_email: currentUser?.email }),
        enabled: !!currentUser?.email,
    });

    const balance = tokenBalance?.[0]?.balance || 0;
    const totalCO2 = completedTasks.reduce((sum, t) => sum + (t.carbon_impact || 0), 0);
    const currentStreak = streaks?.[0];

    return (
        <>
            <ConsumerNavbar user={currentUser} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-green-800">Nano Sustainability Hub</h1>
                    <p className="text-xl text-slate-700">Complete tasks, earn tokens, save the planet</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                        <CardContent className="p-6 text-center">
                            <Zap className="h-12 w-12 mx-auto mb-3" />
                            <p className="text-sm opacity-90 mb-2">Your Balance</p>
                            <p className="text-4xl font-bold">{balance} NANO</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                        <CardContent className="p-6 text-center">
                            <Leaf className="h-12 w-12 mx-auto mb-3" />
                            <p className="text-sm opacity-90 mb-2">CO₂ Offset</p>
                            <p className="text-4xl font-bold">{totalCO2.toFixed(1)} kg</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                        <CardContent className="p-6 text-center">
                            <TrendingUp className="h-12 w-12 mx-auto mb-3" />
                            <p className="text-sm opacity-90 mb-2">Tasks Done</p>
                            <p className="text-4xl font-bold">{completedTasks.length}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Streak Tracker */}
                <StreakTracker streak={currentStreak} />

                {/* Badges & Achievements */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Badges & Achievements</h2>
                            <span className="text-sm text-slate-600">{achievements.length}/10 earned</span>
                        </div>
                        <BadgeDisplay achievements={achievements} compact={false} />
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardContent className="p-8 text-center space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Ready to Make an Impact?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Browse available sustainability tasks, complete them, and earn NANO tokens. 
                            Each task helps offset carbon emissions and builds a greener future.
                        </p>
                        <Link to={createPageUrl('NanoTaskMarketplace')}>
                            <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                <Leaf className="h-5 w-5 mr-2" />
                                Browse Tasks
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                </div>
            </div>
        </>
    );
}