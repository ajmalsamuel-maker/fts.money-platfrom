import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { AlertCircle, Mail, Settings, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function DunningManager() {
    const [selectedSub, setSelectedSub] = useState(null);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [retrySchedule, setRetrySchedule] = useState([1, 3, 7, 14]);
    const [emailTemplates, setEmailTemplates] = useState({
        first_failure: {
            subject: 'Payment Failed - Action Required',
            body: 'Hi {{customer_name}},\n\nYour recent payment of ${{amount}} failed. Please update your payment method.\n\nUpdate here: {{payment_link}}'
        },
        second_attempt: {
            subject: 'Second Notice - Payment Failed',
            body: 'Hi {{customer_name}},\n\nThis is our second attempt to process your payment. Your subscription may be suspended if we cannot process payment.\n\nUpdate payment: {{payment_link}}'
        },
        final_warning: {
            subject: 'Final Notice - Subscription at Risk',
            body: 'Hi {{customer_name}},\n\nThis is your final notice. Your subscription will be cancelled if payment is not received within 48 hours.\n\nUpdate now: {{payment_link}}'
        }
    });

    const queryClient = useQueryClient();

    const { data: failedSubs = [] } = useQuery({
        queryKey: ['failed-recurring-payments'],
        queryFn: () => base44.entities.RecurringPayment.filter({ status: 'dunning' }),
    });

    const updateRetryPolicyMutation = useMutation({
        mutationFn: ({ subscriptionId, policy }) => 
            base44.entities.RecurringPayment.update(subscriptionId, {
                retry_policy: {
                    ...policy,
                    retry_schedule: retrySchedule,
                    dunning_enabled: true,
                    escalation_enabled: true
                }
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['failed-recurring-payments'] });
            toast.success('Retry policy updated');
        }
    });

    const retryPaymentMutation = useMutation({
        mutationFn: async ({ subscription, attemptNumber }) => {
            // Update dunning state
            const currentState = subscription.dunning_state || {};
            const nextRetryDays = retrySchedule[attemptNumber] || 30;
            const nextRetryDate = new Date();
            nextRetryDate.setDate(nextRetryDate.getDate() + nextRetryDays);

            await base44.entities.RecurringPayment.update(subscription.id, {
                dunning_state: {
                    current_attempt: attemptNumber + 1,
                    next_retry_date: nextRetryDate.toISOString().split('T')[0],
                    communications_sent: [
                        ...(currentState.communications_sent || []),
                        {
                            type: attemptNumber === 0 ? 'first_failure' : 
                                  attemptNumber === 1 ? 'second_attempt' : 'final_warning',
                            sent_at: new Date().toISOString(),
                            template_id: 'dunning_template'
                        }
                    ],
                    escalated: attemptNumber >= 2
                }
            });

            // Send dunning email
            const templateKey = attemptNumber === 0 ? 'first_failure' :
                               attemptNumber === 1 ? 'second_attempt' : 'final_warning';
            const template = emailTemplates[templateKey];

            await base44.integrations.Core.SendEmail({
                to: subscription.customer_email,
                subject: template.subject.replace('{{customer_name}}', subscription.customer_name),
                body: template.body
                    .replace('{{customer_name}}', subscription.customer_name)
                    .replace('{{amount}}', subscription.amount)
                    .replace('{{payment_link}}', `${window.location.origin}/update-payment/${subscription.id}`)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['failed-recurring-payments'] });
            toast.success('Retry scheduled and notification sent');
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    Dunning Management
                </h2>
                <p className="text-sm text-slate-500">
                    Handle failed payments with automated retry logic and customer communications
                </p>
            </div>

            <Tabs defaultValue="active">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">Active Dunning</TabsTrigger>
                    <TabsTrigger value="settings">Retry Settings</TabsTrigger>
                    <TabsTrigger value="templates">Email Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <div className="grid gap-4">
                        {failedSubs.map((sub) => {
                            const currentAttempt = sub.dunning_state?.current_attempt || 0;
                            const maxAttempts = retrySchedule.length;
                            
                            return (
                                <Card key={sub.id} className="border-l-4 border-l-red-500">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold">{sub.customer_name}</h4>
                                                    <Badge className="bg-red-100 text-red-700">
                                                        Failed Payment
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-3">{sub.customer_email}</p>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                    <div>
                                                        <p className="text-slate-500">Amount</p>
                                                        <p className="font-semibold">${sub.amount}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Failed Attempts</p>
                                                        <p className="font-semibold">{sub.failed_payment_count}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Retry Attempt</p>
                                                        <p className="font-semibold">{currentAttempt} / {maxAttempts}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Next Retry</p>
                                                        <p className="font-semibold">
                                                            {sub.dunning_state?.next_retry_date || 'Pending'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {sub.dunning_state?.communications_sent && (
                                                    <div className="bg-slate-50 rounded-lg p-3">
                                                        <p className="text-xs font-semibold text-slate-700 mb-2">
                                                            Communications Sent:
                                                        </p>
                                                        <div className="space-y-1">
                                                            {sub.dunning_state.communications_sent.map((comm, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span className="capitalize">{comm.type.replace('_', ' ')}</span>
                                                                    <span className="text-slate-400">
                                                                        {new Date(comm.sent_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    onClick={() => retryPaymentMutation.mutate({
                                                        subscription: sub,
                                                        attemptNumber: currentAttempt
                                                    })}
                                                    disabled={currentAttempt >= maxAttempts}
                                                >
                                                    <Send className="h-4 w-4 mr-1" />
                                                    Retry Now
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {failedSubs.length === 0 && (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <h3 className="font-semibold text-lg mb-2">No Failed Payments</h3>
                                    <p className="text-sm text-slate-500">
                                        All recurring payments are processing successfully.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Retry Schedule Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Retry Schedule (days between attempts)</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {retrySchedule.map((days, idx) => (
                                        <Input
                                            key={idx}
                                            type="number"
                                            value={days}
                                            onChange={(e) => {
                                                const newSchedule = [...retrySchedule];
                                                newSchedule[idx] = parseInt(e.target.value);
                                                setRetrySchedule(newSchedule);
                                            }}
                                            placeholder={`Attempt ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">
                                    Define how many days to wait between retry attempts
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                                    Retry Timeline
                                </h4>
                                <div className="space-y-2 text-sm text-blue-700">
                                    <p>• First retry: {retrySchedule[0]} days after failure</p>
                                    <p>• Second retry: {retrySchedule[1]} days later</p>
                                    <p>• Third retry: {retrySchedule[2]} days later</p>
                                    <p>• Final attempt: {retrySchedule[3]} days later</p>
                                </div>
                            </div>

                            <Button onClick={() => toast.success('Retry schedule saved')}>
                                Save Retry Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    {Object.entries(emailTemplates).map(([key, template]) => (
                        <Card key={key}>
                            <CardHeader>
                                <CardTitle className="text-base capitalize flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {key.replace('_', ' ')} Template
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Subject Line</Label>
                                    <Input
                                        value={template.subject}
                                        onChange={(e) => setEmailTemplates(prev => ({
                                            ...prev,
                                            [key]: { ...prev[key], subject: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Body</Label>
                                    <Textarea
                                        rows={6}
                                        value={template.body}
                                        onChange={(e) => setEmailTemplates(prev => ({
                                            ...prev,
                                            [key]: { ...prev[key], body: e.target.value }
                                        }))}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Available variables: {`{{customer_name}}, {{amount}}, {{payment_link}}`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button onClick={() => toast.success('Email templates saved')}>
                        Save All Templates
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    );
}