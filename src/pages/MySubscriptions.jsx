import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Sparkles, CheckCircle2, Clock, XCircle, Zap, TrendingUp, DollarSign, Calendar
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MySubscriptions() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['my-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list()
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const cancelMutation = useMutation({
        mutationFn: (subId) => base44.entities.PSPServiceSubscription.update(subId, { 
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-subscriptions']);
        }
    });

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled');

    const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => sum + (sub.base_fee || 0), 0);

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="MySubscriptions" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>My Subscriptions</h2>
                        <p className="text-xs text-slate-600">Manage your marketplace subscriptions</p>
                    </div>
                    <Button 
                        onClick={() => navigate(createPageUrl('CommunityMarketplace'))}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Browse Marketplace
                    </Button>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{activeSubscriptions.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Monthly Cost</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${totalMonthlySpend.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Trials</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            {subscriptions.filter(s => s.status === 'trial').length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Savings</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">$0</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Subscriptions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                Active Subscriptions ({activeSubscriptions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeSubscriptions.length === 0 ? (
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertDescription>
                                        No active subscriptions yet. Browse the marketplace to get started!
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    {activeSubscriptions.map((sub) => {
                                        const service = services.find(s => s.id === sub.service_id);
                                        return (
                                            <div 
                                                key={sub.id}
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                        <Zap className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{sub.service_name}</p>
                                                        <p className="text-sm text-slate-600">PSP: {sub.psp_name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            Started {new Date(sub.subscribed_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-bold text-slate-900">${(sub.base_fee || 0).toLocaleString()}/mo</p>
                                                        <Badge className={cn(
                                                            sub.status === 'trial' 
                                                                ? 'bg-amber-100 text-amber-700' 
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        )}>
                                                            {sub.status === 'trial' ? (
                                                                <>
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Free Trial
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                    Active
                                                                </>
                                                            )}
                                                        </Badge>
                                                        {sub.trial_ends_at && sub.status === 'trial' && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Ends {new Date(sub.trial_ends_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Cancel this subscription?')) {
                                                                cancelMutation.mutate(sub.id);
                                                            }
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cancelled Subscriptions */}
                    {cancelledSubscriptions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-600">
                                    <XCircle className="h-5 w-5" />
                                    Cancelled Subscriptions ({cancelledSubscriptions.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {cancelledSubscriptions.map((sub) => (
                                        <div 
                                            key={sub.id}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg opacity-60"
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-700">{sub.service_name}</p>
                                                <p className="text-sm text-slate-600">
                                                    Cancelled {new Date(sub.cancelled_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-slate-600">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Cancelled
                                            </Badge>
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