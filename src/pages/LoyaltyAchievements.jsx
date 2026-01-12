import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Menu, X, Plus, Award, Pencil, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyAchievements() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [achievementDialog, setAchievementDialog] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState(null);
    const [formData, setFormData] = useState({
        achievement_name: '',
        achievement_type: 'milestone',
        description: '',
        badge_image_url: '',
        bonus_points_awarded: 0,
        is_active: true
    });
    const queryClient = useQueryClient();

    const [selectedProgram, setSelectedProgram] = useState('');

    React.useEffect(() => {
        if (!session?.admin_email) {
            window.location.href = '/LoyaltyCustomerLogin';
        }
    }, [session?.admin_email]);

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session?.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email }),
        enabled: !!(session?.admin_email)
    });

    React.useEffect(() => {
        if (programs.length > 0 && !selectedProgram) {
            setSelectedProgram(programs[0].id);
        }
    }, [programs, selectedProgram]);

    if (!session?.admin_email) return null;

    const { data: achievements = [] } = useQuery({
        queryKey: ['achievements', selectedProgram],
        queryFn: () => base44.entities.LoyaltyAchievement.filter({ program_id: selectedProgram }),
        enabled: !!selectedProgram
    });

    const createAchievementMutation = useMutation({
        mutationFn: (data) => base44.entities.LoyaltyAchievement.create(data),
        onSuccess: () => {
            toast.success('Badge created!');
            queryClient.invalidateQueries(['achievements']);
            setAchievementDialog(false);
            resetForm();
        }
    });

    const updateAchievementMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.LoyaltyAchievement.update(id, data),
        onSuccess: () => {
            toast.success('Badge updated!');
            queryClient.invalidateQueries(['achievements']);
            setAchievementDialog(false);
            resetForm();
        }
    });

    const deleteAchievementMutation = useMutation({
        mutationFn: (id) => base44.entities.LoyaltyAchievement.delete(id),
        onSuccess: () => {
            toast.success('Badge deleted');
            queryClient.invalidateQueries(['achievements']);
        }
    });

    const resetForm = () => {
        setEditingAchievement(null);
        setFormData({
            achievement_name: '',
            achievement_type: 'milestone',
            description: '',
            badge_image_url: '',
            bonus_points_awarded: 0,
            is_active: true
        });
    };

    const handleEdit = (achievement) => {
        setEditingAchievement(achievement);
        setFormData({
            achievement_name: achievement.achievement_name,
            achievement_type: achievement.achievement_type,
            description: achievement.description || '',
            badge_image_url: achievement.badge_image_url || '',
            bonus_points_awarded: achievement.bonus_points_awarded || 0,
            is_active: achievement.is_active
        });
        setAchievementDialog(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, program_id: selectedProgram };
        
        if (editingAchievement) {
            updateAchievementMutation.mutate({ id: editingAchievement.id, data });
        } else {
            createAchievementMutation.mutate(data);
        }
    };

    const badgeEmojis = {
        milestone: '🏆',
        streak: '🔥',
        challenge: '⚡',
        special: '⭐'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen md:h-auto transform transition-transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <span className="font-bold">Loyalty Portal</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600">Organization</p>
                    <p className="font-semibold">{session.organization_name}</p>
                    <Badge className="mt-2 capitalize">{session.subscription_tier}</Badge>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/LoyaltyCustomerPortal" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Overview</a>
                    <a href="/LoyaltyAchievements" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <Award className="h-4 w-4 inline mr-2" />Badges & Achievements
                    </a>
                    <a href="/LoyaltyTierManagement" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Tier Management</a>
                    <a href="/LoyaltyEarningRules" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Earning Rules</a>
                    <a href="/LoyaltyRewardsCatalog" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Rewards Catalog</a>
                </nav>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Badges & Achievements</h1>
                    </div>
                    <Button onClick={() => { resetForm(); setAchievementDialog(true); }} className="bg-purple-600">
                        <Plus className="h-4 w-4 mr-2" />Create Badge
                    </Button>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievement Badges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {achievements.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Award className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                    <p>No badges created yet</p>
                                    <Button onClick={() => { resetForm(); setAchievementDialog(true); }} className="mt-4" variant="outline">
                                        Create First Badge
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {achievements.map(achievement => (
                                        <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                                            <CardContent className="p-4 text-center">
                                                <div className="text-5xl mb-3">
                                                    {achievement.badge_image_url || badgeEmojis[achievement.achievement_type]}
                                                </div>
                                                <h3 className="font-semibold mb-1">{achievement.achievement_name}</h3>
                                                <Badge className="mb-2">{achievement.achievement_type}</Badge>
                                                <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                                                {achievement.bonus_points_awarded > 0 && (
                                                    <Badge className="bg-green-100 text-green-800 mb-3">
                                                        +{achievement.bonus_points_awarded} pts
                                                    </Badge>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(achievement)} className="flex-1">
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteAchievementMutation.mutate(achievement.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
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

            <Dialog open={achievementDialog} onOpenChange={setAchievementDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingAchievement ? 'Edit' : 'Create'} Badge</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Badge Name</Label>
                            <Input value={formData.achievement_name} onChange={(e) => setFormData({...formData, achievement_name: e.target.value})} placeholder="e.g., First Event" required />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select value={formData.achievement_type} onValueChange={(v) => setFormData({...formData, achievement_type: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="milestone">Milestone</SelectItem>
                                    <SelectItem value="streak">Streak</SelectItem>
                                    <SelectItem value="challenge">Challenge</SelectItem>
                                    <SelectItem value="special">Special</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                        </div>
                        <div>
                            <Label>Badge Icon (emoji or URL)</Label>
                            <Input value={formData.badge_image_url} onChange={(e) => setFormData({...formData, badge_image_url: e.target.value})} placeholder="🏆 or https://..." />
                        </div>
                        <div>
                            <Label>Bonus Points</Label>
                            <Input type="number" value={formData.bonus_points_awarded} onChange={(e) => setFormData({...formData, bonus_points_awarded: Number(e.target.value)})} />
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setAchievementDialog(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" className="flex-1 bg-purple-600">{editingAchievement ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}