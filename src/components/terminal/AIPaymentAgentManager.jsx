import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Brain, Plus, Settings, TrendingUp, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

const agentTypes = [
    { value: 'approval', label: 'Payment Approval', icon: Shield, color: 'text-emerald-600' },
    { value: 'routing', label: 'Smart Routing', icon: Zap, color: 'text-blue-600' },
    { value: 'fraud_detection', label: 'Fraud Detection', icon: Shield, color: 'text-red-600' },
    { value: 'subscription_manager', label: 'Subscription Manager', icon: TrendingUp, color: 'text-purple-600' },
    { value: 'dispute_handler', label: 'Dispute Handler', icon: Brain, color: 'text-amber-600' }
];

export default function AIPaymentAgentManager({ merchantId }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [agentData, setAgentData] = useState({
        name: '',
        merchant_id: merchantId,
        agent_type: 'approval',
        confidence_threshold: 0.85,
        auto_approve_limit: 1000,
        learning_mode: true,
        capabilities: []
    });

    const queryClient = useQueryClient();

    const { data: agents = [] } = useQuery({
        queryKey: ['ai-agents', merchantId],
        queryFn: () => base44.entities.AIPaymentAgent.filter({ merchant_id: merchantId }),
    });

    const { data: decisions = [] } = useQuery({
        queryKey: ['ai-decisions'],
        queryFn: () => base44.entities.AIPaymentDecision.list('-created_date', 50),
    });

    const createAgentMutation = useMutation({
        mutationFn: (data) => base44.entities.AIPaymentAgent.create({
            ...data,
            agent_id: `AI-${Date.now()}`,
            status: 'learning',
            decisions_made: 0,
            model_version: 'v1.0'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
            toast.success('AI Agent created successfully');
            setShowCreateDialog(false);
        }
    });

    const getAgentStats = (agentId) => {
        const agentDecisions = decisions.filter(d => d.agent_id === agentId);
        const successful = agentDecisions.filter(d => d.outcome === 'successful').length;
        return {
            total: agentDecisions.length,
            accuracy: agentDecisions.length > 0 ? (successful / agentDecisions.length * 100).toFixed(1) : 0
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                        AI Payment Agents
                    </h2>
                    <p className="text-sm text-slate-500">Autonomous payment processing & decision making</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Agent
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => {
                    const stats = getAgentStats(agent.id);
                    const agentType = agentTypes.find(t => t.value === agent.agent_type);
                    const Icon = agentType?.icon || Brain;
                    
                    return (
                        <Card key={agent.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${agentType?.color}`} />
                                            {agent.name}
                                        </CardTitle>
                                        <p className="text-xs text-slate-500 mt-1">{agentType?.label}</p>
                                    </div>
                                    <Badge className={
                                        agent.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                        agent.status === 'learning' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-700'
                                    }>
                                        {agent.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Confidence:</span>
                                        <span className="font-semibold">{(agent.confidence_threshold * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Auto-approve:</span>
                                        <span className="font-semibold">${agent.auto_approve_limit}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Decisions:</span>
                                        <span className="font-semibold">{stats.total}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Accuracy:</span>
                                        <span className="font-semibold text-emerald-600">{stats.accuracy}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                                        <span className="text-slate-600">Learning Mode</span>
                                        <Switch checked={agent.learning_mode} disabled />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create AI Payment Agent</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Agent Name *</Label>
                            <Input
                                value={agentData.name}
                                onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Fraud Guardian"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Agent Type *</Label>
                            <Select 
                                value={agentData.agent_type}
                                onValueChange={(val) => setAgentData(prev => ({ ...prev, agent_type: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {agentTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <type.icon className={`h-4 w-4 ${type.color}`} />
                                                <span>{type.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Confidence Threshold: {(agentData.confidence_threshold * 100).toFixed(0)}%</Label>
                            <Slider
                                value={[agentData.confidence_threshold * 100]}
                                onValueChange={([val]) => setAgentData(prev => ({ ...prev, confidence_threshold: val / 100 }))}
                                min={50}
                                max={99}
                                step={1}
                            />
                            <p className="text-xs text-slate-500">Minimum confidence level for autonomous decisions</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Auto-Approve Limit ($)</Label>
                            <Input
                                type="number"
                                value={agentData.auto_approve_limit}
                                onChange={(e) => setAgentData(prev => ({ ...prev, auto_approve_limit: parseFloat(e.target.value) }))}
                            />
                            <p className="text-xs text-slate-500">Maximum amount agent can approve without human review</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <Label>Learning Mode</Label>
                                <p className="text-xs text-slate-500">Agent learns from decisions and feedback</p>
                            </div>
                            <Switch
                                checked={agentData.learning_mode}
                                onCheckedChange={(checked) => setAgentData(prev => ({ ...prev, learning_mode: checked }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                        <Button onClick={() => createAgentMutation.mutate(agentData)}>
                            Create Agent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}