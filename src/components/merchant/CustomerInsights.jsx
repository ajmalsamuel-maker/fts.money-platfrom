import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, ShoppingCart, Repeat } from 'lucide-react';

export default function CustomerInsights({ transactions = [] }) {
    const insights = React.useMemo(() => {
        const countries = {};
        const uniqueEmails = new Set();
        const repeatCustomers = new Set();
        
        transactions.forEach(t => {
            if (t.customer_country) {
                countries[t.customer_country] = (countries[t.customer_country] || 0) + 1;
            }
            if (t.customer_email) {
                if (uniqueEmails.has(t.customer_email)) {
                    repeatCustomers.add(t.customer_email);
                }
                uniqueEmails.add(t.customer_email);
            }
        });

        const topCountries = Object.entries(countries)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const avgOrderValue = transactions.length > 0
            ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length
            : 0;

        const repeatRate = uniqueEmails.size > 0
            ? (repeatCustomers.size / uniqueEmails.size * 100).toFixed(1)
            : 0;

        return {
            totalCustomers: uniqueEmails.size,
            repeatRate,
            avgOrderValue,
            topCountries
        };
    }, [transactions]);

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-500" />
                    Customer Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-cyan-600" />
                            <span className="text-sm font-medium">Total Customers</span>
                        </div>
                        <span className="text-xl font-bold text-cyan-900">{insights.totalCustomers}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Repeat Rate</span>
                        </div>
                        <span className="text-xl font-bold text-green-900">{insights.repeatRate}%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Avg Order Value</span>
                        </div>
                        <span className="text-xl font-bold text-purple-900">${insights.avgOrderValue.toFixed(2)}</span>
                    </div>

                    {insights.topCountries.length > 0 && (
                        <div className="pt-3 border-t">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Top Countries</span>
                            </div>
                            <div className="space-y-2">
                                {insights.topCountries.map(([country, count], idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span>{country}</span>
                                        <span className="font-semibold">{count} txns</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}