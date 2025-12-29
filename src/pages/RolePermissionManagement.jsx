import React, { useState } from 'react';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Code, GitBranch, Wallet, Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import { ISO_ROLES, ISO_PERMISSIONS, ISO_ROLE_PERMISSIONS, getISORoleLabel } from '@/components/auth/isoGatewayPermissions';
import { ORCH_ROLES, ORCH_PERMISSIONS, ORCH_ROLE_PERMISSIONS, getOrchRoleLabel } from '@/components/auth/orchestrationPermissions';
import { CRYPTO_ROLES, CRYPTO_PERMISSIONS, CRYPTO_ROLE_PERMISSIONS, getCryptoRoleLabel } from '@/components/auth/cryptoGatewayPermissions';
import { RWA_ROLES, RWA_PERMISSIONS, RWA_ROLE_PERMISSIONS, getRWARoleLabel } from '@/components/auth/rwaPermissions';

function PermissionMatrix({ roles, permissions, rolePermissions, getRoleLabel, serviceName }) {
    const permissionsList = Object.values(permissions);
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="border p-3 text-left font-semibold">Permission</th>
                        {Object.values(roles).map(role => (
                            <th key={role} className="border p-3 text-center font-semibold">{getRoleLabel(role)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {permissionsList.map(permission => (
                        <tr key={permission} className="hover:bg-slate-50">
                            <td className="border p-3 text-sm font-mono">{permission}</td>
                            {Object.values(roles).map(role => {
                                const hasPermission = rolePermissions[role]?.includes(permission);
                                return (
                                    <td key={role} className="border p-3 text-center">
                                        {hasPermission ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function RolePermissionManagement() {
    const { platformUser, loading } = usePlatformAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="RolePermissionManagement" userRole={getRoleLabel(platformUser?.platform_role)} userEmail={platformUser?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold">Role & Permission Management</h2>
                        <p className="text-xs text-slate-600">View and manage RBAC permissions across all services</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Read-Only View</Badge>
                </header>

                <div className="p-6">
                    <Tabs defaultValue="iso" className="space-y-6">
                        <TabsList className="grid w-full max-w-2xl grid-cols-4">
                            <TabsTrigger value="iso" className="gap-2"><Code className="h-4 w-4" />ISO Gateway</TabsTrigger>
                            <TabsTrigger value="orch" className="gap-2"><GitBranch className="h-4 w-4" />Orchestration</TabsTrigger>
                            <TabsTrigger value="crypto" className="gap-2"><Wallet className="h-4 w-4" />Crypto Banking</TabsTrigger>
                            <TabsTrigger value="rwa" className="gap-2"><Briefcase className="h-4 w-4" />RWA Platform</TabsTrigger>
                        </TabsList>

                        <TabsContent value="iso">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code className="h-5 w-5" />
                                        ISO Gateway - Permission Matrix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PermissionMatrix 
                                        roles={ISO_ROLES}
                                        permissions={ISO_PERMISSIONS}
                                        rolePermissions={ISO_ROLE_PERMISSIONS}
                                        getRoleLabel={getISORoleLabel}
                                        serviceName="ISO Gateway"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orch">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="h-5 w-5" />
                                        Orchestration Service - Permission Matrix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PermissionMatrix 
                                        roles={ORCH_ROLES}
                                        permissions={ORCH_PERMISSIONS}
                                        rolePermissions={ORCH_ROLE_PERMISSIONS}
                                        getRoleLabel={getOrchRoleLabel}
                                        serviceName="Orchestration"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="crypto">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5" />
                                        Crypto Banking Gateway - Permission Matrix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PermissionMatrix 
                                        roles={CRYPTO_ROLES}
                                        permissions={CRYPTO_PERMISSIONS}
                                        rolePermissions={CRYPTO_ROLE_PERMISSIONS}
                                        getRoleLabel={getCryptoRoleLabel}
                                        serviceName="Crypto Banking"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="rwa">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5" />
                                        RWA Tokenization Platform - Permission Matrix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PermissionMatrix 
                                        roles={RWA_ROLES}
                                        permissions={RWA_PERMISSIONS}
                                        rolePermissions={RWA_ROLE_PERMISSIONS}
                                        getRoleLabel={getRWARoleLabel}
                                        serviceName="RWA Platform"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}