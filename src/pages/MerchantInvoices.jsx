import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Download } from 'lucide-react';

export default function MerchantInvoices() {
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

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.Invoice.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantInvoices"
                user={user}
            />
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Invoices</h1>
                            <p className="text-slate-500">Manage your invoices</p>
                        </div>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Invoice
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                No invoices yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                                                <TableCell>{inv.invoice_date}</TableCell>
                                                <TableCell>${inv.total_amount}</TableCell>
                                                <TableCell>
                                                    <Badge className={inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                        {inv.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
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