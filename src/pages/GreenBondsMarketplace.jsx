import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, DollarSign, Users, Calendar, Target, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

export default function GreenBondsMarketplace() {
    const [selectedBond, setSelectedBond] = useState(null);
    const [investAmount, setInvestAmount] = useState('');
    const queryClient = useQueryClient();

    const [user, setUser] = useState(null);
    React.useEffect(() => {
        const session = localStorage.getItem('consumer_session');
        if (session) setUser(JSON.parse(session));
    }, []);

    const { data: bonds = [] } = useQuery({
        queryKey: ['greenBonds'],
        queryFn: () => base44.entities.RWAAsset.filter({ 
            asset_class: 'green_bond',
            status: 'active'
        }),
    });

    const investMutation = useMutation({
        mutationFn: (data) => base44.entities.RWAOrder.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['greenBonds']);
            toast.success('Investment successful! Welcome to green finance.');
            setSelectedBond(null);
            setInvestAmount('');
        },
    });

    const handleInvest = () => {
        if (!user) {
            window.location.href = createPageUrl('ConsumerLogin');
            return;
        }
        investMutation.mutate({
            asset_id: selectedBond.id,
            investor_email: user.email,
            order_type: 'buy',
            quantity: parseFloat(investAmount) / selectedBond.current_value,
            total_amount: parseFloat(investAmount),
            status: 'pending'
        });
    };

    const projectTypes = {
        solar_farm: { icon: '☀️', color: 'from-yellow-500 to-orange-500' },
        wind_energy: { icon: '🌬️', color: 'from-blue-500 to-cyan-500' },
        reforestation: { icon: '🌳', color: 'from-green-600 to-emerald-600' },
        ocean_cleanup: { icon: '🌊', color: 'from-blue-600 to-teal-600' }
    };

    return (
        <>
            <ConsumerNavbar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Hero */}
                    <div className="text-center space-y-4">
                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                            RWA Green Bonds - Phase 3
                        </Badge>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Green Bond Marketplace
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Invest in tokenized environmental projects. Fractional ownership starts at $50.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">$2.5M</div>
                                <p className="text-sm text-slate-600">Total Value Locked</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-1">12</div>
                                <p className="text-sm text-slate-600">Active Projects</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-1">5.2%</div>
                                <p className="text-sm text-slate-600">Avg Annual Return</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-1">1.2K</div>
                                <p className="text-sm text-slate-600">Investors</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bonds Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bonds.map((bond) => {
                            const projectType = bond.asset_metadata?.project_type || 'solar_farm';
                            const fundingProgress = ((bond.total_value - (bond.asset_metadata?.remaining_amount || bond.total_value)) / bond.total_value) * 100;

                            return (
                                <Card key={bond.id} className="hover:shadow-xl transition-shadow border-2 border-slate-200">
                                    <CardHeader>
                                        <div className={`w-full h-40 rounded-lg bg-gradient-to-br ${projectTypes[projectType]?.color} flex items-center justify-center text-6xl mb-4`}>
                                            {projectTypes[projectType]?.icon}
                                        </div>
                                        <CardTitle className="text-lg">{bond.name}</CardTitle>
                                        <p className="text-sm text-slate-600">{bond.asset_metadata?.location}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Expected Return</span>
                                            <span className="font-bold text-green-600">{(bond.expected_return / 100).toFixed(1)}% APY</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Min Investment</span>
                                            <span className="font-bold">${bond.min_investment}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-slate-600">
                                                <span>Funding Progress</span>
                                                <span>{fundingProgress.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={fundingProgress} className="h-2" />
                                        </div>

                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {bond.asset_metadata?.maturity_years || 5}y
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                <Target className="h-3 w-3 mr-1" />
                                                {bond.asset_metadata?.co2_impact || '500t'} CO₂
                                            </Badge>
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                                                    onClick={() => setSelectedBond(bond)}
                                                >
                                                    Invest Now
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{bond.name}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-6">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-slate-600 mb-1">Project Type</p>
                                                            <p className="font-semibold">{projectType.replace('_', ' ').toUpperCase()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-600 mb-1">Location</p>
                                                            <p className="font-semibold">{bond.asset_metadata?.location}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-600 mb-1">Expected Return</p>
                                                            <p className="font-semibold text-green-600">{(bond.expected_return / 100).toFixed(1)}% APY</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-600 mb-1">Maturity</p>
                                                            <p className="font-semibold">{bond.asset_metadata?.maturity_years || 5} years</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-slate-600 mb-2">Description</p>
                                                        <p className="text-sm">{bond.asset_metadata?.description}</p>
                                                    </div>

                                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                        <div className="flex items-start gap-3">
                                                            <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
                                                            <div>
                                                                <h4 className="font-semibold text-green-900 mb-1">Environmental Impact</h4>
                                                                <p className="text-sm text-green-800">
                                                                    Estimated {bond.asset_metadata?.co2_impact || '500 tons'} CO₂ offset per year
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Investment Amount (USD)</label>
                                                        <Input 
                                                            type="number"
                                                            placeholder={`Min $${bond.min_investment}`}
                                                            value={investAmount}
                                                            onChange={(e) => setInvestAmount(e.target.value)}
                                                            min={bond.min_investment}
                                                        />
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            You'll receive {investAmount ? (parseFloat(investAmount) / bond.current_value).toFixed(4) : '0'} tokens
                                                        </p>
                                                    </div>

                                                    <Button 
                                                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                                                        onClick={handleInvest}
                                                        disabled={!investAmount || parseFloat(investAmount) < bond.min_investment}
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-2" />
                                                        Confirm Investment
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Info Banner */}
                    <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4">
                                <Info className="h-6 w-6 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg mb-2">How Green Bonds Work</h3>
                                    <p className="opacity-90">
                                        Green bonds are tokenized investments in environmental projects. You earn returns 
                                        from project revenue (solar energy sales, carbon credits) while making positive 
                                        environmental impact. All bonds are verified and secured on Polygon blockchain.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}