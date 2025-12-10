import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign } from 'lucide-react';

export default function SettlementCalendar() {
    const upcomingSettlements = [
        { date: '2025-12-11', amount: 12450.00, status: 'pending' },
        { date: '2025-12-12', amount: 18920.50, status: 'scheduled' },
        { date: '2025-12-13', amount: 15330.75, status: 'scheduled' },
    ];

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Settlement Calendar
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    {upcomingSettlements.map((settlement, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-purple-100 flex flex-col items-center justify-center">
                                    <span className="text-xs text-purple-600 font-semibold">
                                        {new Date(settlement.date).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-lg font-bold text-purple-900">
                                        {new Date(settlement.date).getDate()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold flex items-center gap-2">
                                        <DollarSign className="h-3 w-3" />
                                        ${settlement.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(settlement.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className={
                                settlement.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                            }>
                                {settlement.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}