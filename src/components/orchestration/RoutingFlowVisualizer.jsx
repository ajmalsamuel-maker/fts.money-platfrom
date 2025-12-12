import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, XCircle, Clock, Zap, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getCountryName } from '@/components/utils/countries';

export default function RoutingFlowVisualizer({ 
    merchants = [], 
    merchantMIDs = [], 
    bankMIDs = [], 
    processors = [],
    midRoutingRules = [],
    orchestrationRules = []
}) {
    // Build routing paths
    const buildRoutingPath = (merchant) => {
        const mids = merchantMIDs.filter(m => m.merchant_id === merchant.id);
        
        return mids.map(mid => {
            const routes = midRoutingRules
                .filter(r => r.merchant_mid_id === mid.id && r.status === 'active')
                .sort((a, b) => a.priority - b.priority);
            
            // Group routes by network
            const routesByNetwork = {};
            
            routes.forEach(route => {
                const bankMID = bankMIDs.find(b => b.id === route.bank_mid_id);
                const processor = processors.find(p => p.id === bankMID?.acquirer_id);
                
                // Determine applicable networks
                const networks = route.routing_conditions?.card_types || bankMID?.supported_card_types || ['all'];
                
                networks.forEach(network => {
                    if (!routesByNetwork[network]) {
                        routesByNetwork[network] = [];
                    }
                    routesByNetwork[network].push({ route, bankMID, processor });
                });
            });
            
            return {
                merchant,
                merchantMID: mid,
                routes: routes.map(route => {
                    const bankMID = bankMIDs.find(b => b.id === route.bank_mid_id);
                    const processor = processors.find(p => p.id === bankMID?.acquirer_id);
                    const networks = route.routing_conditions?.card_types || bankMID?.supported_card_types || [];
                    return { route, bankMID, processor, networks };
                }),
                routesByNetwork
            };
        });
    };

    const sampleMerchant = merchants[0];
    const paths = sampleMerchant ? buildRoutingPath(sampleMerchant) : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-500" />
                    Complete Routing Flow Visualization
                </CardTitle>
            </CardHeader>
            <CardContent>
                {paths.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No routing configuration available</p>
                        <p className="text-sm mt-2">Create merchants, MIDs, and routing rules to visualize the flow</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {paths.map((path, pathIdx) => (
                            <div key={pathIdx} className="space-y-4">
                                {/* Merchant */}
                                <div className="flex items-center gap-4">
                                    <div className="w-48 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                                                M
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-purple-600 font-medium">Merchant</p>
                                                <p className="text-sm font-bold text-purple-900 truncate">
                                                    {path.merchant.business_name}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs mt-2 bg-white">
                                            {path.merchant.country || 'N/A'} • {path.merchant.currency || 'USD'}
                                        </Badge>
                                    </div>

                                    <ArrowRight className="h-6 w-6 text-slate-400 flex-shrink-0" />

                                    {/* Merchant MID */}
                                    <div className="w-48 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                                MID
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-blue-600 font-medium">Merchant MID</p>
                                                <p className="text-xs font-mono font-bold text-blue-900 truncate">
                                                    {path.merchantMID.mid}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs mt-2 bg-white capitalize">
                                            {path.merchantMID.account_type}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Routing Options */}
                                <div className="ml-12 pl-8 border-l-2 border-dashed border-slate-300">
                                    <div className="space-y-3">
                                        {path.routes.map((routeInfo, routeIdx) => (
                                            <div key={routeIdx} className="space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                                            routeIdx === 0 ? "bg-emerald-500" : "bg-slate-400"
                                                        )}>
                                                            {routeInfo.route.priority}
                                                        </div>
                                                        <span className="text-xs text-slate-500">
                                                            {routeIdx === 0 ? 'Primary' : `Failover ${routeIdx}`}
                                                        </span>
                                                    </div>

                                                    <ArrowRight className="h-5 w-5 text-slate-400" />

                                                    {/* Bank MID */}
                                                    <div className="w-48 p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                                                                B
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-cyan-600">Bank MID</p>
                                                                <p className="text-xs font-bold text-cyan-900 truncate">
                                                                    {routeInfo.bankMID?.bank_mid_name || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                            <span className="text-xs text-emerald-600 font-medium">
                                                                {routeInfo.bankMID?.success_rate || 98}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <ArrowRight className="h-5 w-5 text-slate-400" />

                                                    {/* Processor */}
                                                    <div className="w-48 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                                                                P
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-emerald-600">Processor</p>
                                                                <p className="text-xs font-bold text-emerald-900 truncate">
                                                                    {routeInfo.processor?.name || routeInfo.bankMID?.acquirer_name || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Clock className="h-3 w-3 text-amber-600" />
                                                            <span className="text-xs text-amber-600">
                                                                {routeInfo.processor?.avg_response_time_ms || 250}ms
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Network-specific info */}
                                                {routeInfo.networks && routeInfo.networks.length > 0 && (
                                                    <div className="ml-8 flex items-center gap-2">
                                                        <CreditCard className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs text-slate-500">Networks:</span>
                                                        <div className="flex gap-1">
                                                            {routeInfo.networks.map((net, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs capitalize">
                                                                    {net}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {path.routes.length === 0 && (
                                            <div className="text-sm text-amber-600 flex items-center gap-2">
                                                <XCircle className="h-4 w-4" />
                                                No routing rules configured for this MID
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-8 pt-6 border-t">
                    <p className="text-xs font-medium text-slate-700 mb-3">Routing Flow Legend:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-500" />
                            <span className="text-xs text-slate-600">Merchant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500" />
                            <span className="text-xs text-slate-600">Merchant MID</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-cyan-500" />
                            <span className="text-xs text-slate-600">Bank MID</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-500" />
                            <span className="text-xs text-slate-600">Processor</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}