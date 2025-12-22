import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Mail, DollarSign, TrendingUp, Shield } from 'lucide-react';

export default function MerchantCustomers() {
    const { user } = useMerchantAuth();
    const [searchQuery, setSearchQuery] = useState('');
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

    const { data: customers = [] } = useQuery({
        queryKey: ['customers', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.Customer.filter({ merchant_id: user.merchant_id }, '-created_date');
        },
        enabled: !!user?.merchant_id
    });

    const filteredCustomers = customers.filter(c => 
        !searchQuery || 
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalCustomers = customers.length;
    const totalLTV = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;
    const highRiskCount = customers.filter(c => c.risk_level === 'high').length;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantCustomers"
                user={user}
            />
            
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">My Customers</h1>
                                <p className="text-slate-500">View and manage your customer base</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Total Customers</p>
                                        <p className="text-xl font-bold">{totalCustomers}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-emerald-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Total LTV</p>
                                        <p className="text-xl font-bold">${totalLTV.toFixed(0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Avg LTV</p>
                                        <p className="text-xl font-bold">${avgLTV.toFixed(0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-8 w-8 text-red-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">High Risk</p>
                                        <p className="text-xl font-bold">{highRiskCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search customers..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="pl-10" 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Transactions</TableHead>
                                        <TableHead>Total Spent</TableHead>
                                        <TableHead>Risk</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCustomers.map(customer => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">{customer.full_name || '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-slate-400" />
                                                    {customer.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>{customer.total_transactions || 0}</TableCell>
                                            <TableCell className="font-mono">${(customer.total_spent || 0).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    customer.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                                                    customer.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }>
                                                    {customer.risk_level || 'low'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                    {customer.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}