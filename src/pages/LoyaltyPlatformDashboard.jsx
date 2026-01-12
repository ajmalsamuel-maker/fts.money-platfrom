import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, TrendingUp, Activity, Plus, Menu, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LoyaltyPlatformDashboard() {
    const { platformUser, loading } = usePlatformAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: customers = [] } = useQuery({
        queryKey: ['loyalty-customers'],
        queryFn: () => base44.entities.LoyaltyCustomer.list('-created_date')
    });

    const { data: programs = [] } = useQuery({
        queryKey: ['loyalty-programs'],
        queryFn: () => base44.entities.LoyaltyProgram.list('-created_date')
    });

    const stats = {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.status === 'active').length,
        totalPrograms: programs.length,
        totalParticipants: programs.reduce((sum, p) => sum + (p.total_participants || 0), 0),
        totalTokensIssued: programs.reduce((sum, p) => sum + (p.total_tokens_issued || 0), 0)
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}
            
            <FTSPlatformSidebar 
                currentPage="LoyaltyPlatformDashboard" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="text-base md:text-lg font-semibold">FTS Loyalty Cloud</h2>
                            <p className="text-xs text-slate-600 hidden sm:block">White-label gamified loyalty engine</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher variant="select" showLabel={false} />
                        <Button onClick={() => window.location.href = createPageUrl('LoyaltyCustomerOnboarding')} className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600" size="sm">
                            <Plus className="h-4 w-4" />
                            <span className="hidden md:inline">New Customer</span>
                        </Button>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <Trophy className="h-8 w-8 mb-2 opacity-80" />
                                <p className="text-xs text-purple-100">Total Customers</p>
                                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
                                <p className="text-xs text-purple-100 mt-1">{stats.activeCustomers} active</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                                <Activity className="h-8 w-8 mb-2 opacity-80" />
                                <p className="text-xs text-blue-100">Programs</p>
                                <p className="text-3xl font-bold">{stats.totalPrograms}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                                <Users className="h-8 w-8 mb-2 opacity-80" />
                                <p className="text-xs text-emerald-100">Participants</p>
                                <p className="text-3xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <CardContent className="p-6">
                                <TrendingUp className="h-8 w-8 mb-2 opacity-80" />
                                <p className="text-xs text-amber-100">Tokens Issued</p>
                                <p className="text-3xl font-bold">{(stats.totalTokensIssued / 1000000).toFixed(2)}M</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Loyalty Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">No customers yet</p>
                                    <Button onClick={() => window.location.href = createPageUrl('LoyaltyCustomerOnboarding')} className="bg-purple-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Onboard First Customer
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {customers.map((customer) => (
                                        <Card key={customer.id} className="hover:shadow-lg transition-all cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                            <Building2 className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{customer.organization_name}</p>
                                                            <p className="text-xs text-slate-500">{customer.organization_type}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')}>
                                                        {customer.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Participants</p>
                                                        <p className="font-semibold">{customer.total_participants || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Tier</p>
                                                        <p className="font-semibold capitalize">{customer.subscription_tier}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
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