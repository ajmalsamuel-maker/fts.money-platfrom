import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_PERMISSIONS, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Shield, Mail, Trash2, Ban, CheckCircle } from 'lucide-react';

export default function PlatformUserManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [inviteForm, setInviteForm] = useState({
        email: '',
        full_name: '',
        role: PLATFORM_ROLES.VIEWER,
        password: ''
    });
    const [error, setError] = useState('');

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['platform-users'],
        queryFn: async () => {
            // List all AuthUser records
            const allUsers = await base44.asServiceRole.entities.AuthUser.list();
            
            // Filter for platform_admin account_type
            const platformAdmins = allUsers.filter(u => u.account_type === 'platform_admin');
            
            return platformAdmins;
        },
        enabled: !loading
    });

    const inviteMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await base44.functions.invoke('platformAuth', {
                action: 'register',
                ...userData
            });
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create user');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['platform-users']);
            setInviteOpen(false);
            setInviteForm({ email: '', full_name: '', role: PLATFORM_ROLES.VIEWER, password: '' });
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
            queryClient.invalidateQueries(['platform-users']);
            setDeleteUser(null);
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            const user = users.find(u => u.id === userId);
            await base44.asServiceRole.entities.AuthUser.update(userId, {
                ...user,
                platform_role: role
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['platform-users']);
        }
    });

    const handleInvite = () => {
        if (!inviteForm.email || !inviteForm.full_name || !inviteForm.password) {
            setError('Please fill in all fields');
            return;
        }
        inviteMutation.mutate(inviteForm);
    };

    if (loading || usersLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PlatformUserManagement" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
                        <p className="text-xs text-slate-600">Manage platform administrators and their permissions</p>
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
                                    Invite User
                                </Button>
                            </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite New Platform User</DialogTitle>
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
                                        placeholder="john@fts.money"
                                    />
                                </div>
                                <div>
                                    <Label>Temporary Password</Label>
                                    <Input
                                        type="password"
                                        value={inviteForm.password}
                                        onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                                        placeholder="Minimum 8 characters"
                                    />
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({...inviteForm, role: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={PLATFORM_ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
                                            <SelectItem value={PLATFORM_ROLES.PLATFORM_ADMIN}>Platform Admin</SelectItem>
                                            <SelectItem value={PLATFORM_ROLES.OPERATIONS}>Operations</SelectItem>
                                            <SelectItem value={PLATFORM_ROLES.FINANCE}>Finance</SelectItem>
                                            <SelectItem value={PLATFORM_ROLES.SUPPORT}>Support</SelectItem>
                                            <SelectItem value={PLATFORM_ROLES.VIEWER}>Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleInvite} disabled={inviteMutation.isPending} className="w-full">
                                    {inviteMutation.isPending ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </DialogContent>
                        </Dialog>
                    </div>
                </header>

                <div className="p-6">
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Platform Users ({users.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                    <p className="font-medium text-slate-900">{user.full_name}</p>
                                                    <p className="text-sm text-slate-600">{user.email}</p>
                                                </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={user.platform_role}
                                                onValueChange={(v) => updateRoleMutation.mutate({ userId: user.id, role: v })}
                                                disabled={user.email === platformUser?.email}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={PLATFORM_ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.PLATFORM_ADMIN}>Platform Admin</SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.OPERATIONS}>Operations</SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.FINANCE}>Finance</SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.SUPPORT}>Support</SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.VIEWER}>Viewer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Badge className={
                                                user.platform_role === PLATFORM_ROLES.SUPER_ADMIN ? 'bg-red-100 text-red-700' :
                                                user.platform_role === PLATFORM_ROLES.PLATFORM_ADMIN ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }>
                                                {getRoleLabel(user.platform_role)}
                                            </Badge>
                                            {user.email !== platformUser?.email && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {deleteUser?.full_name}? This action cannot be undone.
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