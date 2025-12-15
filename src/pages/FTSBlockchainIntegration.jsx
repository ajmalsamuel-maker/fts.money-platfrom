import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { 
    Plus, 
    Bitcoin,
    Network,
    Shield,
    Zap,
    Edit,
    Trash2,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Link as LinkIcon,
    Globe,
    DollarSign,
    Save
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ISO 4217-compliant crypto currencies + emerging standards
const cryptoCurrencies = [
    { code: 'BTC', name: 'Bitcoin', network: 'Bitcoin', standard: 'ISO 24165', decimals: 8 },
    { code: 'ETH', name: 'Ethereum', network: 'Ethereum', standard: 'ISO 24165', decimals: 18 },
    { code: 'USDT', name: 'Tether', network: 'Multiple', standard: 'ISO 24165', decimals: 6 },
    { code: 'USDC', name: 'USD Coin', network: 'Multiple', standard: 'ISO 24165', decimals: 6 },
    { code: 'BNB', name: 'Binance Coin', network: 'BSC', standard: 'ISO 24165', decimals: 18 },
    { code: 'SOL', name: 'Solana', network: 'Solana', standard: 'ISO 24165', decimals: 9 },
    { code: 'XRP', name: 'Ripple', network: 'XRP Ledger', standard: 'ISO 24165', decimals: 6 },
    { code: 'ADA', name: 'Cardano', network: 'Cardano', standard: 'ISO 24165', decimals: 6 },
    { code: 'MATIC', name: 'Polygon', network: 'Polygon', standard: 'ISO 24165', decimals: 18 },
    { code: 'TRX', name: 'Tron', network: 'Tron', standard: 'ISO 24165', decimals: 6 }
];

const blockchainNetworks = [
    { id: 'bitcoin', name: 'Bitcoin', type: 'Layer 1', protocol: 'UTXO', standard: 'BIP-32/39/44' },
    { id: 'ethereum', name: 'Ethereum', type: 'Layer 1', protocol: 'EVM', standard: 'EIP-1559' },
    { id: 'lightning', name: 'Lightning Network', type: 'Layer 2', protocol: 'Payment Channels', standard: 'BOLT' },
    { id: 'polygon', name: 'Polygon', type: 'Layer 2', protocol: 'EVM', standard: 'EIP-1559' },
    { id: 'arbitrum', name: 'Arbitrum', type: 'Layer 2', protocol: 'Rollup', standard: 'EVM' },
    { id: 'optimism', name: 'Optimism', type: 'Layer 2', protocol: 'Rollup', standard: 'EVM' },
    { id: 'solana', name: 'Solana', type: 'Layer 1', protocol: 'PoH', standard: 'SPL' },
    { id: 'bsc', name: 'BNB Smart Chain', type: 'Layer 1', protocol: 'EVM', standard: 'BEP-20' },
    { id: 'avalanche', name: 'Avalanche', type: 'Layer 1', protocol: 'Consensus', standard: 'EVM' },
    { id: 'tron', name: 'Tron', type: 'Layer 1', protocol: 'TVM', standard: 'TRC-20' }
];

const complianceStandards = [
    { code: 'ISO_24165', name: 'ISO 24165 - Digital Token Identifier', category: 'identification' },
    { code: 'ISO_20022', name: 'ISO 20022 - Crypto Payment Messages', category: 'messaging' },
    { code: 'FATF_TRAVEL_RULE', name: 'FATF Travel Rule', category: 'compliance' },
    { code: 'BIP_32_39_44', name: 'BIP 32/39/44 - HD Wallets', category: 'wallet' },
    { code: 'EIP_1559', name: 'EIP-1559 - Gas Fee Standard', category: 'protocol' },
    { code: 'VASP_CODE', name: 'VASP Identification Code', category: 'compliance' },
    { code: 'IVMS_101', name: 'IVMS 101 - Travel Rule Data', category: 'compliance' }
];

export default function FTSBlockchainIntegration() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('networks');
    const [showDialog, setShowDialog] = useState(false);
    const [editingConnector, setEditingConnector] = useState(null);
    const [editedFees, setEditedFees] = useState({});

    const [formData, setFormData] = useState({
        connector_name: '',
        blockchain_network: 'ethereum',
        provider_type: 'node_provider',
        rpc_endpoint: '',
        api_key: '',
        supported_currencies: [],
        transaction_fee_percentage: 0,
        gas_fee_markup: 0,
        status: 'active',
        compliance_enabled: true,
        travel_rule_threshold: 1000,
        kyc_required: true
    });

    const { data: connectors = [] } = useQuery({
        queryKey: ['blockchain-connectors'],
        queryFn: () => base44.entities.BlockchainConnector.list('-created_date')
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.BlockchainConnector.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['blockchain-connectors']);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.BlockchainConnector.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['blockchain-connectors']);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.BlockchainConnector.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['blockchain-connectors'])
    });

    const updateFeesMutation = useMutation({
        mutationFn: async (updates) => {
            await Promise.all(updates.map(({ id, transaction_fee_percentage, gas_fee_markup }) =>
                base44.entities.BlockchainConnector.update(id, { transaction_fee_percentage, gas_fee_markup })
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['blockchain-connectors']);
            setEditedFees({});
        }
    });

    const resetForm = () => {
        setShowDialog(false);
        setEditingConnector(null);
        setFormData({
            connector_name: '',
            blockchain_network: 'ethereum',
            provider_type: 'node_provider',
            rpc_endpoint: '',
            api_key: '',
            supported_currencies: [],
            transaction_fee_percentage: 0,
            gas_fee_markup: 0,
            status: 'active',
            compliance_enabled: true,
            travel_rule_threshold: 1000,
            kyc_required: true
        });
    };

    const handleEdit = (connector) => {
        setEditingConnector(connector);
        setFormData(connector);
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingConnector) {
            updateMutation.mutate({ id: editingConnector.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleSaveFees = () => {
        const updates = Object.entries(editedFees).map(([connectorId, fees]) => {
            const connector = connectors.find(c => c.id === connectorId);
            return {
                id: connectorId,
                transaction_fee_percentage: fees.transaction_fee_percentage ?? connector.transaction_fee_percentage ?? 0,
                gas_fee_markup: fees.gas_fee_markup ?? connector.gas_fee_markup ?? 0
            };
        });
        updateFeesMutation.mutate(updates);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSBlockchainIntegration" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Blockchain Integration</h2>
                        <p className="text-xs text-slate-600">Crypto payment rails with ISO 24165 & FATF compliance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Blockchain Connector
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="networks">Networks</TabsTrigger>
                            <TabsTrigger value="currencies">Currencies</TabsTrigger>
                            <TabsTrigger value="compliance">Compliance</TabsTrigger>
                            <TabsTrigger value="fees">Fee Matrix</TabsTrigger>
                        </TabsList>

                        {/* Networks Tab */}
                        <TabsContent value="networks" className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Total Connectors</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">{connectors.length}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <Network className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">Active Networks</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    {connectors.filter(c => c.status === 'active').length}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">FATF Compliant</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    {connectors.filter(c => c.compliance_enabled).length}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <Shield className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600">PSP Integrations</p>
                                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                                    {psps.filter(p => p.advanced_features?.crypto_payments).length}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <Bitcoin className="h-6 w-6 text-amber-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Available Networks */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Supported Blockchain Networks</CardTitle>
                                    <p className="text-sm text-slate-600">Industry-standard protocols with ISO compliance</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {blockchainNetworks.map((network) => (
                                            <div key={network.id} className="p-4 border border-slate-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold">{network.name}</h4>
                                                    <Badge variant="outline">{network.type}</Badge>
                                                </div>
                                                <div className="space-y-1 text-sm text-slate-600">
                                                    <p><span className="font-medium">Protocol:</span> {network.protocol}</p>
                                                    <p><span className="font-medium">Standard:</span> {network.standard}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Connectors Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Blockchain Connectors ({connectors.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Connector</TableHead>
                                                <TableHead>Network</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Currencies</TableHead>
                                                <TableHead>Compliance</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {connectors.map((connector) => (
                                                <TableRow key={connector.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                <Bitcoin className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium">{connector.connector_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {connector.blockchain_network}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{connector.provider_type?.replace('_', ' ')}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {connector.supported_currencies?.slice(0, 3).join(', ')}
                                                        {connector.supported_currencies?.length > 3 && ` +${connector.supported_currencies.length - 3}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {connector.compliance_enabled ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                FATF
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">Disabled</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={connector.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                            {connector.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEdit(connector)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(connector.id)}>
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Currencies Tab */}
                        <TabsContent value="currencies">
                            <Card>
                                <CardHeader>
                                    <CardTitle>ISO 24165 Digital Token Identifiers</CardTitle>
                                    <p className="text-sm text-slate-600">Standardized cryptocurrency codes and specifications</p>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Currency Code</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Network</TableHead>
                                                <TableHead>Standard</TableHead>
                                                <TableHead>Decimals</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cryptoCurrencies.map((currency) => (
                                                <TableRow key={currency.code}>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono">
                                                            {currency.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{currency.name}</TableCell>
                                                    <TableCell>{currency.network}</TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-blue-100 text-blue-700">
                                                            {currency.standard}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{currency.decimals}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Compliance Tab */}
                        <TabsContent value="compliance">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Compliance Standards</CardTitle>
                                        <p className="text-sm text-slate-600">Industry regulations and international standards</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            {complianceStandards.map((standard) => (
                                                <div key={standard.code} className="p-4 border border-slate-200 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-sm">{standard.name}</h4>
                                                        <Badge variant="outline" className="capitalize">
                                                            {standard.category}
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Implemented
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>FATF Travel Rule Configuration</CardTitle>
                                        <p className="text-sm text-slate-600">Automated compliance for cross-border crypto transactions</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <h4 className="font-medium">Threshold Settings</h4>
                                                <div className="p-4 bg-slate-50 rounded-lg">
                                                    <p className="text-sm text-slate-600 mb-2">Minimum transaction amount for Travel Rule</p>
                                                    <p className="text-2xl font-bold">$1,000 USD</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-medium">VASP Verification</h4>
                                                <div className="p-4 bg-slate-50 rounded-lg">
                                                    <p className="text-sm text-slate-600 mb-2">Virtual Asset Service Provider validation</p>
                                                    <Badge className="bg-emerald-100 text-emerald-700">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Enabled
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-medium text-blue-900 mb-2">IVMS 101 Data Format</h4>
                                            <p className="text-sm text-blue-800">
                                                InterVASP Messaging Standard for Travel Rule data exchange between crypto providers
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Fee Matrix Tab */}
                        <TabsContent value="fees">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Blockchain Fee Matrix
                                            </CardTitle>
                                            <p className="text-sm text-slate-600">Transaction and gas fee configuration</p>
                                        </div>
                                        {Object.keys(editedFees).length > 0 && (
                                            <Button onClick={handleSaveFees} className="bg-blue-600 hover:bg-blue-700">
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes ({Object.keys(editedFees).length})
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Connector</TableHead>
                                                <TableHead>Network</TableHead>
                                                <TableHead>Transaction Fee (%)</TableHead>
                                                <TableHead>Gas Fee Markup (%)</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {connectors.map((connector) => {
                                                const editedFee = editedFees[connector.id];
                                                const txFee = editedFee?.transaction_fee_percentage ?? connector.transaction_fee_percentage ?? 0;
                                                const gasFee = editedFee?.gas_fee_markup ?? connector.gas_fee_markup ?? 0;

                                                return (
                                                    <TableRow key={connector.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                    <Bitcoin className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <span className="font-medium">{connector.connector_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {connector.blockchain_network}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={txFee}
                                                                    onChange={(e) => setEditedFees({
                                                                        ...editedFees,
                                                                        [connector.id]: {
                                                                            ...editedFees[connector.id],
                                                                            transaction_fee_percentage: parseFloat(e.target.value) || 0
                                                                        }
                                                                    })}
                                                                    className="w-24"
                                                                />
                                                                <span className="text-sm text-slate-600">%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={gasFee}
                                                                    onChange={(e) => setEditedFees({
                                                                        ...editedFees,
                                                                        [connector.id]: {
                                                                            ...editedFees[connector.id],
                                                                            gas_fee_markup: parseFloat(e.target.value) || 0
                                                                        }
                                                                    })}
                                                                    className="w-24"
                                                                />
                                                                <span className="text-sm text-slate-600">%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={connector.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                                {connector.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingConnector ? 'Edit Blockchain Connector' : 'Add Blockchain Connector'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Connector Name *</Label>
                                <Input 
                                    value={formData.connector_name} 
                                    onChange={(e) => setFormData({...formData, connector_name: e.target.value})} 
                                    placeholder="e.g., Ethereum Mainnet"
                                />
                            </div>
                            <div>
                                <Label>Blockchain Network *</Label>
                                <Select value={formData.blockchain_network} onValueChange={(v) => setFormData({...formData, blockchain_network: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {blockchainNetworks.map(net => (
                                            <SelectItem key={net.id} value={net.id}>{net.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Provider Type *</Label>
                                <Select value={formData.provider_type} onValueChange={(v) => setFormData({...formData, provider_type: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="node_provider">Node Provider</SelectItem>
                                        <SelectItem value="exchange">Exchange</SelectItem>
                                        <SelectItem value="wallet_provider">Wallet Provider</SelectItem>
                                        <SelectItem value="payment_processor">Payment Processor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="testing">Testing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>RPC Endpoint</Label>
                            <Input 
                                value={formData.rpc_endpoint} 
                                onChange={(e) => setFormData({...formData, rpc_endpoint: e.target.value})} 
                                placeholder="https://eth-mainnet.g.alchemy.com/v2/..."
                            />
                        </div>
                        <div>
                            <Label>API Key (encrypted)</Label>
                            <Input 
                                type="password"
                                value={formData.api_key} 
                                onChange={(e) => setFormData({...formData, api_key: e.target.value})} 
                                placeholder="••••••••••••••••"
                            />
                        </div>
                        <div>
                            <Label>Supported Currencies (comma-separated)</Label>
                            <Input 
                                value={formData.supported_currencies?.join(', ')} 
                                onChange={(e) => setFormData({...formData, supported_currencies: e.target.value.split(',').map(s => s.trim())})} 
                                placeholder="BTC, ETH, USDT, USDC"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Transaction Fee (%)</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.transaction_fee_percentage} 
                                    onChange={(e) => setFormData({...formData, transaction_fee_percentage: parseFloat(e.target.value)})} 
                                />
                            </div>
                            <div>
                                <Label>Gas Fee Markup (%)</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.gas_fee_markup} 
                                    onChange={(e) => setFormData({...formData, gas_fee_markup: parseFloat(e.target.value)})} 
                                />
                            </div>
                        </div>
                        <div className="border-t border-slate-200 pt-4 mt-4">
                            <h4 className="font-semibold mb-4">Compliance Settings</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>FATF Travel Rule Compliance</Label>
                                        <p className="text-xs text-slate-500">Enable Travel Rule data collection</p>
                                    </div>
                                    <Switch 
                                        checked={formData.compliance_enabled}
                                        onCheckedChange={(v) => setFormData({...formData, compliance_enabled: v})}
                                    />
                                </div>
                                <div>
                                    <Label>Travel Rule Threshold (USD)</Label>
                                    <Input 
                                        type="number"
                                        value={formData.travel_rule_threshold} 
                                        onChange={(e) => setFormData({...formData, travel_rule_threshold: parseFloat(e.target.value)})} 
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>KYC Required</Label>
                                        <p className="text-xs text-slate-500">Require identity verification</p>
                                    </div>
                                    <Switch 
                                        checked={formData.kyc_required}
                                        onCheckedChange={(v) => setFormData({...formData, kyc_required: v})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!formData.connector_name} className="bg-blue-600 hover:bg-blue-700">
                            {editingConnector ? 'Update' : 'Create'} Connector
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}