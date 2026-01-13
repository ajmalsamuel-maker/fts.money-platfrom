import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Download, FileText, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function FinancialSettlement({ partnerId, programId, partnerData }) {
    const [settlements] = useState([
        {
            id: '1',
            period: 'December 2025',
            redemptions: 145,
            total_points: 14500,
            hkd_value: 1450,
            commission: 145,
            net_amount: 1305,
            status: 'paid',
            paid_date: '2026-01-05'
        },
        {
            id: '2',
            period: 'November 2025',
            redemptions: 203,
            total_points: 20300,
            hkd_value: 2030,
            commission: 203,
            net_amount: 1827,
            status: 'paid',
            paid_date: '2025-12-05'
        },
        {
            id: '3',
            period: 'January 2026 (Current)',
            redemptions: 48,
            total_points: 4800,
            hkd_value: 480,
            commission: 48,
            net_amount: 432,
            status: 'pending',
            paid_date: null
        }
    ]);

    const currentMonth = settlements.find(s => s.status === 'pending');
    const paidTotal = settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.net_amount, 0);

    const downloadInvoice = (settlement) => {
        toast.success(`Downloading invoice for ${settlement.period}`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Financial & Settlement</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Current Month</p>
                                <p className="text-3xl font-bold mt-1">HK${currentMonth?.net_amount || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">{currentMonth?.redemptions || 0} redemptions</p>
                            </div>
                            <Clock className="h-10 w-10 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Paid</p>
                                <p className="text-3xl font-bold mt-1">HK${paidTotal.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">Lifetime</p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Commission Rate</p>
                                <p className="text-3xl font-bold mt-1">10%</p>
                                <p className="text-xs text-gray-500 mt-1">Platform fee</p>
                            </div>
                            <DollarSign className="h-10 w-10 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Settlement History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {settlements.map(settlement => (
                            <div key={settlement.id} className="border rounded-lg p-4">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{settlement.period}</h3>
                                            <Badge variant={settlement.status === 'paid' ? 'default' : 'secondary'}>
                                                {settlement.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Redemptions</p>
                                                <p className="font-semibold">{settlement.redemptions}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Total Points</p>
                                                <p className="font-semibold">{settlement.total_points.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Gross Value</p>
                                                <p className="font-semibold">HK${settlement.hkd_value}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Commission (10%)</p>
                                                <p className="font-semibold text-red-600">-HK${settlement.commission}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Net Amount:</span>
                                                <span className="text-xl font-bold text-green-600">HK${settlement.net_amount}</span>
                                            </div>
                                            {settlement.paid_date && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Paid on {format(new Date(settlement.paid_date), 'MMM dd, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => downloadInvoice(settlement)}>
                                            <Download className="h-4 w-4 mr-1" />
                                            Invoice
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <FileText className="h-4 w-4 mr-1" />
                                            Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Bank Name:</span>
                            <span className="font-semibold">HSBC Hong Kong</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Account Name:</span>
                            <span className="font-semibold">{partnerData?.business_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Account Number:</span>
                            <span className="font-semibold font-mono">*** **** 1234</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Settlement Cycle:</span>
                            <span className="font-semibold">Monthly (1st week)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Currency:</span>
                            <span className="font-semibold">HKD (Hong Kong Dollar)</span>
                        </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                        Update Payment Details
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}