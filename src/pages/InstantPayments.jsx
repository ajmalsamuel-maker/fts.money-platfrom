import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, TrendingUp, Globe, DollarSign } from 'lucide-react';

export default function InstantPayments() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        method_code: '',
        method_name: '',
        method_type: 'fednow',
        country: 'US',
        currency: 'USD',
        max_transaction_amount: 0,
        fee_percentage: 0,
        fee_fixed: 0
    });

    const queryClient = useQueryClient();

    const { data: methods = [] } = useQuery({
        queryKey: ['instant-payment-methods'],
        queryFn: () => base44.entities.InstantPaymentMethod.list()
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.InstantPaymentMethod.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['instant-payment-methods']);
            setDialogOpen(false);
            setFormData({
                method_code: '',
                method_name: '',
                method_type: 'fednow',
                country: 'US',
                currency: 'USD',
                max_transaction_amount: 0,
                fee_percentage: 0,
                fee_fixed: 0
            });
        }
    });

    const totalVolume = methods.reduce((sum, m) => sum + (m.total_volume || 0), 0);
    const totalTransactions = methods.reduce((sum, m) => sum + (m.total_transactions || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="InstantPayments" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Instant Payment Methods</h1>
                                    <p className="text-slate-500">FedNow, PIX, UPI, Faster Payments & more</p>
                                </div>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Zap className="h-4 w-4" />
                                        Add Payment Method
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Add Instant Payment Method</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Method Code</Label>
                                            <Input
                                                value={formData.method_code}
                                                onChange={(e) => setFormData({...formData, method_code: e.target.value})}
                                                placeholder="e.g., FEDNOW_USD"
                                            />
                                        </div>
                                        <div>
                                            <Label>Method Name</Label>
                                            <Input
                                                value={formData.method_name}
                                                onChange={(e) => setFormData({...formData, method_name: e.target.value})}
                                                placeholder="e.g., FedNow Instant"
                                            />
                                        </div>
                                        <div>
                                            <Label>Type</Label>
                                            <Select value={formData.method_type} onValueChange={(v) => setFormData({...formData, method_type: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fednow">FedNow (US)</SelectItem>
                                                    <SelectItem value="pix">PIX (Brazil)</SelectItem>
                                                    <SelectItem value="upi">UPI (India)</SelectItem>
                                                    <SelectItem value="faster_payments">Faster Payments (UK)</SelectItem>
                                                    <SelectItem value="sepa_instant">SEPA Instant (EU)</SelectItem>
                                                    <SelectItem value="pay_now">PayNow (Singapore)</SelectItem>
                                                    <SelectItem value="fast_pay">Fast Pay (Australia)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Country</Label>
                                            <Input
                                                value={formData.country}
                                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                                placeholder="US"
                                            />
                                        </div>
                                        <div>
                                            <Label>Currency</Label>
                                            <Input
                                                value={formData.currency}
                                                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                                placeholder="USD"
                                            />
                                        </div>
                                        <div>
                                            <Label>Max Transaction Amount</Label>
                                            <Input
                                                type="number"
                                                value={formData.max_transaction_amount}
                                                onChange={(e) => setFormData({...formData, max_transaction_amount: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Fee Percentage</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.fee_percentage}
                                                onChange={(e) => setFormData({...formData, fee_percentage: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Fixed Fee</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.fee_fixed}
                                                onChange={(e) => setFormData({...formData, fee_fixed: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={() => createMutation.mutate(formData)} className="w-full">
                                        Create Payment Method
                                    </Button>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Active Methods</p>
                                        <p className="text-2xl font-bold">{methods.filter(m => m.enabled).length}</p>
                                    </div>
                                    <Zap className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Volume</p>
                                        <p className="text-2xl font-bold">${(totalVolume / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Transactions</p>
                                        <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Countries</p>
                                        <p className="text-2xl font-bold">{new Set(methods.map(m => m.country)).size}</p>
                                    </div>
                                    <Globe className="h-8 w-8 text-cyan-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Instant Payment Methods</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Settlement</TableHead>
                                        <TableHead>Max Amount</TableHead>
                                        <TableHead>Fees</TableHead>
                                        <TableHead>Volume</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {methods.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                                No instant payment methods configured yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        methods.map((method) => (
                                            <TableRow key={method.id}>
                                                <TableCell className="font-medium">{method.method_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {method.method_type?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{method.country} · {method.currency}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-100 text-emerald-700">
                                                        {method.settlement_time?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{method.currency} {method.max_transaction_amount?.toLocaleString()}</TableCell>
                                                <TableCell className="text-xs">
                                                    {method.fee_percentage}% + {method.currency} {method.fee_fixed}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ${((method.total_volume || 0) / 1000).toFixed(0)}k
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={method.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                        {method.enabled ? 'Active' : 'Disabled'}
                                                    </Badge>
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
        </div>
    );
}