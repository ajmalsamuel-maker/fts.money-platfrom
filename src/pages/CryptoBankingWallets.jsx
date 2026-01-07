import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Settings, Users, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CryptoBankingWallets() {
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

    const totalWallets = cryptoCustomers.reduce((sum, c) => sum + (c.wallet_count || 0), 0);
    const totalBalance = cryptoCustomers.reduce((sum, c) => sum + (c.total_balance_usd || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CryptoBankingWallets" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Crypto Wallets & IBANs</h2>
                        <p className="text-xs text-slate-600">Manage cryptocurrency wallets across all VASP customers</p>
                    </div>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Wallets</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">{totalWallets}</p>
                                    </div>
                                    <Wallet className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">VASP Customers</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">{cryptoCustomers.length}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total AUM</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">${(totalBalance / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active IBANs</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">{cryptoCustomers.filter(c => c.iban_enabled).length}</p>
                                    </div>
                                    <Settings className="h-8 w-8 text-cyan-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customers List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>VASP Customer Wallets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
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
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">Wallets</p>
                                                <p className="font-semibold">{customer.wallet_count || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">Balance</p>
                                                <p className="font-semibold">${(customer.total_balance_usd || 0).toLocaleString()}</p>
                                            </div>
                                            <Badge variant={customer.iban_enabled ? "default" : "secondary"}>
                                                {customer.iban_enabled ? 'IBAN Active' : 'No IBAN'}
                                            </Badge>
                                            <Button size="sm" variant="outline">View Details</Button>
                                        </div>
                                    </div>
                                ))}

                                {cryptoCustomers.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No VASP customers yet</p>
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