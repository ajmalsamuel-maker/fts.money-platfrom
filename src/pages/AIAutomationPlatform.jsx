import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, TrendingUp, Shield } from 'lucide-react';
import AIPaymentAgentManager from '@/components/terminal/AIPaymentAgentManager';
import RecurringPaymentManager from '@/components/terminal/RecurringPaymentManager';

export default function AIAutomationPlatform() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants-all'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: agents = [] } = useQuery({
        queryKey: ['ai-agents-platform'],
        queryFn: () => base44.entities.AIPaymentAgent.list(),
    });

    const { data: recurringPayments = [] } = useQuery({
        queryKey: ['recurring-payments-platform'],
        queryFn: () => base44.entities.RecurringPayment.list(),
    });

    const activeAgents = agents.filter(a => a.status === 'active').length;
    const activeRecurring = recurringPayments.filter(r => r.status === 'active').length;
    const totalDecisions = agents.reduce((sum, a) => sum + (a.decisions_made || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="AIAutomationPlatform"
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
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Brain className="h-7 w-7 text-purple-600" />
                            AI & Automation Platform
                        </h1>
                        <p className="text-slate-500">Platform-level AI agents, recurring payments, and intelligent automation</p>
                    </div>

                    {/* Platform Stats */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Brain className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Active AI Agents</p>
                                        <p className="text-xl font-semibold">{activeAgents}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">AI Decisions Made</p>
                                        <p className="text-xl font-semibold">{totalDecisions}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Active Recurring</p>
                                        <p className="text-xl font-semibold">{activeRecurring}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Merchants</p>
                                        <p className="text-xl font-semibold">{merchants.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Platform Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Tabs defaultValue="ai-agents">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="ai-agents">
                                        <Brain className="h-4 w-4 mr-2" />
                                        AI Payment Agents
                                    </TabsTrigger>
                                    <TabsTrigger value="recurring">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Recurring Payments
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="ai-agents">
                                    <AIPaymentAgentManager merchantId={null} />
                                </TabsContent>

                                <TabsContent value="recurring">
                                    <RecurringPaymentManager merchants={merchants} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}