import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Brain, 
    TrendingUp, 
    AlertTriangle, 
    Target,
    Sparkles,
    LineChart,
    Shield,
    Lightbulb,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function AIMerchantInsights() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [insights, setInsights] = useState(null);
    const [selectedMerchant, setSelectedMerchant] = useState(null);

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 500),
    });

    const { data: chargebacks = [] } = useQuery({
        queryKey: ['chargebacks'],
        queryFn: () => base44.entities.Chargeback.list(),
    });

    const { data: disputes = [] } = useQuery({
        queryKey: ['disputes'],
        queryFn: () => base44.entities.Dispute.list(),
    });

    const analyzeAllMerchants = async () => {
        setAnalyzing(true);
        setInsights(null);

        try {
            // Prepare merchant data with transaction patterns
            const merchantData = merchants.map(m => {
                const merchantTxns = transactions.filter(t => t.merchant_id === m.id);
                const merchantChargebacks = chargebacks.filter(c => c.merchant_id === m.id);
                const merchantDisputes = disputes.filter(d => d.merchant_id === m.id);

                return {
                    id: m.id,
                    name: m.business_name,
                    status: m.status,
                    category: m.category,
                    mcc_code: m.mcc_code,
                    total_volume: m.total_volume || 0,
                    total_transactions: merchantTxns.length,
                    chargeback_count: merchantChargebacks.length,
                    dispute_count: merchantDisputes.length,
                    avg_transaction_value: merchantTxns.length > 0 
                        ? merchantTxns.reduce((sum, t) => sum + (t.amount || 0), 0) / merchantTxns.length 
                        : 0,
                    declined_rate: merchantTxns.length > 0
                        ? (merchantTxns.filter(t => t.status === 'declined').length / merchantTxns.length) * 100
                        : 0,
                    risk_level: m.risk_level,
                    created_date: m.created_date
                };
            });

            const prompt = `Analyze the following merchant data and provide comprehensive AI-powered insights:

Merchant Data:
${JSON.stringify(merchantData, null, 2)}

Please analyze and provide:
1. HIGH_RISK_MERCHANTS: Identify merchants showing concerning patterns (high chargeback rates, sudden volume changes, declining acceptance rates, suspicious transaction patterns)
2. GROWTH_OPPORTUNITIES: Identify merchants with strong potential for growth (consistent volume increases, low risk scores, good payment success rates)
3. PERSONALIZED_STRATEGIES: For each category, provide specific, actionable recommendations

Return a structured analysis with risk scores, growth scores, and detailed recommendations.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        high_risk_merchants: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    merchant_id: { type: "string" },
                                    merchant_name: { type: "string" },
                                    risk_score: { type: "number" },
                                    risk_factors: { type: "array", items: { type: "string" } },
                                    recommended_actions: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        growth_opportunities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    merchant_id: { type: "string" },
                                    merchant_name: { type: "string" },
                                    growth_score: { type: "number" },
                                    growth_indicators: { type: "array", items: { type: "string" } },
                                    recommended_strategies: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        overall_insights: {
                            type: "object",
                            properties: {
                                total_merchants_analyzed: { type: "number" },
                                average_risk_level: { type: "string" },
                                key_trends: { type: "array", items: { type: "string" } },
                                recommended_focus_areas: { type: "array", items: { type: "string" } }
                            }
                        }
                    }
                }
            });

            setInsights(response);
            toast.success('AI analysis completed successfully');
        } catch (error) {
            console.error('AI analysis error:', error);
            toast.error('Failed to complete AI analysis');
        } finally {
            setAnalyzing(false);
        }
    };

    const analyzeSingleMerchant = async (merchant) => {
        setAnalyzing(true);
        setSelectedMerchant(merchant);

        try {
            const merchantTxns = transactions.filter(t => t.merchant_id === merchant.id);
            const merchantChargebacks = chargebacks.filter(c => c.merchant_id === merchant.id);
            const merchantDisputes = disputes.filter(d => d.merchant_id === merchant.id);

            const prompt = `Perform a deep-dive analysis for this specific merchant:

Merchant: ${merchant.business_name}
Category: ${merchant.category}
Total Volume: $${merchant.total_volume || 0}
Total Transactions: ${merchantTxns.length}
Chargebacks: ${merchantChargebacks.length}
Disputes: ${merchantDisputes.length}
Status: ${merchant.status}
Risk Level: ${merchant.risk_level}

Transaction Details:
${JSON.stringify(merchantTxns.slice(0, 50), null, 2)}

Provide:
1. Risk assessment with specific concerns
2. Growth potential analysis
3. 5-10 personalized, actionable strategies to improve their performance
4. Predicted outcomes if strategies are implemented
5. Key metrics to monitor`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        merchant_name: { type: "string" },
                        risk_assessment: {
                            type: "object",
                            properties: {
                                overall_risk_score: { type: "number" },
                                risk_category: { type: "string" },
                                specific_concerns: { type: "array", items: { type: "string" } },
                                mitigation_steps: { type: "array", items: { type: "string" } }
                            }
                        },
                        growth_potential: {
                            type: "object",
                            properties: {
                                growth_score: { type: "number" },
                                potential_category: { type: "string" },
                                strengths: { type: "array", items: { type: "string" } },
                                opportunities: { type: "array", items: { type: "string" } }
                            }
                        },
                        personalized_strategies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    expected_impact: { type: "string" },
                                    priority: { type: "string" }
                                }
                            }
                        },
                        predicted_outcomes: {
                            type: "object",
                            properties: {
                                revenue_impact: { type: "string" },
                                risk_reduction: { type: "string" },
                                timeline: { type: "string" }
                            }
                        },
                        key_metrics: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setInsights({ singleMerchant: response });
            toast.success(`Analysis completed for ${merchant.business_name}`);
        } catch (error) {
            console.error('Merchant analysis error:', error);
            toast.error('Failed to analyze merchant');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="AIMerchantInsights" />
            
            <div className={cn("transition-all duration-300", "lg:ml-16", sidebarCollapsed && "ml-0")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-3 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Merchant Insights</h1>
                                <p className="text-sm sm:text-base text-slate-500">Predictive analytics and personalized strategies</p>
                            </div>
                        </div>
                        <Button 
                            onClick={analyzeAllMerchants} 
                            disabled={analyzing}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {analyzing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Run AI Analysis
                                </>
                            )}
                        </Button>
                    </div>

                    {!insights && !analyzing && (
                        <Card className="mb-6">
                            <CardContent className="p-6 text-center">
                                <Brain className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                                <p className="text-slate-500 mb-4">Click "Run AI Analysis" to generate insights</p>
                            </CardContent>
                        </Card>
                    )}

                    {analyzing && (
                        <Card className="mb-6">
                            <CardContent className="p-8 text-center">
                                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-purple-600 animate-spin" />
                                <h3 className="text-lg font-semibold mb-2">AI Analysis in Progress</h3>
                                <p className="text-slate-500">Analyzing merchant data, transaction patterns, and risk indicators...</p>
                            </CardContent>
                        </Card>
                    )}

                    {insights?.singleMerchant && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        {insights.singleMerchant.merchant_name} - Deep Dive Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="risk" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                                            <TabsTrigger value="growth">Growth Potential</TabsTrigger>
                                            <TabsTrigger value="strategies">Strategies</TabsTrigger>
                                            <TabsTrigger value="outcomes">Predicted Outcomes</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="risk" className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base">Overall Risk Score</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-4xl font-bold text-slate-900">
                                                                {insights.singleMerchant.risk_assessment.overall_risk_score}/100
                                                            </div>
                                                            <Badge className={cn(
                                                                insights.singleMerchant.risk_assessment.overall_risk_score > 70 ? "bg-red-100 text-red-700" :
                                                                insights.singleMerchant.risk_assessment.overall_risk_score > 40 ? "bg-amber-100 text-amber-700" :
                                                                "bg-emerald-100 text-emerald-700"
                                                            )}>
                                                                {insights.singleMerchant.risk_assessment.risk_category}
                                                            </Badge>
                                                        </div>
                                                        <Progress value={insights.singleMerchant.risk_assessment.overall_risk_score} className="mt-4" />
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base">Specific Concerns</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-2">
                                                            {insights.singleMerchant.risk_assessment.specific_concerns.map((concern, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                                    {concern}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Mitigation Steps</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {insights.singleMerchant.risk_assessment.mitigation_steps.map((step, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                {step}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="growth" className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base">Growth Score</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-4xl font-bold text-slate-900">
                                                                {insights.singleMerchant.growth_potential.growth_score}/100
                                                            </div>
                                                            <Badge className="bg-emerald-100 text-emerald-700">
                                                                {insights.singleMerchant.growth_potential.potential_category}
                                                            </Badge>
                                                        </div>
                                                        <Progress value={insights.singleMerchant.growth_potential.growth_score} className="mt-4" />
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base">Strengths</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-2">
                                                            {insights.singleMerchant.growth_potential.strengths.map((strength, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                                    {strength}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Growth Opportunities</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {insights.singleMerchant.growth_potential.opportunities.map((opp, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                {opp}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="strategies" className="space-y-4">
                                            {insights.singleMerchant.personalized_strategies.map((strategy, idx) => (
                                                <Card key={idx}>
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <CardTitle className="text-base">{strategy.title}</CardTitle>
                                                            <Badge className={cn(
                                                                strategy.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                                strategy.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            )}>
                                                                {strategy.priority} Priority
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <p className="text-sm text-slate-700">{strategy.description}</p>
                                                        <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg">
                                                            <Lightbulb className="h-4 w-4 text-emerald-600 mt-0.5" />
                                                            <div className="text-sm">
                                                                <span className="font-medium">Expected Impact:</span> {strategy.expected_impact}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </TabsContent>

                                        <TabsContent value="outcomes" className="space-y-4">
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                                                            Revenue Impact
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-slate-700">{insights.singleMerchant.predicted_outcomes.revenue_impact}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-blue-600" />
                                                            Risk Reduction
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-slate-700">{insights.singleMerchant.predicted_outcomes.risk_reduction}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <LineChart className="h-4 w-4 text-purple-600" />
                                                            Timeline
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-slate-700">{insights.singleMerchant.predicted_outcomes.timeline}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Key Metrics to Monitor</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {insights.singleMerchant.key_metrics.map((metric, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                                <LineChart className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                                {metric}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {insights && !insights.singleMerchant && (
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="high-risk">High Risk</TabsTrigger>
                                <TabsTrigger value="growth">Growth Opportunities</TabsTrigger>
                                <TabsTrigger value="merchants">Analyze Merchant</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Merchants Analyzed</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">{insights.overall_insights.total_merchants_analyzed}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Average Risk Level</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge className={cn(
                                                insights.overall_insights.average_risk_level === 'High' ? 'bg-red-100 text-red-700' :
                                                insights.overall_insights.average_risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            )}>
                                                {insights.overall_insights.average_risk_level}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">High-Risk Merchants</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-red-600">{insights.high_risk_merchants.length}</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Key Trends</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {insights.overall_insights.key_trends.map((trend, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        {trend}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Recommended Focus Areas</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {insights.overall_insights.recommended_focus_areas.map((area, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                                        <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                        {area}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="high-risk" className="space-y-4">
                                {insights.high_risk_merchants.map((merchant, idx) => (
                                    <Card key={idx}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle>{merchant.merchant_name}</CardTitle>
                                                    <CardDescription>Risk Score: {merchant.risk_score}/100</CardDescription>
                                                </div>
                                                <Badge className="bg-red-100 text-red-700">High Risk</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                    Risk Factors
                                                </h4>
                                                <ul className="space-y-1">
                                                    {merchant.risk_factors.map((factor, fidx) => (
                                                        <li key={fidx} className="text-sm text-slate-700 ml-6">• {factor}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                                    <Lightbulb className="h-4 w-4 text-blue-600" />
                                                    Recommended Actions
                                                </h4>
                                                <ul className="space-y-1">
                                                    {merchant.recommended_actions.map((action, aidx) => (
                                                        <li key={aidx} className="text-sm text-slate-700 ml-6">• {action}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            <TabsContent value="growth" className="space-y-4">
                                {insights.growth_opportunities.map((merchant, idx) => (
                                    <Card key={idx}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle>{merchant.merchant_name}</CardTitle>
                                                    <CardDescription>Growth Score: {merchant.growth_score}/100</CardDescription>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-700">High Potential</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                                    Growth Indicators
                                                </h4>
                                                <ul className="space-y-1">
                                                    {merchant.growth_indicators.map((indicator, iidx) => (
                                                        <li key={iidx} className="text-sm text-slate-700 ml-6">• {indicator}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                                    <Lightbulb className="h-4 w-4 text-blue-600" />
                                                    Recommended Strategies
                                                </h4>
                                                <ul className="space-y-1">
                                                    {merchant.recommended_strategies.map((strategy, sidx) => (
                                                        <li key={sidx} className="text-sm text-slate-700 ml-6">• {strategy}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            <TabsContent value="merchants">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Select Merchant for Deep-Dive Analysis</CardTitle>
                                        <CardDescription>Get personalized insights and strategies for individual merchants</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-96">
                                            <div className="space-y-2">
                                                {merchants.map((merchant) => (
                                                    <div
                                                        key={merchant.id}
                                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                                        onClick={() => analyzeSingleMerchant(merchant)}
                                                    >
                                                        <div>
                                                            <p className="font-medium">{merchant.business_name}</p>
                                                            <p className="text-sm text-slate-500">{merchant.category} • {merchant.status}</p>
                                                        </div>
                                                        <Button size="sm" variant="outline">
                                                            Analyze
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}
                </main>
            </div>
        </div>
    );
}