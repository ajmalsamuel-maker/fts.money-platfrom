import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, ShoppingBag, Menu } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import ParticipantSidebar from '@/components/participant/ParticipantSidebar';

export default function ParticipantRewards() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [redeemDialog, setRedeemDialog] = useState(false);
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const { data: rewards = [] } = useQuery({
        queryKey: ['rewards', session.program_id],
        queryFn: () => base44.entities.RedemptionOption.filter({ 
            program_id: session.program_id,
            is_active: true 
        })
    });

    const redeemMutation = useMutation({
        mutationFn: async (rewardId) => {
            const reward = rewards.find(r => r.id === rewardId);
            if (session.current_balance < reward.points_required) {
                throw new Error('Insufficient balance');
            }
            
            await base44.entities.TokenRedemption.create({
                program_id: session.program_id,
                participant_id: session.id,
                redemption_option_id: rewardId,
                tokens_redeemed: reward.points_required,
                status: reward.fulfillment_method === 'manual' ? 'pending_approval' : 'processing'
            });

            // Update participant balance
            await base44.entities.LoyaltyParticipant.update(session.id, {
                current_balance: session.current_balance - reward.points_required,
                lifetime_redeemed: (session.lifetime_redeemed || 0) + reward.points_required
            });
        },
        onSuccess: () => {
            toast.success('Redemption successful!');
            queryClient.invalidateQueries(['rewards']);
            setRedeemDialog(false);
            // Update session
            const updatedSession = { 
                ...session, 
                current_balance: session.current_balance - selectedReward.points_required 
            };
            localStorage.setItem('participant_session', JSON.stringify(updatedSession));
            window.location.reload();
        },
        onError: (error) => {
            toast.error(error.message || 'Redemption failed');
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
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
                    <p className="text-xs text-slate-600">Your Balance</p>
                    <p className="text-2xl font-bold text-purple-600">{session.current_balance?.toLocaleString()}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/ParticipantDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4" />Dashboard
                    </a>
                    <a href="/ParticipantActivities" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <TrendingUp className="h-4 w-4" />My Activities
                    </a>
                    <a href="/ParticipantRewards" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <Gift className="h-4 w-4" />Redeem Rewards
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
                    <h1 className="text-lg font-semibold">Rewards Catalog</h1>
                </header>

                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rewards.map(reward => {
                            const canAfford = session.current_balance >= reward.points_required;
                            return (
                                <Card key={reward.id} className={cn("overflow-hidden", !canAfford && "opacity-60")}>
                                    {reward.image_url && (
                                        <img src={reward.image_url} alt={reward.reward_name} className="w-full h-48 object-cover" />
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-base">{reward.reward_name}</CardTitle>
                                        <Badge className="w-fit">{reward.reward_type}</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 mb-4">{reward.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-purple-600 font-bold text-lg">
                                                <Coins className="h-5 w-5" />
                                                {reward.points_required.toLocaleString()}
                                            </div>
                                            <Button 
                                                size="sm" 
                                                disabled={!canAfford}
                                                onClick={() => {
                                                    setSelectedReward(reward);
                                                    setRedeemDialog(true);
                                                }}
                                            >
                                                <ShoppingBag className="h-4 w-4 mr-1" />Redeem
                                            </Button>
                                        </div>
                                        {!canAfford && (
                                            <p className="text-xs text-red-600 mt-2">Need {(reward.points_required - session.current_balance).toLocaleString()} more points</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Dialog open={redeemDialog} onOpenChange={setRedeemDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Redemption</DialogTitle>
                    </DialogHeader>
                    {selectedReward && (
                        <div className="space-y-4">
                            <p className="text-sm">You are about to redeem:</p>
                            <div className="border rounded-lg p-4">
                                <p className="font-semibold">{selectedReward.reward_name}</p>
                                <p className="text-sm text-slate-600 mt-1">{selectedReward.description}</p>
                                <div className="flex items-center gap-1 text-purple-600 font-bold mt-3">
                                    <Coins className="h-5 w-5" />
                                    {selectedReward.points_required.toLocaleString()} points
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">
                                Your new balance will be: <span className="font-semibold">{(session.current_balance - selectedReward.points_required).toLocaleString()}</span>
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setRedeemDialog(false)} className="flex-1">Cancel</Button>
                                <Button onClick={() => redeemMutation.mutate(selectedReward.id)} className="flex-1 bg-purple-600" disabled={redeemMutation.isPending}>
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}