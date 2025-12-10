import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Landmark, CreditCard, DollarSign, Calendar, Shield, Lock } from 'lucide-react';

export default function MerchantBankInfo() {
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
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    const { data: settlements = [] } = useQuery({
        queryKey: ['settlements', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.Settlement.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // Mock bank data - in real app this would come from API
    const bankInfo = {
        accountName: merchant?.business_name || 'N/A',
        accountNumber: '****7890',
        routingNumber: '****6789',
        bankName: 'Chase Bank',
        swiftCode: 'CHASUS33',
        accountType: 'Business Checking',
        currency: merchant?.currency || 'USD'
    };

    const totalSettled = settlements.reduce((sum, s) => sum + (s.net_amount || 0), 0);
    const pendingSettlement = settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + (s.net_amount || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantBankInfo"
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Bank Information</h1>
                            <p className="text-slate-500">Your bank account details for settlements and payouts</p>
                        </div>

                        {/* Settlement Summary */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-500">Total Settled</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        ${totalSettled.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{settlements.length} settlements</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-500">Pending Settlement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-600">
                                        ${pendingSettlement.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Processing</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-500">Settlement Period</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-900">
                                        {merchant?.settlement_period || 'T+1'}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Business days</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bank Account Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Landmark className="h-5 w-5" />
                                    Bank Account Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Account Name</label>
                                            <p className="text-base font-semibold">{bankInfo.accountName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Account Number</label>
                                            <p className="text-base font-mono flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-slate-400" />
                                                {bankInfo.accountNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Routing Number</label>
                                            <p className="text-base font-mono flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-slate-400" />
                                                {bankInfo.routingNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Bank Name</label>
                                            <p className="text-base font-semibold">{bankInfo.bankName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Account Type</label>
                                            <p className="text-base">{bankInfo.accountType}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Currency</label>
                                            <p className="text-base font-mono">{bankInfo.currency}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Settlements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Recent Settlements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {settlements.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No settlements yet</p>
                                    ) : (
                                        settlements.slice(0, 10).map((settlement) => (
                                            <div key={settlement.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">Settlement #{settlement.settlement_id || settlement.id.slice(-8)}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {new Date(settlement.created_date).toLocaleDateString()} • {settlement.transaction_count} transactions
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-lg">
                                                        ${settlement.net_amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                    </p>
                                                    <Badge variant={settlement.status === 'completed' ? 'default' : 'outline'}>
                                                        {settlement.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Notice */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900">Security Notice</h3>
                                        <p className="text-sm text-blue-800 mt-1">
                                            Your bank account information is encrypted and securely stored. Full account details are only visible to authorized administrators.
                                            To update your bank information, please contact support.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}