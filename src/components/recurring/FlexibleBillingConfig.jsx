import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Calendar, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function FlexibleBillingConfig({ subscription, onUpdate }) {
    const [config, setConfig] = useState({
        proration_enabled: subscription?.billing_configuration?.proration_enabled || false,
        billing_day: subscription?.billing_configuration?.billing_day || 1,
        billing_anchor_type: subscription?.billing_configuration?.billing_anchor_type || 'start_date',
        usage_billing_trigger: subscription?.billing_configuration?.usage_billing_trigger || {
            metric: 'api_calls',
            threshold: 1000,
            billing_method: 'per_unit'
        }
    });

    const queryClient = useQueryClient();

    const updateBillingMutation = useMutation({
        mutationFn: (data) => base44.entities.RecurringPayment.update(subscription.id, {
            billing_configuration: data
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-payments'] });
            toast.success('Billing configuration updated');
            onUpdate?.();
        }
    });

    const calculateProration = () => {
        // Example proration calculation
        const daysInMonth = 30;
        const daysRemaining = 15; // Example
        const fullAmount = subscription.amount;
        const proratedAmount = (fullAmount / daysInMonth) * daysRemaining;
        
        return {
            full: fullAmount,
            prorated: proratedAmount.toFixed(2),
            discount: (fullAmount - proratedAmount).toFixed(2)
        };
    };

    const prorationExample = calculateProration();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-600" />
                    Flexible Billing Configuration
                </h2>
                <p className="text-sm text-slate-500">Customize billing cycles, proration, and usage triggers</p>
            </div>

            <Tabs defaultValue="proration">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="proration">Proration</TabsTrigger>
                    <TabsTrigger value="cycles">Custom Cycles</TabsTrigger>
                    <TabsTrigger value="usage">Usage-Based</TabsTrigger>
                </TabsList>

                <TabsContent value="proration" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Prorated Charges</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Enable Proration</Label>
                                    <p className="text-xs text-slate-500">
                                        Calculate charges based on partial billing periods
                                    </p>
                                </div>
                                <Switch
                                    checked={config.proration_enabled}
                                    onCheckedChange={(checked) => setConfig(prev => ({
                                        ...prev,
                                        proration_enabled: checked
                                    }))}
                                />
                            </div>

                            {config.proration_enabled && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-sm text-blue-900 mb-2">
                                        Proration Example
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Full Amount:</span>
                                            <span className="font-semibold">${prorationExample.full}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Prorated Amount:</span>
                                            <span className="font-semibold">${prorationExample.prorated}</span>
                                        </div>
                                        <div className="flex justify-between text-green-700">
                                            <span>Customer Saves:</span>
                                            <span className="font-semibold">${prorationExample.discount}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cycles" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Custom Billing Cycles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Billing Anchor Type</Label>
                                <Select 
                                    value={config.billing_anchor_type}
                                    onValueChange={(val) => setConfig(prev => ({
                                        ...prev,
                                        billing_anchor_type: val
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="start_date">Subscription Start Date</SelectItem>
                                        <SelectItem value="fixed_day">Fixed Day of Month</SelectItem>
                                        <SelectItem value="custom">Custom Schedule</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">
                                    Determines when billing cycles begin
                                </p>
                            </div>

                            {config.billing_anchor_type === 'fixed_day' && (
                                <div className="space-y-2">
                                    <Label>Billing Day of Month</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={config.billing_day}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            billing_day: parseInt(e.target.value)
                                        }))}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Customer will be billed on day {config.billing_day} of each month
                                    </p>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-2">Current Configuration</h4>
                                <div className="text-sm space-y-1">
                                    <p><span className="text-slate-600">Type:</span> {config.billing_anchor_type}</p>
                                    {config.billing_anchor_type === 'fixed_day' && (
                                        <p><span className="text-slate-600">Day:</span> {config.billing_day}</p>
                                    )}
                                    <p><span className="text-slate-600">Next Billing:</span> {subscription?.next_payment_date}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Usage-Based Billing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Usage Metric</Label>
                                <Select 
                                    value={config.usage_billing_trigger.metric}
                                    onValueChange={(val) => setConfig(prev => ({
                                        ...prev,
                                        usage_billing_trigger: {
                                            ...prev.usage_billing_trigger,
                                            metric: val
                                        }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="api_calls">API Calls</SelectItem>
                                        <SelectItem value="transactions">Transactions</SelectItem>
                                        <SelectItem value="storage_gb">Storage (GB)</SelectItem>
                                        <SelectItem value="bandwidth_gb">Bandwidth (GB)</SelectItem>
                                        <SelectItem value="users">Active Users</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Billing Threshold</Label>
                                <Input
                                    type="number"
                                    value={config.usage_billing_trigger.threshold}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        usage_billing_trigger: {
                                            ...prev.usage_billing_trigger,
                                            threshold: parseInt(e.target.value)
                                        }
                                    }))}
                                />
                                <p className="text-xs text-slate-500">
                                    Trigger billing when usage exceeds this amount
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Billing Method</Label>
                                <Select 
                                    value={config.usage_billing_trigger.billing_method}
                                    onValueChange={(val) => setConfig(prev => ({
                                        ...prev,
                                        usage_billing_trigger: {
                                            ...prev.usage_billing_trigger,
                                            billing_method: val
                                        }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per_unit">Per Unit</SelectItem>
                                        <SelectItem value="tiered">Tiered Pricing</SelectItem>
                                        <SelectItem value="volume">Volume Discounts</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                                    <TrendingUp className="h-4 w-4 inline mr-1" />
                                    Usage Billing Example
                                </h4>
                                <p className="text-sm text-purple-700">
                                    Customer will be charged when {config.usage_billing_trigger.metric} exceeds{' '}
                                    {config.usage_billing_trigger.threshold} using {config.usage_billing_trigger.billing_method} pricing.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onUpdate}>Cancel</Button>
                <Button onClick={() => updateBillingMutation.mutate(config)}>
                    Save Configuration
                </Button>
            </div>
        </div>
    );
}