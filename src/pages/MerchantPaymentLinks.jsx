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
import { Plus, Copy, ExternalLink, Trash2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantPaymentLinks() {
    const [selectedMID, setSelectedMID] = useState('');
    const [user, setUser] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        currency: 'USD'
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

    const { data: paymentLinks = [] } = useQuery({
        queryKey: ['payment-links', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.PaymentLink.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PaymentLink.create(data),
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

    const handleSubmit = () => {
        const linkId = `PL-${Date.now()}`;
        createMutation.mutate({
            ...formData,
            merchant_id: user.merchant_id,
            merchant_name: user.merchant_name,
            link_id: linkId,
            link_url: `https://pay.example.com/${linkId}`,
            status: 'active'
        });
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', amount: '', currency: 'USD' });
    };

    const copyLink = (url) => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantPaymentLinks"
                user={user}
            />
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Payment Links</h1>
                            <p className="text-slate-500">Create shareable payment links</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Link
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Payment Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Link</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentLinks.map((link) => (
                                        <TableRow key={link.id}>
                                            <TableCell className="font-medium">{link.title}</TableCell>
                                            <TableCell>${link.amount} {link.currency}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs">{link.link_url}</code>
                                                    <Button size="icon" variant="ghost" onClick={() => copyLink(link.link_url)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={link.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                    {link.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(link.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Payment Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Input value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Create Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}