import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Mail, Shield } from 'lucide-react';

export default function PSPUserManagement() {
    const queryClient = useQueryClient();
    const [selectedPSP, setSelectedPSP] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'user',
        psp_code: '',
        password: 'Welcome123!',
        status: 'active'
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['psp-list'],
        queryFn: async () => {
            const result = await base44.functions.invoke('managePSPUsers', { action: 'listPSPs' });
            return result.data.psps || [];
        }
    });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['psp-users', selectedPSP],
        queryFn: async () => {
            const result = await base44.functions.invoke('managePSPUsers', { 
                action: 'list',
                psp_code: selectedPSP || undefined
            });
            return result.data.users || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('managePSPUsers', { action: 'create', ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-users']);
            setDialogOpen(false);
            setEditingUser(null);
            setFormData({ email: '', full_name: '', role: 'user', psp_code: '', password: 'Welcome123!', status: 'active' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('managePSPUsers', { action: 'update', ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-users']);
            setDialogOpen(false);
            setEditingUser(null);
            setFormData({ email: '', full_name: '', role: 'user', psp_code: '', password: 'Welcome123!', status: 'active' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (user_id) => base44.functions.invoke('managePSPUsers', { action: 'delete', user_id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-users']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            updateMutation.mutate({ ...formData, user_id: editingUser.id });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            psp_code: user.psp_code || '',
            password: '',
            status: user.status
        });
        setDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">PSP User Management</h1>
                            <p className="text-slate-600">Manage users for PSP instances</p>
                        </div>
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-sm">Filter by PSP</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedPSP} onValueChange={setSelectedPSP}>
                            <SelectTrigger>
                                <SelectValue placeholder="All PSPs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>All PSPs</SelectItem>
                                {psps.map(psp => (
                                    <SelectItem key={psp.psp_code} value={psp.psp_code}>
                                        {psp.psp_name} ({psp.psp_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Users ({users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-center py-4 text-slate-600">Loading...</p>
                        ) : users.length === 0 ? (
                            <p className="text-center py-4 text-slate-600">No users found</p>
                        ) : (
                            <div className="space-y-3">
                                {users.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Mail className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{user.full_name}</p>
                                                <p className="text-sm text-slate-600">{user.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{user.psp_code}</Badge>
                                                <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {user.role}
                                                </Badge>
                                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                    {user.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => deleteMutation.mutate(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        setEditingUser(null);
                        setFormData({ email: '', full_name: '', role: 'user', psp_code: '', password: 'Welcome123!', status: 'active' });
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    disabled={!!editingUser}
                                />
                            </div>
                            <div>
                                <Label>Full Name</Label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <Label>PSP Code</Label>
                                <Select value={formData.psp_code} onValueChange={(value) => setFormData({...formData, psp_code: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select PSP" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {psps.map(psp => (
                                            <SelectItem key={psp.psp_code} value={psp.psp_code}>
                                                {psp.psp_name} ({psp.psp_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Role</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Default Password</Label>
                                <Input
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">
                                {editingUser ? 'Update User' : 'Create User'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}