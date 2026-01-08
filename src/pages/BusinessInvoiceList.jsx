import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function BusinessInvoiceList() {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => window.location.href = createPageUrl('BusinessEInvoicePortal')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Portal
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900">My Invoices</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-slate-500">
                            No invoices yet. Create your first invoice to get started.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}