import React, { useState } from 'react';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebarRestructured';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Code, Eye, Settings } from 'lucide-react';

// Import all permission registries
import { COMMUNITY_ROLES, COMMUNITY_PERMISSIONS, ROLE_PERMISSIONS as COMMUNITY_ROLE_PERMISSIONS, getRoleLabel as getCommunityRoleLabel, getRoleDescription } from '@/components/auth/communityPermissions';
import { ISO_ROLES, ISO_PERMISSIONS, ISO_ROLE_PERMISSIONS, getISORoleLabel } from '@/components/auth/isoGatewayPermissions';
import { ORCH_ROLES, ORCH_PERMISSIONS, ORCH_ROLE_PERMISSIONS, getOrchRoleLabel } from '@/components/auth/orchestrationPermissions';
import { CRYPTO_ROLES, CRYPTO_PERMISSIONS, CRYPTO_ROLE_PERMISSIONS, getCryptoRoleLabel } from '@/components/auth/cryptoGatewayPermissions';
import { RWA_ROLES, RWA_PERMISSIONS, RWA_ROLE_PERMISSIONS, getRWARoleLabel } from '@/components/auth/rwaPermissions';

function RolePermissionMatrix({ roles, permissions, rolePermissions, getRoleLabel }) {
    const [selectedRole, setSelectedRole] = useState(Object.keys(roles)[0]);

    return (
        <div className="space-y-6">
            {/* Role Selector */}
            <div className="flex gap-2 flex-wrap">
                {Object.values(roles).map(role => (
                    <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedRole === role
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        {getRoleLabel(role)}
                    </button>
                ))}
            </div>

            {/* Permission List for Selected Role */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Permissions for {getRoleLabel(selectedRole)}
                    </CardTitle>
                    <CardDescription>
                        {rolePermissions[selectedRole]?.length || 0} permissions granted
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {rolePermissions[selectedRole]?.map(permission => {
                            const [category, action] = permission.split(':');
                            return (
                                <div 
                                    key={permission}
                                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                        {category}
                                    </Badge>
                                    <span className="text-sm text-slate-700">{action.replace(/_/g, ' ')}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Permission Matrix Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Complete Permission Matrix</CardTitle>
                    <CardDescription>All roles and their permissions at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left p-3 font-semibold text-slate-700">Permission</th>
                                    {Object.values(roles).map(role => (
                                        <th key={role} className="text-center p-3 font-semibold text-slate-700">
                                            {getRoleLabel(role)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(permissions).map(permission => {
                                    const [category, action] = permission.split(':');
                                    return (
                                        <tr key={permission} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {category}
                                                    </Badge>
                                                    <span className="text-slate-700">{action.replace(/_/g, ' ')}</span>
                                                </div>
                                            </td>
                                            {Object.values(roles).map(role => {
                                                const hasPermission = rolePermissions[role]?.includes(permission);
                                                return (
                                                    <td key={role} className="text-center p-3">
                                                        {hasPermission ? (
                                                            <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-600">✓</span>
                                                        ) : (
                                                            <span className="inline-block w-6 h-6 rounded-full bg-slate-100 text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function RolePermissionManagement() {
    const { platformUser, loading } = usePlatformAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="RolePermissionManagement" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Role & Permission Management</h2>
                        <p className="text-xs text-slate-600">Configure RBAC across all services</p>
                    </div>
                    <Badge className="bg-blue-600 text-white">
                        {getRoleLabel(platformUser?.platform_role)}
                    </Badge>
                </header>

                <div className="p-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Users className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{Object.keys(COMMUNITY_ROLES).length}</p>
                                        <p className="text-xs text-slate-600">Community Roles</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Code className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{Object.keys(ISO_ROLES).length}</p>
                                        <p className="text-xs text-slate-600">ISO Gateway Roles</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Settings className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{Object.keys(ORCH_ROLES).length}</p>
                                        <p className="text-xs text-slate-600">Orchestration Roles</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{Object.keys(CRYPTO_ROLES).length}</p>
                                        <p className="text-xs text-slate-600">Crypto Gateway Roles</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Eye className="h-8 w-8 text-red-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{Object.keys(RWA_ROLES).length}</p>
                                        <p className="text-xs text-slate-600">RWA Platform Roles</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Service Tabs */}
                    <Tabs defaultValue="community" className="space-y-6">
                        <TabsList className="grid grid-cols-5 w-full">
                            <TabsTrigger value="community">Community Portal</TabsTrigger>
                            <TabsTrigger value="iso">ISO Gateway</TabsTrigger>
                            <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
                            <TabsTrigger value="crypto">Crypto Banking</TabsTrigger>
                            <TabsTrigger value="rwa">RWA Platform</TabsTrigger>
                        </TabsList>

                        <TabsContent value="community">
                            <RolePermissionMatrix
                                roles={COMMUNITY_ROLES}
                                permissions={COMMUNITY_PERMISSIONS}
                                rolePermissions={COMMUNITY_ROLE_PERMISSIONS}
                                getRoleLabel={getCommunityRoleLabel}
                            />
                        </TabsContent>

                        <TabsContent value="iso">
                            <RolePermissionMatrix
                                roles={ISO_ROLES}
                                permissions={ISO_PERMISSIONS}
                                rolePermissions={ISO_ROLE_PERMISSIONS}
                                getRoleLabel={getISORoleLabel}
                            />
                        </TabsContent>

                        <TabsContent value="orchestration">
                            <RolePermissionMatrix
                                roles={ORCH_ROLES}
                                permissions={ORCH_PERMISSIONS}
                                rolePermissions={ORCH_ROLE_PERMISSIONS}
                                getRoleLabel={getOrchRoleLabel}
                            />
                        </TabsContent>

                        <TabsContent value="crypto">
                            <RolePermissionMatrix
                                roles={CRYPTO_ROLES}
                                permissions={CRYPTO_PERMISSIONS}
                                rolePermissions={CRYPTO_ROLE_PERMISSIONS}
                                getRoleLabel={getCryptoRoleLabel}
                            />
                        </TabsContent>

                        <TabsContent value="rwa">
                            <RolePermissionMatrix
                                roles={RWA_ROLES}
                                permissions={RWA_PERMISSIONS}
                                rolePermissions={RWA_ROLE_PERMISSIONS}
                                getRoleLabel={getRWARoleLabel}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}