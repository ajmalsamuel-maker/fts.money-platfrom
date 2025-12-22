import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

export default function MerchantCustomerAnalytics() {
    const { user } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = useState('');

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.Transaction.filter({ merchant_id: user.merchant_id }, '-created_date');
        },
        enabled: !!user?.merchant_id
    });

    // Calculate analytics
    const customerData = transactions.reduce((acc, txn) => {
        const email = txn.customer_email || 'Unknown';
        if (!acc[email]) {
            acc[email] = {
                email,
                name: txn.customer_name || 'N/A',
                transactions: 0,
                totalSpent: 0,
                country: txn.customer_country || 'N/A'
            };
        }
        acc[email].transactions += 1;
        acc[email].totalSpent += txn.amount || 0;
        return acc;
    }, {});

    const customers = Object.values(customerData).sort((a, b) => b.totalSpent - a.totalSpent);
    const totalCustomers = customers.length;
    const avgTransactionValue = transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length : 0;
    const repeatCustomers = customers.filter(c => c.transactions > 1).length;
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers * 100).toFixed(1) : 0;

    const topCustomers = customers.slice(0, 10);

    const segmentData = [
        { name: 'One-time', value: customers.filter(c => c.transactions === 1).length },
        { name: '2-5 txns', value: customers.filter(c => c.transactions >= 2 && c.transactions <= 5).length },
        { name: '6+ txns', value: customers.filter(c => c.transactions >= 6).length }
    ];

    const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantCustomerAnalytics"
                user={user}
            />
            
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Customer Analytics</h1>
                        <p className="text-slate-500">Insights into your customer behavior and spending patterns</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Customers</p>
                                        <p className="text-2xl font-bold text-slate-900">{totalCustomers}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Avg Transaction</p>
                                        <p className="text-2xl font-bold text-slate-900">${avgTransactionValue.toFixed(2)}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Repeat Customers</p>
                                        <p className="text-2xl font-bold text-slate-900">{repeatCustomers}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Repeat Rate</p>
                                        <p className="text-2xl font-bold text-slate-900">{repeatRate}%</p>
                                    </div>
                                    <ShoppingCart className="h-8 w-8 text-amber-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top 10 Customers by Spend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topCustomers}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="totalSpent" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Segments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={segmentData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {segmentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Customers ({customers.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Customer</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Country</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Transactions</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total Spent</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Avg Transaction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((customer, idx) => (
                                            <tr key={idx} className="border-b hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{customer.name}</p>
                                                        <p className="text-sm text-slate-500">{customer.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-900">{customer.country}</td>
                                                <td className="py-3 px-4 text-right text-slate-900">{customer.transactions}</td>
                                                <td className="py-3 px-4 text-right font-medium text-slate-900">
                                                    ${customer.totalSpent.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-slate-600">
                                                    ${(customer.totalSpent / customer.transactions).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}