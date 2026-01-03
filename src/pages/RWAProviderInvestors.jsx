import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { Search, Users, CheckCircle2, AlertCircle, Shield, Mail } from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function RWAProviderInvestors() {
    const { provider, loading } = useRWAProviderAuth();
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = React.useState('');

    const { data: investors = [] } = useQuery({
        queryKey: ['investors', provider?.provider_code],
        queryFn: () => base44.entities.RWAInvestor.list('-created_date'),
        enabled: !!provider
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['holdings', provider?.provider_code],
        queryFn: () => base44.entities.RWAHolding.list(),
        enabled: !!provider
    });

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

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
            <RWAProviderSidebar 
                currentPage="RWAProviderInvestors"
                providerName={provider?.company_name}
                providerEmail={provider?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">All Investors</h1>
                        <p className="text-slate-600">Manage and view all verified investors</p>
                    </div>

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