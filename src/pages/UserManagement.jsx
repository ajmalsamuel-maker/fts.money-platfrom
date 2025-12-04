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
    Check
} from 'lucide-react';
import { usePermissions } from '@/components/auth/usePermissions';
import { AccessDenied } from '@/components/auth/PermissionGate';
import { ROLE_CONFIG, PERMISSIONS } from '@/components/auth/permissions';

export default function UserManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
    const [confirmRoleChange, setConfirmRoleChange] = useState(null);

    const queryClient = useQueryClient();
    const { can, loading: permLoading, userRole, user: currentUser } = usePermissions();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['all-users'],
        queryFn: () => base44.entities.User.list('-created_date'),
        enabled: can('VIEW_USERS'),
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-users'] });
            setShowRoleDialog(false);
            setConfirmRoleChange(null);
        },
    });

    const filteredUsers = users.filter(u => {
        const matchesSearch = !searchQuery || 
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.app_role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (user, newRole) => {
        setConfirmRoleChange({ user, newRole });
    };

    const confirmAndChangeRole = () => {
        if (confirmRoleChange) {
            updateUserMutation.mutate({
                userId: confirmRoleChange.user.id,
                data: { app_role: confirmRoleChange.newRole }
            });
        }
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
        admin: users.filter(u => u.app_role === 'admin').length,
        editor: users.filter(u => u.app_role === 'editor').length,
        viewer: users.filter(u => (u.app_role === 'viewer' || !u.app_role)).length,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="UserManagement" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                            <p className="text-slate-500">Manage user roles and permissions</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => setShowPermissionsDialog(true)}
                        >
                            <KeyRound className="h-4 w-4" />
                            View Permissions Matrix
                        </Button>
                    </div>

                    {/* Role Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                        <Card className="p-4 border-l-4 border-l-emerald-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Crown className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Administrators</p>
                                    <p className="text-2xl font-bold text-emerald-600">{roleStats.admin}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-amber-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Pencil className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Editors</p>
                                    <p className="text-2xl font-bold text-amber-600">{roleStats.editor}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-purple-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Eye className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Viewers</p>
                                    <p className="text-2xl font-bold text-purple-600">{roleStats.viewer}</p>
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
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search users by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserCog className="h-5 w-5 text-slate-400" />
                                User Accounts
                                <Badge variant="secondary" className="ml-2">
                                    {filteredUsers.length} users
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">User</TableHead>
                                            <TableHead className="font-semibold">Role</TableHead>
                                            <TableHead className="font-semibold">Department</TableHead>
                                            <TableHead className="font-semibold">Joined</TableHead>
                                            <TableHead className="font-semibold">Last Active</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading users...' : 'No users found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => {
                                                const role = user.app_role || 'viewer';
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
                                                        <TableCell className="text-slate-600">
                                                            <div className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3 text-slate-400" />
                                                                {user.department || 'Not assigned'}
                                                            </div>
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
                                                        <TableCell>
                                                            {can('MANAGE_USERS') && !isCurrentUser && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowRoleDialog(true); }}>
                                                                            <Shield className="h-4 w-4 mr-2" />
                                                                            Change Role
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
                                    selectedUser?.app_role === key || (!selectedUser?.app_role && key === 'viewer')
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
                                    {(selectedUser?.app_role === key || (!selectedUser?.app_role && key === 'viewer')) && (
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
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-blue-600" />
                            Permissions Matrix
                        </DialogTitle>
                        <DialogDescription>
                            Overview of what each role can access
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="font-semibold">Permission</TableHead>
                                    <TableHead className="font-semibold text-center">
                                        <Badge className={cn(ROLE_CONFIG.admin.bgColor, ROLE_CONFIG.admin.textColor)}>Admin</Badge>
                                    </TableHead>
                                    <TableHead className="font-semibold text-center">
                                        <Badge className={cn(ROLE_CONFIG.editor.bgColor, ROLE_CONFIG.editor.textColor)}>Editor</Badge>
                                    </TableHead>
                                    <TableHead className="font-semibold text-center">
                                        <Badge className={cn(ROLE_CONFIG.viewer.bgColor, ROLE_CONFIG.viewer.textColor)}>Viewer</Badge>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(PERMISSIONS).map(([permission, roles]) => (
                                    <TableRow key={permission}>
                                        <TableCell className="font-medium text-sm">
                                            {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {roles.includes('admin') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {roles.includes('editor') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {roles.includes('viewer') ? (
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
        </div>
    );
}