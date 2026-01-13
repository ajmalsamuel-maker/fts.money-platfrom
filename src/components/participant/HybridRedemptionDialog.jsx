import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

export default function HybridRedemptionDialog({ reward, open, onOpenChange, onConfirm, userBalance }) {
    const [pointsToUse, setPointsToUse] = useState(reward?.minimum_points_required || 0);

    const calculation = useMemo(() => {
        if (!reward) return null;
        
        const fullPrice = reward.cash_price || reward.monetary_value;
        const maxPointsApplicable = reward.maximum_points_applicable || reward.points_required;
        const minPointsRequired = reward.minimum_points_required || 0;
        
        // Calculate how many points can be used
        const pointsUsable = Math.min(pointsToUse, maxPointsApplicable, userBalance);
        
        // Value of points being used (points_required normally equals monetary_value)
        const pointValue = reward.monetary_value / reward.points_required;
        const valueFromPoints = pointsUsable * pointValue;
        
        // Cash remaining
        const cashRequired = Math.max(0, fullPrice - valueFromPoints);
        
        return {
            fullPrice,
            maxPointsApplicable,
            minPointsRequired,
            pointsUsable,
            valueFromPoints,
            cashRequired,
            savings: valueFromPoints
        };
    }, [reward, pointsToUse, userBalance]);

    if (!reward || !calculation) return null;

    const canRedeemWithCash = calculation.cashRequired <= 0 || (pointsToUse >= calculation.minPointsRequired && calculation.cashRequired > 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Redeem with Points + Cash</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">{reward.reward_name}</h3>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>

                    <Card className="bg-blue-50">
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600 mb-2">Use Your Points</p>
                            <p className="text-3xl font-bold text-blue-600">{calculation.pointsUsable}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                = ${(calculation.valueFromPoints).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <div>
                        <div className="flex justify-between mb-3">
                            <Label>Points to Use</Label>
                            <span className="text-sm font-semibold text-indigo-600">{pointsToUse}</span>
                        </div>
                        <Slider
                            min={calculation.minPointsRequired}
                            max={Math.min(calculation.maxPointsApplicable, userBalance)}
                            step={1}
                            value={[pointsToUse]}
                            onValueChange={(value) => setPointsToUse(value[0])}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Min: {calculation.minPointsRequired}</span>
                            <span>Max: {Math.min(calculation.maxPointsApplicable, userBalance)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Full Price</span>
                            <span className="font-semibold">${calculation.fullPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Points Value</span>
                            <span className="text-blue-600 font-semibold">-${calculation.valueFromPoints.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-sm">
                            <span className="font-semibold">You Pay in Cash</span>
                            <span className="text-lg font-bold text-indigo-600">
                                ${calculation.cashRequired.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {calculation.savings > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                            <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-green-800">You Save</p>
                                <p className="text-lg font-bold text-green-600">${calculation.savings.toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => onConfirm(calculation.pointsUsable, calculation.cashRequired)}
                            disabled={!canRedeemWithCash}
                            className="flex-1"
                        >
                            Confirm ${calculation.cashRequired.toFixed(2)}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}