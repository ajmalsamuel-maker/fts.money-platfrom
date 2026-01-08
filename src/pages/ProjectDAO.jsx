import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, ThumbsUp, ThumbsDown, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectDAO() {
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

    const votingPower = tokenBalance?.[0]?.staked_amount || 0;

    // Mock proposals
    const proposals = [
        {
            id: 1,
            title: 'Solar Farm Expansion in Kenya',
            description: 'Expand our existing 50MW solar farm to 100MW capacity, doubling clean energy production',
            requestedFunding: 500000,
            yesVotes: 1250000,
            noVotes: 320000,
            status: 'active',
            endDate: '2026-02-15',
            proposer: 'GreenEnergy DAO',
            category: 'solar_energy',
            impact: '500 tons CO₂ offset per year'
        },
        {
            id: 2,
            title: 'Ocean Plastic Cleanup Initiative',
            description: 'Deploy 10 autonomous cleanup vessels in the Pacific to remove 100,000kg of plastic annually',
            requestedFunding: 750000,
            yesVotes: 980000,
            noVotes: 450000,
            status: 'active',
            endDate: '2026-02-20',
            proposer: 'OceanSavers',
            category: 'ocean_cleanup',
            impact: '100,000kg plastic removed/year'
        },
        {
            id: 3,
            title: 'Reforestation in Amazon Rainforest',
            description: 'Plant 1 million trees across 500 hectares of deforested land in partnership with local communities',
            requestedFunding: 300000,
            yesVotes: 1800000,
            noVotes: 150000,
            status: 'passed',
            endDate: '2026-01-30',
            proposer: 'ForestGuardians',
            category: 'reforestation',
            impact: '1M trees planted, 2,000 tons CO₂/year'
        }
    ];

    const voteMutation = useMutation({
        mutationFn: async ({ proposalId, vote }) => {
            // In production: call smart contract
            toast.success(`Voted ${vote} on proposal #${proposalId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proposals']);
        },
    });

    const handleVote = (proposalId, vote) => {
        if (votingPower === 0) {
            toast.error('Stake NANO tokens to gain voting power');
            return;
        }
        voteMutation.mutate({ proposalId, vote });
    };

    const categoryIcons = {
        solar_energy: '☀️',
        wind_energy: '🌬️',
        reforestation: '🌳',
        ocean_cleanup: '🌊'
    };

    return (
        <>
            <ConsumerNavbar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Hero */}
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Green Project Governance
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Vote on which environmental projects receive funding. Your stake = your voice.
                        </p>
                    </div>

                    {/* Voting Power Card */}
                    <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Your Voting Power</p>
                                    <p className="text-4xl font-bold">{votingPower.toFixed(0)} votes</p>
                                    <p className="text-sm opacity-75 mt-1">Based on your staked NANO tokens</p>
                                </div>
                                <Vote className="h-16 w-16 opacity-50" />
                            </div>
                            {votingPower === 0 && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Stake NANO tokens to participate in governance</span>
                                    </div>
                                    <Button 
                                        className="mt-3 bg-white text-blue-600 hover:bg-white/90"
                                        onClick={() => window.location.href = createPageUrl('NANOStaking')}
                                    >
                                        Stake Now
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-1">12</div>
                                <p className="text-sm text-slate-600">Active Proposals</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">$8.5M</div>
                                <p className="text-sm text-slate-600">Funds Allocated</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-1">4,521</div>
                                <p className="text-sm text-slate-600">Active Voters</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-1">27</div>
                                <p className="text-sm text-slate-600">Projects Funded</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Proposals */}
                    <div className="space-y-6">
                        {proposals.map((proposal) => {
                            const totalVotes = proposal.yesVotes + proposal.noVotes;
                            const yesPercentage = (proposal.yesVotes / totalVotes) * 100;
                            const isActive = proposal.status === 'active';

                            return (
                                <Card key={proposal.id} className={`${isActive ? 'border-2 border-blue-200' : 'border-slate-200'}`}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="text-5xl">
                                                    {categoryIcons[proposal.category]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CardTitle className="text-xl">{proposal.title}</CardTitle>
                                                        <Badge className={
                                                            proposal.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                            proposal.status === 'passed' ? 'bg-green-100 text-green-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {proposal.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-3">{proposal.description}</p>
                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <TrendingUp className="h-4 w-4" />
                                                            <span>{proposal.impact}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <Users className="h-4 w-4" />
                                                            <span>by {proposal.proposer}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>Ends {new Date(proposal.endDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                    ${(proposal.requestedFunding / 1000).toFixed(0)}K
                                                </p>
                                                <p className="text-xs text-slate-600">Requested</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Voting Progress */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-600 font-medium">
                                                    YES: {((proposal.yesVotes / 1000).toFixed(0))}K votes ({yesPercentage.toFixed(1)}%)
                                                </span>
                                                <span className="text-red-600 font-medium">
                                                    NO: {((proposal.noVotes / 1000).toFixed(0))}K votes ({(100 - yesPercentage).toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="absolute left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                                    style={{ width: `${yesPercentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Vote Buttons */}
                                        {isActive && (
                                            <div className="flex gap-3 pt-2">
                                                <Button 
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                    onClick={() => handleVote(proposal.id, 'yes')}
                                                    disabled={votingPower === 0}
                                                >
                                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                                    Vote YES ({votingPower.toFixed(0)} votes)
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                                                    onClick={() => handleVote(proposal.id, 'no')}
                                                    disabled={votingPower === 0}
                                                >
                                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                                    Vote NO
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Info */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-3">How DAO Governance Works</h3>
                            <div className="grid md:grid-cols-3 gap-6 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-2">1️⃣ Stake Tokens</h4>
                                    <p className="text-slate-600">
                                        Stake your NANO tokens to gain voting power. 1 staked NANO = 1 vote.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">2️⃣ Vote on Proposals</h4>
                                    <p className="text-slate-600">
                                        Review green project proposals and vote YES or NO based on impact and feasibility.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">3️⃣ Projects Get Funded</h4>
                                    <p className="text-slate-600">
                                        If a proposal passes (>50% YES votes), it receives funding from the DAO treasury.
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