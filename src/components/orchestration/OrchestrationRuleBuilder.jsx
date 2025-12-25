import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowRight, Settings } from 'lucide-react';

export default function OrchestrationRuleBuilder({ ownerType, ownerId, ruleType }) {
    const [showRuleDialog, setShowRuleDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const queryClient = useQueryClient();

    const { data: rules = [] } = useQuery({
        queryKey: ['orchestration-rules', ownerType, ownerId],
        queryFn: async () => await base44.entities.OrchestrationRule.filter({ 
            owner_type: ownerType, 
            owner_id: ownerId 
        }, 'priority')
    });

    const { data: routes = [] } = useQuery({
        queryKey: ['orchestration-routes'],
        queryFn: async () => await base44.entities.OrchestrationRoute.filter({ status: 'active' })
    });

    const createRuleMutation = useMutation({
        mutationFn: async (data) => await base44.entities.OrchestrationRule.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['orchestration-rules']);
            setShowRuleDialog(false);
            setEditingRule(null);
        }
    });

    const updateRuleMutation = useMutation({
        mutationFn: async ({ id, data }) => await base44.entities.OrchestrationRule.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['orchestration-rules']);
            setShowRuleDialog(false);
            setEditingRule(null);
        }
    });

    const deleteRuleMutation = useMutation({
        mutationFn: async (id) => await base44.entities.OrchestrationRule.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['orchestration-rules'])
    });

    const handleSaveRule = () => {
        const data = {
            ...editingRule,
            owner_type: ownerType,
            owner_id: ownerId,
            rule_type: ruleType
        };

        if (editingRule.id) {
            updateRuleMutation.mutate({ id: editingRule.id, data });
        } else {
            createRuleMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Routing Rules</h3>
                <Button 
                    onClick={() => {
                        setEditingRule({
                            rule_name: '',
                            priority: rules.length * 10 + 10,
                            routing_strategy: 'single',
                            conditions: {},
                            target_routes: [],
                            status: 'active'
                        });
                        setShowRuleDialog(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                </Button>
            </div>

            {rules.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <Settings className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 mb-4">No routing rules configured</p>
                        <Button onClick={() => {
                            setEditingRule({
                                rule_name: 'Default Rule',
                                priority: 100,
                                routing_strategy: 'single',
                                conditions: {},
                                target_routes: [],
                                status: 'active'
                            });
                            setShowRuleDialog(true);
                        }}>
                            Create First Rule
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {rules.map((rule) => (
                        <Card key={rule.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-slate-900">{rule.rule_name}</h4>
                                            <Badge className={
                                                rule.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                rule.status === 'testing' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }>
                                                {rule.status}
                                            </Badge>
                                            <span className="text-xs text-slate-500">Priority: {rule.priority}</span>
                                        </div>
                                        
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p><strong>Strategy:</strong> {rule.routing_strategy}</p>
                                            {rule.conditions?.amount_min && (
                                                <p><strong>Amount:</strong> {rule.conditions.amount_min} - {rule.conditions.amount_max || '∞'}</p>
                                            )}
                                            {rule.conditions?.currencies?.length > 0 && (
                                                <p><strong>Currencies:</strong> {rule.conditions.currencies.join(', ')}</p>
                                            )}
                                            {rule.target_routes?.length > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <ArrowRight className="h-4 w-4 text-blue-600" />
                                                    <div className="flex gap-1">
                                                        {rule.target_routes.map((tr, idx) => (
                                                            <Badge key={idx} variant="outline">{tr.route_name}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4 mt-3 text-xs text-slate-500">
                                            <span>✅ {rule.success_count || 0} successful</span>
                                            <span>❌ {rule.failure_count || 0} failed</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingRule(rule);
                                                setShowRuleDialog(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600"
                                            onClick={() => {
                                                if (confirm('Delete this rule?')) {
                                                    deleteRuleMutation.mutate(rule.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Rule Editor Dialog */}
            <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRule?.id ? 'Edit Rule' : 'Create Rule'}</DialogTitle>
                    </DialogHeader>

                    {editingRule && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Rule Name</label>
                                    <Input
                                        value={editingRule.rule_name}
                                        onChange={(e) => setEditingRule({...editingRule, rule_name: e.target.value})}
                                        placeholder="e.g., High Value EUR Payments"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Priority (lower = higher)</label>
                                    <Input
                                        type="number"
                                        value={editingRule.priority}
                                        onChange={(e) => setEditingRule({...editingRule, priority: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Routing Strategy</label>
                                    <Select 
                                        value={editingRule.routing_strategy} 
                                        onValueChange={(v) => setEditingRule({...editingRule, routing_strategy: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single Route</SelectItem>
                                            <SelectItem value="failover">Failover</SelectItem>
                                            <SelectItem value="load_balance">Load Balance</SelectItem>
                                            <SelectItem value="cost_optimize">Cost Optimize</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select 
                                        value={editingRule.status} 
                                        onValueChange={(v) => setEditingRule({...editingRule, status: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="testing">Testing</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Conditions (Optional)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="number"
                                        placeholder="Min Amount"
                                        value={editingRule.conditions?.amount_min || ''}
                                        onChange={(e) => setEditingRule({
                                            ...editingRule, 
                                            conditions: {...editingRule.conditions, amount_min: parseFloat(e.target.value) || null}
                                        })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max Amount"
                                        value={editingRule.conditions?.amount_max || ''}
                                        onChange={(e) => setEditingRule({
                                            ...editingRule, 
                                            conditions: {...editingRule.conditions, amount_max: parseFloat(e.target.value) || null}
                                        })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Target Routes</label>
                                <div className="space-y-2">
                                    {editingRule.target_routes?.map((tr, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <Select
                                                value={tr.route_id}
                                                onValueChange={(routeId) => {
                                                    const route = routes.find(r => r.id === routeId);
                                                    const newTargets = [...editingRule.target_routes];
                                                    newTargets[idx] = {
                                                        route_id: routeId,
                                                        route_name: route?.route_name,
                                                        priority: idx + 1,
                                                        weight: 100
                                                    };
                                                    setEditingRule({...editingRule, target_routes: newTargets});
                                                }}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select route" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {routes.map(route => (
                                                        <SelectItem key={route.id} value={route.id}>
                                                            {route.route_name} ({route.route_type})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newTargets = editingRule.target_routes.filter((_, i) => i !== idx);
                                                    setEditingRule({...editingRule, target_routes: newTargets});
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditingRule({
                                                ...editingRule,
                                                target_routes: [...(editingRule.target_routes || []), { route_id: '', route_name: '', priority: (editingRule.target_routes?.length || 0) + 1 }]
                                            });
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Route
                                    </Button>
                                </div>
                            </div>

                            <Button onClick={handleSaveRule} className="w-full bg-blue-600 hover:bg-blue-700">
                                {editingRule.id ? 'Update Rule' : 'Create Rule'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}