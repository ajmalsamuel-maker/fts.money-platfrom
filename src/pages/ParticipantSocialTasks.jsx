import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from 'lucide-react';
import SocialTaskCard from '@/components/social/SocialTaskCard';
import SocialLeaderboard from '@/components/social/SocialLeaderboard';
import ParticipantSidebar from '@/components/participant/ParticipantSidebar';
import { toast } from 'sonner';

export default function ParticipantSocialTasks() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const filterParam = searchParams.get('filter') || 'all';

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

    const filteredTasks = useMemo(() => {
        if (filterParam === 'all') return socialTasks;
        return socialTasks.filter(task => task.task_type === filterParam);
    }, [socialTasks, filterParam]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex">
            <ParticipantSidebar />

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
                        <h2 className="text-xl font-bold mb-4 text-slate-900">
                            {filterParam === 'all' ? 'Available Tasks' : `${filterParam.replace('_', ' ').toUpperCase()} Tasks`}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => (
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