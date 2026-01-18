import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import TestScenarioLibrary from '@/components/loadtest/TestScenarioLibrary';
import RealTimeMonitor from '@/components/loadtest/RealTimeMonitor';
import AdvancedAnalytics from '@/components/loadtest/AdvancedAnalytics';
import ReportGenerator from '@/components/loadtest/ReportGenerator';
import TestDataManager from '@/components/loadtest/TestDataManager';
import ChaosEngineeringPanel from '@/components/loadtest/ChaosEngineeringPanel';
import RegressionComparison from '@/components/loadtest/RegressionComparison';
import PaymentFlowLibrary from '@/components/loadtest/PaymentFlowLibrary';
import { 
    Zap, 
    Play, 
    Square, 
    TrendingUp, 
    Activity, 
    CheckCircle2, 
    XCircle,
    Clock,
    Users,
    CreditCard,
    BarChart3,
    AlertCircle,
    Loader2,
    Calendar,
    Repeat,
    Settings,
    Target,
    Workflow,
    LineChart,
    FileText,
    GitCompare
} from 'lucide-react';

export default function LoadTestingDashboard() {
    const { platformUser } = usePlatformAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [testRunning, setTestRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);

    // Test Configuration
    const [config, setConfig] = useState({
        psp_code: '',
        merchant_ids: [],
        target_tps: 10,
        duration_seconds: 60,
        payment_methods: ['visa', 'mastercard', 'amex'],
        transaction_types: ['sale'],
        amount_min: 10,
        amount_max: 1000,
        test_scenarios: ['successful_payment'],
        scenario_distribution: { successful_payment: 100 },
        chaos_scenarios: [],
        chaos_intensity: 0,
        chaos_latency_ms: 500,
        chaos_outage_duration: 10,
        test_data_set_id: null
    });

    const [scheduleConfig, setScheduleConfig] = useState({
        schedule_type: 'one_time',
        scheduled_time: '',
        recurrence_pattern: 'daily'
    });

    // Fetch PSPs and Merchants for selection
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: merchants = [], refetch: refetchMerchants } = useQuery({
        queryKey: ['merchants', config.psp_code],
        queryFn: () => base44.entities.Merchant.filter({ psp_code: config.psp_code }),
        enabled: !!config.psp_code,
        staleTime: 0,
        cacheTime: 0
    });

    const runLoadTestMutation = useMutation({
        mutationFn: async () => {
            const { data } = await base44.functions.invoke('loadTestOrchestrator', {
                merchant_ids: config.merchant_ids,
                psp_code: config.psp_code,
                target_tps: parseInt(config.target_tps),
                duration_seconds: parseInt(config.duration_seconds),
                payment_methods: config.payment_methods,
                transaction_types: config.transaction_types,
                amount_range: {
                    min: parseFloat(config.amount_min),
                    max: parseFloat(config.amount_max)
                },
                test_scenarios: config.test_scenarios,
                scenario_distribution: config.scenario_distribution,
                chaos_scenarios: config.chaos_scenarios,
                chaos_intensity: config.chaos_intensity,
                chaos_latency_ms: config.chaos_latency_ms,
                chaos_outage_duration: config.chaos_outage_duration,
                test_data_set_id: config.test_data_set_id
            });
            return data;
        },
        onSuccess: (data) => {
            setTestResults(data);
            setTestRunning(false);
        },
        onError: (error) => {
            setTestRunning(false);
            alert('Load test failed: ' + error.message);
        }
    });

    const handleStartTest = () => {
        if (!config.psp_code || config.merchant_ids.length === 0) {
            alert('Please select PSP and at least one Merchant');
            return;
        }
        setTestRunning(true);
        setTestResults(null);
        runLoadTestMutation.mutate();
    };

    const handleStopTest = () => {
        setTestRunning(false);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <FTSPlatformSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            
            <div className="flex-1 overflow-auto">
                <div className="p-6 max-w-[1600px] mx-auto">
                    {/* Enhanced Header with Status */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                                    <Zap className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">Load Testing & Simulation</h1>
                                    <p className="text-slate-600 text-sm">Generate realistic transaction loads and validate system performance</p>
                                </div>
                            </div>
                            {testRunning && (
                                <Badge className="bg-green-500 text-white px-4 py-2 text-sm animate-pulse">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Test Running
                                </Badge>
                            )}
                        </div>
                    </div>

                    <Tabs defaultValue="quicktest" className="space-y-6">
                        <TabsList className="grid grid-cols-6 w-full h-auto p-1 bg-white shadow-sm">
                            <TabsTrigger value="quicktest" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-blue-50">
                                <Target className="h-5 w-5" />
                                <span className="text-xs">Quick Test</span>
                            </TabsTrigger>
                            <TabsTrigger value="scenarios" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-purple-50">
                                <Workflow className="h-5 w-5" />
                                <span className="text-xs">Scenarios</span>
                            </TabsTrigger>
                            <TabsTrigger value="flows" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-indigo-50">
                                <CreditCard className="h-5 w-5" />
                                <span className="text-xs">Payment Flows</span>
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-green-50">
                                <LineChart className="h-5 w-5" />
                                <span className="text-xs">Analytics</span>
                            </TabsTrigger>
                            <TabsTrigger value="regression" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-orange-50">
                                <GitCompare className="h-5 w-5" />
                                <span className="text-xs">Regression</span>
                            </TabsTrigger>
                            <TabsTrigger value="schedule" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-pink-50">
                                <Calendar className="h-5 w-5" />
                                <span className="text-xs">Schedule</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="quicktest">
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                {/* Left: Configuration Panel */}
                                <div className="xl:col-span-4 space-y-4">
                                    {/* Step 1: PSP & Merchants */}
                                    <Card className="border-l-4 border-l-blue-500 shadow-md">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                                        Target Selection
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div>
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        PSP Instance
                                    </Label>
                                    <Select 
                                        value={config.psp_code} 
                                        onValueChange={(value) => setConfig({...config, psp_code: value, merchant_ids: []})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select PSP" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {psps.map(psp => (
                                                <SelectItem key={psp.id} value={psp.psp_code}>
                                                    {psp.psp_name} ({psp.psp_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                        Merchants 
                                        <Badge variant="secondary" className="ml-auto">{config.merchant_ids.length} selected</Badge>
                                    </Label>
                                    <div className="border-2 rounded-lg p-3 max-h-52 overflow-y-auto bg-slate-50 space-y-2"
                                        {!config.psp_code ? (
                                            <p className="text-sm text-slate-500">Select PSP first</p>
                                        ) : merchants.length === 0 ? (
                                            <p className="text-sm text-slate-500">No merchants found</p>
                                        ) : (
                                            <>
                                                <label className="flex items-center gap-2 p-2.5 bg-white hover:bg-blue-50 rounded-md cursor-pointer border-2 border-blue-200 font-semibold">
                                                    <input 
                                                        type="checkbox"
                                                        className="w-4 h-4"
                                                        checked={config.merchant_ids.length === merchants.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setConfig({...config, merchant_ids: merchants.map(m => m.id)});
                                                            } else {
                                                                setConfig({...config, merchant_ids: []});
                                                            }
                                                        }}
                                                    />
                                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm">Select All Merchants</span>
                                                </label>
                                                {merchants.map(merchant => (
                                                    <label key={merchant.id} className="flex items-center gap-2 p-2 bg-white hover:bg-blue-50 rounded cursor-pointer border">
                                                        <input 
                                                            type="checkbox"
                                                            className="w-4 h-4"
                                                            checked={config.merchant_ids.includes(merchant.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setConfig({...config, merchant_ids: [...config.merchant_ids, merchant.id]});
                                                                } else {
                                                                    setConfig({...config, merchant_ids: config.merchant_ids.filter(id => id !== merchant.id)});
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm">{merchant.business_name}</span>
                                                    </label>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                                    {/* Step 2: Load Parameters */}
                                    <Card className="border-l-4 border-l-purple-500 shadow-md">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                                        Load Parameters
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div>
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-purple-600" />
                                        Target TPS (Transactions/Second)
                                    </Label>
                                    <Input 
                                        type="number" 
                                        value={config.target_tps}
                                        onChange={(e) => setConfig({...config, target_tps: e.target.value})}
                                        min="1"
                                        max="1000"
                                        className="text-lg font-semibold"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Higher TPS = more concurrent load</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        Duration (seconds)
                                    </Label>
                                    <Input 
                                        type="number" 
                                        value={config.duration_seconds}
                                        onChange={(e) => setConfig({...config, duration_seconds: e.target.value})}
                                        min="10"
                                        max="3600"
                                        className="text-lg font-semibold"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm font-semibold">Transaction Amount Range (USD)</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-slate-600">Min Amount</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="10"
                                                value={config.amount_min}
                                                onChange={(e) => setConfig({...config, amount_min: e.target.value})}
                                                className="font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-600">Max Amount</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="1000"
                                                value={config.amount_max}
                                                onChange={(e) => setConfig({...config, amount_max: e.target.value})}
                                                className="font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-semibold mb-2 block">Payment Methods</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['visa', 'mastercard', 'amex', 'discover'].map(method => (
                                            <label key={method} className="flex items-center gap-2 p-2 bg-white border rounded hover:bg-purple-50 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    className="w-4 h-4"
                                                    checked={config.payment_methods.includes(method)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setConfig({...config, payment_methods: [...config.payment_methods, method]});
                                                        } else {
                                                            setConfig({...config, payment_methods: config.payment_methods.filter(m => m !== method)});
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm capitalize font-medium">{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                                    {/* Test Data & Chaos */}
                                    <TestDataManager 
                                        pspCode={config.psp_code}
                                        onSelectDataset={(dataset) => setConfig({...config, test_data_set_id: dataset.id})}
                                    />
                                    <ChaosEngineeringPanel 
                                        config={config}
                                        onChange={setConfig}
                                    />

                                    {/* Action Button */}
                                    <Card className="border-2 border-green-500 shadow-lg">
                                        <CardContent className="pt-6">
                                            <Button 
                                                className="w-full h-14 text-lg font-bold"
                                                size="lg"
                                                onClick={testRunning ? handleStopTest : handleStartTest}
                                                disabled={runLoadTestMutation.isPending || !config.psp_code || config.merchant_ids.length === 0}
                                                variant={testRunning ? "destructive" : "default"}
                                            >
                                                {runLoadTestMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                        Running Test...
                                                    </>
                                                ) : testRunning ? (
                                                    <>
                                                        <Square className="h-5 w-5 mr-2" />
                                                        Stop Test
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-5 w-5 mr-2" />
                                                        Start Load Test
                                                    </>
                                                )}
                                            </Button>
                                            {(!config.psp_code || config.merchant_ids.length === 0) && (
                                                <p className="text-xs text-red-600 text-center mt-2">
                                                    ⚠️ Select PSP and merchants to start
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right: Results & Monitor */}
                                <div className="xl:col-span-8 space-y-6">
                                    {/* Real-Time Monitor */}
                                    {testRunning && (
                                        <Card className="border-2 border-green-500 shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Activity className="h-5 w-5 text-green-600 animate-pulse" />
                                                    Real-Time Monitor
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <RealTimeMonitor testRunning={testRunning} />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Test Results */}
                            {testResults && (
                                <>
                                    <Card>
                                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                Test Results Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-blue-600 font-medium">Target TPS</p>
                                                    <p className="text-3xl font-bold text-blue-900">{testResults.summary.target_tps}</p>
                                                </div>
                                                <TrendingUp className="h-10 w-10 text-blue-500" />
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-green-600 font-medium">Actual TPS</p>
                                                    <p className="text-3xl font-bold text-green-900">{testResults.summary.actual_tps}</p>
                                                </div>
                                                <Activity className="h-10 w-10 text-green-500" />
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-emerald-600 font-medium">Successful</p>
                                                    <p className="text-3xl font-bold text-emerald-900">{testResults.summary.successful}</p>
                                                </div>
                                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-red-600 font-medium">Failed</p>
                                                    <p className="text-3xl font-bold text-red-900">{testResults.summary.failed}</p>
                                                </div>
                                                <XCircle className="h-10 w-10 text-red-500" />
                                            </div>
                                        </div>
                                    </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="bg-slate-50">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <BarChart3 className="h-5 w-5 text-slate-700" />
                                                Detailed Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-sm text-slate-600">Total Transactions</span>
                                                    <Badge variant="outline">{testResults.summary.transactions_generated}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-sm text-slate-600">Success Rate</span>
                                                    <Badge className="bg-green-600">{testResults.summary.success_rate}</Badge>
                                                </div>
                                                {testResults.summary.scenario_breakdown && (
                                                    <div className="p-3 bg-slate-50 rounded-lg">
                                                        <span className="text-sm font-semibold text-slate-700 block mb-2">Scenario Distribution</span>
                                                        <div className="space-y-1">
                                                            {Object.entries(testResults.summary.scenario_breakdown).map(([scenario, count]) => (
                                                                <div key={scenario} className="flex justify-between text-xs">
                                                                    <span className="text-slate-600">{scenario.replace(/_/g, ' ')}</span>
                                                                    <span className="font-medium">{count}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-sm text-slate-600">Duration</span>
                                                    <Badge variant="outline">{testResults.summary.duration_ms}ms</Badge>
                                                </div>
                                            </div>

                                            <Alert className="mt-4 bg-blue-50 border-blue-200">
                                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-blue-900">
                                                    {testResults.message}
                                                </AlertDescription>
                                            </Alert>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                                    {!testResults && !testRunning && (
                                        <Card className="border-2 border-dashed border-slate-300">
                                            <CardContent className="py-16 text-center">
                                                <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl inline-block mb-4">
                                                    <Zap className="h-12 w-12 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Test</h3>
                                                <p className="text-slate-500 max-w-md mx-auto">Configure your test parameters on the left and click "Start Load Test" to begin generating realistic transaction load</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="scenarios">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Test Scenario Library</CardTitle>
                                    <p className="text-sm text-slate-600">Select realistic payment scenarios based on ISO 8583 standards and industry best practices</p>
                                </CardHeader>
                                <CardContent>
                                    <TestScenarioLibrary 
                                        selectedScenarios={config.test_scenarios}
                                        onToggle={(scenario) => {
                                            const isSelected = config.test_scenarios.includes(scenario);
                                            if (isSelected) {
                                                const updated = config.test_scenarios.filter(s => s !== scenario);
                                                const newDist = {...config.scenario_distribution};
                                                delete newDist[scenario];
                                                setConfig({...config, test_scenarios: updated, scenario_distribution: newDist});
                                            } else {
                                                const updated = [...config.test_scenarios, scenario];
                                                const evenDist = Math.floor(100 / (updated.length));
                                                const newDist = {};
                                                updated.forEach(s => newDist[s] = evenDist);
                                                setConfig({...config, test_scenarios: updated, scenario_distribution: newDist});
                                            }
                                        }}
                                    />
                                    
                                    {config.test_scenarios.length > 0 && (
                                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-semibold text-sm mb-3">Scenario Distribution (%)</h4>
                                            <div className="space-y-2">
                                                {config.test_scenarios.map(scenario => (
                                                    <div key={scenario} className="flex items-center gap-3">
                                                        <Label className="w-48 text-xs">{scenario.replace(/_/g, ' ')}</Label>
                                                        <Input 
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={config.scenario_distribution[scenario] || 0}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setConfig({
                                                                    ...config,
                                                                    scenario_distribution: {
                                                                        ...config.scenario_distribution,
                                                                        [scenario]: val
                                                                    }
                                                                });
                                                            }}
                                                            className="w-20"
                                                        />
                                                        <span className="text-xs text-slate-600">%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="flows">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Complex Payment Flow Library</CardTitle>
                                    <p className="text-sm text-slate-600">Pre-configured multi-step payment sequences for advanced testing</p>
                                </CardHeader>
                                <CardContent>
                                    <PaymentFlowLibrary 
                                        onSelectFlow={(flowKey, flow) => {
                                            setConfig({
                                                ...config,
                                                test_scenarios: flow.scenarios,
                                                scenario_distribution: flow.scenarios.reduce((acc, s) => {
                                                    acc[s] = Math.floor(100 / flow.scenarios.length);
                                                    return acc;
                                                }, {})
                                            });
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics">
                            {testResults ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                                            <p className="text-slate-600">Detailed performance metrics and insights</p>
                                        </div>
                                        <ReportGenerator testResults={testResults} config={config} />
                                    </div>
                                    <AdvancedAnalytics testResults={testResults} />
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">Run a test to view analytics and generate reports</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="regression">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Regression Tracking</CardTitle>
                                        <p className="text-sm text-slate-600">Compare test runs to detect performance degradation</p>
                                    </CardHeader>
                                </Card>
                                <RegressionComparison pspCode={config.psp_code} />
                            </div>
                        </TabsContent>

                        <TabsContent value="schedule">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Schedule Load Tests
                                    </CardTitle>
                                    <p className="text-sm text-slate-600">Automate load testing at specific times or intervals</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Schedule Type</Label>
                                        <Select 
                                            value={scheduleConfig.schedule_type}
                                            onValueChange={(value) => setScheduleConfig({...scheduleConfig, schedule_type: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="one_time">One-Time</SelectItem>
                                                <SelectItem value="recurring">Recurring</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {scheduleConfig.schedule_type === 'one_time' && (
                                        <div>
                                            <Label>Scheduled Time</Label>
                                            <Input 
                                                type="datetime-local"
                                                value={scheduleConfig.scheduled_time}
                                                onChange={(e) => setScheduleConfig({...scheduleConfig, scheduled_time: e.target.value})}
                                            />
                                        </div>
                                    )}

                                    {scheduleConfig.schedule_type === 'recurring' && (
                                        <div>
                                            <Label>Recurrence Pattern</Label>
                                            <Select 
                                                value={scheduleConfig.recurrence_pattern}
                                                onValueChange={(value) => setScheduleConfig({...scheduleConfig, recurrence_pattern: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hourly">Hourly</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <Alert className="bg-yellow-50 border-yellow-200">
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-900">
                                            Scheduled tests will use your current test configuration (PSP, merchants, TPS, scenarios)
                                        </AlertDescription>
                                    </Alert>

                                    <Button className="w-full">
                                        <Repeat className="h-4 w-4 mr-2" />
                                        Create Scheduled Test
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}