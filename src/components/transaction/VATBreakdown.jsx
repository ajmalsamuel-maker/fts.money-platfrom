import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Receipt, AlertCircle } from 'lucide-react';

export default function VATBreakdown({ vatData, showDetails = true }) {
    if (!vatData || !vatData.vat_enabled || vatData.vat_amount === 0) {
        return null;
    }

    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">VAT Details</CardTitle>
                    <Badge variant="outline" className="bg-white">
                        {vatData.vat_rate}% {vatData.vat_jurisdiction}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {vatData.reverse_charge && (
                    <Alert className="mb-3 bg-purple-50 border-purple-200">
                        <AlertCircle className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-purple-900">
                            B2B Reverse Charge Applied - Buyer is responsible for VAT
                        </AlertDescription>
                    </Alert>
                )}
                
                {showDetails && (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Net Amount:</span>
                            <span className="font-medium">${vatData.net_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                            <span>VAT ({vatData.vat_rate}%):</span>
                            <span className="font-medium">+${vatData.vat_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-200 font-bold">
                            <span>Total:</span>
                            <span>${vatData.gross_amount.toFixed(2)}</span>
                        </div>
                        {vatData.inclusive_pricing && (
                            <p className="text-xs text-slate-500 mt-2">
                                * VAT inclusive pricing
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function VATSummaryBadge({ vatData }) {
    if (!vatData || !vatData.vat_enabled || vatData.vat_amount === 0) {
        return null;
    }

    return (
        <Badge className="bg-blue-100 text-blue-800">
            <Receipt className="h-3 w-3 mr-1" />
            VAT: ${vatData.vat_amount.toFixed(2)} ({vatData.vat_rate}%)
        </Badge>
    );
}