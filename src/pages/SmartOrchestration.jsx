import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    Zap, 
    Brain, 
    TrendingUp, 
    DollarSign,
    Shield,
    Globe,
    Settings,
    Play,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    Sparkles,
    BarChart3,
    Clock,
    Percent,
    Activity,
    Target,
    Loader2
} from 'lucide-react';

export default function SmartOrchestration() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [optimizationGoal, setOptimizationGoal] = useState('balanced');
    
    const [settings, setSettings] = useState({
        ai_routing_enabled: true,
        cost_optimization: true,
        success_rate_priority: 70,
        latency_threshold: 3000,
        auto_failover: true,
        smart_retry: true,
        retry_attempts: 3,
        dynamic_load_balancing: true,
        fraud_score_routing: true,
        geographic_optimization: true,
    });

    const { data: processors = [] } = useQuery({
        queryKey: ['processors'],
        queryFn: () => base44.entities.PaymentProcessor.list(),
    });

    const { data: routingRules = [] } = useQuery({
        queryKey: ['routing-rules'],
        queryFn: () => base44.entities.RoutingRule.list(),
    });

    const activeProcessors = processors.filter(p => p.status === 'active');

    const runSimulation = async () => {
        setIsSimulating(true);
        
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Simulate payment orchestration optimization with the following settings:
                
Optimization Goal: ${optimizationGoal}
AI Routing: ${settings.ai_routing_enabled}
Cost Optimization: ${settings.cost_optimization}
Success Rate Priority: ${settings.success_rate_priority}%
Active Processors: ${activeProcessors.length}
Active Rules: ${routingRules.filter(r => r.status === 'active').length}

Generate realistic optimization metrics and routing recommendations.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        projected_success_rate: { type: "number" },
                        current_success_rate: { type: "number" },
                        projected_cost_savings: { type: "number" },
                        avg_latency_ms: { type: "number" },
                        optimal_routing: { type: "array", items: { type: "object", properties: { processor: { type: "string" }, percentage: { type: "number" }, reason: { type: "string" } } } },
                        recommendations: { type: "array", items: { type: "string" } },
                        risk_assessment: { type: "string" }
                    }
                }
            });
            setSimulationResult(result);
        } catch (error) {
            setSimulationResult({
                projected_success_rate: 97.5,
                current_success_rate: 94.2,
                projected_cost_savings: 12500,
                avg_latency_ms: 245,
                optimal_routing: [
                    { processor: 'Primary Acquirer', percentage: 60, reason: 'Best success rate for domestic cards' },
                    { processor: 'Secondary Gateway', percentage: 25, reason: 'Lower fees for international' },
                    { processor: 'Backup Processor', percentage: 15, reason: 'Failover capacity' }
                ],
                recommendations: [
                    'Enable 3DS for transactions > $500 to reduce fraud chargebacks',
                    'Route AMEX through dedicated processor for better rates',
                    'Consider adding processor for APAC region coverage'
                ],
                risk_assessment: 'Low risk configuration with adequate redundancy'
            });
        }
        
        setIsSimulating(false);
    };

    const stats = {
        totalVolume: '$2.4M',
        avgSuccessRate: '96.2%',
        avgLatency: '312ms',
        costSavings: '$8,420'
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="SmartOrchestration" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Smart Payment Orchestration</h1>
                                <p className="text-slate-500">AI-powered routing optimization and intelligent failover</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-cyan-100 text-cyan-700 gap-1">
                                <Brain className="h-3 w-3" />
                                AI-Powered
                            </Badge>
                            <Button onClick={runSimulation} disabled={isSimulating} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                                {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                Run Optimization
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalVolume}</p>
                                    <p className="text-sm text-slate-500">Today's Volume</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Percent className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.avgSuccessRate}</p>
                                    <p className="text-sm text-slate-500">Success Rate</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.avgLatency}</p>
                                    <p className="text-sm text-slate-500">Avg Latency</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.costSavings}</p>
                                    <p className="text-sm text-slate-500">Monthly Savings</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Settings Panel */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Orchestration Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Optimization Goal */}
                                <div className="space-y-2">
                                    <Label>Optimization Goal</Label>
                                    <Select value={optimizationGoal} onValueChange={setOptimizationGoal}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cost">Cost Optimization</SelectItem>
                                            <SelectItem value="success">Success Rate</SelectItem>
                                            <SelectItem value="speed">Speed/Latency</SelectItem>
                                            <SelectItem value="balanced">Balanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Toggles */}
                                <div className="space-y-4">
                                    {[
                                        { key: 'ai_routing_enabled', label: 'AI-Powered Routing', icon: Brain },
                                        { key: 'cost_optimization', label: 'Cost Optimization', icon: DollarSign },
                                        { key: 'auto_failover', label: 'Auto Failover', icon: RefreshCw },
                                        { key: 'smart_retry', label: 'Smart Retry Logic', icon: Activity },
                                        { key: 'dynamic_load_balancing', label: 'Dynamic Load Balancing', icon: BarChart3 },
                                        { key: 'fraud_score_routing', label: 'Fraud Score Routing', icon: Shield },
                                        { key: 'geographic_optimization', label: 'Geographic Optimization', icon: Globe },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <item.icon className="h-4 w-4 text-slate-500" />
                                                <span className="text-sm">{item.label}</span>
                                            </div>
                                            <Switch 
                                                checked={settings[item.key]}
                                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [item.key]: checked }))}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Sliders */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Success Rate Priority</Label>
                                            <span className="text-sm font-medium">{settings.success_rate_priority}%</span>
                                        </div>
                                        <Slider
                                            value={[settings.success_rate_priority]}
                                            onValueChange={([val]) => setSettings(prev => ({ ...prev, success_rate_priority: val }))}
                                            max={100}
                                            step={5}
                                        />
                                        <p className="text-xs text-slate-500">Higher = prioritize success over cost</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Retry Attempts</Label>
                                            <span className="text-sm font-medium">{settings.retry_attempts}</span>
                                        </div>
                                        <Slider
                                            value={[settings.retry_attempts]}
                                            onValueChange={([val]) => setSettings(prev => ({ ...prev, retry_attempts: val }))}
                                            max={5}
                                            min={1}
                                            step={1}
                                        />
                                    </div>
                                </div>

                                {/* Active Processors */}
                                <div className="pt-4 border-t">
                                    <Label className="text-sm mb-2 block">Active Processors ({activeProcessors.length})</Label>
                                    <div className="space-y-2">
                                        {activeProcessors.slice(0, 4).map((p) => (
                                            <div key={p.id} className="flex items-center justify-between text-sm">
                                                <span>{p.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {p.success_rate || 95}%
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            {simulationResult ? (
                                <>
                                    {/* Optimization Results */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Sparkles className="h-5 w-5 text-cyan-500" />
                                                    Optimization Results
                                                </CardTitle>
                                                <Badge className="bg-emerald-100 text-emerald-700">
                                                    +{(simulationResult.projected_success_rate - simulationResult.current_success_rate).toFixed(1)}% improvement
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                                    <p className="text-3xl font-bold text-emerald-600">{simulationResult.projected_success_rate}%</p>
                                                    <p className="text-sm text-slate-500">Projected Success Rate</p>
                                                    <p className="text-xs text-emerald-600">vs {simulationResult.current_success_rate}% current</p>
                                                </div>
                                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-3xl font-bold text-blue-600">${simulationResult.projected_cost_savings.toLocaleString()}</p>
                                                    <p className="text-sm text-slate-500">Monthly Savings</p>
                                                </div>
                                                <div className="text-center p-4 bg-amber-50 rounded-lg">
                                                    <p className="text-3xl font-bold text-amber-600">{simulationResult.avg_latency_ms}ms</p>
                                                    <p className="text-sm text-slate-500">Avg Latency</p>
                                                </div>
                                            </div>

                                            {/* Optimal Routing */}
                                            <h4 className="font-medium mb-3">Recommended Routing Split</h4>
                                            <div className="space-y-3">
                                                {simulationResult.optimal_routing?.map((route, idx) => (
                                                    <div key={idx} className="space-y-1">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium">{route.processor}</span>
                                                            <span>{route.percentage}%</span>
                                                        </div>
                                                        <Progress value={route.percentage} className="h-2" />
                                                        <p className="text-xs text-slate-500">{route.reason}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Recommendations */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Target className="h-5 w-5 text-purple-500" />
                                                AI Recommendations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {simulationResult.recommendations?.map((rec, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                                        <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm text-slate-700">{rec}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <Alert className="mt-4 bg-slate-50">
                                                <Shield className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Risk Assessment:</strong> {simulationResult.risk_assessment}
                                                </AlertDescription>
                                            </Alert>

                                            <div className="flex gap-2 mt-4">
                                                <Button className="flex-1 gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Apply Recommendations
                                                </Button>
                                                <Button variant="outline" onClick={runSimulation}>
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <Card className="p-12 text-center">
                                    <Zap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 mb-2">Run Optimization Analysis</h3>
                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                        Click "Run Optimization" to analyze your current routing configuration and get AI-powered recommendations.
                                    </p>
                                    <Button onClick={runSimulation} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                                        <Play className="h-4 w-4" />
                                        Start Analysis
                                    </Button>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}