import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Eye, CheckCircle, XCircle, Edit, AlertTriangle, DollarSign,
    CreditCard, User, MapPin, Clock, TrendingUp, Brain, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const OVERRIDE_REASONS = [
    'AI confidence too low',
    'Known customer - trustworthy',
    'Legitimate high-value transaction',
    'Business relationship verified',
    'Additional verification completed',
    'Policy exception approved',
    'Risk assessment incorrect',
    'Pattern is normal for this customer',
    'Other (see notes)'
];

export default function EnhancedReviewInterface() {
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [reviewAction, setReviewAction] = useState('');
    const [overrideReason, setOverrideReason] = useState('');
    const [reviewNotes, setReviewNotes] = useState('');
    const [modifiedAmount, setModifiedAmount] = useState('');
    const [reviewStartTime, setReviewStartTime] = useState(null);
    const queryClient = useQueryClient();

    const { data: flags = [] } = useQuery({
        queryKey: ['review-flags'],
        queryFn: async () => {
            const flags = await base44.entities.AIReviewFlag.filter({ status: 'pending' });
            return flags.sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
        },
    });

    const { data: decisions = [] } = useQuery({
        queryKey: ['ai-decisions-full'],
        queryFn: () => base44.entities.AIPaymentDecision.list(),
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions-full'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 100),
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ flagId, action, reason, notes, modifiedData }) => {
            const reviewDuration = reviewStartTime ? 
                Math.floor((Date.now() - reviewStartTime) / 1000) : 0;

            await base44.entities.AIReviewFlag.update(flagId, {
                status: 'resolved',
                review_decision: action,
                override_reason: reason,
                review_notes: notes,
                modified_decision: modifiedData,
                review_duration_seconds: reviewDuration,
                reviewed_by: 'current_user' // Would be actual user ID
            });

            // Update the AI decision
            const flag = flags.find(f => f.id === flagId);
            if (flag) {
                await base44.entities.AIPaymentDecision.update(flag.decision_id, {
                    outcome: action === 'approved' ? 'successful' : 'failed',
                    human_override: true,
                    override_reason: `${reason}: ${notes}`
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['review-flags'] });
            queryClient.invalidateQueries({ queryKey: ['ai-decisions-full'] });
            toast.success('Review completed');
            setSelectedFlag(null);
            resetForm();
        }
    });

    const resetForm = () => {
        setReviewAction('');
        setOverrideReason('');
        setReviewNotes('');
        setModifiedAmount('');
        setReviewStartTime(null);
    };

    const openReview = (flag) => {
        setSelectedFlag(flag);
        setReviewStartTime(Date.now());
    };

    const getDecision = (decisionId) => decisions.find(d => d.id === decisionId);
    const getTransaction = (transactionId) => transactions.find(t => t.id === transactionId);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
            default: return 'bg-blue-100 text-blue-700 border-blue-300';
        }
    };

    const getFlagReasonLabel = (reason) => {
        const labels = {
            low_confidence: 'Low AI Confidence',
            high_amount: 'High Transaction Amount',
            high_risk: 'High Risk Score',
            suspicious_pattern: 'Suspicious Pattern',
            policy_violation: 'Policy Violation',
            customer_flag: 'Customer Flagged'
        };
        return labels[reason] || reason;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Enhanced Review Queue
                    </h3>
                    <p className="text-sm text-slate-500">
                        Review AI decisions flagged for human oversight
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-red-50">
                        {flags.filter(f => f.priority === 'urgent').length} Urgent
                    </Badge>
                    <Badge variant="outline" className="bg-orange-50">
                        {flags.filter(f => f.priority === 'high').length} High
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                        {flags.length} Total
                    </Badge>
                </div>
            </div>

            {flags.length === 0 ? (
                <Card className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">No Pending Reviews</h4>
                    <p className="text-sm text-slate-500">All AI decisions are within acceptable parameters</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {flags.map((flag) => {
                        const decision = getDecision(flag.decision_id);
                        const transaction = getTransaction(flag.transaction_id);
                        
                        return (
                            <Card key={flag.id} className={`p-4 border-2 ${getPriorityColor(flag.priority)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getPriorityColor(flag.priority)}>
                                                {flag.priority}
                                            </Badge>
                                            <Badge variant="outline">
                                                {getFlagReasonLabel(flag.flag_reason)}
                                            </Badge>
                                            {transaction?.amount && (
                                                <span className="text-sm font-semibold">
                                                    ${transaction.amount}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                            <div>
                                                <p className="text-slate-500">AI Decision</p>
                                                <p className="font-semibold capitalize">{decision?.decision_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Confidence</p>
                                                <p className="font-semibold">
                                                    {decision?.confidence_score ? 
                                                        `${(decision.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Customer</p>
                                                <p className="font-semibold">{transaction?.customer_email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Risk Score</p>
                                                <p className="font-semibold">{decision?.risk_score || 'N/A'}/100</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Button size="sm" onClick={() => openReview(flag)}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Review
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={!!selectedFlag} onOpenChange={() => setSelectedFlag(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review AI Decision</DialogTitle>
                    </DialogHeader>

                    {selectedFlag && (
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="transaction">Transaction</TabsTrigger>
                                <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                                <TabsTrigger value="review">Review</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <Card className="p-4 bg-slate-50">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Flag Reason</p>
                                            <p className="font-semibold">{getFlagReasonLabel(selectedFlag.flag_reason)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Priority</p>
                                            <Badge className={getPriorityColor(selectedFlag.priority)}>
                                                {selectedFlag.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="transaction" className="space-y-4">
                                {(() => {
                                    const txn = getTransaction(selectedFlag.transaction_id);
                                    if (!txn) return <p>No transaction data</p>;
                                    
                                    return (
                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <Card className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <DollarSign className="h-8 w-8 text-green-600" />
                                                        <div>
                                                            <p className="text-xs text-slate-600">Amount</p>
                                                            <p className="text-lg font-semibold">${txn.amount}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                                <Card className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <CreditCard className="h-8 w-8 text-blue-600" />
                                                        <div>
                                                            <p className="text-xs text-slate-600">Payment Method</p>
                                                            <p className="font-semibold">{txn.payment_method}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                                <Card className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="h-8 w-8 text-purple-600" />
                                                        <div>
                                                            <p className="text-xs text-slate-600">Status</p>
                                                            <p className="font-semibold capitalize">{txn.status}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                            
                                            <Card className="p-4">
                                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                                <div className="grid md:grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-slate-600">Name</p>
                                                        <p className="font-medium">{txn.customer_name || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">Email</p>
                                                        <p className="font-medium">{txn.customer_email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">Country</p>
                                                        <p className="font-medium">{txn.customer_country || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">IP Address</p>
                                                        <p className="font-medium font-mono text-xs">{txn.ip_address || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    );
                                })()}
                            </TabsContent>

                            <TabsContent value="ai-analysis" className="space-y-4">
                                {(() => {
                                    const decision = getDecision(selectedFlag.decision_id);
                                    if (!decision) return <p>No AI decision data</p>;
                                    
                                    return (
                                        <div className="space-y-4">
                                            <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Brain className="h-6 w-6 text-purple-600" />
                                                    <h4 className="font-semibold">AI Decision Analysis</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs text-slate-600">Decision Type</p>
                                                        <p className="font-semibold capitalize">{decision.decision_type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-600">Confidence Score</p>
                                                        <p className="text-lg font-bold">
                                                            {(decision.confidence_score * 100).toFixed(1)}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-600">AI Reasoning</p>
                                                        <p className="text-sm">{decision.reasoning}</p>
                                                    </div>
                                                    {decision.factors_analyzed && (
                                                        <div>
                                                            <p className="text-xs text-slate-600 mb-1">Factors Analyzed</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {decision.factors_analyzed.map((factor, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {factor}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    );
                                })()}
                            </TabsContent>

                            <TabsContent value="review" className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Review Action *</Label>
                                        <Select value={reviewAction} onValueChange={setReviewAction}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="approved">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        <span>Approve AI Decision</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="rejected">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                        <span>Reject AI Decision</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="modified">
                                                    <div className="flex items-center gap-2">
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                        <span>Modify & Approve</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {reviewAction === 'modified' && (
                                        <div className="space-y-2">
                                            <Label>Modified Amount</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter new amount"
                                                value={modifiedAmount}
                                                onChange={(e) => setModifiedAmount(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Override Reason *</Label>
                                        <Select value={overrideReason} onValueChange={setOverrideReason}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select reason" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {OVERRIDE_REASONS.map((reason) => (
                                                    <SelectItem key={reason} value={reason}>
                                                        {reason}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Review Notes *</Label>
                                        <Textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Explain your decision and reasoning..."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedFlag(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => reviewMutation.mutate({
                                flagId: selectedFlag.id,
                                action: reviewAction,
                                reason: overrideReason,
                                notes: reviewNotes,
                                modifiedData: reviewAction === 'modified' ? { amount: modifiedAmount } : null
                            })}
                            disabled={!reviewAction || !overrideReason || !reviewNotes}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Submit Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}