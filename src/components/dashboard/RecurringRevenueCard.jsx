import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { TrendingUp, Repeat } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';

export default function RecurringRevenueCard() {
    const { t } = useI18n();
    const { data: subscriptions = [] } = useQuery({
        queryKey: ['recurring-payments-stats'],
        queryFn: () => base44.entities.RecurringPayment.filter({ status: 'active' }),
    });

    const mrr = subscriptions.reduce((sum, sub) => {
        const monthlyAmount = sub.frequency === 'monthly' ? sub.amount :
                             sub.frequency === 'yearly' ? sub.amount / 12 :
                             sub.frequency === 'quarterly' ? sub.amount / 3 :
                             sub.amount;
        return sum + monthlyAmount;
    }, 0);

    const arr = mrr * 12;

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500">{t('monthlyRecurringRevenue')}</p>
                    <p className="text-2xl font-bold text-slate-900">${(mrr / 1000).toFixed(1)}K</p>
                    <div className="flex items-center gap-1 mt-1 text-purple-600 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        ARR: ${(arr / 1000).toFixed(1)}K
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Repeat className="h-6 w-6 text-purple-600" />
                </div>
            </div>
        </Card>
    );
}