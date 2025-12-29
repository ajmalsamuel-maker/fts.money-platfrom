import React, { useState } from 'react';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Code, GitBranch, Wallet, Briefcase, CheckCircle2, XCircle, Save, Building2 } from 'lucide-react';
import { ISO_ROLES, ISO_PERMISSIONS, ISO_ROLE_PERMISSIONS, getISORoleLabel } from '@/components/auth/isoGatewayPermissions';
import { ORCH_ROLES, ORCH_PERMISSIONS, ORCH_ROLE_PERMISSIONS, getOrchRoleLabel } from '@/components/auth/orchestrationPermissions';
import { CRYPTO_ROLES, CRYPTO_PERMISSIONS, CRYPTO_ROLE_PERMISSIONS, getCryptoRoleLabel } from '@/components/auth/cryptoGatewayPermissions';
import { RWA_ROLES, RWA_PERMISSIONS, RWA_ROLE_PERMISSIONS, getRWARoleLabel } from '@/components/auth/rwaPermissions';
import { toast } from 'sonner';

const PSP_STAFF_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    OPERATOR: 'operator',
    VIEWER: 'viewer',
    FINANCE: 'finance',
    COMPLIANCE: 'compliance',
    TECHNICAL: 'technical'
};

const PSP_PERMISSIONS = {
    VIEW_DASHBOARD: 'VIEW_DASHBOARD',
    VIEW_ANALYTICS: 'VIEW_ANALYTICS',
    VIEW_TRANSACTIONS: 'VIEW_TRANSACTIONS',
    VIEW_SETTLEMENTS: 'VIEW_SETTLEMENTS',
    VIEW_CHARGEBACKS: 'VIEW_CHARGEBACKS',
    VIEW_DISPUTES: 'VIEW_DISPUTES',
    VIEW_MERCHANTS: 'VIEW_MERCHANTS',
    VIEW_ONBOARDING: 'VIEW_ONBOARDING',
    VIEW_ORCHESTRATION: 'VIEW_ORCHESTRATION',
    VIEW_ROUTING: 'VIEW_ROUTING',
    VIEW_TERMINALS: 'VIEW_TERMINALS',
    VIEW_BALANCES: 'VIEW_BALANCES',
    VIEW_PAYOUTS: 'VIEW_PAYOUTS',
    VIEW_REPORTS: 'VIEW_REPORTS',
    VIEW_FRAUD_PREVENTION: 'VIEW_FRAUD_PREVENTION',
    VIEW_COMPLIANCE: 'VIEW_COMPLIANCE',
    VIEW_SETTINGS: 'VIEW_SETTINGS',
    VIEW_USERS: 'VIEW_USERS',
    VIEW_APPEARANCE: 'VIEW_APPEARANCE',
    APPROVE_ONBOARDING: 'APPROVE_ONBOARDING'
};

const PSP_ROLE_PERMISSIONS = {
    [PSP_STAFF_ROLES.ADMIN]: Object.values(PSP_PERMISSIONS),
    [PSP_STAFF_ROLES.MANAGER]: [
        'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_TRANSACTIONS', 'VIEW_SETTLEMENTS', 'VIEW_CHARGEBACKS',
        'VIEW_DISPUTES', 'VIEW_MERCHANTS', 'VIEW_ONBOARDING', 'VIEW_ORCHESTRATION', 'VIEW_ROUTING',
        'VIEW_TERMINALS', 'VIEW_BALANCES', 'VIEW_PAYOUTS', 'VIEW_REPORTS', 'VIEW_FRAUD_PREVENTION',
        'VIEW_COMPLIANCE', 'VIEW_SETTINGS', 'VIEW_USERS', 'VIEW_APPEARANCE'
    ],
    [PSP_STAFF_ROLES.OPERATOR]: ['VIEW_DASHBOARD', 'VIEW_TRANSACTIONS', 'VIEW_MERCHANTS', 'VIEW_TERMINALS'],
    [PSP_STAFF_ROLES.VIEWER]: ['VIEW_DASHBOARD', 'VIEW_TRANSACTIONS', 'VIEW_MERCHANTS'],
    [PSP_STAFF_ROLES.FINANCE]: [
        'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_TRANSACTIONS', 'VIEW_SETTLEMENTS',
        'VIEW_BALANCES', 'VIEW_PAYOUTS', 'VIEW_REPORTS'
    ],
    [PSP_STAFF_ROLES.COMPLIANCE]: [
        'VIEW_DASHBOARD', 'VIEW_TRANSACTIONS', 'VIEW_MERCHANTS',
        'VIEW_FRAUD_PREVENTION', 'VIEW_COMPLIANCE'
    ],
    [PSP_STAFF_ROLES.TECHNICAL]: ['VIEW_DASHBOARD', 'VIEW_TRANSACTIONS', 'VIEW_SETTINGS', 'VIEW_USERS']
};

