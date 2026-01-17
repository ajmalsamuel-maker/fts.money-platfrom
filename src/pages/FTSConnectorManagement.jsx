import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plug, Plus, Settings, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CONNECTOR_OPTIONS = [
    { value: 'stripe', label: 'Stripe', type: 'payment_gateway', logo: '🔷' },
    { value: 'paypal', label: 'PayPal', type: 'payment_gateway', logo: '🅿️' },
    { value: 'adyen', label: 'Adyen', type: 'payment_gateway', logo: '🔶' },
    { value: 'square', label: 'Square', type: 'payment_gateway', logo: '⬛' },
    { value: 'checkout', label: 'Checkout.com', type: 'payment_gateway', logo: '✅' },
    { value: 'worldpay', label: 'Worldpay', type: 'payment_gateway', logo: '🌐' },
    { value: 'circle', label: 'Circle USDC', type: 'crypto_processor', logo: '⭕' },
    { value: 'fireblocks', label: 'Fireblocks', type: 'crypto_processor', logo: '🔥' },
];

export default function FTSConnectorManagement() {
    const [activeTab, setActiveTab] = useState('connectors');
    const [showConnectorDialog, setShowConnectorDialog] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState(null);
    const [connectorForm, setConnectorForm] = useState({
        connector_name: 'stripe',
        display_name: '',
        environment: 'production',
        master_api_key: '',
        master_api_secret: ''
    });
    const [assignmentForm, setAssignmentForm] = useState({
        psp_code: '',
        platform_connector_id: '',
        monthly_volume_limit: '',
        monthly_transaction_limit: ''
    });

    const queryClient = useQueryClient();

    const { data: connectors = [] } = useQuery({
        queryKey: ['platform-connectors'],
        queryFn: () => base44.entities.PlatformConnector.list('-created_date')
    });

    const { data: assignments = [] } = useQuery({
        queryKey: ['connector-assignments'],
        queryFn: () => base44.entities.PSPConnectorAssignment.list('-created_date')
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ status: 'active' })
    });

    const { data: usageMetrics = [] } = useQuery({
        queryKey: ['connector-usage'],
        queryFn: () => base44.entities.ConnectorUsageMetric.list('-created_date', 100)
    });

    const createConnectorMutation = useMutation({
        mutationFn: (data) => base44.entities.PlatformConnector.create({
            ...data,
            connector_id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'active'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-connectors'] });
            toast.success('Connector added successfully');
            setShowConnectorDialog(false);
            setConnectorForm({ connector_name: 'stripe', display_name: '', environment: 'production', master_api_key: '', master_api_secret: '' });
        }
    });

    const assignConnectorMutation = useMutation({
        mutationFn: (data) => {
            const connector = connectors.find(c => c.id === data.platform_connector_id);
            return base44.entities.PSPConnectorAssignment.create({
                ...data,
                connector_name: connector?.connector_name,
                assignment_status: 'assigned',
                assigned_date: new Date().toISOString(),
                usage_limits: {
                    monthly_volume_limit: parseInt(data.monthly_volume_limit) || null,
                    monthly_transaction_limit: parseInt(data.monthly_transaction_limit) || null
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connector-assignments'] });
            toast.success('Connector assigned to PSP');
            setShowAssignDialog(false);
            setAssignmentForm({ psp_code: '', platform_connector_id: '', monthly_volume_limit: '', monthly_transaction_limit: '' });
        }
    });

    const totalVolume = usageMetrics.reduce((sum, m) => sum + (m.total_volume || 0), 0);
    const totalTransactions = usageMetrics.reduce((sum, m) => sum + (m.total_transactions || 0), 0);
    const totalFees = usageMetrics.reduce((sum, m) => sum + (m.platform_fees_charged || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Plug className="h-8 w-8 text-blue-600" />
                            Connector Management
                        </h1>
                        <p className="text-slate-500 mt-1">Platform-level payment connector provisioning & monitoring</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Plug className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Total Connectors</p>
                                    <p className="text-2xl font-bold">{connectors.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Activity className="h-8 w-8 text-emerald-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Active Assignments</p>
                                    <p className="text-2xl font-bold">{assignments.filter(a => a.assignment_status === 'active').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Total Volume</p>
                                    <p className="text-2xl font-bold">${(totalVolume / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Platform Fees</p>
                                    <p className="text-2xl font-bold">${(totalFees / 1000).toFixed(1)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="connectors">Platform Connectors</TabsTrigger>
                        <TabsTrigger value="assignments">PSP Assignments</TabsTrigger>
                        <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
                    </TabsList>

                    {/* Platform Connectors Tab */}
                    <TabsContent value="connectors">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Master Connector Registry</CardTitle>
                                <Button onClick={() => setShowConnectorDialog(true)} className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Connector
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Connector</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Environment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Health</TableHead>
                                            <TableHead>Total Volume</TableHead>
                                            <TableHead>PSPs Using</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {connectors.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                    No connectors configured yet
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            connectors.map(conn => {
                                                const pspCount = assignments.filter(a => a.platform_connector_id === conn.id).length;
                                                return (
                                                    <TableRow key={conn.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl">{CONNECTOR_OPTIONS.find(o => o.value === conn.connector_name)?.logo || '🔌'}</span>
                                                                <div>
                                                                    <p className="font-medium">{conn.display_name || conn.connector_name}</p>
                                                                    <p className="text-xs text-slate-500">{conn.connector_name}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="capitalize">{conn.connector_type?.replace('_', ' ')}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={conn.environment === 'production' ? 'default' : 'secondary'}>
                                                                {conn.environment}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                conn.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                conn.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {conn.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {conn.connection_verified ? (
                                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-slate-400" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            ${(conn.total_volume_processed || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{pspCount} PSPs</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PSP Assignments Tab */}
                    <TabsContent value="assignments">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>PSP Connector Assignments</CardTitle>
                                <Button onClick={() => setShowAssignDialog(true)} className="gap-2">
                                    <Plus className="h-4 w-4" /> Assign to PSP
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>PSP</TableHead>
                                            <TableHead>Connector</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Enabled by PSP</TableHead>
                                            <TableHead>Volume Limit</TableHead>
                                            <TableHead>Assigned Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                                    No assignments yet - assign connectors to PSPs to get started
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            assignments.map(assignment => (
                                                <TableRow key={assignment.id}>
                                                    <TableCell className="font-medium">{assignment.psp_name || assignment.psp_code}</TableCell>
                                                    <TableCell className="capitalize">{assignment.connector_name}</TableCell>
                                                    <TableCell>
                                                        <Badge className={
                                                            assignment.assignment_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            assignment.assignment_status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }>
                                                            {assignment.assignment_status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {assignment.enabled_by_psp ? (
                                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-slate-400" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {assignment.usage_limits?.monthly_volume_limit 
                                                            ? `$${(assignment.usage_limits.monthly_volume_limit / 1000).toFixed(0)}K`
                                                            : 'Unlimited'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-500">
                                                        {assignment.assigned_date ? format(new Date(assignment.assigned_date), 'MMM dd, yyyy') : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Usage Analytics Tab */}
                    <TabsContent value="usage">
                        <Card>
                            <CardHeader>
                                <CardTitle>Connector Usage by PSP</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>PSP</TableHead>
                                            <TableHead>Connector</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Transactions</TableHead>
                                            <TableHead>Volume</TableHead>
                                            <TableHead>Success Rate</TableHead>
                                            <TableHead>Platform Fees</TableHead>
                                            <TableHead>Billed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usageMetrics.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                    No usage data yet
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            usageMetrics.map(metric => (
                                                <TableRow key={metric.id}>
                                                    <TableCell className="font-medium">{metric.psp_code}</TableCell>
                                                    <TableCell className="capitalize">{metric.connector_name}</TableCell>
                                                    <TableCell className="text-sm text-slate-600">
                                                        {metric.period_start && format(new Date(metric.period_start), 'MMM dd')}
                                                        {metric.period_end && ` - ${format(new Date(metric.period_end), 'MMM dd')}`}
                                                    </TableCell>
                                                    <TableCell>{metric.total_transactions?.toLocaleString()}</TableCell>
                                                    <TableCell className="font-medium">${metric.total_volume?.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <span className={metric.success_rate >= 95 ? 'text-emerald-600' : 'text-amber-600'}>
                                                            {metric.success_rate?.toFixed(1)}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-blue-600">
                                                        ${metric.platform_fees_charged?.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {metric.billed ? (
                                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-amber-500" />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Add Connector Dialog */}
                <Dialog open={showConnectorDialog} onOpenChange={setShowConnectorDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Platform Connector</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Connector Provider</Label>
                                <Select value={connectorForm.connector_name} onValueChange={(v) => setConnectorForm({...connectorForm, connector_name: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONNECTOR_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.logo} {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input 
                                    value={connectorForm.display_name}
                                    onChange={(e) => setConnectorForm({...connectorForm, display_name: e.target.value})}
                                    placeholder="e.g., Stripe Production US"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Environment</Label>
                                <Select value={connectorForm.environment} onValueChange={(v) => setConnectorForm({...connectorForm, environment: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox/Test</SelectItem>
                                        <SelectItem value="production">Production</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Master API Key</Label>
                                <Input 
                                    type="password"
                                    value={connectorForm.master_api_key}
                                    onChange={(e) => setConnectorForm({...connectorForm, master_api_key: e.target.value})}
                                    placeholder="Platform-level API key"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Master API Secret</Label>
                                <Input 
                                    type="password"
                                    value={connectorForm.master_api_secret}
                                    onChange={(e) => setConnectorForm({...connectorForm, master_api_secret: e.target.value})}
                                    placeholder="Platform-level API secret"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConnectorDialog(false)}>Cancel</Button>
                            <Button onClick={() => createConnectorMutation.mutate(connectorForm)}>Add Connector</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Assign Connector to PSP Dialog */}
                <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign Connector to PSP</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>PSP</Label>
                                <Select value={assignmentForm.psp_code} onValueChange={(v) => {
                                    const psp = psps.find(p => p.psp_code === v);
                                    setAssignmentForm({...assignmentForm, psp_code: v, psp_name: psp?.psp_name});
                                }}>
                                    <SelectTrigger><SelectValue placeholder="Select PSP" /></SelectTrigger>
                                    <SelectContent>
                                        {psps.map(psp => (
                                            <SelectItem key={psp.id} value={psp.psp_code}>
                                                {psp.psp_name} ({psp.psp_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Connector</Label>
                                <Select value={assignmentForm.platform_connector_id} onValueChange={(v) => setAssignmentForm({...assignmentForm, platform_connector_id: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select connector" /></SelectTrigger>
                                    <SelectContent>
                                        {connectors.filter(c => c.status === 'active').map(conn => (
                                            <SelectItem key={conn.id} value={conn.id}>
                                                {conn.display_name || conn.connector_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Monthly Volume Limit</Label>
                                    <Input 
                                        type="number"
                                        value={assignmentForm.monthly_volume_limit}
                                        onChange={(e) => setAssignmentForm({...assignmentForm, monthly_volume_limit: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Txn Limit</Label>
                                    <Input 
                                        type="number"
                                        value={assignmentForm.monthly_transaction_limit}
                                        onChange={(e) => setAssignmentForm({...assignmentForm, monthly_transaction_limit: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
                            <Button onClick={() => assignConnectorMutation.mutate(assignmentForm)}>Assign Connector</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}