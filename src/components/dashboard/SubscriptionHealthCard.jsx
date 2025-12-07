import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Users, TrendingDown } from 'lucide-react';

export default function SubscriptionHealthCard() {
    const { data: subscriptions = [] } = useQuery({
        queryKey: ['subscriptions-health'],
        queryFn: () => base44.entities.RecurringPayment.list(),
    });

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const cancelledThisMonth = subscriptions.filter(s => {
        if (s.status !== 'cancelled') return false;
        const cancelDate = new Date(s.updated_date);
        const now = new Date();
        return cancelDate.getMonth() === now.getMonth() && cancelDate.getFullYear() === now.getFullYear();
    }).length;

    const churnRate = subscriptions.length > 0 ? ((cancelledThisMonth / subscriptions.length) * 100).toFixed(1) : 0;

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-slate-900">{activeSubscriptions}</p>
                    <div className="flex items-center gap-1 mt-1 text-slate-600 text-sm">
                        <TrendingDown className="h-4 w-4" />
                        {churnRate}% churn rate
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-cyan-600" />
                </div>
            </div>
        </Card>
    );
}