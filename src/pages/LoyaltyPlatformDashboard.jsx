import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Trophy, 
    Users, 
    TrendingUp, 
    Activity,
    Plus,
    Menu,
    Building2,
    Heart,
    Briefcase,
    GraduationCap,
    Stethoscope,
    ShoppingBag,
    Landmark
} from 'lucide-react';
import { cn } from "@/lib/utils";
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const organizationTypeIcons = {
    ngo: Heart,
    corporate: Briefcase,
    education: GraduationCap,
    healthcare: Stethoscope,
    retail: ShoppingBag,
    government: Landmark
};

export default function LoyaltyPlatformDashboard() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: customers = [] } = useQuery({
        queryKey: ['loyalty-customers'],
        queryFn: () => base44.entities.LoyaltyCustomer.list('-created_date')
    });

    const { data: programs = [] } = useQuery({
        queryKey: ['loyalty-programs'],
        queryFn: () => base44.entities.LoyaltyProgram.list('-created_date')
    });

    const { data: participants = [] } = useQuery({
        queryKey: ['loyalty-participants'],
        queryFn: () => base44.entities.LoyaltyParticipant.list()
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: () => base44.entities.ActivityLog.list('-created_date', 100)
    });

    const { data: redemptions = [] } = useQuery({
        queryKey: ['loyalty-redemptions'],
        queryFn: () => base44.entities.LoyaltyRedemption.list('-created_date', 100)
    });

    const stats = {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.status === 'active').length,
        totalPrograms: programs.length,
        activePrograms: programs.filter(p => p.status === 'active').length,
        totalParticipants: participants.length,
        totalTokensIssued: programs.reduce((sum, p) => sum + (p.total_tokens_issued || 0), 0),
        totalTokensRedeemed: programs.reduce((sum, p) => sum + (p.total_tokens_redeemed || 0), 0),
        totalRedemptionValue: programs.reduce((sum, p) => sum + (p.total_redemption_value || 0), 0),
        monthlyRevenue: customers.reduce((sum, c) => sum + (c.monthly_fee || 0), 0)
    };

    const customersByType = Object.entries(
        customers.reduce((acc, c) => {
            acc[c.organization_type] = (acc[c.organization_type] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            
            <FTSPlatformSidebar 
                currentPage="LoyaltyPlatformDashboard" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden flex-shrink-0"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">FTS Loyalty & Impact Platform</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">White-label gamified loyalty engine</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <LanguageSwitcher variant="select" showLabel={false} />
                        <Button 
                            onClick={() => window.location.href = createPageUrl('LoyaltyCustomerOnboarding')}
                            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            size="sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden md:inline">New Customer</span>
                        </Button>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Trophy className="h-8 w-8 opacity-80" />
                                    <Badge className="bg-white/20 text-white">Live</Badge>
                                </div>
                                <p className="text-xs text-purple-100 mb-1">Total Customers</p>
                                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
                                <p className="text-xs text-purple-100 mt-1">{stats.activeCustomers} active</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Activity className="h-8 w-8 opacity-80" />
                                    <Badge className="bg-white/20 text-white">Programs</Badge>
                                </div>
                                <p className="text-xs text-blue-100 mb-1">Loyalty Programs</p>
                                <p className="text-3xl font-bold">{stats.totalPrograms}</p>
                                <p className="text-xs text-blue-100 mt-1">{stats.activePrograms} active</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Users className="h-8 w-8 opacity-80" />
                                </div>
                                <p className="text-xs text-emerald-100 mb-1">Total Participants</p>
                                <p className="text-3xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
                                <p className="text-xs text-emerald-100 mt-1">Across all programs</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="h-8 w-8 opacity-80" />
                                </div>
                                <p className="text-xs text-amber-100 mb-1">Monthly Revenue</p>
                                <p className="text-3xl font-bold">${(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-amber-100 mt-1">MRR from loyalty SaaS</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Token Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Tokens Issued</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{(stats.totalTokensIssued / 1000000).toFixed(2)}M</p>
                                        <p className="text-xs text-slate-500 mt-1">Lifetime across all programs</p>
                                    </div>
                                    <Trophy className="h-10 w-10 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Tokens Redeemed</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{(stats.totalTokensRedeemed / 1000000).toFixed(2)}M</p>
                                        <p className="text-xs text-emerald-600 mt-1">{((stats.totalTokensRedeemed / stats.totalTokensIssued) * 100).toFixed(0)}% redemption rate</p>
                                    </div>
                                    <Activity className="h-10 w-10 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Redemption Value</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${(stats.totalRedemptionValue / 1000000).toFixed(1)}M</p>
                                        <p className="text-xs text-slate-500 mt-1">Total USD value redeemed</p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customers by Type Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customers by Organization Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={customersByType}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {customersByType.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {activities.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{activity.activity_type}</p>
                                                    <p className="text-xs text-slate-600">{activity.activity_description || 'Activity completed'}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-purple-100 text-purple-700">
                                                +{activity.points_earned} pts
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer List */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Loyalty Platform Customers</CardTitle>
                                <Button 
                                    onClick={() => window.location.href = createPageUrl('LoyaltyCustomerManagement')}
                                    variant="outline"
                                    size="sm"
                                >
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {customers.slice(0, 6).map((customer) => {
                                    const Icon = organizationTypeIcons[customer.organization_type] || Building2;
                                    const customerPrograms = programs.filter(p => p.admin_email === customer.admin_email);
                                    
                                    return (
                                        <Card 
                                            key={customer.id} 
                                            className="bg-white hover:shadow-lg transition-all cursor-pointer"
                                            onClick={() => window.location.href = createPageUrl('LoyaltyCustomerDetail') + `?id=${customer.id}`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                            <Icon className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{customer.organization_name}</p>
                                                            <p className="text-xs text-slate-500">{customer.organization_type}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        customer.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    )}>
                                                        {customer.status}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Programs</p>
                                                        <p className="text-slate-900 font-semibold">{customerPrograms.length}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Participants</p>
                                                        <p className="text-slate-900 font-semibold">{customer.total_participants || 0}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="pt-2 border-t border-slate-100">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-600">Monthly Fee</span>
                                                        <span className="font-semibold text-emerald-600">${customer.monthly_fee?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                
                                {customers.length === 0 && (
                                    <div className="col-span-3 text-center py-12">
                                        <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600 mb-4">No loyalty customers yet</p>
                                        <Button 
                                            onClick={() => window.location.href = createPageUrl('LoyaltyCustomerOnboarding')}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Onboard First Customer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}