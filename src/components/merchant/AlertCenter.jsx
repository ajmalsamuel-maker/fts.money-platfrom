import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, DollarSign, Shield, Clock, Bell } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AlertCenter({ transactions = [] }) {
    const alerts = React.useMemo(() => {
        const result = [];
        
        // Check for large transactions
        const largeTxns = transactions.filter(t => t.amount > 1000);
        if (largeTxns.length > 0) {
            result.push({
                type: 'large_transaction',
                severity: 'medium',
                icon: DollarSign,
                title: `${largeTxns.length} Large Transaction(s)`,
                message: 'Transactions over $1,000 detected',
                time: '5m ago'
            });
        }

        // Check for failed 3DS
        const failed3DS = transactions.filter(t => !t.is_3ds && t.amount > 100);
        if (failed3DS.length > 0) {
            result.push({
                type: 'failed_3ds',
                severity: 'low',
                icon: Shield,
                title: `${failed3DS.length} Failed 3DS`,
                message: 'Transactions without 3DS verification',
                time: '15m ago'
            });
        }

        // All systems normal
        if (result.length === 0) {
            result.push({
                type: 'normal',
                severity: 'success',
                icon: Bell,
                title: 'All Systems Normal',
                message: 'No alerts at this time',
                time: 'Now'
            });
        }

        return result;
    }, [transactions]);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'success': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Alert Center
                    </CardTitle>
                    <Badge variant="outline">{alerts.length}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[280px]">
                    <div className="p-4 space-y-3">
                        {alerts.map((alert, idx) => {
                            const Icon = alert.icon;
                            return (
                                <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                                    <div className="flex items-start gap-3">
                                        <Icon className="h-4 w-4 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold">{alert.title}</p>
                                            <p className="text-xs mt-1">{alert.message}</p>
                                            <p className="text-xs opacity-70 mt-1">{alert.time}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}