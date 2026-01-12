import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trophy, Menu, X, TrendingUp, TrendingDown, BarChart3, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyImpactIndex() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [newIndex, setNewIndex] = useState({
        reporting_period: '',
        index_score: 100,
        miles_sub_index: 100,
        inclusion_sub_index: 100,
        awareness_sub_index: 100,
        fundraising_sub_index: 100,
        baseline_year: '2027'
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

    const [selectedProgram, setSelectedProgram] = useState(programs[0]?.id || '');

    const { data: indices = [] } = useQuery({
        queryKey: ['impact-indices', selectedProgram],
        queryFn: async () => {
            const results = await base44.entities.ImpactIndex.filter({ program_id: selectedProgram });
            return results.sort((a, b) => b.reporting_period.localeCompare(a.reporting_period));
        },
        enabled: !!selectedProgram
    });

    const createIndexMutation = useMutation({
        mutationFn: (data) => base44.entities.ImpactIndex.create(data),
        onSuccess: () => {
            toast.success('Impact Index record created!');
            queryClient.invalidateQueries(['impact-indices']);
            setNewIndex({
                reporting_period: '',
                index_score: 100,
                miles_sub_index: 100,
                inclusion_sub_index: 100,
                awareness_sub_index: 100,
                fundraising_sub_index: 100,
                baseline_year: '2027'
            });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const calculatedScore = (
            0.4 * newIndex.miles_sub_index +
            0.3 * newIndex.inclusion_sub_index +
            0.2 * newIndex.awareness_sub_index +
            0.1 * newIndex.fundraising_sub_index
        );
        
        createIndexMutation.mutate({
            ...newIndex,
            program_id: selectedProgram,
            index_score: Math.round(calculatedScore * 100) / 100,
            calculated_date: new Date().toISOString()
        });
    };

    const latestIndex = indices[0];

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
                    <a href="/LoyaltyEarningRules" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Earning Rules</a>
                    <a href="/LoyaltyRewardsCatalog" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Rewards Catalog</a>
                    <a href="/LoyaltyChallenges" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Challenges</a>
                    <a href="/LoyaltyImpactIndex" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <BarChart3 className="h-4 w-4 inline mr-2" />Impact Index
                    </a>
                </nav>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Impact Index (IMI)</h1>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Current Index */}
                    {latestIndex && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Current Impact Index</span>
                                    <Badge className="text-lg px-4 py-2">{latestIndex.reporting_period}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <div className="text-5xl font-bold text-purple-600 mb-2">{latestIndex.index_score}</div>
                                    {latestIndex.year_over_year_change && (
                                        <div className={`flex items-center gap-2 ${latestIndex.year_over_year_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {latestIndex.year_over_year_change > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                            <span className="font-semibold">{Math.abs(latestIndex.year_over_year_change)}% vs previous period</span>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Miles (40%)</p>
                                        <p className="text-2xl font-bold text-blue-600">{latestIndex.miles_sub_index}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Inclusion (30%)</p>
                                        <p className="text-2xl font-bold text-green-600">{latestIndex.inclusion_sub_index}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Awareness (20%)</p>
                                        <p className="text-2xl font-bold text-purple-600">{latestIndex.awareness_sub_index}</p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Fundraising (10%)</p>
                                        <p className="text-2xl font-bold text-orange-600">{latestIndex.fundraising_sub_index}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Add New Index */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Record New Period</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Reporting Period</Label>
                                        <Input value={newIndex.reporting_period} onChange={(e) => setNewIndex({...newIndex, reporting_period: e.target.value})} placeholder="2027-Q1" required />
                                    </div>
                                    <div>
                                        <Label>Baseline Year</Label>
                                        <Input value={newIndex.baseline_year} onChange={(e) => setNewIndex({...newIndex, baseline_year: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label>Miles Sub-Index</Label>
                                        <Input type="number" value={newIndex.miles_sub_index} onChange={(e) => setNewIndex({...newIndex, miles_sub_index: Number(e.target.value)})} required />
                                    </div>
                                    <div>
                                        <Label>Inclusion Sub-Index</Label>
                                        <Input type="number" value={newIndex.inclusion_sub_index} onChange={(e) => setNewIndex({...newIndex, inclusion_sub_index: Number(e.target.value)})} required />
                                    </div>
                                    <div>
                                        <Label>Awareness Sub-Index</Label>
                                        <Input type="number" value={newIndex.awareness_sub_index} onChange={(e) => setNewIndex({...newIndex, awareness_sub_index: Number(e.target.value)})} required />
                                    </div>
                                    <div>
                                        <Label>Fundraising Sub-Index</Label>
                                        <Input type="number" value={newIndex.fundraising_sub_index} onChange={(e) => setNewIndex({...newIndex, fundraising_sub_index: Number(e.target.value)})} required />
                                    </div>
                                </div>
                                <Button type="submit" className="bg-purple-600">
                                    <Plus className="h-4 w-4 mr-2" />Record Period
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Historical Data */}
                    {indices.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Historical Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {indices.map(index => (
                                        <div key={index.id} className="border rounded-lg p-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">{index.reporting_period}</h3>
                                                <p className="text-sm text-slate-600">Index Score: {index.index_score}</p>
                                            </div>
                                            {index.trend && (
                                                <Badge className={index.trend === 'up' ? 'bg-green-100 text-green-800' : index.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}>
                                                    {index.trend}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}