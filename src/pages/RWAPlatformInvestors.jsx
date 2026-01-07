import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, AlertCircle, Shield, Mail } from 'lucide-react';

export default function RWAPlatformInvestors() {
    const { platformUser, loading } = usePlatformAuth();
    const [searchTerm, setSearchTerm] = React.useState('');

    const { data: investors = [] } = useQuery({
        queryKey: ['all-investors'],
        queryFn: () => base44.entities.RWAInvestor.list('-created_date')
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['all-holdings'],
        queryFn: () => base44.entities.RWAHolding.list()
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

    const filteredInvestors = investors.filter(investor => 
        investor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getKycStatusColor = (status) => {
        const colors = {
            verified: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            rejected: 'bg-red-100 text-red-700',
            expired: 'bg-slate-100 text-slate-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="RWAPlatformInvestors" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">RWA Investors</h2>
                        <p className="text-xs text-slate-600">View all investors across RWA providers</p>
                    </div>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Investors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{investors.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Verified KYC</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    {investors.filter(i => i.kyc_status === 'verified').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Pending KYC</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {investors.filter(i => i.kyc_status === 'pending').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Accredited</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-blue-600">
                                    {investors.filter(i => i.accredited_investor).length}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name, email, or wallet address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Investors List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Investor Directory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredInvestors.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No investors found</p>
                            ) : (
                                <div className="space-y-3">
                                    {filteredInvestors.map(investor => {
                                        const investorHoldings = holdings.filter(h => h.investor_id === investor.id);
                                        const totalValue = investorHoldings.reduce((sum, h) => sum + (h.current_value || 0), 0);

                                        return (
                                            <div 
                                                key={investor.id}
                                                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-slate-900">{investor.full_name}</h3>
                                                            <Badge className={getKycStatusColor(investor.kyc_status)}>
                                                                {investor.kyc_status === 'verified' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                                                                {investor.kyc_status}
                                                            </Badge>
                                                            {investor.accredited_investor && (
                                                                <Badge className="bg-blue-100 text-blue-700">
                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                    Accredited
                                                                </Badge>
                                                            )}
                                                            {investor.vlei_verified && (
                                                                <Badge className="bg-purple-100 text-purple-700">
                                                                    vLEI Verified
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {investor.email}
                                                            </div>
                                                            <div>Type: <span className="capitalize">{investor.investor_type}</span></div>
                                                            <div className="col-span-2">
                                                                <span className="font-mono text-xs">{investor.wallet_address}</span>
                                                            </div>
                                                            <div>Jurisdiction: {investor.jurisdiction}</div>
                                                            {investor.lei && <div>LEI: <span className="font-mono text-xs">{investor.lei}</span></div>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">Portfolio Value</p>
                                                        <p className="text-lg font-bold">${(totalValue / 1000).toFixed(1)}K</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {investorHoldings.length} {investorHoldings.length === 1 ? 'asset' : 'assets'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}