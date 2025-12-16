import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    Users, 
    Shield, 
    Search, 
    Eye,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { WORKFLOW_ROLES, WORKFLOW_PERMISSIONS, getUserWorkflowRole, getRoleLabel, getRoleDescription } from './WorkflowRBAC';
import { useWorkflowRBAC } from './useWorkflowRBAC';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';

export default function WorkflowUsersManagement() {
    const { platformUser } = usePlatformAuth();
    const { can } = useWorkflowRBAC(platformUser);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPermissions, setShowPermissions] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const queryClient = useQueryClient();

    const { data: authUsers = [] } = useQuery({
        queryKey: ['auth-users'],
        queryFn: () => base44.entities.AuthUser.list()
    });

    // Enrich users with workflow roles
    const users = authUsers.map(user => ({
        ...user,
        workflow_role: getUserWorkflowRole(user.platform_role),
        workflow_role_label: getRoleLabel(getUserWorkflowRole(user.platform_role))
    }));

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || user.workflow_role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    const roleStats = {
        admin: users.filter(u => u.workflow_role === WORKFLOW_ROLES.ADMIN).length,
        compliance: users.filter(u => u.workflow_role === WORKFLOW_ROLES.COMPLIANCE_OFFICER).length,
        auditor: users.filter(u => u.workflow_role === WORKFLOW_ROLES.AUDITOR).length,
        developer: users.filter(u => u.workflow_role === WORKFLOW_ROLES.DEVELOPER).length
    };

    const getPermissionsForRole = (role) => {
        const roleMap = {
            [WORKFLOW_ROLES.ADMIN]: Object.values(WORKFLOW_PERMISSIONS),
            [WORKFLOW_ROLES.COMPLIANCE_OFFICER]: [
                WORKFLOW_PERMISSIONS.VIEW_WORKFLOWS,
                WORKFLOW_PERMISSIONS.VIEW_AUDIT_TRAIL,
                WORKFLOW_PERMISSIONS.VIEW_COMPLIANCE,
                WORKFLOW_PERMISSIONS.EDIT_WORKFLOW,
                WORKFLOW_PERMISSIONS.APPROVE_WORKFLOW,
                WORKFLOW_PERMISSIONS.MARK_COMPLIANT,
                WORKFLOW_PERMISSIONS.MANAGE_STANDARDS
            ],
            [WORKFLOW_ROLES.AUDITOR]: [
                WORKFLOW_PERMISSIONS.VIEW_WORKFLOWS,
                WORKFLOW_PERMISSIONS.VIEW_AUDIT_TRAIL,
                WORKFLOW_PERMISSIONS.VIEW_COMPLIANCE,
                WORKFLOW_PERMISSIONS.EXPORT_AUDIT
            ],
            [WORKFLOW_ROLES.DEVELOPER]: [
                WORKFLOW_PERMISSIONS.VIEW_WORKFLOWS,
                WORKFLOW_PERMISSIONS.CREATE_WORKFLOW,
                WORKFLOW_PERMISSIONS.EDIT_WORKFLOW,
                WORKFLOW_PERMISSIONS.UPLOAD_BPMN,
                WORKFLOW_PERMISSIONS.CREATE_TEMPLATE
            ]
        };
        return roleMap[role] || [];
    };

    return (
        <div className="space-y-6">
            {/* Role Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Admins</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{roleStats.admin}</p>
                            </div>
                            <Shield className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Compliance Officers</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-1">{roleStats.compliance}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Auditors</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">{roleStats.auditor}</p>
                            </div>
                            <Eye className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Developers</p>
                                <p className="text-3xl font-bold text-amber-600 mt-1">{roleStats.developer}</p>
                            </div>
                            <Users className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value={WORKFLOW_ROLES.ADMIN}>Admin</SelectItem>
                                <SelectItem value={WORKFLOW_ROLES.COMPLIANCE_OFFICER}>Compliance Officer</SelectItem>
                                <SelectItem value={WORKFLOW_ROLES.AUDITOR}>Auditor</SelectItem>
                                <SelectItem value={WORKFLOW_ROLES.DEVELOPER}>Developer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Workflow Users & Roles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Platform Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Workflow Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Last Login</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{user.full_name || user.email}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className="capitalize">
                                                {user.platform_role?.replace(/_/g, ' ')}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge className={
                                                user.workflow_role === WORKFLOW_ROLES.ADMIN ? 'bg-blue-100 text-blue-700' :
                                                user.workflow_role === WORKFLOW_ROLES.COMPLIANCE_OFFICER ? 'bg-emerald-100 text-emerald-700' :
                                                user.workflow_role === WORKFLOW_ROLES.AUDITOR ? 'bg-purple-100 text-purple-700' :
                                                'bg-amber-100 text-amber-700'
                                            }>
                                                <Shield className="h-3 w-3 mr-1" />
                                                {user.workflow_role_label}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowPermissions(true);
                                                }}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                View Permissions
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-slate-600">
                                No users found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Role Reference */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Permissions Reference</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.values(WORKFLOW_ROLES).map(role => (
                            <div key={role} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-slate-900">{getRoleLabel(role)}</h4>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setShowPermissions(true);
                                        }}
                                    >
                                        View Permissions
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-600">{getRoleDescription(role)}</p>
                                <div className="mt-3">
                                    <Badge variant="outline">
                                        {getPermissionsForRole(role).length} permissions
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Dialog */}
            <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser ? `${selectedUser.full_name || selectedUser.email} - Permissions` : `${getRoleLabel(selectedRole)} - Permissions`}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedUser && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-slate-600">Platform Role:</span>
                                        <span className="ml-2 font-medium">{selectedUser.platform_role?.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-600">Workflow Role:</span>
                                        <span className="ml-2 font-medium">{selectedUser.workflow_role_label}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">Permissions</h4>
                            <div className="space-y-2">
                                {getPermissionsForRole(selectedUser?.workflow_role || selectedRole).map(permission => (
                                    <div key={permission} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-slate-700">{permission}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}