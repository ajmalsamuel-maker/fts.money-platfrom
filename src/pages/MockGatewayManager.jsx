import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    Zap, 
    CheckCircle2, 
    Settings,
    Play,
    Pause,
    RefreshCw,
    AlertCircle,
    Activity,
    TrendingUp,
    Clock,
    XCircle,
    Download,
    Calendar
} from 'lucide-react';

const mockGateways = [
    {
        id: 'mock_stripe',
        name: 'Mock Stripe',
        provider: 'Stripe (Test)',
        icon: '💳',
        description: 'Simulates Stripe payment gateway for testing',
        function_name: 'mockStripe',
        payment_method: 'visa',
        currency: 'USD',
        default_config: {
            simulate_delay: 100,
            simulate_success_rate: 95
        }
    },
    {
        id: 'mock_adyen',
        name: 'Mock Adyen',
        provider: 'Adyen (Test)',
        icon: '🔷',
        description: 'Simulates Adyen payment gateway for testing',
        function_name: 'mockAdyen',
        payment_method: 'visa',
        currency: 'USD',
        default_config: {
            simulate_delay: 150,
            simulate_success_rate: 93
        }
    },
    {
        id: 'mock_paypal',
        name: 'Mock PayPal',
        provider: 'PayPal (Test)',
        icon: '💰',
        description: 'Simulates PayPal payment gateway for testing',
        function_name: 'mockPayPal',
        payment_method: 'paypal',
        currency: 'USD',
        default_config: {
            simulate_delay: 120,
            simulate_success_rate: 96
        }
    },
    {
        id: 'mock_alipay',
        name: 'Mock AliPay',
        provider: 'AliPay (Test)',
        icon: '🇨🇳',
        description: 'Simulates AliPay payment gateway for testing',
        function_name: 'mockAliPay',
        payment_method: 'alipay',
        currency: 'CNY',
        default_config: {
            simulate_delay: 90,
            simulate_success_rate: 97
        }
    },
    {
        id: 'mock_wechat',
        name: 'Mock WeChat Pay',
        provider: 'WeChat Pay (Test)',
        icon: '💬',
        description: 'Simulates WeChat Pay gateway for testing',
        function_name: 'mockWeChat',
        payment_method: 'wechat',
        currency: 'CNY',
        default_config: {
            simulate_delay: 95,
            simulate_success_rate: 96
        }
    },
    {
        id: 'mock_skrill',
        name: 'Mock Skrill',
        provider: 'Skrill (Test)',
        icon: '🎯',
        description: 'Simulates Skrill payment gateway for testing',
        function_name: 'mockSkrill',
        payment_method: 'skrill',
        currency: 'EUR',
        default_config: {
            simulate_delay: 110,
            simulate_success_rate: 94
        }
    }
];

