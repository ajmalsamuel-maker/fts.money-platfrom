import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Wifi, Database, Server, AlertTriangle, Clock } from 'lucide-react';

export default function ChaosEngineeringPanel({ config, onChange }) {
    const [chaosEnabled, setChaosEnabled] = useState(false);

    const chaosScenarios = [
        {
            id: 'network_latency',
            name: 'Network Latency',
            icon: Wifi,
            description: 'Inject artificial delays to simulate slow networks',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            id: 'service_outage',
            name: 'Service Outage',
            icon: Server,
            description: 'Simulate complete service unavailability',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            id: 'database_timeout',
            name: 'Database Timeout',
            icon: Database,
            description: 'Simulate database connection timeouts',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            id: 'increased_errors',
            name: 'Increased Error Rate',
            icon: AlertTriangle,
            description: 'Artificially increase system error responses',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            id: 'api_throttling',
            name: 'API Throttling',
            icon: Clock,
            description: 'Simulate rate limiting and throttling',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        }
    ];

    const toggleChaos = (scenarioId) => {
        const current = config.chaos_scenarios || [];
        const updated = current.includes(scenarioId)
            ? current.filter(id => id !== scenarioId)
            : [...current, scenarioId];
        onChange({ ...config, chaos_scenarios: updated });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        Chaos Engineering
                    </CardTitle>
                    <Switch 
                        checked={chaosEnabled}
                        onCheckedChange={(v) => {
                            setChaosEnabled(v);
                            if (!v) onChange({ ...config, chaos_scenarios: [], chaos_intensity: 0 });
                        }}
                    />
                </div>
                <p className="text-xs text-slate-600">Test resilience with controlled failures</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {chaosEnabled && (
                    <>
                        <Alert className="bg-orange-50 border-orange-200">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-900 text-xs">
                                Chaos scenarios will inject failures during the test to validate system resilience
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label className="text-xs">Select Chaos Scenarios</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {chaosScenarios.map((scenario) => {
                                    const Icon = scenario.icon;
                                    const isActive = (config.chaos_scenarios || []).includes(scenario.id);
                                    
                                    return (
                                        <div 
                                            key={scenario.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                isActive ? `${scenario.bgColor} border-orange-300` : 'hover:bg-slate-50'
                                            }`}
                                            onClick={() => toggleChaos(scenario.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Icon className={`h-4 w-4 ${scenario.color} mt-0.5`} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{scenario.name}</span>
                                                        {isActive && <Badge variant="destructive" className="text-xs">Active</Badge>}
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-0.5">{scenario.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {(config.chaos_scenarios || []).length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs">Chaos Intensity</Label>
                                <div className="flex items-center gap-4">
                                    <Slider 
                                        value={[config.chaos_intensity || 10]}
                                        onValueChange={(v) => onChange({ ...config, chaos_intensity: v[0] })}
                                        max={100}
                                        step={5}
                                        className="flex-1"
                                    />
                                    <Badge variant="outline">{config.chaos_intensity || 10}%</Badge>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {config.chaos_intensity < 25 ? 'Low impact - minimal disruption' : 
                                     config.chaos_intensity < 50 ? 'Medium impact - noticeable delays' :
                                     config.chaos_intensity < 75 ? 'High impact - significant failures' :
                                     'Critical impact - severe degradation'}
                                </p>
                            </div>
                        )}

                        {config.chaos_scenarios?.includes('network_latency') && (
                            <div className="space-y-2 p-3 bg-slate-50 rounded">
                                <Label className="text-xs">Network Latency (ms)</Label>
                                <Input 
                                    type="number"
                                    value={config.chaos_latency_ms || 500}
                                    onChange={(e) => onChange({ ...config, chaos_latency_ms: parseInt(e.target.value) })}
                                    placeholder="500"
                                />
                            </div>
                        )}

                        {config.chaos_scenarios?.includes('service_outage') && (
                            <div className="space-y-2 p-3 bg-slate-50 rounded">
                                <Label className="text-xs">Outage Duration (seconds)</Label>
                                <Input 
                                    type="number"
                                    value={config.chaos_outage_duration || 10}
                                    onChange={(e) => onChange({ ...config, chaos_outage_duration: parseInt(e.target.value) })}
                                    placeholder="10"
                                />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}