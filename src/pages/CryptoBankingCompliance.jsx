import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CryptoBankingCompliance() {
    const { platformUser, loading } = usePlatformAuth();

    const { data: cryptoCustomers = [] } = useQuery({
        queryKey: ['crypto-customers'],
        queryFn: () => base44.entities.CryptoGatewayCustomer.list()
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    const kycCompliant = cryptoCustomers.filter(c => c.kyc_status === 'approved').length;
    const amlCompliant = cryptoCustomers.filter(c => c.aml_status === 'clear').length;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CryptoBankingCompliance" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Crypto Banking Compliance & KYC</h2>
                        <p className="text-xs text-slate-600">Manage compliance settings for VASP platform</p>
                    </div>
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Settings
                    </Button>
                </header>

                <div className="p-6">
                    {/* Compliance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">KYC Compliant</p>
                                        <p className="text-3xl font-bold text-green-900 mt-1">{kycCompliant}/{cryptoCustomers.length}</p>
                                    </div>
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">AML Clear</p>
                                        <p className="text-3xl font-bold text-green-900 mt-1">{amlCompliant}/{cryptoCustomers.length}</p>
                                    </div>
                                    <Shield className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-700 font-medium">Pending Review</p>
                                        <p className="text-3xl font-bold text-blue-900 mt-1">
                                            {cryptoCustomers.filter(c => c.kyc_status === 'pending').length}
                                        </p>
                                    </div>
                                    <AlertCircle className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Regulatory Frameworks */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Regulatory Frameworks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">VASP License (EU)</p>
                                        <p className="text-sm text-slate-500">Virtual Asset Service Provider - Active</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">MiCA Regulation</p>
                                        <p className="text-sm text-slate-500">Markets in Crypto-Assets - Compliant</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">FATF Travel Rule</p>
                                        <p className="text-sm text-slate-500">Financial Action Task Force - Implemented</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">AML/CTF</p>
                                        <p className="text-sm text-slate-500">Anti-Money Laundering / Counter Terrorism - Active</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Compliance Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Compliance Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {cryptoCustomers.map((customer) => (
                                    <div key={customer.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                {customer.customer_name?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{customer.customer_name}</p>
                                                <p className="text-sm text-slate-500">{customer.customer_email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">KYC Status</p>
                                                <Badge variant={customer.kyc_status === 'approved' ? 'default' : 'secondary'}>
                                                    {customer.kyc_status || 'pending'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">AML Status</p>
                                                <Badge variant={customer.aml_status === 'clear' ? 'default' : 'secondary'}>
                                                    {customer.aml_status || 'pending'}
                                                </Badge>
                                            </div>
                                            <Button size="sm" variant="outline">Review</Button>
                                        </div>
                                    </div>
                                ))}

                                {cryptoCustomers.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No customers to review</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}