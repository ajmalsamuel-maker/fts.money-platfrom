import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import SocialTaskCard from '@/components/social/SocialTaskCard';
import SocialLeaderboard from '@/components/social/SocialLeaderboard';
import { toast } from 'sonner';

export default function ParticipantSocialTasks() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const { data: socialTasks = [] } = useQuery({
        queryKey: ['socialTasks', session.program_id],
        queryFn: () => base44.entities.SocialTask.filter({
            program_id: session.program_id,
            is_active: true
        })
    });

    const { data: completedActivities = [] } = useQuery({
        queryKey: ['completedActivities', session.id],
        queryFn: () => base44.entities.ActivityLog.filter({
            participant_id: session.id,
            activity_type: 'social_share'
        })
    });

    const completeTaskMutation = useMutation({
        mutationFn: async (task) => {
            const newBalance = session.current_balance + Math.round(task.points_reward * task.multiplier);
            
            await Promise.all([
                base44.entities.ActivityLog.create({
                    program_id: session.program_id,
                    participant_id: session.id,
                    activity_type: task.task_type,
                    activity_description: task.task_name,
                    points_earned: Math.round(task.points_reward * task.multiplier),
                    verification_status: task.verification_method === 'auto' ? 'verified' : 'pending'
                }),
                base44.entities.LoyaltyParticipant.update(session.id, {
                    current_balance: newBalance,
                    lifetime_earned: (session.lifetime_earned || 0) + Math.round(task.points_reward * task.multiplier)
                })
            ]);

            return newBalance;
        },
        onSuccess: (newBalance) => {
            localStorage.setItem('participant_session', JSON.stringify({
                ...session,
                current_balance: newBalance
            }));
            queryClient.invalidateQueries({ queryKey: ['completedActivities', session.id] });
            queryClient.invalidateQueries({ queryKey: ['socialTasks', session.program_id] });
            toast.success('Task completed! Points awarded 🎉');
        },
        onError: () => toast.error('Failed to complete task')
    });

    const isTaskCompleted = (taskId) => {
        return completedActivities.some(activity => activity.activity_type === taskId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex">
            {/* Sidebar */}
            <aside className={cn("relative bg-white border-r flex flex-col h-screen transition-all duration-300 shadow-lg",
                sidebarOpen ? "w-64" : "w-20")}>
                <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2 text-white">
                            <Flame className="h-6 w-6" />
                            <span className="font-bold text-sm">Participant</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-purple-700 p-1 rounded">
                        {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link to="/ParticipantDashboard" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 whitespace-nowrap", !sidebarOpen && "justify-center")}>
                        <span className="font-medium text-sm">📊</span>
                        {sidebarOpen && <span>Dashboard</span>}
                    </Link>
                    <Link to="/ParticipantActivities" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 whitespace-nowrap", !sidebarOpen && "justify-center")}>
                        <span className="font-medium text-sm">📈</span>
                        {sidebarOpen && <span>Activities</span>}
                    </Link>
                    <Link to="/ParticipantRewards" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 whitespace-nowrap", !sidebarOpen && "justify-center")}>
                        <span className="font-medium text-sm">🎁</span>
                        {sidebarOpen && <span>Rewards</span>}
                    </Link>
                    <Link to="/ParticipantChallenges" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 whitespace-nowrap", !sidebarOpen && "justify-center")}>
                        <span className="font-medium text-sm">🎯</span>
                        {sidebarOpen && <span>Challenges</span>}
                    </Link>
                    <Link to="/ParticipantSocialTasks" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium whitespace-nowrap", !sidebarOpen && "justify-center")}>
                        <Flame className="h-4 w-4" />
                        {sidebarOpen && <span>Social</span>}
                    </Link>
                    <Link to="/ParticipantHelp" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 whitespace-nowrap", !sidebarOpen && "justify-center")}>
                        <span className="font-medium text-sm">❓</span>
                        {sidebarOpen && <span>Help</span>}
                    </Link>
                </nav>

                <div className="p-4 border-t flex-shrink-0">
                    <Button onClick={() => { 
                        localStorage.removeItem('participant_session'); 
                        window.location.href = '/ParticipantLogin'; 
                    }} variant="outline" className={cn("w-full text-red-600 text-xs", !sidebarOpen && "p-2")}>
                        <LogOut className="h-4 w-4" />
                        {sidebarOpen && <span className="ml-2">Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Social Tasks
                    </h1>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-indigo-600">
                            {session.current_balance?.toLocaleString() || 0} pts
                        </p>
                    </div>
                </header>

                <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
                    {/* Active Tasks */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-slate-900">Available Tasks</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {socialTasks.length > 0 ? (
                                socialTasks.map(task => (
                                    <SocialTaskCard
                                        key={task.id}
                                        task={task}
                                        onComplete={completeTaskMutation.mutate}
                                        isCompleted={isTaskCompleted(task.task_type)}
                                    />
                                ))
                            ) : (
                                <Card className="md:col-span-2">
                                    <CardContent className="py-12 text-center text-slate-500">
                                        No social tasks available right now
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div>
                        <SocialLeaderboard programId={session.program_id} />
                    </div>
                </div>
            </div>
        </div>
    );
}