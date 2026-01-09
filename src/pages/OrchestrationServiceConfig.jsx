import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { GitBranch, Save, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OrchestrationServiceConfig() {
    const { platformUser } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('providers');

    const [providers, setProviders] = useState([
        { id: 1, name: 'Stripe', type: 'card', enabled: true, status: 'connected', priority: 1 },
        { id: 2, name: 'Adyen', type: 'card', enabled: true, status: 'connected', priority: 2 },
        { id: 3, name: 'PayPal', type: 'wallet', enabled: true, status: 'connected', priority: 3 },
        { id: 4, name: 'Checkout.com', type: 'card', enabled: false, status: 'disconnected', priority: 4 }
    ]);

    const [routingEngine, setRoutingEngine] = useState({
        ai_routing: true,
        cost_optimization: true,
        success_rate_priority: 0.7,
        cost_priority: 0.3,
        regional_routing: true,
        currency_optimization: true
    });

    const [fallbackRules, setFallbackRules] = useState([
        { id: 1, provider: 'Stripe', fallback_to: 'Adyen', condition: 'decline', delay_ms: 500 },
        { id: 2, provider: 'Adyen', fallback_to: 'PayPal', condition: 'timeout', delay_ms: 1000 }
    ]);

    const [loadBalancing, setLoadBalancing] = useState({
        enabled: true,
        algorithm: 'weighted_round_robin',
        health_check_interval: 60,
        circuit_breaker_threshold: 5,
        circuit_breaker_timeout: 300
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="OrchestrationServiceConfig"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <GitBranch className="h-8 w-8 text-blue-600" />
                            Orchestration Service Configuration
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Configure payment provider integrations, routing rules, fallback logic, and load balancing
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="providers">Provider Integrations</TabsTrigger>
                            <TabsTrigger value="routing">Routing Engine</TabsTrigger>
                            <TabsTrigger value="fallback">Fallback Rules</TabsTrigger>
                            <TabsTrigger value="loadbalance">Load Balancing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="providers" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Provider Integrations</CardTitle>
                                    <CardDescription>
                                        Manage connected payment processors and their routing priority
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {providers.map(provider => (
                                            <div key={provider.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {provider.status === 'connected' ? (
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900">{provider.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">{provider.type}</Badge>
                                                                <span className="text-xs text-slate-600">Priority: {provider.priority}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={provider.status === 'connected' ? "default" : "secondary"}>
                                                            {provider.status}
                                                        </Badge>
                                                        <Switch 
                                                            checked={provider.enabled}
                                                            onCheckedChange={(checked) => {
                                                                setProviders(providers.map(p => 
                                                                    p.id === provider.id ? {...p, enabled: checked} : p
                                                                ));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Payment Provider
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="routing" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Smart Routing Engine</CardTitle>
                                    <CardDescription>
                                        Configure AI-powered routing optimization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">AI-Powered Routing</p>
                                            <p className="text-sm text-slate-600">Use machine learning for optimal routing</p>
                                        </div>
                                        <Switch checked={routingEngine.ai_routing} onCheckedChange={(checked) => setRoutingEngine({...routingEngine, ai_routing: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Cost Optimization</p>
                                            <p className="text-sm text-slate-600">Factor in processing fees</p>
                                        </div>
                                        <Switch checked={routingEngine.cost_optimization} onCheckedChange={(checked) => setRoutingEngine({...routingEngine, cost_optimization: checked})} />
                                    </div>

                                    <div>
                                        <Label>Success Rate Priority (0-1)</Label>
                                        <Input 
                                            type="number" 
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            value={routingEngine.success_rate_priority}
                                            onChange={(e) => setRoutingEngine({...routingEngine, success_rate_priority: parseFloat(e.target.value)})}
                                            className="mt-1" 
                                        />
                                    </div>

                                    <div>
                                        <Label>Cost Priority (0-1)</Label>
                                        <Input 
                                            type="number" 
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            value={routingEngine.cost_priority}
                                            onChange={(e) => setRoutingEngine({...routingEngine, cost_priority: parseFloat(e.target.value)})}
                                            className="mt-1" 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Regional Routing</p>
                                            <p className="text-sm text-slate-600">Optimize by customer location</p>
                                        </div>
                                        <Switch checked={routingEngine.regional_routing} onCheckedChange={(checked) => setRoutingEngine({...routingEngine, regional_routing: checked})} />
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Routing Configuration
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="fallback" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fallback Rules</CardTitle>
                                    <CardDescription>
                                        Configure automatic fallback when providers fail
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {fallbackRules.map(rule => (
                                            <div key={rule.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">
                                                            {rule.provider} → {rule.fallback_to}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                                                            <span>Trigger: <span className="font-medium">{rule.condition}</span></span>
                                                            <span>Delay: <span className="font-medium">{rule.delay_ms}ms</span></span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Fallback Rule
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="loadbalance" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Load Balancing Configuration</CardTitle>
                                    <CardDescription>
                                        Configure load distribution and health monitoring
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Load Balancing Enabled</p>
                                            <p className="text-sm text-slate-600">Distribute traffic across providers</p>
                                        </div>
                                        <Switch checked={loadBalancing.enabled} onCheckedChange={(checked) => setLoadBalancing({...loadBalancing, enabled: checked})} />
                                    </div>

                                    <div>
                                        <Label>Algorithm</Label>
                                        <select className="w-full mt-1 px-3 py-2 border rounded-md" value={loadBalancing.algorithm}>
                                            <option value="round_robin">Round Robin</option>
                                            <option value="weighted_round_robin">Weighted Round Robin</option>
                                            <option value="least_connections">Least Connections</option>
                                            <option value="random">Random</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label>Health Check Interval (seconds)</Label>
                                        <Input 
                                            type="number" 
                                            value={loadBalancing.health_check_interval}
                                            onChange={(e) => setLoadBalancing({...loadBalancing, health_check_interval: parseInt(e.target.value)})}
                                            className="mt-1" 
                                        />
                                    </div>

                                    <div>
                                        <Label>Circuit Breaker Threshold</Label>
                                        <Input 
                                            type="number" 
                                            value={loadBalancing.circuit_breaker_threshold}
                                            className="mt-1" 
                                        />
                                        <p className="text-xs text-slate-600 mt-1">Failed requests before opening circuit</p>
                                    </div>

                                    <div>
                                        <Label>Circuit Breaker Timeout (seconds)</Label>
                                        <Input 
                                            type="number" 
                                            value={loadBalancing.circuit_breaker_timeout}
                                            className="mt-1" 
                                        />
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Load Balancing Settings
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