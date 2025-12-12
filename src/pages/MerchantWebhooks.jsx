import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const eventTypes = [
    'payment.succeeded', 'payment.failed', 'refund.created', 'refund.succeeded',
    'chargeback.created', 'dispute.created', 'payout.succeeded'
];

export default function MerchantWebhooks() {
    const [selectedMID, setSelectedMID] = useState('');
    const [user, setUser] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        description: '',
        events: []
    });
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (err) {}
        };
        loadUser();
    }, []);

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const { data: webhooks = [] } = useQuery({
        queryKey: ['webhooks', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.WebhookEndpoint.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.WebhookEndpoint.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['webhooks']);
            setShowDialog(false);
            resetForm();
            toast.success('Webhook created');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.WebhookEndpoint.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['webhooks']);
            toast.success('Webhook deleted');
        }
    });

    const handleSubmit = () => {
        createMutation.mutate({
            ...formData,
            merchant_id: user.merchant_id,
            merchant_name: user.merchant_name,
            secret: `whsec_${Math.random().toString(36).substr(2, 32)}`,
            status: 'active'
        });
    };

    const resetForm = () => {
        setFormData({ url: '', description: '', events: [] });
    };

    const toggleEvent = (event) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantWebhooks"
                user={user}
            />
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Webhooks</h1>
                            <p className="text-slate-500">Receive real-time event notifications</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Webhook
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Webhooks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Events</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhooks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                                No webhooks configured
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        webhooks.map((webhook) => (
                                            <TableRow key={webhook.id}>
                                                <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {webhook.events?.slice(0, 2).map(e => (
                                                            <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                                                        ))}
                                                        {webhook.events?.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">+{webhook.events.length - 2}</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={webhook.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                        {webhook.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(webhook.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Webhook Endpoint</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input 
                                value={formData.url} 
                                onChange={(e) => setFormData({...formData, url: e.target.value})}
                                placeholder="https://example.com/webhook"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Events to subscribe</Label>
                            <div className="space-y-2">
                                {eventTypes.map(event => (
                                    <div key={event} className="flex items-center gap-2">
                                        <Checkbox 
                                            checked={formData.events.includes(event)}
                                            onCheckedChange={() => toggleEvent(event)}
                                        />
                                        <span className="text-sm">{event}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.url || formData.events.length === 0}>
                            Create Webhook
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}