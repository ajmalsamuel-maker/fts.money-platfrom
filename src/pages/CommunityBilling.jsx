import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    DollarSign, 
    TrendingUp, 
    FileText, 
    Calendar,
    Download,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CommunityBilling() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    const { data: myPSPs = [] } = useQuery({
        queryKey: ['my-psp-instances'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['my-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list()
    });

    // Mock invoices (in real app, fetch from database)
    const invoices = [
        { id: 'INV-001', date: '2025-01-01', amount: 5500, status: 'paid', description: 'January 2025 - Platform + Add-ons' },
        { id: 'INV-002', date: '2024-12-01', amount: 5500, status: 'paid', description: 'December 2024 - Platform + Add-ons' },
        { id: 'INV-003', date: '2024-11-01', amount: 3000, status: 'paid', description: 'November 2024 - Platform Base' }
    ];

    const totalMonthlySpend = myPSPs.reduce((sum, psp) => sum + (psp.monthly_fee || 0), 0) +
                              subscriptions.reduce((sum, sub) => sum + (sub.monthly_spent || 0), 0);

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="CommunityBilling" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Billing & Payments</h2>
                        <p className="text-xs text-slate-600">Manage your subscriptions and invoices</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                    </Button>
                </header>

                <div className="p-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Monthly Spend</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            ${totalMonthlySpend.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active PSPs</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{myPSPs.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Subscriptions</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{subscriptions.length}</p>
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
                                        <p className="text-sm text-slate-600">Next Billing</p>
                                        <p className="text-xl font-bold text-slate-900 mt-1">Feb 1, 2025</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                            <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Cost Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {myPSPs.map(psp => (
                                            <div key={psp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{psp.psp_name}</p>
                                                    <p className="text-sm text-slate-600">{psp.tier} tier</p>
                                                </div>
                                                <p className="font-bold">${(psp.monthly_fee || 0).toLocaleString()}/mo</p>
                                            </div>
                                        ))}
                                        
                                        {subscriptions.filter(s => s.status === 'active').map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{sub.service_name}</p>
                                                    <p className="text-sm text-slate-600">Add-on subscription</p>
                                                </div>
                                                <p className="font-bold">${(sub.base_fee || 0).toLocaleString()}/mo</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoice History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {invoices.map(invoice => (
                                            <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{invoice.id}</p>
                                                        <p className="text-sm text-slate-600">{invoice.description}</p>
                                                        <p className="text-xs text-slate-500">{new Date(invoice.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-bold">${invoice.amount.toLocaleString()}</p>
                                                        <Badge className={cn(
                                                            invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                            invoice.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        )}>
                                                            {invoice.status === 'paid' ? <CheckCircle2 className="h-3 w-3 mr-1" /> :
                                                             invoice.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> :
                                                             <AlertCircle className="h-3 w-3 mr-1" />}
                                                            {invoice.status}
                                                        </Badge>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Subscriptions Tab */}
                        <TabsContent value="subscriptions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Subscriptions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {subscriptions.filter(s => s.status === 'active' || s.status === 'trial').map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{sub.service_name}</p>
                                                    <p className="text-sm text-slate-600">PSP: {sub.psp_name}</p>
                                                    <Badge className={cn(
                                                        "mt-2",
                                                        sub.status === 'trial' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                    )}>
                                                        {sub.status === 'trial' ? 'Free Trial' : 'Active'}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">${(sub.base_fee || 0).toLocaleString()}/mo</p>
                                                    <Button variant="outline" size="sm" className="mt-2">
                                                        Manage
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Payment Method Tab */}
                        <TabsContent value="payment-method">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-6 border-2 border-slate-200 rounded-lg bg-gradient-to-r from-slate-50 to-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                                                <CreditCard className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Visa ending in 4242</p>
                                                <p className="text-sm text-slate-600">Expires 12/2026</p>
                                                <Badge className="mt-1 bg-emerald-100 text-emerald-700">Default</Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline">Update Card</Button>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <Button variant="outline" className="w-full">
                                            + Add Payment Method
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}