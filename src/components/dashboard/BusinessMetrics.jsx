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

export default function BusinessMetrics() {
    const metrics = [
        {
            label: 'Chargeback Ratio',
            value: '0.42%',
            target: '< 1%',
            status: 'good',
            progress: 42,
            icon: Shield,
            description: 'Below Visa/MC threshold'
        },
        {
            label: 'Decline Rate',
            value: '3.2%',
            target: '< 5%',
            status: 'good',
            progress: 64,
            icon: CreditCard,
            description: 'Industry average: 4.5%'
        },
        {
            label: 'Fraud Rate',
            value: '0.08%',
            target: '< 0.1%',
            status: 'warning',
            progress: 80,
            icon: AlertTriangle,
            description: 'Approaching threshold'
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
        <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Target className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">Key Business Metrics</h3>
                    <p className="text-xs text-slate-500">Performance vs. thresholds</p>
                </div>
            </div>

            <div className="space-y-4 mb-4">
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                        <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className={cn(
                                        "h-4 w-4",
                                        metric.status === 'good' ? "text-emerald-500" : 
                                        metric.status === 'warning' ? "text-amber-500" : "text-red-500"
                                    )} />
                                    <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900">{metric.value}</span>
                                    <Badge 
                                        variant="outline" 
                                        className={cn(
                                            "text-[10px]",
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
                                    "h-1.5",
                                    metric.status === 'good' ? "[&>div]:bg-emerald-500" : 
                                    metric.status === 'warning' ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                                )}
                            />
                            <p className="text-[10px] text-slate-500">{metric.description}</p>
                        </div>
                    );
                })}
            </div>

            <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Network Status</h4>
                <div className="grid grid-cols-2 gap-2">
                    {networkHealth.map((network, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    network.status === 'operational' ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                                <span className="text-sm text-slate-700">{network.network}</span>
                            </div>
                            <span className="text-xs text-slate-500">{network.latency}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}