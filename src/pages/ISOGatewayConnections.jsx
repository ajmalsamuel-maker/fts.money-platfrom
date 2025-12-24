import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Plus, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ISOGatewayConnections() {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newConnection, setNewConnection] = useState({
        connection_name: '',
        customer_id: '',
        direction: 'bidirectional',
        destination_endpoint: '',
        enrichment_enabled: true
    });

    const queryClient = useQueryClient();

    const { data: connections = [] } = useQuery({
        queryKey: ['iso-gateway-connections'],
        queryFn: async () => await base44.entities.ISOGatewayConnection.list() || []
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['iso-gateway-customers'],
        queryFn: async () => await base44.entities.ISOGatewayCustomer.list() || []
    });

    const createConnectionMutation = useMutation({
        mutationFn: async (data) => {
            const sourceEndpoint = `https://iso-gateway.fts.money/api/receive/${data.direction.includes('8583') ? '8583' : '20022'}/${crypto.randomUUID()}`;
            
            return await base44.entities.ISOGatewayConnection.create({
                ...data,
                connection_id: `iso_conn_${Date.now()}`,
                source_standard: data.direction.startsWith('8583') ? 'ISO8583' : 'ISO20022',
                target_standard: data.direction.includes('to_8583') ? 'ISO8583' : 'ISO20022',
                source_endpoint: sourceEndpoint,
                status: 'testing',
                messages_processed: 0,
                success_count: 0,
                error_count: 0
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['iso-gateway-connections']);
            setShowCreateDialog(false);
        }
    });

    const statusIcons = {
        active: <CheckCircle className="h-4 w-4 text-green-600" />,
        paused: <Clock className="h-4 w-4 text-yellow-600" />,
        failed: <XCircle className="h-4 w-4 text-red-600" />,
        testing: <Zap className="h-4 w-4 text-blue-600" />
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <FTSPlatformSidebar currentPage="ISOGatewayConnections" />
            
            <div className="flex-1 overflow-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">ISO Gateway Connections</h1>
                        <p className="text-gray-600 mt-1">Configure real-time translation routing</p>
                    </div>
                    
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                New Connection
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Connection</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Connection Name</label>
                                    <Input
                                        value={newConnection.connection_name}
                                        onChange={(e) => setNewConnection({...newConnection, connection_name: e.target.value})}
                                        placeholder="ATM Network to SWIFT"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium">Customer</label>
                                    <Select value={newConnection.customer_id} onValueChange={(v) => setNewConnection({...newConnection, customer_id: v})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={c.customer_id}>
                                                    {c.company_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium">Translation Direction</label>
                                    <Select value={newConnection.direction} onValueChange={(v) => setNewConnection({...newConnection, direction: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="8583_to_20022">ISO 8583 → ISO 20022</SelectItem>
                                            <SelectItem value="20022_to_8583">ISO 20022 → ISO 8583</SelectItem>
                                            <SelectItem value="bidirectional">Bidirectional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium">Destination Endpoint</label>
                                    <Input
                                        value={newConnection.destination_endpoint}
                                        onChange={(e) => setNewConnection({...newConnection, destination_endpoint: e.target.value})}
                                        placeholder="https://api.customer.com/iso/receive"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Where to send translated messages</p>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Enable Enrichment</p>
                                        <p className="text-xs text-gray-500">Auto-add LEI, BIC, IBAN validation</p>
                                    </div>
                                    <Switch
                                        checked={newConnection.enrichment_enabled}
                                        onCheckedChange={(v) => setNewConnection({...newConnection, enrichment_enabled: v})}
                                    />
                                </div>
                                
                                <Button 
                                    onClick={() => createConnectionMutation.mutate(newConnection)}
                                    disabled={!newConnection.connection_name || !newConnection.customer_id || !newConnection.destination_endpoint}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    Create Connection
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4">
                    {connections.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No connections configured</h3>
                                <p className="text-gray-600">Create your first connection to start routing messages</p>
                            </CardContent>
                        </Card>
                    ) : (
                        connections.map((conn) => (
                            <Card key={conn.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {statusIcons[conn.status]}
                                                {conn.connection_name}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {conn.source_standard} → {conn.target_standard}
                                            </p>
                                        </div>
                                        <Badge className={
                                            conn.status === 'active' ? 'bg-green-100 text-green-800' :
                                            conn.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {conn.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-600">Source Endpoint (Webhook)</p>
                                                <p className="text-sm font-mono bg-gray-50 p-2 rounded truncate">
                                                    {conn.source_endpoint}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Destination Endpoint</p>
                                                <p className="text-sm font-mono bg-gray-50 p-2 rounded truncate">
                                                    {conn.destination_endpoint}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-6 pt-4 border-t">
                                            <div>
                                                <p className="text-xs text-gray-600">Messages Processed</p>
                                                <p className="text-lg font-semibold">{conn.messages_processed || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Success Rate</p>
                                                <p className="text-lg font-semibold">
                                                    {conn.messages_processed > 0 
                                                        ? `${((conn.success_count / conn.messages_processed) * 100).toFixed(1)}%`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Avg Latency</p>
                                                <p className="text-lg font-semibold">
                                                    {conn.avg_latency_ms ? `${conn.avg_latency_ms}ms` : 'N/A'}
                                                </p>
                                            </div>
                                            {conn.enrichment_enabled && (
                                                <div>
                                                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                                                        <Zap className="h-3 w-3 mr-1" />
                                                        Enrichment ON
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}