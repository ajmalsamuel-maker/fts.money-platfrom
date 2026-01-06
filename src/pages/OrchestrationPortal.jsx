import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GitBranch, Activity, TrendingUp, Zap, LogOut, Settings, Key, Webhook, Bell, Plus, Copy, Trash2, Eye, EyeOff, Menu } from 'lucide-react';
import { cn } from "@/lib/utils";
import OrchestrationRuleBuilder from '@/components/orchestration/OrchestrationRuleBuilder';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function OrchestrationPortal() {
    const { t } = useI18n();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [customerId, setCustomerId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState('api_keys');
    const [visibleKeys, setVisibleKeys] = useState({});
    
    const queryClient = useQueryClient();

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

    // API Keys Management
    const generateApiKey = () => {
        const newKey = {
            key_name: 'Orchestration API Key',
            api_key: 'orch_' + Math.random().toString(36).substr(2, 32),
            status: 'active'
        };
        const updatedCustomer = {
            ...customer,
            api_key: newKey.api_key
        };
        updateCustomerMutation.mutate(updatedCustomer);
    };

    const updateCustomerMutation = useMutation({
        mutationFn: async (data) => await base44.entities.OrchestrationCustomer.update(customer.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['orchestration-customer']);
        }
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
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
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowSettings(true)}
                        >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>

                    <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="api_keys">
                                <Key className="h-4 w-4 mr-2" />
                                API Keys
                            </TabsTrigger>
                            <TabsTrigger value="webhooks">
                                <Webhook className="h-4 w-4 mr-2" />
                                Webhooks
                            </TabsTrigger>
                            <TabsTrigger value="notifications">
                                <Bell className="h-4 w-4 mr-2" />
                                Notifications
                            </TabsTrigger>
                        </TabsList>

                        {/* API Keys Tab */}
                        <TabsContent value="api_keys" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">Manage API keys for programmatic access</p>
                                <Button size="sm" onClick={generateApiKey} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Generate Key
                                </Button>
                            </div>

                            {customer?.api_key ? (
                                <div className="p-4 border rounded-lg bg-slate-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 mb-2">Active API Key</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-white px-3 py-2 rounded border font-mono">
                                                    {visibleKeys['main'] ? customer.api_key : customer.api_key.substring(0, 12) + '...'}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setVisibleKeys({...visibleKeys, main: !visibleKeys['main']})}
                                                >
                                                    {visibleKeys['main'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(customer.api_key);
                                                        alert('API key copied to clipboard');
                                                    }}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600"
                                            onClick={() => {
                                                if (confirm('Revoke this API key? This cannot be undone.')) {
                                                    updateCustomerMutation.mutate({ ...customer, api_key: null });
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-3 pt-3 border-t text-xs text-slate-600">
                                        <p>Include this key in your API requests:</p>
                                        <code className="block mt-2 bg-slate-900 text-green-400 p-2 rounded">
                                            Authorization: Bearer {customer.api_key.substring(0, 12)}...
                                        </code>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                                    <Key className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">No API key generated yet</p>
                                    <Button onClick={generateApiKey} className="bg-blue-600 hover:bg-blue-700">
                                        Generate Your First API Key
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Webhooks Tab */}
                        <TabsContent value="webhooks" className="space-y-4">
                            <p className="text-sm text-slate-600">Configure webhook endpoints for routing notifications</p>
                            
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Webhook URL</label>
                                <Input
                                    value={customer?.webhook_url || ''}
                                    onChange={(e) => {
                                        const updated = { ...customer, webhook_url: e.target.value };
                                        updateCustomerMutation.mutate(updated);
                                    }}
                                    placeholder="https://your-api.com/webhooks/orchestration"
                                />
                                <p className="text-xs text-slate-500">
                                    Receive notifications when routing decisions are made
                                </p>
                            </div>

                            {customer?.webhook_url && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 mb-2">Webhook Events:</p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>✓ routing.executed - When a routing decision is made</li>
                                        <li>✓ routing.failed - When routing fails</li>
                                        <li>✓ rule.matched - When a rule matches a transaction</li>
                                    </ul>
                                </div>
                            )}
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="space-y-4">
                            <p className="text-sm text-slate-600">Configure email and notification preferences</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Routing Failure Alerts</p>
                                        <p className="text-sm text-slate-600">Get notified when routing fails</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Monthly Usage Report</p>
                                        <p className="text-sm text-slate-600">Receive monthly summary emails</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Quota Warnings</p>
                                        <p className="text-sm text-slate-600">Alert when approaching limits</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">New Feature Updates</p>
                                        <p className="text-sm text-slate-600">Product announcements and updates</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}