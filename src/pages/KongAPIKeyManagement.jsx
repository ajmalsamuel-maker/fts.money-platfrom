import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Plus, Copy, CheckCircle2, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const SERVICE_TYPES = {
    iso_gateway: { label: 'ISO Gateway', color: 'bg-blue-100 text-blue-800' },
    orchestration: { label: 'Orchestration', color: 'bg-purple-100 text-purple-800' },
    crypto_banking: { label: 'Crypto Banking', color: 'bg-green-100 text-green-800' },
    rwa_platform: { label: 'RWA Platform', color: 'bg-orange-100 text-orange-800' },
    psp: { label: 'PSP Service', color: 'bg-cyan-100 text-cyan-800' }
};

export default function KongAPIKeyManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [copiedKey, setCopiedKey] = useState('');

    React.useEffect(() => {
        const sessionData = localStorage.getItem('platform_admin_session');
        if (!sessionData) {
            navigate(createPageUrl('PlatformAdminLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
        setLoading(false);
    }, [navigate]);

    // Fetch all API keys
    const { data: apiKeys = [] } = useQuery({
        queryKey: ['kong-api-keys'],
        queryFn: async () => {
            const response = await base44.functions.invoke('kongAPIKeyManager', {
                action: 'list_all'
            });
            return response.data.keys || [];
        }
    });

    // Fetch customers by service type
    const { data: customers = [] } = useQuery({
        queryKey: ['service-customers', selectedService],
        queryFn: async () => {
            if (!selectedService) return [];
            
            const entityMap = {
                iso_gateway: 'ISOGatewayCustomer',
                orchestration: 'OrchestrationCustomer',
                crypto_banking: 'CryptoGatewayCustomer',
                rwa_platform: 'RWAProvider'
            };

            const entityName = entityMap[selectedService];
            if (!entityName) return [];

            return await base44.entities[entityName].list();
        },
        enabled: !!selectedService
    });

    // Create API key mutation
    const createKeyMutation = useMutation({
        mutationFn: async ({ service, customerId, customerCode }) => {
            const response = await base44.functions.invoke('kongAPIKeyManager', {
                action: 'create',
                service_type: service,
                customer_id: customerId,
                customer_code: customerCode
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['kong-api-keys']);
            toast.success('API key created successfully');
            setShowCreateDialog(false);
            setSelectedService('');
            setSelectedCustomer('');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to create API key');
        }
    });

    // Delete API key mutation
    const deleteKeyMutation = useMutation({
        mutationFn: async (consumerId) => {
            const response = await base44.functions.invoke('kongAPIKeyManager', {
                action: 'delete',
                consumer_id: consumerId
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['kong-api-keys']);
            toast.success('API key deleted successfully');
        },
        onError: (error) => {
            toast.error('Failed to delete API key');
        }
    });

    const handleCreateKey = () => {
        const customer = customers.find(c => c.id === selectedCustomer);
        if (!customer) {
            toast.error('Please select a customer');
            return;
        }

        createKeyMutation.mutate({
            service: selectedService,
            customerId: customer.id,
            customerCode: customer.customer_code || customer.provider_code
        });
    };

    const copyToClipboard = (text, keyId) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(keyId);
        toast.success('API key copied to clipboard');
        setTimeout(() => setCopiedKey(''), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="KongAPIKeyManagement"
                userRole={session.role}
                userEmail={session.email}
                isSuperAdmin={session.role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Kong API Key Management</h2>
                        <p className="text-xs text-slate-600">Multi-tenant API key provisioning & management</p>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Create API Key
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New API Key</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Service Type</Label>
                                    <Select value={selectedService} onValueChange={setSelectedService}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(SERVICE_TYPES).map(([key, { label }]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedService && (
                                    <div>
                                        <Label>Customer</Label>
                                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        {customer.company_name} ({customer.customer_code || customer.provider_code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-xs">
                                        <strong>Multi-Tenant Isolation:</strong> This API key will be scoped to the selected customer and service only.
                                    </AlertDescription>
                                </Alert>

                                <Button 
                                    onClick={handleCreateKey} 
                                    disabled={!selectedService || !selectedCustomer || createKeyMutation.isPending}
                                    className="w-full"
                                >
                                    {createKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="p-6 max-w-7xl space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                            <strong>Multi-Tenant Security:</strong> Each API key is isolated to a specific customer and service. 
                            Keys are automatically scoped using Kong consumers with metadata tags for tenant isolation.
                        </AlertDescription>
                    </Alert>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        {Object.entries(SERVICE_TYPES).map(([key, { label }]) => {
                            const count = apiKeys.filter(k => k.service_type === key).length;
                            return (
                                <Card key={key}>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">{count}</div>
                                        <div className="text-sm text-slate-600">{label} Keys</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* API Keys Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active API Keys ({apiKeys.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {apiKeys.length === 0 ? (
                                <div className="text-center py-12">
                                    <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">No API keys created yet</p>
                                    <Button 
                                        onClick={() => setShowCreateDialog(true)} 
                                        className="mt-4"
                                    >
                                        Create First API Key
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {apiKeys.map((key) => (
                                        <div 
                                            key={key.id} 
                                            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Badge className={SERVICE_TYPES[key.service_type]?.color}>
                                                            {SERVICE_TYPES[key.service_type]?.label || key.service_type}
                                                        </Badge>
                                                        <span className="font-semibold">{key.customer_name}</span>
                                                        <span className="text-sm text-slate-500">({key.customer_code})</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                            {key.api_key}
                                                        </code>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => copyToClipboard(key.api_key, key.id)}
                                                        >
                                                            {copiedKey === key.id ? (
                                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <div className="text-xs text-slate-500">
                                                        Consumer ID: {key.consumer_id} • Created: {new Date(key.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm(`Delete API key for ${key.customer_name}?`)) {
                                                            deleteKeyMutation.mutate(key.consumer_id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Integration Instructions */}
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="text-lg">How Customers Use Their API Keys</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-slate-700">Share these instructions with your customers:</p>
                            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# Example API call with key
curl -X POST http://188.166.207.82:8000/api/v1/iso/messages \\
  -H "apikey: CUSTOMER_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{"message_type": "0200", "fields": {...}}'`}
                            </pre>
                            <Alert>
                                <AlertDescription className="text-xs">
                                    Each key is automatically scoped to their customer_code, preventing access to other tenants' data.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}