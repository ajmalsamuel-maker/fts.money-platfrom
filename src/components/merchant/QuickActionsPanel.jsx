import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Link as LinkIcon, FileText, RefreshCcw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function QuickActionsPanel({ selectedMID, transactions }) {
    const navigate = useNavigate();
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false);
    const [refundTxnId, setRefundTxnId] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [linkAmount, setLinkAmount] = useState('');
    const [linkDescription, setLinkDescription] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const handleVirtualTerminal = () => {
        navigate(createPageUrl('MerchantDataTransactions'));
    };

    const handleExportReport = () => {
        const csv = [
            ['Transaction ID', 'Date', 'Amount', 'Status', 'Type'].join(','),
            ...transactions.slice(0, 100).map(t => [
                t.transaction_id || t.id,
                new Date(t.created_date).toLocaleDateString(),
                t.amount || 0,
                t.status || 'unknown',
                t.type || 'sale'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
    };

    const handleRefund = () => {
        if (!refundTxnId || !refundAmount) {
            toast.error('Please fill in all fields');
            return;
        }
        toast.success(`Refund of $${refundAmount} initiated for transaction ${refundTxnId}`);
        setShowRefundDialog(false);
        setRefundTxnId('');
        setRefundAmount('');
    };

    const handleGenerateLink = () => {
        if (!linkAmount || !linkDescription) {
            toast.error('Please fill in all fields');
            return;
        }
        const link = `https://pay.merchantportal.com/${selectedMID}/${Date.now()}`;
        setGeneratedLink(link);
        toast.success('Payment link generated');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Link copied to clipboard');
    };

    return (
        <>
            <Card>
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-3">
                        <Button className="h-auto flex-col gap-2 py-4" onClick={handleVirtualTerminal}>
                            <CreditCard className="h-5 w-5" />
                            <span className="text-sm">Virtual Terminal</span>
                        </Button>
                        <Button className="h-auto flex-col gap-2 py-4" variant="outline" onClick={() => setShowPaymentLinkDialog(true)}>
                            <LinkIcon className="h-5 w-5" />
                            <span className="text-sm">Payment Link</span>
                        </Button>
                        <Button className="h-auto flex-col gap-2 py-4" variant="outline" onClick={handleExportReport}>
                            <FileText className="h-5 w-5" />
                            <span className="text-sm">Export Report</span>
                        </Button>
                        <Button className="h-auto flex-col gap-2 py-4" variant="outline" onClick={() => setShowRefundDialog(true)}>
                            <RefreshCcw className="h-5 w-5" />
                            <span className="text-sm">Initiate Refund</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Refund Dialog */}
            <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Initiate Refund</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Transaction ID</Label>
                            <Input 
                                placeholder="Enter transaction ID" 
                                value={refundTxnId}
                                onChange={(e) => setRefundTxnId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Refund Amount</Label>
                            <Input 
                                type="number"
                                placeholder="0.00" 
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRefundDialog(false)}>Cancel</Button>
                        <Button onClick={handleRefund}>Process Refund</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Link Dialog */}
            <Dialog open={showPaymentLinkDialog} onOpenChange={setShowPaymentLinkDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Payment Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input 
                                type="number"
                                placeholder="0.00" 
                                value={linkAmount}
                                onChange={(e) => setLinkAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input 
                                placeholder="Payment for..." 
                                value={linkDescription}
                                onChange={(e) => setLinkDescription(e.target.value)}
                            />
                        </div>
                        {generatedLink && (
                            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border">
                                <Label className="text-xs">Generated Link</Label>
                                <div className="flex gap-2">
                                    <Input value={generatedLink} readOnly className="text-sm" />
                                    <Button size="icon" variant="outline" onClick={copyLink}>
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowPaymentLinkDialog(false);
                            setGeneratedLink('');
                            setLinkAmount('');
                            setLinkDescription('');
                        }}>Close</Button>
                        <Button onClick={handleGenerateLink}>Generate Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}