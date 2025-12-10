import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function PaymentMethodsBreakdown({ transactions = [] }) {
    const methodData = React.useMemo(() => {
        const counts = {};
        transactions.forEach(t => {
            const method = t.card_brand || t.payment_method || 'Other';
            counts[method] = (counts[method] || 0) + 1;
        });

        const colors = {
            'visa': '#1A1F71',
            'mastercard': '#EB001B',
            'amex': '#006FCF',
            'discover': '#FF6000',
            'Other': '#94a3b8'
        };

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: colors[name] || colors.Other
        }));
    }, [transactions]);

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-base">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {methodData.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={methodData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {methodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {methodData.map((method, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }}></div>
                                    <span className="font-medium">{method.name}</span>
                                    <span className="text-slate-500">({method.value})</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-center text-slate-500 py-8">No payment data available</p>
                )}
            </CardContent>
        </Card>
    );
}