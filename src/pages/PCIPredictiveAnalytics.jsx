import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, Target, AlertCircle, Sparkles, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIPredictiveAnalytics() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [generating, setGenerating] = useState(false);

    const { data: predictions } = useQuery({
        queryKey: ['predictions'],
        queryFn: () => base44.entities.PCIPredictiveAnalytics.list('-created_date', 50),
        enabled: !loading
    });

    const runAnalysisMutation = useMutation({
        mutationFn: () => base44.functions.invoke('predictiveAnalysis', {}),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['predictions']);
            toast.success('Predictive analysis completed');
        },
        onError: () => {
            toast.error('Analysis failed');
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const riskConfig = {
        low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIPredictiveAnalytics"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Brain className="h-6 w-6 text-purple-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Predictive Analytics</h1>
                        </div>
                        <p className="text-slate-600">AI-powered compliance forecasting and risk predictions</p>
                    </div>

                    {/* Action */}
                    <Button 
                        onClick={() => runAnalysisMutation.mutate()}
                        disabled={runAnalysisMutation.isPending}
                        size="lg"
                    >
                        <Sparkles className="h-5 w-5 mr-2" />
                        {runAnalysisMutation.isPending ? 'Analyzing... (30-60s)' : 'Run AI Analysis'}
                    </Button>

                    {/* Predictions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {predictions?.map((pred) => {
                            const config = riskConfig[pred.risk_level] || riskConfig.medium;
                            
                            return (
                                <Card key={pred.id} className={`border-2 ${config.border}`}>
                                    <CardHeader className={config.bg}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    {pred.prediction_type === 'compliance_score' && <TrendingUp className="h-5 w-5" />}
                                                    {pred.prediction_type === 'audit_readiness' && <Target className="h-5 w-5" />}
                                                    {pred.prediction_type === 'gap_forecast' && <AlertCircle className="h-5 w-5" />}
                                                    {pred.prediction_type.replace(/_/g, ' ').toUpperCase()}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {pred.requirement_number && `Requirement ${pred.requirement_number} • `}
                                                    {new Date(pred.prediction_date).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline">{pred.confidence_score}% confidence</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-slate-600 mb-1">Current State</p>
                                                <p className="text-lg font-semibold">{pred.current_value}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600 mb-1">Prediction</p>
                                                <p className="text-2xl font-bold">{pred.predicted_value}</p>
                                            </div>
                                            <div>
                                                <Badge className={`${config.color}`}>{pred.risk_level} risk</Badge>
                                            </div>
                                            {pred.recommendations && pred.recommendations.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-semibold mb-2">Recommendations:</p>
                                                    <ul className="space-y-1">
                                                        {pred.recommendations.slice(0, 3).map((rec, idx) => (
                                                            <li key={idx} className="text-sm text-slate-600 flex gap-2">
                                                                <span>•</span>
                                                                <span>{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {predictions?.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 mb-4">No predictions yet</p>
                                <p className="text-sm text-slate-500 mb-6">
                                    Run AI analysis to generate predictive insights
                                </p>
                                <Button onClick={() => runAnalysisMutation.mutate()}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate Predictions
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}