import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Users, Activity, Settings, LogOut, Menu, X, Target, Coins, Rocket, ExternalLink, Copy, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyTokenManager() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [deployDialog, setDeployDialog] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
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
        const formData = new FormData(e.target);
        deployMutation.mutate({
            program_id: selectedProgram,
            token_name: formData.get('token_name'),
            token_symbol: formData.get('token_symbol'),
            initial_supply: parseInt(formData.get('initial_supply'))
        });
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
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Deploy Loyalty Token</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleDeploy} className="space-y-4">
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
                                <div>
                                    <Label>Token Name</Label>
                                    <Input name="token_name" placeholder="RunMiles Token" required />
                                </div>
                                <div>
                                    <Label>Token Symbol</Label>
                                    <Input name="token_symbol" placeholder="RUN" required />
                                </div>
                                <div>
                                    <Label>Initial Supply</Label>
                                    <Input name="initial_supply" type="number" defaultValue="1000000" required />
                                </div>
                                <Button type="submit" className="w-full" disabled={deployMutation.isPending}>
                                    {deployMutation.isPending ? 'Deploying...' : 'Deploy Contract'}
                                </Button>
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