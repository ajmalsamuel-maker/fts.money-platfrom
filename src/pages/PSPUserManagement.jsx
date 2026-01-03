import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Mail, Shield, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function PSPUserManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [selectedPSP, setSelectedPSP] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'user',
        psp_code: '',
        password: 'Welcome123!',
        status: 'active',
        two_factor_enabled: false
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['psp-list'],
        queryFn: async () => {
            const allPsps = await base44.entities.ProvisionedPSP.filter({ status: 'active' }, '-created_date');
            return allPsps || [];
        }
    });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['psp-users', selectedPSP],
        queryFn: async () => {
            const result = await base44.functions.invoke('managePSPUsers', { 
                action: 'list',
                psp_code: selectedPSP === 'all' ? undefined : selectedPSP
            });
            return result.data.users || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            try {
                const result = await base44.functions.invoke('managePSPUsers', { action: 'create', ...data });
                if (!result.data?.success) {
                    throw new Error(result.data?.error || 'Failed to create user');
                }
                return result;
            } catch (err) {
                // Extract the actual error message from various response formats
                const errorMsg = err.response?.data?.error || err.message || 'Unknown error occurred';
                throw new Error(errorMsg);
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries(['psp-users']);
            setDialogOpen(false);
            setEditingUser(null);
            setFormData({ email: '', full_name: '', role: 'user', psp_code: '', password: 'Welcome123!', status: 'active', two_factor_enabled: false });
            alert('User created successfully!');
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const result = await base44.functions.invoke('managePSPUsers', { action: 'update', ...data });
            if (!result.data?.success) {
                throw new Error(result.data?.error || 'Failed to update user');
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-users']);
            setDialogOpen(false);
            setEditingUser(null);
            setFormData({ email: '', full_name: '', role: 'user', psp_code: '', password: 'Welcome123!', status: 'active', two_factor_enabled: false });
            alert('User updated successfully!');
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
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
        if (!formData.psp_code) {
            alert('Please select a PSP');
            return;
        }
        
        // Check if email already exists for this PSP
        if (!editingUser) {
            const existingUser = users.find(u => 
                u.email.toLowerCase() === formData.email.toLowerCase() && 
                u.psp_code === formData.psp_code
            );
            if (existingUser) {
                alert(`A user with email ${formData.email} already exists for PSP ${formData.psp_code}`);
                return;
            }
        }
        
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
            status: user.status,
            two_factor_enabled: user.two_factor_enabled || false
        });
        setDialogOpen(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PSPUserManagement" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.pspAdministrators')}</h2>
                            <p className="text-xs text-slate-600">{t('platform:subMenuItems.pspAdministratorsDesc')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                        <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                </header>

                <div className="p-6">

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
                                <SelectItem value="all">All PSPs</SelectItem>
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
                                               {user.two_factor_enabled && (
                                                   <Badge className="bg-green-100 text-green-700">
                                                       <KeyRound className="h-3 w-3 mr-1" />
                                                       2FA
                                                   </Badge>
                                               )}
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
                        setFormData({ email: '', full_name: '', role: 'user', psp_code: '', password: 'Welcome123!', status: 'active', two_factor_enabled: false });
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
                                <Label>PSP Code *</Label>
                                <Select value={formData.psp_code} onValueChange={(value) => setFormData({...formData, psp_code: value})} required>
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
                            {editingUser && (
                                <div>
                                    <Label className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        New Password (leave blank to keep current)
                                    </Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder="Enter new password or leave blank"
                                    />
                                </div>
                            )}
                            {!editingUser && (
                                <div>
                                    <Label>Default Password</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            )}
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
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <KeyRound className="h-5 w-5 text-slate-600" />
                                    <div>
                                        <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                                        <p className="text-xs text-slate-500">Require 2FA for this user</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.two_factor_enabled}
                                    onCheckedChange={(checked) => setFormData({...formData, two_factor_enabled: checked})}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={!formData.psp_code || createMutation.isPending || updateMutation.isPending}>
                                {editingUser ? 'Update User' : 'Create User'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
                </div>
            </div>
        </div>
    );
}