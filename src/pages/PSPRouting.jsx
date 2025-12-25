import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Lock } from 'lucide-react';
import OrchestrationRuleBuilder from '@/components/orchestration/OrchestrationRuleBuilder';

export default function PSPRouting() {
    const [user, setUser] = React.useState(null);
    const [pspCode, setPspCode] = React.useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('staff_session');
        if (session) {
            const parsed = JSON.parse(session);
            setUser(parsed);
            setPspCode(parsed.psp_code);
        } else {
            window.location.href = '/PSPLogin';
        }
    }, []);

    const { data: psp } = useQuery({
        queryKey: ['psp', pspCode],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.filter({ psp_code: pspCode });
            return psps[0];
        },
        enabled: !!pspCode
    });

    const hasOrchestration = psp?.enabled_features?.includes('orchestration');

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar currentPage="PSPRouting" userRole={user?.role} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader user={user} />
                
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900">Payment Routing & Orchestration</h1>
                            <p className="text-slate-600">Configure intelligent routing for payments and payouts</p>
                        </div>

                        {!hasOrchestration ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Lock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                        Orchestration Service Not Enabled
                                    </h3>
                                    <p className="text-slate-600 mb-6">
                                        This is a premium feature. Contact your FTS.Money account manager to enable.
                                    </p>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg text-left max-w-2xl mx-auto">
                                        <p className="text-sm font-semibold text-slate-900 mb-3">
                                            Smart Orchestration includes:
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                                            <div>
                                                <div className="font-medium mb-1">🎯 Intelligent Routing</div>
                                                <p className="text-xs">Route based on amount, currency, country</p>
                                            </div>
                                            <div>
                                                <div className="font-medium mb-1">🔄 Automatic Failover</div>
                                                <p className="text-xs">Instant fallback to backup providers</p>
                                            </div>
                                            <div>
                                                <div className="font-medium mb-1">⚖️ Load Balancing</div>
                                                <p className="text-xs">Distribute load across providers</p>
                                            </div>
                                            <div>
                                                <div className="font-medium mb-1">💰 Cost Optimization</div>
                                                <p className="text-xs">Auto-select cheapest provider</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Tabs defaultValue="payments" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="payments">Payment Routing</TabsTrigger>
                                    <TabsTrigger value="payouts">Payout Routing</TabsTrigger>
                                </TabsList>

                                <TabsContent value="payments">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <GitBranch className="h-5 w-5 text-blue-600" />
                                                <CardTitle>Payment Provider Routing</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <OrchestrationRuleBuilder 
                                                ownerType="psp"
                                                ownerId={pspCode}
                                                ruleType="payment"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="payouts">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <GitBranch className="h-5 w-5 text-emerald-600" />
                                                <CardTitle>Payout Method Routing</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <OrchestrationRuleBuilder 
                                                ownerType="psp"
                                                ownerId={pspCode}
                                                ruleType="payout"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}