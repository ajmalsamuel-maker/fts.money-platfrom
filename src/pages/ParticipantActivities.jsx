import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Menu, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import ParticipantSidebar from '@/components/participant/ParticipantSidebar';

export default function ParticipantActivities() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const { data: activities = [] } = useQuery({
        queryKey: ['my-activities', session.id],
        queryFn: () => base44.entities.ActivityLog.filter({ participant_id: session.id })
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform shadow-xl md:shadow-none",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-purple-600 to-blue-600">
                    <div className="flex items-center gap-2 text-white">
                        <Trophy className="h-6 w-6" />
                        <span className="font-bold text-sm">My Rewards</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600">Welcome</p>
                    <p className="font-semibold truncate">{session.full_name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/ParticipantDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4" />Dashboard
                    </a>
                    <a href="/ParticipantActivities" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <TrendingUp className="h-4 w-4" />My Activities
                    </a>
                    <a href="/ParticipantRewards" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <TrendingUp className="h-4 w-4" />Redeem Rewards
                    </a>
                    <a href="/ParticipantChallenges" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Target className="h-4 w-4" />Challenges
                    </a>
                    <a href="/ParticipantHelp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <HelpCircle className="h-4 w-4" />Help & FAQ
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

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center px-4 md:px-6 sticky top-0 z-10">
                    <Button variant="ghost" size="icon" className="md:hidden mr-3" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">My Activities</h1>
                </header>

                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activities.length === 0 ? (
                                <div className="text-center py-12">
                                    <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No activities yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Start earning points by completing activities!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map(activity => (
                                        <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className="capitalize">{activity.activity_type}</Badge>
                                                        {activity.verification_status === 'verified' && (
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                    <p className="font-medium">{activity.activity_description}</p>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        {activity.units_completed} {activity.activity_type === 'steps' ? 'steps' : 'units'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Date(activity.created_date).toLocaleDateString('en-HK', { 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric' 
                                                        })}
                                                    </p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800 text-base">
                                                    +{activity.points_earned}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}