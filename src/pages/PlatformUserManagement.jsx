import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { useAuditLogger } from '@/components/audit/useAuditLogger';
import { usePermissions } from '@/components/auth/usePermissions';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Shield, Mail, Trash2, Ban, CheckCircle, Key } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function PlatformUserManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const { logUserCreated, logUserDeleted, logRoleChange, logPasswordChange } = useAuditLogger(platformUser);
    const { canEditUser, canDeleteUser, canChangeUserRole, hasPermission, PERMISSIONS } = usePermissions(platformUser);
    
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [resetPasswordUser, setResetPasswordUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [inviteForm, setInviteForm] = useState({
        email: '',
        full_name: '',
        role: PLATFORM_ROLES.VIEWER,
        password: ''
    });
    const [error, setError] = useState('');
    const [resetError, setResetError] = useState('');

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['platform-users'],
        queryFn: async () => {
            const authUsers = await base44.asServiceRole.entities.AuthUser.list();
            const platformUsers = authUsers.filter(u => u.data?.account_type === 'platform_admin');
            return platformUsers.map(u => ({
                id: u.id,
                email: u.data.email,
                full_name: u.data.full_name,
                platform_role: u.data.platform_role,
                account_type: u.data.account_type,
                last_login: u.data.last_login
            }));
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
        onSuccess: (data) => {
            queryClient.invalidateQueries(['platform-users']);
            setInviteOpen(false);
            setInviteForm({ email: '', full_name: '', role: PLATFORM_ROLES.VIEWER, password: '' });
            setError('');
            
            // Audit log
            logUserCreated({
                id: data.user?.id,
                email: inviteForm.email,
                full_name: inviteForm.full_name,
                role: inviteForm.role
            });
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
            
            // Audit log
            if (deleteUser) {
                logUserDeleted(deleteUser);
            }
            
            setDeleteUser(null);
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role, oldRole }) => {
            const user = users.find(u => u.id === userId);
            await base44.asServiceRole.entities.AuthUser.update(userId, {
                ...user,
                platform_role: role
            });
            return { user, oldRole, newRole: role };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['platform-users']);
            
            // Audit log
            if (data.user) {
                logRoleChange(data.user.email, data.user.id, data.oldRole, data.newRole);
            }
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ email, password }) => {
            const response = await base44.functions.invoke('resetPlatformPassword', {
                email,
                new_password: password
            });
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to reset password');
            }
            return response.data;
        },
        onSuccess: () => {
            // Audit log
            if (resetPasswordUser) {
                logPasswordChange(true); // changed by admin
            }
            
            setResetPasswordUser(null);
            setNewPassword('');
            setResetError('');
        },
        onError: (err) => {
            setResetError(err.message);
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
        return <div className="flex items-center justify-center h-screen">{t('common:labels.loading')}</div>;
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
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:pages.platformUsers.title')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:pages.platformUsers.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher variant="select" showLabel={true} />
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">{t('common:labels.loggedInAs')}</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                        <PermissionGate
                            user={platformUser}
                            permission={PERMISSIONS.USER_CREATE}
                        >
                            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                        <UserPlus className="h-4 w-4" />
                                        {t('platform:pages.platformUsers.inviteUser')}
                                    </Button>
                                </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('platform:pages.platformUsers.inviteNewUser')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div>
                                    <Label>{t('common:labels.fullName')}</Label>
                                    <Input
                                        value={inviteForm.full_name}
                                        onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label>{t('common:labels.email')}</Label>
                                    <Input
                                        type="email"
                                        value={inviteForm.email}
                                        onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                                        placeholder="john@fts.money"
                                    />
                                </div>
                                <div>
                                    <Label>{t('platform:pages.platformUsers.tempPassword')}</Label>
                                    <Input
                                        type="password"
                                        value={inviteForm.password}
                                        onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                                        placeholder={t('platform:pages.platformUsers.minCharacters')}
                                    />
                                </div>
                                <div>
                                    <Label>{t('common:labels.role')}</Label>
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
                                    {inviteMutation.isPending ? t('common:status.creating') : t('platform:pages.platformUsers.createUser')}
                                </Button>
                            </div>
                        </DialogContent>
                            </Dialog>
                        </PermissionGate>
                        </div>
                        </header>

                <div className="p-6">
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t('platform:pages.platformUsers.platformUsers')} ({users.length})
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
                                                onValueChange={(v) => {
                                                    if (!canChangeUserRole(user, v)) {
                                                        alert('You cannot change this user to that role');
                                                        return;
                                                    }
                                                    updateRoleMutation.mutate({ userId: user.id, role: v, oldRole: user.platform_role });
                                                }}
                                                disabled={!canEditUser(user) || user.email === platformUser?.email}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={PLATFORM_ROLES.SUPER_ADMIN} disabled={!canChangeUserRole(user, PLATFORM_ROLES.SUPER_ADMIN)}>
                                                        Super Admin
                                                    </SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.PLATFORM_ADMIN} disabled={!canChangeUserRole(user, PLATFORM_ROLES.PLATFORM_ADMIN)}>
                                                        Platform Admin
                                                    </SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.OPERATIONS}>Operations</SelectItem>
                                                    <SelectItem value={PLATFORM_ROLES.FINANCE_MANAGER}>Finance Manager</SelectItem>
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
                                            <PermissionGate
                                                user={platformUser}
                                                permission={PERMISSIONS.USER_RESET_PASSWORD_ANY}
                                                targetUser={user}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setResetPasswordUser(user)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="Reset Password"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </Button>
                                            </PermissionGate>
                                            {canDeleteUser(user) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Delete User"
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
                        <AlertDialogTitle>{t('platform:pages.platformUsers.deleteUser')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('platform:pages.platformUsers.confirmDelete', { name: deleteUser?.full_name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteUser.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t('common:actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!resetPasswordUser} onOpenChange={() => {
                setResetPasswordUser(null);
                setNewPassword('');
                setResetError('');
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('platform:pages.platformUsers.resetPassword')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <p className="text-sm text-slate-600">
                            {t('platform:pages.platformUsers.resettingPasswordFor')} <strong>{resetPasswordUser?.full_name}</strong> ({resetPasswordUser?.email})
                        </p>
                        {resetError && (
                            <Alert variant="destructive">
                                <AlertDescription>{resetError}</AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <Label>{t('platform:pages.platformUsers.newPassword')}</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('platform:pages.platformUsers.enterNewPassword')}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setResetPasswordUser(null);
                                    setNewPassword('');
                                    setResetError('');
                                }}
                                className="flex-1"
                            >
                                {t('common:actions.cancel')}
                            </Button>
                            <Button
                                onClick={() => {
                                    if (newPassword.length < 8) {
                                        setResetError('Password must be at least 8 characters');
                                        return;
                                    }
                                    resetPasswordMutation.mutate({ 
                                        email: resetPasswordUser.email, 
                                        password: newPassword 
                                    });
                                }}
                                disabled={resetPasswordMutation.isPending}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {resetPasswordMutation.isPending ? t('common:status.resetting') : t('platform:pages.platformUsers.resetPasswordBtn')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}