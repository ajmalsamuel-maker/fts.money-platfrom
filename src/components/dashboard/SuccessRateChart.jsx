import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
    { name: 'Approved', value: 9870, color: '#10b981' },
    { name: 'Declined', value: 89, color: '#ef4444' },
    { name: 'Pending', value: 41, color: '#f59e0b' },
];

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

export default function SuccessRateChart() {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const approvalRate = ((data[0].value / total) * 100).toFixed(2);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Transaction Status</CardTitle>
                <p className="text-sm text-slate-500">
                    Approval Rate: <span className="font-semibold text-emerald-600">{approvalRate}%</span>
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={90}
                                innerRadius={50}
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
                                formatter={(value, entry) => (
                                    <span className="text-sm text-slate-600">
                                        {value} ({entry.payload.value.toLocaleString()})
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}