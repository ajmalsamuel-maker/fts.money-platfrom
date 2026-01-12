import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Users, Activity, Settings, LogOut, Menu, X, Target, ShoppingBag, Clock, CheckCircle2, XCircle, Package, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyRedemptionCatalog() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [redeemDialog, setRedeemDialog] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const { data: participants = [] } = useQuery({
        queryKey: ['participants', session.admin_email],
        queryFn: async () => {
            const programIds = programs.map(p => p.id);
            if (programIds.length === 0) return [];
            const allParts = await Promise.all(
                programIds.map(id => base44.entities.LoyaltyParticipant.filter({ program_id: id, participant_email: session.admin_email }))
            );
            return allParts.flat();
        },
        enabled: programs.length > 0
    });

    const { data: allOptions = [] } = useQuery({
        queryKey: ['redemption-options'],
        queryFn: async () => {
            const programIds = programs.map(p => p.id);
            if (programIds.length === 0) return [];
            const allOpts = await Promise.all(
                programIds.map(id => base44.entities.RedemptionOption.filter({ program_id: id, is_active: true }))
            );
            return allOpts.flat();
        },
        enabled: programs.length > 0
    });

    const { data: myRedemptions = [] } = useQuery({
        queryKey: ['my-redemptions', session.admin_email],
        queryFn: async () => {
            const programIds = programs.map(p => p.id);
            if (programIds.length === 0) return [];
            const allRedemptions = await Promise.all(
                programIds.map(id => base44.entities.TokenRedemption.filter({ program_id: id }))
            );
            return allRedemptions.flat();
        },
        enabled: programs.length > 0
    });

    const redeemMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('processTokenRedemption', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Redemption submitted successfully!');
            queryClient.invalidateQueries(['my-redemptions']);
            setRedeemDialog(false);
        },
        onError: (error) => {
            toast.error(error.message || 'Redemption failed');
        }
    });

    const handleRedeem = () => {
        if (!selectedReward) return;
        redeemMutation.mutate({
            program_id: selectedReward.program_id,
            redemption_option_id: selectedReward.id,
            participant_email: session.admin_email
        });
    };

    const loadAISuggestions = async () => {
        if (participants.length === 0 || programs.length === 0) return;
        
        setLoadingSuggestions(true);
        try {
            const response = await base44.functions.invoke('suggestPersonalizedRewards', {
                participant_id: participants[0].id,
                program_id: programs[0].id
            });
            setAiSuggestions(response.data.suggestions || []);
            toast.success('AI recommendations loaded!');
        } catch (error) {
            toast.error('Failed to load suggestions');
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending_approval: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
            processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
            fulfilled: { color: 'bg-green-100 text-green-800', label: 'Fulfilled' },
            cancelled: { color: 'bg-slate-100 text-slate-800', label: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.pending_approval;
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            <aside className={cn("fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
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
                    <a href="/LoyaltyCustomerPortal" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Activity className="h-4 w-4 inline mr-2" />Overview
                    </a>
                    <a href="/LoyaltyLeaderboards" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4 inline mr-2" />Leaderboards
                    </a>
                    <a href="/LoyaltyChallenges" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Target className="h-4 w-4 inline mr-2" />Challenges
                    </a>
                    <a href="/LoyaltyRedemptionCatalog" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <ShoppingBag className="h-4 w-4 inline mr-2" />Redemption Catalog
                    </a>
                    <a href="/LoyaltyTokenManager" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Activity className="h-4 w-4 inline mr-2" />Blockchain Tokens
                    </a>
                    <a href="#settings" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Settings className="h-4 w-4 inline mr-2" />Settings
                    </a>
                </nav>

                <div className="p-4 border-t">
                    <Button onClick={() => { localStorage.removeItem('loyalty_customer_session'); window.location.href = '/LoyaltyCustomerLogin'; }} 
                        variant="outline" className="w-full text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />Logout
                    </Button>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Redemption Catalog</h1>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* AI Suggestions */}
                    {aiSuggestions.length > 0 && (
                        <Card className="border-purple-200 bg-purple-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    AI Recommended For You
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {aiSuggestions.slice(0, 3).map(suggestion => {
                                        const reward = allOptions.find(r => r.id === suggestion.reward_id);
                                        if (!reward) return null;
                                        return (
                                            <Card key={suggestion.reward_id} className="bg-white border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                                                setSelectedReward(reward);
                                                setRedeemDialog(true);
                                            }}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <Sparkles className="h-6 w-6 text-purple-600" />
                                                        <Badge className="bg-purple-100 text-purple-800">{suggestion.relevance_score}% match</Badge>
                                                    </div>
                                                    <h3 className="font-semibold mb-1">{reward.reward_name}</h3>
                                                    <p className="text-xs text-purple-700 mb-2">{suggestion.personalized_reason}</p>
                                                    <p className="text-sm font-bold text-purple-600">{reward.points_required.toLocaleString()} tokens</p>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Available Rewards */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Available Rewards</CardTitle>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={loadAISuggestions}
                                    disabled={loadingSuggestions}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {loadingSuggestions ? 'Loading...' : 'Get AI Suggestions'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allOptions.map(option => {
                                    const program = programs.find(p => p.id === option.program_id);
                                    return (
                                        <Card key={option.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                                            setSelectedReward(option);
                                            setRedeemDialog(true);
                                        }}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <Package className="h-8 w-8 text-purple-600" />
                                                    <Badge>{option.reward_type}</Badge>
                                                </div>
                                                <h3 className="font-semibold mb-1">{option.reward_name}</h3>
                                                <p className="text-sm text-slate-600 mb-3">{option.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-slate-500">Cost</p>
                                                        <p className="font-bold text-purple-600">{option.points_required.toLocaleString()} tokens</p>
                                                    </div>
                                                    {option.inventory_available > 0 && option.inventory_available !== -1 && (
                                                        <Badge variant="outline">{option.inventory_available} left</Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* My Redemptions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Redemptions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myRedemptions.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                    <p>No redemptions yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myRedemptions.map(redemption => {
                                        const option = allOptions.find(o => o.id === redemption.redemption_option_id);
                                        return (
                                            <div key={redemption.id} className="border rounded-lg p-4 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{option?.reward_name}</h4>
                                                    <p className="text-sm text-slate-600">{redemption.tokens_redeemed.toLocaleString()} tokens</p>
                                                    <p className="text-xs text-slate-500">{new Date(redemption.created_date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(redemption.status)}
                                                    {redemption.rejection_reason && (
                                                        <p className="text-xs text-red-600 mt-1">{redemption.rejection_reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={redeemDialog} onOpenChange={setRedeemDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Redemption</DialogTitle>
                    </DialogHeader>
                    {selectedReward && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{selectedReward.reward_name}</h3>
                                <p className="text-sm text-slate-600">{selectedReward.description}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-600">Token Cost</p>
                                <p className="text-2xl font-bold text-purple-600">{selectedReward.points_required.toLocaleString()}</p>
                            </div>
                            {selectedReward.points_required >= 10000 && (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                    <p className="text-sm text-yellow-800">⚠️ This redemption requires admin approval</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setRedeemDialog(false)} className="flex-1">Cancel</Button>
                                <Button onClick={handleRedeem} className="flex-1 bg-purple-600" disabled={redeemMutation.isPending}>
                                    {redeemMutation.isPending ? 'Processing...' : 'Confirm Redemption'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}