import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, TrendingUp, Zap, Brain } from 'lucide-react';

export default function SmartRetry() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        merchant_id: '',
        config_name: '',
        max_retry_attempts: 3,
        ml_optimization_enabled: false,
        enabled: true
    });

    const queryClient = useQueryClient();

    const { data: retryConfigs = [] } = useQuery({
        queryKey: ['retry-configs'],
        queryFn: () => base44.entities.RetryConfiguration.list()
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.RetryConfiguration.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['retry-configs']);
            setDialogOpen(false);
            setFormData({
                merchant_id: '',
                config_name: '',
                max_retry_attempts: 3,
                ml_optimization_enabled: false,
                enabled: true
            });
        }
    });

    const avgSuccessRate = retryConfigs.reduce((sum, r) => {
        const rate = r.total_retries > 0 ? (r.successful_retries / r.total_retries) * 100 : 0;
        return sum + rate;
    }, 0) / retryConfigs.length || 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="SmartRetry" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <RotateCcw className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Smart Retry Logic</h1>
                                    <p className="text-slate-500">Intelligent payment retry strategies</p>
                                </div>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Zap className="h-4 w-4" />
                                        Create Strategy
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create Retry Strategy</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label>Merchant</Label>
                                            <Select value={formData.merchant_id} onValueChange={(v) => setFormData({...formData, merchant_id: v})}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select merchant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {merchants.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Strategy Name</Label>
                                            <Input
                                                value={formData.config_name}
                                                onChange={(e) => setFormData({...formData, config_name: e.target.value})}
                                                placeholder="e.g., Subscription Payment Retry"
                                            />
                                        </div>
                                        <div>
                                            <Label>Max Retry Attempts</Label>
                                            <Input
                                                type="number"
                                                value={formData.max_retry_attempts}
                                                onChange={(e) => setFormData({...formData, max_retry_attempts: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-6">
                                            <Switch
                                                checked={formData.ml_optimization_enabled}
                                                onCheckedChange={(checked) => setFormData({...formData, ml_optimization_enabled: checked})}
                                            />
                                            <Label>Enable ML Optimization</Label>
                                        </div>
                                    </div>
                                    <Button onClick={() => createMutation.mutate(formData)} className="w-full mt-4">
                                        Create Strategy
                                    </Button>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Active Strategies</p>
                                        <p className="text-2xl font-bold">{retryConfigs.filter(r => r.enabled).length}</p>
                                    </div>
                                    <Zap className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Retries</p>
                                        <p className="text-2xl font-bold">
                                            {retryConfigs.reduce((sum, r) => sum + (r.total_retries || 0), 0)}
                                        </p>
                                    </div>
                                    <RotateCcw className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Success Rate</p>
                                        <p className="text-2xl font-bold text-emerald-600">{avgSuccessRate.toFixed(1)}%</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">ML Optimized</p>
                                        <p className="text-2xl font-bold">
                                            {retryConfigs.filter(r => r.ml_optimization_enabled).length}
                                        </p>
                                    </div>
                                    <Brain className="h-8 w-8 text-pink-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>How Smart Retry Works</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm text-slate-700">
                                <p>
                                    Smart Retry uses machine learning and decline code analysis to automatically retry failed payments 
                                    at optimal times with the best chance of success. This recovers revenue without annoying customers.
                                </p>
                                <div className="grid md:grid-cols-4 gap-3 mt-4">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <h4 className="font-semibold mb-1 text-xs">📊 Decline Analysis</h4>
                                        <p className="text-xs text-slate-600">Interprets bank decline codes</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold mb-1 text-xs">⏰ Optimal Timing</h4>
                                        <p className="text-xs text-slate-600">Retries at best times</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-lg">
                                        <h4 className="font-semibold mb-1 text-xs">🔄 Gateway Switch</h4>
                                        <p className="text-xs text-slate-600">Routes to different PSPs</p>
                                    </div>
                                    <div className="p-3 bg-pink-50 rounded-lg">
                                        <h4 className="font-semibold mb-1 text-xs">🤖 ML Optimization</h4>
                                        <p className="text-xs text-slate-600">Learns from patterns</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Retry Strategies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Strategy Name</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Max Attempts</TableHead>
                                        <TableHead>Total Retries</TableHead>
                                        <TableHead>Success Rate</TableHead>
                                        <TableHead>ML Enabled</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {retryConfigs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                No retry strategies configured yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        retryConfigs.map((config) => {
                                            const successRate = config.total_retries > 0 
                                                ? ((config.successful_retries / config.total_retries) * 100).toFixed(1)
                                                : 0;
                                            return (
                                                <TableRow key={config.id}>
                                                    <TableCell className="font-medium">{config.config_name}</TableCell>
                                                    <TableCell>
                                                        {merchants.find(m => m.id === config.merchant_id)?.business_name || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>{config.max_retry_attempts}</TableCell>
                                                    <TableCell>{config.total_retries || 0}</TableCell>
                                                    <TableCell>
                                                        <span className="text-emerald-600 font-semibold">{successRate}%</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {config.ml_optimization_enabled ? (
                                                            <Badge className="bg-pink-100 text-pink-700">ML Active</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Rule-based</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={config.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                            {config.enabled ? 'Active' : 'Disabled'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}