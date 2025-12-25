import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, ArrowLeft, Lock } from 'lucide-react';
import OrchestrationRuleBuilder from '@/components/orchestration/OrchestrationRuleBuilder';

export default function ISOCustomerRouting() {
    const [customer, setCustomer] = React.useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('iso_gateway_session');
        if (session) {
            const parsed = JSON.parse(session);
            setCustomer(parsed);
        } else {
            window.location.href = '/ISOGatewayLogin';
        }
    }, []);

    const { data: customerData } = useQuery({
        queryKey: ['customer', customer?.customer_id],
        queryFn: async () => {
            const customers = await base44.entities.ISOGatewayCustomer.filter({ 
                customer_id: customer?.customer_id 
            });
            return customers[0];
        },
        enabled: !!customer?.customer_id
    });

    // Check if orchestration is enabled
    const hasOrchestration = customerData?.enabled_features?.includes('orchestration');

    if (!customer) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
                <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/ISOGatewayCustomerPortal'}
                    className="mr-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Portal
                </Button>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Payment Routing</h2>
                    <p className="text-xs text-slate-600">{customerData?.company_name}</p>
                </div>
            </header>

            <div className="p-6 max-w-6xl mx-auto">
                {!hasOrchestration ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Lock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                Orchestration Service Not Enabled
                            </h3>
                            <p className="text-slate-600 mb-6">
                                Contact FTS.Money to enable routing and orchestration features for your account.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
                                <p className="text-sm font-medium text-blue-900 mb-2">
                                    With Orchestration, you can:
                                </p>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>✓ Route messages to payment providers in FTS infrastructure</li>
                                    <li>✓ Intelligent failover and load balancing</li>
                                    <li>✓ Cost optimization across providers</li>
                                    <li>✓ Real-time routing analytics</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <GitBranch className="h-6 w-6 text-blue-600" />
                                <div>
                                    <CardTitle>Configure Routing Rules</CardTitle>
                                    <p className="text-sm text-slate-600">
                                        Route translated messages to payment providers or payout methods
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <OrchestrationRuleBuilder 
                                ownerType="iso_gateway"
                                ownerId={customer.customer_id}
                                ruleType="iso_translation"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}