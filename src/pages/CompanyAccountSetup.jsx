import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowRight, Trophy, TrendingUp, Gift, Target, HelpCircle, Coins, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function CompanyAccountSetup() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        company_email: '',
        industry: '',
        employee_count: '',
        registration_number: '',
        website: '',
        csr_goals: ''
    });
    const [step, setStep] = useState('info');
    const queryClient = useQueryClient();

    const tierColors = {
        bronze: 'bg-orange-100 text-orange-800',
        silver: 'bg-slate-200 text-slate-800',
        gold: 'bg-yellow-100 text-yellow-800',
        platinum: 'bg-purple-100 text-purple-800'
    };

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CompanyAccount.create({
            ...data,
            program_id: session.program_id,
            admin_email: session.participant_email,
            participant_count: 1
        }),
        onSuccess: (company) => {
            // Link participant to company
            base44.entities.CompanyParticipantLink.create({
                program_id: session.program_id,
                participant_id: session.id,
                company_id: company.id,
                role: 'admin'
            });
            toast.success('Company account created successfully!');
            queryClient.invalidateQueries(['company']);
            window.location.href = '/CompanyDashboard';
        },
        onError: (error) => {
            toast.error('Failed to create company account');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex">
            {/* Sidebar */}
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-purple-600 to-blue-600">
                    <div className="flex items-center gap-2 text-white">
                        <Trophy className="h-6 w-6" />
                        <span className="font-bold text-sm">My Rewards</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600">Welcome</p>
                    <p className="font-semibold">{session.full_name}</p>
                    <Badge className={cn("mt-2 capitalize", tierColors[session.current_tier])}>{session.current_tier} Tier</Badge>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/ParticipantDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4" />Dashboard
                    </a>
                    <a href="/ParticipantActivities" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <TrendingUp className="h-4 w-4" />My Activities
                    </a>
                    <a href="/ParticipantRewards" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Gift className="h-4 w-4" />Redeem Rewards
                    </a>
                    <a href="/ParticipantChallenges" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Target className="h-4 w-4" />Challenges
                    </a>
                    <a href="/ParticipantHelp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <HelpCircle className="h-4 w-4" />Help & FAQ
                    </a>
                    <div className="border-t pt-2 mt-2">
                        <a href="/CompanyAccountSetup" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                            <Building2 className="h-4 w-4" />Company Account
                        </a>
                        <a href="/CompanyDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                            <TrendingUp className="h-4 w-4" />Company Dashboard
                        </a>
                        <a href="/CompanyLeaderboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                            <Coins className="h-4 w-4" />Leaderboard
                        </a>
                    </div>
                </nav>

                <div className="p-4 border-t">
                    <Button onClick={() => { 
                        localStorage.removeItem('participant_session'); 
                        window.location.href = '/ParticipantLogin'; 
                    }} variant="outline" className="w-full text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />Logout
                    </Button>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 text-sm">
                            <a href="/ParticipantDashboard" className="text-slate-600 hover:text-slate-900">Dashboard</a>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-900 font-medium">Create Company Account</span>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6">
            <Card className="max-w-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8" />
                        <div>
                            <CardTitle>Create Company Account</CardTitle>
                            <p className="text-sm text-indigo-100 mt-1">Compete with other companies and unlock team benefits</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Company Name *</Label>
                                <Input
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    placeholder="Acme Corp"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Company Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.company_email}
                                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                                    placeholder="company@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Industry</Label>
                                <Input
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    placeholder="Technology"
                                />
                            </div>
                            <div>
                                <Label>Employee Count</Label>
                                <Input
                                    type="number"
                                    value={formData.employee_count}
                                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                                    placeholder="500"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Registration Number</Label>
                            <Input
                                value={formData.registration_number}
                                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                                placeholder="REG-123456"
                            />
                        </div>

                        <div>
                            <Label>Website</Label>
                            <Input
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div>
                            <Label>CSR Goals (Optional)</Label>
                            <Textarea
                                value={formData.csr_goals}
                                onChange={(e) => setFormData({ ...formData, csr_goals: e.target.value })}
                                placeholder="What are your company's social responsibility goals?"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Account'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
                </div>
            </div>
        </div>
    );
}