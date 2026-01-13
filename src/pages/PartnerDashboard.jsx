import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, CheckCircle2, Package, TrendingUp, Menu, X, LogOut, BarChart3, QrCode, Gift, MapPin, DollarSign } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import PartnerAnalyticsDashboard from '../components/partner/PartnerAnalyticsDashboard';
import RedemptionManagementHub from '../components/partner/RedemptionManagementHub';
import OfferManagement from '../components/partner/OfferManagement';
import MultiLocationManager from '../components/partner/MultiLocationManager';
import FinancialSettlement from '../components/partner/FinancialSettlement';

export default function PartnerDashboard() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('partner_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/PartnerLogin';
        return null;
    }

    const { data: redemptions = [] } = useQuery({
        queryKey: ['partner-redemptions', session.id],
        queryFn: async () => {
            const allRedemptions = await base44.entities.TokenRedemption.filter({ 
                program_id: session.program_id 
            });
            
            const rewards = await base44.entities.RedemptionOption.filter({ 
                program_id: session.program_id 
            });
            
            return allRedemptions.map(r => ({
                ...r,
                reward: rewards.find(rw => rw.id === r.redemption_option_id)
            }));
        }
    });

    const fulfillMutation = useMutation({
        mutationFn: async (redemptionId) => {
            await base44.entities.TokenRedemption.update(redemptionId, {
                status: 'fulfilled',
                fulfillment_details: {
                    fulfilled_by: session.business_name,
                    fulfilled_date: new Date().toISOString()
                }
            });
            
            await base44.entities.PartnerMerchant.update(session.id, {
                total_redemptions_fulfilled: (session.total_redemptions_fulfilled || 0) + 1
            });
        },
        onSuccess: () => {
            toast.success('Redemption marked as fulfilled!');
            queryClient.invalidateQueries(['partner-redemptions']);
        }
    });

    const pendingRedemptions = redemptions.filter(r => ['approved', 'processing'].includes(r.status));

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-green-600 to-blue-600">
                    <div className="flex items-center gap-2 text-white">
                        <ShoppingBag className="h-6 w-6" />
                        <span className="font-bold text-sm">Partner Portal</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-green-50">
                    <p className="text-xs text-slate-600">Business</p>
                    <p className="font-semibold">{session.business_name}</p>
                    <Badge className="mt-2 capitalize">{session.status}</Badge>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <p className="text-xs text-gray-500 px-3 mb-2">MAIN MENU</p>
                    <a href="/PartnerDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50 text-green-700 font-medium">
                        <ShoppingBag className="h-4 w-4" />Dashboard
                    </a>
                </nav>

                <div className="p-4 border-t">
                    <Button onClick={() => { 
                        localStorage.removeItem('partner_session'); 
                        window.location.href = '/PartnerLogin'; 
                    }} variant="outline" className="w-full text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />Logout
                    </Button>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center px-4 md:px-6 sticky top-0 z-10">
                    <Button variant="ghost" size="icon" className="md:hidden mr-3" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Partner Dashboard</h1>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                            <TabsTrigger value="overview" className="text-xs md:text-sm">
                                <ShoppingBag className="h-4 w-4 mr-1" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="text-xs md:text-sm">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="redemptions" className="text-xs md:text-sm">
                                <QrCode className="h-4 w-4 mr-1" />
                                Redemptions
                            </TabsTrigger>
                            <TabsTrigger value="offers" className="text-xs md:text-sm">
                                <Gift className="h-4 w-4 mr-1" />
                                Offers
                            </TabsTrigger>
                            <TabsTrigger value="locations" className="text-xs md:text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                Locations
                            </TabsTrigger>
                            <TabsTrigger value="financials" className="text-xs md:text-sm">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Financials
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <Package className="h-8 w-8 text-green-600 mb-2" />
                                        <p className="text-sm text-slate-600">Pending</p>
                                        <p className="text-3xl font-bold">{pendingRedemptions.length}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <CheckCircle2 className="h-8 w-8 text-blue-600 mb-2" />
                                        <p className="text-sm text-slate-600">Fulfilled</p>
                                        <p className="text-3xl font-bold">{session.total_redemptions_fulfilled || 0}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                                        <p className="text-sm text-slate-600">Total Value</p>
                                        <p className="text-3xl font-bold">${session.total_value_provided || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Pending Redemptions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pendingRedemptions.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No pending redemptions</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingRedemptions.map(redemption => (
                                                <div key={redemption.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-semibold">{redemption.reward?.reward_name}</p>
                                                            <p className="text-sm text-slate-600">Tokens: {redemption.tokens_redeemed}</p>
                                                            <p className="text-xs text-slate-500">Requested: {new Date(redemption.created_date).toLocaleDateString()}</p>
                                                        </div>
                                                        <Badge className="bg-orange-100 text-orange-800">{redemption.status}</Badge>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-green-600"
                                                        onClick={() => fulfillMutation.mutate(redemption.id)}
                                                        disabled={fulfillMutation.isPending}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />Mark as Fulfilled
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <PartnerAnalyticsDashboard partnerId={session.id} programId={session.program_id} />
                        </TabsContent>

                        <TabsContent value="redemptions">
                            <RedemptionManagementHub partnerId={session.id} programId={session.program_id} />
                        </TabsContent>

                        <TabsContent value="offers">
                            <OfferManagement partnerId={session.id} programId={session.program_id} />
                        </TabsContent>

                        <TabsContent value="locations">
                            <MultiLocationManager partnerId={session.id} programId={session.program_id} partnerData={session} />
                        </TabsContent>

                        <TabsContent value="financials">
                            <FinancialSettlement partnerId={session.id} programId={session.program_id} partnerData={session} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}