import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    PieChart, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Target,
    TrendingUp,
    Shield,
    CreditCard
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BusinessMetrics({ transactions = [] }) {
    // Calculate real metrics from transactions
    const totalTxns = transactions.length;
    const chargebacks = transactions.filter(t => t.type === 'chargeback').length;
    const declined = transactions.filter(t => t.status === 'declined' || t.status === 'rejected' || t.status === 'failed').length;
    const fraudulent = transactions.filter(t => t.fraud_control_status === 'flagged' || t.fraud_control_status === 'blocked').length;
    
    const chargebackRatio = totalTxns > 0 ? ((chargebacks / totalTxns) * 100).toFixed(2) : '0.00';
    const declineRate = totalTxns > 0 ? ((declined / totalTxns) * 100).toFixed(1) : '0.0';
    const fraudRate = totalTxns > 0 ? ((fraudulent / totalTxns) * 100).toFixed(2) : '0.00';
    
    const metrics = [
        {
            label: 'Chargeback Ratio',
            value: `${chargebackRatio}%`,
            target: '< 1%',
            status: parseFloat(chargebackRatio) < 1 ? 'good' : 'warning',
            progress: Math.min(100, parseFloat(chargebackRatio) * 100),
            icon: Shield,
            description: 'Below Visa/MC threshold'
        },
        {
            label: 'Decline Rate',
            value: `${declineRate}%`,
            target: '< 5%',
            status: parseFloat(declineRate) < 5 ? 'good' : 'warning',
            progress: Math.min(100, (parseFloat(declineRate) / 5) * 100),
            icon: CreditCard,
            description: 'Industry average: 4.5%'
        },
        {
            label: 'Fraud Rate',
            value: `${fraudRate}%`,
            target: '< 0.1%',
            status: parseFloat(fraudRate) < 0.1 ? 'good' : 'warning',
            progress: Math.min(100, (parseFloat(fraudRate) / 0.1) * 100),
            icon: AlertTriangle,
            description: parseFloat(fraudRate) < 0.1 ? 'Within threshold' : 'Approaching threshold'
        },
        {
            label: 'Avg Settlement Time',
            value: '1.2 days',
            target: 'T+1',
            status: 'good',
            progress: 100,
            icon: Clock,
            description: 'Within SLA'
        }
    ];

    const networkHealth = [
        { network: 'Visa', status: 'operational', latency: '45ms' },
        { network: 'Mastercard', status: 'operational', latency: '52ms' },
        { network: 'Amex', status: 'operational', latency: '68ms' },
        { network: 'Discover', status: 'degraded', latency: '124ms' },
    ];

    return (
        <Card className="p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Key Business Metrics</h3>
                </div>
            </div>

            <div className="space-y-3 mb-3">
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                        <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Icon className={cn(
                                        "h-3.5 w-3.5",
                                        metric.status === 'good' ? "text-emerald-500" : 
                                        metric.status === 'warning' ? "text-amber-500" : "text-red-500"
                                    )} />
                                    <span className="text-xs font-medium text-slate-700">{metric.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-slate-900">{metric.value}</span>
                                    <Badge 
                                        variant="outline" 
                                        className={cn(
                                            "text-[9px] px-1 py-0",
                                            metric.status === 'good' ? "border-emerald-300 text-emerald-700" : 
                                            metric.status === 'warning' ? "border-amber-300 text-amber-700" : "border-red-300 text-red-700"
                                        )}
                                    >
                                        {metric.target}
                                    </Badge>
                                </div>
                            </div>
                            <Progress 
                                value={metric.progress} 
                                className={cn(
                                    "h-1",
                                    metric.status === 'good' ? "[&>div]:bg-emerald-500" : 
                                    metric.status === 'warning' ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                                )}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="border-t pt-3">
                <h4 className="text-xs font-medium text-slate-700 mb-2">Network Status</h4>
                <div className="grid grid-cols-2 gap-1.5">
                    {networkHealth.map((network, idx) => (
                        <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
                            <div className="flex items-center gap-1.5">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    network.status === 'operational' ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                                <span className="text-xs text-slate-700">{network.network}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{network.latency}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}