function getPSPRoleLabel(role) {
    const labels = {
        [PSP_STAFF_ROLES.ADMIN]: 'Administrator',
        [PSP_STAFF_ROLES.MANAGER]: 'Manager',
        [PSP_STAFF_ROLES.OPERATOR]: 'Operator',
        [PSP_STAFF_ROLES.VIEWER]: 'Viewer',
        [PSP_STAFF_ROLES.FINANCE]: 'Finance',
        [PSP_STAFF_ROLES.COMPLIANCE]: 'Compliance',
        [PSP_STAFF_ROLES.TECHNICAL]: 'Technical'
    };
    return labels[role] || role;
}

function PermissionMatrix({ roles, permissions, rolePermissions, getRoleLabel, serviceName, onPermissionChange, editable = true }) {
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
                                        {editable ? (
                                            <Checkbox 
                                                checked={hasPermission}
                                                onCheckedChange={(checked) => onPermissionChange(serviceName, role, permission, checked)}
                                                className="mx-auto"
                                            />
                                        ) : hasPermission ? (
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
    const [editMode, setEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    const [isoPerms, setIsoPerms] = useState(ISO_ROLE_PERMISSIONS);
    const [orchPerms, setOrchPerms] = useState(ORCH_ROLE_PERMISSIONS);
    const [cryptoPerms, setCryptoPerms] = useState(CRYPTO_ROLE_PERMISSIONS);
    const [rwaPerms, setRwaPerms] = useState(RWA_ROLE_PERMISSIONS);
    const [pspPerms, setPspPerms] = useState(PSP_ROLE_PERMISSIONS);

    const handlePermissionChange = (service, role, permission, checked) => {
        setHasChanges(true);
        
        const updatePerms = (currentPerms) => {
            const newPerms = { ...currentPerms };
            if (checked) {
                newPerms[role] = [...(newPerms[role] || []), permission];
            } else {
                newPerms[role] = (newPerms[role] || []).filter(p => p !== permission);
            }
            return newPerms;
        };

        if (service === 'ISO Gateway') setIsoPerms(updatePerms);
        else if (service === 'Orchestration') setOrchPerms(updatePerms);
        else if (service === 'Crypto Banking') setCryptoPerms(updatePerms);
        else if (service === 'RWA Platform') setRwaPerms(updatePerms);
        else if (service === 'PSP Staff') setPspPerms(updatePerms);
    };

    const handleSave = () => {
        toast.success('Permission changes saved successfully');
        setHasChanges(false);
        setEditMode(false);
    };

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
                    <div className="flex items-center gap-3">
                        {hasChanges && <Badge className="bg-amber-100 text-amber-700">Unsaved Changes</Badge>}
                        {editMode ? (
                            <>
                                <Button onClick={() => { setEditMode(false); setHasChanges(false); }} variant="outline">Cancel</Button>
                                <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700"><Save className="h-4 w-4" />Save Changes</Button>
                            </>
                        ) : (
                            <Button onClick={() => setEditMode(true)} className="gap-2 bg-blue-600 hover:bg-blue-700"><Shield className="h-4 w-4" />Edit Permissions</Button>
                        )}
                    </div>
                </header>

                <div className="p-6">
                    <Tabs defaultValue="psp" className="space-y-6">
                        <TabsList className="grid w-full max-w-3xl grid-cols-5">
                            <TabsTrigger value="psp" className="gap-2"><Building2 className="h-4 w-4" />PSP Staff</TabsTrigger>
                            <TabsTrigger value="iso" className="gap-2"><Code className="h-4 w-4" />ISO Gateway</TabsTrigger>
                            <TabsTrigger value="orch" className="gap-2"><GitBranch className="h-4 w-4" />Orchestration</TabsTrigger>
                            <TabsTrigger value="crypto" className="gap-2"><Wallet className="h-4 w-4" />Crypto Banking</TabsTrigger>
                            <TabsTrigger value="rwa" className="gap-2"><Briefcase className="h-4 w-4" />RWA Platform</TabsTrigger>
                        </TabsList>

                        <TabsContent value="psp">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        PSP Staff - Permission Matrix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PermissionMatrix 
                                        roles={PSP_STAFF_ROLES}
                                        permissions={PSP_PERMISSIONS}
                                        rolePermissions={pspPerms}
                                        getRoleLabel={getPSPRoleLabel}
                                        serviceName="PSP Staff"
                                        onPermissionChange={handlePermissionChange}
                                        editable={editMode}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

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
                                        rolePermissions={isoPerms}
                                        getRoleLabel={getISORoleLabel}
                                        serviceName="ISO Gateway"
                                        onPermissionChange={handlePermissionChange}
                                        editable={editMode}
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
                                        rolePermissions={orchPerms}
                                        getRoleLabel={getOrchRoleLabel}
                                        serviceName="Orchestration"
                                        onPermissionChange={handlePermissionChange}
                                        editable={editMode}
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
                                        rolePermissions={cryptoPerms}
                                        getRoleLabel={getCryptoRoleLabel}
                                        serviceName="Crypto Banking"
                                        onPermissionChange={handlePermissionChange}
                                        editable={editMode}
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
                                        rolePermissions={rwaPerms}
                                        getRoleLabel={getRWARoleLabel}
                                        serviceName="RWA Platform"
                                        onPermissionChange={handlePermissionChange}
                                        editable={editMode}
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