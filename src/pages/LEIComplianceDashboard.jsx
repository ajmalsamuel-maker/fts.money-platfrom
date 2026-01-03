import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle2, Clock, TrendingUp, Building2, Store, RefreshCw } from 'lucide-react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LEIComplianceDashboard() {
    const queryClient = useQueryClient();
    const { platformUser } = usePlatformAuth();

    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['lei-compliance-dashboard'],
        queryFn: async () => {
            const response = await base44.functions.invoke('complianceMonitor', { action: 'get_dashboard' });
            return response.data.dashboard;
        },
        refetchInterval: 60000 // Refresh every minute
    });

    const runComplianceCheck = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('complianceMonitor', { action: 'check_all_compliance' });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['lei-compliance-dashboard']);
        }
    });

    if (isLoading || !dashboard) {
        return (
            <div className="flex h-screen bg-slate-50">
                <FTSPlatformSidebar currentPage="LEIComplianceDashboard" userEmail={platformUser?.email} userRole={platformUser?.platform_role} />
                <div className="flex-1 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    const complianceRate = parseFloat(dashboard.global_stats.compliance_rate);

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="LEIComplianceDashboard" userEmail={platformUser?.email} userRole={platformUser?.platform_role} />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">LEI/vLEI Compliance Monitor</h2>
                        <p className="text-xs text-slate-600">Global Legal Entity Identifier compliance tracking</p>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={true} />
                </header>
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
                        </div>
                        <Button
                            onClick={() => runComplianceCheck.mutate()}
                            disabled={runComplianceCheck.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {runComplianceCheck.isPending ? (
                                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
                            ) : (
                                <><RefreshCw className="h-4 w-4 mr-2" /> Run Compliance Check</>
                            )}
                        </Button>
                    </div>

                    {/* Global Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">LEIs Issued</p>
                                        <p className="text-3xl font-bold text-slate-900">{dashboard.global_stats.total_leis_issued}</p>
                                    </div>
                                    <Shield className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active vLEIs</p>
                                        <p className="text-3xl font-bold text-emerald-600">{dashboard.global_stats.active_vleis}</p>
                                    </div>
                                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Compliance Rate</p>
                                        <p className="text-3xl font-bold text-slate-900">{dashboard.global_stats.compliance_rate}%</p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 text-purple-600" />
                                </div>
                                <Progress value={complianceRate} className="mt-3" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Expiring Soon</p>
                                        <p className="text-3xl font-bold text-amber-600">{dashboard.upcoming_expirations.length}</p>
                                    </div>
                                    <Clock className="h-10 w-10 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Entity Type Breakdown */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    <CardTitle>PSP Instances</CardTitle>
                                </div>
                                <CardDescription>Payment Service Provider compliance status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Total PSPs</span>
                                    <Badge variant="outline">{dashboard.by_entity_type.psps.total}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">With LEI</span>
                                    <Badge className="bg-blue-100 text-blue-800">{dashboard.by_entity_type.psps.with_lei}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">With vLEI</span>
                                    <Badge className="bg-emerald-100 text-emerald-800">{dashboard.by_entity_type.psps.with_vlei}</Badge>
                                </div>
                                <div className="pt-3 border-t">
                                    <Progress 
                                        value={(dashboard.by_entity_type.psps.with_lei / dashboard.by_entity_type.psps.total) * 100} 
                                        className="h-2"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        {((dashboard.by_entity_type.psps.with_lei / dashboard.by_entity_type.psps.total) * 100).toFixed(1)}% compliant
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Store className="h-5 w-5 text-purple-600" />
                                    <CardTitle>Merchants</CardTitle>
                                </div>
                                <CardDescription>Merchant compliance status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Total Merchants</span>
                                    <Badge variant="outline">{dashboard.by_entity_type.merchants.total}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">With LEI</span>
                                    <Badge className="bg-blue-100 text-blue-800">{dashboard.by_entity_type.merchants.with_lei}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">With vLEI</span>
                                    <Badge className="bg-emerald-100 text-emerald-800">{dashboard.by_entity_type.merchants.with_vlei}</Badge>
                                </div>
                                <div className="pt-3 border-t">
                                    <Progress 
                                        value={(dashboard.by_entity_type.merchants.with_lei / dashboard.by_entity_type.merchants.total) * 100} 
                                        className="h-2"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        {((dashboard.by_entity_type.merchants.with_lei / dashboard.by_entity_type.merchants.total) * 100).toFixed(1)}% compliant
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Expirations */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <CardTitle>Upcoming LEI Expirations</CardTitle>
                                </div>
                                <Badge variant="outline">{dashboard.upcoming_expirations.length} expiring within 60 days</Badge>
                            </div>
                            <CardDescription>LEIs requiring renewal action</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashboard.upcoming_expirations.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                                    <p className="text-slate-600">No LEIs expiring soon - all compliant!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {dashboard.upcoming_expirations.map((expiration, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                {expiration.entity_type === 'psp' ? (
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <Store className="h-5 w-5 text-purple-600" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{expiration.entity_name}</p>
                                                    <p className="text-xs text-slate-600">LEI: {expiration.lei}</p>
                                                </div>
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className={
                                                    expiration.days_remaining < 7 ? 'bg-red-50 text-red-800 border-red-200' :
                                                    expiration.days_remaining < 30 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                                    'bg-blue-50 text-blue-800 border-blue-200'
                                                }
                                            >
                                                {expiration.days_remaining} days left
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Compliance Actions */}
                    {runComplianceCheck.data && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Compliance Check Results</CardTitle>
                                <CardDescription>
                                    Completed at {new Date(runComplianceCheck.data.checked_at).toLocaleString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <p className="text-2xl font-bold text-emerald-600">
                                            {runComplianceCheck.data.results.summary.compliant}
                                        </p>
                                        <p className="text-sm text-emerald-800">Compliant</p>
                                    </div>
                                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <p className="text-2xl font-bold text-amber-600">
                                            {runComplianceCheck.data.results.summary.in_grace_period}
                                        </p>
                                        <p className="text-sm text-amber-800">Grace Period</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-2xl font-bold text-red-600">
                                            {runComplianceCheck.data.results.summary.non_compliant}
                                        </p>
                                        <p className="text-sm text-red-800">Non-Compliant</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {runComplianceCheck.data.results.summary.warnings_sent}
                                        </p>
                                        <p className="text-sm text-blue-800">Warnings Sent</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}