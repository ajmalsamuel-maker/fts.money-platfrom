import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Key, Plus, Copy, Eye, EyeOff, Trash2, GitBranch, Activity,
    FileText, Code, Zap, TrendingUp, DollarSign, LogOut, Settings, Webhook, Bell, Menu
} from 'lucide-react';

export default function ISOGatewayCustomerPortal() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showKeyDialog, setShowKeyDialog] = useState(false);
    const [showConnDialog, setShowConnDialog] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState('webhooks');
    const [visibleKeys, setVisibleKeys] = useState({});
    const [newKey, setNewKey] = useState({ key_name: '', environment: 'test' });
    const [newConn, setNewConn] = useState({
        connection_name: '',
        direction: '8583_to_20022',
        destination_endpoint: ''
    });

    const queryClient = useQueryClient();

    // Get current customer from session
    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        const session = localStorage.getItem('iso_gateway_session');
        if (!session) {
            window.location.href = '/ISOGatewayLogin';
            return;
        }
        const sessionData = JSON.parse(session);
        setCustomerId(sessionData.customer_id);
    }, []);

    const { data: customer } = useQuery({
        queryKey: ['customer', customerId],
        queryFn: async () => {
            const customers = await base44.entities.ISOGatewayCustomer.filter({ id: customerId });
            return customers[0];
        },
        enabled: !!customerId
    });

    const { data: apiKeys = [] } = useQuery({
        queryKey: ['api-keys', customerId],
        queryFn: async () => await base44.entities.ISOGatewayAPIKey.filter({ customer_id: customerId }) || [],
        enabled: !!customerId
    });

    const { data: connections = [] } = useQuery({
        queryKey: ['connections', customerId],
        queryFn: async () => await base44.entities.ISOGatewayConnection.filter({ customer_id: customerId }) || [],
        enabled: !!customerId
    });

    const { data: messages = [] } = useQuery({
        queryKey: ['messages', customerId],
        queryFn: async () => await base44.entities.ISOMessageLog.filter({ customer_id: customerId }, '-created_date', 50) || [],
        enabled: !!customerId,
        refetchInterval: 5000
    });

    const createKeyMutation = useMutation({
        mutationFn: async (keyData) => {
            const apiKey = 'iso_' + keyData.environment + '_' + Math.random().toString(36).substr(2, 24);
            return await base44.entities.ISOGatewayAPIKey.create({
                customer_id: customerId,
                key_name: keyData.key_name,
                api_key: apiKey,
                key_prefix: apiKey.substring(0, 12),
                environment: keyData.environment,
                permissions: ['receive_8583', 'receive_20022'],
                status: 'active'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['api-keys']);
            setShowKeyDialog(false);
            setNewKey({ key_name: '', environment: 'test' });
        }
    });

    const createConnMutation = useMutation({
        mutationFn: async (connData) => {
            return await base44.entities.ISOGatewayConnection.create({
                customer_id: customerId,
                connection_name: connData.connection_name,
                direction: connData.direction,
                source_standard: connData.direction === '8583_to_20022' ? 'ISO8583' : 'ISO20022',
                target_standard: connData.direction === '8583_to_20022' ? 'ISO20022' : 'ISO8583',
                source_endpoint: `https://iso-gateway.fts.money/api/receive/${connData.direction === '8583_to_20022' ? '8583' : '20022'}/{{api_key}}`,
                destination_endpoint: connData.destination_endpoint,
                enrichment_enabled: true,
                status: 'active'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['connections']);
            setShowConnDialog(false);
            setNewConn({ connection_name: '', direction: '8583_to_20022', destination_endpoint: '' });
        }
    });

    const deleteKeyMutation = useMutation({
        mutationFn: async (keyId) => await base44.entities.ISOGatewayAPIKey.delete(keyId),
        onSuccess: () => queryClient.invalidateQueries(['api-keys'])
    });

    const updateCustomerMutation = useMutation({
        mutationFn: async (data) => await base44.entities.ISOGatewayCustomer.update(customer.id, data),
        onSuccess: () => queryClient.invalidateQueries(['customer'])
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const successRate = messages.length > 0 
        ? ((messages.filter(m => m.status === 'success').length / messages.length) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">ISO Gateway</h1>
                            <p className="text-xs text-slate-600">{customer?.company_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                            {customer?.subscription_tier}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                                localStorage.removeItem('iso_gateway_session');
                                window.location.href = '/ISOGatewayLogin';
                            }}
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">Messages Today</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {messages.length}
                                    </p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">{successRate}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">This Month</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {customer?.current_month_usage?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        / {customer?.monthly_message_limit?.toLocaleString()}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-600">Avg Latency</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {customer?.avg_latency_ms || 0}ms
                                    </p>
                                </div>
                                <Zap className="h-8 w-8 text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="keys" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="keys">API Keys</TabsTrigger>
                        <TabsTrigger value="connections">Connections</TabsTrigger>
                        {customer?.enabled_features?.includes('orchestration') && (
                            <TabsTrigger value="routing">
                                <GitBranch className="h-4 w-4 mr-2" />
                                Routing
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="logs">Message Logs</TabsTrigger>
                        <TabsTrigger value="docs">Documentation</TabsTrigger>
                    </TabsList>

                    {/* API Keys Tab */}
                    <TabsContent value="keys">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>API Keys</CardTitle>
                                <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Key
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create API Key</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Key Name</label>
                                                <Input
                                                    value={newKey.key_name}
                                                    onChange={(e) => setNewKey({...newKey, key_name: e.target.value})}
                                                    placeholder="Production Key"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Environment</label>
                                                <Select value={newKey.environment} onValueChange={(v) => setNewKey({...newKey, environment: v})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="test">Test</SelectItem>
                                                        <SelectItem value="production">Production</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button 
                                                onClick={() => createKeyMutation.mutate(newKey)}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                Create Key
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {apiKeys.map(key => (
                                        <div key={key.id} className="p-4 border rounded-lg bg-slate-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{key.key_name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <code className="text-xs bg-white px-2 py-1 rounded border">
                                                            {visibleKeys[key.id] ? key.api_key : `${key.key_prefix}...`}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setVisibleKeys({...visibleKeys, [key.id]: !visibleKeys[key.id]})}
                                                        >
                                                            {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(key.api_key)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge className="bg-blue-100 text-blue-700">{key.environment}</Badge>
                                                        <Badge className="bg-emerald-100 text-emerald-700">{key.status}</Badge>
                                                        <span className="text-xs text-slate-600">Used: {key.usage_count || 0} times</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        if (confirm('Delete this API key?')) {
                                                            deleteKeyMutation.mutate(key.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Routing Tab */}
                    {customer?.enabled_features?.includes('orchestration') && (
                        <TabsContent value="routing">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Routing</CardTitle>
                                    <p className="text-sm text-slate-600">
                                        Route translated messages to payment providers or payout methods
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <Button 
                                        onClick={() => window.location.href = '/ISOCustomerRouting'}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <GitBranch className="h-4 w-4 mr-2" />
                                        Configure Routing Rules
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Connections Tab */}
                    <TabsContent value="connections">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Connections</CardTitle>
                                <Dialog open={showConnDialog} onOpenChange={setShowConnDialog}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Connection
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Connection</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Connection Name</label>
                                                <Input
                                                    value={newConn.connection_name}
                                                    onChange={(e) => setNewConn({...newConn, connection_name: e.target.value})}
                                                    placeholder="ATM to SWIFT"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Direction</label>
                                                <Select value={newConn.direction} onValueChange={(v) => setNewConn({...newConn, direction: v})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                                        <SelectItem value="8583_to_20022">ISO 8583 → ISO 20022</SelectItem>
                                                                        <SelectItem value="20022_to_8583">ISO 20022 → ISO 8583</SelectItem>
                                                                        <SelectItem value="MT_to_20022">SWIFT MT → ISO 20022</SelectItem>
                                                                        <SelectItem value="20022_to_MT">ISO 20022 → SWIFT MT</SelectItem>
                                                                        <SelectItem value="MT_to_8583">SWIFT MT → ISO 8583</SelectItem>
                                                                        <SelectItem value="8583_to_MT">ISO 8583 → SWIFT MT</SelectItem>
                                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Destination Endpoint</label>
                                                <Input
                                                    value={newConn.destination_endpoint}
                                                    onChange={(e) => setNewConn({...newConn, destination_endpoint: e.target.value})}
                                                    placeholder="https://your-system.com/api/webhook"
                                                />
                                            </div>
                                            <Button 
                                                onClick={() => createConnMutation.mutate(newConn)}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                Create Connection
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {connections.map(conn => (
                                        <div key={conn.id} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-slate-900">{conn.connection_name}</p>
                                                    <p className="text-sm text-slate-600 mt-1">{conn.direction.replace('_', ' ')}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge className="bg-emerald-100 text-emerald-700">{conn.status}</Badge>
                                                        <span className="text-xs text-slate-600">
                                                            {conn.messages_processed || 0} messages
                                                        </span>
                                                    </div>
                                                </div>
                                                <GitBranch className="h-5 w-5 text-purple-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Message Logs Tab */}
                    <TabsContent value="logs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Messages</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {messages.slice(0, 20).map(msg => (
                                        <div key={msg.id} className="p-3 border rounded-lg text-sm">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={msg.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                                        {msg.status}
                                                    </Badge>
                                                    <span className="font-mono text-xs">{msg.message_id?.substring(0, 8)}</span>
                                                    <span className="text-slate-600">{msg.message_type}</span>
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {msg.processing_time_ms}ms • {new Date(msg.created_date).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documentation Tab */}
                    <TabsContent value="docs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Start</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Supported Formats</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div className="p-3 border rounded bg-indigo-50">
                                            <p className="font-medium text-sm text-indigo-900">ISO 8583</p>
                                            <p className="text-xs text-indigo-700">ATM, POS transactions</p>
                                        </div>
                                        <div className="p-3 border rounded bg-purple-50">
                                            <p className="font-medium text-sm text-purple-900">ISO 20022</p>
                                            <p className="text-xs text-purple-700">Modern payment messaging</p>
                                        </div>
                                        <div className="p-3 border rounded bg-blue-50">
                                            <p className="font-medium text-sm text-blue-900">SWIFT MT</p>
                                            <p className="text-xs text-blue-700">MT103, MT202, MT940</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Enrichment Features</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-600">✓</span>
                                            <div>
                                                <p className="font-medium">LEI Auto-Enrichment</p>
                                                <p className="text-xs text-slate-600">Automatic Legal Entity Identifier lookup and insertion</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-600">✓</span>
                                            <div>
                                                <p className="font-medium">Structured Remittance</p>
                                                <p className="text-xs text-slate-600">Parse invoice numbers and PO references</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-600">✓</span>
                                            <div>
                                                <p className="font-medium">Purpose Codes</p>
                                                <p className="text-xs text-slate-600">ISO 20022 payment purpose classification</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-600">✓</span>
                                            <div>
                                                <p className="font-medium">End-to-End Tracking</p>
                                                <p className="text-xs text-slate-600">Preserve references throughout payment chain</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Alert>
                                    <AlertDescription>
                                        <strong>Step 1:</strong> Create an API key in the API Keys tab
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <AlertDescription>
                                        <strong>Step 2:</strong> Configure a connection with your destination endpoint
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <AlertDescription>
                                        <strong>Step 3:</strong> Send messages to your unique endpoint
                                    </AlertDescription>
                                </Alert>
                                <div className="mt-6">
                                    <p className="font-medium mb-2">Example cURL:</p>
                                    <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto">
{`curl -X POST https://iso-gateway.fts.money/api/receive/8583/YOUR_API_KEY \\
  -H "Content-Type: application/json" \\
  -d '{"message": "BASE64_ENCODED_ISO8583_MESSAGE"}'`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                </div>

                {/* Settings Dialog */}
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>

                    <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="webhooks">
                                <Webhook className="h-4 w-4 mr-2" />
                                Webhooks
                            </TabsTrigger>
                            <TabsTrigger value="notifications">
                                <Bell className="h-4 w-4 mr-2" />
                                Notifications
                            </TabsTrigger>
                        </TabsList>

                        {/* Webhooks Tab */}
                        <TabsContent value="webhooks" className="space-y-4">
                            <p className="text-sm text-slate-600">Configure webhook endpoints for message notifications</p>

                            <div className="space-y-3">
                                <label className="text-sm font-medium">Webhook URL</label>
                                <Input
                                    value={customer?.webhook_url || ''}
                                    onChange={(e) => {
                                        const updated = { ...customer, webhook_url: e.target.value };
                                        updateCustomerMutation.mutate(updated);
                                    }}
                                    placeholder="https://your-api.com/webhooks/iso-gateway"
                                />
                                <p className="text-xs text-slate-500">
                                    Receive notifications when messages are translated
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium">Webhook Secret</label>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs bg-slate-100 px-3 py-2 rounded border font-mono flex-1">
                                        {customer?.webhook_secret || 'Not generated'}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(customer?.webhook_secret || '');
                                            alert('Webhook secret copied');
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Use this to verify webhook signatures
                                </p>
                            </div>

                            {customer?.webhook_url && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 mb-2">Webhook Events:</p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>✓ message.translated - When a message is successfully translated</li>
                                        <li>✓ message.failed - When translation fails</li>
                                        <li>✓ message.delivered - When message is delivered to destination</li>
                                    </ul>
                                </div>
                            )}
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="space-y-4">
                            <p className="text-sm text-slate-600">Configure email and notification preferences</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Translation Failure Alerts</p>
                                        <p className="text-sm text-slate-600">Get notified when translation fails</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Monthly Usage Report</p>
                                        <p className="text-sm text-slate-600">Receive monthly summary emails</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Quota Warnings</p>
                                        <p className="text-sm text-slate-600">Alert when approaching limits</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">New Feature Updates</p>
                                        <p className="text-sm text-slate-600">Product announcements and updates</p>
                                    </div>
                                    <input type="checkbox" className="h-5 w-5" defaultChecked />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
                </Dialog>
                </div>
                );
                }