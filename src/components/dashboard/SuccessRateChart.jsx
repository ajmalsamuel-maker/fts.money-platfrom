import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-sm font-medium">
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    ) : null;
};

export default function SuccessRateChart({ transactions = [] }) {
    const approved = transactions.filter(t => t.status === 'approved' || t.status === 'accepted' || t.status === 'settled').length;
    const declined = transactions.filter(t => t.status === 'declined' || t.status === 'rejected' || t.status === 'failed').length;
    const pending = transactions.filter(t => t.status === 'pending' || t.status === 'processing').length;

    const data = [
        { name: 'Approved', value: approved, color: '#10b981' },
        { name: 'Declined', value: declined, color: '#ef4444' },
        { name: 'Pending', value: pending, color: '#f59e0b' },
    ];

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const approvalRate = total > 0 ? ((data[0].value / total) * 100).toFixed(2) : '0.00';

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Transaction Status</CardTitle>
                <p className="text-xs text-slate-500">
                    Approval Rate: <span className="font-semibold text-emerald-600">{approvalRate}%</span>
                </p>
            </CardHeader>
            <CardContent>
                {total > 0 ? (
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="45%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={70}
                                    innerRadius={40}
                                    dataKey="value"
                                    strokeWidth={2}
                                    stroke="#fff"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => [value.toLocaleString(), name]}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend 
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value, entry) => (
                                        <span className="text-xs text-slate-600">
                                            {value} ({entry.payload.value.toLocaleString()})
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
                        No transaction data yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}