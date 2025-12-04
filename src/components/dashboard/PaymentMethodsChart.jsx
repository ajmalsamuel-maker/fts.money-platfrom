import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { name: 'Visa', value: 4520, color: '#1a1f71' },
    { name: 'Mastercard', value: 3280, color: '#eb001b' },
    { name: 'Amex', value: 890, color: '#006fcf' },
    { name: 'Bank Transfer', value: 1240, color: '#10b981' },
    { name: 'Wallet', value: 670, color: '#8b5cf6' },
    { name: 'Crypto', value: 400, color: '#f59e0b' },
];

export default function PaymentMethodsChart() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
                <p className="text-sm text-slate-500">Transaction distribution by method</p>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                            <XAxis 
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis 
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                width={100}
                            />
                            <Tooltip 
                                formatter={(value) => [value.toLocaleString(), 'Transactions']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <Bar 
                                dataKey="value" 
                                radius={[0, 4, 4, 0]}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}