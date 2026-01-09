import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Package, Save, Plus, CheckCircle, AlertCircle, Code } from 'lucide-react';

export default function RWATokenizationServiceConfig() {
    const { platformUser } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('networks');

    const [blockchainNetworks, setBlockchainNetworks] = useState([
        { id: 1, name: 'Ethereum Mainnet', chainId: 1, enabled: true, rpcUrl: 'https://eth.llamarpc.com', status: 'connected' },
        { id: 2, name: 'Polygon', chainId: 137, enabled: true, rpcUrl: 'https://polygon-rpc.com', status: 'connected' },
        { id: 3, name: 'Base', chainId: 8453, enabled: true, rpcUrl: 'https://mainnet.base.org', status: 'connected' },
        { id: 4, name: 'Avalanche', chainId: 43114, enabled: false, rpcUrl: '', status: 'disconnected' }
    ]);

    const [contractTemplates, setContractTemplates] = useState([
        { id: 1, name: 'ERC-3643 Security Token', type: 'security_token', audited: true, deployed: 15 },
        { id: 2, name: 'Real Estate Asset Token', type: 'real_estate', audited: true, deployed: 8 },
        { id: 3, name: 'Treasury Bill Token', type: 'treasury', audited: true, deployed: 12 },
        { id: 4, name: 'Private Credit Token', type: 'credit', audited: false, deployed: 0 }
    ]);

    const [assetSchemas, setAssetSchemas] = useState([
        { id: 1, name: 'Real Estate Schema', fields: 12, required: 8, validation: 'strict' },
        { id: 2, name: 'Treasury Bill Schema', fields: 8, required: 6, validation: 'strict' },
        { id: 3, name: 'Commodity Schema', fields: 10, required: 7, validation: 'lenient' }
    ]);

    const [custodySettings, setCustodySettings] = useState({
        provider: 'fireblocks',
        mpc_enabled: true,
        vault_account_id: 'vault_prod_001',
        api_key_configured: true,
        webhook_url: 'https://rwa.fts.money/webhooks/fireblocks'
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="RWATokenizationServiceConfig"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Package className="h-8 w-8 text-blue-600" />
                            RWA Tokenization Service Configuration
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Configure blockchain networks, smart contract templates, asset schemas, and custody integration
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="networks">Blockchain Networks</TabsTrigger>
                            <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
                            <TabsTrigger value="schemas">Asset Schemas</TabsTrigger>
                            <TabsTrigger value="custody">Custody Integration</TabsTrigger>
                        </TabsList>

                        <TabsContent value="networks" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Supported Blockchain Networks</CardTitle>
                                    <CardDescription>
                                        Enable and configure blockchain networks for asset tokenization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {blockchainNetworks.map(network => (
                                            <div key={network.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {network.status === 'connected' ? (
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900">{network.name}</p>
                                                            <p className="text-sm text-slate-600">Chain ID: {network.chainId}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={network.status === 'connected' ? "default" : "secondary"}>
                                                            {network.status}
                                                        </Badge>
                                                        <Switch 
                                                            checked={network.enabled}
                                                            onCheckedChange={(checked) => {
                                                                setBlockchainNetworks(blockchainNetworks.map(n => 
                                                                    n.id === network.id ? {...n, enabled: checked} : n
                                                                ));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {network.enabled && (
                                                    <div className="space-y-2 mt-3 pt-3 border-t">
                                                        <Label className="text-xs">RPC Endpoint</Label>
                                                        <Input 
                                                            value={network.rpcUrl} 
                                                            placeholder="https://..."
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Custom Network
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contracts" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Smart Contract Templates</CardTitle>
                                    <CardDescription>
                                        Manage reusable smart contract templates for different asset types
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {contractTemplates.map(template => (
                                            <div key={template.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <p className="font-medium text-slate-900">{template.name}</p>
                                                            {template.audited && (
                                                                <Badge className="bg-emerald-100 text-emerald-700">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Audited
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                                            <span>Type: <span className="font-medium">{template.type}</span></span>
                                                            <span>Deployed: <span className="font-medium">{template.deployed} times</span></span>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <Code className="h-4 w-4 mr-2" />
                                                        View Code
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload Contract Template
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schemas" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Asset Metadata Schemas</CardTitle>
                                    <CardDescription>
                                        Define validation schemas for different asset types
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {assetSchemas.map(schema => (
                                            <div key={schema.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{schema.name}</p>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                                                            <span>{schema.fields} fields</span>
                                                            <span>{schema.required} required</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {schema.validation}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Edit Schema
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create New Schema
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="custody" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Custody Provider Integration</CardTitle>
                                    <CardDescription>
                                        Configure institutional custody for tokenized assets
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Custody Provider</Label>
                                            <select className="w-full mt-1 px-3 py-2 border rounded-md" value={custodySettings.provider}>
                                                <option value="fireblocks">Fireblocks</option>
                                                <option value="copper">Copper</option>
                                                <option value="anchorage">Anchorage Digital</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900">MPC Wallet Technology</p>
                                                <p className="text-sm text-slate-600">Multi-party computation for key management</p>
                                            </div>
                                            <Switch 
                                                checked={custodySettings.mpc_enabled}
                                                onCheckedChange={(checked) => setCustodySettings({...custodySettings, mpc_enabled: checked})}
                                            />
                                        </div>

                                        <div>
                                            <Label>Vault Account ID</Label>
                                            <Input 
                                                value={custodySettings.vault_account_id} 
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label>Webhook URL</Label>
                                            <Input 
                                                value={custodySettings.webhook_url} 
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                <div>
                                                    <p className="font-medium text-emerald-900">API Keys Configured</p>
                                                    <p className="text-sm text-emerald-700">Fireblocks integration is active</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Custody Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}