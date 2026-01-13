import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Users, Activity, Settings, LogOut, Menu, X, Target, Coins, Rocket, ExternalLink, Copy, TrendingUp, Shield, Lock, Zap, Clock, FileText, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyTokenManager() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [deployDialog, setDeployDialog] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [contractConfig, setContractConfig] = useState({
        // Basic Info
        token_name: '',
        token_symbol: '',
        initial_supply: 1000000,
        max_supply: 0,
        decimals: 18,
        
        // Features
        mintable: true,
        burnable: true,
        pausable: true,
        freezable: false,
        
        // Access Control
        owner_can_mint: true,
        owner_can_burn: true,
        owner_can_pause: true,
        multi_sig_required: false,
        required_signatures: 2,
        
        // Transfer Controls
        transfer_restrictions: false,
        whitelist_enabled: false,
        blacklist_enabled: false,
        max_transaction_amount: 0,
        cooldown_period: 0,
        
        // Tokenomics
        transfer_fee_enabled: false,
        transfer_fee_percentage: 0,
        fee_recipient: '',
        reflection_enabled: false,
        
        // Vesting
        vesting_enabled: false,
        vesting_schedules: [],
        
        // Metadata
        contract_description: '',
        website_url: '',
        documentation_url: ''
    });
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const { data: tokens = [] } = useQuery({
        queryKey: ['all-tokens', session.admin_email],
        queryFn: async () => {
            const programIds = programs.map(p => p.id);
            if (programIds.length === 0) return [];
            const allTokens = await Promise.all(
                programIds.map(id => base44.entities.LoyaltyToken.filter({ program_id: id }))
            );
            return allTokens.flat();
        },
        enabled: programs.length > 0
    });

    const deployMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('deployLoyaltyToken', data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success('Token deployed successfully!');
            queryClient.invalidateQueries(['all-tokens']);
            setDeployDialog(false);
        },
        onError: (error) => {
            toast.error('Deployment failed: ' + error.message);
        }
    });

    const handleDeploy = (e) => {
        e.preventDefault();
        deployMutation.mutate({
            program_id: selectedProgram,
            ...contractConfig
        });
    };
    
    const updateConfig = (field, value) => {
        setContractConfig(prev => ({ ...prev, [field]: value }));
    };

    const copyAddress = (address) => {
        navigator.clipboard.writeText(address);
        toast.success('Address copied!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            <aside className={cn("fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <span className="font-bold">Loyalty Portal</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600">Organization</p>
                    <p className="font-semibold">{session.organization_name}</p>
                    <Badge className="mt-2 capitalize">{session.subscription_tier}</Badge>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/LoyaltyCustomerPortal" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Activity className="h-4 w-4 inline mr-2" />Overview
                    </a>
                    <a href="/LoyaltyLeaderboards" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4 inline mr-2" />Leaderboards
                    </a>
                    <a href="/LoyaltyChallenges" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Target className="h-4 w-4 inline mr-2" />Challenges
                    </a>
                    <a href="/LoyaltyTokenManager" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <Coins className="h-4 w-4 inline mr-2" />Blockchain Tokens
                    </a>
                    <a href="#settings" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Settings className="h-4 w-4 inline mr-2" />Settings
                    </a>
                </nav>

                <div className="p-4 border-t">
                    <Button onClick={() => { localStorage.removeItem('loyalty_customer_session'); window.location.href = '/LoyaltyCustomerLogin'; }} 
                        variant="outline" className="w-full text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />Logout
                    </Button>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Blockchain Token Manager</h1>
                    </div>
                    <Dialog open={deployDialog} onOpenChange={setDeployDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                                <Rocket className="h-4 w-4 mr-2" />Deploy Token
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Smart Contract Builder</DialogTitle>
                                <p className="text-sm text-slate-600">Configure your loyalty token smart contract</p>
                            </DialogHeader>
                            <form onSubmit={handleDeploy}>
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-5">
                                        <TabsTrigger value="basic">Basic</TabsTrigger>
                                        <TabsTrigger value="features">Features</TabsTrigger>
                                        <TabsTrigger value="access">Access</TabsTrigger>
                                        <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                                        <TabsTrigger value="metadata">Metadata</TabsTrigger>
                                    </TabsList>

                                    {/* Basic Configuration */}
                                    <TabsContent value="basic" className="space-y-4">
                                        <div>
                                            <Label>Select Program</Label>
                                            <select 
                                                className="w-full p-2 border rounded-md"
                                                onChange={(e) => setSelectedProgram(e.target.value)}
                                                required
                                            >
                                                <option value="">Choose a program</option>
                                                {programs.filter(p => !tokens.find(t => t.program_id === p.id)).map(p => (
                                                    <option key={p.id} value={p.id}>{p.program_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Token Name</Label>
                                                <Input 
                                                    value={contractConfig.token_name}
                                                    onChange={(e) => updateConfig('token_name', e.target.value)}
                                                    placeholder="RunMiles Token" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <Label>Token Symbol</Label>
                                                <Input 
                                                    value={contractConfig.token_symbol}
                                                    onChange={(e) => updateConfig('token_symbol', e.target.value)}
                                                    placeholder="RUN" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Initial Supply</Label>
                                                <Input 
                                                    value={contractConfig.initial_supply}
                                                    onChange={(e) => updateConfig('initial_supply', parseInt(e.target.value))}
                                                    type="number" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <Label>Max Supply (0 = unlimited)</Label>
                                                <Input 
                                                    value={contractConfig.max_supply}
                                                    onChange={(e) => updateConfig('max_supply', parseInt(e.target.value))}
                                                    type="number" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Decimals</Label>
                                            <Input 
                                                value={contractConfig.decimals}
                                                onChange={(e) => updateConfig('decimals', parseInt(e.target.value))}
                                                type="number"
                                                min="0"
                                                max="18"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Standard is 18 (like ETH)</p>
                                        </div>
                                    </TabsContent>

                                    {/* Features */}
                                    <TabsContent value="features" className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Coins className="h-5 w-5 text-purple-600" />
                                                    <div>
                                                        <Label>Mintable</Label>
                                                        <p className="text-xs text-slate-500">Allow creating new tokens</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={contractConfig.mintable}
                                                    onCheckedChange={(checked) => updateConfig('mintable', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Zap className="h-5 w-5 text-orange-600" />
                                                    <div>
                                                        <Label>Burnable</Label>
                                                        <p className="text-xs text-slate-500">Allow destroying tokens</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={contractConfig.burnable}
                                                    onCheckedChange={(checked) => updateConfig('burnable', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Lock className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <Label>Pausable</Label>
                                                        <p className="text-xs text-slate-500">Ability to pause all transfers</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={contractConfig.pausable}
                                                    onCheckedChange={(checked) => updateConfig('pausable', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                                    <div>
                                                        <Label>Freezable Accounts</Label>
                                                        <p className="text-xs text-slate-500">Freeze specific addresses</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={contractConfig.freezable}
                                                    onCheckedChange={(checked) => updateConfig('freezable', checked)}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Access Control */}
                                    <TabsContent value="access" className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                            <div className="flex gap-2">
                                                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-sm text-blue-900">Access Control Settings</h4>
                                                    <p className="text-xs text-blue-700">Define who can perform critical operations</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <Label>Owner Can Mint</Label>
                                                <Switch 
                                                    checked={contractConfig.owner_can_mint}
                                                    onCheckedChange={(checked) => updateConfig('owner_can_mint', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <Label>Owner Can Burn</Label>
                                                <Switch 
                                                    checked={contractConfig.owner_can_burn}
                                                    onCheckedChange={(checked) => updateConfig('owner_can_burn', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <Label>Owner Can Pause</Label>
                                                <Switch 
                                                    checked={contractConfig.owner_can_pause}
                                                    onCheckedChange={(checked) => updateConfig('owner_can_pause', checked)}
                                                />
                                            </div>

                                            <div className="border rounded-lg p-3 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label>Multi-Signature Required</Label>
                                                    <Switch 
                                                        checked={contractConfig.multi_sig_required}
                                                        onCheckedChange={(checked) => updateConfig('multi_sig_required', checked)}
                                                    />
                                                </div>
                                                {contractConfig.multi_sig_required && (
                                                    <div>
                                                        <Label>Required Signatures</Label>
                                                        <Input 
                                                            type="number"
                                                            min="2"
                                                            value={contractConfig.required_signatures}
                                                            onChange={(e) => updateConfig('required_signatures', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Tokenomics */}
                                    <TabsContent value="tokenomics" className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="border rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Transfer Fee</Label>
                                                        <p className="text-xs text-slate-500">Charge fee on each transfer</p>
                                                    </div>
                                                    <Switch 
                                                        checked={contractConfig.transfer_fee_enabled}
                                                        onCheckedChange={(checked) => updateConfig('transfer_fee_enabled', checked)}
                                                    />
                                                </div>
                                                {contractConfig.transfer_fee_enabled && (
                                                    <>
                                                        <div>
                                                            <Label>Fee Percentage</Label>
                                                            <Input 
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                value={contractConfig.transfer_fee_percentage}
                                                                onChange={(e) => updateConfig('transfer_fee_percentage', parseFloat(e.target.value))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Fee Recipient Address</Label>
                                                            <Input 
                                                                placeholder="0x..."
                                                                value={contractConfig.fee_recipient}
                                                                onChange={(e) => updateConfig('fee_recipient', e.target.value)}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="border rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Transfer Restrictions</Label>
                                                        <p className="text-xs text-slate-500">Limit who can transfer</p>
                                                    </div>
                                                    <Switch 
                                                        checked={contractConfig.transfer_restrictions}
                                                        onCheckedChange={(checked) => updateConfig('transfer_restrictions', checked)}
                                                    />
                                                </div>
                                                {contractConfig.transfer_restrictions && (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-sm">Whitelist Mode</Label>
                                                            <Switch 
                                                                checked={contractConfig.whitelist_enabled}
                                                                onCheckedChange={(checked) => updateConfig('whitelist_enabled', checked)}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-sm">Blacklist Mode</Label>
                                                            <Switch 
                                                                checked={contractConfig.blacklist_enabled}
                                                                onCheckedChange={(checked) => updateConfig('blacklist_enabled', checked)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Max Transaction Amount (0 = no limit)</Label>
                                                            <Input 
                                                                type="number"
                                                                value={contractConfig.max_transaction_amount}
                                                                onChange={(e) => updateConfig('max_transaction_amount', parseInt(e.target.value))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Cooldown Period (seconds)</Label>
                                                            <Input 
                                                                type="number"
                                                                value={contractConfig.cooldown_period}
                                                                onChange={(e) => updateConfig('cooldown_period', parseInt(e.target.value))}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <Label>Reflection Mechanism</Label>
                                                    <p className="text-xs text-slate-500">Reward holders on each transaction</p>
                                                </div>
                                                <Switch 
                                                    checked={contractConfig.reflection_enabled}
                                                    onCheckedChange={(checked) => updateConfig('reflection_enabled', checked)}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Metadata */}
                                    <TabsContent value="metadata" className="space-y-4">
                                        <div>
                                            <Label>Contract Description</Label>
                                            <Textarea 
                                                placeholder="Describe the purpose of this token..."
                                                rows={4}
                                                value={contractConfig.contract_description}
                                                onChange={(e) => updateConfig('contract_description', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Website URL</Label>
                                            <Input 
                                                type="url"
                                                placeholder="https://yourprogram.com"
                                                value={contractConfig.website_url}
                                                onChange={(e) => updateConfig('website_url', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Documentation URL</Label>
                                            <Input 
                                                type="url"
                                                placeholder="https://docs.yourprogram.com"
                                                value={contractConfig.documentation_url}
                                                onChange={(e) => updateConfig('documentation_url', e.target.value)}
                                            />
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex gap-2">
                                                <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-sm text-yellow-900">Contract Summary</h4>
                                                    <ul className="text-xs text-yellow-800 mt-2 space-y-1">
                                                        <li>• Token: {contractConfig.token_symbol || 'N/A'}</li>
                                                        <li>• Supply: {contractConfig.initial_supply.toLocaleString()} (Max: {contractConfig.max_supply || 'Unlimited'})</li>
                                                        <li>• Features: {[
                                                            contractConfig.mintable && 'Mintable',
                                                            contractConfig.burnable && 'Burnable',
                                                            contractConfig.pausable && 'Pausable'
                                                        ].filter(Boolean).join(', ') || 'Standard'}</li>
                                                        <li>• Multi-sig: {contractConfig.multi_sig_required ? 'Yes' : 'No'}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex gap-3 mt-6">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setDeployDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600" disabled={deployMutation.isPending}>
                                        {deployMutation.isPending ? 'Deploying Contract...' : 'Deploy Smart Contract'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <Coins className="h-8 w-8 text-purple-600 mb-2" />
                                <p className="text-sm text-slate-600">Deployed Tokens</p>
                                <p className="text-3xl font-bold">{tokens.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                                <p className="text-sm text-slate-600">Total Supply</p>
                                <p className="text-3xl font-bold">
                                    {(tokens.reduce((sum, t) => sum + (t.total_supply || 0), 0) / 1000).toFixed(0)}K
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <Activity className="h-8 w-8 text-blue-600 mb-2" />
                                <p className="text-sm text-slate-600">In Circulation</p>
                                <p className="text-3xl font-bold">
                                    {(tokens.reduce((sum, t) => sum + (t.circulating_supply || 0), 0) / 1000).toFixed(1)}K
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Deployed Tokens */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Deployed Tokens</CardTitle>
                            <CardDescription>Your on-chain loyalty tokens</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tokens.length === 0 ? (
                                <div className="text-center py-12">
                                    <Coins className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-2">No tokens deployed yet</p>
                                    <p className="text-sm text-slate-500">Deploy your first blockchain token to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tokens.map((token) => {
                                        const program = programs.find(p => p.id === token.program_id);
                                        return (
                                            <div key={token.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                                            {token.token_symbol}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold">{token.token_name}</h3>
                                                                <Badge variant="secondary">{token.blockchain_network}</Badge>
                                                            </div>
                                                            <p className="text-sm text-slate-600 mb-2">{program?.program_name}</p>
                                                            
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                                <code className="bg-slate-100 px-2 py-1 rounded">
                                                                    {token.contract_address?.slice(0, 10)}...{token.contract_address?.slice(-8)}
                                                                </code>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6"
                                                                    onClick={() => copyAddress(token.contract_address)}
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6"
                                                                    onClick={() => window.open(`https://explorer.polygon.technology/address/${token.contract_address}`, '_blank')}
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            <div className="flex gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-slate-600">Total Supply: </span>
                                                                    <span className="font-semibold">{token.total_supply?.toLocaleString()}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-600">Circulating: </span>
                                                                    <span className="font-semibold">{token.circulating_supply?.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
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
        </div>
    );
}