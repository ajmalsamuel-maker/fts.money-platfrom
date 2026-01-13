import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CheckCircle2, Package, TrendingUp, Menu, X, LogOut, BarChart3, QrCode, Gift, MapPin, DollarSign, Users, Megaphone, Code, Globe, HelpCircle, Shield, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import PartnerAnalyticsDashboard from '../components/partner/PartnerAnalyticsDashboard';
import RedemptionManagementHub from '../components/partner/RedemptionManagementHub';
import OfferManagement from '../components/partner/OfferManagement';
import MultiLocationManager from '../components/partner/MultiLocationManager';
import FinancialSettlement from '../components/partner/FinancialSettlement';
import CustomerInsights from '../components/partner/CustomerInsights';
import MarketingTools from '../components/partner/MarketingTools';
import POSIntegration from '../components/partner/POSIntegration';
import HongKongFeatures from '../components/partner/HongKongFeatures';
import SupportTraining from '../components/partner/SupportTraining';
import SecurityVerification from '../components/partner/SecurityVerification';
import GamificationEngagement from '../components/partner/GamificationEngagement';
import SmartFeatures from '../components/partner/SmartFeatures';

export default function PartnerDashboard() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('partner_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentView, setCurrentView] = useState('overview');
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };
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

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Overview */}
                    <button
                        onClick={() => setCurrentView('overview')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            currentView === 'overview' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Overview</span>
                    </button>

                    {/* Operations Section */}
                    <div className="pt-3">
                        <p className="text-xs font-semibold text-gray-500 px-3 mb-2">OPERATIONS</p>
                        <button
                            onClick={() => setCurrentView('redemptions')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'redemptions' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <QrCode className="h-4 w-4" />
                            <span>Redemptions</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('offers')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'offers' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Gift className="h-4 w-4" />
                            <span>Manage Offers</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('locations')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'locations' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <MapPin className="h-4 w-4" />
                            <span>Locations</span>
                        </button>
                    </div>

                    {/* Analytics & Insights Section */}
                    <div className="pt-3">
                        <p className="text-xs font-semibold text-gray-500 px-3 mb-2">ANALYTICS & INSIGHTS</p>
                        <button
                            onClick={() => setCurrentView('analytics')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'analytics' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span>Performance</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('customers')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'customers' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            <span>Customer Insights</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('ai')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'ai' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>AI Insights</span>
                        </button>
                    </div>

                    {/* Business Section */}
                    <div className="pt-3">
                        <p className="text-xs font-semibold text-gray-500 px-3 mb-2">BUSINESS</p>
                        <button
                            onClick={() => setCurrentView('financials')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'financials' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <DollarSign className="h-4 w-4" />
                            <span>Financials</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('marketing')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'marketing' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Megaphone className="h-4 w-4" />
                            <span>Marketing</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('gamification')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'gamification' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Trophy className="h-4 w-4" />
                            <span>Leaderboard</span>
                        </button>
                    </div>

                    {/* Settings Section */}
                    <div className="pt-3">
                        <p className="text-xs font-semibold text-gray-500 px-3 mb-2">SETTINGS</p>
                        <button
                            onClick={() => setCurrentView('pos')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'pos' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Code className="h-4 w-4" />
                            <span>API & POS</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('localization')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'localization' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Globe className="h-4 w-4" />
                            <span>HK Settings</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('security')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'security' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Shield className="h-4 w-4" />
                            <span>Security</span>
                        </button>
                    </div>

                    {/* Support Section */}
                    <div className="pt-3 pb-4">
                        <p className="text-xs font-semibold text-gray-500 px-3 mb-2">SUPPORT</p>
                        <button
                            onClick={() => setCurrentView('support')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                currentView === 'support' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <HelpCircle className="h-4 w-4" />
                            <span>Help & Training</span>
                        </button>
                    </div>
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
                    {/* Overview */}
                    {currentView === 'overview' && (
                        <div className="space-y-6">
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
                        </div>
                    )}

                    {/* Analytics */}
                    {currentView === 'analytics' && (
                        <PartnerAnalyticsDashboard partnerId={session.id} programId={session.program_id} />
                    )}

                    {/* Redemptions */}
                    {currentView === 'redemptions' && (
                        <RedemptionManagementHub partnerId={session.id} programId={session.program_id} />
                    )}

                    {/* Offers */}
                    {currentView === 'offers' && (
                        <OfferManagement partnerId={session.id} programId={session.program_id} />
                    )}

                    {/* Locations */}
                    {currentView === 'locations' && (
                        <MultiLocationManager partnerId={session.id} programId={session.program_id} partnerData={session} />
                    )}

                    {/* Financials */}
                    {currentView === 'financials' && (
                        <FinancialSettlement partnerId={session.id} programId={session.program_id} partnerData={session} />
                    )}

                    {/* Customers */}
                    {currentView === 'customers' && (
                        <CustomerInsights partnerId={session.id} programId={session.program_id} />
                    )}

                    {/* Marketing */}
                    {currentView === 'marketing' && (
                        <MarketingTools partnerId={session.id} partnerData={session} />
                    )}

                    {/* POS */}
                    {currentView === 'pos' && (
                        <POSIntegration partnerId={session.id} />
                    )}

                    {/* Localization */}
                    {currentView === 'localization' && (
                        <HongKongFeatures partnerId={session.id} />
                    )}

                    {/* Support */}
                    {currentView === 'support' && (
                        <SupportTraining partnerId={session.id} />
                    )}

                    {/* Security */}
                    {currentView === 'security' && (
                        <SecurityVerification partnerId={session.id} />
                    )}

                    {/* Gamification */}
                    {currentView === 'gamification' && (
                        <GamificationEngagement partnerId={session.id} partnerData={session} />
                    )}

                    {/* AI */}
                    {currentView === 'ai' && (
                        <SmartFeatures partnerId={session.id} programId={session.program_id} />
                    )}
                </div>
            </div>
        </div>
    );
}