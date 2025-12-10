import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Search, Coins, Shield } from 'lucide-react';
import { 
    CRYPTO_ASSETS, 
    STABLECOINS,
    getCryptoInfo,
    getCryptoBlockchain 
} from '@/components/utils/cryptoRegistry';
import { generateCryptoAssetDTI, validateDTI } from '@/components/utils/iso24165';
import { DIGITAL_ASSET_TYPES, BLOCKCHAIN_NETWORKS } from '@/components/utils/iso23257';

export default function CryptoAssetRegistry() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAssets = CRYPTO_ASSETS.filter(asset => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            asset.symbol.toLowerCase().includes(query) ||
            asset.name.toLowerCase().includes(query) ||
            asset.id.toLowerCase().includes(query)
        );
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-blue-600" />
                    Crypto Asset Registry (ISO 23257 / ISO 24165)
                </CardTitle>
                <p className="text-sm text-slate-500 mt-2">
                    Integrated registry based on CoinMarketCap UCID and CoinGecko standards
                </p>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="assets" className="space-y-4">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="assets">Crypto Assets</TabsTrigger>
                        <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
                        <TabsTrigger value="networks">Networks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="space-y-4">
                        <Input
                            placeholder="Search by symbol, name, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-md"
                        />

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredAssets.map((asset) => {
                                const info = getCryptoInfo(asset.symbol);
                                const dti = generateCryptoAssetDTI(asset.symbol);
                                const blockchain = getCryptoBlockchain(asset.symbol);

                                return (
                                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono font-bold text-lg">{asset.symbol}</div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{asset.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            DTI: {dti}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            CMC: {asset.cmc_id}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {blockchain}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={info.apis.coinmarketcap}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                CMC <ExternalLink className="h-3 w-3" />
                                            </a>
                                            <a
                                                href={info.apis.coingecko}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-green-600 hover:underline flex items-center gap-1"
                                            >
                                                CoinGecko <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="stablecoins" className="space-y-3">
                        {STABLECOINS.map((stable) => (
                            <div key={stable.symbol} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono font-bold text-lg">{stable.symbol}</span>
                                            <span className="font-medium">{stable.name}</span>
                                            <Badge className="bg-green-100 text-green-700">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Stablecoin
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p>Pegged to: <span className="font-medium">{stable.peg}</span></p>
                                            <p>Issuer: <span className="font-medium">{stable.issuer}</span></p>
                                            <p>Type: <span className="font-medium capitalize">{stable.type}</span></p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">
                                        DTI: {generateCryptoAssetDTI(stable.symbol)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="networks" className="space-y-3">
                        {BLOCKCHAIN_NETWORKS.map((network) => (
                            <div key={network.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg mb-2">{network.name}</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <div>
                                                <span className="text-slate-600">Chain ID:</span>
                                                <span className="ml-2 font-mono">{network.chainId || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Type:</span>
                                                <span className="ml-2 capitalize">{network.type}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Consensus:</span>
                                                <span className="ml-2">{network.consensus}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Native Currency:</span>
                                                <span className="ml-2 font-mono">{network.nativeCurrency}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">ISO 23257</Badge>
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Coins className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm text-blue-900">Standards Integration</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                This registry integrates ISO 23257 (Blockchain/DLT), ISO 24165 (Digital Token Identifier), 
                                CoinMarketCap UCID, and CoinGecko API standards for comprehensive crypto asset identification.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}