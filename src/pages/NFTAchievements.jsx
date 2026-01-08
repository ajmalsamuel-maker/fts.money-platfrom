import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Lock, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NFTAchievements() {
    const [user, setUser] = React.useState(null);
    
    React.useEffect(() => {
        const session = localStorage.getItem('consumer_session');
        if (session) setUser(JSON.parse(session));
    }, []);

    const { data: achievements = [] } = useQuery({
        queryKey: ['achievements', user?.email],
        queryFn: () => base44.entities.UserAchievement.filter({ user_email: user?.email }),
        enabled: !!user?.email,
    });

    const nftTiers = {
        bronze: { color: 'from-orange-400 to-orange-600', glow: 'shadow-orange-500' },
        silver: { color: 'from-slate-300 to-slate-500', glow: 'shadow-slate-400' },
        gold: { color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500' },
        platinum: { color: 'from-purple-400 to-pink-600', glow: 'shadow-purple-500' }
    };

    const badgeIcons = {
        tree_planter: '🌳',
        plastic_reducer: '♻️',
        transport_hero: '🚌',
        energy_saver: '💡',
        green_champion: '🏆',
        eco_warrior: '🌿',
        carbon_crusher: '💨',
        streak_master: '🔥',
        community_leader: '👥',
        task_creator: '⭐'
    };

    const allBadges = Object.keys(badgeIcons).map(type => ({
        type,
        name: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        icon: badgeIcons[type],
        earned: achievements.find(a => a.badge_type === type),
        description: `Master of ${type.replace('_', ' ')}`
    }));

    const handleMintNFT = async (badge) => {
        toast.success(`Minting ${badge.name} NFT on Polygon...`);
        // In production: call smart contract to mint NFT
        setTimeout(() => {
            toast.success('NFT minted! Check your wallet.');
        }, 2000);
    };

    return (
        <>
            <ConsumerNavbar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Hero */}
                    <div className="text-center space-y-4">
                        <h1 className="text-6xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Your Achievement NFTs
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Mint your sustainability achievements as NFTs. Own your impact on-chain.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">🏆</div>
                                <div className="text-3xl font-bold text-blue-600">{achievements.length}</div>
                                <p className="text-sm text-slate-600">Badges Earned</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">💎</div>
                                <div className="text-3xl font-bold text-cyan-600">{achievements.filter(a => a.badge_level === 'platinum').length}</div>
                                <p className="text-sm text-slate-600">Platinum NFTs</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">🔥</div>
                                <div className="text-3xl font-bold text-blue-600">{((achievements.length / allBadges.length) * 100).toFixed(0)}%</div>
                                <p className="text-sm text-slate-600">Collection Complete</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">⛓️</div>
                                <div className="text-3xl font-bold text-cyan-600">Polygon</div>
                                <p className="text-sm text-slate-600">Blockchain</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* NFT Grid */}
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {allBadges.map((badge) => {
                            const level = badge.earned?.badge_level || 'bronze';
                            const isLocked = !badge.earned;
                            const tier = nftTiers[level];

                            return (
                                <Card 
                                    key={badge.type} 
                                    className={`relative group transition-all duration-300 ${
                                        isLocked 
                                            ? 'bg-slate-100 border-slate-300' 
                                            : `bg-gradient-to-br ${tier.color} border-0 shadow-lg ${tier.glow}`
                                    } ${!isLocked && 'hover:scale-105 hover:shadow-2xl'}`}
                                >
                                    <CardContent className="p-6 text-center space-y-4">
                                        {isLocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
                                                <Lock className="h-12 w-12 text-slate-400" />
                                            </div>
                                        )}
                                        
                                        <div className={`text-6xl ${isLocked && 'opacity-30'}`}>
                                            {badge.icon}
                                        </div>
                                        
                                        <div>
                                            <h3 className={`font-bold ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                                {badge.name}
                                            </h3>
                                            {!isLocked && (
                                                <Badge className="mt-2 bg-white/20 text-white border-0">
                                                    {level.toUpperCase()}
                                                </Badge>
                                            )}
                                        </div>

                                        {!isLocked && (
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-center gap-1 text-xs text-white/80">
                                                    <Sparkles className="h-3 w-3" />
                                                    Progress: {badge.earned.progress}%
                                                </div>
                                                
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={() => handleMintNFT(badge)}
                                                    >
                                                        <Trophy className="h-3 w-3 mr-1" />
                                                        Mint NFT
                                                    </Button>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/20">
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/20">
                                                            <Share2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {isLocked && (
                                            <p className="text-xs text-slate-500">Complete tasks to unlock</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Info */}
                    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>About Achievement NFTs</h3>
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-2">✨ What are Achievement NFTs?</h4>
                                    <p className="text-slate-600">
                                        Your sustainability achievements minted as unique NFTs on Polygon blockchain. 
                                        Own, trade, and showcase your environmental impact.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">🎁 Benefits</h4>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                                        <li>Tradeable on OpenSea & other NFT marketplaces</li>
                                        <li>Unlock exclusive rewards & merchant discounts</li>
                                        <li>Governance rights in Project DAOs</li>
                                        <li>Verifiable proof of environmental contribution</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}