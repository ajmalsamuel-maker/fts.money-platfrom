import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Trash2, Pencil, Code } from 'lucide-react';
import { ISO_ROLES, getISORoleLabel } from '@/components/auth/isoGatewayPermissions';

export default function ISOGatewayUserManagement() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    
    const [inviteOpen, setInviteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [inviteForm, setInviteForm] = useState({
        customer_id: '',
        email: '',
        full_name: '',
        role: ISO_ROLES.VIEWER,
        password: ''
    });
    const [editForm, setEditForm] = useState({ full_name: '', role: '' });
    const [error, setError] = useState('');

    const { data: customers = [] } = useQuery({
        queryKey: ['iso-customers'],
        queryFn: async () => {
            const result = await base44.asServiceRole.entities.ISOGatewayCustomer.list();
            return result || [];
        }
    });

    const { data: users = [] } = useQuery({
        queryKey: ['iso-users'],
        queryFn: async () => {
            const result = await base44.asServiceRole.entities.ISOGatewayUser.list();
            return result || [];
        }
    });

    const inviteMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await base44.functions.invoke('isoGatewayUserManagement', {
                action: 'invite',
                ...userData
            });
            if (!response.data.success) throw new Error(response.data.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['iso-users']);
            setInviteOpen(false);
            setInviteForm({ customer_id: '', email: '', full_name: '', role: ISO_ROLES.VIEWER, password: '' });
            setError('');
        },
        onError: (err) => setError(err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            await base44.asServiceRole.entities.ISOGatewayUser.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['iso-users']);
            setEditOpen(false);
            setEditingUser(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await base44.asServiceRole.entities.ISOGatewayUser.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['iso-users']);
            setDeleteUser(null);
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="ISOGatewayUserManagement" userRole={getRoleLabel(platformUser?.platform_role)} userEmail={platformUser?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">ISO Gateway User Management</h2>
                        <p className="text-xs text-slate-600">Manage users across all ISO Gateway customers</p>
                    </div>
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                                <UserPlus className="h-4 w-4" />
                                Invite User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite ISO Gateway User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                                <div>
                                    <Label>Customer</Label>
                                    <Select value={inviteForm.customer_id} onValueChange={(v) => setInviteForm({...inviteForm, customer_id: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Full Name</Label><Input value={inviteForm.full_name} onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})} /></div>
                                <div><Label>Email</Label><Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})} /></div>
                                <div><Label>Password</Label><Input type="password" value={inviteForm.password} onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})} /></div>
                                <div>
                                    <Label>Role</Label>
                                    <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({...inviteForm, role: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ISO_ROLES).map(role => (
                                                <SelectItem key={role} value={role}>{getISORoleLabel(role)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={() => inviteMutation.mutate(inviteForm)} disabled={inviteMutation.isPending} className="w-full">
                                    {inviteMutation.isPending ? 'Inviting...' : 'Invite User'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5" />
                                ISO Gateway Users ({users.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {users.map((user) => {
                                    const customer = customers.find(c => c.id === user.customer_id);
                                    return (
                                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{user.full_name}</p>
                                                <p className="text-sm text-slate-600">{user.email}</p>
                                                <p className="text-xs text-slate-500">{customer?.company_name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={user.role === ISO_ROLES.OWNER ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}>
                                                    {getISORoleLabel(user.role)}
                                                </Badge>
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setEditForm({ full_name: user.full_name, role: user.role }); setEditOpen(true); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteUser(user)} className="text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div><Label>Full Name</Label><Input value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} /></div>
                        <div>
                            <Label>Role</Label>
                            <Select value={editForm.role} onValueChange={(v) => setEditForm({...editForm, role: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.values(ISO_ROLES).map(role => (
                                        <SelectItem key={role} value={role}>{getISORoleLabel(role)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => updateMutation.mutate({ id: editingUser.id, data: { ...editingUser, ...editForm } })} className="w-full">Update User</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete User</AlertDialogTitle><AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(deleteUser.id)} className="bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}