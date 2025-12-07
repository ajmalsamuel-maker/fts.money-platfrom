import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, Gift, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AILifecycleManager() {
    const [analyzing, setAnalyzing] = useState(false);
    const queryClient = useQueryClient();

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['recurring-payments-lifecycle'],
        queryFn: () => base44.entities.RecurringPayment.filter({ status: 'active' }),
    });

    const analyzeChurnMutation = useMutation({
        mutationFn: async () => {
            setAnalyzing(true);
            
            const analysisPromises = subscriptions.map(async (sub) => {
                // Call AI to analyze churn risk
                const result = await base44.integrations.Core.InvokeLLM({
                    prompt: `Analyze churn risk for this subscription:
- Customer: ${sub.customer_email}
- Amount: $${sub.amount} ${sub.currency}
- Frequency: ${sub.frequency}
- Cycles completed: ${sub.cycles_completed}
- Failed payments: ${sub.failed_payment_count}
- Total paid: $${sub.total_amount_paid}
- Last payment: ${sub.last_payment_date}

Provide churn risk score (0-1) and list 3-5 key risk factors.`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            churn_risk_score: { type: "number" },
                            risk_factors: { type: "array", items: { type: "string" } },
                            recommended_retention_offer: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    value: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        }
                    }
                });

                // Update subscription with AI insights
                if (result.churn_risk_score > 0.3) {
                    await base44.entities.RecurringPayment.update(sub.id, {
                        churn_risk_score: result.churn_risk_score,
                        churn_factors: result.risk_factors,
                        retention_offer: result.recommended_retention_offer ? {
                            type: result.recommended_retention_offer.type,
                            value: result.recommended_retention_offer.value,
                            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                            applied: false
                        } : undefined
                    });
                }
            });

            await Promise.all(analysisPromises);
            setAnalyzing(false);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-payments-lifecycle'] });
            toast.success('Churn analysis completed');
        }
    });

    const applyRetentionOfferMutation = useMutation({
        mutationFn: async ({ subscriptionId, offer }) => {
            await base44.entities.RecurringPayment.update(subscriptionId, {
                retention_offer: { ...offer, applied: true }
            });
            
            // Send email notification
            const sub = subscriptions.find(s => s.id === subscriptionId);
            if (sub) {
                await base44.integrations.Core.SendEmail({
                    to: sub.customer_email,
                    subject: 'Special Offer - We Value Your Subscription',
                    body: `
                        <h2>We'd love to keep you as a customer!</h2>
                        <p>We've noticed you've been with us for a while, and we want to show our appreciation.</p>
                        <h3>Your Special Offer: ${offer.value}</h3>
                        <p>This offer expires in 7 days. Reply to this email to claim it!</p>
                    `
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-payments-lifecycle'] });
            toast.success('Retention offer applied and sent');
        }
    });

    const highRiskSubs = subscriptions.filter(s => (s.churn_risk_score || 0) > 0.6);
    const mediumRiskSubs = subscriptions.filter(s => (s.churn_risk_score || 0) > 0.3 && (s.churn_risk_score || 0) <= 0.6);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                        AI Lifecycle Management
                    </h2>
                    <p className="text-sm text-slate-500">Predictive churn analysis and retention automation</p>
                </div>
                <Button onClick={() => analyzeChurnMutation.mutate()} disabled={analyzing}>
                    {analyzing ? 'Analyzing...' : 'Run Churn Analysis'}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">High Risk</p>
                                <p className="text-xl font-semibold">{highRiskSubs.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Medium Risk</p>
                                <p className="text-xl font-semibold">{mediumRiskSubs.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Healthy</p>
                                <p className="text-xl font-semibold">
                                    {subscriptions.length - highRiskSubs.length - mediumRiskSubs.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* At-Risk Subscriptions */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">At-Risk Subscriptions</h3>
                {[...highRiskSubs, ...mediumRiskSubs].map((sub) => (
                    <Card key={sub.id} className="border-l-4" style={{
                        borderLeftColor: (sub.churn_risk_score || 0) > 0.6 ? '#dc2626' : '#f59e0b'
                    }}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold">{sub.customer_name}</h4>
                                        <Badge className={(sub.churn_risk_score || 0) > 0.6 ? 
                                            'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }>
                                            {((sub.churn_risk_score || 0) * 100).toFixed(0)}% Risk
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-3">{sub.customer_email}</p>
                                    
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Churn Risk</span>
                                            <span className="font-semibold">
                                                {((sub.churn_risk_score || 0) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <Progress value={(sub.churn_risk_score || 0) * 100} className="h-2" />
                                    </div>

                                    {sub.churn_factors && sub.churn_factors.length > 0 && (
                                        <div className="bg-slate-50 rounded-lg p-3 mb-3">
                                            <p className="text-xs font-semibold text-slate-700 mb-2">Risk Factors:</p>
                                            <ul className="text-xs text-slate-600 space-y-1">
                                                {sub.churn_factors.map((factor, idx) => (
                                                    <li key={idx}>• {factor}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {sub.retention_offer && !sub.retention_offer.applied && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <Gift className="h-4 w-4 text-purple-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-purple-900">
                                                        Recommended Retention Offer
                                                    </p>
                                                    <p className="text-xs text-purple-700 mt-1">
                                                        {sub.retention_offer.value}
                                                    </p>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => applyRetentionOfferMutation.mutate({
                                                        subscriptionId: sub.id,
                                                        offer: sub.retention_offer
                                                    })}
                                                >
                                                    Apply Offer
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {sub.retention_offer?.applied && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            Retention Offer Applied
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {highRiskSubs.length === 0 && mediumRiskSubs.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <TrendingUp className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-2">All Subscriptions Healthy</h3>
                            <p className="text-sm text-slate-500">
                                No at-risk subscriptions detected. Run analysis to refresh insights.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}