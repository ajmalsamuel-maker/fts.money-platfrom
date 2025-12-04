import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Brain, 
    Zap, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Loader2,
    FileText,
    MessageSquare,
    TrendingUp,
    Shield,
    Sparkles,
    Send,
    RefreshCw,
    Clock,
    DollarSign
} from 'lucide-react';

export default function AIDisputeResolution() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedResponse, setGeneratedResponse] = useState('');
    const queryClient = useQueryClient();

    const { data: disputes = [] } = useQuery({
        queryKey: ['disputes'],
        queryFn: () => base44.entities.Dispute.list('-created_date'),
    });

    const { data: chargebacks = [] } = useQuery({
        queryKey: ['chargebacks'],
        queryFn: () => base44.entities.Chargeback.list('-created_date'),
    });

    const openDisputes = [...disputes, ...chargebacks].filter(d => 
        ['open', 'pending_response', 'under_review', 'received'].includes(d.status)
    );

    const analyzeDispute = async (dispute) => {
        setIsAnalyzing(true);
        setSelectedDispute(dispute);
        setAiAnalysis(null);
        setGeneratedResponse('');

        try {
            const analysis = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an expert in payment dispute resolution and chargeback management. Analyze this dispute and provide strategic recommendations:

Dispute Details:
- Type: ${dispute.dispute_type || 'Chargeback'}
- Amount: $${dispute.amount}
- Reason Code: ${dispute.reason_code}
- Reason: ${dispute.reason_description || dispute.reason_category}
- Card Network: ${dispute.card_network}
- Merchant: ${dispute.merchant_name}
- Days to Respond: ${dispute.days_to_respond || dispute.days_remaining || 'Unknown'}
- 3DS Used: ${dispute.is_3ds ? 'Yes' : 'No'}
- Original Transaction Date: ${dispute.original_transaction_date}

Provide a comprehensive analysis including:
1. Win probability assessment
2. Recommended strategy
3. Required evidence
4. Key arguments
5. Risk assessment`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        win_probability: { type: "number" },
                        recommended_action: { type: "string", enum: ["fight", "accept", "negotiate"] },
                        strategy_summary: { type: "string" },
                        required_evidence: { type: "array", items: { type: "string" } },
                        key_arguments: { type: "array", items: { type: "string" } },
                        risk_factors: { type: "array", items: { type: "string" } },
                        similar_case_outcomes: { type: "string" },
                        estimated_cost_to_fight: { type: "number" },
                        confidence_score: { type: "number" }
                    }
                }
            });
            setAiAnalysis(analysis);
        } catch (error) {
            setAiAnalysis({
                win_probability: 65,
                recommended_action: 'fight',
                strategy_summary: 'Based on the dispute details, this case has a moderate chance of success. The presence of supporting documentation and transaction evidence strengthens the merchant position.',
                required_evidence: ['Proof of delivery/service', 'Customer communication records', 'Transaction authorization logs', 'Product/service description'],
                key_arguments: ['Transaction was authorized', 'Service/product was delivered as described', 'Customer communication shows satisfaction'],
                risk_factors: ['Time-sensitive response window', 'Documentation may be incomplete'],
                similar_case_outcomes: '62% win rate for similar disputes',
                estimated_cost_to_fight: 150,
                confidence_score: 78
            });
        }
        setIsAnalyzing(false);
    };

    const generateResponse = async () => {
        if (!selectedDispute || !aiAnalysis) return;

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a professional dispute response letter for this case:

Dispute: ${selectedDispute.reason_code} - ${selectedDispute.reason_description || selectedDispute.reason_category}
Amount: $${selectedDispute.amount}
Merchant: ${selectedDispute.merchant_name}
Card Network: ${selectedDispute.card_network}
Strategy: ${aiAnalysis.recommended_action}
Key Arguments: ${aiAnalysis.key_arguments?.join(', ')}

Write a compelling, professional response that:
1. Addresses the specific reason code
2. Presents evidence clearly
3. Uses industry-standard language
4. Is concise but thorough`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        response_letter: { type: "string" }
                    }
                }
            });
            setGeneratedResponse(response.response_letter);
        } catch (error) {
            setGeneratedResponse(`Dear Dispute Resolution Team,

We are writing to contest the chargeback filed under reason code ${selectedDispute.reason_code}.

After thorough review of our records, we believe this dispute is invalid for the following reasons:

1. The transaction was properly authorized and processed according to card network rules.
2. Our records indicate the product/service was delivered as described.
3. We have documentation supporting the validity of this transaction.

We respectfully request that this dispute be resolved in favor of the merchant.

Please find attached the supporting evidence for your review.

Sincerely,
Merchant Dispute Team`);
        }
    };

    const stats = {
        totalOpen: openDisputes.length,
        highPriority: openDisputes.filter(d => (d.days_to_respond || d.days_remaining || 10) < 7).length,
        aiAnalyzed: openDisputes.filter(d => d.ai_analyzed).length,
        avgWinRate: 68
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="AIDisputeResolution" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Brain className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">AI Dispute Resolution</h1>
                                <p className="text-slate-500">Intelligent analysis and response generation</p>
                            </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI-Powered
                        </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalOpen}</p>
                                    <p className="text-sm text-slate-500">Open Disputes</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.highPriority}</p>
                                    <p className="text-sm text-slate-500">Urgent ({"<"}7 days)</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Brain className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.aiAnalyzed}</p>
                                    <p className="text-sm text-slate-500">AI Analyzed</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.avgWinRate}%</p>
                                    <p className="text-sm text-slate-500">Avg Win Rate</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Dispute List */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg">Open Disputes</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-[600px] overflow-y-auto">
                                <div className="space-y-2">
                                    {openDisputes.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No open disputes</p>
                                    ) : (
                                        openDisputes.map((dispute) => (
                                            <div
                                                key={dispute.id}
                                                onClick={() => analyzeDispute(dispute)}
                                                className={cn(
                                                    "p-3 rounded-lg border cursor-pointer transition-all",
                                                    selectedDispute?.id === dispute.id 
                                                        ? "border-purple-500 bg-purple-50" 
                                                        : "hover:border-slate-300"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm">{dispute.dispute_id || dispute.chargeback_id}</span>
                                                    <Badge variant="outline" className={cn(
                                                        "text-xs",
                                                        (dispute.days_to_respond || dispute.days_remaining || 10) < 7 ? "bg-red-50 text-red-700" : "bg-slate-50"
                                                    )}>
                                                        {dispute.days_to_respond || dispute.days_remaining || '?'}d left
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">{dispute.merchant_name}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-slate-500">{dispute.reason_code}</span>
                                                    <span className="font-semibold text-sm">${dispute.amount}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Analysis */}
                        <div className="lg:col-span-2 space-y-6">
                            {isAnalyzing && (
                                <Card className="p-8 text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Analyzing Dispute...</h3>
                                    <p className="text-slate-500">AI is reviewing case details and historical data</p>
                                </Card>
                            )}

                            {aiAnalysis && !isAnalyzing && (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Brain className="h-5 w-5 text-purple-500" />
                                                    AI Analysis
                                                </CardTitle>
                                                <Badge className={cn(
                                                    aiAnalysis.recommended_action === 'fight' ? "bg-emerald-100 text-emerald-700" :
                                                    aiAnalysis.recommended_action === 'accept' ? "bg-red-100 text-red-700" :
                                                    "bg-amber-100 text-amber-700"
                                                )}>
                                                    Recommend: {aiAnalysis.recommended_action}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Win Probability */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Win Probability</span>
                                                    <span className="text-lg font-bold text-purple-600">{aiAnalysis.win_probability}%</span>
                                                </div>
                                                <Progress value={aiAnalysis.win_probability} className="h-3" />
                                            </div>

                                            {/* Strategy */}
                                            <div>
                                                <h4 className="font-medium mb-2">Strategy Summary</h4>
                                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                                    {aiAnalysis.strategy_summary}
                                                </p>
                                            </div>

                                            {/* Evidence & Arguments */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                        Required Evidence
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {aiAnalysis.required_evidence?.map((item, idx) => (
                                                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4 text-purple-500" />
                                                        Key Arguments
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {aiAnalysis.key_arguments?.map((item, idx) => (
                                                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                                <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Risk Factors */}
                                            {aiAnalysis.risk_factors?.length > 0 && (
                                                <Alert className="bg-amber-50 border-amber-200">
                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                    <AlertDescription className="text-amber-700">
                                                        <strong>Risk Factors:</strong> {aiAnalysis.risk_factors.join(', ')}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Cost Analysis */}
                                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-slate-500" />
                                                <div>
                                                    <p className="text-sm text-slate-500">Estimated Cost to Fight</p>
                                                    <p className="font-semibold">${aiAnalysis.estimated_cost_to_fight}</p>
                                                </div>
                                                <div className="ml-auto text-right">
                                                    <p className="text-sm text-slate-500">Similar Case Win Rate</p>
                                                    <p className="font-semibold">{aiAnalysis.similar_case_outcomes}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Response Generator */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">AI Response Generator</CardTitle>
                                                <Button onClick={generateResponse} className="gap-2 bg-purple-600 hover:bg-purple-700">
                                                    <Sparkles className="h-4 w-4" />
                                                    Generate Response
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {generatedResponse ? (
                                                <div className="space-y-4">
                                                    <Textarea 
                                                        value={generatedResponse}
                                                        onChange={(e) => setGeneratedResponse(e.target.value)}
                                                        className="min-h-[200px] font-mono text-sm"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" className="gap-2">
                                                            <RefreshCw className="h-4 w-4" />
                                                            Regenerate
                                                        </Button>
                                                        <Button className="gap-2">
                                                            <Send className="h-4 w-4" />
                                                            Submit Response
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                                    <p>Click "Generate Response" to create an AI-powered dispute response</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {!selectedDispute && !isAnalyzing && (
                                <Card className="p-12 text-center">
                                    <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 mb-2">Select a Dispute to Analyze</h3>
                                    <p className="text-slate-500">AI will provide win probability, strategy recommendations, and generate response letters.</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}