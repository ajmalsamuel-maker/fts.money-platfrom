import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Package, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function PartnerAnalyticsDashboard({ partnerId, programId }) {
    const { data: redemptions = [] } = useQuery({
        queryKey: ['partner-redemptions', partnerId],
        queryFn: () => base44.entities.TokenRedemption.filter({ program_id: programId })
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['partner-activities', programId],
        queryFn: () => base44.entities.ActivityLog.filter({ program_id: programId })
    });

    // Calculate analytics
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentRedemptions = redemptions.filter(r => 
        new Date(r.created_date) >= thirtyDaysAgo && r.status === 'fulfilled'
    );

    const totalRevenue = recentRedemptions.reduce((sum, r) => sum + (r.tokens_redeemed || 0), 0);
    const totalCustomers = new Set(recentRedemptions.map(r => r.participant_id)).size;
    const avgRedemptionValue = recentRedemptions.length > 0 ? totalRevenue / recentRedemptions.length : 0;

    // Peak times analysis
    const hourlyData = {};
    recentRedemptions.forEach(r => {
        const hour = new Date(r.created_date).getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourlyData).sort((a, b) => b[1] - a[1])[0];

    // District data (mock for now)
    const districtData = [
        { name: 'Central & Western', count: Math.floor(recentRedemptions.length * 0.3) },
        { name: 'Kowloon City', count: Math.floor(recentRedemptions.length * 0.25) },
        { name: 'Tsim Sha Tsui', count: Math.floor(recentRedemptions.length * 0.2) },
        { name: 'New Territories', count: Math.floor(recentRedemptions.length * 0.15) },
        { name: 'Others', count: Math.floor(recentRedemptions.length * 0.1) }
    ];

    const stats = [
        { label: 'Total Redemptions (30d)', value: recentRedemptions.length, icon: Package, color: 'text-blue-600' },
        { label: 'Unique Customers', value: totalCustomers, icon: Users, color: 'text-green-600' },
        { label: 'Total Points Redeemed', value: totalRevenue.toLocaleString(), icon: DollarSign, color: 'text-purple-600' },
        { label: 'Avg. Redemption Value', value: Math.round(avgRedemptionValue), icon: TrendingUp, color: 'text-orange-600' }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-10 w-10 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Peak Redemption Times
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {peakHour ? (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">Busiest hour: <span className="font-semibold">{peakHour[0]}:00 - {parseInt(peakHour[0]) + 1}:00</span></p>
                                <div className="space-y-2">
                                    {Object.entries(hourlyData).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([hour, count]) => (
                                        <div key={hour} className="flex items-center gap-2">
                                            <span className="text-sm w-20">{hour}:00 - {parseInt(hour) + 1}:00</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${(count / peakHour[1]) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold w-8">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No data available</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            District Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {districtData.map((district, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="text-sm w-32">{district.name}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${(district.count / recentRedemptions.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold w-8">{district.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {recentRedemptions.slice(0, 10).map((redemption, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div>
                                    <p className="text-sm font-medium">Redemption #{redemption.id?.slice(-8)}</p>
                                    <p className="text-xs text-gray-500">{format(new Date(redemption.created_date), 'MMM dd, yyyy HH:mm')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{redemption.tokens_redeemed} points</p>
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        {redemption.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}