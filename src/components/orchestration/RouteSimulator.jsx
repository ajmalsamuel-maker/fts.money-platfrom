import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Loader2, CheckCircle, XCircle, ArrowRight, Clock, DollarSign, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function RouteSimulator({ merchants = [] }) {
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    const [params, setParams] = useState({
        merchant_id: '',
        amount: '1500',
        currency: 'USD',
        card_type: 'visa',
        country: 'US',
        transaction_type: 'sale'
    });

    const runSimulation = async () => {
        setIsSimulating(true);
        setError(null);
        setResult(null);

        try {
            const response = await base44.functions.invoke('routingEngine', {
                ...params,
                amount: parseFloat(params.amount),
                simulate_only: true
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.error || 'Routing failed');
            }
        } catch (err) {
            setError(err.message || 'Simulation failed');
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-500" />
                        Transaction Simulator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Merchant *</Label>
                        <Select value={params.merchant_id} onValueChange={(val) => setParams({...params, merchant_id: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select merchant" />
                            </SelectTrigger>
                            <SelectContent>
                                {merchants.map(m => (
                                    <SelectItem key={m.merchant_id} value={m.merchant_id}>
                                        {m.business_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount *</Label>
                            <Input
                                type="number"
                                value={params.amount}
                                onChange={(e) => setParams({...params, amount: e.target.value})}
                                placeholder="100.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Currency *</Label>
                            <Select value={params.currency} onValueChange={(val) => setParams({...params, currency: val})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                    <SelectItem value="CNY">CNY</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Card Type</Label>
                            <Select value={params.card_type} onValueChange={(val) => setParams({...params, card_type: val})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="visa">Visa</SelectItem>
                                    <SelectItem value="mastercard">Mastercard</SelectItem>
                                    <SelectItem value="amex">Amex</SelectItem>
                                    <SelectItem value="discover">Discover</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Select value={params.country} onValueChange={(val) => setParams({...params, country: val})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="GB">United Kingdom</SelectItem>
                                    <SelectItem value="DE">Germany</SelectItem>
                                    <SelectItem value="FR">France</SelectItem>
                                    <SelectItem value="CN">China</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button 
                        onClick={runSimulation} 
                        disabled={isSimulating || !params.merchant_id} 
                        className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        {isSimulating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Simulating Route...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Run Simulation
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Result Panel */}
            <Card>
                <CardHeader>
                    <CardTitle>Routing Result</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {result && result.path && (
                        <div className="space-y-4">
                            {/* Success Badge */}
                            <Alert className="border-emerald-200 bg-emerald-50">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <AlertDescription className="text-emerald-700 font-medium">
                                    Routing Path Determined Successfully
                                </AlertDescription>
                            </Alert>

                            {/* Network Decision */}
                            {result.path.routingDecision?.networkSpecific && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                            Network-Specific Routing: {result.path.routingDecision.network?.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-blue-700">
                                        Route optimized for {result.path.routingDecision.network} transactions
                                    </p>
                                    {result.path.routingDecision.networkCompatible && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                                            <span className="text-xs text-emerald-600">Network compatibility verified</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Routing Path */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-slate-700">Complete Routing Path:</h4>
                                
                                {/* Merchant */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <p className="text-xs text-purple-600">Merchant</p>
                                        <p className="text-sm font-medium text-purple-900">{result.path.merchant.business_name}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>

                                {/* Merchant MID */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-xs text-blue-600">Merchant MID</p>
                                        <p className="text-xs font-mono font-medium text-blue-900">{result.path.merchantMID.mid}</p>
                                        <Badge variant="outline" className="text-xs mt-1 capitalize">
                                            {result.path.merchantMID.account_type}
                                        </Badge>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>

                                {/* Bank MID */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                                        <p className="text-xs text-cyan-600">Bank MID</p>
                                        <p className="text-sm font-medium text-cyan-900">{result.path.bankMID.bank_mid_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                                            <span className="text-xs text-emerald-600">{result.path.bankMID.success_rate}%</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>

                                {/* Processor */}
                                {result.path.processor && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <p className="text-xs text-emerald-600">Processor</p>
                                        <p className="text-sm font-medium text-emerald-900">{result.path.processor.name}</p>
                                        <Badge variant="outline" className="text-xs mt-1">
                                            {result.path.processor.type}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Estimates */}
                            {result.estimated && (
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Success Rate</p>
                                        <p className="text-lg font-bold text-emerald-600">{result.estimated.success_rate}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Latency</p>
                                        <p className="text-lg font-bold text-amber-600">{result.estimated.avg_latency_ms}ms</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Fee</p>
                                        <p className="text-lg font-bold text-blue-600">${result.estimated.fee_estimate}</p>
                                    </div>
                                </div>
                            )}

                            {/* Failover */}
                            {result.path.routingDecision?.failoverAvailable && (
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertDescription className="text-blue-700 text-xs">
                                        <strong>Failover Available:</strong> {result.path.routingDecision.failoverOptions?.length} backup routes configured
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {!result && !error && !isSimulating && (
                        <div className="text-center py-12 text-slate-500">
                            <Play className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm">Run a simulation to see routing results</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}