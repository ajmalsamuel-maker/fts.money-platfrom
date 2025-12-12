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
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function SubMerchants() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        platform_merchant_id: '',
        sub_merchant_id: '',
        business_name: '',
        legal_name: '',
        email: '',
        phone: '',
        business_type: 'company',
        payout_split_percentage: 80,
        payout_schedule: 'weekly'
    });

    const queryClient = useQueryClient();

    const { data: subMerchants = [] } = useQuery({
        queryKey: ['sub-merchants'],
        queryFn: () => base44.entities.SubMerchant.list()
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.SubMerchant.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sub-merchants']);
            setDialogOpen(false);
        }
    });

    const totalVolume = subMerchants.reduce((sum, s) => sum + (s.total_volume || 0), 0);
    const pendingPayouts = subMerchants.reduce((sum, s) => sum + (s.pending_payout_amount || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="SubMerchants" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Sub-Merchants</h1>
                                    <p className="text-slate-500">Platform marketplace management</p>
                                </div>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Onboard Sub-Merchant
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Onboard New Sub-Merchant</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                        <div className="col-span-2">
                                            <Label>Platform Merchant</Label>
                                            <Select value={formData.platform_merchant_id} onValueChange={(v) => setFormData({...formData, platform_merchant_id: v})}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {merchants.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Sub-Merchant ID</Label>
                                            <Input
                                                value={formData.sub_merchant_id}
                                                onChange={(e) => setFormData({...formData, sub_merchant_id: e.target.value})}
                                                placeholder="AUTO-GENERATED"
                                            />
                                        </div>
                                        <div>
                                            <Label>Business Type</Label>
                                            <Select value={formData.business_type} onValueChange={(v) => setFormData({...formData, business_type: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="individual">Individual</SelectItem>
                                                    <SelectItem value="company">Company</SelectItem>
                                                    <SelectItem value="non_profit">Non-Profit</SelectItem>
                                                    <SelectItem value="government">Government</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Business Name</Label>
                                            <Input
                                                value={formData.business_name}
                                                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Legal Name</Label>
                                            <Input
                                                value={formData.legal_name}
                                                onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Phone</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Payout Split %</Label>
                                            <Input
                                                type="number"
                                                value={formData.payout_split_percentage}
                                                onChange={(e) => setFormData({...formData, payout_split_percentage: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Payout Schedule</Label>
                                            <Select value={formData.payout_schedule} onValueChange={(v) => setFormData({...formData, payout_schedule: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="on_demand">On Demand</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button onClick={() => createMutation.mutate(formData)} className="w-full mt-4">
                                        Create Sub-Merchant
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
                                        <p className="text-sm text-slate-500">Total Sub-Merchants</p>
                                        <p className="text-2xl font-bold">{subMerchants.length}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Active</p>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            {subMerchants.filter(s => s.status === 'active').length}
                                        </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-emerald-600" />
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
                                    <TrendingUp className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Pending Payouts</p>
                                        <p className="text-2xl font-bold">${(pendingPayouts / 1000).toFixed(1)}k</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sub-Merchant Directory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Business Name</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Split %</TableHead>
                                        <TableHead>Volume</TableHead>
                                        <TableHead>Pending Payout</TableHead>
                                        <TableHead>KYB</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subMerchants.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                                No sub-merchants onboarded yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        subMerchants.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium">{sub.business_name}</TableCell>
                                                <TableCell>
                                                    {merchants.find(m => m.id === sub.platform_merchant_id)?.business_name || 'Unknown'}
                                                </TableCell>
                                                <TableCell className="capitalize">{sub.business_type}</TableCell>
                                                <TableCell>{sub.payout_split_percentage}%</TableCell>
                                                <TableCell>${((sub.total_volume || 0) / 1000).toFixed(0)}k</TableCell>
                                                <TableCell>${((sub.pending_payout_amount || 0) / 1000).toFixed(2)}k</TableCell>
                                                <TableCell>
                                                    <Badge className={sub.kyb_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                        {sub.kyb_verified ? 'Verified' : 'Pending'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        sub.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {sub.status}
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