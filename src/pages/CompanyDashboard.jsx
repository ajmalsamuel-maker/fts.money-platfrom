import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, TrendingUp, Trophy, LogOut, Menu, X, ChevronRight, Gift, Target, HelpCircle, Coins } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CompanyDashboard() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const { data: companyLink } = useQuery({
        queryKey: ['companyLink', session.id],
        queryFn: () => base44.entities.CompanyParticipantLink.filter({ participant_id: session.id }).then(links => links[0])
    });

    const { data: company } = useQuery({
        queryKey: ['company', companyLink?.company_id],
        queryFn: () => base44.entities.CompanyAccount.read(companyLink.company_id),
        enabled: !!companyLink?.company_id
    });

    const { data: teamMembers = [] } = useQuery({
        queryKey: ['teamMembers', company?.id],
        queryFn: () => base44.entities.CompanyParticipantLink.filter({ company_id: company.id }),
        enabled: !!company?.id
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform shadow-xl md:shadow-none",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center gap-2 text-white">
                        <Building2 className="h-6 w-6" />
                        <span className="font-bold text-sm">Company Hub</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/CompanyDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                        <Building2 className="h-4 w-4" />Dashboard
                    </a>
                    <a href="/CompanyLeaderboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4" />Leaderboard
                    </a>
                    <a href="/CompanyTeam" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Users className="h-4 w-4" />Team Members
                    </a>
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

            <div className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center px-6 sticky top-0 z-10">
                    <Button variant="ghost" size="icon" className="md:hidden mr-4" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">{company?.company_name || 'Loading...'}</h1>
                </header>

                <div className="p-6 max-w-6xl mx-auto">
                    {company ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-600">Total Points</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold">{company.total_points.toLocaleString()}</p>
                                        <Badge className="mt-2">Combined</Badge>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-600">Team Members</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold">{teamMembers.length}</p>
                                        <p className="text-xs text-gray-500 mt-2">Participating employees</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-600">Avg per Member</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold">
                                            {teamMembers.length > 0 ? Math.floor(company.total_points / teamMembers.length).toLocaleString() : '0'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">Points per person</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Company Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Industry</p>
                                            <p className="font-semibold">{company.industry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Employee Count</p>
                                            <p className="font-semibold">{company.employee_count || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <Badge className={company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                {company.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    {company.csr_goals && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">CSR Goals</p>
                                            <p className="text-gray-700">{company.csr_goals}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">Loading...</p>
                    )}
                </div>
            </div>
        </div>
    );
}