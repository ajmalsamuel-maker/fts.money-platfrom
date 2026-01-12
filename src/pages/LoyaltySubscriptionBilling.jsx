import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Menu, CreditCard, FileText, TrendingUp, Users, Activity, Download, AlertCircle } from 'lucide-react';
import moment from 'moment';

export default function LoyaltySubscriptionBilling() {
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

    const { data: participants = [] } = useQuery({
        queryKey: ['all-participants', session.admin_email],
        queryFn: async () => {
            const programIds = programs.map(p => p.id);
            if (programIds.length === 0) return [];
            const allParts = await Promise.all(
                programIds.map(id => base44.entities.LoyaltyParticipant.filter({ program_id: id }))
            );
            return allParts.flat();
        },
        enabled: programs.length > 0
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['subscriptions', session.customer_code],
        queryFn: () => base44.entities.ServiceSubscription.filter({ 
            customer_code: session.customer_code,
            service_type: 'loyalty_platform'
        })
    });

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices', session.customer_code],
        queryFn: async () => {
            const results = await base44.entities.ConsolidatedInvoice.filter({ customer_code: session.customer_code });
            return results.sort((a, b) => b.invoice_date.localeCompare(a.invoice_date));
        }
    });

    const { data: usageMeters = [] } = useQuery({
        queryKey: ['usage-meters', session.customer_code],
        queryFn: async () => {
            const subscription = subscriptions[0];
            if (!subscription) return [];
            return base44.entities.UsageMeter.filter({ subscription_id: subscription.id });
        },
        enabled: subscriptions.length > 0
    });

    const subscription = subscriptions[0];
    const totalTokensIssued = programs.reduce((sum, p) => sum + (p.total_tokens_issued || 0), 0);

    // Tier limits based on subscription
    const tierLimits = {
        starter: { participants: 1000, programs: 1, monthly_fee: 299 },
        growth: { participants: 10000, programs: 3, monthly_fee: 999 },
        enterprise: { participants: 100000, programs: 10, monthly_fee: 2999 },
        coalition: { participants: 1000000, programs: 50, monthly_fee: 9999 }
    };

    const currentLimits = tierLimits[session.subscription_tier] || tierLimits.starter;
    const participantUsage = (participants.length / currentLimits.participants) * 100;
    const programUsage = (programs.length / currentLimits.programs) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltySubscriptionBilling"
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Subscription & Billing</h1>
                    </div>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Current Plan */}
                    <Card className="border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Current Subscription Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-slate-600 mb-2">Plan</p>
                                    <Badge className="text-lg py-1 px-3 capitalize">{session.subscription_tier}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 mb-2">Monthly Fee</p>
                                    <p className="text-2xl font-bold text-purple-600">${currentLimits.monthly_fee}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 mb-2">Status</p>
                                    <Badge className="bg-emerald-100 text-emerald-700">{session.status || 'Active'}</Badge>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button className="bg-purple-600">Upgrade Plan</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Usage & Limits
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-600" />
                                        <span className="font-medium">Participants</span>
                                    </div>
                                    <span className="text-sm text-slate-600">
                                        {participants.length.toLocaleString()} / {currentLimits.participants.toLocaleString()}
                                    </span>
                                </div>
                                <Progress value={participantUsage} className="h-2" />
                                {participantUsage > 80 && (
                                    <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Approaching limit - consider upgrading</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-slate-600" />
                                        <span className="font-medium">Programs</span>
                                    </div>
                                    <span className="text-sm text-slate-600">
                                        {programs.length} / {currentLimits.programs}
                                    </span>
                                </div>
                                <Progress value={programUsage} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-xs text-slate-600">Tokens Issued</p>
                                    <p className="text-xl font-bold">{(totalTokensIssued / 1000).toFixed(1)}K</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">Active Programs</p>
                                    <p className="text-xl font-bold">{programs.filter(p => p.status === 'active').length}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">Total Redemptions</p>
                                    <p className="text-xl font-bold">{programs.reduce((s, p) => s + (p.total_tokens_redeemed || 0), 0)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">Blockchain Enabled</p>
                                    <p className="text-xl font-bold">{programs.filter(p => p.blockchain_network).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Billing History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <FileText className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                    <p>No invoices yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.slice(0, 5).map(invoice => (
                                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                            <div className="flex items-center gap-4">
                                                <FileText className="h-8 w-8 text-purple-600" />
                                                <div>
                                                    <p className="font-semibold">Invoice #{invoice.invoice_number}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {moment(invoice.invoice_date).format('MMM DD, YYYY')} • 
                                                        {invoice.billing_period_start && ` ${moment(invoice.billing_period_start).format('MMM YYYY')}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">${invoice.total_amount?.toFixed(2) || '0.00'}</p>
                                                    <Badge className={invoice.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                        {invoice.payment_status || 'pending'}
                                                    </Badge>
                                                </div>
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Usage Meters */}
                    {usageMeters.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Current Billing Period Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {usageMeters.map(meter => (
                                        <Card key={meter.id}>
                                            <CardContent className="p-4">
                                                <p className="text-sm text-slate-600 mb-1">{meter.metric_name}</p>
                                                <p className="text-2xl font-bold">{meter.current_usage?.toLocaleString() || 0}</p>
                                                <p className="text-xs text-slate-500 mt-1">{meter.unit_type}</p>
                                            </CardContent>
                                        </Card>
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