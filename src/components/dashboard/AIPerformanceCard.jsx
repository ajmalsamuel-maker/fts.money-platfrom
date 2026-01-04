import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';

export default function AIPerformanceCard() {
    const { t } = useI18n();
    const { data: decisions = [] } = useQuery({
        queryKey: ['ai-decisions-stats'],
        queryFn: () => base44.entities.AIPaymentDecision.list('-created_date', 100),
    });

    const todayDecisions = decisions.filter(d => {
        const decisionDate = new Date(d.created_date);
        const today = new Date();
        return decisionDate.toDateString() === today.toDateString();
    });

    const successful = decisions.filter(d => d.outcome === 'successful').length;
    const accuracy = decisions.length > 0 ? (successful / decisions.length * 100).toFixed(1) : 0;

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500">{t('aiDecisionsToday')}</p>
                    <p className="text-2xl font-bold text-slate-900">{todayDecisions.length}</p>
                    <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        {accuracy}% accuracy
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-indigo-600" />
                </div>
            </div>
        </Card>
    );
}