import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getStaffSession } from '@/components/auth/useStaffAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Repeat, Search, DollarSign, Calendar, TrendingUp, User } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Subscriptions() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userPspCode, setUserPspCode] = useState(null);

    React.useEffect(() => {
        const session = getStaffSession();
        if (!session?.psp_code) {
            window.location.href = '/PSPLogin';
            return;
        }
        setUserPspCode(session.psp_code);
    }, []);

    const { data: subscriptions = [], isLoading } = useQuery({
        queryKey: ['subscriptions', userPspCode],
        queryFn: async () => {
            const response = await base44.entities.Subscription.list();
            return response || [];
        },
        enabled: !!userPspCode
    });

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.plan_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        trialing: 'bg-blue-100 text-blue-800',
        past_due: 'bg-amber-100 text-amber-800',
        canceled: 'bg-red-100 text-red-800',
        paused: 'bg-gray-100 text-gray-800'
    };

    const stats = [
        {
            label: 'Active Subscriptions',
            value: subscriptions.filter(s => s.status === 'active').length,
            icon: Repeat,
            color: 'text-green-600'
        },
        {
            label: 'MRR',
            value: `$${(subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amount || 0), 0) / 1).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-blue-600'
        },
        {
            label: 'Churn Rate',
            value: '2.3%',
            icon: TrendingUp,
            color: 'text-amber-600'
        },
        {
            label: 'Total Customers',
            value: new Set(subscriptions.map(s => s.customer_id)).size,
            icon: User,
            color: 'text-purple-600'
        }
    ];

    if (!userPspCode) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="Subscriptions"
            />
            
            <div className={cn("transition-all duration-300 lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
                        <p className="text-slate-500">Manage recurring revenue and subscriptions</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat) => (
                            <Card key={stat.label}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">{stat.label}</p>
                                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                        </div>
                                        <stat.icon className={cn("h-8 w-8", stat.color)} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Search */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by customer or plan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscriptions List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Subscriptions ({filteredSubscriptions.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading subscriptions...</div>
                            ) : filteredSubscriptions.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No subscriptions found</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Customer</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Plan</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Interval</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Next Billing</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubscriptions.map((subscription) => (
                                                <tr key={subscription.id} className="border-b hover:bg-slate-50">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{subscription.customer_name || 'N/A'}</p>
                                                            <p className="text-sm text-slate-500">{subscription.customer_email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-slate-900">{subscription.plan_name || 'N/A'}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium text-slate-900">
                                                            ${(subscription.amount || 0).toFixed(2)}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-slate-900 capitalize">{subscription.billing_interval || 'monthly'}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={cn(statusColors[subscription.status] || 'bg-gray-100 text-gray-800')}>
                                                            {subscription.status || 'active'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Calendar className="h-4 w-4" />
                                                            <span className="text-sm">
                                                                {subscription.next_billing_date ? 
                                                                    new Date(subscription.next_billing_date).toLocaleDateString() : 
                                                                    'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <Button variant="ghost" size="sm">View</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}