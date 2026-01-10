import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, Zap, Search, BarChart3, RefreshCw, Download, AlertTriangle, Settings } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { toast } from 'sonner';

export default function UsageMeteringEngine() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [metricFilter, setMetricFilter] = useState('all');
    const [selectedMeter, setSelectedMeter] = useState(null);

    const { data: meters = [] } = useQuery({
        queryKey: ['usage-meters'],
        queryFn: async () => {
            return await base44.entities.UsageMeter.list();
        },
        enabled: !loading
    });

    const { data: invoices = [] } = useQuery({
        queryKey: ['consolidated-invoices'],
        queryFn: async () => {
            return await base44.entities.ConsolidatedInvoice.list();
        },
        enabled: !loading
    });

    const filteredMeters = meters.filter(meter => {
        const matchesSearch = !searchQuery || 
            meter.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesService = serviceFilter === 'all' || meter.service_type === serviceFilter;
        const matchesMetric = metricFilter === 'all' || meter.metric_type === metricFilter;
        return matchesSearch && matchesService && matchesMetric;
    });

    // Calculate aggregates
    const totalUsageCount = meters.reduce((sum, m) => sum + (m.current_usage_count || 0), 0);
    const totalEstimatedCharges = meters.reduce((sum, m) => sum + (m.estimated_charge || 0), 0);
    const metersWithOverage = meters.filter(m => (m.overage_units || 0) > 0).length;
    const totalOverageCharges = meters.reduce((sum, m) => sum + ((m.overage_units || 0) * (m.unit_price || 0)), 0);

    // Usage by service
    const usageByService = {};
    meters.forEach(m => {
        if (!usageByService[m.service_type]) {
            usageByService[m.service_type] = { count: 0, charge: 0 };
        }
        usageByService[m.service_type].count += m.current_usage_count || 0;
        usageByService[m.service_type].charge += m.estimated_charge || 0;
    });

    // Reset meter mutation
    const resetMeterMutation = useMutation({
        mutationFn: async (meterId) => {
            const meter = meters.find(m => m.id === meterId);
            await base44.entities.UsageMeter.update(meterId, {
                current_usage_count: 0,
                current_usage_volume: 0,
                overage_units: 0,
                estimated_charge: 0,
                last_reset_date: new Date().toISOString(),
                usage_history: []
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['usage-meters']);
            toast.success('Meter reset successfully');
        }
    });

    // Export meters
    const exportMeters = () => {
        const headers = ['Customer', 'Service', 'Metric', 'Usage', 'Included', 'Overage', 'Estimated Charge'];
        const rows = filteredMeters.map(m => [
            m.customer_email,
            m.service_type,
            m.metric_type,
            m.current_usage_count,
            m.included_units,
            m.overage_units,
            m.estimated_charge
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usage_meters_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Exported to CSV');
    };

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
                    <div className="flex gap-2">
                        <Button onClick={() => queryClient.invalidateQueries(['usage-meters'])} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={exportMeters} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    <Tabs defaultValue="meters" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="meters">Active Meters</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="alerts">Alerts</TabsTrigger>
                        </TabsList>

                        <TabsContent value="meters" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Overage Charges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-red-600">${totalOverageCharges.toFixed(2)}</span>
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Meters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4 flex-wrap">
                                <div className="flex-1 min-w-64">
                                    <Input
                                        placeholder="Search by customer email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Services</SelectItem>
                                        <SelectItem value="psp_payment_processing">PSP Processing</SelectItem>
                                        <SelectItem value="iso_gateway">ISO Gateway</SelectItem>
                                        <SelectItem value="orchestration">Orchestration</SelectItem>
                                        <SelectItem value="crypto_vasp">Crypto VASP</SelectItem>
                                        <SelectItem value="rwa_tokenization">RWA Tokenization</SelectItem>
                                        <SelectItem value="tax_management">Tax Management</SelectItem>
                                        <SelectItem value="einvoicing">E-Invoicing</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={metricFilter} onValueChange={setMetricFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Metric" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Metrics</SelectItem>
                                        <SelectItem value="transaction">Transactions</SelectItem>
                                        <SelectItem value="iso_message">ISO Messages</SelectItem>
                                        <SelectItem value="api_call">API Calls</SelectItem>
                                        <SelectItem value="wallet_creation">Wallet Creation</SelectItem>
                                        <SelectItem value="kyc_verification">KYC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                {filteredMeters.map((meter) => (
                                    <div key={meter.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-900">{meter.customer_email}</p>
                                                    {(meter.overage_units || 0) > 0 && (
                                                        <Badge className="bg-orange-100 text-orange-700">Overage</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600">{meter.service_type} • {meter.metric_type}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Period: {new Date(meter.current_period_start).toLocaleDateString()} - {new Date(meter.current_period_end).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-600">Usage</p>
                                                    <p className="text-xl font-bold text-slate-900">{meter.current_usage_count?.toLocaleString()}</p>
                                                    {meter.included_units > 0 && (
                                                        <p className="text-xs text-slate-500">
                                                            {meter.included_units} included / {meter.overage_units || 0} over
                                                        </p>
                                                    )}
                                                    <p className="text-sm font-semibold text-green-600 mt-1">
                                                        Est: ${meter.estimated_charge?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedMeter(meter)}>
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Meter Details</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Customer</p>
                                                                    <p className="font-medium">{meter.customer_email}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Service</p>
                                                                    <p className="font-medium">{meter.service_type}</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Metric</p>
                                                                    <p className="font-medium">{meter.metric_type}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-600">Unit Price</p>
                                                                    <p className="font-medium">${meter.unit_price?.toFixed(4)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-slate-50 rounded">
                                                                <p className="text-sm text-slate-600 mb-2">Usage Breakdown</p>
                                                                <div className="space-y-1 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span>Current Usage:</span>
                                                                        <span className="font-medium">{meter.current_usage_count}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Included Units:</span>
                                                                        <span className="font-medium">{meter.included_units}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Overage Units:</span>
                                                                        <span className="font-medium text-orange-600">{meter.overage_units || 0}</span>
                                                                    </div>
                                                                    <div className="flex justify-between pt-2 border-t">
                                                                        <span>Estimated Charge:</span>
                                                                        <span className="font-bold text-green-600">${meter.estimated_charge?.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button 
                                                                variant="destructive" 
                                                                onClick={() => resetMeterMutation.mutate(meter.id)}
                                                                className="w-full"
                                                            >
                                                                Reset Meter
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage by Service</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(usageByService).map(([service, data]) => (
                                            <div key={service} className="p-3 bg-slate-50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-slate-700">{service}</span>
                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-600">{data.count.toLocaleString()} events</p>
                                                        <p className="text-lg font-bold text-slate-900">${data.charge.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="alerts" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage Alerts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {meters.filter(m => (m.overage_units || 0) > 0).map(meter => (
                                            <div key={meter.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{meter.customer_email}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {meter.service_type} exceeded limit by {meter.overage_units} units
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold text-orange-600">
                                                    +${((meter.overage_units || 0) * (meter.unit_price || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                        {meters.filter(m => (m.overage_units || 0) > 0).length === 0 && (
                                            <p className="text-center text-slate-500 py-8">No alerts at this time</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}