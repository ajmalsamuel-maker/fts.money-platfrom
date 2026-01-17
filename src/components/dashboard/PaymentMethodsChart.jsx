import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PaymentMethodsChart({ transactions = [] }) {
    const cryptoCount = transactions.filter(t => t.crypto_asset || t.payment_method === 'crypto_currency' || t.payment_method === 'bitcoin' || t.payment_method === 'bitcoin_cash').length;

    const data = [
        { name: 'Visa', value: transactions.filter(t => t.card_brand === 'visa').length, color: '#1a1f71' },
        { name: 'Mastercard', value: transactions.filter(t => t.card_brand === 'mastercard').length, color: '#eb001b' },
        { name: 'Amex', value: transactions.filter(t => t.card_brand === 'amex').length, color: '#006fcf' },
        { name: 'Bank Transfer', value: transactions.filter(t => t.payment_method === 'bank_transfer').length, color: '#10b981' },
        { name: 'Wallet', value: transactions.filter(t => t.payment_method === 'wallet' || t.payment_method === 'e_wallet').length, color: '#8b5cf6' },
        { name: 'Crypto', value: cryptoCount, color: '#f59e0b' },
    ];
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