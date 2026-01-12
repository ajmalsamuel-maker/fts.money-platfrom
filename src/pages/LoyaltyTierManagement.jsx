import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Menu, X, Crown, Star, Award, Users } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LoyaltyTierManagement() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState('');

    React.useEffect(() => {
        if (!session?.admin_email) {
            window.location.href = '/LoyaltyCustomerLogin';
        }
    }, [session?.admin_email]);

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session?.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email }),
        enabled: !!(session?.admin_email)
    });

    React.useEffect(() => {
        if (programs.length > 0 && !selectedProgram) {
            setSelectedProgram(programs[0].id);
        }
    }, [programs, selectedProgram]);

    if (!session?.admin_email) return null;

    const { data: participants = [] } = useQuery({
        queryKey: ['participants', selectedProgram],
        queryFn: () => base44.entities.LoyaltyParticipant.filter({ program_id: selectedProgram }),
        enabled: !!selectedProgram
    });

    const tierStats = {
        bronze: participants.filter(p => p.current_tier === 'bronze').length,
        silver: participants.filter(p => p.current_tier === 'silver').length,
        gold: participants.filter(p => p.current_tier === 'gold').length,
        platinum: participants.filter(p => p.current_tier === 'platinum').length
    };

    const tierConfig = [
        { 
            name: 'Bronze', 
            key: 'bronze', 
            color: 'bg-orange-100 text-orange-800 border-orange-300', 
            icon: Star, 
            description: 'Entry level - welcome bonus',
            benefits: ['1x points earning rate', 'Basic rewards access', 'Community access']
        },
        { 
            name: 'Silver', 
            key: 'silver', 
            color: 'bg-slate-200 text-slate-800 border-slate-400', 
            icon: Award, 
            description: '500+ lifetime points',
            benefits: ['1.25x points earning rate', 'Priority rewards', 'Event early access']
        },
        { 
            name: 'Gold', 
            key: 'gold', 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-400', 
            icon: Trophy, 
            description: '2,000+ lifetime points',
            benefits: ['1.5x points earning rate', 'Premium rewards', 'VIP experiences', 'Personal dashboard']
        },
        { 
            name: 'Platinum', 
            key: 'platinum', 
            color: 'bg-purple-100 text-purple-800 border-purple-400', 
            icon: Crown, 
            description: '10,000+ lifetime points',
            benefits: ['2x points earning rate', 'Exclusive rewards', 'Impact allocation', 'Founder events']
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen md:h-auto transform transition-transform",
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
                    <a href="/LoyaltyCustomerPortal" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Overview</a>
                    <a href="/LoyaltyAchievements" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Badges & Achievements</a>
                    <a href="/LoyaltyTierManagement" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <Crown className="h-4 w-4 inline mr-2" />Tier Management
                    </a>
                    <a href="/LoyaltyEarningRules" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Earning Rules</a>
                </nav>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Tier Management</h1>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tierConfig.map(tier => (
                            <Card key={tier.key}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <tier.icon className="h-5 w-5" />
                                        <h3 className="font-semibold">{tier.name}</h3>
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{tierStats[tier.key]}</div>
                                    <p className="text-xs text-slate-600">participants</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tierConfig.map(tier => {
                            const Icon = tier.icon;
                            return (
                                <Card key={tier.key} className={cn("border-2", tier.color)}>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-8 w-8" />
                                            <div>
                                                <CardTitle>{tier.name} Tier</CardTitle>
                                                <p className="text-sm text-slate-600">{tier.description}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Current Members</span>
                                                <Badge className={tier.color}>{tierStats[tier.key]}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm">Benefits</h4>
                                            <ul className="space-y-1">
                                                {tier.benefits.map((benefit, idx) => (
                                                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                        <span className="text-green-600 mt-0.5">✓</span>
                                                        {benefit}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}