import React from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Building, Mail, Phone, Globe, MapPin, Calendar, CreditCard, Shield, FileText, AlertCircle } from 'lucide-react';

export default function MerchantInfo() {
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

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            suspended: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || colors.pending;
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantInfo"
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Merchant Information</h1>
                            <p className="text-slate-500">View your business details and account information</p>
                        </div>

                        {/* Business Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Business Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Merchant Code</label>
                                        <p className="text-xl font-mono font-bold text-blue-600">{merchant?.merchant_code || 'N/A'}</p>
                                        <p className="text-xs text-slate-500 mt-1">Use this code to log in to the merchant portal</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Legal Business Name</label>
                                        <p className="text-base font-semibold">{merchant?.business_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Trading Name (DBA)</label>
                                        <p className="text-base">{merchant?.trading_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Merchant ID</label>
                                        <p className="text-base font-mono">{merchant?.merchant_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Status</label>
                                        <div className="mt-1">
                                            <Badge className={getStatusColor(merchant?.status)}>
                                                {merchant?.status || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Business Category</label>
                                        <p className="text-base">{merchant?.category || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">MCC Code</label>
                                        <p className="text-base font-mono">{merchant?.mcc_code || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Registration Date</label>
                                        <p className="text-base">
                                            {merchant?.created_date ? new Date(merchant.created_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Risk Level</label>
                                        <Badge variant="outline">{merchant?.risk_level || 'N/A'}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-4 w-4 mt-1 text-slate-400" />
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Email Address</label>
                                            <p className="text-base">{merchant?.contact_email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 mt-1 text-slate-400" />
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Phone Number</label>
                                            <p className="text-base">{merchant?.contact_phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Globe className="h-4 w-4 mt-1 text-slate-400" />
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Website</label>
                                            <p className="text-base">{merchant?.website || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 mt-1 text-slate-400" />
                                        <div>
                                            <label className="text-sm font-medium text-slate-500">Business Address</label>
                                            <p className="text-base">{merchant?.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Processing Limits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Processing Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Monthly Processing Volume</label>
                                    <p className="text-2xl font-bold">${(merchant?.processing_volume || 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Fee Rate</label>
                                    <p className="text-2xl font-bold">{(merchant?.fee_rate || 0).toFixed(2)}%</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Settlement Period</label>
                                    <p className="text-2xl font-bold">{merchant?.settlement_period || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compliance Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Compliance & Verification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">KYB Status</span>
                                        <Badge className={getStatusColor(merchant?.kyb_status)}>
                                            {merchant?.kyb_status || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">AML Status</span>
                                        <Badge className={getStatusColor(merchant?.aml_status)}>
                                            {merchant?.aml_status || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">LEI Status</span>
                                        <Badge className={getStatusColor(merchant?.lei_status)}>
                                            {merchant?.lei_status || 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">LEI Number</label>
                                        <p className="text-base font-mono">{merchant?.lei || 'Not verified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500">Last AML Check</label>
                                        <p className="text-base">
                                            {merchant?.aml_last_check ? new Date(merchant.aml_last_check).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        {merchant?.documents && merchant.documents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {merchant.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{doc.type}</p>
                                                    <p className="text-sm text-slate-500">{doc.file_name}</p>
                                                </div>
                                                <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}