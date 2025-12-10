import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bitcoin, Send, Clock, CheckCircle2, XCircle, Plus, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CryptoPayouts() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showPayoutDialog, setShowPayoutDialog] = useState(false);
    const [formData, setFormData] = useState({
        merchant_id: '',
        crypto_asset: 'BTC',
        amount_crypto: '',
        destination_address: '',
        blockchain_network: 'bitcoin',
        description: ''
    });

    const queryClient = useQueryClient();

    const { data: payouts = [] } = useQuery({
        queryKey: ['crypto-payouts'],
        queryFn: async () => {
            return await base44.entities.Payout.filter({ type: 'crypto' }, '-created_date', 50);
        }
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const { data: connectors = [] } = useQuery({
        queryKey: ['blockchain-connectors'],
        queryFn: () => base44.entities.BlockchainConnector.filter({ status: 'active' })
    });

    const createPayoutMutation = useMutation({
        mutationFn: async (payoutData) => {
            // Validate address format
            const addressValidation = await base44.functions.invoke('blockchainConnector', {
                action: 'validate_address',
                blockchain_network: payoutData.blockchain_network,
                address: payoutData.destination_address
            });

            if (!addressValidation.data?.valid) {
                throw new Error('Invalid blockchain address');
            }

            // Check balance
            const connector = connectors.find(c => c.blockchain_network === payoutData.blockchain_network);
            if (!connector) {
                throw new Error('No connector available for this network');
            }

            // Create payout record
            const payout = await base44.entities.Payout.create({
                merchant_id: payoutData.merchant_id,
                type: 'crypto',
                amount: parseFloat(payoutData.amount_crypto),
                currency: payoutData.crypto_asset,
                status: 'pending',
                crypto_asset: payoutData.crypto_asset,
                crypto_address: payoutData.destination_address,
                blockchain_network: payoutData.blockchain_network,
                description: payoutData.description,
                initiated_date: new Date().toISOString()
            });

            // Process blockchain transaction
            const txResult = await base44.functions.invoke('blockchainConnector', {
                action: 'send_transaction',
                connector_id: connector.connector_id,
                data: {
                    to_address: payoutData.destination_address,
                    amount: parseFloat(payoutData.amount_crypto),
                    asset: payoutData.crypto_asset
                }
            });

            // Update payout with transaction hash
            await base44.entities.Payout.update(payout.id, {
                status: 'processing',
                crypto_tx_hash: txResult.data?.transaction_hash,
                transaction_data: txResult.data
            });

            return payout;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['crypto-payouts']);
            toast.success('Crypto payout initiated');
            setShowPayoutDialog(false);
            setFormData({
                merchant_id: '',
                crypto_asset: 'BTC',
                amount_crypto: '',
                destination_address: '',
                blockchain_network: 'bitcoin',
                description: ''
            });
        },
        onError: (error) => {
            toast.error('Payout failed: ' + error.message);
        }
    });

    const statusConfig = {
        pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending' },
        processing: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Processing' },
        completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Completed' },
        failed: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Failed' }
    };

    const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'processing');
    const completedPayouts = payouts.filter(p => p.status === 'completed');
    const failedPayouts = payouts.filter(p => p.status === 'failed');

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="CryptoPayouts" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Crypto Payouts</h1>
                            <p className="text-slate-500">Manage cryptocurrency payouts to merchants</p>
                        </div>
                        <Button onClick={() => setShowPayoutDialog(true)} className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New Crypto Payout
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Bitcoin className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Total Payouts</p>
                                        <p className="text-2xl font-bold">{payouts.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Pending</p>
                                        <p className="text-2xl font-bold text-blue-600">{pendingPayouts.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Completed</p>
                                        <p className="text-2xl font-bold text-green-600">{completedPayouts.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Failed</p>
                                        <p className="text-2xl font-bold text-red-600">{failedPayouts.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="all" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="all">All Payouts</TabsTrigger>
                            <TabsTrigger value="pending">Pending ({pendingPayouts.length})</TabsTrigger>
                            <TabsTrigger value="completed">Completed ({completedPayouts.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Merchant</TableHead>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>TX Hash</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payouts.map(payout => {
                                            const StatusIcon = statusConfig[payout.status]?.icon || Clock;
                                            return (
                                                <TableRow key={payout.id}>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(payout.created_date), 'MMM dd, yyyy HH:mm')}
                                                    </TableCell>
                                                    <TableCell>{merchants.find(m => m.id === payout.merchant_id)?.business_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{payout.crypto_asset}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono">
                                                        {payout.amount?.toFixed(8)}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {payout.crypto_address?.slice(0, 10)}...{payout.crypto_address?.slice(-8)}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {payout.crypto_tx_hash ? (
                                                            <a href={`#`} className="text-blue-600 hover:underline">
                                                                {payout.crypto_tx_hash.slice(0, 10)}...
                                                            </a>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusConfig[payout.status]?.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusConfig[payout.status]?.label}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pending">
                            <Card>
                                <CardContent className="p-6">
                                    {pendingPayouts.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No pending payouts</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingPayouts.map(payout => (
                                                <div key={payout.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{payout.crypto_asset} Payout</p>
                                                            <p className="text-sm text-slate-500">
                                                                {payout.amount} {payout.crypto_asset} to {payout.crypto_address?.slice(0, 20)}...
                                                            </p>
                                                        </div>
                                                        <Badge className={statusConfig[payout.status]?.color}>
                                                            {statusConfig[payout.status]?.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="completed">
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Merchant</TableHead>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>TX Hash</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {completedPayouts.map(payout => (
                                            <TableRow key={payout.id}>
                                                <TableCell>{format(new Date(payout.created_date), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>{merchants.find(m => m.id === payout.merchant_id)?.business_name}</TableCell>
                                                <TableCell><Badge variant="outline">{payout.crypto_asset}</Badge></TableCell>
                                                <TableCell className="font-mono">{payout.amount?.toFixed(8)}</TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    <a href="#" className="text-blue-600 hover:underline">
                                                        {payout.crypto_tx_hash?.slice(0, 16)}...
                                                    </a>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* New Payout Dialog */}
            <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Crypto Payout</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-900">Important</p>
                                <p className="text-xs text-amber-700">Crypto transactions are irreversible. Verify all details before proceeding.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Merchant</Label>
                            <Select value={formData.merchant_id} onValueChange={(v) => setFormData({...formData, merchant_id: v})}>
                                <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Blockchain Network</Label>
                                <Select value={formData.blockchain_network} onValueChange={(v) => setFormData({...formData, blockchain_network: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                        <SelectItem value="ethereum">Ethereum</SelectItem>
                                        <SelectItem value="binance_smart_chain">BSC</SelectItem>
                                        <SelectItem value="polygon">Polygon</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Crypto Asset</Label>
                                <Select value={formData.crypto_asset} onValueChange={(v) => setFormData({...formData, crypto_asset: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                                        <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Amount (Crypto)</Label>
                            <Input
                                type="number"
                                step="0.00000001"
                                value={formData.amount_crypto}
                                onChange={(e) => setFormData({...formData, amount_crypto: e.target.value})}
                                placeholder="0.00000000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Destination Address</Label>
                            <Input
                                value={formData.destination_address}
                                onChange={(e) => setFormData({...formData, destination_address: e.target.value})}
                                placeholder="0x... or bc1..."
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Payout description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={() => createPayoutMutation.mutate(formData)}
                            disabled={!formData.merchant_id || !formData.amount_crypto || !formData.destination_address || createPayoutMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Send Payout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}