import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Mail, Trash2, Search, Building2 } from 'lucide-react';

export default function CommunityUserManagement() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteForm, setInviteForm] = useState({
        email: '',
        full_name: '',
        password: ''
    });
    const [error, setError] = useState('');

    const { data: communityUsers = [], isLoading: usersLoading } = useQuery({
        queryKey: ['community-users'],
        queryFn: async () => {
            const response = await base44.functions.invoke('getCommunityUsers');
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
            setInviteForm({ email: '', full_name: '', password: '' });
            setError('');
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            await base44.asServiceRole.entities.AuthUser.delete(userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['community-users']);
            setDeleteUser(null);
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
                        <h2 className="text-lg font-semibold text-slate-900">Community Portal Users</h2>
                        <p className="text-xs text-slate-600">Manage users who can create and manage PSP instances</p>
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
                                                        onClick={() => setDeleteUser(user)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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