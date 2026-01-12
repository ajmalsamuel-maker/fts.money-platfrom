import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Target, Calendar, Award, Plus, Menu, X, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyChallenges() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const [newChallenge, setNewChallenge] = useState({
        program_id: '',
        challenge_name: '',
        challenge_description: '',
        challenge_type: 'activity_count',
        target_value: 5,
        bonus_points: 100,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    React.useEffect(() => {
        if (!session.id || !session.admin_email) {
            window.location.href = '/LoyaltyCustomerLogin';
        }
    }, [session]);

    if (!session.id) return null;

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session?.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email }),
        enabled: !!(session?.admin_email)
    });

    const { data: challenges = [] } = useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            if (programs.length === 0) return [];
            const allChallenges = [];
            for (const program of programs) {
                const c = await base44.entities.LoyaltyChallenge.filter({ program_id: program.id }, '-created_date');
                allChallenges.push(...c);
            }
            return allChallenges;
        },
        enabled: programs.length > 0
    });

    const createChallengeMutation = useMutation({
        mutationFn: async () => {
            const now = new Date();
            const startDate = new Date(newChallenge.start_date);
            const status = startDate <= now ? 'active' : 'upcoming';
            
            return base44.entities.LoyaltyChallenge.create({
                ...newChallenge,
                program_id: newChallenge.program_id || programs[0]?.id,
                status
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['challenges']);
            toast.success('Challenge created successfully!');
            setCreateDialogOpen(false);
            setNewChallenge({
                program_id: '',
                challenge_name: '',
                challenge_description: '',
                challenge_type: 'activity_count',
                target_value: 5,
                bonus_points: 100,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }
    });

    const getStatusColor = (status) => {
        const colors = {
            upcoming: 'bg-blue-100 text-blue-700',
            active: 'bg-emerald-100 text-emerald-700',
            completed: 'bg-slate-100 text-slate-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-slate-100';
    };

    const getChallengeTypeLabel = (type) => {
        const labels = {
            activity_count: 'Complete Activities',
            points_target: 'Earn Points',
            streak: 'Maintain Streak',
            specific_activity: 'Specific Activity'
        };
        return labels[type] || type;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen md:h-auto transform transition-transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <span className="font-bold">Challenges</span>
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
                    <a href="/LoyaltyLeaderboards" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        Leaderboards
                    </a>
                    <a href="/LoyaltyChallenges" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        Challenges
                    </a>
                </nav>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">Challenges</h1>
                            <p className="text-xs text-slate-600">Create time-bound engagement challenges</p>
                        </div>
                    </div>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-purple-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Challenge
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Challenge</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Program</Label>
                                    <Select value={newChallenge.program_id} onValueChange={(v) => setNewChallenge({...newChallenge, program_id: v})}>
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
                                    <Label>Challenge Name</Label>
                                    <Input value={newChallenge.challenge_name} onChange={(e) => setNewChallenge({...newChallenge, challenge_name: e.target.value})} 
                                        placeholder="5 Activities This Week" />
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Textarea value={newChallenge.challenge_description} onChange={(e) => setNewChallenge({...newChallenge, challenge_description: e.target.value})} 
                                        placeholder="Complete 5 activities this week to earn bonus points!" rows={3} />
                                </div>

                                <div>
                                    <Label>Challenge Type</Label>
                                    <Select value={newChallenge.challenge_type} onValueChange={(v) => setNewChallenge({...newChallenge, challenge_type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activity_count">Complete X Activities</SelectItem>
                                            <SelectItem value="points_target">Earn X Points</SelectItem>
                                            <SelectItem value="streak">Maintain X Day Streak</SelectItem>
                                            <SelectItem value="specific_activity">Complete Specific Activity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Target Value</Label>
                                        <Input type="number" value={newChallenge.target_value} onChange={(e) => setNewChallenge({...newChallenge, target_value: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <Label>Bonus Points</Label>
                                        <Input type="number" value={newChallenge.bonus_points} onChange={(e) => setNewChallenge({...newChallenge, bonus_points: Number(e.target.value)})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Start Date</Label>
                                        <Input type="date" value={newChallenge.start_date} onChange={(e) => setNewChallenge({...newChallenge, start_date: e.target.value})} />
                                    </div>
                                    <div>
                                        <Label>End Date</Label>
                                        <Input type="date" value={newChallenge.end_date} onChange={(e) => setNewChallenge({...newChallenge, end_date: e.target.value})} />
                                    </div>
                                </div>

                                <Button onClick={() => createChallengeMutation.mutate()} className="w-full bg-purple-600" disabled={createChallengeMutation.isPending}>
                                    {createChallengeMutation.isPending ? 'Creating...' : 'Create Challenge'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <Target className="h-8 w-8 text-blue-600 mb-2" />
                                <p className="text-sm text-slate-600">Active Challenges</p>
                                <p className="text-3xl font-bold">{challenges.filter(c => c.status === 'active').length}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Award className="h-8 w-8 text-purple-600 mb-2" />
                                <p className="text-sm text-slate-600">Total Completions</p>
                                <p className="text-3xl font-bold">{challenges.reduce((sum, c) => sum + (c.completions_count || 0), 0)}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Zap className="h-8 w-8 text-amber-600 mb-2" />
                                <p className="text-sm text-slate-600">Upcoming</p>
                                <p className="text-3xl font-bold">{challenges.filter(c => c.status === 'upcoming').length}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Challenges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {challenges.length === 0 ? (
                                <div className="text-center py-12">
                                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">No challenges created yet</p>
                                    <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Challenge
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {challenges.map((challenge) => (
                                        <Card key={challenge.id} className="border-l-4 border-l-purple-500">
                                            <CardContent className="p-4">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-bold">{challenge.challenge_name}</h3>
                                                            <Badge className={getStatusColor(challenge.status)}>
                                                                {challenge.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-3">{challenge.challenge_description}</p>
                                                        <div className="flex flex-wrap gap-4 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Target className="h-4 w-4 text-purple-600" />
                                                                <span className="font-medium">{getChallengeTypeLabel(challenge.challenge_type)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Zap className="h-4 w-4 text-amber-600" />
                                                                <span>Target: {challenge.target_value}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Award className="h-4 w-4 text-emerald-600" />
                                                                <span>{challenge.bonus_points} bonus points</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                                <span>{new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center md:text-right">
                                                        <p className="text-2xl font-bold text-purple-600">{challenge.completions_count || 0}</p>
                                                        <p className="text-xs text-slate-600">completions</p>
                                                        <p className="text-sm text-slate-500 mt-1">{challenge.participants_count || 0} participating</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
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