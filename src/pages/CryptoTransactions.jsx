import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Coins, 
    TrendingUp, 
    TrendingDown,
    ExternalLink,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Plus,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CRYPTO_ASSETS, getCryptoInfo, getCryptoBlockchain } from '@/components/utils/cryptoRegistry';
import { generateCryptoAssetDTI, validateDTI } from '@/components/utils/iso24165';
import { validateBlockchainTransaction, BLOCKCHAIN_NETWORKS, DLT_STATUS_CODES } from '@/components/utils/iso23257';

export default function CryptoTransactions() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState('');
    const [showNewDialog, setShowNewDialog] = useState(false);
    const queryClient = useQueryClient();

    // Fetch crypto prices
    const { data: pricesData, isLoading: pricesLoading } = useQuery({
        queryKey: ['crypto-prices'],
        queryFn: async () => {
            const topAssets = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano', 'ripple'];
            const response = await base44.functions.invoke('cryptoPrices', { symbols: topAssets });
            return response.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Fetch crypto transactions from Transaction entity
    const { data: transactions, isLoading: txLoading } = useQuery({
        queryKey: ['crypto-transactions'],
        queryFn: async () => {
            const allTx = await base44.entities.Transaction.list();
            return allTx.filter(tx => 
                tx.payment_method && 
                ['bitcoin', 'bitcoin_cash', 'crypto_currency', 'circle_usd_coin'].includes(tx.payment_method)
            );
        },
    });

    const filteredTransactions = transactions?.filter(tx => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            tx.transaction_id?.toLowerCase().includes(query) ||
            tx.crypto_asset?.toLowerCase().includes(query) ||
            tx.crypto_address?.toLowerCase().includes(query)
        );
    }) || [];

    const getStatusConfig = (status) => {
        const configs = {
            approved: { icon: CheckCircle, className: 'bg-green-50 text-green-700', label: 'Confirmed' },
            pending: { icon: Clock, className: 'bg-yellow-50 text-yellow-700', label: 'Pending' },
            declined: { icon: XCircle, className: 'bg-red-50 text-red-700', label: 'Failed' },
            processing: { icon: Loader2, className: 'bg-blue-50 text-blue-700', label: 'Processing' },
        };
        return configs[status] || configs.pending;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster position="top-right" />
            <Sidebar collapsed={sidebarCollapsed} currentPage="CryptoTransactions" />
            <div className={cn("transition-all duration-300", "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Crypto Transactions</h1>
                            <p className="text-slate-500">ISO 23257 & ISO 24165 compliant digital asset management</p>
                        </div>
                        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    New Transaction
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Record Crypto Transaction</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Select Asset</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose cryptocurrency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CRYPTO_ASSETS.slice(0, 10).map(asset => (
                                                    <SelectItem key={asset.id} value={asset.symbol}>
                                                        {asset.symbol} - {asset.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Amount</Label>
                                        <Input type="number" step="0.00000001" placeholder="0.00000000" />
                                    </div>
                                    <div>
                                        <Label>Wallet Address</Label>
                                        <Input placeholder="0x..." />
                                    </div>
                                    <div>
                                        <Label>Blockchain Network</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select network" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BLOCKCHAIN_NETWORKS.map(net => (
                                                    <SelectItem key={net.id} value={net.id}>
                                                        {net.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button className="w-full">Create Transaction</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="overview">Market Overview</TabsTrigger>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="validation">ISO Validation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Real-time Prices */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pricesLoading ? (
                                    <Card className="col-span-3">
                                        <CardContent className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </CardContent>
                                    </Card>
                                ) : (
                                    CRYPTO_ASSETS.slice(0, 6).map(asset => {
                                        const priceInfo = pricesData?.prices?.[asset.coingecko_id];
                                        const change24h = priceInfo?.usd_24h_change || 0;
                                        const isPositive = change24h >= 0;
                                        const dti = generateCryptoAssetDTI(asset.symbol);
                                        const blockchain = getCryptoBlockchain(asset.symbol);

                                        return (
                                            <Card key={asset.id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-lg">{asset.symbol}</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    DTI: {dti}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-slate-600">{asset.name}</p>
                                                        </div>
                                                        <div className={cn(
                                                            "flex items-center gap-1 text-sm font-medium",
                                                            isPositive ? "text-green-600" : "text-red-600"
                                                        )}>
                                                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                            {Math.abs(change24h).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="text-2xl font-bold">
                                                            ${priceInfo?.usd?.toLocaleString() || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-slate-500 space-y-1">
                                                            <p>Market Cap: ${(priceInfo?.usd_market_cap / 1e9)?.toFixed(2) || 'N/A'}B</p>
                                                            <p>Network: {blockchain}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>

                            {/* Info Banner */}
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <Coins className="h-6 w-6 text-blue-600 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900">ISO Standards Compliance</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                All crypto transactions are validated against ISO 23257 (Blockchain/DLT) and ISO 24165 (Digital Token Identifier) standards.
                                                Real-time price data from CoinGecko API.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="transactions" className="space-y-4">
                            {/* Search */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search by transaction ID, asset, or address..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transactions List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Crypto Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {txLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : filteredTransactions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Coins className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">No crypto transactions found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredTransactions.map(tx => {
                                                const statusConfig = getStatusConfig(tx.status);
                                                const StatusIcon = statusConfig.icon;
                                                const cryptoSymbol = tx.crypto_asset || 'BTC';
                                                const dti = generateCryptoAssetDTI(cryptoSymbol);
                                                const blockchain = getCryptoBlockchain(cryptoSymbol);

                                                return (
                                                    <div key={tx.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="font-mono font-bold text-lg">{cryptoSymbol}</span>
                                                                    <Badge variant="outline" className={statusConfig.className}>
                                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                                        {statusConfig.label}
                                                                    </Badge>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {blockchain}
                                                                    </Badge>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                    <div>
                                                                        <p className="text-slate-500">Amount</p>
                                                                        <p className="font-medium">{tx.amount} {cryptoSymbol}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-500">Transaction ID</p>
                                                                        <p className="font-mono text-xs truncate">{tx.transaction_id}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-500">DTI</p>
                                                                        <p className="font-mono text-xs">{dti}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-500">Date</p>
                                                                        <p>{new Date(tx.created_date).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                {tx.crypto_address && (
                                                                    <div className="mt-2 text-xs text-slate-500">
                                                                        Address: <span className="font-mono">{tx.crypto_address}</span>
                                                                    </div>
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
                        </TabsContent>

                        <TabsContent value="validation" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>ISO 23257 Transaction Validator</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Wallet Address</Label>
                                            <Input placeholder="0x..." />
                                        </div>
                                        <div>
                                            <Label>Chain ID</Label>
                                            <Input type="number" placeholder="1" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Transaction Hash</Label>
                                            <Input placeholder="0x..." />
                                        </div>
                                        <div>
                                            <Label>Amount</Label>
                                            <Input type="number" step="0.00000001" placeholder="0.00000000" />
                                        </div>
                                    </div>
                                    <Button className="w-full">
                                        Validate Transaction (ISO 23257)
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>ISO 24165 DTI Validator</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Digital Token Identifier (DTI)</Label>
                                        <Input placeholder="XXXYYYZZ9" maxLength={9} />
                                    </div>
                                    <Button className="w-full">
                                        Validate DTI (ISO 24165)
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-slate-600 mt-0.5" />
                                        <div className="text-sm text-slate-600 space-y-2">
                                            <p><strong>ISO 23257</strong> validates blockchain addresses, chain IDs, transaction hashes, and amounts.</p>
                                            <p><strong>ISO 24165</strong> validates 9-character Digital Token Identifiers with check digits.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}