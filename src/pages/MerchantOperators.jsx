import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Users, Mail, Phone, Shield } from 'lucide-react';

export default function MerchantOperators() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    const { data: operators = [] } = useQuery({
        queryKey: ['merchantUsers', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantUser.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800 border-purple-200',
            manager: 'bg-blue-100 text-blue-800 border-blue-200',
            operator: 'bg-green-100 text-green-800 border-green-200',
            viewer: 'bg-slate-100 text-slate-800 border-slate-200'
        };
        return colors[role] || colors.viewer;
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            inactive: 'bg-slate-100 text-slate-800 border-slate-200',
            pending: 'bg-amber-100 text-amber-800 border-amber-200'
        };
        return colors[status] || colors.pending;
    };

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantOperators" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Merchant Operators</h1>
                                <p className="text-slate-500">Manage user access and permissions</p>
                            </div>
                            <Button>Add Operator</Button>
                        </div>

                        <div className="grid gap-4">
                            {operators.length === 0 ? (
                                <Card><CardContent className="py-12 text-center text-slate-500">No operators found</CardContent></Card>
                            ) : (
                                operators.map((op) => (
                                    <Card key={op.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
                                                        {op.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{op.full_name}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                                                <Mail className="h-3 w-3" />
                                                                {op.email}
                                                            </span>
                                                            {op.phone && (
                                                                <span className="flex items-center gap-1 text-sm text-slate-500">
                                                                    <Phone className="h-3 w-3" />
                                                                    {op.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <Badge variant="outline" className={getRoleColor(op.role)}>
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            {op.role}
                                                        </Badge>
                                                        <div className="mt-2">
                                                            <Badge variant="outline" className={getStatusColor(op.status)}>
                                                                {op.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">Manage</Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}