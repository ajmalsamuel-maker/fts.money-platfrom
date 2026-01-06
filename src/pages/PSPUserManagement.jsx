import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
    Search, 
    MoreHorizontal, 
    Shield,
    UserCog,
    Users,
    Crown,
    Eye,
    KeyRound,
    Mail,
    Clock,
    Building2,
    Check,
    Plus,
    Loader2,
} from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { usePermissions } from '@/components/auth/usePermissions';
import { ROLE_CONFIG } from '@/components/auth/permissions';
import { getStaffSession } from '@/components/auth/useStaffAuth';

export default function PSPUserManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [tfaData, setTfaData] = useState({ enabled: false, method: 'email' });
    const [confirmRoleChange, setConfirmRoleChange] = useState(null);
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', full_name: '', app_role: 'viewer', department: '', password: '', confirmPassword: '' });
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('active');

    const queryClient = useQueryClient();
    const { can, loading: permLoading, userRole, user: currentUser } = usePermissions();
    
    const [userPspCode, setUserPspCode] = useState(null);
    
    React.useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            setUserPspCode(session?.psp_code);
        }
    }, []);

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['psp-users', userPspCode],
        queryFn: async () => {
            const result = await base44.functions.invoke('managePSPUsers', {
                action: 'list',
                psp_code: userPspCode
            });
            return result.data?.users || [];
        },
        enabled: !!userPspCode,
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ userId, data }) => {
            const { data: response } = await base44.functions.invoke('managePSPUsers', {
                action: 'update',
                psp_code: userPspCode,
                user_id: userId,
                updates: data
            });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psp-users', userPspCode] });
            setShowRoleDialog(false);
            setConfirmRoleChange(null);
            toast.success('User updated successfully');
        },
    });

    const inviteUserMutation = useMutation({
        mutationFn: async (userData) => {
            const { data } = await base44.functions.invoke('managePSPUsers', {
                action: 'create',
                psp_code: userPspCode,
                user_data: {
                    email: userData.email,
                    full_name: userData.full_name,
                    role: userData.app_role,
                    department: userData.department,
                    password: userData.password
                }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psp-users', userPspCode] });
            setShowAddUserDialog(false);
            setNewUser({ email: '', full_name: '', app_role: 'viewer', department: '', password: '', confirmPassword: '' });
            toast.success('User created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create user: ' + error.message);
        }
    });

    const filteredUsers = users.filter(u => {
        const matchesSearch = !searchQuery || 
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const userRole = u.role || u.app_role || 'viewer';
        const matchesRole = roleFilter === 'all' || userRole === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (user, newRole) => {
        setConfirmRoleChange({ user, newRole });
    };

    const confirmAndChangeRole = async () => {
        if (confirmRoleChange) {
            updateUserMutation.mutate({
                userId: confirmRoleChange.user.id,
                data: { role: confirmRoleChange.newRole }
            });
        }
    };

    const handleInviteUser = () => {
        if (!newUser.email || !newUser.full_name) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (!newUser.password || newUser.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (newUser.password !== newUser.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        inviteUserMutation.mutate(newUser);
    };

    if (permLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const roleStats = {
        total: users.length,
        admin: users.filter(u => (u.role || u.app_role) === 'admin').length,
        finance: users.filter(u => (u.role || u.app_role) === 'finance').length,
        operations: users.filter(u => (u.role || u.app_role) === 'operations').length,
        compliance: users.filter(u => (u.role || u.app_role) === 'compliance').length,
        technical: users.filter(u => (u.role || u.app_role) === 'technical').length,
        editor: users.filter(u => (u.role || u.app_role) === 'editor').length,
        viewer: users.filter(u => ((u.role || u.app_role) === 'viewer' || (!u.role && !u.app_role))).length,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="PSPUserManagement" />
            
            <div className={cn("transition-all duration-300", "lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-3 sm:p-6">
                    <Toaster position="top-right" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">User Management</h1>
                            <p className="text-sm sm:text-base text-slate-500">Manage PSP staff users and permissions</p>
                        </div>
                        <Button className="gap-2" onClick={() => setShowAddUserDialog(true)}>
                            <Plus className="h-4 w-4" />
                            Add User
                        </Button>
                    </div>

                    {/* Role Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-slate-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Total</p>
                                    <p className="text-xl font-bold">{roleStats.total}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <Crown className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Admins</p>
                                    <p className="text-xl font-bold text-red-600">{roleStats.admin}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Managers</p>
                                    <p className="text-xl font-bold text-emerald-600">{roleStats.finance + roleStats.operations}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <Eye className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Staff</p>
                                    <p className="text-xl font-bold text-purple-600">{roleStats.viewer + roleStats.editor}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="operations">Operations</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="h-5 w-5" />
                                User Accounts
                                <Badge variant="secondary">{filteredUsers.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => {
                                        const role = user.role || user.app_role || 'viewer';
                                        const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;

                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{user.full_name}</p>
                                                            <p className="text-sm text-slate-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(config.bgColor, config.textColor)}>
                                                        {config.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                                                        {user.status || 'active'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.department || '-'}</TableCell>
                                                <TableCell className="text-sm text-slate-600">
                                                    {user.last_login ? format(new Date(user.last_login), 'MMM dd, HH:mm') : 'Never'}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowRoleDialog(true); }}>
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Change Role
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowPasswordDialog(true); }}>
                                                                <KeyRound className="h-4 w-4 mr-2" />
                                                                Reset Password
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Add User Dialog */}
            <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new PSP staff account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Full Name *</Label>
                            <Input
                                value={newUser.full_name}
                                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <Label>Password *</Label>
                            <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Min 8 characters"
                            />
                        </div>
                        <div>
                            <Label>Confirm Password *</Label>
                            <Input
                                type="password"
                                value={newUser.confirmPassword}
                                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={newUser.app_role} onValueChange={(val) => setNewUser({ ...newUser, app_role: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Cancel</Button>
                        <Button onClick={handleInviteUser}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <AlertDialog open={!!confirmRoleChange} onOpenChange={() => setConfirmRoleChange(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change {confirmRoleChange?.user?.full_name}'s role to {ROLE_CONFIG[confirmRoleChange?.newRole]?.label}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAndChangeRole}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Set Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>Set a new password for {selectedUser?.full_name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Password *</Label>
                            <Input
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Confirm Password *</Label>
                            <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={async () => {
                                if (passwordData.password.length < 8) {
                                    toast.error('Password must be at least 8 characters');
                                    return;
                                }
                                if (passwordData.password !== passwordData.confirmPassword) {
                                    toast.error('Passwords do not match');
                                    return;
                                }
                                try {
                                    await base44.functions.invoke('managePSPUsers', {
                                        action: 'update',
                                        psp_code: userPspCode,
                                        user_id: selectedUser.id,
                                        password: passwordData.password
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['psp-users', userPspCode] });
                                    toast.success('Password updated successfully');
                                    setShowPasswordDialog(false);
                                    setPasswordData({ password: '', confirmPassword: '' });
                                } catch (error) {
                                    toast.error('Failed to update password: ' + error.message);
                                }
                            }}
                        >
                            Update Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}