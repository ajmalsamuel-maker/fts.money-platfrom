import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Zap, TrendingUp } from 'lucide-react';

export default function TransactionLoadTestDashboard() {
    const [activeTab, setActiveTab] = useState('transaction_tests');
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [loadTestResults, setLoadTestResults] = useState(null);
    const [rps, setRps] = useState(100);
    const [duration, setDuration] = useState(60);

    const runTransactionTests = async (scenario = 'all') => {
        try {
            setLoading(true);
            const { data } = await base44.functions.invoke('transactionTestSuite', {
                test_scenario: scenario,
                psp_code: 'PSP-001',
                merchant_id: 'MERCHANT-001'
            });
            setTestResults(data);
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    const runLoadTest = async (testType = 'load_test') => {
        try {
            setLoading(true);
            const { data } = await base44.functions.invoke('loadTest', {
                test_type: testType,
                duration_seconds: duration,
                rps: rps
            });
            setLoadTestResults(data);
        } catch (error) {
            console.error('Load test error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Transaction & Load Testing</h1>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="transaction_tests">Transaction Tests</TabsTrigger>
                        <TabsTrigger value="load_tests">Load Tests</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transaction_tests" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Scenarios</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button onClick={() => runTransactionTests('all')} disabled={loading}>
                                        Run All Tests
                                    </Button>
                                    <Button onClick={() => runTransactionTests('successful_payment')} variant="outline" disabled={loading}>
                                        Successful Payment
                                    </Button>
                                    <Button onClick={() => runTransactionTests('declined_card')} variant="outline" disabled={loading}>
                                        Declined Card
                                    </Button>
                                    <Button onClick={() => runTransactionTests('3ds_challenge')} variant="outline" disabled={loading}>
                                        3DS Challenge
                                    </Button>
                                    <Button onClick={() => runTransactionTests('tokenization')} variant="outline" disabled={loading}>
                                        Tokenization
                                    </Button>
                                    <Button onClick={() => runTransactionTests('refund')} variant="outline" disabled={loading}>
                                        Refund
                                    </Button>
                                    <Button onClick={() => runTransactionTests('velocity')} variant="outline" disabled={loading}>
                                        Velocity Block
                                    </Button>
                                    <Button onClick={() => runTransactionTests('fraud')} variant="outline" disabled={loading}>
                                        Fraud Detection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {testResults && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Test Results</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-green-50 p-4 rounded">
                                            <p className="text-sm text-gray-600">Passed</p>
                                            <p className="text-3xl font-bold text-green-600">{testResults.passed}</p>
                                        </div>
                                        <div className="bg-red-50 p-4 rounded">
                                            <p className="text-sm text-gray-600">Failed</p>
                                            <p className="text-3xl font-bold text-red-600">{testResults.failed}</p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded">
                                            <p className="text-sm text-gray-600">Total</p>
                                            <p className="text-3xl font-bold text-blue-600">{testResults.total_tests}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-3">Detailed Results</h4>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {testResults.results.map((result, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                                                    {result.passed ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium">{result.scenario}</p>
                                                        {result.passed && (
                                                            <p className="text-sm text-gray-600">ID: {result.transaction_id || result.token_id}</p>
                                                        )}
                                                        {!result.passed && (
                                                            <p className="text-sm text-red-600">{result.error}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="load_tests" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Load Test Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Requests Per Second: {rps}</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="1000"
                                        step="10"
                                        value={rps}
                                        onChange={(e) => setRps(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Duration (seconds): {duration}</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="300"
                                        step="10"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <Button onClick={() => runLoadTest('load_test')} disabled={loading}>
                                        <Zap className="w-4 h-4 mr-2" /> Run Load Test
                                    </Button>
                                    <Button onClick={() => runLoadTest('spike_test')} variant="outline" disabled={loading}>
                                        Spike Test
                                    </Button>
                                    <Button onClick={() => runLoadTest('soak_test')} variant="outline" disabled={loading}>
                                        Soak Test
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {loadTestResults && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Load Test Results</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded">
                                            <p className="text-sm text-gray-600">Duration</p>
                                            <p className="text-2xl font-bold">{loadTestResults.duration}s</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded">
                                            <p className="text-sm text-gray-600">Success Rate</p>
                                            <p className="text-2xl font-bold text-green-600">{loadTestResults.success_rate}</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded">
                                            <p className="text-sm text-gray-600">Actual RPS</p>
                                            <p className="text-2xl font-bold">{loadTestResults.rps}</p>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded">
                                            <p className="text-sm text-gray-600">Total Requests</p>
                                            <p className="text-2xl font-bold">{loadTestResults.total_requests}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded">
                                        <h4 className="font-semibold mb-3">Latency Metrics</h4>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Average</p>
                                                <p className="text-xl font-bold">{loadTestResults.latency?.avg}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">P50</p>
                                                <p className="text-xl font-bold">{loadTestResults.latency?.p50}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">P95</p>
                                                <p className="text-xl font-bold">{loadTestResults.latency?.p95}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">P99</p>
                                                <p className="text-xl font-bold">{loadTestResults.latency?.p99}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}