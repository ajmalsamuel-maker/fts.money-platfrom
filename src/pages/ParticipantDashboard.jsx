import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Target, TrendingUp, Menu } from 'lucide-react';
import { cn } from "@/lib/utils";
import ParticipantSidebar from '@/components/participant/ParticipantSidebar';

export default function ParticipantDashboard() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const { data: program } = useQuery({
        queryKey: ['program', session.program_id],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ id: session.program_id }).then(r => r[0])
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['my-activities', session.id],
        queryFn: () => base44.entities.ActivityLog.filter({ participant_id: session.id })
    });

    const { data: redemptions = [] } = useQuery({
        queryKey: ['my-redemptions', session.id],
        queryFn: () => base44.entities.TokenRedemption.filter({ participant_id: session.id })
    });

    const tierColors = {
        bronze: 'bg-orange-100 text-orange-800',
        silver: 'bg-slate-200 text-slate-800',
        gold: 'bg-yellow-100 text-yellow-800',
        platinum: 'bg-purple-100 text-purple-800'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex">
            <ParticipantSidebar />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">My Dashboard</h1>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Balance Card */}
                    <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Your Balance</p>
                                    <p className="text-5xl font-bold mt-2">{session.current_balance?.toLocaleString() || 0}</p>
                                    <p className="text-purple-200 text-sm mt-1">{program?.token_name || 'Points'}</p>
                                </div>
                                <Coins className="h-20 w-20 text-purple-300 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <TrendingUp className="h-8 w-8 text-emerald-600 mb-2" />
                                <p className="text-sm text-slate-600">Total Earned</p>
                                <p className="text-3xl font-bold">{session.lifetime_earned?.toLocaleString() || 0}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Gift className="h-8 w-8 text-purple-600 mb-2" />
                                <p className="text-sm text-slate-600">Redeemed</p>
                                <p className="text-3xl font-bold">{session.lifetime_redeemed?.toLocaleString() || 0}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Target className="h-8 w-8 text-blue-600 mb-2" />
                                <p className="text-sm text-slate-600">Current Streak</p>
                                <p className="text-3xl font-bold">{session.streak_days || 0} days</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activities.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No activities yet. Start earning points!</p>
                            ) : (
                                <div className="space-y-3">
                                    {activities.slice(0, 5).map(activity => (
                                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{activity.activity_type}</p>
                                                <p className="text-xs text-slate-600">{new Date(activity.created_date).toLocaleDateString()}</p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">+{activity.points_earned}</Badge>
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