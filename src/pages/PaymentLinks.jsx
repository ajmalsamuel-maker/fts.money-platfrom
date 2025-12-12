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
import { Switch } from "@/components/ui/switch";
import { Copy, Plus, Link as LinkIcon, QrCode, Eye, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentLinks() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        merchant_id: '',
        merchant_name: '',
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        allow_custom_amount: false,
        collect_shipping: false,
        collect_billing: true,
        status: 'active'
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const { data: links = [] } = useQuery({
        queryKey: ['payment-links', selectedMerchant],
        queryFn: async () => {
            if (!selectedMerchant) return await base44.entities.PaymentLink.list('-created_date');
            return await base44.entities.PaymentLink.filter({ merchant_id: selectedMerchant }, '-created_date');
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            const linkId = `link_${Date.now()}`;
            const linkUrl = `${window.location.origin}/pay/${linkId}`;
            return base44.entities.PaymentLink.create({
                ...data,
                link_id: linkId,
                link_url: linkUrl,
                qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkUrl)}`
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-links']);
            setShowDialog(false);
            resetForm();
            toast.success('Payment link created');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PaymentLink.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-links']);
            toast.success('Payment link deleted');
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

    const handleSubmit = () => {
        createMutation.mutate({
            ...formData,
            amount: parseFloat(formData.amount)
        });
    };

    const resetForm = () => {
        setFormData({
            merchant_id: '',
            merchant_name: '',
            title: '',
            description: '',
            amount: '',
            currency: 'USD',
            allow_custom_amount: false,
            collect_shipping: false,
            collect_billing: true,
            status: 'active'
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="PaymentLinks" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <LinkIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Payment Links</h1>
                                <p className="text-slate-500">Generate shareable payment links and QR codes</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Create Link
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
                            <CardTitle>Payment Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Views</TableHead>
                                        <TableHead>Uses</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {links.map(link => (
                                        <TableRow key={link.id}>
                                            <TableCell className="font-medium">{link.title}</TableCell>
                                            <TableCell>{link.merchant_name}</TableCell>
                                            <TableCell>{link.currency} {link.amount.toFixed(2)}</TableCell>
                                            <TableCell><Eye className="h-4 w-4 inline mr-1" />{link.views_count || 0}</TableCell>
                                            <TableCell>{link.uses_count || 0}</TableCell>
                                            <TableCell>
                                                <Badge className={link.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                    {link.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.link_url)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => window.open(link.qr_code_url, '_blank')}>
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => window.open(link.link_url, '_blank')}>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(link.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Payment Link</DialogTitle>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Product or service name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount *</Label>
                                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="100.00" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Optional description" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Allow custom amount</Label>
                            <Switch checked={formData.allow_custom_amount} onCheckedChange={(val) => setFormData({...formData, allow_custom_amount: val})} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Collect shipping address</Label>
                            <Switch checked={formData.collect_shipping} onCheckedChange={(val) => setFormData({...formData, collect_shipping: val})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.merchant_id || !formData.title || !formData.amount}>Create Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}