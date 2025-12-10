import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { TrendingUp, ArrowUpCircle, ArrowDownCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ExchangeIntegrations() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        on_ramp_enabled: true,
        off_ramp_enabled: true,
        kyc_required: true
    });
    const queryClient = useQueryClient();

    const { data: integrations = [] } = useQuery({
        queryKey: ['exchangeIntegrations'],
        queryFn: () => base44.entities.CryptoExchangeIntegration.list('-created_date'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CryptoExchangeIntegration.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['exchangeIntegrations']);
            setDialogOpen(false);
            toast.success('Exchange integration created');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            integration_id: `ex_${Date.now()}`,
            status: 'active'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="ExchangeIntegrations" />
            
            <div className={cn("transition-all duration-300 lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Crypto Exchange Integrations</h1>
                            <p className="text-slate-500">Fiat on/off-ramp via licensed exchanges</p>
                        </div>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Integration
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {integrations.map((integration) => (
                            <Card key={integration.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{integration.exchange_name}</CardTitle>
                                        <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                                            {integration.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Type</span>
                                            <span className="text-sm">{integration.exchange_type}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                {integration.on_ramp_enabled ? (
                                                    <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <ArrowUpCircle className="h-4 w-4 text-slate-300" />
                                                )}
                                                <span className="text-xs">On-Ramp</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {integration.off_ramp_enabled ? (
                                                    <ArrowDownCircle className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <ArrowDownCircle className="h-4 w-4 text-slate-300" />
                                                )}
                                                <span className="text-xs">Off-Ramp</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Travel Rule</span>
                                            <Badge variant={integration.supports_travel_rule ? 'default' : 'outline'}>
                                                {integration.supports_travel_rule ? 'Supported' : 'N/A'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Success Rate</span>
                                            <span className="text-sm font-medium text-emerald-600">
                                                {integration.success_rate || 100}%
                                            </span>
                                        </div>

                                        {integration.on_ramp_fee_percentage && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-500">On-Ramp Fee</span>
                                                <span className="text-sm">{integration.on_ramp_fee_percentage}%</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add Exchange Integration</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Exchange Name *</Label>
                                    <Select 
                                        value={formData.exchange_name} 
                                        onValueChange={(val) => setFormData({...formData, exchange_name: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select exchange" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Coinbase">Coinbase</SelectItem>
                                            <SelectItem value="Kraken">Kraken</SelectItem>
                                            <SelectItem value="Bitstamp">Bitstamp</SelectItem>
                                            <SelectItem value="Gemini">Gemini</SelectItem>
                                            <SelectItem value="Circle">Circle</SelectItem>
                                            <SelectItem value="Paxos">Paxos</SelectItem>
                                            <SelectItem value="MoonPay">MoonPay</SelectItem>
                                            <SelectItem value="Ramp Network">Ramp Network</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Exchange Type *</Label>
                                    <Select 
                                        value={formData.exchange_type} 
                                        onValueChange={(val) => setFormData({...formData, exchange_type: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="institutional">Institutional</SelectItem>
                                            <SelectItem value="retail">Retail</SelectItem>
                                            <SelectItem value="otc">OTC</SelectItem>
                                            <SelectItem value="liquidity_provider">Liquidity Provider</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>API Endpoint *</Label>
                                    <Input
                                        value={formData.api_endpoint || ''}
                                        onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})}
                                        placeholder="https://api.exchange.com"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>On-Ramp Fee %</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.on_ramp_fee_percentage || ''}
                                            onChange={(e) => setFormData({...formData, on_ramp_fee_percentage: parseFloat(e.target.value)})}
                                            placeholder="2.5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Off-Ramp Fee %</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.off_ramp_fee_percentage || ''}
                                            onChange={(e) => setFormData({...formData, off_ramp_fee_percentage: parseFloat(e.target.value)})}
                                            placeholder="2.5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>On-Ramp Enabled</Label>
                                        <Switch
                                            checked={formData.on_ramp_enabled}
                                            onCheckedChange={(val) => setFormData({...formData, on_ramp_enabled: val})}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Off-Ramp Enabled</Label>
                                        <Switch
                                            checked={formData.off_ramp_enabled}
                                            onCheckedChange={(val) => setFormData({...formData, off_ramp_enabled: val})}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Travel Rule Support</Label>
                                        <Switch
                                            checked={formData.supports_travel_rule}
                                            onCheckedChange={(val) => setFormData({...formData, supports_travel_rule: val})}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>KYC Required</Label>
                                        <Switch
                                            checked={formData.kyc_required}
                                            onCheckedChange={(val) => setFormData({...formData, kyc_required: val})}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create Integration</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}