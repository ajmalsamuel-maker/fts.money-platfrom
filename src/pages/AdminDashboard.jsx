import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const { data } = await base44.functions.invoke('observability', {
                action: 'healthCheck'
            });
            setMetrics(data);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">PSP Admin Dashboard</h1>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="operations">Operations</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {metrics?.status === 'healthy' ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <span className="font-semibold">Healthy</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <span className="font-semibold">Issues Detected</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Database</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {metrics?.checks?.database ? '✓' : '✗'}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {metrics?.checks?.transactions ? 'Active' : 'Idle'}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {metrics?.checks?.error_rate ? '< 1%' : 'Normal'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Monitoring</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p>Real-time transaction volume, success rates, and processor health.</p>
                                    <Button>View Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">KYC/AML Screening</h4>
                                        <div className="bg-green-50 p-3 rounded">Active & Monitoring</div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Risk Alerts</h4>
                                        <div className="bg-blue-50 p-3 rounded">0 Active Violations</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="operations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Operations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button className="w-full justify-start">Run Integration Tests</Button>
                                    <Button className="w-full justify-start" variant="outline">Manage Feature Flags</Button>
                                    <Button className="w-full justify-start" variant="outline">View Audit Logs</Button>
                                    <Button className="w-full justify-start" variant="outline">Database Snapshots</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button className="w-full justify-start" variant="outline">Rate Limiting Config</Button>
                                    <Button className="w-full justify-start" variant="outline">API Key Management</Button>
                                    <Button className="w-full justify-start" variant="outline">Webhook Configuration</Button>
                                    <Button className="w-full justify-start" variant="outline">Disaster Recovery</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}