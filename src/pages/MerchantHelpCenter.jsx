import React, { useState } from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Search, HelpCircle, Book, FileText, Video, MessageCircle, Mail, Phone } from 'lucide-react';

const helpArticles = [
    { id: 1, title: 'Getting Started with Your Merchant Account', category: 'Getting Started', icon: Book },
    { id: 2, title: 'Understanding Transaction Fees', category: 'Billing', icon: FileText },
    { id: 3, title: 'How to Process a Refund', category: 'Transactions', icon: FileText },
    { id: 4, title: 'Managing Chargebacks', category: 'Disputes', icon: FileText },
    { id: 5, title: 'API Integration Guide', category: 'Developer', icon: Book },
    { id: 6, title: 'Settlement Schedule and Timing', category: 'Finance', icon: FileText },
    { id: 7, title: 'Security Best Practices', category: 'Security', icon: FileText },
    { id: 8, title: 'Reading Your Monthly Statement', category: 'Reports', icon: FileText },
    { id: 9, title: 'Payment Gateway Configuration', category: 'Setup', icon: Book },
    { id: 10, title: 'Fraud Prevention Tools', category: 'Security', icon: FileText },
];

const categories = [
    { name: 'Getting Started', icon: Book, count: 8 },
    { name: 'Transactions', icon: FileText, count: 12 },
    { name: 'Disputes', icon: HelpCircle, count: 6 },
    { name: 'Billing', icon: FileText, count: 5 },
    { name: 'Security', icon: FileText, count: 7 },
    { name: 'Developer', icon: Book, count: 15 },
];

export default function MerchantHelpCenter() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const filteredArticles = helpArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantHelpCenter" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl font-bold text-slate-900">Help Center</h1>
                            <p className="text-slate-500">Find answers and get support</p>
                            <div className="max-w-2xl mx-auto relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search for help articles..."
                                    className="pl-12 h-12"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {categories.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{category.name}</CardTitle>
                                                    <p className="text-sm text-slate-500">{category.count} articles</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                );
                            })}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Articles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {filteredArticles.map((article) => {
                                        const Icon = article.icon;
                                        return (
                                            <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <Icon className="h-5 w-5 text-slate-400" />
                                                    <div>
                                                        <p className="font-medium">{article.title}</p>
                                                        <Badge variant="outline" className="text-xs">{article.category}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <MessageCircle className="h-5 w-5" />
                                        Live Chat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500 mb-3">Chat with our support team</p>
                                    <p className="text-xs text-green-600">● Available now</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Mail className="h-5 w-5" />
                                        Email Support
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500 mb-3">support@paymenthub.com</p>
                                    <p className="text-xs text-slate-500">Response within 24h</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Phone className="h-5 w-5" />
                                        Phone Support
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500 mb-3">1-800-PAYMENTS</p>
                                    <p className="text-xs text-slate-500">Mon-Fri 9AM-6PM EST</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}