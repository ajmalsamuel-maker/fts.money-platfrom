import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Repeat, Plus, Pause, Play, StopCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function RecurringPaymentManager({ merchants }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [formData, setFormData] = useState({
        merchant_id: '',
        customer_name: '',
        customer_email: '',
        plan_type: 'subscription',
        amount: '',
        currency: 'USD',
        frequency: 'monthly',
        interval_count: 1,
        start_date: new Date().toISOString().split('T')[0],
        total_cycles: null,
        description: '',
        ai_managed: false
    });

    const queryClient = useQueryClient();

    const { data: recurringPayments = [] } = useQuery({
        queryKey: ['recurring-payments'],
        queryFn: () => base44.entities.RecurringPayment.list('-created_date'),
    });

    const createRecurringMutation = useMutation({
        mutationFn: (data) => {
            const merchant = merchants.find(m => m.id === data.merchant_id);
            const startDate = new Date(data.start_date);
            const nextPaymentDate = new Date(startDate);
            
            // Calculate next payment date based on frequency
            if (data.frequency === 'monthly') {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + data.interval_count);
            } else if (data.frequency === 'weekly') {
                nextPaymentDate.setDate(nextPaymentDate.getDate() + (7 * data.interval_count));
            } else if (data.frequency === 'yearly') {
                nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + data.interval_count);
            }

            return base44.entities.RecurringPayment.create({
                ...data,
                recurring_id: `REC-${Date.now()}`,
                merchant_name: merchant?.business_name,
                status: 'active',
                cycles_completed: 0,
                next_payment_date: nextPaymentDate.toISOString().split('T')[0],
                failed_payment_count: 0,
                total_amount_paid: 0,
                retry_policy: {
                    max_retries: 3,
                    retry_interval_days: 3,
                    dunning_enabled: true
                },
                iso20022_data: {
                    payment_id: `REC-${Date.now()}`,
                    instruction_id: `INSTR-REC-${Date.now()}`,
                    purpose_code: 'SUBC' // Subscription
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-payments'] });
            toast.success('Recurring payment created successfully');
            setShowCreateDialog(false);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.RecurringPayment.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-payments'] });
            toast.success('Status updated');
        }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'paused': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Repeat className="h-6 w-6 text-blue-600" />
                        Recurring Payments
                    </h2>
                    <p className="text-sm text-slate-500">Manage subscriptions and scheduled payments</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Recurring Payment
                </Button>
            </div>

            <div className="grid gap-4">
                {recurringPayments.map((payment) => (
                    <Card key={payment.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold">{payment.customer_name}</h3>
                                        <Badge className={getStatusColor(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                        {payment.ai_managed && (
                                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                                AI Managed
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mb-3">{payment.customer_email}</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Amount</p>
                                            <p className="font-semibold">${payment.amount} {payment.currency}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Frequency</p>
                                            <p className="font-semibold capitalize">{payment.frequency}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Next Payment</p>
                                            <p className="font-semibold">{payment.next_payment_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Cycles</p>
                                            <p className="font-semibold">
                                                {payment.cycles_completed} / {payment.total_cycles || '∞'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    {payment.status === 'active' && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => updateStatusMutation.mutate({ id: payment.id, status: 'paused' })}
                                        >
                                            <Pause className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {payment.status === 'paused' && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => updateStatusMutation.mutate({ id: payment.id, status: 'active' })}
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => updateStatusMutation.mutate({ id: payment.id, status: 'cancelled' })}
                                    >
                                        <StopCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Recurring Payment</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label>Merchant *</Label>
                            <Select 
                                value={formData.merchant_id}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, merchant_id: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select merchant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer Name *</Label>
                                <Input
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Customer Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.customer_email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Plan Type</Label>
                            <Select 
                                value={formData.plan_type}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, plan_type: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="subscription">Subscription</SelectItem>
                                    <SelectItem value="installment">Installment</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="usage_based">Usage Based</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select 
                                    value={formData.currency}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select 
                                    value={formData.frequency}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, frequency: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Interval Count</Label>
                                <Input
                                    type="number"
                                    value={formData.interval_count}
                                    onChange={(e) => setFormData(prev => ({ ...prev, interval_count: parseInt(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Cycles (optional)</Label>
                                <Input
                                    type="number"
                                    placeholder="Leave empty for indefinite"
                                    value={formData.total_cycles || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, total_cycles: e.target.value ? parseInt(e.target.value) : null }))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <Label>AI-Managed</Label>
                                <p className="text-xs text-slate-500">Let AI agent manage this subscription</p>
                            </div>
                            <Switch
                                checked={formData.ai_managed}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ai_managed: checked }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                        <Button onClick={() => createRecurringMutation.mutate(formData)}>
                            Create Recurring Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}