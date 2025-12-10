import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Link as LinkIcon, FileText, RefreshCcw } from 'lucide-react';

export default function QuickActionsPanel() {
    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                    <Button className="h-auto flex-col gap-2 py-4">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-sm">Virtual Terminal</span>
                    </Button>
                    <Button className="h-auto flex-col gap-2 py-4" variant="outline">
                        <LinkIcon className="h-5 w-5" />
                        <span className="text-sm">Payment Link</span>
                    </Button>
                    <Button className="h-auto flex-col gap-2 py-4" variant="outline">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm">Export Report</span>
                    </Button>
                    <Button className="h-auto flex-col gap-2 py-4" variant="outline">
                        <RefreshCcw className="h-5 w-5" />
                        <span className="text-sm">Initiate Refund</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}