import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, Users, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AuthArchitecture() {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                        <AlertTriangle className="h-5 w-5" />
                        CRITICAL: Multi-Tenant Authentication Rules
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="font-semibold text-red-900">❌ NEVER Use Base44's User Entity For:</div>
                    <ul className="space-y-1 text-red-800 ml-4">
                        <li>• PSP Staff Users</li>
                        <li>• Merchant Users</li>
                        <li>• Platform Admins</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded border border-red-200">
                        <p className="font-semibold text-red-900 mb-2">Why?</p>
                        <ul className="space-y-1 text-red-800 text-xs">
                            <li>• Base44's User entity has global unique email constraints</li>
                            <li>• PSP staff need multi-tenant isolation (same email across PSPs)</li>
                            <li>• Custom auth provides PCI DSS/GDPR compliance</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="bg-blue-50">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            PSP Staff Auth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        <div>
                            <Badge className="bg-blue-100 text-blue-700 mb-2">Table</Badge>
                            <p className="text-xs font-mono">psp_[code].psp_staff_users</p>
                        </div>
                        <div>
                            <Badge className="bg-blue-100 text-blue-700 mb-2">Function</Badge>
                            <p className="text-xs font-mono">pspAuth</p>
                        </div>
                        <div>
                            <Badge className="bg-blue-100 text-blue-700 mb-2">Login Page</Badge>
                            <p className="text-xs font-mono">PSPLogin</p>
                        </div>
                        <div className="pt-2 border-t">
                            <p className="text-xs font-semibold mb-1">Create Users:</p>
                            <p className="text-xs font-mono bg-slate-50 p-2 rounded">managePSPUsers</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-purple-50">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            Merchant Auth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        <div>
                            <Badge className="bg-purple-100 text-purple-700 mb-2">Table</Badge>
                            <p className="text-xs font-mono">public.merchant_users</p>
                        </div>
                        <div>
                            <Badge className="bg-purple-100 text-purple-700 mb-2">Function</Badge>
                            <p className="text-xs font-mono">merchantAuth</p>
                        </div>
                        <div>
                            <Badge className="bg-purple-100 text-purple-700 mb-2">Login Page</Badge>
                            <p className="text-xs font-mono">MerchantLogin</p>
                        </div>
                        <div className="pt-2 border-t">
                            <p className="text-xs font-semibold mb-1">Auto-created:</p>
                            <p className="text-xs text-slate-600">During merchant onboarding</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-emerald-50">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-600" />
                            Platform Admin Auth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        <div>
                            <Badge className="bg-emerald-100 text-emerald-700 mb-2">Table</Badge>
                            <p className="text-xs font-mono">AuthUser entity</p>
                        </div>
                        <div>
                            <Badge className="bg-emerald-100 text-emerald-700 mb-2">Function</Badge>
                            <p className="text-xs font-mono">platformAuth</p>
                        </div>
                        <div>
                            <Badge className="bg-emerald-100 text-emerald-700 mb-2">Login Page</Badge>
                            <p className="text-xs font-mono">PlatformAdminLogin</p>
                        </div>
                        <div className="pt-2 border-t">
                            <p className="text-xs font-semibold mb-1">Register via:</p>
                            <p className="text-xs font-mono bg-slate-50 p-2 rounded">platformAuth</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-900">
                        <CheckCircle2 className="h-5 w-5" />
                        Database Schema Structure
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-semibold text-sm mb-2">Public Schema:</p>
                        <div className="space-y-1 text-xs font-mono bg-white p-3 rounded border">
                            <p>• merchant_users (all merchants)</p>
                            <p>• virtual_terminal_users (VT users)</p>
                            <p>• platform_admins (via AuthUser entity)</p>
                            <p className="text-red-600 line-through">• app_users (DELETED - was causing conflicts)</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-sm mb-2">PSP Schemas (Isolated):</p>
                        <div className="space-y-1 text-xs font-mono bg-white p-3 rounded border">
                            <p>psp_acme.psp_staff_users</p>
                            <p>psp_globalpay.psp_staff_users</p>
                            <p>psp_fintech.psp_staff_users</p>
                            <p className="text-slate-500">... (one per PSP)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Session Storage Keys</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="font-semibold mb-1">PSP Staff</p>
                            <p className="font-mono text-blue-700">staff_session</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded border border-purple-200">
                            <p className="font-semibold mb-1">Merchant</p>
                            <p className="font-mono text-purple-700">merchantSession</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                            <p className="font-semibold mb-1">Platform Admin</p>
                            <p className="font-mono text-emerald-700">platform_admin_session</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}