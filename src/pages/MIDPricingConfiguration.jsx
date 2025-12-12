import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DollarSign, Percent, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function MIDPricingConfiguration() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const [selectedMID, setSelectedMID] = useState('');
    const queryClient = useQueryClient();

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['mids', selectedMerchant],
        queryFn: async () => {
            if (!selectedMerchant) return [];
            return await base44.entities.MerchantMID.filter({ merchant_id: selectedMerchant });
        },
        enabled: !!selectedMerchant && merchants.length > 0
    });

    // Get current MID details to determine supported payment methods
    const currentMID = React.useMemo(() => {
        return mids.find(m => m.mid === selectedMID);
    }, [mids, selectedMID]);

    // Determine which payment method columns to show based on MID configuration
    const paymentMethodConfig = React.useMemo(() => {
        if (!currentMID) return { showCUP: false, showBankTransfer: false, showWallet: false };
        
        const transactionTypes = currentMID.transaction_types || [];
        const accountType = currentMID.account_type || '';
        
        return {
            // Show CUP columns if card transactions are supported (UnionPay)
            showCUP: transactionTypes.includes('card_present') || 
                     transactionTypes.includes('card_not_present') ||
                     transactionTypes.includes('ecommerce'),
            
            // Show Bank Transfer columns if bank payment methods are configured
            showBankTransfer: accountType === 'bank_transfer' || 
                             transactionTypes.some(t => t.includes('bank')) ||
                             currentMID.description?.toLowerCase().includes('bank'),
            
            // Show Wallet columns if wallet/digital payment methods are configured  
            showWallet: accountType === 'wallet' ||
                       transactionTypes.some(t => t.includes('wallet'))
        };
    }, [currentMID]);

    const { data: feeTypes = [] } = useQuery({
        queryKey: ['feeTypes'],
        queryFn: () => base44.entities.FeeType.filter({ status: 'active' })
    });

    const { data: existingPricing } = useQuery({
        queryKey: ['midPricing', selectedMID],
        queryFn: async () => {
            const result = await base44.entities.MIDPricing.filter({ mid: selectedMID });
            return result[0];
        },
        enabled: !!selectedMID
    });

    const { data: merchantPricing } = useQuery({
        queryKey: ['merchantPricing', selectedMerchant],
        queryFn: async () => {
            console.log('Looking for merchant pricing with merchant_id:', selectedMerchant);
            const result = await base44.entities.MerchantPricing.filter({ merchant_id: selectedMerchant });
            console.log('Found merchant pricing:', result);
            return result;
        },
        enabled: !!selectedMerchant
    });

    const [pricingData, setPricingData] = useState({
        merchant_id: '',
        merchant_name: '',
        mid: '',
        mid_pricing_name: '',
        inherits_merchant_pricing: false,
        effective_start_date: new Date().toISOString().split('T')[0],
        currency: 'USD',
        fee_configuration: [],
        monthly_fees: [
            { description: '', quantity: 0, unit_charge: 0, charge_date: 'End of Month', enabled: false },
            { description: '', quantity: 0, unit_charge: 0, charge_date: 'End of Month', enabled: false },
            { description: '', quantity: 0, unit_charge: 0, charge_date: 'End of Month', enabled: false },
            { description: '', quantity: 0, unit_charge: 0, charge_date: 'End of Month', enabled: false },
            { description: '', quantity: 0, unit_charge: 0, charge_date: 'End of Month', enabled: false }
        ],
        annual_fee: { enabled: false, amount: 0, charge_date: 'Start of Year' },
        setup_fee: { enabled: false, amount: 0 },
        status: 'active'
    });

    // Initialize fee configuration when MID is selected
    React.useEffect(() => {
        console.log('MID selection effect:', { existingPricing, selectedMID, feeTypesLength: feeTypes.length });
        
        if (existingPricing) {
            console.log('Loading existing pricing data:', existingPricing);
            // Ensure fee_configuration exists and has items, or initialize it
            const feeConfig = existingPricing.fee_configuration && existingPricing.fee_configuration.length > 0
                ? existingPricing.fee_configuration
                : feeTypes.map(ft => ({
                    fee_code: ft.fee_code,
                    enabled: false,
                    fixed_amount: 0,
                    percentage: 0,
                    offset_from_settlement: ft.offset_from_settlement,
                    bank_transfer_fixed: 0,
                    bank_transfer_percentage: 0,
                    cup_fixed: 0,
                    cup_percentage: 0
                }));
            
            setPricingData({
                ...existingPricing,
                fee_configuration: feeConfig
            });
            console.log('Set pricing data with fee_configuration length:', feeConfig.length);
        } else if (selectedMID && feeTypes.length > 0) {
            const mid = mids.find(m => m.mid === selectedMID);
            const merchant = merchants.find(m => m.id === selectedMerchant);
            console.log('Initializing new fee configuration for MID:', selectedMID);
            
            setPricingData(prev => ({
                ...prev,
                merchant_id: selectedMerchant,
                merchant_name: merchant?.business_name || '',
                mid: selectedMID,
                mid_pricing_name: `${mid?.mid} Pricing Model`,
                fee_configuration: feeTypes.map(ft => ({
                    fee_code: ft.fee_code,
                    enabled: false,
                    fixed_amount: 0,
                    percentage: 0,
                    offset_from_settlement: ft.offset_from_settlement,
                    bank_transfer_fixed: 0,
                    bank_transfer_percentage: 0,
                    cup_fixed: 0,
                    cup_percentage: 0
                }))
            }));
            
            console.log('Fee configuration initialized with', feeTypes.length, 'fee types');
        }
    }, [existingPricing, selectedMID, mids, merchants, feeTypes, selectedMerchant]);

    // Populate from merchant pricing when inheritance is enabled
    React.useEffect(() => {
        console.log('Inheritance effect triggered:', {
            inherits: pricingData.inherits_merchant_pricing,
            hasMerchantPricing: merchantPricing?.length > 0,
            selectedMID,
            feeConfigLength: pricingData.fee_configuration.length,
            feeTypesLength: feeTypes.length
        });
        
        if (pricingData.inherits_merchant_pricing && merchantPricing && merchantPricing.length > 0 && selectedMID) {
            const mp = merchantPricing[0];
            console.log('Populating from merchant pricing:', mp);
            
            // Create fee configuration directly from merchant pricing if not initialized
            const baseFeeConfig = pricingData.fee_configuration.length > 0 
                ? pricingData.fee_configuration
                : feeTypes.length > 0
                ? feeTypes.map(ft => ({
                    fee_code: ft.fee_code,
                    enabled: false,
                    fixed_amount: 0,
                    percentage: 0,
                    offset_from_settlement: ft.offset_from_settlement,
                    bank_transfer_fixed: 0,
                    bank_transfer_percentage: 0,
                    cup_fixed: 0,
                    cup_percentage: 0
                }))
                : [{
                    fee_code: 'SALE_TXN',
                    enabled: true,
                    fixed_amount: mp.sell_fixed_fee || 0,
                    percentage: mp.sell_percentage_rate || 0,
                    offset_from_settlement: true,
                    bank_transfer_fixed: 0,
                    bank_transfer_percentage: 0,
                    cup_fixed: 0,
                    cup_percentage: 0
                }];
            
            console.log('Base fee config:', baseFeeConfig);
            
            setPricingData(prev => {
                const newConfig = baseFeeConfig.map(fc => {
                    // For transaction fees, use the sell rate from merchant pricing
                    if (fc.fee_code === 'SALE_TXN') {
                        console.log('Setting SALE_TXN fee - fixed:', mp.sell_fixed_fee, 'percentage:', mp.sell_percentage_rate);
                        return {
                            ...fc,
                            enabled: true,
                            fixed_amount: mp.sell_fixed_fee || 0,
                            percentage: mp.sell_percentage_rate || 0,
                            offset_from_settlement: true
                        };
                    }
                    return fc;
                });
                
                console.log('New fee_configuration after update:', newConfig);
                
                return {
                    ...prev,
                    merchant_pricing_id: mp.id,
                    currency: mp.currency || 'USD',
                    fee_configuration: newConfig
                };
            });
        }
    }, [pricingData.inherits_merchant_pricing, merchantPricing, selectedMID, feeTypes]);

    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (existingPricing) {
                return base44.entities.MIDPricing.update(existingPricing.id, data);
            }
            return base44.entities.MIDPricing.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['midPricing']);
            toast.success('MID pricing configuration saved');
        }
    });

    const handleSave = () => {
        saveMutation.mutate(pricingData);
    };

    const updateFeeConfig = (feeCode, field, value) => {
        setPricingData(prev => ({
            ...prev,
            fee_configuration: prev.fee_configuration.map(fc =>
                fc.fee_code === feeCode ? { ...fc, [field]: value } : fc
            )
        }));
    };

    const updateMonthlyFee = (index, field, value) => {
        setPricingData(prev => ({
            ...prev,
            monthly_fees: prev.monthly_fees.map((mf, i) =>
                i === index ? { ...mf, [field]: value } : mf
            )
        }));
    };

    const transactionFees = feeTypes.filter(ft => 
        ['sale', 'refund', 'authorization', 'capture', 'void', 'chargeback', 'payout'].includes(ft.applies_to)
    );

    const serviceFees = feeTypes.filter(ft => 
        ['tokenization', 'fraud_check', '3ds', 'settlement'].includes(ft.applies_to)
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="MerchantPricing" />
            <div className={cn("transition-all duration-300", "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <Button variant="outline" onClick={() => navigate(createPageUrl('MerchantPricing'))} className="gap-2 mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">MID Pricing Configuration</h1>
                                    <p className="text-slate-500">Configure detailed pricing per MID</p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleSave} 
                                className="gap-2"
                                disabled={!selectedMID || saveMutation.isPending}
                            >
                                <Save className="h-4 w-4" />
                                {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
                            </Button>
                        </div>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Select MID</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Merchant</Label>
                                    <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select merchant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {merchants.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.business_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>MID</Label>
                                    <Select value={selectedMID} onValueChange={setSelectedMID} disabled={!selectedMerchant}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select MID" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mids.map(m => (
                                                <SelectItem key={m.id} value={m.mid}>
                                                    {m.mid} - {m.account_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Inherits Merchant Pricing</Label>
                                    <div className="flex items-center h-10 gap-2">
                                        <Switch 
                                            checked={pricingData.inherits_merchant_pricing}
                                            onCheckedChange={(val) => setPricingData({...pricingData, inherits_merchant_pricing: val})}
                                        />
                                        {pricingData.inherits_merchant_pricing ? (
                                            <span className="text-xs text-blue-600">Using merchant defaults</span>
                                        ) : (
                                            <span className="text-xs text-slate-500">Custom MID pricing</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedMID && (
                        <>
                            {pricingData.inherits_merchant_pricing && merchantPricing && merchantPricing.length > 0 && (
                                <Card className="mb-4 bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-blue-700">
                                            <Badge className="bg-blue-600">Inheriting Merchant Pricing</Badge>
                                            <span className="text-sm">
                                                Using pricing from: <strong>{merchantPricing[0].pricing_model_name}</strong>
                                            </span>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-2">
                                            {merchantPricing.length} pricing model(s) configured for this merchant. 
                                            Disable inheritance to create custom MID-specific pricing.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                            
                            {pricingData.inherits_merchant_pricing && (!merchantPricing || merchantPricing.length === 0) && (
                                <Card className="mb-4 bg-amber-50 border-amber-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-amber-700">
                                            <Badge className="bg-amber-600">No Merchant Pricing Found</Badge>
                                        </div>
                                        <p className="text-xs text-amber-600 mt-2">
                                            No pricing configured for this merchant yet. Please create merchant pricing first or disable inheritance to configure MID-specific pricing.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                        <Tabs defaultValue="transactions" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="transactions">Transaction Fees</TabsTrigger>
                                <TabsTrigger value="services">Service Fees</TabsTrigger>
                                <TabsTrigger value="recurring">Recurring Fees</TabsTrigger>
                            </TabsList>

                            <TabsContent value="transactions">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transaction Fee Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {pricingData.fee_configuration.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                No fee configuration available. Toggle inheritance or add fees manually.
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Transaction Type</TableHead>
                                                        <TableHead>Enabled</TableHead>
                                                        <TableHead>Offset from Settlement</TableHead>
                                                        <TableHead>Fixed Amount</TableHead>
                                                        <TableHead>Percentage</TableHead>
                                                        {paymentMethodConfig.showCUP && (
                                                            <>
                                                                <TableHead>CUP Fixed</TableHead>
                                                                <TableHead>CUP %</TableHead>
                                                            </>
                                                        )}
                                                        {paymentMethodConfig.showBankTransfer && (
                                                            <>
                                                                <TableHead>Bank Transfer Fixed</TableHead>
                                                                <TableHead>Bank Transfer %</TableHead>
                                                            </>
                                                        )}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pricingData.fee_configuration.map((config, idx) => (
                                                        <TableRow key={config.fee_code || idx}>
                                                            <TableCell className="font-medium">
                                                                {config.fee_code}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch 
                                                                    checked={config.enabled}
                                                                    onCheckedChange={(val) => updateFeeConfig(config.fee_code, 'enabled', val)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch 
                                                                    checked={config.offset_from_settlement}
                                                                    onCheckedChange={(val) => updateFeeConfig(config.fee_code, 'offset_from_settlement', val)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.fixed_amount}
                                                                    onChange={(e) => updateFeeConfig(config.fee_code, 'fixed_amount', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.percentage}
                                                                    onChange={(e) => updateFeeConfig(config.fee_code, 'percentage', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.cup_fixed || 0}
                                                                    onChange={(e) => updateFeeConfig(config.fee_code, 'cup_fixed', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.cup_percentage || 0}
                                                                    onChange={(e) => updateFeeConfig(config.fee_code, 'cup_percentage', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.bank_transfer_fixed || 0}
                                                                    onChange={(e) => updateFeeConfig(config.fee_code, 'bank_transfer_fixed', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.bank_transfer_percentage || 0}
                                                                    onChange={(e) => updateFeeConfig(config.fee_code, 'bank_transfer_percentage', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="services">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Service Fee Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Service Type</TableHead>
                                                    <TableHead>Enabled</TableHead>
                                                    <TableHead>Offset from Settlement</TableHead>
                                                    <TableHead>Fixed Charge</TableHead>
                                                    <TableHead>% Charge</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {serviceFees.map(fee => {
                                                    const config = pricingData.fee_configuration?.find(fc => fc.fee_code === fee.fee_code);
                                                    if (!config) return null;
                                                    return (
                                                        <TableRow key={fee.id}>
                                                            <TableCell className="font-medium">
                                                                {fee.fee_name}
                                                                <div className="text-xs text-slate-500">{fee.fee_code}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch 
                                                                    checked={config.enabled}
                                                                    onCheckedChange={(val) => updateFeeConfig(fee.fee_code, 'enabled', val)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch 
                                                                    checked={config.offset_from_settlement}
                                                                    onCheckedChange={(val) => updateFeeConfig(fee.fee_code, 'offset_from_settlement', val)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.fixed_amount}
                                                                    onChange={(e) => updateFeeConfig(fee.fee_code, 'fixed_amount', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config.percentage}
                                                                    onChange={(e) => updateFeeConfig(fee.fee_code, 'percentage', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="recurring">
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Monthly Fees</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead>Quantity</TableHead>
                                                        <TableHead>Unit Charge</TableHead>
                                                        <TableHead>Charge Date</TableHead>
                                                        <TableHead>Enabled</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pricingData.monthly_fees.map((mf, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>
                                                                <Input
                                                                    value={mf.description}
                                                                    onChange={(e) => updateMonthlyFee(idx, 'description', e.target.value)}
                                                                    placeholder={`Monthly Fee ${idx + 1}`}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={mf.quantity}
                                                                    onChange={(e) => updateMonthlyFee(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={mf.unit_charge}
                                                                    onChange={(e) => updateMonthlyFee(idx, 'unit_charge', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select value={mf.charge_date} onValueChange={(val) => updateMonthlyFee(idx, 'charge_date', val)}>
                                                                    <SelectTrigger className="w-40">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="End of Month">End of Month</SelectItem>
                                                                        <SelectItem value="Start of Month">Start of Month</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch 
                                                                    checked={mf.enabled}
                                                                    onCheckedChange={(val) => updateMonthlyFee(idx, 'enabled', val)}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Annual Fee</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Enable Annual Fee</Label>
                                                    <Switch 
                                                        checked={pricingData.annual_fee.enabled}
                                                        onCheckedChange={(val) => setPricingData({
                                                            ...pricingData,
                                                            annual_fee: { ...pricingData.annual_fee, enabled: val }
                                                        })}
                                                    />
                                                </div>
                                                {pricingData.annual_fee.enabled && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>Amount</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={pricingData.annual_fee.amount}
                                                                onChange={(e) => setPricingData({
                                                                    ...pricingData,
                                                                    annual_fee: { ...pricingData.annual_fee, amount: parseFloat(e.target.value) || 0 }
                                                                })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Charge Date</Label>
                                                            <Select 
                                                                value={pricingData.annual_fee.charge_date}
                                                                onValueChange={(val) => setPricingData({
                                                                    ...pricingData,
                                                                    annual_fee: { ...pricingData.annual_fee, charge_date: val }
                                                                })}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Start of Year">Start of Year</SelectItem>
                                                                    <SelectItem value="Contract Anniversary">Contract Anniversary</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Setup Fee</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Enable Setup Fee</Label>
                                                    <Switch 
                                                        checked={pricingData.setup_fee.enabled}
                                                        onCheckedChange={(val) => setPricingData({
                                                            ...pricingData,
                                                            setup_fee: { ...pricingData.setup_fee, enabled: val }
                                                        })}
                                                    />
                                                </div>
                                                {pricingData.setup_fee.enabled && (
                                                    <div className="space-y-2">
                                                        <Label>Amount</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={pricingData.setup_fee.amount}
                                                            onChange={(e) => setPricingData({
                                                                ...pricingData,
                                                                setup_fee: { ...pricingData.setup_fee, amount: parseFloat(e.target.value) || 0 }
                                                            })}
                                                        />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}