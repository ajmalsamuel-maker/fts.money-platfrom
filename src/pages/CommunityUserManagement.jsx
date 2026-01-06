import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Mail, Trash2, Search, Building2, Pencil, Shield, KeyRound, Layers } from 'lucide-react';

export default function CommunityUserManagement() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [passwordUser, setPasswordUser] = useState(null);
    const [servicesUser, setServicesUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteForm, setInviteForm] = useState({
        email: '',
        full_name: '',
        password: '',
        community_role: 'PSP Owner'
    });
    const [editForm, setEditForm] = useState({
        full_name: '',
        email: '',
        community_role: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        password: '',
        confirmPassword: ''
    });
    const [servicesForm, setServicesForm] = useState({
        allowed_services: []
    });
    const [error, setError] = useState('');

    const { data: communityUsers = [], isLoading: usersLoading } = useQuery({
        queryKey: ['community-users'],
        queryFn: async () => {
            const response = await base44.functions.invoke('platformAuthSimple', {
                action: 'listUsers',
                account_type: 'community'
            });
            return response.data.users || [];
        },
        enabled: !loading
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const inviteMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await base44.functions.invoke('communityAuth', {
                action: 'register',
                ...userData
            });
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create user');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['community-users']);
            setInviteOpen(false);
            setInviteForm({ email: '', full_name: '', password: '', community_role: 'PSP Owner' });
            setError('');
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await base44.functions.invoke('platformAuthSimple', {
                action: 'deleteUser',
                userId: userId
            });
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to delete user');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['community-users']);
            setDeleteUser(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ userId, updates }) => {
            await base44.asServiceRole.entities.AuthUser.update(userId, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['community-users']);
            setEditUser(null);
            setPasswordUser(null);
            setServicesUser(null);
            setPasswordForm({ password: '', confirmPassword: '' });
            setError('');
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleInvite = () => {
        if (!inviteForm.email || !inviteForm.full_name || !inviteForm.password) {
            setError('Please fill in all fields');
            return;
        }
        if (inviteForm.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        inviteMutation.mutate(inviteForm);
    };

    const filteredUsers = communityUsers.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getUserPSPCount = (email) => {
        return psps.filter(psp => psp.owner_email === email && !psp.is_template).length;
    };

    if (loading || usersLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CommunityUserManagement" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.communityUsers')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:subMenuItems.communityUsersDesc')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <UserPlus className="h-4 w-4" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Community Portal User</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <div>
                                        <Label>Full Name</Label>
                                        <Input
                                            value={inviteForm.full_name}
                                            onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <Label>Email Address</Label>
                                        <Input
                                            type="email"
                                            value={inviteForm.email}
                                            onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                                            placeholder="john@company.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>Initial Password</Label>
                                        <Input
                                            type="password"
                                            value={inviteForm.password}
                                            onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                                            placeholder="Minimum 8 characters"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">User will be able to change password after first login</p>
                                    </div>
                                    <div>
                                        <Label>Community Role</Label>
                                        <Select value={inviteForm.community_role} onValueChange={(v) => setInviteForm({...inviteForm, community_role: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PSP Owner">PSP Owner</SelectItem>
                                                <SelectItem value="PSP Administrator">PSP Administrator</SelectItem>
                                                <SelectItem value="Developer">Developer</SelectItem>
                                                <SelectItem value="Partner">Partner</SelectItem>
                                                <SelectItem value="Reseller">Reseller</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                                    <Button onClick={handleInvite} disabled={inviteMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                                        {inviteMutation.isPending ? 'Creating...' : 'Create User'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>

                <div className="p-6">
                    {/* Search */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users List */}
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Community Portal Users ({filteredUsers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        {searchQuery ? 'No users found matching your search' : 'No community users yet'}
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const pspCount = getUserPSPCount(user.email);
                                        return (
                                            <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{user.full_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Mail className="h-3 w-3 text-slate-400" />
                                                            <p className="text-sm text-slate-600">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-slate-400" />
                                                            <span className="text-sm font-medium text-slate-900">
                                                                {pspCount} PSP{pspCount !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Joined {new Date(user.created_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-blue-100 text-blue-700">
                                                        {user.community_role || 'PSP Owner'}
                                                    </Badge>
                                                    <Button
                                                       variant="ghost"
                                                       size="icon"
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           setServicesUser(user);
                                                           setServicesForm({
                                                               allowed_services: user.allowed_services || []
                                                           });
                                                       }}
                                                       className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                       title="Manage Services"
                                                    >
                                                       <Layers className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                       variant="ghost"
                                                       size="icon"
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           setPasswordUser(user);
                                                           setPasswordForm({ password: '', confirmPassword: '' });
                                                       }}
                                                       className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                       title="Change Password"
                                                    >
                                                       <KeyRound className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                       variant="ghost"
                                                       size="icon"
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           setEditUser(user);
                                                           setEditForm({
                                                               full_name: user.full_name,
                                                               email: user.email,
                                                               community_role: user.community_role || 'PSP Owner'
                                                           });
                                                       }}
                                                       className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                       title="Edit User"
                                                    >
                                                       <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                       variant="ghost"
                                                       size="icon"
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           setDeleteUser(user);
                                                       }}
                                                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                       title="Delete User"
                                                    >
                                                       <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-blue-600" />
                            Edit Community User
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <Label>Full Name</Label>
                            <Input
                                value={editForm.full_name}
                                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                placeholder="john@company.com"
                            />
                        </div>
                        <div>
                            <Label>Community Role</Label>
                            <Input
                                value={editForm.community_role}
                                onChange={(e) => setEditForm({...editForm, community_role: e.target.value})}
                                placeholder="PSP Owner"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                        <Button 
                            onClick={() => {
                                if (!editForm.email || !editForm.full_name) {
                                    setError('Please fill in all required fields');
                                    return;
                                }
                                updateMutation.mutate({
                                    userId: editUser.id,
                                    updates: {
                                        full_name: editForm.full_name,
                                        email: editForm.email,
                                        community_role: editForm.community_role
                                    }
                                });
                            }}
                            disabled={updateMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={!!passwordUser} onOpenChange={() => setPasswordUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-amber-600" />
                            Change Password
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <Label>User</Label>
                            <Input value={passwordUser?.full_name || ''} disabled className="bg-slate-50" />
                        </div>
                        <div>
                            <Label>New Password *</Label>
                            <Input
                                type="password"
                                value={passwordForm.password}
                                onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                        <div>
                            <Label>Confirm Password *</Label>
                            <Input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setPasswordUser(null)}>Cancel</Button>
                        <Button 
                            onClick={() => {
                                if (!passwordForm.password || passwordForm.password.length < 8) {
                                    setError('Password must be at least 8 characters');
                                    return;
                                }
                                if (passwordForm.password !== passwordForm.confirmPassword) {
                                    setError('Passwords do not match');
                                    return;
                                }
                                updateMutation.mutate({
                                    userId: passwordUser.id,
                                    updates: {
                                        password_hash: passwordForm.password // Backend will hash it
                                    }
                                });
                            }}
                            disabled={updateMutation.isPending}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Change Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Services Dialog */}
            <Dialog open={!!servicesUser} onOpenChange={() => setServicesUser(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-purple-600" />
                            Manage Service Access
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <Label>User</Label>
                            <Input value={servicesUser?.full_name || ''} disabled className="bg-slate-50" />
                        </div>
                        <div>
                            <Label>Allowed Services</Label>
                            <p className="text-xs text-slate-500 mb-3">Select which services this user can provision and access</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'psp', label: 'PSP Portal', icon: Building2 },
                                    { id: 'iso_gateway', label: 'ISO Gateway', icon: Shield },
                                    { id: 'orchestration', label: 'Orchestration Platform', icon: Layers },
                                    { id: 'crypto_gateway', label: 'Crypto Gateway (VASP)', icon: Shield },
                                    { id: 'rwa_platform', label: 'RWA Platform', icon: Building2 },
                                ].map(service => {
                                    const Icon = service.icon;
                                    const isSelected = servicesForm.allowed_services?.includes(service.id);
                                    return (
                                        <Button
                                            key={service.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className={`justify-start h-auto py-3 ${isSelected ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                            onClick={() => {
                                                const current = servicesForm.allowed_services || [];
                                                const updated = isSelected 
                                                    ? current.filter(s => s !== service.id)
                                                    : [...current, service.id];
                                                setServicesForm({ allowed_services: updated });
                                            }}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {service.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setServicesUser(null)}>Cancel</Button>
                        <Button 
                            onClick={() => {
                                updateMutation.mutate({
                                    userId: servicesUser.id,
                                    updates: {
                                        allowed_services: servicesForm.allowed_services
                                    }
                                });
                            }}
                            disabled={updateMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update Services'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Community User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {deleteUser?.full_name}? This will not delete their PSP instances, but they will lose access to the community portal.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteUser.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}