export default function MockGatewayManager() {
    const { platformUser } = usePlatformAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [testingGateway, setTestingGateway] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const queryClient = useQueryClient();

    // Fetch existing payment providers
    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    // Fetch transactions for analytics
    const { data: transactions = [] } = useQuery({
        queryKey: ['mock-transactions', dateRange],
        queryFn: async () => {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            
            const allTransactions = await base44.entities.Transaction.list();
            return allTransactions.filter(t => {
                const txDate = new Date(t.created_date);
                return txDate >= startDate && txDate <= endDate;
            });
        }
    });

    // Check which mock gateways are registered as providers
    const registeredMocks = mockGateways.filter(mock => 
        providers.some(p => p.name === mock.provider)
    );

    const unregisteredMocks = mockGateways.filter(mock => 
        !providers.some(p => p.name === mock.provider)
    );

    // Register mock gateway as payment provider
    const registerMutation = useMutation({
        mutationFn: async (gateway) => {
            return await base44.entities.PaymentProvider.create({
                name: gateway.provider,
                type: 'gateway',
                status: 'active',
                supported_currencies: ['USD', 'EUR', 'GBP'],
                supported_regions: ['US', 'EU', 'UK'],
                base_fee_percentage: 0,
                fixed_fee: 0,
                success_rate: gateway.default_config.simulate_success_rate,
                avg_response_time_ms: gateway.default_config.simulate_delay,
                supports_3ds: true,
                supports_recurring: true,
                logo_url: '',
                notes: `Mock payment gateway for testing - ${gateway.description}`
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-providers'] });
            alert('Mock gateway registered as payment provider!');
        }
    });

    // Unregister mock gateway
    const unregisterMutation = useMutation({
        mutationFn: async (gateway) => {
            const provider = providers.find(p => p.name === gateway.provider);
            if (provider) {
                await base44.entities.PaymentProvider.delete(provider.id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-providers'] });
            alert('Mock gateway unregistered!');
        }
    });

    // Test mock gateway
    const testGateway = async (gateway) => {
        setTestingGateway(gateway.id);
        setTestResult(null);

        try {
            const { data } = await base44.functions.invoke(gateway.function_name, {
                amount: 100,
                currency: gateway.currency,
                payment_method: gateway.payment_method,
                merchant_id: 'test_merchant',
                ...gateway.default_config
            });

            setTestResult({
                success: data.status === 'success',
                data: data
            });
        } catch (error) {
            setTestResult({
                success: false,
                error: error.message
            });
        } finally {
            setTestingGateway(null);
        }
    };

    // Calculate analytics
    const getGatewayAnalytics = () => {
        const analytics = mockGateways.map(gateway => {
            const gatewayTxns = transactions.filter(t => 
                t.connector_txn_no?.includes(gateway.id) || 
                t.remarks?.includes(gateway.name)
            );

            const successful = gatewayTxns.filter(t => t.status === 'approved' || t.status === 'accepted').length;
            const failed = gatewayTxns.filter(t => t.status === 'declined' || t.status === 'failed').length;
            const total = gatewayTxns.length;

            const failureReasons = gatewayTxns
                .filter(t => t.status === 'declined' || t.status === 'failed')
                .reduce((acc, t) => {
                    const reason = t.response_message || 'Unknown';
                    acc[reason] = (acc[reason] || 0) + 1;
                    return acc;
                }, {});

            const avgProcessingTime = gatewayTxns.length > 0
                ? gatewayTxns.reduce((sum, t) => {
                    const created = new Date(t.created_date);
                    const completed = t.complete_time ? new Date(t.complete_time) : new Date();
                    return sum + (completed - created);
                }, 0) / gatewayTxns.length
                : gateway.default_config.simulate_delay;

            return {
                gateway: gateway.name,
                icon: gateway.icon,
                total,
                successful,
                failed,
                successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : gateway.default_config.simulate_success_rate,
                failureReasons: Object.entries(failureReasons).map(([reason, count]) => ({ reason, count })),
                avgProcessingTime: Math.round(avgProcessingTime),
                volume: gatewayTxns.reduce((sum, t) => sum + (t.amount || 0), 0)
            };
        });

        return analytics;
    };

    const analytics = getGatewayAnalytics();

    // Generate report
    const generateReport = () => {
        const reportData = {
            dateRange: `${dateRange.start} to ${dateRange.end}`,
            generated: new Date().toISOString(),
            summary: {
                totalTransactions: transactions.length,
                totalVolume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
                avgSuccessRate: (analytics.reduce((sum, a) => sum + parseFloat(a.successRate), 0) / analytics.length).toFixed(2)
            },
            gateways: analytics
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mock-gateway-report-${dateRange.start}-to-${dateRange.end}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            
            <div className="flex-1 overflow-auto">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <Settings className="h-8 w-8 text-blue-500" />
                            Mock Payment Gateway Manager
                        </h1>
                        <p className="text-slate-600 mt-1">Configure and register mock gateways for testing PSP transactions</p>
                    </div>

                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                            <strong>Testing Flow:</strong> Register mock gateways here → They appear in Payment Providers → Provision to PSPs for realistic testing
                        </AlertDescription>
                    </Alert>

                    <Tabs defaultValue="gateways" className="mb-6">
                        <TabsList>
                            <TabsTrigger value="gateways">Gateway Management</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
                        </TabsList>

                        <TabsContent value="analytics" className="space-y-6">
                            {/* Date Range Selector */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Report Period
                                            </CardTitle>
                                            <CardDescription>Select date range for analytics and reports</CardDescription>
                                        </div>
                                        <Button onClick={generateReport} className="bg-green-600 hover:bg-green-700">
                                            <Download className="h-4 w-4 mr-2" />
                                            Generate Report
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <Label>Start Date</Label>
                                            <Input
                                                type="date"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label>End Date</Label>
                                            <Input
                                                type="date"
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Total Transactions</p>
                                                <p className="text-3xl font-bold">{transactions.length}</p>
                                            </div>
                                            <Activity className="h-8 w-8 text-blue-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Avg Success Rate</p>
                                                <p className="text-3xl font-bold">
                                                    {analytics.length > 0 
                                                        ? (analytics.reduce((sum, a) => sum + parseFloat(a.successRate), 0) / analytics.length).toFixed(1)
                                                        : '0'}%
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-green-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Avg Processing Time</p>
                                                <p className="text-3xl font-bold">
                                                    {analytics.length > 0 
                                                        ? Math.round(analytics.reduce((sum, a) => sum + a.avgProcessingTime, 0) / analytics.length)
                                                        : '0'}ms
                                                </p>
                                            </div>
                                            <Clock className="h-8 w-8 text-orange-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Success Rate Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gateway Success Rates</CardTitle>
                                    <CardDescription>Comparison of transaction success rates across gateways</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="gateway" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Processing Time Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Processing Times</CardTitle>
                                    <CardDescription>Response time performance by gateway</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={analytics}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="gateway" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="avgProcessingTime" stroke="#3b82f6" strokeWidth={2} name="Avg Time (ms)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Transaction Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transaction Distribution</CardTitle>
                                    <CardDescription>Volume distribution across gateways</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={analytics}
                                                dataKey="total"
                                                nameKey="gateway"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label
                                            >
                                                {analytics.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Failure Reasons Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        Failure Analysis
                                    </CardTitle>
                                    <CardDescription>Common failure reasons by gateway</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.map((gateway, idx) => (
                                            <div key={idx} className="border rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">{gateway.icon}</span>
                                                    <h3 className="font-semibold">{gateway.gateway}</h3>
                                                    <Badge variant={gateway.failed > 0 ? "destructive" : "secondary"}>
                                                        {gateway.failed} failures
                                                    </Badge>
                                                </div>
                                                {gateway.failureReasons.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {gateway.failureReasons.map((reason, ridx) => (
                                                            <div key={ridx} className="text-sm bg-slate-50 p-2 rounded">
                                                                <span className="font-medium">{reason.reason}:</span> {reason.count}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-600">No failures in selected period</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="gateways" className="space-y-6">

                    {/* Registered Mock Gateways */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Active Mock Gateways
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {registeredMocks.length === 0 ? (
                                <Card className="col-span-2">
                                    <CardContent className="py-8 text-center text-slate-500">
                                        No mock gateways registered yet. Register one below to start testing.
                                    </CardContent>
                                </Card>
                            ) : (
                                registeredMocks.map((gateway) => {
                                    const provider = providers.find(p => p.name === gateway.provider);
                                    return (
                                        <Card key={gateway.id} className="border-green-200 bg-green-50/30">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-3xl">{gateway.icon}</div>
                                                        <div>
                                                            <CardTitle className="text-lg">{gateway.name}</CardTitle>
                                                            <CardDescription>{gateway.description}</CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-green-600">Active</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-600">Success Rate</p>
                                                        <p className="font-semibold">{gateway.default_config.simulate_success_rate}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">Response Time</p>
                                                        <p className="font-semibold">{gateway.default_config.simulate_delay}ms</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => testGateway(gateway)}
                                                        disabled={testingGateway === gateway.id}
                                                    >
                                                        {testingGateway === gateway.id ? (
                                                            <>
                                                                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                                                                Testing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="h-3 w-3 mr-2" />
                                                                Test Gateway
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            if (confirm(`Unregister ${gateway.name}? This will remove it from payment providers.`)) {
                                                                unregisterMutation.mutate(gateway);
                                                            }
                                                        }}
                                                    >
                                                        <Pause className="h-3 w-3 mr-2" />
                                                        Unregister
                                                    </Button>
                                                </div>

                                                {testResult && testingGateway === null && (
                                                    <Alert className={testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                                                        <AlertDescription>
                                                            <div className="text-sm">
                                                                <strong>{testResult.success ? '✓ Success' : '✗ Failed'}</strong>
                                                                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                                                                    {JSON.stringify(testResult.data || testResult.error, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Available Mock Gateways */}
                    {unregisteredMocks.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-slate-600" />
                                Available Mock Gateways
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {unregisteredMocks.map((gateway) => (
                                    <Card key={gateway.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-3xl">{gateway.icon}</div>
                                                    <div>
                                                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                                                        <CardDescription>{gateway.description}</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">Not Active</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-600">Success Rate</p>
                                                    <p className="font-semibold">{gateway.default_config.simulate_success_rate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Response Time</p>
                                                    <p className="font-semibold">{gateway.default_config.simulate_delay}ms</p>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                onClick={() => registerMutation.mutate(gateway)}
                                                disabled={registerMutation.isPending}
                                            >
                                                <Zap className="h-4 w-4 mr-2" />
                                                Register as Payment Provider
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}