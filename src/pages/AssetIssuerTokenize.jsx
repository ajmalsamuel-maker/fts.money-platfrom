import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { Rocket, CheckCircle2, Shield, Lock, FileText, DollarSign, AlertCircle, Users, Calendar } from 'lucide-react';

export default function AssetIssuerTokenize() {
    const { issuer } = useAssetIssuerAuth();
    const [step, setStep] = useState(1);
    const [assetData, setAssetData] = useState({
        // Basic Info
        asset_type: 'real_estate',
        name: '',
        symbol: '',
        total_value: '',
        total_supply: '',
        min_investment: '',
        decimals: 0,
        
        // Token Features
        fractional: true,
        transferable: true,
        burnable: false,
        pausable: true,
        
        // Compliance & Legal
        jurisdiction: 'US',
        regulatory_framework: 'reg_d',
        kyc_required: true,
        aml_required: true,
        accredited_only: true,
        transfer_restrictions: true,
        whitelist_required: true,
        
        // Access Control
        multi_sig_required: true,
        required_signatures: 2,
        compliance_officer_required: true,
        
        // Tokenomics
        dividend_enabled: true,
        dividend_frequency: 'quarterly',
        yield_percentage: '',
        lockup_period: 12,
        vesting_enabled: false,
        secondary_market_enabled: false,
        
        // Legal Documents
        offering_document_url: '',
        prospectus_url: '',
        subscription_agreement_url: '',
        risk_disclosure_url: '',
        
        // Metadata
        asset_description: '',
        asset_location: '',
        valuation_method: '',
        independent_valuer: '',
        custody_arrangement: '',
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
    
    const updateAssetData = (field, value) => {
        setAssetData(prev => ({ ...prev, [field]: value }));
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
                                <CardTitle>Smart Contract Configuration</CardTitle>
                                <p className="text-sm text-slate-600">Configure your security token smart contract</p>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-5">
                                        <TabsTrigger value="basic">Basic</TabsTrigger>
                                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                                        <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                                        <TabsTrigger value="legal">Legal</TabsTrigger>
                                        <TabsTrigger value="metadata">Metadata</TabsTrigger>
                                    </TabsList>

                                    {/* Basic Configuration */}
                                    <TabsContent value="basic" className="space-y-4">
                                        <div>
                                            <Label>Asset Type</Label>
                                            <Select value={assetData.asset_type} onValueChange={(v) => updateAssetData('asset_type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="real_estate">Real Estate</SelectItem>
                                                    <SelectItem value="treasury_bill">Treasury Bill</SelectItem>
                                                    <SelectItem value="private_credit">Private Credit</SelectItem>
                                                    <SelectItem value="commodity">Commodity</SelectItem>
                                                    <SelectItem value="equity">Private Equity</SelectItem>
                                                    <SelectItem value="corporate_bond">Corporate Bond</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Asset Name</Label>
                                                <Input
                                                    placeholder="Manhattan Office Tower"
                                                    value={assetData.name}
                                                    onChange={(e) => updateAssetData('name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Token Symbol</Label>
                                                <Input
                                                    placeholder="MHTOWER"
                                                    value={assetData.symbol}
                                                    onChange={(e) => updateAssetData('symbol', e.target.value.toUpperCase())}
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label>Total Asset Value (USD)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="5000000"
                                                    value={assetData.total_value}
                                                    onChange={(e) => updateAssetData('total_value', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Total Token Supply</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="5000"
                                                    value={assetData.total_supply}
                                                    onChange={(e) => updateAssetData('total_supply', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Decimals</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="6"
                                                    value={assetData.decimals}
                                                    onChange={(e) => updateAssetData('decimals', parseInt(e.target.value))}
                                                />
                                                <p className="text-xs text-slate-500 mt-1">0 for whole tokens</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Minimum Investment (USD)</Label>
                                            <Input
                                                type="number"
                                                placeholder="10000"
                                                value={assetData.min_investment}
                                                onChange={(e) => updateAssetData('min_investment', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3 pt-4 border-t">
                                            <h4 className="font-semibold text-sm">Token Features</h4>
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <Label>Fractional Ownership</Label>
                                                    <p className="text-xs text-slate-500">Allow partial token ownership</p>
                                                </div>
                                                <Switch 
                                                    checked={assetData.fractional}
                                                    onCheckedChange={(checked) => updateAssetData('fractional', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <Label>Transferable</Label>
                                                    <p className="text-xs text-slate-500">Allow secondary market transfers</p>
                                                </div>
                                                <Switch 
                                                    checked={assetData.transferable}
                                                    onCheckedChange={(checked) => updateAssetData('transferable', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <Label>Pausable</Label>
                                                    <p className="text-xs text-slate-500">Emergency pause capability</p>
                                                </div>
                                                <Switch 
                                                    checked={assetData.pausable}
                                                    onCheckedChange={(checked) => updateAssetData('pausable', checked)}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Compliance & Legal */}
                                    <TabsContent value="compliance" className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                            <div className="flex gap-2">
                                                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-sm text-blue-900">Regulatory Compliance</h4>
                                                    <p className="text-xs text-blue-700">Configure investor restrictions and compliance rules</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Jurisdiction</Label>
                                                <Select value={assetData.jurisdiction} onValueChange={(v) => updateAssetData('jurisdiction', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="US">United States</SelectItem>
                                                        <SelectItem value="EU">European Union</SelectItem>
                                                        <SelectItem value="UK">United Kingdom</SelectItem>
                                                        <SelectItem value="SG">Singapore</SelectItem>
                                                        <SelectItem value="AE">UAE</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Regulatory Framework</Label>
                                                <Select value={assetData.regulatory_framework} onValueChange={(v) => updateAssetData('regulatory_framework', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="reg_d">Reg D (US)</SelectItem>
                                                        <SelectItem value="reg_s">Reg S (Non-US)</SelectItem>
                                                        <SelectItem value="reg_cf">Reg CF (Crowdfunding)</SelectItem>
                                                        <SelectItem value="mifid">MiFID II (EU)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Users className="h-5 w-5 text-purple-600" />
                                                    <div>
                                                        <Label>KYC Required</Label>
                                                        <p className="text-xs text-slate-500">Know Your Customer verification</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={assetData.kyc_required}
                                                    onCheckedChange={(checked) => updateAssetData('kyc_required', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Shield className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <Label>AML Required</Label>
                                                        <p className="text-xs text-slate-500">Anti-Money Laundering checks</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={assetData.aml_required}
                                                    onCheckedChange={(checked) => updateAssetData('aml_required', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Lock className="h-5 w-5 text-orange-600" />
                                                    <div>
                                                        <Label>Accredited Investors Only</Label>
                                                        <p className="text-xs text-slate-500">Restrict to qualified investors</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={assetData.accredited_only}
                                                    onCheckedChange={(checked) => updateAssetData('accredited_only', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <Label>Whitelist Required</Label>
                                                    <p className="text-xs text-slate-500">Only whitelisted addresses can hold tokens</p>
                                                </div>
                                                <Switch 
                                                    checked={assetData.whitelist_required}
                                                    onCheckedChange={(checked) => updateAssetData('whitelist_required', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <Label>Multi-Signature Required</Label>
                                                    <p className="text-xs text-slate-500">Require multiple approvals for operations</p>
                                                </div>
                                                <Switch 
                                                    checked={assetData.multi_sig_required}
                                                    onCheckedChange={(checked) => updateAssetData('multi_sig_required', checked)}
                                                />
                                            </div>

                                            {assetData.multi_sig_required && (
                                                <div className="ml-4">
                                                    <Label>Required Signatures</Label>
                                                    <Input 
                                                        type="number"
                                                        min="2"
                                                        max="5"
                                                        value={assetData.required_signatures}
                                                        onChange={(e) => updateAssetData('required_signatures', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Tokenomics */}
                                    <TabsContent value="tokenomics" className="space-y-4">
                                        <div className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <Label>Dividend Distribution</Label>
                                                        <p className="text-xs text-slate-500">Automatic yield payments</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={assetData.dividend_enabled}
                                                    onCheckedChange={(checked) => updateAssetData('dividend_enabled', checked)}
                                                />
                                            </div>
                                            {assetData.dividend_enabled && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Frequency</Label>
                                                            <Select value={assetData.dividend_frequency} onValueChange={(v) => updateAssetData('dividend_frequency', v)}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                                                    <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                                                                    <SelectItem value="annual">Annual</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label>Expected Yield (%)</Label>
                                                            <Input 
                                                                type="number"
                                                                step="0.1"
                                                                placeholder="5.5"
                                                                value={assetData.yield_percentage}
                                                                onChange={(e) => updateAssetData('yield_percentage', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <Label>Lockup Period</Label>
                                                    <p className="text-xs text-slate-500">Minimum holding period (months)</p>
                                                </div>
                                            </div>
                                            <Input 
                                                type="number"
                                                min="0"
                                                value={assetData.lockup_period}
                                                onChange={(e) => updateAssetData('lockup_period', parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <Label>Vesting Schedule</Label>
                                                <p className="text-xs text-slate-500">Gradual token release over time</p>
                                            </div>
                                            <Switch 
                                                checked={assetData.vesting_enabled}
                                                onCheckedChange={(checked) => updateAssetData('vesting_enabled', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <Label>Secondary Market Trading</Label>
                                                <p className="text-xs text-slate-500">Allow trading on secondary markets</p>
                                            </div>
                                            <Switch 
                                                checked={assetData.secondary_market_enabled}
                                                onCheckedChange={(checked) => updateAssetData('secondary_market_enabled', checked)}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Legal Documents */}
                                    <TabsContent value="legal" className="space-y-4">
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                            <div className="flex gap-2">
                                                <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-sm text-amber-900">Legal Documentation</h4>
                                                    <p className="text-xs text-amber-700">Provide URLs to required legal documents</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Offering Document / PPM URL</Label>
                                            <Input 
                                                type="url"
                                                placeholder="https://..."
                                                value={assetData.offering_document_url}
                                                onChange={(e) => updateAssetData('offering_document_url', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Prospectus URL</Label>
                                            <Input 
                                                type="url"
                                                placeholder="https://..."
                                                value={assetData.prospectus_url}
                                                onChange={(e) => updateAssetData('prospectus_url', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Subscription Agreement URL</Label>
                                            <Input 
                                                type="url"
                                                placeholder="https://..."
                                                value={assetData.subscription_agreement_url}
                                                onChange={(e) => updateAssetData('subscription_agreement_url', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Risk Disclosure URL</Label>
                                            <Input 
                                                type="url"
                                                placeholder="https://..."
                                                value={assetData.risk_disclosure_url}
                                                onChange={(e) => updateAssetData('risk_disclosure_url', e.target.value)}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Metadata */}
                                    <TabsContent value="metadata" className="space-y-4">
                                        <div>
                                            <Label>Asset Description</Label>
                                            <Textarea 
                                                placeholder="Detailed description of the underlying asset..."
                                                rows={4}
                                                value={assetData.asset_description}
                                                onChange={(e) => updateAssetData('asset_description', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Asset Location</Label>
                                            <Input 
                                                placeholder="123 Main St, New York, NY 10001"
                                                value={assetData.asset_location}
                                                onChange={(e) => updateAssetData('asset_location', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Valuation Method</Label>
                                            <Input 
                                                placeholder="Independent Appraisal"
                                                value={assetData.valuation_method}
                                                onChange={(e) => updateAssetData('valuation_method', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Independent Valuer</Label>
                                            <Input 
                                                placeholder="CBRE, Knight Frank, etc."
                                                value={assetData.independent_valuer}
                                                onChange={(e) => updateAssetData('independent_valuer', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Custody Arrangement</Label>
                                            <Input 
                                                placeholder="Fireblocks, Anchorage, etc."
                                                value={assetData.custody_arrangement}
                                                onChange={(e) => updateAssetData('custody_arrangement', e.target.value)}
                                            />
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-sm text-blue-900 mb-2">Contract Summary</h4>
                                            <div className="space-y-1 text-xs text-blue-800">
                                                <div className="flex justify-between">
                                                    <span>Token:</span>
                                                    <span className="font-medium">{assetData.symbol || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Total Value:</span>
                                                    <span className="font-medium">${Number(assetData.total_value).toLocaleString() || '0'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Supply:</span>
                                                    <span className="font-medium">{assetData.total_supply || '0'} tokens</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Price per Token:</span>
                                                    <span className="font-medium">${assetData.total_value && assetData.total_supply ? (assetData.total_value / assetData.total_supply).toFixed(2) : '0'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Compliance:</span>
                                                    <span className="font-medium">
                                                        {assetData.kyc_required && 'KYC'} 
                                                        {assetData.aml_required && ' + AML'}
                                                        {assetData.accredited_only && ' + Accredited'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Lockup:</span>
                                                    <span className="font-medium">{assetData.lockup_period} months</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex gap-3 mt-6">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => window.history.back()}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setStep(2)} className="flex-1">
                                        Review & Deploy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review & Deploy Security Token</CardTitle>
                                <p className="text-sm text-slate-600">Verify all configuration before deploying</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-slate-600" />
                                            Basic Info
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Asset:</span>
                                                <span className="font-medium">{assetData.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Symbol:</span>
                                                <Badge>{assetData.symbol}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Type:</span>
                                                <span className="font-medium capitalize">{assetData.asset_type.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Total Value:</span>
                                                <span className="font-medium">${Number(assetData.total_value).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Supply:</span>
                                                <span className="font-medium">{assetData.total_supply}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Price/Token:</span>
                                                <span className="font-medium">${(assetData.total_value / assetData.total_supply).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-blue-600" />
                                            Compliance
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Jurisdiction:</span>
                                                <Badge variant="secondary">{assetData.jurisdiction}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Framework:</span>
                                                <span className="font-medium uppercase">{assetData.regulatory_framework}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">KYC:</span>
                                                <Badge className={assetData.kyc_required ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {assetData.kyc_required ? 'Required' : 'Not Required'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">AML:</span>
                                                <Badge className={assetData.aml_required ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {assetData.aml_required ? 'Required' : 'Not Required'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Investors:</span>
                                                <span className="font-medium">{assetData.accredited_only ? 'Accredited Only' : 'All'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Whitelist:</span>
                                                <span className="font-medium">{assetData.whitelist_required ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            Tokenomics
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Dividends:</span>
                                                <Badge className={assetData.dividend_enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                                                    {assetData.dividend_enabled ? assetData.dividend_frequency : 'Disabled'}
                                                </Badge>
                                            </div>
                                            {assetData.dividend_enabled && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Yield:</span>
                                                    <span className="font-medium">{assetData.yield_percentage}% p.a.</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Lockup:</span>
                                                <span className="font-medium">{assetData.lockup_period} months</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Vesting:</span>
                                                <span className="font-medium">{assetData.vesting_enabled ? 'Enabled' : 'Disabled'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">2nd Market:</span>
                                                <span className="font-medium">{assetData.secondary_market_enabled ? 'Allowed' : 'Restricted'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-orange-600" />
                                            Access Control
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Multi-sig:</span>
                                                <Badge className={assetData.multi_sig_required ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}>
                                                    {assetData.multi_sig_required ? `${assetData.required_signatures} of N` : 'Single'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Pausable:</span>
                                                <span className="font-medium">{assetData.pausable ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Transferable:</span>
                                                <span className="font-medium">{assetData.transferable ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-blue-900">Deployment Information</h4>
                                            <p className="text-xs text-blue-700 mt-1">
                                                Security token contracts will be deployed to Polygon mainnet with multi-sig governance. 
                                                This process takes 2-3 minutes and requires gas fees (covered by platform).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                        Back to Configuration
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={tokenizeMutation.isPending} className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                                        <Rocket className="h-4 w-4" />
                                        {tokenizeMutation.isPending ? 'Deploying Smart Contract...' : 'Deploy to Blockchain'}
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