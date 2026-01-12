import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Trophy, 
    Users, 
    Activity,
    Settings,
    LogOut,
    Plus,
    TrendingUp,
    Award,
    Target,
    BarChart3,
    Menu,
    X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LoyaltyCustomerPortal() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = createPageUrl('LoyaltyCustomerLogin');
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const { data: participants = [] } = useQuery({
        queryKey: ['my-participants'],
        queryFn: async () => {
            const allParticipants = [];
            for (const program of programs) {
                const p = await base44.entities.LoyaltyParticipant.filter({ program_id: program.id });
                allParticipants.push(...p);
            }
            return allParticipants;
        },
        enabled: programs.length > 0
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['my-activities'],
        queryFn: async () => {
            const allActivities = [];
            for (const program of programs) {
                const a = await base44.entities.ActivityLog.filter({ program_id: program.id }, '-created_date', 50);
                allActivities.push(...a);
            }
            return allActivities;
        },
        enabled: programs.length > 0
    });

    const totalTokensIssued = programs.reduce((sum, p) => sum + (p.total_tokens_issued || 0), 0);
    const totalTokensRedeemed = programs.reduce((sum, p) => sum + (p.total_tokens_redeemed || 0), 0);
    const totalParticipants = programs.reduce((sum, p) => sum + (p.total_participants || 0), 0);

    const handleLogout = () => {
        localStorage.removeItem('loyalty_customer_session');
        window.location.href = createPageUrl('LoyaltyCustomerLogin');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            {/* Sidebar */}
            <aside className={cn(
                "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-screen",
                "transform transition-transform duration-200",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="h-16 flex items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <span className="font-bold text-slate-900">Loyalty Portal</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600 mb-1">Organization</p>
                    <p className="font-semibold text-slate-900">{session.organization_name}</p>
                    <Badge className="mt-2 capitalize">{session.subscription_tier}</Badge>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="#overview" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <BarChart3 className="h-4 w-4 inline mr-2" />
                        Overview
                    </a>
                    <a href={createPageUrl('LoyaltyProgramManager')} className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4 inline mr-2" />
                        My Programs
                    </a>
                    <a href={createPageUrl('LoyaltyParticipantManager')} className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Users className="h-4 w-4 inline mr-2" />
                        Participants
                    </a>
                    <a href={createPageUrl('LoyaltyEarningRules')} className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Target className="h-4 w-4 inline mr-2" />
                        Earning Rules
                    </a>
                    <a href={createPageUrl('LoyaltyRedemptions')} className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Award className="h-4 w-4 inline mr-2" />
                        Redemptions
                    </a>
                    <a href={createPageUrl('LoyaltyAnalytics')} className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Activity className="h-4 w-4 inline mr-2" />
                        Analytics
                    </a>
                    <a href={createPageUrl('LoyaltySettings')} className="block px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Settings className="h-4 w-4 inline mr-2" />
                        Settings
                    </a>
                </nav>

                <div className="p-4 border-t">
                    <Button onClick={handleLogout} variant="outline" className="w-full text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Main Content */}
            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">Dashboard</h1>
                            <p className="text-xs text-slate-600">{session.organization_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => window.location.href = createPageUrl('LoyaltyProgramManager')}
                            className="bg-purple-600 hover:bg-purple-700"
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Program
                        </Button>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <Trophy className="h-8 w-8 text-purple-600 mb-2" />
                                <p className="text-sm text-slate-600">Active Programs</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{programs.filter(p => p.status === 'active').length}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Users className="h-8 w-8 text-blue-600 mb-2" />
                                <p className="text-sm text-slate-600">Total Participants</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{totalParticipants.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <TrendingUp className="h-8 w-8 text-emerald-600 mb-2" />
                                <p className="text-sm text-slate-600">Tokens Issued</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{(totalTokensIssued / 1000).toFixed(1)}K</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Activity className="h-8 w-8 text-amber-600 mb-2" />
                                <p className="text-sm text-slate-600">Redemption Rate</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {totalTokensIssued > 0 ? ((totalTokensRedeemed / totalTokensIssued) * 100).toFixed(0) : 0}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Button variant="outline" className="justify-start" onClick={() => window.location.href = createPageUrl('LoyaltyProgramManager')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Program
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => window.location.href = createPageUrl('LoyaltyEarningRules')}>
                                    <Target className="h-4 w-4 mr-2" />
                                    Add Earning Rule
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => window.location.href = createPageUrl('LoyaltyRedemptions')}>
                                    <Award className="h-4 w-4 mr-2" />
                                    Manage Rewards
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Programs List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Loyalty Programs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {programs.length === 0 ? (
                                <div className="text-center py-12">
                                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">No programs created yet</p>
                                    <Button 
                                        onClick={() => window.location.href = createPageUrl('LoyaltyProgramManager')}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Program
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {programs.map((program) => (
                                        <div 
                                            key={program.id}
                                            className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => window.location.href = createPageUrl('LoyaltyProgramDetail') + `?id=${program.id}`}
                                        >
                                            <div className="flex items-center gap-4 mb-3 md:mb-0">
                                                <div 
                                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                                                    style={{ backgroundColor: program.branding?.primary_color || '#8b5cf6' }}
                                                >
                                                    {program.token_symbol}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{program.program_name}</p>
                                                    <p className="text-sm text-slate-600">{program.token_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-600">Participants</p>
                                                    <p className="text-lg font-bold">{program.total_participants || 0}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-600">Tokens Issued</p>
                                                    <p className="text-lg font-bold">{((program.total_tokens_issued || 0) / 1000).toFixed(1)}K</p>
                                                </div>
                                                <Badge className={cn(
                                                    program.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                    program.status === 'provisioning' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                )}>
                                                    {program.status}
                                                </Badge>
                                            </div>
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