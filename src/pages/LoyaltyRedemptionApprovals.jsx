import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Menu, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyRedemptionApprovals() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedRedemption, setSelectedRedemption] = useState(null);
    const [approvalDialog, setApprovalDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const { data: pendingRedemptions = [] } = useQuery({
        queryKey: ['pending-redemptions'],
        queryFn: async () => {
            const programIds = programs.map(p => p.id);
            if (programIds.length === 0) return [];
            const allPending = await Promise.all(
                programIds.map(id => base44.entities.TokenRedemption.filter({ 
                    program_id: id, 
                    status: 'pending_approval' 
                }))
            );
            return allPending.flat();
        },
        enabled: programs.length > 0
    });

    const { data: allParticipants = [] } = useQuery({
        queryKey: ['all-participants'],
        queryFn: async () => {
            const programIds = programs.map(p => p.id);
            if (programIds.length === 0) return [];
            const allParts = await Promise.all(
                programIds.map(id => base44.entities.LoyaltyParticipant.filter({ program_id: id }))
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
                programIds.map(id => base44.entities.RedemptionOption.filter({ program_id: id }))
            );
            return allOpts.flat();
        },
        enabled: programs.length > 0
    });

    const approveMutation = useMutation({
        mutationFn: async (redemptionId) => {
            await base44.entities.TokenRedemption.update(redemptionId, {
                status: 'approved',
                approved_by: session.admin_email,
                approved_date: new Date().toISOString()
            });
        },
        onSuccess: () => {
            toast.success('Redemption approved!');
            queryClient.invalidateQueries(['pending-redemptions']);
            setApprovalDialog(false);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ redemptionId, reason }) => {
            await base44.entities.TokenRedemption.update(redemptionId, {
                status: 'rejected',
                rejection_reason: reason,
                approved_by: session.admin_email,
                approved_date: new Date().toISOString()
            });
        },
        onSuccess: () => {
            toast.success('Redemption rejected');
            queryClient.invalidateQueries(['pending-redemptions']);
            setApprovalDialog(false);
            setRejectionReason('');
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltyRedemptionApprovals"
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Redemption Approvals</h1>
                        {pendingRedemptions.length > 0 && (
                            <Badge className="bg-orange-100 text-orange-800">{pendingRedemptions.length} pending</Badge>
                        )}
                    </div>
                </header>

                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Approvals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingRedemptions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                    <p>All caught up! No pending approvals.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRedemptions.map(redemption => {
                                        const participant = allParticipants.find(p => p.id === redemption.participant_id);
                                        const option = allOptions.find(o => o.id === redemption.redemption_option_id);
                                        const program = programs.find(p => p.id === redemption.program_id);
                                        
                                        return (
                                            <div key={redemption.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{option?.reward_name}</h3>
                                                        <p className="text-sm text-slate-600">{participant?.full_name} ({participant?.participant_email})</p>
                                                        <p className="text-sm text-slate-500">{program?.program_name}</p>
                                                    </div>
                                                    <Badge className="bg-yellow-100 text-yellow-800">
                                                        <Clock className="h-3 w-3 mr-1" />Pending
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs text-slate-500">Tokens</p>
                                                        <p className="font-semibold">{redemption.tokens_redeemed.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Requested</p>
                                                        <p className="font-semibold">{new Date(redemption.created_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => approveMutation.mutate(redemption.id)}
                                                        disabled={approveMutation.isPending}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                                        onClick={() => {
                                                            setSelectedRedemption(redemption);
                                                            setApprovalDialog(true);
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />Reject
                                                    </Button>
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

            <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Redemption</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Please provide a reason for rejection:</p>
                        <Textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Insufficient verification, reward temporarily unavailable..."
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setApprovalDialog(false)} className="flex-1">Cancel</Button>
                            <Button 
                                onClick={() => rejectMutation.mutate({ 
                                    redemptionId: selectedRedemption?.id, 
                                    reason: rejectionReason 
                                })}
                                className="flex-1 bg-red-600"
                                disabled={!rejectionReason || rejectMutation.isPending}
                            >
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}