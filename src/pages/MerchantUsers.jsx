import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
    Users, Plus, Search, Key, Mail, Copy, Check, Eye, EyeOff, Loader2
} from 'lucide-react';

export default function MerchantUsers() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showCredentialsDialog, setShowCredentialsDialog] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const queryClient = useQueryClient();

    const [newUser, setNewUser] = useState({ full_name: '', email: '', merchant_id: '', role: 'operator', phone: '' });

    const { data: users = [] } = useQuery({
        queryKey: ['merchant-users'],
        queryFn: () => base44.entities.MerchantUser.list('-created_date'),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const createUser = useMutation({
        mutationFn: async (data) => {
            const merchant = merchants.find(m => m.id === data.merchant_id);
            const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!`;
            const user = await base44.entities.MerchantUser.create({
                ...data,
                user_id: `MU-${Date.now()}`,
                merchant_name: merchant?.business_name,
                status: 'pending',
                temp_password: tempPassword,
                must_change_password: true
            });
            
            // Send credentials email
            try {
                await base44.integrations.Core.SendEmail({
                    to: data.email,
                    subject: `Your PaymentHub Merchant Portal Credentials - ${merchant?.business_name}`,
                    body: `Dear ${data.full_name},\n\nYour merchant portal account has been created.\n\nLogin URL: https://merchant.paymenthub.com/login\nEmail: ${data.email}\nTemporary Password: ${tempPassword}\n\nPlease change your password upon first login.\n\nBest regards,\nPaymentHub Team`
                });
            } catch (e) {}
            
            return { ...user, temp_password: tempPassword };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['merchant-users'] });
            setShowCreateDialog(false);
            setShowCredentialsDialog(data);
            setNewUser({ full_name: '', email: '', merchant_id: '', role: 'operator', phone: '' });
        }
    });

    const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMerchant = merchantFilter === 'all' || u.merchant_id === merchantFilter;
        return matchesSearch && matchesMerchant;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="MerchantUsers" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold">Merchant Users</h1><p className="text-slate-500">Manage merchant portal login credentials</p></div>
                        <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Create User</Button>
                    </div>

                    <Card className="mb-6"><CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
                            <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                <SelectTrigger className="w-48"><SelectValue placeholder="All Merchants" /></SelectTrigger>
                                <SelectContent><SelectItem value="all">All Merchants</SelectItem>{merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </CardContent></Card>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Merchant</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>2FA</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">{user.full_name?.charAt(0)}</div>
                                                    <div><p className="font-medium">{user.full_name}</p><p className="text-sm text-slate-500">{user.email}</p></div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{user.merchant_name}</TableCell>
                                            <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                            <TableCell><Badge className={user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : user.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'}>{user.status}</Badge></TableCell>
                                            <TableCell>{user.two_factor_enabled ? <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge> : <Badge variant="outline">Off</Badge>}</TableCell>
                                            <TableCell><Button variant="ghost" size="sm" className="gap-1"><Key className="h-3 w-3" />Reset</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Merchant User</DialogTitle><DialogDescription>Create login credentials for merchant portal access</DialogDescription></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Merchant *</Label>
                                    <Select value={newUser.merchant_id} onValueChange={(v) => setNewUser(p => ({ ...p, merchant_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                        <SelectContent>{merchants.filter(m => m.status === 'active').map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Full Name *</Label><Input value={newUser.full_name} onChange={(e) => setNewUser(p => ({ ...p, full_name: e.target.value }))} /></div>
                                    <div className="space-y-2"><Label>Email *</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select value={newUser.role} onValueChange={(v) => setNewUser(p => ({ ...p, role: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="operator">Operator</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2"><Label>Phone</Label><Input value={newUser.phone} onChange={(e) => setNewUser(p => ({ ...p, phone: e.target.value }))} /></div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                <Button onClick={() => createUser.mutate(newUser)} disabled={!newUser.full_name || !newUser.email || !newUser.merchant_id || createUser.isPending}>
                                    {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create & Send Credentials
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={!!showCredentialsDialog} onOpenChange={() => setShowCredentialsDialog(null)}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>User Created Successfully</DialogTitle><DialogDescription>Credentials have been sent to the user's email</DialogDescription></DialogHeader>
                            {showCredentialsDialog && (
                                <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <div className="flex gap-2"><Input value={showCredentialsDialog.email} readOnly className="bg-white" /><Button variant="outline" size="icon" onClick={() => copyToClipboard(showCredentialsDialog.email)}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Temporary Password</Label>
                                        <div className="flex gap-2">
                                            <Input type={showPassword ? 'text' : 'password'} value={showCredentialsDialog.temp_password} readOnly className="bg-white font-mono" />
                                            <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(showCredentialsDialog.temp_password)}><Copy className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-emerald-700">User must change password on first login.</p>
                                </div>
                            )}
                            <DialogFooter><Button onClick={() => setShowCredentialsDialog(null)}>Close</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}