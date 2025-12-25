import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Activity, TrendingUp, Zap, LogOut, Settings } from 'lucide-react';
import OrchestrationRuleBuilder from '@/components/orchestration/OrchestrationRuleBuilder';

export default function OrchestrationPortal() {
    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        const session = localStorage.getItem('orchestration_session');
        if (!session) {
            window.location.href = '/OrchestrationLogin';
            return;
        }
        const sessionData = JSON.parse(session);
        setCustomerId(sessionData.id);
    }, []);

    const { data: customer } = useQuery({
        queryKey: ['orchestration-customer', customerId],
        queryFn: async () => {
            const customers = await base44.entities.OrchestrationCustomer.filter({ id: customerId });
            return customers[0];
        },
        enabled: !!customerId
    });

    const { data: executions = [] } = useQuery({
        queryKey: ['executions', customerId],
        queryFn: async () => {
            return await base44.entities.OrchestrationExecution.filter(
                { owner_type: 'platform', owner_id: customer?.customer_id },
                '-created_date',
                50
            ) || [];
        },
        enabled: !!customer,
        refetchInterval: 5000
    });

    const successRate = executions.length > 0
        ? ((executions.filter(e => e.status === 'executed').length / executions.length) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <GitBranch className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Orchestration Service</h1>
                            <p className="text-xs text-slate-600">{customer?.company_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                            {customer?.subscription_tier}
                        </Badge>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                                localStorage.removeItem('orchestration_session');
                                window.location.href = '/OrchestrationLogin';
                            }}
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">Executions Today</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {executions.length}
                                    </p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">{successRate}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">This Month</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {customer?.current_month_usage?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        / {customer?.monthly_routing_limit?.toLocaleString()}
                                    </p>
                                </div>
                                <GitBranch className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">Avg Latency</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {customer?.avg_latency_ms || 0}ms
                                    </p>
                                </div>
                                <Zap className="h-8 w-8 text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="payment" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="payment">Payment Routing</TabsTrigger>
                        <TabsTrigger value="payout">Payout Routing</TabsTrigger>
                        <TabsTrigger value="executions">Execution Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="payment">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Routing Rules</CardTitle>
                                <p className="text-sm text-slate-600">
                                    Configure how payments are routed to providers
                                </p>
                            </CardHeader>
                            <CardContent>
                                <OrchestrationRuleBuilder
                                    ownerType="platform"
                                    ownerId={customer?.customer_id}
                                    ruleType="payment"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payout">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payout Routing Rules</CardTitle>
                                <p className="text-sm text-slate-600">
                                    Configure how payouts are routed to methods
                                </p>
                            </CardHeader>
                            <CardContent>
                                <OrchestrationRuleBuilder
                                    ownerType="platform"
                                    ownerId={customer?.customer_id}
                                    ruleType="payout"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="executions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Execution Logs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {executions.slice(0, 20).map(exec => (
                                        <div key={exec.id} className="p-3 border rounded-lg text-sm">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={exec.status === 'executed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                                        {exec.status}
                                                    </Badge>
                                                    <span className="font-mono text-xs">{exec.execution_id?.substring(0, 8)}</span>
                                                    <span className="text-slate-600">{exec.rule_name}</span>
                                                    <span className="text-slate-600">→ {exec.route_name}</span>
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {exec.execution_time_ms}ms • {new Date(exec.created_date).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}