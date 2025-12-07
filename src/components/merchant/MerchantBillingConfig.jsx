import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save } from 'lucide-react';
import { toast } from "sonner";

export default function MerchantBillingConfig({ merchant, subscriptions }) {
    const queryClient = useQueryClient();
    const [config, setConfig] = useState({
        proration_enabled: false,
        billing_day: 1,
        billing_anchor_type: 'start_date',
        usage_billing_trigger: {
            metric: '',
            threshold: 0,
            billing_method: 'per_unit'
        }
    });

    const updateConfigMutation = useMutation({
        mutationFn: (newConfig) => {
            // In real implementation, save to merchant settings or subscription
            return Promise.resolve(newConfig);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-subscriptions'] });
            toast.success('Billing configuration updated');
        }
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-slate-600" />
                        Billing Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Proration */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium">Enable Proration</p>
                            <p className="text-sm text-slate-500">
                                Automatically calculate prorated amounts for mid-cycle changes
                            </p>
                        </div>
                        <Switch
                            checked={config.proration_enabled}
                            onCheckedChange={(checked) => setConfig({ ...config, proration_enabled: checked })}
                        />
                    </div>

                    {/* Billing Day */}
                    <div className="space-y-2">
                        <Label>Billing Day</Label>
                        <Select 
                            value={config.billing_day.toString()}
                            onValueChange={(val) => setConfig({ ...config, billing_day: parseInt(val) })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                    <SelectItem key={day} value={day.toString()}>
                                        Day {day} of month
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                            Choose which day of the month to process recurring charges
                        </p>
                    </div>

                    {/* Billing Anchor */}
                    <div className="space-y-2">
                        <Label>Billing Anchor Type</Label>
                        <Select 
                            value={config.billing_anchor_type}
                            onValueChange={(val) => setConfig({ ...config, billing_anchor_type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="start_date">Start Date</SelectItem>
                                <SelectItem value="fixed_day">Fixed Day</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                            Determines when billing cycles begin
                        </p>
                    </div>

                    {/* Usage-Based Billing */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">Usage-Based Billing Trigger</h4>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Metric</Label>
                                <Input
                                    value={config.usage_billing_trigger.metric}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        usage_billing_trigger: { ...config.usage_billing_trigger, metric: e.target.value }
                                    })}
                                    placeholder="e.g., API calls, storage GB"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Threshold</Label>
                                <Input
                                    type="number"
                                    value={config.usage_billing_trigger.threshold}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        usage_billing_trigger: { ...config.usage_billing_trigger, threshold: parseFloat(e.target.value) }
                                    })}
                                    placeholder="e.g., 10000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Billing Method</Label>
                                <Select 
                                    value={config.usage_billing_trigger.billing_method}
                                    onValueChange={(val) => setConfig({
                                        ...config,
                                        usage_billing_trigger: { ...config.usage_billing_trigger, billing_method: val }
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per_unit">Per Unit</SelectItem>
                                        <SelectItem value="tiered">Tiered</SelectItem>
                                        <SelectItem value="volume">Volume</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Button 
                        className="w-full"
                        onClick={() => updateConfigMutation.mutate(config)}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Configuration
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}