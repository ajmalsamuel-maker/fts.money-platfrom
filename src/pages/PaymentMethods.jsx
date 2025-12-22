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
import { CreditCard, Search, Wallet } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getPaymentMethodLogo, getPaymentMethodDisplayName } from '@/components/utils/paymentLogos';

export default function PaymentMethods() {
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

    const { data: paymentMethods = [], isLoading } = useQuery({
        queryKey: ['payment_methods', userPspCode],
        queryFn: async () => {
            const response = await base44.entities.SavedCard.list();
            return response || [];
        },
        enabled: !!userPspCode
    });

    const filteredMethods = paymentMethods.filter(pm =>
        pm.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pm.card_last_four?.includes(searchQuery)
    );



    if (!userPspCode) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="PaymentMethods"
            />
            
            <div className={cn("transition-all duration-300 lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
                        <p className="text-slate-500">Manage saved cards and payment methods</p>
                    </div>

                    {/* Search */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by customer name or card number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Payment Methods ({filteredMethods.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading payment methods...</div>
                            ) : filteredMethods.length === 0 ? (
                                <div className="text-center py-8">
                                    <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No payment methods found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Customer</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Card</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Expiry</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Added</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMethods.map((method) => (
                                                <tr key={method.id} className="border-b hover:bg-slate-50">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{method.customer_name || 'N/A'}</p>
                                                            <p className="text-sm text-slate-500">{method.customer_email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-8 rounded flex items-center justify-center bg-white border border-slate-200 p-1">
                                                                {getPaymentMethodLogo(method.card_brand) ? (
                                                                    <img 
                                                                        src={getPaymentMethodLogo(method.card_brand)} 
                                                                        alt={method.card_brand} 
                                                                        className="max-w-full max-h-full object-contain" 
                                                                    />
                                                                ) : (
                                                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">
                                                                    {getPaymentMethodDisplayName(method.card_brand)}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    •••• {method.card_last_four}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-slate-900">
                                                            {method.expiry_month}/{method.expiry_year}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={cn(
                                                            method.is_default ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                        )}>
                                                            {method.is_default ? 'Default' : 'Saved'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-sm text-slate-600">
                                                            {method.created_date ? 
                                                                new Date(method.created_date).toLocaleDateString() : 
                                                                'N/A'}
                                                        </p>
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