import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { AlertCircle, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function MerchantDisputeManagement() {
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

    const { data: disputes = [] } = useQuery({
        queryKey: ['disputes', user?.merchant_id],
        queryFn: async () => await base44.entities.Dispute.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const stats = React.useMemo(() => ({
        open: disputes.filter(d => d.status === 'open' || d.status === 'pending_response').length,
        won: disputes.filter(d => d.status === 'merchant_won').length,
        lost: disputes.filter(d => d.status === 'merchant_lost').length,
        total: disputes.length
    }), [disputes]);

    const getStatusConfig = (status) => {
        const configs = {
            open: { label: 'Open', icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
            pending_response: { label: 'Pending Response', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
            merchant_won: { label: 'Won', icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
            merchant_lost: { label: 'Lost', icon: XCircle, className: 'bg-slate-50 text-slate-700 border-slate-200' },
        };
        return configs[status] || configs.open;
    };

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantDisputeManagement" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Dispute Management</h1>
                            <p className="text-slate-500">Manage and respond to transaction disputes</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Open Disputes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.open}</div></CardContent></Card>
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Total Disputes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Won</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.won}</div></CardContent></Card>
                            <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-slate-500">Lost</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-slate-600">{stats.lost}</div></CardContent></Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Disputes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {disputes.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No disputes</p>
                                    ) : (
                                        disputes.map((dispute) => {
                                            const statusConfig = getStatusConfig(dispute.status);
                                            const StatusIcon = statusConfig.icon;
                                            return (
                                                <div key={dispute.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">Dispute #{dispute.dispute_id || dispute.id.slice(-8)}</p>
                                                            <p className="text-sm text-slate-500">
                                                                {dispute.reason_category} • Response due: {dispute.response_due_date ? new Date(dispute.response_due_date).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold">${dispute.amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                            <Badge variant="outline" className={statusConfig.className}>
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Respond
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}