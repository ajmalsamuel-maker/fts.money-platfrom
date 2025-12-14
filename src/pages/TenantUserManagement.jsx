import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { TENANT_ROLES, getTenantRoleLabel } from '@/components/auth/TenantRBAC';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Shield, ArrowLeft, Trash2 } from 'lucide-react';

export default function TenantUserManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const tenantId = urlParams.get('tenant_id');
    
    const { platformUser, loading } = usePlatformAuth();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [inviteForm, setInviteForm] = useState({
        email: '',
        full_name: '',
        tenant_role: TENANT_ROLES.STANDARD_USER,
        password: ''
    });
    const [error, setError] = useState('');

    const { data: tenant } = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: async () => {
            const tenants = await base44.asServiceRole.entities.Tenant.list();
            return tenants.find(t => t.id === tenantId);
        },
        enabled: !!tenantId
    });

    const { data: tenantUsers = [] } = useQuery({
        queryKey: ['tenant-users', tenantId],
        queryFn: async () => {
            const users = await base44.asServiceRole.entities.TenantUser.list();
            return users.filter(u => u.tenant_id === tenantId);
        },
        enabled: !!tenantId
    });

    const inviteMutation = useMutation({
        mutationFn: async (userData) => {
            // First create AuthUser
            const authResponse = await base44.functions.invoke('platformAuth', {
                action: 'register',
                email: userData.email,
                full_name: userData.full_name,
                password: userData.password,
                role: 'viewer',
                tenant_id: tenantId
            });

            if (!authResponse.data.success) {
                throw new Error(authResponse.data.error);
            }

            // Then create TenantUser mapping
            await base44.asServiceRole.entities.TenantUser.create({
                tenant_id: tenantId,
                user_id: authResponse.data.user.id,
                email: userData.email,
                full_name: userData.full_name,
                tenant_role: userData.tenant_role
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tenant-users']);
            setInviteOpen(false);
            setInviteForm({ email: '', full_name: '', tenant_role: TENANT_ROLES.STANDARD_USER, password: '' });
            setError('');
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            await base44.asServiceRole.entities.TenantUser.update(userId, {
                tenant_role: role
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tenant-users']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            await base44.asServiceRole.entities.TenantUser.delete(userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tenant-users']);
            setDeleteUser(null);
        }
    });

    const handleInvite = () => {
        if (!inviteForm.email || !inviteForm.full_name || !inviteForm.password) {
            setError('Please fill in all fields');
            return;
        }
        inviteMutation.mutate(inviteForm);
    };

    if (loading || !tenant) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="TenantManagement" 
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
                            onClick={() => navigate(createPageUrl('TenantManagement'))}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">User Management - {tenant.tenant_name}</h2>
                            <p className="text-xs text-slate-600">Manage tenant users and their roles</p>
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
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <UserPlus className="h-4 w-4" />
                                    Invite User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite User to {tenant.tenant_name}</DialogTitle>
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
                                        <Label>Temporary Password</Label>
                                        <Input
                                            type="password"
                                            value={inviteForm.password}
                                            onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                                            placeholder="Minimum 8 characters"
                                        />
                                    </div>
                                    <div>
                                        <Label>Tenant Role</Label>
                                        <Select value={inviteForm.tenant_role} onValueChange={(v) => setInviteForm({...inviteForm, tenant_role: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={TENANT_ROLES.TENANT_ADMIN}>Tenant Admin</SelectItem>
                                                <SelectItem value={TENANT_ROLES.BILLING_MANAGER}>Billing Manager</SelectItem>
                                                <SelectItem value={TENANT_ROLES.SUPPORT_AGENT}>Support Agent</SelectItem>
                                                <SelectItem value={TENANT_ROLES.STANDARD_USER}>Standard User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {inviteForm.tenant_role === TENANT_ROLES.TENANT_ADMIN && 'Full access to all tenant features and settings'}
                                            {inviteForm.tenant_role === TENANT_ROLES.BILLING_MANAGER && 'Manage billing, invoices, and financial reports'}
                                            {inviteForm.tenant_role === TENANT_ROLES.SUPPORT_AGENT && 'Handle support tickets and user assistance'}
                                            {inviteForm.tenant_role === TENANT_ROLES.STANDARD_USER && 'Basic access to view PSPs and create tickets'}
                                        </p>
                                    </div>
                                    <Button onClick={handleInvite} disabled={inviteMutation.isPending} className="w-full">
                                        {inviteMutation.isPending ? 'Inviting...' : 'Invite User'}
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
                                Tenant Users ({tenantUsers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {tenantUsers.map((user) => (
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
                                                value={user.tenant_role}
                                                onValueChange={(v) => updateRoleMutation.mutate({ userId: user.id, role: v })}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={TENANT_ROLES.TENANT_ADMIN}>Tenant Admin</SelectItem>
                                                    <SelectItem value={TENANT_ROLES.BILLING_MANAGER}>Billing Manager</SelectItem>
                                                    <SelectItem value={TENANT_ROLES.SUPPORT_AGENT}>Support Agent</SelectItem>
                                                    <SelectItem value={TENANT_ROLES.STANDARD_USER}>Standard User</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Badge className={
                                                user.tenant_role === TENANT_ROLES.TENANT_ADMIN ? 'bg-purple-100 text-purple-700' :
                                                user.tenant_role === TENANT_ROLES.BILLING_MANAGER ? 'bg-green-100 text-green-700' :
                                                user.tenant_role === TENANT_ROLES.SUPPORT_AGENT ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }>
                                                {getTenantRoleLabel(user.tenant_role)}
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
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {deleteUser?.full_name} from this tenant?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteUser.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}