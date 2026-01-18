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
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
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
    Loader2
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
        amount_max: 1000
    });

    // Fetch PSPs and Merchants for selection
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants', config.psp_code],
        queryFn: () => base44.entities.Merchant.filter({ psp_code: config.psp_code }),
        enabled: !!config.psp_code
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
                }
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
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            
            <div className="flex-1 overflow-auto">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <Zap className="h-8 w-8 text-yellow-500" />
                            Load Testing & Simulation
                        </h1>
                        <p className="text-slate-600 mt-1">Generate realistic transaction load for PSP testing</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Configuration Panel */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Test Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>PSP Instance</Label>
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
                                    <Label>Merchants ({config.merchant_ids.length} selected)</Label>
                                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-white space-y-2">
                                        {!config.psp_code ? (
                                            <p className="text-sm text-slate-500">Select PSP first</p>
                                        ) : merchants.length === 0 ? (
                                            <p className="text-sm text-slate-500">No merchants found</p>
                                        ) : (
                                            <>
                                                <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                    <input 
                                                        type="checkbox"
                                                        checked={config.merchant_ids.length === merchants.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setConfig({...config, merchant_ids: merchants.map(m => m.id)});
                                                            } else {
                                                                setConfig({...config, merchant_ids: []});
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm font-semibold">Select All</span>
                                                </label>
                                                {merchants.map(merchant => (
                                                    <label key={merchant.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                        <input 
                                                            type="checkbox"
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

                                <div>
                                    <Label>Target TPS (Transactions/Second)</Label>
                                    <Input 
                                        type="number" 
                                        value={config.target_tps}
                                        onChange={(e) => setConfig({...config, target_tps: e.target.value})}
                                        min="1"
                                        max="1000"
                                    />
                                </div>

                                <div>
                                    <Label>Duration (seconds)</Label>
                                    <Input 
                                        type="number" 
                                        value={config.duration_seconds}
                                        onChange={(e) => setConfig({...config, duration_seconds: e.target.value})}
                                        min="10"
                                        max="3600"
                                    />
                                </div>

                                <div>
                                    <Label>Transaction Amount Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input 
                                            type="number" 
                                            placeholder="Min"
                                            value={config.amount_min}
                                            onChange={(e) => setConfig({...config, amount_min: e.target.value})}
                                        />
                                        <Input 
                                            type="number" 
                                            placeholder="Max"
                                            value={config.amount_max}
                                            onChange={(e) => setConfig({...config, amount_max: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Payment Methods</Label>
                                    <div className="space-y-2 mt-2">
                                        {['visa', 'mastercard', 'amex', 'discover'].map(method => (
                                            <label key={method} className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox"
                                                    checked={config.payment_methods.includes(method)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setConfig({...config, payment_methods: [...config.payment_methods, method]});
                                                        } else {
                                                            setConfig({...config, payment_methods: config.payment_methods.filter(m => m !== method)});
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm capitalize">{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <Button 
                                    className="w-full"
                                    onClick={testRunning ? handleStopTest : handleStartTest}
                                    disabled={runLoadTestMutation.isPending}
                                    variant={testRunning ? "destructive" : "default"}
                                >
                                    {runLoadTestMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Running Test...
                                        </>
                                    ) : testRunning ? (
                                        <>
                                            <Square className="h-4 w-4 mr-2" />
                                            Stop Test
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Start Load Test
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Results Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            {testResults && (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-slate-600">Target TPS</p>
                                                        <p className="text-2xl font-bold">{testResults.summary.target_tps}</p>
                                                    </div>
                                                    <TrendingUp className="h-8 w-8 text-blue-500" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-slate-600">Actual TPS</p>
                                                        <p className="text-2xl font-bold text-green-600">{testResults.summary.actual_tps}</p>
                                                    </div>
                                                    <Activity className="h-8 w-8 text-green-500" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-slate-600">Successful</p>
                                                        <p className="text-2xl font-bold text-emerald-600">{testResults.summary.successful}</p>
                                                    </div>
                                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-slate-600">Failed</p>
                                                        <p className="text-2xl font-bold text-red-600">{testResults.summary.failed}</p>
                                                    </div>
                                                    <XCircle className="h-8 w-8 text-red-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5" />
                                                Test Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-sm text-slate-600">Total Transactions</span>
                                                    <Badge variant="outline">{testResults.summary.transactions_generated}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-sm text-slate-600">Success Rate</span>
                                                    <Badge className="bg-green-600">{testResults.summary.success_rate}</Badge>
                                                </div>
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
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Zap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">Configure test parameters and click "Start Load Test"</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}