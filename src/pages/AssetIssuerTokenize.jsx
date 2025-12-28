import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { Rocket, CheckCircle2 } from 'lucide-react';

export default function AssetIssuerTokenize() {
    const { issuer } = useAssetIssuerAuth();
    const [step, setStep] = useState(1);
    const [assetData, setAssetData] = useState({
        asset_type: 'real_estate',
        name: '',
        symbol: '',
        total_value: '',
        total_supply: '',
        min_investment: '',
        jurisdiction: 'US',
        asset_metadata: {}
    });

    const tokenizeMutation = useMutation({
        mutationFn: async (data) => {
            // Call deployment function
            const result = await base44.functions.invoke('deployRWAToken', {
                ...data,
                issuer_lei: issuer.lei || 'DEMO',
                network: 'polygon'
            });
            return result.data;
        },
        onSuccess: (data) => {
            setStep(3);
        }
    });

    const handleSubmit = () => {
        tokenizeMutation.mutate(assetData);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerTokenize"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Tokenize Asset</h1>

                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Asset Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Asset Type</Label>
                                    <Select value={assetData.asset_type} onValueChange={(v) => setAssetData({...assetData, asset_type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="real_estate">Real Estate</SelectItem>
                                            <SelectItem value="treasury_bill">Treasury Bill</SelectItem>
                                            <SelectItem value="private_credit">Private Credit</SelectItem>
                                            <SelectItem value="commodity">Commodity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Asset Name</Label>
                                        <Input
                                            placeholder="Gold Reserve Token"
                                            value={assetData.name}
                                            onChange={(e) => setAssetData({...assetData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Token Symbol</Label>
                                        <Input
                                            placeholder="XAUGOLD"
                                            value={assetData.symbol}
                                            onChange={(e) => setAssetData({...assetData, symbol: e.target.value.toUpperCase()})}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Total Asset Value (USD)</Label>
                                        <Input
                                            type="number"
                                            placeholder="1000000"
                                            value={assetData.total_value}
                                            onChange={(e) => setAssetData({...assetData, total_value: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Total Token Supply</Label>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={assetData.total_supply}
                                            onChange={(e) => setAssetData({...assetData, total_supply: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Minimum Investment (USD)</Label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={assetData.min_investment}
                                        onChange={(e) => setAssetData({...assetData, min_investment: e.target.value})}
                                    />
                                </div>
                                <Button onClick={() => setStep(2)} className="w-full">
                                    Continue to Review
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review & Deploy</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Asset:</span>
                                        <span className="font-medium">{assetData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Symbol:</span>
                                        <span className="font-medium">{assetData.symbol}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Total Value:</span>
                                        <span className="font-medium">${Number(assetData.total_value).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Tokens:</span>
                                        <span className="font-medium">{assetData.total_supply}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-600">Price per Token:</span>
                                        <span className="font-medium">${(assetData.total_value / assetData.total_supply).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-900">
                                        Smart contracts will be deployed to Polygon. This process takes 2-3 minutes.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                        Back
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={tokenizeMutation.isPending} className="flex-1 gap-2">
                                        <Rocket className="h-4 w-4" />
                                        {tokenizeMutation.isPending ? 'Deploying...' : 'Deploy to Blockchain'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card>
                            <CardContent className="text-center py-12">
                                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Asset Tokenized Successfully!</h2>
                                <p className="text-slate-600 mb-6">Your asset is now live on the blockchain</p>
                                <Button onClick={() => window.location.href = createPageUrl('AssetIssuerAssets')}>
                                    View My Assets
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}