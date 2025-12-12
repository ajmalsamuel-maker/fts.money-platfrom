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
import { Textarea } from "@/components/ui/textarea";
import { Code, Zap, TrendingUp, Eye } from 'lucide-react';

export default function CheckoutComponents() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        merchant_id: '',
        component_type: 'payment_form',
        component_name: '',
        allowed_domains: []
    });

    const queryClient = useQueryClient();

    const { data: components = [] } = useQuery({
        queryKey: ['checkout-components'],
        queryFn: () => base44.entities.CheckoutComponent.list()
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CheckoutComponent.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['checkout-components']);
            setDialogOpen(false);
        }
    });

    const avgConversion = components.reduce((sum, c) => sum + (c.conversion_rate || 0), 0) / components.length || 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="CheckoutComponents" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                    <Code className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Checkout Components</h1>
                                    <p className="text-slate-500">Embeddable payment forms & hosted pages</p>
                                </div>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Code className="h-4 w-4" />
                                        Create Component
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create Checkout Component</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4">
                                        <div>
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
                                        <div>
                                            <Label>Component Type</Label>
                                            <Select value={formData.component_type} onValueChange={(v) => setFormData({...formData, component_type: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="payment_form">Payment Form</SelectItem>
                                                    <SelectItem value="card_element">Card Element</SelectItem>
                                                    <SelectItem value="hosted_page">Hosted Payment Page</SelectItem>
                                                    <SelectItem value="payment_request_button">Payment Request Button</SelectItem>
                                                    <SelectItem value="express_checkout">Express Checkout</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Component Name</Label>
                                            <Input
                                                value={formData.component_name}
                                                onChange={(e) => setFormData({...formData, component_name: e.target.value})}
                                                placeholder="e.g., Main Checkout Form"
                                            />
                                        </div>
                                        <div>
                                            <Label>Allowed Domains (comma-separated)</Label>
                                            <Textarea
                                                placeholder="example.com, app.example.com"
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    allowed_domains: e.target.value.split(',').map(d => d.trim())
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={() => createMutation.mutate(formData)} className="w-full mt-4">
                                        Generate Component
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
                                        <p className="text-sm text-slate-500">Active Components</p>
                                        <p className="text-2xl font-bold">{components.filter(c => c.status === 'active').length}</p>
                                    </div>
                                    <Code className="h-8 w-8 text-cyan-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Usage</p>
                                        <p className="text-2xl font-bold">
                                            {components.reduce((sum, c) => sum + (c.usage_count || 0), 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <Eye className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Avg Conversion</p>
                                        <p className="text-2xl font-bold text-emerald-600">{avgConversion.toFixed(1)}%</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Component Types</p>
                                        <p className="text-2xl font-bold">5</p>
                                    </div>
                                    <Zap className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Component Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-5 gap-3">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-1">Payment Form</h4>
                                    <p className="text-xs text-slate-600">Full checkout experience</p>
                                </div>
                                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-1">Card Element</h4>
                                    <p className="text-xs text-slate-600">Embeddable card input</p>
                                </div>
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-1">Hosted Page</h4>
                                    <p className="text-xs text-slate-600">Redirect to payment page</p>
                                </div>
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-1">Payment Button</h4>
                                    <p className="text-xs text-slate-600">Apple Pay, Google Pay</p>
                                </div>
                                <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-1">Express Checkout</h4>
                                    <p className="text-xs text-slate-600">1-click checkout</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Checkout Components</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Component Name</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Conversion</TableHead>
                                        <TableHead>Domains</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {components.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                No checkout components created yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        components.map((component) => (
                                            <TableRow key={component.id}>
                                                <TableCell className="font-medium">{component.component_name}</TableCell>
                                                <TableCell>
                                                    {merchants.find(m => m.id === component.merchant_id)?.business_name || 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {component.component_type?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{(component.usage_count || 0).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <span className="text-emerald-600 font-semibold">
                                                        {(component.conversion_rate || 0).toFixed(1)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {component.allowed_domains?.length || 0} domains
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={component.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                        {component.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
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