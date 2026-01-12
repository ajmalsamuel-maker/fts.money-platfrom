import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WalletWidget from '@/components/loyalty/WalletWidget';
import { Trophy, Users, Activity, Settings, LogOut, Plus, Menu, X, Target } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LoyaltyCustomerPortal() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const totalTokensIssued = programs.reduce((sum, p) => sum + (p.total_tokens_issued || 0), 0);
    const totalParticipants = programs.reduce((sum, p) => sum + (p.total_participants || 0), 0);

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
                    <a href="/LoyaltyCustomerPortal" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <Activity className="h-4 w-4 inline mr-2" />Overview
                    </a>
                    <a href="/LoyaltyLeaderboards" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4 inline mr-2" />Leaderboards
                    </a>
                    <a href="/LoyaltyChallenges" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Target className="h-4 w-4 inline mr-2" />Challenges
                    </a>
                    <a href="/LoyaltyRedemptionCatalog" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Activity className="h-4 w-4 inline mr-2" />Redemption Catalog
                    </a>
                    <a href="/LoyaltyRedemptionApprovals" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Activity className="h-4 w-4 inline mr-2" />Redemption Approvals
                    </a>
                    <a href="/LoyaltyTokenManager" className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Activity className="h-4 w-4 inline mr-2" />Blockchain Tokens
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
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Wallet Widget */}
                    {programs.length > 0 && programs[0].blockchain_network && (
                        <WalletWidget 
                            programId={programs[0].id}
                            participantId={session.admin_email}
                        />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <Trophy className="h-8 w-8 text-purple-600 mb-2" />
                                <p className="text-sm text-slate-600">Programs</p>
                                <p className="text-3xl font-bold">{programs.length}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Users className="h-8 w-8 text-blue-600 mb-2" />
                                <p className="text-sm text-slate-600">Participants</p>
                                <p className="text-3xl font-bold">{totalParticipants.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Activity className="h-8 w-8 text-emerald-600 mb-2" />
                                <p className="text-sm text-slate-600">Tokens Issued</p>
                                <p className="text-3xl font-bold">{(totalTokensIssued / 1000).toFixed(1)}K</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Your Programs</CardTitle>
                                <Button className="bg-purple-600" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />New Program
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {programs.length === 0 ? (
                                <div className="text-center py-12">
                                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600">No programs yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {programs.map((program) => (
                                        <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                    {program.token_symbol}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{program.program_name}</p>
                                                    <p className="text-sm text-slate-600">{program.token_name}</p>
                                                </div>
                                            </div>
                                            <Badge className={program.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>
                                                {program.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}