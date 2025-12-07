import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Repeat, Pause, Play, StopCircle, CreditCard, Calendar, Edit } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MerchantSubscriptions({ merchant, subscriptions }) {
    const [selectedSub, setSelectedSub] = useState(null);
    const [showPaymentMethod, setShowPaymentMethod] = useState(false);
    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.RecurringPayment.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-subscriptions'] });
            toast.success('Subscription updated');
        }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'paused': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'dunning': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Repeat className="h-5 w-5 text-purple-600" />
                            My Subscriptions
                        </CardTitle>
                        <Badge variant="secondary">{subscriptions.length} total</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {subscriptions.map((sub) => (
                            <Card key={sub.id} className="border-2">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold">{sub.customer_name}</h3>
                                                <Badge className={getStatusColor(sub.status)}>
                                                    {sub.status}
                                                </Badge>
                                                {sub.ai_managed && (
                                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 text-xs">
                                                        AI Managed
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3">{sub.customer_email}</p>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-500">Amount</p>
                                                    <p className="font-semibold">${sub.amount} {sub.currency}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Frequency</p>
                                                    <p className="font-semibold capitalize">{sub.frequency}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Next Payment</p>
                                                    <p className="font-semibold">{sub.next_payment_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Total Paid</p>
                                                    <p className="font-semibold">${sub.total_amount_paid || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSub(sub);
                                                    setShowPaymentMethod(true);
                                                }}
                                            >
                                                <CreditCard className="h-4 w-4" />
                                            </Button>
                                            {sub.status === 'active' && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({ id: sub.id, status: 'paused' })}
                                                >
                                                    <Pause className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {sub.status === 'paused' && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({ id: sub.id, status: 'active' })}
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => updateStatusMutation.mutate({ id: sub.id, status: 'cancelled' })}
                                            >
                                                <StopCircle className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>

                                    {sub.description && (
                                        <p className="text-sm text-slate-600 mt-3 pt-3 border-t">{sub.description}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showPaymentMethod} onOpenChange={setShowPaymentMethod}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Payment Method</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Card Number</Label>
                            <Input placeholder="4111 1111 1111 1111" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Expiry Date</Label>
                                <Input placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2">
                                <Label>CVV</Label>
                                <Input placeholder="123" type="password" />
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => {
                            toast.success('Payment method updated');
                            setShowPaymentMethod(false);
                        }}>
                            Update Payment Method
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}