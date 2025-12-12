import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MerchantRefunds() {
    const [selectedMID, setSelectedMID] = useState('');
    const [user, setUser] = useState(null);

    React.useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (err) {}
        };
        loadUser();
    }, []);

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

    const { data: refunds = [] } = useQuery({
        queryKey: ['refunds', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.Refund.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantRefunds"
                user={user}
            />
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Refunds</h1>
                        <p className="text-slate-500">Track refund requests and status</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Refunds</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Refund ID</TableHead>
                                        <TableHead>Transaction</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {refunds.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                No refunds
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        refunds.map((refund) => (
                                            <TableRow key={refund.id}>
                                                <TableCell className="font-mono text-sm">{refund.refund_id}</TableCell>
                                                <TableCell className="font-mono text-sm">{refund.transaction_id}</TableCell>
                                                <TableCell>${refund.amount} {refund.currency}</TableCell>
                                                <TableCell className="capitalize">{refund.reason?.replace(/_/g, ' ')}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        refund.status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' :
                                                        refund.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }>
                                                        {refund.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}