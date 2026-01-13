import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Menu, X, LogOut, TrendingUp, Calendar, HelpCircle, Gift } from 'lucide-react';
import { cn } from "@/lib/utils";
import ParticipantSidebar from '@/components/participant/ParticipantSidebar';

export default function ParticipantChallenges() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const { data: challenges = [] } = useQuery({
        queryKey: ['challenges', session.program_id],
        queryFn: () => base44.entities.LoyaltyChallenge.filter({ 
            program_id: session.program_id,
            status: 'active'
        })
    });

    const { data: myParticipations = [] } = useQuery({
        queryKey: ['my-challenges', session.id],
        queryFn: () => base44.entities.ChallengeParticipant.filter({ 
            participant_id: session.id
        })
    });

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        upcoming: 'bg-blue-100 text-blue-800',
        completed: 'bg-slate-100 text-slate-800'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex">
            <ParticipantSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} session={session} />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center px-4 md:px-6 sticky top-0 z-10">
                    <Button variant="ghost" size="icon" className="md:hidden mr-3" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Challenges</h1>
                </header>

                <div className="p-4 md:p-6">
                    {challenges.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No active challenges</p>
                                <p className="text-sm text-slate-400 mt-1">Check back soon for new challenges!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {challenges.map(challenge => {
                                const myProgress = myParticipations.find(p => p.challenge_id === challenge.id);
                                const progress = myProgress ? (myProgress.current_progress / challenge.target_value) * 100 : 0;

                                return (
                                    <Card key={challenge.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{challenge.challenge_name}</CardTitle>
                                                    <Badge className={cn("mt-2", statusColors[challenge.status])}>
                                                        {challenge.status}
                                                    </Badge>
                                                </div>
                                                <Target className="h-8 w-8 text-purple-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-slate-600 mb-4">{challenge.challenge_description}</p>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Progress</span>
                                                        <span className="font-semibold">
                                                            {myProgress?.current_progress || 0} / {challenge.target_value}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-purple-600 h-2 rounded-full transition-all" 
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1 text-slate-600">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(challenge.end_date).toLocaleDateString('en-HK')}
                                                    </div>
                                                    {challenge.bonus_points > 0 && (
                                                        <Badge className="bg-yellow-100 text-yellow-800">
                                                            +{challenge.bonus_points} bonus points
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}