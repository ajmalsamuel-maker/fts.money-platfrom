import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, TrendingUp, Repeat } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CustomerInsights({ partnerId, programId }) {
    const { data: redemptions = [] } = useQuery({
        queryKey: ['customer-redemptions', programId],
        queryFn: () => base44.entities.TokenRedemption.filter({ program_id: programId, status: 'fulfilled' })
    });

    const { data: participants = [] } = useQuery({
        queryKey: ['participants', programId],
        queryFn: () => base44.entities.LoyaltyParticipant.filter({ program_id: programId })
    });

    // Calculate insights
    const customerFrequency = {};
    redemptions.forEach(r => {
        customerFrequency[r.participant_id] = (customerFrequency[r.participant_id] || 0) + 1;
    });

    const topCustomers = Object.entries(customerFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([participantId, count]) => {
            const participant = participants.find(p => p.id === participantId);
            return { participant, redemptions: count };
        });

    const repeatRate = Object.values(customerFrequency).filter(count => count > 1).length / Object.keys(customerFrequency).length * 100;

    const demographics = {
        bronze: participants.filter(p => p.current_tier === 'bronze').length,
        silver: participants.filter(p => p.current_tier === 'silver').length,
        gold: participants.filter(p => p.current_tier === 'gold').length,
        platinum: participants.filter(p => p.current_tier === 'platinum').length
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Customer Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <Users className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-3xl font-bold">{Object.keys(customerFrequency).length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <Repeat className="h-8 w-8 text-green-600 mb-2" />
                        <p className="text-sm text-gray-600">Repeat Rate</p>
                        <p className="text-3xl font-bold">{repeatRate.toFixed(0)}%</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                        <p className="text-sm text-gray-600">Avg. Redemptions</p>
                        <p className="text-3xl font-bold">{(redemptions.length / Object.keys(customerFrequency).length || 0).toFixed(1)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Top Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topCustomers.map((customer, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{customer.participant?.full_name || 'Customer'}</p>
                                            <p className="text-xs text-gray-500">{customer.participant?.current_tier}</p>
                                        </div>
                                    </div>
                                    <Badge>{customer.redemptions} redemptions</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Tiers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(demographics).map(([tier, count]) => (
                                <div key={tier}>
                                    <div className="flex justify-between mb-2">
                                        <span className="capitalize font-medium">{tier}</span>
                                        <span className="text-sm text-gray-600">{count} customers</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                tier === 'bronze' ? 'bg-orange-500' :
                                                tier === 'silver' ? 'bg-gray-400' :
                                                tier === 'gold' ? 'bg-yellow-500' :
                                                'bg-purple-500'
                                            }`}
                                            style={{ width: `${(count / participants.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}