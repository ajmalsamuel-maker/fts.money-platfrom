import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { DollarSign, Calendar, Plus, Send, Users, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AssetIssuerDividends() {
    const [session, setSession] = useState(null);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [dividendForm, setDividendForm] = useState({
        payment_type: 'dividend',
        total_amount: '',
        payment_date: '',
        record_date: '',
        currency: 'USD'
    });

    React.useEffect(() => {
        const savedSession = localStorage.getItem('asset_issuer_session');
        if (savedSession) setSession(JSON.parse(savedSession));
    }, []);

    const queryClient = useQueryClient();

    const { data: assets = [] } = useQuery({
        queryKey: ['issuer-assets', session?.issuer_code],
        queryFn: async () => {
            const allAssets = await base44.entities.RWAAsset.list();
            return allAssets.filter(a => a.issuer_email === session.email);
        },
        enabled: !!session
    });

    const { data: dividends = [] } = useQuery({
        queryKey: ['issuer-dividends', session?.issuer_code],
        queryFn: async () => {
            const assetIds = assets.map(a => a.asset_id);
            if (assetIds.length === 0) return [];
            const allDividends = await base44.entities.RWADividend.list('-announcement_date', 200);
            return allDividends.filter(d => assetIds.includes(d.asset_id));
        },
        enabled: !!session && assets.length > 0
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['asset-holdings'],
        queryFn: () => base44.entities.RWAHolding.list(),
        enabled: !!session
    });

    const createDividendMutation = useMutation({
        mutationFn: async (data) => {
            const asset = assets.find(a => a.asset_id === data.asset_id);
            const perTokenAmount = data.total_amount / asset.total_supply;
            
            return await base44.entities.RWADividend.create({
                ...data,
                per_token_amount: perTokenAmount,
                announcement_date: new Date().toISOString(),
                status: 'announced',
                snapshot_taken: false,
                total_recipients: 0,
                paid_recipients: 0
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['issuer-dividends']);
            setShowScheduleDialog(false);
            setDividendForm({
                payment_type: 'dividend',
                total_amount: '',
                payment_date: '',
                record_date: '',
                currency: 'USD'
            });
        }
    });

    const processDividendMutation = useMutation({
        mutationFn: async (dividendId) => {
            const response = await base44.functions.invoke('processDividendPayment', {
                dividend_id: dividendId
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['issuer-dividends']);
        }
    });

    const handleScheduleDividend = () => {
        if (!selectedAsset) return;
        
        createDividendMutation.mutate({
            asset_id: selectedAsset.asset_id,
            ...dividendForm,
            total_amount: parseFloat(dividendForm.total_amount)
        });
    };

    const totalScheduled = dividends.filter(d => d.status === 'announced').length;
    const totalProcessing = dividends.filter(d => d.status === 'processing').length;
    const totalPaid = dividends.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.total_amount, 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerDividends"
                issuerName={session?.company_name}
                issuerEmail={session?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Dividend Management</h1>
                            <p className="text-slate-600">Schedule and manage dividend payments to investors</p>
                        </div>
                        <Button 
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => setShowScheduleDialog(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Schedule Dividend
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Scheduled
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-blue-600">{totalScheduled}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    Processing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-yellow-600">{totalProcessing}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Total Paid
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dividend Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dividends.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No dividends scheduled yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {dividends.map(dividend => {
                                        const asset = assets.find(a => a.asset_id === dividend.asset_id);
                                        const assetHoldings = holdings.filter(h => h.asset_id === dividend.asset_id);
                                        const recipientCount = assetHoldings.length;

                                        return (
                                            <div key={dividend.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold">{asset?.name}</h3>
                                                            <Badge variant="outline">{dividend.payment_type}</Badge>
                                                            <Badge className={
                                                                dividend.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                dividend.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }>
                                                                {dividend.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                                                            <div>
                                                                <p className="text-xs text-slate-500">Total Amount</p>
                                                                <p className="font-medium">${dividend.total_amount.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500">Per Token</p>
                                                                <p className="font-medium">${dividend.per_token_amount?.toFixed(4)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500">Record Date</p>
                                                                <p className="font-medium">{new Date(dividend.record_date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500">Payment Date</p>
                                                                <p className="font-medium">{new Date(dividend.payment_date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Users className="h-4 w-4 text-slate-400" />
                                                                <span>{recipientCount} investors</span>
                                                            </div>
                                                            {dividend.status === 'completed' && (
                                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    <span>{dividend.paid_recipients} paid</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {dividend.status === 'announced' && new Date(dividend.payment_date) <= new Date() && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => processDividendMutation.mutate(dividend.id)}
                                                                disabled={processDividendMutation.isPending}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Send className="h-3 w-3 mr-1" />
                                                                Process Payment
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Dividend Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription className="text-sm">
                                Dividends will be automatically distributed to all token holders on the record date.
                            </AlertDescription>
                        </Alert>

                        <div>
                            <Label>Select Asset *</Label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg mt-1"
                                value={selectedAsset?.asset_id || ''}
                                onChange={(e) => {
                                    const asset = assets.find(a => a.asset_id === e.target.value);
                                    setSelectedAsset(asset);
                                }}
                            >
                                <option value="">Choose an asset...</option>
                                {assets.map(asset => (
                                    <option key={asset.asset_id} value={asset.asset_id}>
                                        {asset.name} ({asset.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAsset && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                                    <p className="text-blue-900">
                                        <strong>Total Supply:</strong> {selectedAsset.total_supply?.toLocaleString()} tokens
                                    </p>
                                    <p className="text-blue-900 mt-1">
                                        <strong>Current Holders:</strong> {holdings.filter(h => h.asset_id === selectedAsset.asset_id).length}
                                    </p>
                                </div>

                                <div>
                                    <Label>Payment Type *</Label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg mt-1"
                                        value={dividendForm.payment_type}
                                        onChange={(e) => setDividendForm({...dividendForm, payment_type: e.target.value})}
                                    >
                                        <option value="dividend">Dividend</option>
                                        <option value="coupon">Coupon</option>
                                        <option value="interest">Interest</option>
                                        <option value="rent">Rent</option>
                                    </select>
                                </div>

                                <div>
                                    <Label>Total Amount ({dividendForm.currency}) *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="10000.00"
                                        value={dividendForm.total_amount}
                                        onChange={(e) => setDividendForm({...dividendForm, total_amount: e.target.value})}
                                    />
                                    {dividendForm.total_amount && selectedAsset.total_supply && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            ≈ ${(parseFloat(dividendForm.total_amount) / selectedAsset.total_supply).toFixed(4)} per token
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Record Date *</Label>
                                        <Input
                                            type="date"
                                            value={dividendForm.record_date}
                                            onChange={(e) => setDividendForm({...dividendForm, record_date: e.target.value})}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Holders as of this date receive payment</p>
                                    </div>

                                    <div>
                                        <Label>Payment Date *</Label>
                                        <Input
                                            type="date"
                                            value={dividendForm.payment_date}
                                            onChange={(e) => setDividendForm({...dividendForm, payment_date: e.target.value})}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">When payment will be sent</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleScheduleDividend}
                                    disabled={!dividendForm.total_amount || !dividendForm.record_date || !dividendForm.payment_date || createDividendMutation.isPending}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {createDividendMutation.isPending ? 'Scheduling...' : 'Schedule Dividend'}
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}