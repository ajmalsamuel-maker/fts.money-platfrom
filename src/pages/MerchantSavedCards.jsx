import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard } from 'lucide-react';

export default function MerchantSavedCards() {
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

    const { data: savedCards = [] } = useQuery({
        queryKey: ['saved-cards', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.SavedCard.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantSavedCards"
                user={user}
            />
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Saved Cards</h1>
                        <p className="text-slate-500">Customer payment methods</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Card</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {savedCards.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                No saved cards
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        savedCards.map((card) => (
                                            <TableRow key={card.id}>
                                                <TableCell>{card.customer_email}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4" />
                                                        <span className="font-mono">•••• {card.last_four}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">{card.card_brand}</TableCell>
                                                <TableCell>{card.expiry_month}/{card.expiry_year}</TableCell>
                                                <TableCell>
                                                    <Badge className={card.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                        {card.status}
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