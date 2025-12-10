import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, Wallet, TrendingUp, TrendingDown, RefreshCw, Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletMonitor({ merchant_id }) {
    const [balancesVisible, setBalancesVisible] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState(null);

    const { data: connectors = [], refetch } = useQuery({
        queryKey: ['wallet-balances', merchant_id],
        queryFn: async () => {
            const allConnectors = await base44.entities.BlockchainConnector.filter({ status: 'active' });
            
            // Fetch balances for each connector
            const connectorsWithBalances = await Promise.all(
                allConnectors.map(async (connector) => {
                    try {
                        const balanceRes = await base44.functions.invoke('blockchainConnector', {
                            action: 'get_balance',
                            connector_id: connector.connector_id,
                            wallet_address: connector.hot_wallet_address
                        });
                        
                        return {
                            ...connector,
                            balance: balanceRes.data?.balance || 0,
                            usd_value: balanceRes.data?.usd_value || 0,
                            last_updated: new Date().toISOString()
                        };
                    } catch (error) {
                        return {
                            ...connector,
                            balance: 0,
                            usd_value: 0,
                            error: error.message
                        };
                    }
                })
            );
            
            return connectorsWithBalances;
        },
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setTimeout(() => setRefreshing(false), 1000);
        toast.success('Wallet balances refreshed');
    };

    const copyAddress = (address) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        toast.success('Address copied');
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    const totalUsdValue = connectors.reduce((sum, c) => sum + (c.usd_value || 0), 0);

    const networkIcons = {
        ethereum: '⟠',
        bitcoin: '₿',
        binance_smart_chain: 'BNB',
        polygon: 'MATIC',
        solana: 'SOL',
        tron: 'TRX'
    };

    return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            <h3 className="font-semibold">Total Crypto Assets</h3>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => setBalancesVisible(!balancesVisible)}
                            >
                                {balancesVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                    <div className="text-4xl font-bold mb-2">
                        {balancesVisible ? `$${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                    </div>
                    <p className="text-white/80 text-sm">Across {connectors.length} blockchain network(s)</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectors.map((connector) => (
                    <Card key={connector.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-lg">
                                        {networkIcons[connector.blockchain_network] || '🔗'}
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-medium">
                                            {connector.connector_name}
                                        </CardTitle>
                                        <p className="text-xs text-slate-500">
                                            {connector.blockchain_network?.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={connector.error ? 'destructive' : 'default'}>
                                    {connector.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Balance</p>
                                <p className="text-2xl font-bold">
                                    {balancesVisible 
                                        ? `${connector.balance?.toFixed(8) || '0.00000000'}`
                                        : '••••••••'
                                    }
                                </p>
                                <p className="text-sm text-slate-600">
                                    {balancesVisible 
                                        ? `≈ $${(connector.usd_value || 0).toFixed(2)}`
                                        : '≈ $••••'
                                    }
                                </p>
                            </div>

                            {connector.hot_wallet_address && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Hot Wallet</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate">
                                            {connector.hot_wallet_address}
                                        </code>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={() => copyAddress(connector.hot_wallet_address)}
                                        >
                                            {copiedAddress === connector.hot_wallet_address ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {connector.supported_assets && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Supported Assets</p>
                                    <div className="flex flex-wrap gap-1">
                                        {connector.supported_assets.slice(0, 4).map(asset => (
                                            <Badge key={asset} variant="outline" className="text-xs">
                                                {asset}
                                            </Badge>
                                        ))}
                                        {connector.supported_assets.length > 4 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{connector.supported_assets.length - 4}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {connector.error && (
                                <p className="text-xs text-red-600">{connector.error}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {connectors.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Bitcoin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 mb-2">No blockchain connectors configured</p>
                        <p className="text-sm text-slate-500">Set up connectors to monitor wallet balances</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}