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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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
    DropdownMenuSeparator,
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
    Pencil,
    KeyRound,
    Mail,
    Clock,
    Building2,
    Check,
    Plus,
    Loader2,
    Save,
    X
} from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AuditLogger } from '@/components/audit/AuditLogger';
import { usePermissions } from '@/components/auth/usePermissions';
import { AccessDenied } from '@/components/auth/PermissionGate';
import { ROLE_CONFIG, PERMISSIONS } from '@/components/auth/permissions';

export default function UserManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [tfaData, setTfaData] = useState({ enabled: false, method: 'email' });
    const [confirmRoleChange, setConfirmRoleChange] = useState(null);
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', full_name: '', app_role: 'viewer', department: '', password: '', confirmPassword: '' });
    const [editingPermissions, setEditingPermissions] = useState(false);
    const [permissionMatrix, setPermissionMatrix] = useState({...PERMISSIONS});
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('active');

    const queryClient = useQueryClient();
    const { can, loading: permLoading, userRole, user: currentUser } = usePermissions();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['all-users'],
        queryFn: async () => {
            const allUsers = await base44.entities.AppUser.list('-created_date');
            const staffRoles = ['admin', 'finance', 'operations', 'compliance', 'technical', 'editor', 'viewer'];
            return allUsers.filter(u => staffRoles.includes(u.role));
        },
        enabled: can('VIEW_USERS'),
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data }) => base44.entities.AppUser.update(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-users'] });
            setShowRoleDialog(false);
            setConfirmRoleChange(null);
        },
    });

    const inviteUserMutation = useMutation({
        mutationFn: async (userData) => {
            // Create a user record in AppUser entity
            const user = await base44.entities.AppUser.create({
                user_id: `USR-${Date.now()}`,
                email: userData.email,
                full_name: userData.full_name,
                role: userData.app_role,
                department: userData.department,
                status: 'active',
                password_hash: userData.password, // In production, hash this server-side
                must_change_password: false
            });
            await AuditLogger.logUserCreated(user, currentUser);
            return user;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-users'] });
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
            const oldRole = confirmRoleChange.user.role || confirmRoleChange.user.app_role || 'viewer';
            await AuditLogger.logUserRoleChanged(
                confirmRoleChange.user,
                oldRole,
                confirmRoleChange.newRole,
                currentUser
            );
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

    const togglePermission = (permission, role) => {
        setPermissionMatrix(prev => {
            const roles = [...prev[permission]];
            if (roles.includes(role)) {
                return { ...prev, [permission]: roles.filter(r => r !== role) };
            } else {
                return { ...prev, [permission]: [...roles, role] };
            }
        });
    };

    const savePermissions = async () => {
        await AuditLogger.logPermissionChanged('PERMISSION_MATRIX', PERMISSIONS, permissionMatrix, currentUser);
        toast.success('Permissions updated successfully');
        setEditingPermissions(false);
    };

    if (permLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!can('VIEW_USERS')) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar collapsed={sidebarCollapsed} currentPage="UserManagement" />
                <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                    <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                    <main className="p-6">
                        <AccessDenied />
                    </main>
                </div>
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
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="UserManagement" />
            
            <div className={cn("transition-all duration-300", "lg:ml-16", sidebarCollapsed && "ml-0")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-3 sm:p-6">
                    <Toaster position="top-right" />
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">User Management</h1>
                            <p className="text-sm sm:text-base text-slate-500">Manage user roles and permissions</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => setShowPermissionsDialog(true)}
                            >
                                <KeyRound className="h-4 w-4" />
                                Permissions Matrix
                            </Button>
                            {can('MANAGE_USERS') && (
                                <Button 
                                    className="gap-2"
                                    onClick={() => setShowAddUserDialog(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add User
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Role Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <Card className="p-4 border-l-4 border-l-slate-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Users</p>
                                    <p className="text-2xl font-bold text-slate-900">{roleStats.total}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-red-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <Crown className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Administrators</p>
                                    <p className="text-2xl font-bold text-red-600">{roleStats.admin}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-emerald-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Managers</p>
                                    <p className="text-2xl font-bold text-emerald-600">{roleStats.finance + roleStats.operations + roleStats.compliance + roleStats.technical}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-purple-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Eye className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Staff</p>
                                    <p className="text-2xl font-bold text-purple-600">{roleStats.editor + roleStats.viewer}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Role Legend */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-6">
                                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <Badge className={cn(config.bgColor, config.textColor, config.borderColor)}>
                                            {config.label}
                                        </Badge>
                                        <span className="text-sm text-slate-500">{config.description}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search users by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="finance">Finance Manager</SelectItem>
                                        <SelectItem value="operations">Operations Manager</SelectItem>
                                        <SelectItem value="compliance">Compliance Officer</SelectItem>
                                        <SelectItem value="technical">Technical Manager</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader className="border-b p-4">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <UserCog className="h-5 w-5 text-slate-400" />
                                User Accounts
                                <Badge variant="secondary" className="ml-2">
                                    {filteredUsers.length} users
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">User</TableHead>
                                            <TableHead className="font-semibold">Role</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Department</TableHead>
                                            <TableHead className="font-semibold">2FA</TableHead>
                                            <TableHead className="font-semibold">Joined</TableHead>
                                            <TableHead className="font-semibold">Last Active</TableHead>
                                            <TableHead className="font-semibold">Login IP</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading users...' : 'No users found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => {
                                                const role = user.role || user.app_role || 'viewer';
                                                const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
                                                const isCurrentUser = user.id === currentUser?.id;

                                                return (
                                                    <TableRow key={user.id} className="hover:bg-slate-50/50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-slate-900 flex items-center gap-2">
                                                                        {user.full_name || 'No Name'}
                                                                        {isCurrentUser && (
                                                                            <Badge variant="outline" className="text-xs">You</Badge>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                                        <Mail className="h-3 w-3" />
                                                                        {user.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={cn("text-xs", config.bgColor, config.textColor, config.borderColor)}>
                                                                {config.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.status === 'active' ? (
                                                                <Badge className="bg-green-100 text-green-700 text-xs">
                                                                    Active
                                                                </Badge>
                                                            ) : user.status === 'inactive' ? (
                                                                <Badge className="bg-slate-100 text-slate-700 text-xs">
                                                                    Inactive
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-amber-100 text-amber-700 text-xs">
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            <div className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3 text-slate-400" />
                                                                {user.department || 'Not assigned'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.two_factor_enabled ? (
                                                                <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                                                                    <Shield className="h-3 w-3" />
                                                                    {user.two_factor_method || 'email'}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-slate-400 text-xs">
                                                                    Disabled
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {user.created_date ? format(new Date(user.created_date), 'MMM dd, yyyy') : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 text-slate-400" />
                                                                {user.last_login ? format(new Date(user.last_login), 'MMM dd, HH:mm') : 'Never'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600 text-xs font-mono">
                                                            {user.last_login_ip || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {can('MANAGE_USERS') && !isCurrentUser && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setSelectedStatus(user.status || 'active'); setShowStatusDialog(true); }}>
                                                                            <Check className="h-4 w-4 mr-2" />
                                                                            Change Status
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowRoleDialog(true); }}>
                                                                            <Shield className="h-4 w-4 mr-2" />
                                                                            Change Role
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => { 
                                                                            setSelectedUser(user); 
                                                                            setTfaData({ 
                                                                                enabled: user.two_factor_enabled || false, 
                                                                                method: user.two_factor_method || 'email' 
                                                                            }); 
                                                                            setShow2FADialog(true); 
                                                                        }}>
                                                                            <Shield className="h-4 w-4 mr-2" />
                                                                            Manage 2FA
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setPasswordData({ password: '', confirmPassword: '' }); setShowPasswordDialog(true); }}>
                                                                            <KeyRound className="h-4 w-4 mr-2" />
                                                                            Set Password
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Change Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Change User Role
                        </DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedUser?.full_name || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => handleRoleChange(selectedUser, key)}
                                className={cn(
                                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                                    (selectedUser?.role || selectedUser?.app_role) === key || (!(selectedUser?.role || selectedUser?.app_role) && key === 'viewer')
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                    >
                                    <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn(config.bgColor, config.textColor)}>
                                            {config.label}
                                        </Badge>
                                        <span className="text-sm text-slate-600">{config.description}</span>
                                    </div>
                                    {((selectedUser?.role || selectedUser?.app_role) === key || (!(selectedUser?.role || selectedUser?.app_role) && key === 'viewer')) && (
                                        <Check className="h-5 w-5 text-blue-600" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Role Change Dialog */}
            <AlertDialog open={!!confirmRoleChange} onOpenChange={() => setConfirmRoleChange(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change {confirmRoleChange?.user?.full_name || confirmRoleChange?.user?.email}'s role to{' '}
                            <Badge className={cn(
                                ROLE_CONFIG[confirmRoleChange?.newRole]?.bgColor,
                                ROLE_CONFIG[confirmRoleChange?.newRole]?.textColor
                            )}>
                                {ROLE_CONFIG[confirmRoleChange?.newRole]?.label}
                            </Badge>
                            ? This will immediately affect their access permissions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAndChangeRole}>
                            Confirm Change
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Permissions Matrix Dialog */}
            <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-blue-600" />
                                Permissions Matrix
                            </div>
                            {can('MANAGE_USERS') && (
                                <Button 
                                    variant={editingPermissions ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        if (editingPermissions) {
                                            savePermissions();
                                        } else {
                                            setEditingPermissions(true);
                                        }
                                    }}
                                    className="gap-1"
                                >
                                    {editingPermissions ? (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save
                                        </>
                                    ) : (
                                        <>
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </>
                                    )}
                                </Button>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPermissions ? 'Click on checkboxes to modify permissions' : 'Overview of what each role can access'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="font-semibold">Permission</TableHead>
                                    <TableHead className="font-semibold text-center w-20">
                                        <Badge className={cn(ROLE_CONFIG.admin.bgColor, ROLE_CONFIG.admin.textColor, "text-xs")}>Admin</Badge>
                                    </TableHead>
                                    <TableHead className="font-semibold text-center w-20">
                                        <Badge className={cn(ROLE_CONFIG.finance.bgColor, ROLE_CONFIG.finance.textColor, "text-xs")}>Finance</Badge>
                                    </TableHead>
                                    <TableHead className="font-semibold text-center w-20">
                                        <Badge className={cn(ROLE_CONFIG.operations.bgColor, ROLE_CONFIG.operations.textColor, "text-xs")}>Ops</Badge>
                                    </TableHead>
                                    <TableHead className="font-semibold text-center w-20">
                                        <Badge className={cn(ROLE_CONFIG.compliance.bgColor, ROLE_CONFIG.compliance.textColor, "text-xs")}>Comp</Badge>
                                    </TableHead>
                                    <TableHead className="font-semibold text-center w-20">
                                        <Badge className={cn(ROLE_CONFIG.technical.bgColor, ROLE_CONFIG.technical.textColor, "text-xs")}>Tech</Badge>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(editingPermissions ? permissionMatrix : PERMISSIONS).map(([permission, roles]) => (
                                    <TableRow key={permission}>
                                        <TableCell className="font-medium text-sm">
                                            {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {editingPermissions ? (
                                                <Checkbox 
                                                    checked={roles.includes('admin')}
                                                    onCheckedChange={() => togglePermission(permission, 'admin')}
                                                />
                                            ) : roles.includes('admin') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {editingPermissions ? (
                                                <Checkbox 
                                                    checked={roles.includes('finance')}
                                                    onCheckedChange={() => togglePermission(permission, 'finance')}
                                                />
                                            ) : roles.includes('finance') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {editingPermissions ? (
                                                <Checkbox 
                                                    checked={roles.includes('operations')}
                                                    onCheckedChange={() => togglePermission(permission, 'operations')}
                                                />
                                            ) : roles.includes('operations') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {editingPermissions ? (
                                                <Checkbox 
                                                    checked={roles.includes('compliance')}
                                                    onCheckedChange={() => togglePermission(permission, 'compliance')}
                                                />
                                            ) : roles.includes('compliance') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {editingPermissions ? (
                                                <Checkbox 
                                                    checked={roles.includes('technical')}
                                                    onCheckedChange={() => togglePermission(permission, 'technical')}
                                                />
                                            ) : roles.includes('technical') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Set Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-blue-600" />
                            Set Password
                        </DialogTitle>
                        <DialogDescription>
                            Set a new password for {selectedUser?.full_name || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new_password">New Password *</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_new_password">Confirm Password *</Label>
                            <Input
                                id="confirm_new_password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={async () => {
                                if (!passwordData.password || passwordData.password.length < 8) {
                                    toast.error('Password must be at least 8 characters');
                                    return;
                                }
                                if (passwordData.password !== passwordData.confirmPassword) {
                                    toast.error('Passwords do not match');
                                    return;
                                }
                                try {
                                    await base44.entities.AppUser.update(selectedUser.id, {
                                        password_hash: passwordData.password,
                                        must_change_password: false
                                    });
                                    toast.success('Password updated successfully');
                                    setShowPasswordDialog(false);
                                    setPasswordData({ password: '', confirmPassword: '' });
                                } catch (error) {
                                    toast.error('Failed to update password: ' + error.message);
                                }
                            }}
                        >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Update Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2FA Management Dialog */}
            <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Manage Two-Factor Authentication
                        </DialogTitle>
                        <DialogDescription>
                            Configure 2FA settings for {selectedUser?.full_name || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-200">
                            <div className="flex-1">
                                <p className="font-medium text-sm text-amber-900">Enable 2FA</p>
                                <p className="text-xs text-amber-700">Require two-factor authentication for this user</p>
                            </div>
                            <Checkbox
                                checked={tfaData.enabled}
                                onCheckedChange={(checked) => setTfaData({ ...tfaData, enabled: checked })}
                            />
                        </div>

                        {tfaData.enabled && (
                            <div className="space-y-2">
                                <Label>2FA Method</Label>
                                <Select 
                                    value={tfaData.method} 
                                    onValueChange={(val) => setTfaData({ ...tfaData, method: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email (OTP)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="sms">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                SMS (OTP)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="authenticator">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Authenticator App
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={async () => {
                                try {
                                    await base44.entities.AppUser.update(selectedUser.id, {
                                        two_factor_enabled: tfaData.enabled,
                                        two_factor_method: tfaData.method
                                    });
                                    await AuditLogger.log({
                                        eventType: 'user_updated',
                                        category: 'security',
                                        action: tfaData.enabled ? 'ENABLE_2FA' : 'DISABLE_2FA',
                                        description: `2FA ${tfaData.enabled ? 'enabled' : 'disabled'} for user ${selectedUser.email}`,
                                        targetEntity: 'AppUser',
                                        targetId: selectedUser.id,
                                        newValue: { two_factor_enabled: tfaData.enabled, two_factor_method: tfaData.method },
                                        pciRelevant: true,
                                        severity: 'warning'
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['all-users'] });
                                    toast.success('2FA settings updated successfully');
                                    setShow2FADialog(false);
                                } catch (error) {
                                    toast.error('Failed to update 2FA settings: ' + error.message);
                                }
                            }}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Save Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-blue-600" />
                            Change User Status
                        </DialogTitle>
                        <DialogDescription>
                            Update the status for {selectedUser?.full_name || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <button
                            onClick={() => setSelectedStatus('active')}
                            className={cn(
                                "w-full p-4 rounded-lg border-2 text-left transition-all",
                                selectedStatus === 'active'
                                    ? "border-green-500 bg-green-50"
                                    : "border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                                    <span className="text-sm text-slate-600">User can access the system</span>
                                </div>
                                {selectedStatus === 'active' && <Check className="h-5 w-5 text-green-600" />}
                            </div>
                        </button>
                        <button
                            onClick={() => setSelectedStatus('inactive')}
                            className={cn(
                                "w-full p-4 rounded-lg border-2 text-left transition-all",
                                selectedStatus === 'inactive'
                                    ? "border-slate-500 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-slate-100 text-slate-700">Inactive</Badge>
                                    <span className="text-sm text-slate-600">User cannot access the system</span>
                                </div>
                                {selectedStatus === 'inactive' && <Check className="h-5 w-5 text-slate-600" />}
                            </div>
                        </button>
                        <button
                            onClick={() => setSelectedStatus('pending')}
                            className={cn(
                                "w-full p-4 rounded-lg border-2 text-left transition-all",
                                selectedStatus === 'pending'
                                    ? "border-amber-500 bg-amber-50"
                                    : "border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                                    <span className="text-sm text-slate-600">Awaiting approval or setup</span>
                                </div>
                                {selectedStatus === 'pending' && <Check className="h-5 w-5 text-amber-600" />}
                            </div>
                        </button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={async () => {
                                try {
                                    const oldStatus = selectedUser.status || 'pending';
                                    await base44.entities.AppUser.update(selectedUser.id, {
                                        status: selectedStatus
                                    });
                                    await AuditLogger.log({
                                        eventType: 'user_updated',
                                        category: 'user_management',
                                        action: 'CHANGE_STATUS',
                                        description: `User ${selectedUser.email} status changed from ${oldStatus} to ${selectedStatus}`,
                                        targetEntity: 'AppUser',
                                        targetId: selectedUser.id,
                                        oldValue: { status: oldStatus },
                                        newValue: { status: selectedStatus },
                                        pciRelevant: true,
                                        severity: 'warning'
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['all-users'] });
                                    toast.success('User status updated successfully');
                                    setShowStatusDialog(false);
                                } catch (error) {
                                    toast.error('Failed to update status: ' + error.message);
                                }
                            }}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add User Dialog */}
            <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Add New User
                        </DialogTitle>
                        <DialogDescription>
                            Invite a new user to the platform
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                value={newUser.full_name}
                                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={newUser.department}
                                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                placeholder="e.g., Operations, Finance"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={newUser.confirmPassword}
                                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                placeholder="Re-enter password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <div className="space-y-2">
                                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setNewUser({ ...newUser, app_role: key })}
                                        className={cn(
                                            "w-full p-3 rounded-lg border-2 text-left transition-all",
                                            newUser.app_role === key
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn(config.bgColor, config.textColor)}>
                                                    {config.label}
                                                </Badge>
                                                <span className="text-sm text-slate-600">{config.description}</span>
                                            </div>
                                            {newUser.app_role === key && (
                                                <Check className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleInviteUser}
                            disabled={inviteUserMutation.isPending}
                        >
                            {inviteUserMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}