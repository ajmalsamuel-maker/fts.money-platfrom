import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Trophy, Menu, Crown, Star, Award, Users, Gift, Zap, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyTierManagement() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [editDialog, setEditDialog] = useState(false);
    const [editingTier, setEditingTier] = useState(null);

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
            threshold: 0,
            multiplier: 1.0,
            description: 'Entry level - welcome bonus',
            benefits: ['1x points earning rate', 'Basic rewards access', 'Community access', 'Standard support'],
            perks: ['Monthly newsletter', 'Basic analytics dashboard']
        },
        { 
            name: 'Silver', 
            key: 'silver', 
            color: 'bg-slate-200 text-slate-800 border-slate-400', 
            icon: Award, 
            threshold: 500,
            multiplier: 1.25,
            description: '500+ lifetime points',
            benefits: ['1.25x points earning rate', 'Priority rewards', 'Event early access', 'Priority support'],
            perks: ['Exclusive challenges', 'Monthly bonus opportunities', 'Birthday rewards']
        },
        { 
            name: 'Gold', 
            key: 'gold', 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-400', 
            icon: Trophy, 
            threshold: 2000,
            multiplier: 1.5,
            description: '2,000+ lifetime points',
            benefits: ['1.5x points earning rate', 'Premium rewards', 'VIP experiences', 'Personal dashboard', 'Concierge support'],
            perks: ['Free reward shipping', 'Early product access', 'Quarterly bonus', 'Partner discounts']
        },
        { 
            name: 'Platinum', 
            key: 'platinum', 
            color: 'bg-purple-100 text-purple-800 border-purple-400', 
            icon: Crown, 
            threshold: 10000,
            multiplier: 2.0,
            description: '10,000+ lifetime points',
            benefits: ['2x points earning rate', 'Exclusive rewards', 'Impact allocation', 'Founder events', 'Dedicated account manager'],
            perks: ['VIP lounge access', 'Annual gift', 'Never-expire points', 'Custom experiences', 'NFT badges']
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltyTierManagement"
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

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
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-8 w-8" />
                                                <div>
                                                    <CardTitle>{tier.name} Tier</CardTitle>
                                                    <p className="text-sm text-slate-600">{tier.description}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800">{tier.multiplier}x</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Members</span>
                                                <Badge className={tier.color}>{tierStats[tier.key]}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">Threshold</span>
                                                <span className="font-medium">{tier.threshold.toLocaleString()} points</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">Earn Rate</span>
                                                <span className="font-medium text-purple-600">{tier.multiplier}x</span>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <h4 className="font-semibold mb-2 text-sm flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 text-purple-600" />
                                                Core Benefits
                                            </h4>
                                            <ul className="space-y-1">
                                                {tier.benefits.map((benefit, idx) => (
                                                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                                        <span className="text-green-600 mt-0.5">✓</span>
                                                        {benefit}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm flex items-center gap-1">
                                                <Gift className="h-3 w-3 text-blue-600" />
                                                Exclusive Perks
                                            </h4>
                                            <ul className="space-y-1">
                                                {tier.perks.map((perk, idx) => (
                                                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                                        <span className="text-blue-600 mt-0.5">•</span>
                                                        {perk}
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