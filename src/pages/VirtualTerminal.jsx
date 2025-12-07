import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    CreditCard, 
    FileText,
    Link2,
    CheckCircle,
    Mail,
    Printer,
    Download,
    Send
} from 'lucide-react';
import { toast } from 'sonner';
import InvoiceGenerator from '@/components/terminal/InvoiceGenerator';
import PaymentLinkGenerator from '@/components/terminal/PaymentLinkGenerator';
import PaymentForm from '@/components/terminal/PaymentForm';
import InvoiceTemplateManager from '@/components/terminal/InvoiceTemplateManager';

export default function VirtualTerminal() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('payment');
    const [recentTransactions, setRecentTransactions] = useState([]);

    const queryClient = useQueryClient();

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['recent-transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 10),
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="VirtualTerminals"
            />
            
            <div className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "ml-20" : "ml-64"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard className="h-7 w-7 text-blue-600" />
                            Virtual Payment Terminal
                        </h1>
                        <p className="text-slate-500">Process payments, create invoices, and generate payment links</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Terminal */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle>Payment Processing</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-4 mb-6">
                                            <TabsTrigger value="payment" className="gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                <span className="hidden sm:inline">Quick Payment</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="invoice" className="gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="hidden sm:inline">Invoice</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="link" className="gap-2">
                                                <Link2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Payment Link</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="templates" className="gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="hidden sm:inline">Templates</span>
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="payment">
                                            <PaymentForm merchants={merchants} />
                                        </TabsContent>

                                        <TabsContent value="invoice">
                                            <InvoiceGenerator merchants={merchants} />
                                        </TabsContent>

                                        <TabsContent value="link">
                                            <PaymentLinkGenerator merchants={merchants} />
                                        </TabsContent>

                                        <TabsContent value="templates">
                                            <InvoiceTemplateManager merchantId={merchants[0]?.id} />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Recent Activity */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {transactions.slice(0, 5).map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{tx.merchant_name}</p>
                                                    <p className="text-xs text-slate-500">{tx.transaction_id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-sm">${tx.amount?.toFixed(2)}</p>
                                                    <Badge className={cn(
                                                        "text-xs",
                                                        tx.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    )}>
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-base">ISO 20022 Compliance</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span className="text-slate-600">Payment Instructions (pain.001)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span className="text-slate-600">Credit Transfer (pacs.008)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span className="text-slate-600">Account Statement (camt.053)</span>
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-xs text-blue-700">
                                                All transactions are structured for ISO 20022 compatibility with proper end-to-end identification and remittance information.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}