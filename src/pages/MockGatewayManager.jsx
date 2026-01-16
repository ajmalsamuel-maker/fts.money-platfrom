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
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { 
    Zap, 
    CheckCircle2, 
    Settings,
    Play,
    Pause,
    RefreshCw,
    AlertCircle,
    Activity
} from 'lucide-react';

const mockGateways = [
    {
        id: 'mock_stripe',
        name: 'Mock Stripe',
        provider: 'Stripe (Test)',
        icon: '💳',
        description: 'Simulates Stripe payment gateway for testing',
        function_name: 'mockStripe',
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
        default_config: {
            simulate_delay: 150,
            simulate_success_rate: 93
        }
    }
];

export default function MockGatewayManager() {
    const { platformUser } = usePlatformAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [testingGateway, setTestingGateway] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const queryClient = useQueryClient();

    // Fetch existing payment providers
    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
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
                currency: 'USD',
                payment_method: 'visa',
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
                </div>
            </div>
        </div>
    );
}