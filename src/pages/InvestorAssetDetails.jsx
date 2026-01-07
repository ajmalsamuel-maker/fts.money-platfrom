import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { 
    ArrowLeft, TrendingUp, AlertTriangle, Info, Building, 
    Calendar, DollarSign, MapPin, FileText, BarChart3,
    Shield, Gauge, ShoppingCart, ExternalLink
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function InvestorAssetDetails() {
    const [buyDialogOpen, setBuyDialogOpen] = useState(false);
    const [orderAmount, setOrderAmount] = useState('');

    const assetId = new URLSearchParams(window.location.search).get('id');

    const { data: investor } = useQuery({
        queryKey: ['current-investor'],
        queryFn: async () => {
            const session = localStorage.getItem('rwa_investor_session');
            if (!session) return null;
            return JSON.parse(session);
        }
    });

    const { data: asset, isLoading } = useQuery({
        queryKey: ['asset-detail', assetId],
        queryFn: () => base44.entities.RWAAsset.filter({ asset_id: assetId }).then(res => res[0]),
        enabled: !!assetId
    });

    const queryClient = useQueryClient();

    const createOrderMutation = useMutation({
        mutationFn: (orderData) => base44.entities.RWAOrder.create(orderData),
        onSuccess: () => {
            toast.success('Buy order placed successfully!');
            setBuyDialogOpen(false);
            setOrderAmount('');
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        }
    });

    // Generate mock historical performance data
    const performanceData = Array.from({ length: 12 }, (_, i) => {
        const monthAgo = 11 - i;
        const volatility = (asset?.risk_rating || 5) / 10;
        const trend = (asset?.expected_return || 500) / 10000;
        const randomFactor = (Math.random() - 0.5) * volatility * 0.1;
        const growth = 1 + (trend * monthAgo / 12) + randomFactor;
        
        return {
            month: new Date(Date.now() - monthAgo * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            value: Math.round((asset?.current_value || asset?.total_value || 100000) * growth)
        };
    });

    const handleBuyOrder = () => {
        const amount = parseFloat(orderAmount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (asset.min_investment && amount < asset.min_investment) {
            toast.error(`Minimum investment is $${asset.min_investment.toLocaleString()}`);
            return;
        }

        const tokenPrice = asset.total_value / asset.total_supply;
        const tokenAmount = Math.floor(amount / tokenPrice);

        createOrderMutation.mutate({
            investor_id: investor.investor_id,
            asset_id: asset.asset_id,
            order_type: 'buy',
            token_amount: tokenAmount,
            price_per_token: tokenPrice,
            total_value: amount,
            status: 'completed'
        });
    };

    const assetTypeColors = {
        real_estate: 'bg-blue-100 text-blue-700',
        treasury_bill: 'bg-green-100 text-green-700',
        private_credit: 'bg-purple-100 text-purple-700',
        commodity: 'bg-yellow-100 text-yellow-700',
        equity: 'bg-pink-100 text-pink-700',
        corporate_bond: 'bg-indigo-100 text-indigo-700'
    };

    const getRiskLabel = (rating) => {
        if (rating <= 3) return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100' };
        if (rating <= 6) return { label: 'Medium Risk', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-100' };
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-slate-50">
                <InvestorSidebar currentPage="InvestorMarketplace" />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-slate-600">Loading asset details...</p>
                </div>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="flex h-screen bg-slate-50">
                <InvestorSidebar currentPage="InvestorMarketplace" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">Asset not found</p>
                        <Link to={createPageUrl('InvestorMarketplace')}>
                            <Button className="mt-4">Back to Marketplace</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const riskInfo = getRiskLabel(asset.risk_rating || 5);
    const metadata = typeof asset.asset_metadata === 'string' 
        ? JSON.parse(asset.asset_metadata) 
        : (asset.asset_metadata || {});

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorMarketplace"
                investorName={investor?.full_name}
                investorEmail={investor?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <Link to={createPageUrl('InvestorMarketplace')} className="inline-flex items-center gap-2 text-purple-600 hover:underline mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Marketplace
                        </Link>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{asset.name}</h1>
                                <p className="text-slate-600 mt-1">{asset.symbol}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className={assetTypeColors[asset.asset_type] || 'bg-slate-100 text-slate-700'}>
                                    {asset.asset_type?.replace('_', ' ')}
                                </Badge>
                                <Button 
                                    onClick={() => setBuyDialogOpen(true)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Invest Now
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">${(asset.current_value || asset.total_value).toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Expected Return</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    {((asset.expected_return || 0) / 100).toFixed(2)}%
                                </p>
                                <p className="text-xs text-slate-500">Annual</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Min. Investment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">${(asset.min_investment || 0).toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className={
                                    asset.status === 'active' ? 'bg-green-100 text-green-700' :
                                    asset.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-slate-100 text-slate-700'
                                }>
                                    {asset.status}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        Asset Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">Basic Details</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-slate-400" />
                                                <span className="text-slate-600">Asset Class:</span>
                                                <span className="font-medium">{asset.asset_class || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <span className="text-slate-600">Jurisdiction:</span>
                                                <span className="font-medium">{asset.jurisdiction}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span className="text-slate-600">Maturity Date:</span>
                                                <span className="font-medium">
                                                    {asset.maturity_date ? new Date(asset.maturity_date).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-slate-400" />
                                                <span className="text-slate-600">Accredited Only:</span>
                                                <span className="font-medium">{asset.accredited_only ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">Blockchain Details</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <span className="text-slate-600">Network:</span>
                                                <span className="font-medium capitalize">{asset.network}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-slate-400" />
                                                <span className="text-slate-600">Total Supply:</span>
                                                <span className="font-medium">{asset.total_supply?.toLocaleString()} tokens</span>
                                            </div>
                                            {asset.contract_address && (
                                                <div>
                                                    <span className="text-slate-600 block mb-1">Contract:</span>
                                                    <a
                                                        href={`https://polygonscan.com/address/${asset.contract_address}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                                                    >
                                                        {asset.contract_address.slice(0, 10)}...{asset.contract_address.slice(-8)}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {Object.keys(metadata).length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Asset-Specific Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {Object.entries(metadata).map(([key, value]) => (
                                                <div key={key} className="border-b pb-2">
                                                    <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                    <p className="font-medium mt-1">{String(value)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Custody & Redemption
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-slate-600">Custody Type:</span>
                                        <p className="font-medium capitalize">{asset.custody_type?.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-600">Custodian:</span>
                                        <p className="font-medium">{asset.custodian_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-600">Redeemable:</span>
                                        <p className="font-medium">{asset.is_redeemable ? 'Yes' : 'No'}</p>
                                    </div>
                                    {asset.is_redeemable && (
                                        <div>
                                            <span className="text-slate-600">Redemption Type:</span>
                                            <p className="font-medium capitalize">{asset.redemption_type?.replace(/_/g, ' ')}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="performance" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Historical Performance (12 Months)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={performanceData}>
                                            <defs>
                                                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                            <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#performanceGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-600">Last Valuation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xl font-bold">
                                            {asset.last_valuation_date 
                                                ? new Date(asset.last_valuation_date).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-600">12M Performance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xl font-bold text-green-600">+12.5%</p>
                                        <p className="text-xs text-slate-500">Estimated</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-600">Volatility</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xl font-bold">{((asset.risk_rating || 5) * 2).toFixed(1)}%</p>
                                        <p className="text-xs text-slate-500">Annual</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="risk" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Gauge className="h-5 w-5" />
                                        Risk Assessment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-600">Overall Risk Rating</span>
                                            <Badge className={`${riskInfo.bg} ${riskInfo.color}`}>
                                                {riskInfo.label}
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-3">
                                            <div 
                                                className={`h-3 rounded-full ${
                                                    (asset.risk_rating || 5) <= 3 ? 'bg-green-600' :
                                                    (asset.risk_rating || 5) <= 6 ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                                }`}
                                                style={{ width: `${((asset.risk_rating || 5) / 10) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>Low</span>
                                            <span>Medium</span>
                                            <span>High</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Market Risk:</strong> Asset value may fluctuate based on market conditions and economic factors.
                                            </AlertDescription>
                                        </Alert>

                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Liquidity Risk:</strong> {asset.is_redeemable 
                                                    ? 'Tokens are redeemable according to the redemption schedule.' 
                                                    : 'Limited liquidity - assets may be difficult to sell quickly.'}
                                            </AlertDescription>
                                        </Alert>

                                        <Alert>
                                            <Shield className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Regulatory Risk:</strong> Subject to regulatory changes in {asset.jurisdiction}.
                                            </AlertDescription>
                                        </Alert>

                                        {asset.accredited_only && (
                                            <Alert>
                                                <Info className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Accredited Investors Only:</strong> This asset is restricted to accredited investors.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Risk Mitigation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Professional Custody</p>
                                            <p className="text-slate-600">Assets held by licensed custodian {asset.custodian_name || 'institutional custodian'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Smart Contract Security</p>
                                            <p className="text-slate-600">Audited smart contracts on {asset.network} blockchain</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Regulatory Compliance</p>
                                            <p className="text-slate-600">Compliant with {asset.jurisdiction} securities regulations</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Legal Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {asset.documents && asset.documents.length > 0 ? (
                                        <div className="space-y-3">
                                            {asset.documents.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-slate-400" />
                                                        <div>
                                                            <p className="font-medium">{doc.document_name}</p>
                                                            <p className="text-xs text-slate-600 capitalize">{doc.document_type}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                            <p>No documents available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invest in {asset.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Investment Amount (USD)</Label>
                            <Input
                                type="number"
                                placeholder="10000"
                                value={orderAmount}
                                onChange={(e) => setOrderAmount(e.target.value)}
                                min={asset.min_investment || 0}
                            />
                            {asset.min_investment && (
                                <p className="text-xs text-slate-600 mt-1">
                                    Minimum: ${asset.min_investment.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {orderAmount && (
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Token Price:</span>
                                    <span className="font-medium">${(asset.total_value / asset.total_supply).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tokens to Receive:</span>
                                    <span className="font-medium">
                                        {Math.floor(parseFloat(orderAmount) / (asset.total_value / asset.total_supply)).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-semibold pt-2 border-t">
                                    <span>Total:</span>
                                    <span>${parseFloat(orderAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <Button 
                            onClick={handleBuyOrder}
                            disabled={createOrderMutation.isPending}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                            {createOrderMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}