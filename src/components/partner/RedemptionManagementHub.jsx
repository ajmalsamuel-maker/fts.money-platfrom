import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QrCode, Check, X, Search, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RedemptionManagementHub({ partnerId, programId }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending_approval');
    const [qrScannerOpen, setQrScannerOpen] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const queryClient = useQueryClient();

    const { data: redemptions = [], isLoading } = useQuery({
        queryKey: ['redemptions', programId, statusFilter],
        queryFn: async () => {
            const allRedemptions = await base44.entities.TokenRedemption.filter({ program_id: programId });
            return allRedemptions.filter(r => r.status === statusFilter);
        }
    });

    const { data: rewards = [] } = useQuery({
        queryKey: ['rewards', programId],
        queryFn: () => base44.entities.RedemptionOption.filter({ program_id: programId })
    });

    const fulfillMutation = useMutation({
        mutationFn: async (redemptionId) => {
            await base44.entities.TokenRedemption.update(redemptionId, {
                status: 'fulfilled',
                approved_date: new Date().toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['redemptions']);
            toast.success('Redemption fulfilled successfully!');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ redemptionId, reason }) => {
            await base44.entities.TokenRedemption.update(redemptionId, {
                status: 'rejected',
                rejection_reason: reason
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['redemptions']);
            toast.success('Redemption rejected');
        }
    });

    const handleQRScan = async () => {
        if (!qrCode) return;
        
        const redemption = redemptions.find(r => r.id === qrCode);
        if (redemption) {
            fulfillMutation.mutate(redemption.id);
            setQrCode('');
            setQrScannerOpen(false);
        } else {
            toast.error('Invalid QR code');
        }
    };

    const enrichedRedemptions = redemptions.map(r => ({
        ...r,
        reward: rewards.find(rw => rw.id === r.redemption_option_id)
    })).filter(r => 
        !searchTerm || 
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reward?.reward_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColors = {
        pending_approval: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        processing: 'bg-purple-100 text-purple-800',
        fulfilled: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 flex-1 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search redemptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" onClick={() => setQrScannerOpen(true)}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan QR
                    </Button>
                </div>
                
                <div className="flex gap-2">
                    {['pending_approval', 'processing', 'fulfilled'].map(status => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <Card>
                        <CardContent className="p-6 text-center text-gray-500">
                            Loading redemptions...
                        </CardContent>
                    </Card>
                ) : enrichedRedemptions.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-gray-500">
                            No {statusFilter.replace('_', ' ')} redemptions found
                        </CardContent>
                    </Card>
                ) : (
                    enrichedRedemptions.map(redemption => (
                        <Card key={redemption.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{redemption.reward?.reward_name || 'Unknown Reward'}</h3>
                                            <Badge className={statusColors[redemption.status]}>
                                                {redemption.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>Redemption ID: <span className="font-mono">{redemption.id.slice(-8)}</span></p>
                                            <p>Points: <span className="font-semibold">{redemption.tokens_redeemed}</span></p>
                                            <p>Date: {format(new Date(redemption.created_date), 'MMM dd, yyyy HH:mm')}</p>
                                            {redemption.rejection_reason && (
                                                <p className="text-red-600">Reason: {redemption.rejection_reason}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {redemption.status === 'pending_approval' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => fulfillMutation.mutate(redemption.id)}
                                                disabled={fulfillMutation.isPending}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Fulfill
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    const reason = prompt('Rejection reason:');
                                                    if (reason) {
                                                        rejectMutation.mutate({ redemptionId: redemption.id, reason });
                                                    }
                                                }}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                            <QrCode className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm text-gray-600">QR Scanner placeholder</p>
                            <p className="text-xs text-gray-500 mt-2">In production, integrate with device camera</p>
                        </div>
                        <Input
                            placeholder="Or enter QR code manually"
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value)}
                        />
                        <Button onClick={handleQRScan} className="w-full">
                            Verify & Fulfill
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}