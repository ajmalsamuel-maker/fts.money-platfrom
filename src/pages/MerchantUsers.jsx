import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { AuditLogger } from '@/components/audit/AuditLogger';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { 
    Users, Plus, Search, Key, Mail, Copy, Check, Eye, EyeOff, Loader2, CheckCircle, XCircle,
    Shield, Lock, Activity, Clock, AlertCircle, UserCog, Trash2, RefreshCw, Settings
} from 'lucide-react';

const rolePermissions = {
    admin: ['view_dashboard', 'manage_transactions', 'manage_users', 'manage_terminals', 'view_reports', 'export_data', 'manage_settings'],
    manager: ['view_dashboard', 'manage_transactions', 'view_reports', 'export_data', 'manage_terminals'],
    operator: ['view_dashboard', 'manage_transactions', 'view_reports'],
    viewer: ['view_dashboard', 'view_reports']
};

export default function MerchantUsers() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showCredentialsDialog, setShowCredentialsDialog] = useState(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(null);
    const [showPasswordDialog, setShowPasswordDialog] = useState(null);
    const [showPermissionsDialog, setShowPermissionsDialog] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const queryClient = useQueryClient();

    const [newUser, setNewUser] = useState({ full_name: '', email: '', merchant_id: '', role: 'operator', phone: '' });
    const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });

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
                merchant_code: merchant?.merchant_code,
                status: 'pending',
                temp_password: tempPassword,
                must_change_password: true
            });
            
            // Sync to PostgreSQL
            try {
                await base44.functions.invoke('syncMerchantUser', { user });
            } catch (e) {
                console.error('Failed to sync to PostgreSQL:', e);
            }
            
            // Audit log
            await AuditLogger.logMerchantUserCreated(user);
            
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

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const user = users.find(u => u.id === id);
            const oldStatus = user?.status;
            await base44.entities.MerchantUser.update(id, { status });
            await AuditLogger.logMerchantUserStatusChanged({ ...user, id }, oldStatus, status);
            return { id, status };
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchant-users'] })
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const user = users.find(u => u.id === id);
            
            // Check if role changed
            if (data.role && user.role !== data.role) {
                await AuditLogger.logMerchantUserRoleChanged({ ...user, id }, user.role, data.role);
            }
            
            const updated = await base44.entities.MerchantUser.update(id, data);
            
            // Sync to PostgreSQL
            try {
                await base44.functions.invoke('syncMerchantUser', { user: updated });
            } catch (e) {
                console.error('Failed to sync to PostgreSQL:', e);
            }
            
            return { id, data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-users'] });
            setShowDetailsDialog(null);
            setShowPermissionsDialog(null);
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ id, email, full_name }) => {
            const user = users.find(u => u.id === id);
            const tempPassword = `Reset${Math.random().toString(36).slice(2, 10)}!`;
            await base44.entities.MerchantUser.update(id, { 
                temp_password: tempPassword,
                must_change_password: true 
            });
            
            // Audit log
            await AuditLogger.logMerchantUserPasswordReset({ ...user, id, email, full_name });
            
            try {
                await base44.integrations.Core.SendEmail({
                    to: email,
                    subject: 'Password Reset - Merchant Portal',
                    body: `Dear ${full_name},\n\nYour password has been reset.\n\nNew Temporary Password: ${tempPassword}\n\nPlease change your password upon next login.\n\nBest regards,\nPaymentHub Team`
                });
            } catch (e) {}
            
            return tempPassword;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchant-users'] })
    });

    const setPasswordMutation = useMutation({
        mutationFn: async ({ id, password }) => {
            await base44.entities.MerchantUser.update(id, { 
                temp_password: password,
                must_change_password: false 
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-users'] });
            setShowPasswordDialog(null);
            setPasswordForm({ password: '', confirmPassword: '' });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            const user = users.find(u => u.id === id);
            await AuditLogger.logMerchantUserDeleted({ ...user, id });
            await base44.entities.MerchantUser.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant-users'] });
            setShowDetailsDialog(null);
        }
    });

    const toggle2FAMutation = useMutation({
        mutationFn: async ({ id, enabled }) => {
            const user = users.find(u => u.id === id);
            await base44.entities.MerchantUser.update(id, { two_factor_enabled: enabled });
            await AuditLogger.logMerchantUser2FAToggled({ ...user, id }, enabled);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchant-users'] })
    });

    const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMerchant = merchantFilter === 'all' || u.merchant_id === merchantFilter;
        const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesMerchant && matchesStatus && matchesRole;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="MerchantUsers" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Merchant User Management</h1>
                            <p className="text-slate-500">Comprehensive portal access and permission control</p>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={async () => {
                                    try {
                                        const { generateUniqueMerchantCode } = await import('@/components/merchants/MerchantCodeGenerator');
                                        let fixed = 0;
                                        for (const merchant of merchants) {
                                            if (!merchant.merchant_code) {
                                                const code = generateUniqueMerchantCode(merchant.business_name, merchants);
                                                await base44.entities.Merchant.update(merchant.id, { merchant_code: code });
                                                fixed++;
                                            }
                                        }
                                        queryClient.invalidateQueries({ queryKey: ['merchants'] });
                                        alert(`Fixed ${fixed} merchants with missing codes`);
                                    } catch (e) {
                                        alert('Failed: ' + e.message);
                                    }
                                }}
                                className="gap-2"
                            >
                                <Key className="h-4 w-4" />Fix Merchant Codes
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={async () => {
                                    try {
                                        const { generateUniqueMerchantCode } = await import('@/components/merchants/MerchantCodeGenerator');
                                        let merchantsFixed = 0;
                                        let usersFixed = 0;
                                        
                                        // First fix merchants
                                        for (const merchant of merchants) {
                                            if (!merchant.merchant_code) {
                                                const code = generateUniqueMerchantCode(merchant.business_name, merchants);
                                                await base44.entities.Merchant.update(merchant.id, { merchant_code: code });
                                                merchant.merchant_code = code;
                                                merchantsFixed++;
                                            }
                                        }
                                        
                                        // Then fix users
                                        for (const user of users) {
                                            const merchant = merchants.find(m => m.id === user.merchant_id);
                                            if (merchant?.merchant_code && user.merchant_code !== merchant.merchant_code) {
                                                await base44.entities.MerchantUser.update(user.id, { 
                                                    merchant_code: merchant.merchant_code 
                                                });
                                                await base44.functions.invoke('syncMerchantUser', { 
                                                    user: { ...user, merchant_code: merchant.merchant_code } 
                                                });
                                                usersFixed++;
                                            }
                                        }
                                        
                                        queryClient.invalidateQueries({ queryKey: ['merchants'] });
                                        queryClient.invalidateQueries({ queryKey: ['merchant-users'] });
                                        alert(`Fixed ${merchantsFixed} merchants and ${usersFixed} users with codes`);
                                    } catch (e) {
                                        alert('Failed: ' + e.message);
                                    }
                                }}
                                className="gap-2"
                            >
                                <UserCog className="h-4 w-4" />Fix All Codes
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={async () => {
                                    try {
                                        for (const user of users) {
                                            await base44.functions.invoke('syncMerchantUser', { user });
                                        }
                                        alert('All users synced to PostgreSQL');
                                    } catch (e) {
                                        alert('Sync failed: ' + e.message);
                                    }
                                }}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />Sync All to DB
                            </Button>
                            <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4" />Create User
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Users</p>
                                    <p className="text-xl font-bold">{users.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
                                <div>
                                    <p className="text-xs text-slate-500">Active</p>
                                    <p className="text-xl font-bold text-emerald-600">{users.filter(u => u.status === 'active').length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg"><Clock className="h-5 w-5 text-amber-600" /></div>
                                <div>
                                    <p className="text-xs text-slate-500">Pending</p>
                                    <p className="text-xl font-bold text-amber-600">{users.filter(u => u.status === 'pending').length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg"><Shield className="h-5 w-5 text-purple-600" /></div>
                                <div>
                                    <p className="text-xs text-slate-500">2FA Enabled</p>
                                    <p className="text-xl font-bold text-purple-600">{users.filter(u => u.two_factor_enabled).length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg"><Lock className="h-5 w-5 text-slate-600" /></div>
                                <div>
                                    <p className="text-xs text-slate-500">Admins</p>
                                    <p className="text-xl font-bold text-slate-600">{users.filter(u => u.role === 'admin').length}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="All Merchants" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Merchants</SelectItem>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="operator">Operator</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">All Users <Badge variant="secondary" className="ml-2">{filteredUsers.length}</Badge></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>User</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Merchant Code</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>2FA</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                       <TableRow>
                                           <TableCell colSpan={8} className="text-center py-12 text-slate-500">No users found</TableCell>
                                       </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setShowDetailsDialog(user)}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                            {user.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{user.full_name}</p>
                                                            <p className="text-sm text-slate-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-normal">{user.merchant_name}</Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono text-sm font-medium text-blue-600">
                                                        {user.merchant_code || <span className="text-slate-400">Not set</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={
                                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                        user.role === 'operator' ? 'bg-slate-100 text-slate-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.two_factor_enabled ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                                                            <Shield className="h-3 w-3" />Enabled
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-500">Disabled</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">
                                                    {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy HH:mm') : 'Never'}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex gap-1 justify-end">
                                                        {user.status === 'pending' && (
                                                            <Button variant="ghost" size="sm" className="gap-1 text-emerald-600" onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'active' })}>
                                                                <CheckCircle className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowPasswordDialog(user)} title="Reset Password">
                                                            <Key className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowDetailsDialog(user)} title="View Details">
                                                            <Settings className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
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

                    {/* User Credentials Dialog */}
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

                    {/* User Details Dialog */}
                    <Dialog open={!!showDetailsDialog} onOpenChange={() => setShowDetailsDialog(null)}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>User Details & Management</DialogTitle>
                                <DialogDescription>View and manage user information, permissions, and security settings</DialogDescription>
                            </DialogHeader>
                            {showDetailsDialog && (
                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                                        <TabsTrigger value="security">Security</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium">
                                                {showDetailsDialog.full_name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{showDetailsDialog.full_name}</h3>
                                                <p className="text-sm text-slate-500">{showDetailsDialog.email}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge className={showDetailsDialog.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                        {showDetailsDialog.status}
                                                    </Badge>
                                                    <Badge variant="secondary">{showDetailsDialog.role}</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>User ID</Label>
                                                <Input value={showDetailsDialog.user_id || 'N/A'} readOnly className="bg-slate-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phone</Label>
                                                <Input value={showDetailsDialog.phone || 'N/A'} readOnly className="bg-slate-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Merchant</Label>
                                                <Input value={showDetailsDialog.merchant_name} readOnly className="bg-slate-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Merchant Code</Label>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        value={showDetailsDialog.merchant_code || ''} 
                                                        onChange={(e) => setShowDetailsDialog({...showDetailsDialog, merchant_code: e.target.value})}
                                                        className="font-mono" 
                                                        placeholder="Enter merchant code"
                                                    />
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={async () => {
                                                            const merchant = merchants.find(m => m.id === showDetailsDialog.merchant_id);
                                                            if (merchant?.merchant_code) {
                                                                await updateUserMutation.mutateAsync({ 
                                                                    id: showDetailsDialog.id, 
                                                                    data: { merchant_code: merchant.merchant_code }
                                                                });
                                                                setShowDetailsDialog({...showDetailsDialog, merchant_code: merchant.merchant_code});
                                                            } else {
                                                                alert('Merchant does not have a merchant_code set');
                                                            }
                                                        }}
                                                        title="Fetch from Merchant"
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => {
                                                            updateUserMutation.mutate({ 
                                                                id: showDetailsDialog.id, 
                                                                data: { merchant_code: showDetailsDialog.merchant_code }
                                                            });
                                                        }}
                                                        disabled={!showDetailsDialog.merchant_code}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Click refresh to auto-fetch from merchant, or enter manually and save
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Created</Label>
                                                <Input value={showDetailsDialog.created_date ? format(new Date(showDetailsDialog.created_date), 'MMM d, yyyy') : 'N/A'} readOnly className="bg-slate-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Last Login</Label>
                                                <Input value={showDetailsDialog.last_login ? format(new Date(showDetailsDialog.last_login), 'MMM d, yyyy HH:mm') : 'Never'} readOnly className="bg-slate-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Password Change Required</Label>
                                                <Input value={showDetailsDialog.must_change_password ? 'Yes' : 'No'} readOnly className="bg-slate-50" />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <h4 className="font-medium">Quick Actions</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {showDetailsDialog.status === 'pending' && (
                                                    <Button className="w-full" onClick={() => { updateStatusMutation.mutate({ id: showDetailsDialog.id, status: 'active' }); }}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />Approve User
                                                    </Button>
                                                )}
                                                {showDetailsDialog.status === 'active' && (
                                                    <Button variant="outline" className="w-full" onClick={() => { updateStatusMutation.mutate({ id: showDetailsDialog.id, status: 'inactive' }); }}>
                                                        <XCircle className="h-4 w-4 mr-2" />Deactivate
                                                    </Button>
                                                )}
                                                {showDetailsDialog.status === 'inactive' && (
                                                    <Button className="w-full" onClick={() => { updateStatusMutation.mutate({ id: showDetailsDialog.id, status: 'active' }); }}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />Reactivate
                                                    </Button>
                                                )}
                                                <Button variant="outline" className="w-full" onClick={() => { setShowPasswordDialog(showDetailsDialog); setShowDetailsDialog(null); }}>
                                                    <Key className="h-4 w-4 mr-2" />Reset Password
                                                    </Button>
                                                <Button variant="outline" className="w-full" onClick={() => { 
                                                    resetPasswordMutation.mutate({ 
                                                        id: showDetailsDialog.id, 
                                                        email: showDetailsDialog.email, 
                                                        full_name: showDetailsDialog.full_name 
                                                    }); 
                                                }}>
                                                    <Mail className="h-4 w-4 mr-2" />Send Reset Email
                                                </Button>
                                                <Button variant="destructive" className="w-full col-span-2" onClick={() => { 
                                                    if (confirm('Are you sure you want to delete this user?')) {
                                                        deleteUserMutation.mutate(showDetailsDialog.id);
                                                    }
                                                }}>
                                                    <Trash2 className="h-4 w-4 mr-2" />Delete User
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="permissions" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>User Role</Label>
                                            <Select 
                                                value={showDetailsDialog.role} 
                                                onValueChange={(val) => updateUserMutation.mutate({ id: showDetailsDialog.id, data: { ...showDetailsDialog, role: val } })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin - Full access</SelectItem>
                                                    <SelectItem value="manager">Manager - Transaction & reports</SelectItem>
                                                    <SelectItem value="operator">Operator - Basic operations</SelectItem>
                                                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                                            <h4 className="font-medium text-sm">Role Permissions</h4>
                                            <div className="space-y-2">
                                                {rolePermissions[showDetailsDialog.role]?.map(perm => (
                                                    <div key={perm} className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        <span className="text-slate-700">{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Allowed Terminals (Optional)</Label>
                                            <Textarea 
                                                placeholder="Comma-separated terminal IDs, or leave blank for all"
                                                value={(showDetailsDialog.allowed_terminals || []).join(', ')}
                                                onChange={(e) => {
                                                    const terminals = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                                    updateUserMutation.mutate({ id: showDetailsDialog.id, data: { ...showDetailsDialog, allowed_terminals: terminals } });
                                                }}
                                                rows={3}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="security" className="space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Two-Factor Authentication</p>
                                                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                                                </div>
                                                <Switch 
                                                    checked={showDetailsDialog.two_factor_enabled || false}
                                                    onCheckedChange={(checked) => {
                                                        toggle2FAMutation.mutate({ id: showDetailsDialog.id, enabled: checked });
                                                        setShowDetailsDialog({...showDetailsDialog, two_factor_enabled: checked});
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Security Status</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 border rounded-lg">
                                                    <p className="text-xs text-slate-500">Password Status</p>
                                                    <p className="text-sm font-medium">{showDetailsDialog.must_change_password ? 'Temporary' : 'Permanent'}</p>
                                                </div>
                                                <div className="p-3 border rounded-lg">
                                                    <p className="text-xs text-slate-500">2FA Status</p>
                                                    <p className="text-sm font-medium">{showDetailsDialog.two_factor_enabled ? 'Enabled' : 'Disabled'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <h4 className="font-medium">Security Actions</h4>
                                            <div className="space-y-2">
                                                <Button variant="outline" className="w-full justify-start" onClick={() => {
                                                    resetPasswordMutation.mutate({ 
                                                        id: showDetailsDialog.id, 
                                                        email: showDetailsDialog.email,
                                                        full_name: showDetailsDialog.full_name
                                                    });
                                                }}>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Force Password Reset
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start" onClick={() => {
                                                    updateUserMutation.mutate({ 
                                                        id: showDetailsDialog.id, 
                                                        data: { ...showDetailsDialog, must_change_password: true }
                                                    });
                                                }}>
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    Require Password Change on Next Login
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowDetailsDialog(null)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Password Management Dialog */}
                    <Dialog open={!!showPasswordDialog} onOpenChange={() => { setShowPasswordDialog(null); setPasswordForm({ password: '', confirmPassword: '' }); }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Password Management</DialogTitle>
                                <DialogDescription>Set or reset password for {showPasswordDialog?.full_name}</DialogDescription>
                            </DialogHeader>
                            {showPasswordDialog && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-700">Choose an option to manage this user's password</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start"
                                            onClick={() => {
                                                resetPasswordMutation.mutate({
                                                    id: showPasswordDialog.id,
                                                    email: showPasswordDialog.email,
                                                    full_name: showPasswordDialog.full_name
                                                });
                                                setShowPasswordDialog(null);
                                            }}
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Auto-Generate & Email Temporary Password
                                        </Button>
                                        
                                        <Separator className="my-3"><span className="px-2 bg-white text-xs text-slate-500">OR</span></Separator>
                                        
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label>Set Custom Password</Label>
                                                <Input 
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    value={passwordForm.password}
                                                    onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Confirm Password</Label>
                                                <Input 
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                />
                                            </div>
                                            <Button 
                                                className="w-full"
                                                disabled={!passwordForm.password || passwordForm.password !== passwordForm.confirmPassword}
                                                onClick={() => {
                                                    setPasswordMutation.mutate({
                                                        id: showPasswordDialog.id,
                                                        password: passwordForm.password
                                                    });
                                                }}
                                            >
                                                <Lock className="h-4 w-4 mr-2" />
                                                Set Password
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setShowPasswordDialog(null); setPasswordForm({ password: '', confirmPassword: '' }); }}>
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}