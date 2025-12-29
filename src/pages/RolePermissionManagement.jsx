import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebarRestructured';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Users, Code, Eye, Settings, Save, RotateCcw } from 'lucide-react';

// Import all permission registries
import { COMMUNITY_ROLES, COMMUNITY_PERMISSIONS, ROLE_PERMISSIONS as COMMUNITY_ROLE_PERMISSIONS, getRoleLabel as getCommunityRoleLabel, getRoleDescription } from '@/components/auth/communityPermissions';
import { ISO_ROLES, ISO_PERMISSIONS, ISO_ROLE_PERMISSIONS, getISORoleLabel } from '@/components/auth/isoGatewayPermissions';
import { ORCH_ROLES, ORCH_PERMISSIONS, ORCH_ROLE_PERMISSIONS, getOrchRoleLabel } from '@/components/auth/orchestrationPermissions';
import { CRYPTO_ROLES, CRYPTO_PERMISSIONS, CRYPTO_ROLE_PERMISSIONS, getCryptoRoleLabel } from '@/components/auth/cryptoGatewayPermissions';
import { RWA_ROLES, RWA_PERMISSIONS, RWA_ROLE_PERMISSIONS, getRWARoleLabel } from '@/components/auth/rwaPermissions';

function RolePermissionMatrix({ roles, permissions, rolePermissions, getRoleLabel, serviceType, onSave }) {
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState(Object.keys(roles)[0]);
    const [editMode, setEditMode] = useState(false);
    const [editedPermissions, setEditedPermissions] = useState({});

    // Load saved configurations
    const { data: savedConfigs = [] } = useQuery({
        queryKey: ['permission-configs', serviceType],
        queryFn: async () => await base44.asServiceRole.entities.PermissionConfiguration.filter({ service_type: serviceType, is_active: true })
    });

    // Merge saved configs with default permissions
    const effectivePermissions = React.useMemo(() => {
        const merged = { ...rolePermissions };
        savedConfigs.forEach(config => {
            merged[config.role] = config.permissions;
        });
        return editMode ? (Object.keys(editedPermissions).length > 0 ? editedPermissions : merged) : merged;
    }, [rolePermissions, savedConfigs, editMode, editedPermissions]);

    const saveMutation = useMutation({
        mutationFn: async (configs) => {
            // Delete existing configs for this service
            const existing = await base44.asServiceRole.entities.PermissionConfiguration.filter({ service_type: serviceType });
            for (const config of existing) {
                await base44.asServiceRole.entities.PermissionConfiguration.delete(config.id);
            }
            // Save new configs
            for (const [role, perms] of Object.entries(configs)) {
                await base44.asServiceRole.entities.PermissionConfiguration.create({
                    service_type: serviceType,
                    role,
                    permissions: perms,
                    is_active: true
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['permission-configs']);
            setEditMode(false);
            setEditedPermissions({});
        }
    });

    const togglePermission = (role, permission) => {
        if (!editMode) return;
        const current = editedPermissions[role] || effectivePermissions[role] || [];
        const updated = current.includes(permission)
            ? current.filter(p => p !== permission)
            : [...current, permission];
        setEditedPermissions({ ...editedPermissions, [role]: updated });
    };

    const handleSave = () => {
        const toSave = Object.keys(editedPermissions).length > 0 ? editedPermissions : effectivePermissions;
        saveMutation.mutate(toSave);
    };

    const handleReset = () => {
        setEditedPermissions({});
        setEditMode(false);
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
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
                <div className="flex gap-2">
                    {editMode ? (
                        <>
                            <Button variant="outline" onClick={handleReset} className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2 bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4" />
                                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setEditMode(true)} className="gap-2">
                            <Settings className="h-4 w-4" />
                            Edit Permissions
                        </Button>
                    )}
                </div>
            </div>

            {/* Permission List for Selected Role */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Permissions for {getRoleLabel(selectedRole)}
                        {editMode && <Badge variant="outline" className="ml-2">Editing Mode</Badge>}
                    </CardTitle>
                    <CardDescription>
                        {effectivePermissions[selectedRole]?.length || 0} permissions granted
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {effectivePermissions[selectedRole]?.map(permission => {
                            const [category, action] = permission.split(':');
                            return (
                                <div 
                                    key={permission}
                                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                        {category}
                                    </Badge>
                                    <span className="text-sm text-slate-700 flex-1">{action.replace(/_/g, ' ')}</span>
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
                                                const hasPermission = effectivePermissions[role]?.includes(permission);
                                                return (
                                                    <td key={role} className="text-center p-3">
                                                        {editMode ? (
                                                            <Switch
                                                                checked={hasPermission}
                                                                onCheckedChange={() => togglePermission(role, permission)}
                                                            />
                                                        ) : hasPermission ? (
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
                                serviceType="community"
                            />
                        </TabsContent>

                        <TabsContent value="iso">
                            <RolePermissionMatrix
                                roles={ISO_ROLES}
                                permissions={ISO_PERMISSIONS}
                                rolePermissions={ISO_ROLE_PERMISSIONS}
                                getRoleLabel={getISORoleLabel}
                                serviceType="iso_gateway"
                            />
                        </TabsContent>

                        <TabsContent value="orchestration">
                            <RolePermissionMatrix
                                roles={ORCH_ROLES}
                                permissions={ORCH_PERMISSIONS}
                                rolePermissions={ORCH_ROLE_PERMISSIONS}
                                getRoleLabel={getOrchRoleLabel}
                                serviceType="orchestration"
                            />
                        </TabsContent>

                        <TabsContent value="crypto">
                            <RolePermissionMatrix
                                roles={CRYPTO_ROLES}
                                permissions={CRYPTO_PERMISSIONS}
                                rolePermissions={CRYPTO_ROLE_PERMISSIONS}
                                getRoleLabel={getCryptoRoleLabel}
                                serviceType="crypto_banking"
                            />
                        </TabsContent>

                        <TabsContent value="rwa">
                            <RolePermissionMatrix
                                roles={RWA_ROLES}
                                permissions={RWA_PERMISSIONS}
                                rolePermissions={RWA_ROLE_PERMISSIONS}
                                getRoleLabel={getRWARoleLabel}
                                serviceType="rwa_platform"
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}