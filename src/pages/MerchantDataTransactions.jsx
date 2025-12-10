import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, CreditCard, Globe, Calendar } from 'lucide-react';

export default function MerchantDataTransactions() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            const merchantData = merchants[0];
            if (merchantData && !merchantData.merchant_code && user.merchant_code) {
                merchantData.merchant_code = user.merchant_code;
            }
            return merchantData;
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions', user?.merchant_id],
        queryFn: async () => await base44.entities.Transaction.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const analytics = React.useMemo(() => {
        const paymentMethods = {};
        const countries = {};
        const hourly = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0, amount: 0 }));

        transactions.forEach(txn => {
            const method = txn.payment_method || 'Unknown';
            paymentMethods[method] = (paymentMethods[method] || 0) + 1;

            const country = txn.customer_country || 'Unknown';
            countries[country] = (countries[country] || 0) + 1;

            const hour = new Date(txn.created_date).getHours();
            hourly[hour].count += 1;
            hourly[hour].amount += txn.amount || 0;
        });

        return {
            paymentMethods: Object.entries(paymentMethods).map(([name, value]) => ({ name, value })),
            countries: Object.entries(countries).map(([name, value]) => ({ name, value })).slice(0, 10),
            hourly
        };
    }, [transactions]);

    const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantDataTransactions" user={user} merchant={merchant} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Transaction Analytics</h1>
                            <p className="text-slate-500">Deep dive into your transaction data</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Methods
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={analytics.paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {analytics.paymentMethods.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Globe className="h-5 w-5" />
                                        Top Countries
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={analytics.countries}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Calendar className="h-5 w-5" />
                                        Transaction Activity by Hour
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={analytics.hourly}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Transactions" />
                                            <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10b981" name="Volume ($)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}