import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, TreeDeciduous, Car, Smartphone, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CarbonFootprintWidget({ transactionAmount, merchantCategory, onOffsetComplete }) {
    const [footprint, setFootprint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [offsetting, setOffsetting] = useState(false);

    const calculateFootprint = async () => {
        setLoading(true);
        try {
            const { data } = await base44.functions.invoke('calculateCarbonFootprint', {
                transactionAmount,
                merchantCategory,
                currency: 'USD'
            });
            
            if (data.demo) {
                toast.info('Using demo data - set API keys for real calculations');
            }
            
            setFootprint(data.carbonFootprint);
        } catch (error) {
            toast.error('Failed to calculate carbon footprint');
        } finally {
            setLoading(false);
        }
    };

    const offsetCarbon = async () => {
        setOffsetting(true);
        try {
            const { data } = await base44.functions.invoke('offsetCarbon', {
                co2InKg: parseFloat(footprint.co2InKg),
                transactionId: `txn_${Date.now()}`
            });

            if (data.demo) {
                toast.success('Demo offset recorded - set STRIPE_SECRET_KEY for real offsetting');
            } else {
                toast.success(`Offset ${footprint.co2InKg}kg CO2 for $${data.offset.cost}`);
            }

            if (onOffsetComplete) {
                onOffsetComplete(data);
            }
        } catch (error) {
            toast.error('Failed to offset carbon');
        } finally {
            setOffsetting(false);
        }
    };

    React.useEffect(() => {
        if (transactionAmount) {
            calculateFootprint();
        }
    }, [transactionAmount]);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Leaf className="h-6 w-6 text-green-500 animate-pulse" />
                        <p className="ml-2 text-sm text-slate-600">Calculating carbon footprint...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!footprint) return null;

    return (
        <Card className="border-green-200 bg-green-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Carbon Footprint
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-700">
                            {footprint.co2InKg} kg
                        </p>
                        <p className="text-sm text-slate-600">CO₂ emissions</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-3 text-center border border-green-100">
                        <TreeDeciduous className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="font-semibold text-slate-900">{footprint.equivalents.treeMonths}</p>
                        <p className="text-slate-600">tree-months</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-green-100">
                        <Car className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="font-semibold text-slate-900">{footprint.equivalents.kmDriven}</p>
                        <p className="text-slate-600">km driven</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-green-100">
                        <Smartphone className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="font-semibold text-slate-900">{footprint.equivalents.smartphones}</p>
                        <p className="text-slate-600">phone charges</p>
                    </div>
                </div>

                <Button 
                    onClick={offsetCarbon}
                    disabled={offsetting}
                    className="w-full bg-green-600 hover:bg-green-700"
                >
                    <Zap className="h-4 w-4 mr-2" />
                    {offsetting ? 'Offsetting...' : 'Offset This Purchase'}
                </Button>

                <p className="text-xs text-center text-slate-500">
                    ~${(parseFloat(footprint.co2InKg) * 0.01).toFixed(2)} to offset via Stripe Climate
                </p>
            </CardContent>
        </Card>
    );
}