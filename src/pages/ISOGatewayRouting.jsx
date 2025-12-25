import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import OrchestrationRuleBuilder from '@/components/orchestration/OrchestrationRuleBuilder';

export default function ISOGatewayRouting() {
    const { platformUser } = usePlatformAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customer_id');

    const { data: customer } = useQuery({
        queryKey: ['customer', customerId],
        queryFn: async () => {
            const customers = await base44.entities.ISOGatewayCustomer.filter({ id: customerId });
            return customers[0];
        },
        enabled: !!customerId
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ISOGatewayRouting" 
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-10">
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        className="mr-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">ISO Gateway Routing</h2>
                        <p className="text-xs text-slate-600">{customer?.company_name}</p>
                    </div>
                </header>

                <div className="p-6 max-w-6xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configure Routing Rules</CardTitle>
                            <p className="text-sm text-slate-600">
                                Route translated messages to payment providers or payout methods in the FTS infrastructure
                            </p>
                        </CardHeader>
                        <CardContent>
                            <OrchestrationRuleBuilder 
                                ownerType="iso_gateway"
                                ownerId={customerId}
                                ruleType="iso_translation"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}