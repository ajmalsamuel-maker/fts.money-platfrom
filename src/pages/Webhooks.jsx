import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Zap, CheckCircle, XCircle, RotateCw, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function Webhooks() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        merchant_id: '',
        merchant_name: '',
        url: '',
        description: '',
        events: [],
        status: 'active'
    });

    const eventTypes = [
        'payment.succeeded', 'payment.failed', 'refund.created', 'refund.succeeded',
        'chargeback.created', 'chargeback.updated', 'dispute.created', 'dispute.resolved',
        'payout.created', 'payout.succeeded', 'payout.failed', 'customer.created',
        'customer.updated', 'subscription.created', 'subscription.updated', 'subscription.cancelled'
    ];

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const { data: webhooks = [] } = useQuery({
        queryKey: ['webhooks', selectedMerchant],
        queryFn: async () => {
            if (!selectedMerchant) return await base44.entities.WebhookEndpoint.list('-created_date');
            return await base44.entities.WebhookEndpoint.filter({ merchant_id: selectedMerchant }, '-created_date');
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            const secret = `whsec_${Math.random().toString(36).substring(2, 15)}`;
            return base44.entities.WebhookEndpoint.create({ ...data, secret });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['webhooks']);
            setShowDialog(false);
            resetForm();
            toast.success('Webhook endpoint created');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.WebhookEndpoint.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['webhooks']);
            toast.success('Webhook endpoint deleted');
        }
    });

    const handleMerchantChange = (merchantId) => {
        const merchant = merchants.find(m => m.id === merchantId);
        setFormData({
            ...formData,
            merchant_id: merchantId,
            merchant_name: merchant?.business_name || ''
        });
    };

    const handleEventToggle = (event) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }));
    };

    const handleSubmit = () => {
        createMutation.mutate(formData);
    };

    const resetForm = () => {
        setFormData({
            merchant_id: '',
            merchant_name: '',
            url: '',
            description: '',
            events: [],
            status: 'active'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Webhooks" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Webhooks</h1>
                                <p className="text-slate-500">Manage webhook endpoints and event subscriptions</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4" /> Add Endpoint
                        </Button>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Filter by merchant" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>All Merchants</SelectItem>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Webhook Endpoints</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Events</TableHead>
                                        <TableHead>Success Rate</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhooks.map(webhook => {
                                        const successRate = webhook.delivery_count > 0 
                                            ? ((webhook.success_count / webhook.delivery_count) * 100).toFixed(1)
                                            : 0;
                                        return (
                                            <TableRow key={webhook.id}>
                                                <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                                                <TableCell>{webhook.merchant_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{webhook.events.length} events</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-emerald-500" 
                                                                style={{ width: `${successRate}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm">{successRate}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        webhook.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        webhook.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {webhook.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <RotateCw className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(webhook.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Webhook Endpoint</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Merchant *</Label>
                            <Select value={formData.merchant_id} onValueChange={handleMerchantChange}>
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
                        <div className="space-y-2">
                            <Label>Endpoint URL *</Label>
                            <Input 
                                value={formData.url} 
                                onChange={(e) => setFormData({...formData, url: e.target.value})} 
                                placeholder="https://your-domain.com/webhooks" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                placeholder="Optional description" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Event Types *</Label>
                            <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                                {eventTypes.map(event => (
                                    <div key={event} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={event}
                                            checked={formData.events.includes(event)}
                                            onCheckedChange={() => handleEventToggle(event)}
                                        />
                                        <label htmlFor={event} className="text-sm cursor-pointer">
                                            {event}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={!formData.merchant_id || !formData.url || formData.events.length === 0}
                        >
                            Create Endpoint
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}