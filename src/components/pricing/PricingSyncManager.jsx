import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    RefreshCw, 
    AlertTriangle, 
    CheckCircle, 
    ArrowRight,
    Clock,
    TrendingUp,
    Database
} from 'lucide-react';
import { toast } from 'sonner';

export default function PricingSyncManager() {
    const queryClient = useQueryClient();
    const [syncRunning, setSyncRunning] = useState(false);

    const { data: discrepanciesData, isLoading, refetch } = useQuery({
        queryKey: ['pricing-discrepancies'],
        queryFn: async () => {
            const response = await base44.functions.invoke('masterPricingSync', {
                action: 'detect_discrepancies'
            });
            return response.data;
        },
        refetchInterval: 300000 // Refresh every 5 minutes
    });

    const syncMutation = useMutation({
        mutationFn: async () => {
            setSyncRunning(true);
            const response = await base44.functions.invoke('masterPricingSync', {
                action: 'sync_all'
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['pricing-discrepancies']);
            queryClient.invalidateQueries(['master-pricing']);
            toast.success(`Synced ${data.synced} items successfully`);
            setSyncRunning(false);
        },
        onError: () => {
            toast.error('Sync failed');
            setSyncRunning(false);
        }
    });

    const reconcileMutation = useMutation({
        mutationFn: async ({ masterPricingId, externalPrice, resolution }) => {
            const response = await base44.functions.invoke('masterPricingSync', {
                action: 'reconcile',
                masterPricingId,
                externalPrice,
                resolution
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pricing-discrepancies']);
            queryClient.invalidateQueries(['master-pricing']);
            toast.success('Reconciled successfully');
        }
    });

    const discrepancies = discrepanciesData?.discrepancies || [];
    const stats = discrepanciesData?.checked || {};

    return (
        <div className="space-y-6">
            {/* Sync Controls */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Price Synchronization</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">
                                Detect and resolve pricing discrepancies across all sources
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => refetch()}
                                disabled={isLoading}
                                className="gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Scan for Discrepancies
                            </Button>
                            <Button 
                                onClick={() => syncMutation.mutate()}
                                disabled={syncRunning || discrepancies.length === 0}
                                className="gap-2 bg-blue-600"
                            >
                                <Database className={`h-4 w-4 ${syncRunning ? 'animate-pulse' : ''}`} />
                                Sync All to External
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">Services Checked</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.services || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">Routes Checked</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.routes || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">Fees Checked</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.fees || 0}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-900 font-medium">Discrepancies</p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">{discrepancies.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Discrepancies List */}
            {discrepancies.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Pricing Discrepancies Detected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {discrepancies.map((disc, idx) => (
                                <Alert key={idx} className="border-amber-200 bg-amber-50">
                                    <AlertDescription>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-semibold text-slate-900">{disc.item_name}</p>
                                                    <Badge variant="outline" className="capitalize">
                                                        {disc.type.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div>
                                                        <span className="text-slate-600">Master Pricing: </span>
                                                        <span className="font-medium text-blue-700">
                                                            {disc.master_price?.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                                    <div>
                                                        <span className="text-slate-600">External Source: </span>
                                                        <span className="font-medium text-amber-700">
                                                            {disc.external_price?.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-600">Difference: </span>
                                                        <span className="font-medium text-red-600">
                                                            {disc.difference?.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => reconcileMutation.mutate({
                                                        masterPricingId: disc.master_pricing_id,
                                                        externalPrice: disc.master_price,
                                                        resolution: 'use_master'
                                                    })}
                                                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                                >
                                                    Use Master
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => reconcileMutation.mutate({
                                                        masterPricingId: disc.master_pricing_id,
                                                        externalPrice: disc.external_price,
                                                        resolution: 'use_external'
                                                    })}
                                                    className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                                >
                                                    Use External
                                                </Button>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Discrepancies */}
            {discrepancies.length === 0 && !isLoading && (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                            <div>
                                <p className="font-semibold text-emerald-900">All Pricing Synchronized</p>
                                <p className="text-sm text-emerald-700">
                                    No discrepancies found between Master Pricing and external sources
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sync Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Automated Sync Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900">Automatic Discrepancy Detection</p>
                                <p className="text-sm text-slate-600">Scans every 5 minutes</p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900">Sync to Xero</p>
                                <p className="text-sm text-slate-600">Daily at 2:00 AM UTC</p>
                            </div>
                            <Badge variant="outline">Scheduled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900">Service Catalog Sync</p>
                                <p className="text-sm text-slate-600">Real-time on approval</p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}