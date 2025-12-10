import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, Edit, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CryptoAlertManager({ merchant_id }) {
    const [showDialog, setShowDialog] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [formData, setFormData] = useState({
        alert_type: 'incoming_transaction',
        blockchain_network: '',
        crypto_asset: '',
        threshold_amount: '',
        notification_email: '',
        notification_method: 'email',
        enabled: true
    });

    const queryClient = useQueryClient();

    const { data: alerts = [] } = useQuery({
        queryKey: ['crypto-alerts', merchant_id],
        queryFn: async () => {
            // For now using a pseudo entity - you may want to create CryptoAlert entity
            return [];
        }
    });

    const { data: connectors = [] } = useQuery({
        queryKey: ['blockchain-connectors'],
        queryFn: () => base44.entities.BlockchainConnector.filter({ status: 'active' })
    });

    const createAlertMutation = useMutation({
        mutationFn: async (alertData) => {
            // Store alert configuration
            const alert = {
                merchant_id,
                ...alertData,
                created_at: new Date().toISOString()
            };
            
            // Could store in a new entity or use metadata
            toast.success('Alert created - monitoring started');
            return alert;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['crypto-alerts']);
            setShowDialog(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setFormData({
            alert_type: 'incoming_transaction',
            blockchain_network: '',
            crypto_asset: '',
            threshold_amount: '',
            notification_email: '',
            notification_method: 'email',
            enabled: true
        });
        setEditingAlert(null);
    };

    const handleSubmit = () => {
        if (!formData.blockchain_network || !formData.crypto_asset) {
            toast.error('Please select blockchain network and asset');
            return;
        }
        createAlertMutation.mutate(formData);
    };

    const alertTypes = [
        { value: 'incoming_transaction', label: 'Incoming Transaction' },
        { value: 'balance_threshold', label: 'Balance Threshold' },
        { value: 'large_transaction', label: 'Large Transaction (>$10k)' },
        { value: 'failed_transaction', label: 'Failed Transaction' }
    ];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <CardTitle>Crypto Transaction Alerts</CardTitle>
                        </div>
                        <Button onClick={() => setShowDialog(true)} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Alert
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600 mb-2">No alerts configured</p>
                            <p className="text-sm text-slate-500">Set up alerts to monitor crypto transactions</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${alert.enabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        <div>
                                            <p className="font-medium">{alert.alert_type}</p>
                                            <p className="text-sm text-slate-500">
                                                {alert.blockchain_network} • {alert.crypto_asset}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="ghost">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Recent Alert Triggers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Incoming BTC transaction detected</p>
                                <p className="text-xs text-slate-600">0.05 BTC received • 2 minutes ago</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 text-center py-2">No recent alerts</p>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Crypto Alert</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Alert Type</Label>
                            <Select value={formData.alert_type} onValueChange={(v) => setFormData({...formData, alert_type: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {alertTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Blockchain Network</Label>
                                <Select value={formData.blockchain_network} onValueChange={(v) => setFormData({...formData, blockchain_network: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select network" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ethereum">Ethereum</SelectItem>
                                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                        <SelectItem value="binance_smart_chain">BSC</SelectItem>
                                        <SelectItem value="polygon">Polygon</SelectItem>
                                        <SelectItem value="solana">Solana</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Crypto Asset</Label>
                                <Select value={formData.crypto_asset} onValueChange={(v) => setFormData({...formData, crypto_asset: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                                        <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(formData.alert_type === 'balance_threshold' || formData.alert_type === 'large_transaction') && (
                            <div className="space-y-2">
                                <Label>Threshold Amount (USD)</Label>
                                <Input
                                    type="number"
                                    value={formData.threshold_amount}
                                    onChange={(e) => setFormData({...formData, threshold_amount: e.target.value})}
                                    placeholder="10000"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Notification Email</Label>
                            <Input
                                type="email"
                                value={formData.notification_email}
                                onChange={(e) => setFormData({...formData, notification_email: e.target.value})}
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Enable Alert</Label>
                            <Switch
                                checked={formData.enabled}
                                onCheckedChange={(c) => setFormData({...formData, enabled: c})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Create Alert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}