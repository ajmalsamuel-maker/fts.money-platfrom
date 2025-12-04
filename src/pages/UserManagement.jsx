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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
    UserCog, Plus, Search, MoreHorizontal, Shield, Mail, Edit, Trash2, CheckCircle, XCircle
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roles = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
    { value: 'admin', label: 'Admin', description: 'Administrative access' },
    { value: 'compliance_officer', label: 'Compliance Officer', description: 'KYC/AML and compliance' },
    { value: 'operations', label: 'Operations', description: 'Day-to-day operations' },
    { value: 'finance', label: 'Finance', description: 'Financial operations' },
    { value: 'support', label: 'Support', description: 'Customer support' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const allPermissions = [
    { id: 'merchant_view', label: 'View Merchants', category: 'Merchants' },
    { id: 'merchant_create', label: 'Create Merchants', category: 'Merchants' },
    { id: 'merchant_edit', label: 'Edit Merchants', category: 'Merchants' },
    { id: 'merchant_approve', label: 'Approve Merchants', category: 'Merchants' },
    { id: 'transaction_view', label: 'View Transactions', category: 'Transactions' },
    { id: 'transaction_refund', label: 'Process Refunds', category: 'Transactions' },
    { id: 'dispute_view', label: 'View Disputes', category: 'Disputes' },
    { id: 'dispute_manage', label: 'Manage Disputes', category: 'Disputes' },
    { id: 'user_manage', label: 'Manage Users', category: 'Admin' },
    { id: 'settings_manage', label: 'Manage Settings', category: 'Admin' },
    { id: 'reports_view', label: 'View Reports', category: 'Reports' },
    { id: 'reports_export', label: 'Export Reports', category: 'Reports' },
];

export default function UserManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'viewer', permissions: [], can_approve: false });
    const queryClient = useQueryClient();

    const { data: users = [] } = useQuery({
        queryKey: ['app-users'],
        queryFn: () => base44.entities.AppUser.list('-created_date'),
    });

    const createUser = useMutation({
        mutationFn: (data) => base44.entities.AppUser.create({ ...data, user_id: `USR-${Date.now()}`, status: 'active' }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['app-users'] }); setShowAddDialog(false); setNewUser({ full_name: '', email: '', role: 'viewer', permissions: [], can_approve: false }); }
    });

    const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    const togglePermission = (perm) => {
        setNewUser(prev => ({ ...prev, permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm] }));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="UserManagement" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-slate-500">Manage admin users and permissions</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Add User</Button>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Can Approve</TableHead><TableHead></TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">{user.full_name?.charAt(0)}</div>
                                                    <div><p className="font-medium">{user.full_name}</p><p className="text-sm text-slate-500">{user.email}</p></div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{roles.find(r => r.value === user.role)?.label || user.role}</Badge></TableCell>
                                            <TableCell><Badge className={user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>{user.status}</Badge></TableCell>
                                            <TableCell>{user.can_approve ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-slate-300" />}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Full Name *</Label><Input value={newUser.full_name} onChange={(e) => setNewUser(p => ({ ...p, full_name: e.target.value }))} /></div>
                                    <div className="space-y-2"><Label>Email *</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select value={newUser.role} onValueChange={(v) => setNewUser(p => ({ ...p, role: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2"><Label>Department</Label><Input value={newUser.department || ''} onChange={(e) => setNewUser(p => ({ ...p, department: e.target.value }))} /></div>
                                </div>
                                <div className="flex items-center gap-2"><Switch checked={newUser.can_approve} onCheckedChange={(c) => setNewUser(p => ({ ...p, can_approve: c }))} /><Label>Can approve requests (Checker)</Label></div>
                                <div className="space-y-2">
                                    <Label>Permissions</Label>
                                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                                        {allPermissions.map(p => (
                                            <div key={p.id} className="flex items-center gap-2">
                                                <Checkbox checked={newUser.permissions.includes(p.id)} onCheckedChange={() => togglePermission(p.id)} />
                                                <span className="text-sm">{p.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                                <Button onClick={() => createUser.mutate(newUser)} disabled={!newUser.full_name || !newUser.email}>Create User</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}