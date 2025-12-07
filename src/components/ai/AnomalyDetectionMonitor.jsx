import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    AlertTriangle, TrendingUp, TrendingDown, Activity, 
    Shield, Zap, DollarSign, Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function AnomalyDetectionMonitor({ merchantId }) {
    const [anomalies, setAnomalies] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const queryClient = useQueryClient();

    const { data: transactions = [] } = useQuery({
        queryKey: ['recent-transactions-anomaly'],
        queryFn: async () => {
            const filter = merchantId ? { merchant_id: merchantId } : {};
            return await base44.entities.Transaction.filter(filter, '-created_date', 100);
        },
    });

    const detectAnomaliesMutation = useMutation({
        mutationFn: async (txns) => {
            const prompt = `You are an advanced payment anomaly detection AI. Analyze these transactions and identify anomalies beyond standard fraud rules.

Transactions: ${JSON.stringify(txns.slice(0, 20).map(t => ({
    id: t.transaction_id,
    amount: t.amount,
    status: t.status,
    customer: t.customer_email,
    merchant: t.merchant_name,
    created: t.created_date
})))}

Look for:
1. Unusual spending patterns (sudden spikes, irregular timing)
2. Behavioral anomalies (different purchase patterns)
3. Statistical outliers (amounts, frequencies)
4. Temporal anomalies (unusual hours, rapid sequences)
5. Geographic inconsistencies
6. Merchant-specific unusual activity

Return a JSON object with:
{
    "anomalies": [
        {
            "transaction_id": "string",
            "anomaly_type": "spending_spike" | "timing_unusual" | "pattern_break" | "statistical_outlier" | "behavioral_shift",
            "severity": "low" | "medium" | "high" | "critical",
            "confidence": 0-1,
            "description": "string",
            "recommendation": "string",
            "metrics": {"key": "value"}
        }
    ],
    "overall_risk_score": 0-100,
    "baseline_metrics": {
        "avg_transaction": number,
        "transaction_frequency": string
    }
}`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        anomalies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    transaction_id: { type: "string" },
                                    anomaly_type: { type: "string" },
                                    severity: { type: "string" },
                                    confidence: { type: "number" },
                                    description: { type: "string" },
                                    recommendation: { type: "string" },
                                    metrics: { type: "object" }
                                }
                            }
                        },
                        overall_risk_score: { type: "number" },
                        baseline_metrics: { type: "object" }
                    }
                }
            });

            return result;
        },
        onSuccess: (result) => {
            setAnomalies(result.anomalies || []);
            if (result.anomalies && result.anomalies.length > 0) {
                const critical = result.anomalies.filter(a => a.severity === 'critical').length;
                const high = result.anomalies.filter(a => a.severity === 'high').length;
                
                if (critical > 0) {
                    toast.error(`${critical} critical anomalies detected!`);
                } else if (high > 0) {
                    toast.warning(`${high} high-severity anomalies detected`);
                } else {
                    toast.success(`${result.anomalies.length} anomalies identified`);
                }
            } else {
                toast.success('No anomalies detected');
            }
        }
    });

    const runScan = async () => {
        setIsScanning(true);
        await detectAnomaliesMutation.mutate(transactions);
        setIsScanning(false);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
            default: return 'bg-blue-100 text-blue-700 border-blue-300';
        }
    };

    const getAnomalyIcon = (type) => {
        switch (type) {
            case 'spending_spike': return TrendingUp;
            case 'timing_unusual': return Clock;
            case 'pattern_break': return Activity;
            case 'statistical_outlier': return AlertTriangle;
            default: return Shield;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        AI Anomaly Detection
                    </h3>
                    <p className="text-sm text-slate-500">
                        Advanced behavioral analysis beyond standard fraud rules
                    </p>
                </div>
                <Button 
                    onClick={runScan}
                    disabled={isScanning || transactions.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {isScanning ? (
                        <>
                            <Zap className="h-4 w-4 mr-2 animate-pulse" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4 mr-2" />
                            Run AI Scan
                        </>
                    )}
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Transactions Analyzed</p>
                            <p className="text-xl font-semibold">{transactions.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Anomalies Detected</p>
                            <p className="text-xl font-semibold">{anomalies.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Critical Issues</p>
                            <p className="text-xl font-semibold">
                                {anomalies.filter(a => a.severity === 'critical').length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {isScanning && (
                <Card className="p-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Analysis in Progress</span>
                            <span className="text-xs text-slate-500">Analyzing behavioral patterns...</span>
                        </div>
                        <Progress value={66} className="h-2" />
                    </div>
                </Card>
            )}

            {anomalies.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Detected Anomalies</h4>
                    {anomalies.map((anomaly, idx) => {
                        const Icon = getAnomalyIcon(anomaly.anomaly_type);
                        return (
                            <Card key={idx} className={`p-4 border-2 ${getSeverityColor(anomaly.severity)}`}>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={getSeverityColor(anomaly.severity)}>
                                                        {anomaly.severity}
                                                    </Badge>
                                                    <span className="text-xs text-slate-600">
                                                        {(anomaly.confidence * 100).toFixed(0)}% confidence
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium mb-1">{anomaly.description}</p>
                                                <p className="text-xs text-slate-600 mb-2">{anomaly.recommendation}</p>
                                                {anomaly.transaction_id && (
                                                    <p className="text-xs text-slate-500">
                                                        Transaction: {anomaly.transaction_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {anomaly.metrics && Object.keys(anomaly.metrics).length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                                            {Object.entries(anomaly.metrics).map(([key, value]) => (
                                                <Badge key={key} variant="outline" className="text-xs">
                                                    {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {!isScanning && anomalies.length === 0 && transactions.length > 0 && (
                <Card className="p-8 text-center">
                    <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Ready to Scan</h4>
                    <p className="text-sm text-slate-500">
                        Click "Run AI Scan" to analyze {transactions.length} transactions for behavioral anomalies
                    </p>
                </Card>
            )}
        </div>
    );
}