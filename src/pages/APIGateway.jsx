import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Key, Plus, Copy, Eye, EyeOff, MoreHorizontal, Trash2, 
    Activity, Clock, Zap, Shield, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const permissionOptions = [
    { value: 'create_payment', label: 'Create Payment' },
    { value: 'tokenize_card', label: 'Tokenize Card' },
    { value: 'get_transaction', label: 'Get Transaction' },
    { value: 'list_transactions', label: 'List Transactions' },
    { value: 'refunds', label: 'Process Refunds' },
    { value: 'webhooks', label: 'Manage Webhooks' },
];

export default function APIGateway() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showSecretDialog, setShowSecretDialog] = useState(false);
    const [generatedKey, setGeneratedKey] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);
    const [formData, setFormData] = useState({
        merchant_id: '',
        key_name: '',
        environment: 'sandbox',
        permissions: [],
        rate_limit: 100,
        allowed_ips: ''
    });

    const queryClient = useQueryClient();

    const { data: apiKeys = [] } = useQuery({
        queryKey: ['api-keys'],
        queryFn: () => base44.entities.APIKey.list('-created_date'),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: requestLogs = [] } = useQuery({
        queryKey: ['api-logs'],
        queryFn: () => base44.entities.APIRequestLog.list('-created_date', 100),
    });

    const createKeyMutation = useMutation({
        mutationFn: async (data) => {
            const apiKey = `pk_${data.environment}_${crypto.randomUUID().replace(/-/g, '')}`;
            const apiSecret = `sk_${data.environment}_${crypto.randomUUID().replace(/-/g, '')}`;
            
            const merchant = merchants.find(m => m.id === data.merchant_id);
            
            const key = await base44.entities.APIKey.create({
                ...data,
                merchant_name: merchant?.business_name,
                api_key: apiKey,
                api_secret: apiSecret,
                key_prefix: apiKey.substring(0, 8),
                allowed_ips: data.allowed_ips ? data.allowed_ips.split(',').map(ip => ip.trim()) : []
            });
            
            return { key, plainKey: apiKey, plainSecret: apiSecret };
        },
        onSuccess: ({ key, plainKey, plainSecret }) => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            setGeneratedKey({ key, plainKey, plainSecret });
            setShowSecretDialog(true);
            setShowDialog(false);
            resetForm();
            toast.success('API key created successfully');
        },
    });

    const revokeKeyMutation = useMutation({
        mutationFn: (id) => base44.entities.APIKey.update(id, { status: 'revoked' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            toast.success('API key revoked');
        },
    });

    const deleteKeyMutation = useMutation({
        mutationFn: (id) => base44.entities.APIKey.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
    });

    const resetForm = () => {
        setFormData({
            merchant_id: '',
            key_name: '',
            environment: 'sandbox',
            permissions: [],
            rate_limit: 100,
            allowed_ips: ''
        });
    };

    const handleSubmit = () => {
        if (!formData.merchant_id || !formData.key_name || formData.permissions.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }
        createKeyMutation.mutate(formData);
    };

    const togglePermission = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const activeKeys = apiKeys.filter(k => k.status === 'active').length;
    const totalRequests = requestLogs.length;
    const failedRequests = requestLogs.filter(l => l.status_code >= 400).length;
    const avgResponseTime = requestLogs.length > 0
        ? (requestLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / requestLogs.length).toFixed(2)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="APIGateway" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Unified API Gateway</h1>
                            <p className="text-slate-500">Manage API keys, monitor requests, and configure rate limits</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Create API Key
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Key className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Active Keys</p>
                                    <p className="text-2xl font-bold">{activeKeys}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Activity className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Requests</p>
                                    <p className="text-2xl font-bold">{totalRequests}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Failed Requests</p>
                                    <p className="text-2xl font-bold">{failedRequests}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Avg Response Time</p>
                                    <p className="text-2xl font-bold">{avgResponseTime}ms</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="keys" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="keys">API Keys</TabsTrigger>
                            <TabsTrigger value="logs">Request Logs</TabsTrigger>
                            <TabsTrigger value="docs">Documentation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="keys">
                            <Card>
                                <CardHeader>
                                    <CardTitle>API Keys</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Key Name</TableHead>
                                                <TableHead>Merchant</TableHead>
                                                <TableHead>Environment</TableHead>
                                                <TableHead>Key Prefix</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead>Rate Limit</TableHead>
                                                <TableHead>Usage</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {apiKeys.map((key) => (
                                                <TableRow key={key.id}>
                                                    <TableCell className="font-medium">{key.key_name}</TableCell>
                                                    <TableCell>{key.merchant_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={key.environment === 'production' ? 'default' : 'secondary'}>
                                                            {key.environment}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                            {key.key_prefix}...
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {key.permissions?.slice(0, 2).map(p => (
                                                                <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                                                            ))}
                                                            {key.permissions?.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">+{key.permissions.length - 2}</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{key.rate_limit}/min</TableCell>
                                                    <TableCell>{key.usage_count || 0}</TableCell>
                                                    <TableCell>
                                                        <Badge className={
                                                            key.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            key.status === 'revoked' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {key.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {key.status === 'active' && (
                                                                    <DropdownMenuItem onClick={() => revokeKeyMutation.mutate(key.id)}>
                                                                        <XCircle className="h-4 w-4 mr-2" />Revoke
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteKeyMutation.mutate(key.id)}>
                                                                    <Trash2 className="h-4 w-4 mr-2" />Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>API Request Logs</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>Endpoint</TableHead>
                                                <TableHead>Merchant</TableHead>
                                                <TableHead>Gateway</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Response Time</TableHead>
                                                <TableHead>IP Address</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requestLogs.map((log) => (
                                                <TableRow key={log.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedLog(log)}>
                                                    <TableCell className="text-xs">{format(new Date(log.created_date), 'MMM dd, HH:mm:ss')}</TableCell>
                                                    <TableCell><code className="text-xs">{log.endpoint}</code></TableCell>
                                                    <TableCell className="text-xs">{merchants.find(m => m.id === log.merchant_id)?.business_name}</TableCell>
                                                    <TableCell><Badge variant="outline" className="text-xs">{log.gateway_used}</Badge></TableCell>
                                                    <TableCell>
                                                        <Badge className={
                                                            log.status_code >= 200 && log.status_code < 300 ? 'bg-emerald-100 text-emerald-700' :
                                                            log.status_code >= 400 ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }>
                                                            {log.status_code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs">{log.response_time_ms}ms</TableCell>
                                                    <TableCell className="text-xs font-mono">{log.ip_address}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="docs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>API Documentation</CardTitle>
                                </CardHeader>
                                <CardContent className="prose max-w-none">
                                    <h3>Base URL</h3>
                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                                        https://your-domain.com/api/unifiedAPIGateway
                                    </pre>

                                    <h3>Authentication</h3>
                                    <p>Include your API key in the Authorization header:</p>
                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg">
Authorization: Bearer pk_sandbox_your_api_key_here
                                    </pre>

                                    <h3>Create Payment</h3>
                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg">
{`POST /api/unifiedAPIGateway
Content-Type: application/json

{
  "action": "create_payment",
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "pm_card_visa",
  "description": "Order #12345"
}`}
                                    </pre>

                                    <h3>List Transactions</h3>
                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg">
{`POST /api/unifiedAPIGateway
Content-Type: application/json

{
  "action": "list_transactions",
  "limit": 50
}`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Create Key Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>Generate a new API key for merchant integration</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Merchant *</Label>
                                <Select value={formData.merchant_id} onValueChange={(val) => setFormData({...formData, merchant_id: val})}>
                                    <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                    <SelectContent>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Key Name *</Label>
                                <Input value={formData.key_name} onChange={(e) => setFormData({...formData, key_name: e.target.value})} placeholder="e.g., Production API Key" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Environment</Label>
                                <Select value={formData.environment} onValueChange={(val) => setFormData({...formData, environment: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox</SelectItem>
                                        <SelectItem value="production">Production</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Rate Limit (requests/min)</Label>
                                <Input type="number" value={formData.rate_limit} onChange={(e) => setFormData({...formData, rate_limit: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Permissions *</Label>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                                {permissionOptions.map(perm => (
                                    <div key={perm.value} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={perm.value}
                                            checked={formData.permissions.includes(perm.value)}
                                            onCheckedChange={() => togglePermission(perm.value)}
                                        />
                                        <label htmlFor={perm.value} className="text-sm cursor-pointer">{perm.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Allowed IPs (optional)</Label>
                            <Input value={formData.allowed_ips} onChange={(e) => setFormData({...formData, allowed_ips: e.target.value})} placeholder="192.168.1.1, 10.0.0.1" />
                            <p className="text-xs text-slate-500">Comma-separated list. Leave empty to allow all IPs.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={createKeyMutation.isPending}>
                            {createKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Show Generated Key Dialog */}
            <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            API Key Created Successfully
                        </DialogTitle>
                        <DialogDescription>
                            Save these credentials securely. You won't be able to see them again.
                        </DialogDescription>
                    </DialogHeader>
                    {generatedKey && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <div className="flex gap-2">
                                    <Input value={generatedKey.plainKey} readOnly className="font-mono text-xs" />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedKey.plainKey)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>API Secret</Label>
                                <div className="flex gap-2">
                                    <Input value={generatedKey.plainSecret} readOnly className="font-mono text-xs" />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedKey.plainSecret)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-sm text-amber-800 font-medium">⚠️ Important</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Store these credentials securely. They will not be shown again.
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => { setShowSecretDialog(false); setGeneratedKey(null); }}>
                            I've Saved My Credentials
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}