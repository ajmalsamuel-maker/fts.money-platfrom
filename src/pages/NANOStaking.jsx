import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Lock, Unlock, Zap, Calendar, DollarSign, Vote } from 'lucide-react';
import { toast } from 'sonner';

export default function NANOStaking() {
    const [stakeAmount, setStakeAmount] = useState('');
    const [selectedTier, setSelectedTier] = useState('flexible');
    const queryClient = useQueryClient();

    const [user, setUser] = useState(null);
    React.useEffect(() => {
        const session = localStorage.getItem('consumer_session');
        if (session) setUser(JSON.parse(session));
    }, []);

    const { data: tokenBalance } = useQuery({
        queryKey: ['nanoTokens', user?.email],
        queryFn: () => base44.entities.NanoToken.filter({ user_email: user?.email }),
        enabled: !!user?.email,
    });

    const balance = tokenBalance?.[0]?.balance || 0;
    const staked = tokenBalance?.[0]?.staked_amount || 0;

    const stakeTiers = [
        {
            id: 'flexible',
            name: 'Flexible',
            apy: 8,
            lockPeriod: 0,
            benefits: ['Withdraw anytime', 'Base rewards', 'No lock period'],
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: '3month',
            name: '3 Months',
            apy: 15,
            lockPeriod: 90,
            benefits: ['15% APY', '1.5x task rewards', 'Early voting access'],
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: '6month',
            name: '6 Months',
            apy: 25,
            lockPeriod: 180,
            benefits: ['25% APY', '2x task rewards', 'Full voting rights', 'NFT boosts'],
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: '12month',
            name: '12 Months',
            apy: 40,
            lockPeriod: 365,
            benefits: ['40% APY', '3x task rewards', 'DAO governance', 'Exclusive airdrops', 'VIP merchant access'],
            color: 'from-yellow-500 to-orange-600'
        }
    ];

    const stakeMutation = useMutation({
        mutationFn: async () => {
            const currentToken = tokenBalance?.[0];
            return base44.entities.NanoToken.update(currentToken.id, {
                balance: balance - parseFloat(stakeAmount),
                staked_amount: staked + parseFloat(stakeAmount)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['nanoTokens']);
            toast.success(`Staked ${stakeAmount} NANO successfully!`);
            setStakeAmount('');
        },
    });

    const handleStake = () => {
        if (!stakeAmount || parseFloat(stakeAmount) > balance) {
            toast.error('Invalid amount');
            return;
        }
        stakeMutation.mutate();
    };

    const projectedEarnings = stakeAmount 
        ? (parseFloat(stakeAmount) * (stakeTiers.find(t => t.id === selectedTier)?.apy || 0)) / 100
        : 0;

    return (
        <>
            <ConsumerNavbar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Hero */}
                    <div className="text-center space-y-4">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            Phase 3 - DeFi Staking
                        </Badge>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Stake Your NANO Tokens
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Lock your tokens, earn passive income, and unlock governance rights
                        </p>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                            <CardContent className="p-6 text-center">
                                <Zap className="h-8 w-8 mx-auto mb-2" />
                                <div className="text-3xl font-bold">{balance.toFixed(2)}</div>
                                <p className="text-sm opacity-90">Available NANO</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                            <CardContent className="p-6 text-center">
                                <Lock className="h-8 w-8 mx-auto mb-2" />
                                <div className="text-3xl font-bold">{staked.toFixed(2)}</div>
                                <p className="text-sm opacity-90">Staked NANO</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                            <CardContent className="p-6 text-center">
                                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                                <div className="text-3xl font-bold">{((staked * 0.25) / 12).toFixed(2)}</div>
                                <p className="text-sm opacity-90">Monthly Earnings</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Staking Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stake NANO Tokens</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Amount to Stake</label>
                                        <div className="flex gap-2">
                                            <Input 
                                                type="number"
                                                placeholder="0.00"
                                                value={stakeAmount}
                                                onChange={(e) => setStakeAmount(e.target.value)}
                                                max={balance}
                                            />
                                            <Button 
                                                variant="outline"
                                                onClick={() => setStakeAmount(balance.toString())}
                                            >
                                                MAX
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Available: {balance.toFixed(2)} NANO</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-3 block">Select Staking Tier</label>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {stakeTiers.map((tier) => (
                                                <Card 
                                                    key={tier.id}
                                                    className={`cursor-pointer transition-all ${
                                                        selectedTier === tier.id 
                                                            ? 'ring-2 ring-purple-600 shadow-lg' 
                                                            : 'hover:shadow-md'
                                                    }`}
                                                    onClick={() => setSelectedTier(tier.id)}
                                                >
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold">{tier.name}</h4>
                                                                <p className="text-2xl font-bold text-purple-600">{tier.apy}% APY</p>
                                                            </div>
                                                            {tier.lockPeriod > 0 && (
                                                                <Badge variant="outline">
                                                                    <Calendar className="h-3 w-3 mr-1" />
                                                                    {tier.lockPeriod}d
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <ul className="space-y-1 text-xs text-slate-600">
                                                            {tier.benefits.map((benefit, i) => (
                                                                <li key={i} className="flex items-center gap-1">
                                                                    <span className="text-green-600">✓</span> {benefit}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>

                                    {stakeAmount && (
                                        <Card className="bg-purple-50 border-purple-200">
                                            <CardContent className="p-4">
                                                <h4 className="font-semibold mb-2">Projected Earnings</h4>
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <p className="text-2xl font-bold text-purple-600">
                                                            {(projectedEarnings / 12).toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-slate-600">Monthly</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-purple-600">
                                                            {(projectedEarnings / 4).toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-slate-600">Quarterly</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-purple-600">
                                                            {projectedEarnings.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-slate-600">Yearly</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Button 
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                        onClick={handleStake}
                                        disabled={!stakeAmount || parseFloat(stakeAmount) > balance}
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Stake {stakeAmount || '0'} NANO
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Staking Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Total Staked Platform-Wide</p>
                                        <p className="text-2xl font-bold">2.5M NANO</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Active Stakers</p>
                                        <p className="text-2xl font-bold">3,241</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">Average APY</p>
                                        <p className="text-2xl font-bold text-green-600">22%</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Vote className="h-5 w-5" />
                                        <h4 className="font-bold">Governance Rights</h4>
                                    </div>
                                    <p className="text-sm opacity-90">
                                        Stakers get voting rights on Project DAOs. Decide which green projects get funded!
                                    </p>
                                    <Button variant="outline" className="w-full bg-white text-purple-600 hover:bg-white/90">
                                        View Active Proposals
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}