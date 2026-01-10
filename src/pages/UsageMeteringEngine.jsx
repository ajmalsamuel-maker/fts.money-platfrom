import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, Zap, Search } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';

export default function UsageMeteringEngine() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState('all');

    const { data: meters = [] } = useQuery({
        queryKey: ['usage-meters'],
        queryFn: async () => {
            return await base44.entities.UsageMeter.list();
        },
        enabled: !loading
    });

    const filteredMeters = meters.filter(meter => {
        const matchesSearch = !searchQuery || 
            meter.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesService = serviceFilter === 'all' || meter.service_type === serviceFilter;
        return matchesSearch && matchesService;
    });

    // Calculate aggregates
    const totalUsageCount = meters.reduce((sum, m) => sum + (m.current_usage_count || 0), 0);
    const totalEstimatedCharges = meters.reduce((sum, m) => sum + (m.estimated_charge || 0), 0);
    const metersWithOverage = meters.filter(m => (m.overage_units || 0) > 0).length;

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="UsageMeteringEngine"
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Usage Metering Engine</h2>
                        <p className="text-xs text-slate-600">Real-time usage tracking across all services</p>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total Usage Events</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-slate-900">{totalUsageCount.toLocaleString()}</span>
                                    <Activity className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Estimated Charges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-green-600">${totalEstimatedCharges.toLocaleString()}</span>
                                    <TrendingUp className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Overage Meters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-orange-600">{metersWithOverage}</span>
                                    <Zap className="h-8 w-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Meters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search by customer email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="Filter by service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Services</SelectItem>
                                        <SelectItem value="psp_payment_processing">PSP Processing</SelectItem>
                                        <SelectItem value="iso_gateway">ISO Gateway</SelectItem>
                                        <SelectItem value="orchestration">Orchestration</SelectItem>
                                        <SelectItem value="crypto_vasp">Crypto VASP</SelectItem>
                                        <SelectItem value="rwa_tokenization">RWA Tokenization</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                {filteredMeters.map((meter) => (
                                    <div key={meter.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{meter.customer_email}</p>
                                                <p className="text-sm text-slate-600">{meter.service_type} - {meter.metric_type}</p>
                                                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                                    <span>Period: {new Date(meter.current_period_start).toLocaleDateString()} - {new Date(meter.current_period_end).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">Usage</p>
                                                <p className="text-xl font-bold text-slate-900">{meter.current_usage_count?.toLocaleString()}</p>
                                                {meter.included_units > 0 && (
                                                    <p className="text-xs text-slate-500">
                                                        {meter.included_units} included, {meter.overage_units || 0} overage
                                                    </p>
                                                )}
                                                <p className="text-sm font-semibold text-green-600 mt-1">
                                                    Est: ${meter.estimated_charge?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}