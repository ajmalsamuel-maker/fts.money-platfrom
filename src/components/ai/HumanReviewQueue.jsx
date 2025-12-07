import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { 
    CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, 
    TrendingUp, TrendingDown, Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function HumanReviewQueue() {
    const [selectedDecision, setSelectedDecision] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [feedbackScore, setFeedbackScore] = useState(null);
    const queryClient = useQueryClient();

    const { data: pendingDecisions = [] } = useQuery({
        queryKey: ['pending-ai-decisions'],
        queryFn: async () => {
            const decisions = await base44.entities.AIPaymentDecision.filter({ 
                outcome: 'pending' 
            });
            return decisions.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            );
        },
    });

    const { data: agents = [] } = useQuery({
        queryKey: ['ai-agents-all'],
        queryFn: () => base44.entities.AIPaymentAgent.list(),
    });

    const reviewDecisionMutation = useMutation({
        mutationFn: async ({ decisionId, approved, notes, score }) => {
            await base44.entities.AIPaymentDecision.update(decisionId, {
                outcome: approved ? 'successful' : 'failed',
                human_override: true,
                override_reason: notes,
                feedback_score: score
            });

            // Update agent learning if feedback provided
            if (score !== null) {
                const decision = pendingDecisions.find(d => d.id === decisionId);
                if (decision) {
                    const agent = agents.find(a => a.id === decision.agent_id);
                    if (agent && agent.learning_mode) {
                        const totalDecisions = (agent.decisions_made || 0) + 1;
                        const currentAccuracy = agent.accuracy_rate || 0;
                        const newAccuracy = ((currentAccuracy * (totalDecisions - 1)) + score) / totalDecisions;
                        
                        await base44.entities.AIPaymentAgent.update(agent.id, {
                            decisions_made: totalDecisions,
                            accuracy_rate: newAccuracy,
                            last_trained: new Date().toISOString()
                        });
                    }
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-ai-decisions'] });
            queryClient.invalidateQueries({ queryKey: ['ai-agents-all'] });
            toast.success('Review completed');
            setSelectedDecision(null);
            setReviewNotes('');
            setFeedbackScore(null);
        }
    });

    const getAgent = (agentId) => agents.find(a => a.id === agentId);

    const getConfidenceColor = (score) => {
        if (score >= 0.9) return 'text-emerald-600';
        if (score >= 0.7) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Human Review Queue
                    </h3>
                    <p className="text-sm text-slate-500">
                        Review AI decisions that require human oversight
                    </p>
                </div>
                <Badge variant="outline" className="bg-blue-50">
                    {pendingDecisions.length} Pending
                </Badge>
            </div>

            {pendingDecisions.length === 0 ? (
                <Card className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">All Clear!</h4>
                    <p className="text-sm text-slate-500">No AI decisions require human review at this time</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {pendingDecisions.map((decision) => {
                        const agent = getAgent(decision.agent_id);
                        return (
                            <Card key={decision.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge className={
                                                decision.decision_type === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                                                decision.decision_type === 'decline' ? 'bg-red-100 text-red-700' :
                                                decision.decision_type === 'flag' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }>
                                                {decision.decision_type}
                                            </Badge>
                                            <span className={`text-sm font-semibold ${getConfidenceColor(decision.confidence_score)}`}>
                                                {(decision.confidence_score * 100).toFixed(0)}% confidence
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {agent?.name || 'Unknown Agent'}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-slate-700 mb-2">{decision.reasoning}</p>

                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            {decision.amount && (
                                                <span>Amount: ${decision.amount}</span>
                                            )}
                                            {decision.risk_score !== null && (
                                                <span>Risk: {decision.risk_score}/100</span>
                                            )}
                                            {decision.execution_time_ms && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {decision.execution_time_ms}ms
                                                </span>
                                            )}
                                        </div>

                                        {decision.factors_analyzed && decision.factors_analyzed.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {decision.factors_analyzed.map((factor, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {factor}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button 
                                        size="sm"
                                        onClick={() => setSelectedDecision(decision)}
                                    >
                                        Review
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review AI Decision</DialogTitle>
                    </DialogHeader>

                    {selectedDecision && (
                        <div className="space-y-4">
                            <Card className="p-4 bg-slate-50">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-600">Decision Type</p>
                                        <p className="font-semibold capitalize">{selectedDecision.decision_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">AI Reasoning</p>
                                        <p className="text-sm">{selectedDecision.reasoning}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Confidence Score</p>
                                        <p className={`font-semibold ${getConfidenceColor(selectedDecision.confidence_score)}`}>
                                            {(selectedDecision.confidence_score * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Review Notes</label>
                                <Textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add notes about your review decision..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rate AI Decision Quality (Optional)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <Button
                                            key={score}
                                            variant={feedbackScore === score ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFeedbackScore(score === feedbackScore ? null : score)}
                                        >
                                            {score}
                                        </Button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">1 = Poor, 5 = Excellent (helps AI learn)</p>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedDecision(null);
                                        setReviewNotes('');
                                        setFeedbackScore(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                    onClick={() => reviewDecisionMutation.mutate({
                                        decisionId: selectedDecision.id,
                                        approved: false,
                                        notes: reviewNotes,
                                        score: feedbackScore
                                    })}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => reviewDecisionMutation.mutate({
                                        decisionId: selectedDecision.id,
                                        approved: true,
                                        notes: reviewNotes,
                                        score: feedbackScore
                                    })}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}