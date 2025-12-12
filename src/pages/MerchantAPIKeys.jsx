import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Copy, Eye, EyeOff, RefreshCw, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MerchantAPIKeys() {
    const { user } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = useState('');
    const [showSecrets, setShowSecrets] = useState({});

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ id: user?.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id,
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids', user?.merchant_id],
        queryFn: () => base44.entities.MerchantMID.filter({ merchant_id: user?.merchant_id }),
        enabled: !!user?.merchant_id,
    });

    const { data: apiKeys = [] } = useQuery({
        queryKey: ['api-keys', user?.merchant_id],
        queryFn: () => base44.entities.APIKey.filter({ merchant_id: user?.merchant_id }),
        enabled: !!user?.merchant_id,
    });

    useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const toggleShowSecret = (keyId) => {
        setShowSecrets(prev => ({ ...prev, [keyId]: !prev[keyId] }));
    };

    const maskSecret = (secret) => {
        if (!secret) return '';
        return secret.substring(0, 12) + '••••••••••••••••';
    };

    const activeKeys = apiKeys.filter(k => k.status === 'active');
    const totalRequests = apiKeys.reduce((sum, k) => sum + (k.usage_count || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantAPIKeys"
                user={user}
                merchant={merchant}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900">API Credentials</h1>
                            <p className="text-slate-500">Manage your API keys for payment integration</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Key className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Active API Keys</p>
                                        <p className="text-2xl font-bold">{activeKeys.length}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <RefreshCw className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Total API Calls</p>
                                        <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Integration Status</p>
                                        <p className="text-lg font-bold text-emerald-600">Active</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* API Keys Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Your API Keys</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {apiKeys.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Key className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                        <p className="font-medium">No API Keys Available</p>
                                        <p className="text-sm mt-2">Contact your payment provider to request API credentials</p>
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                                            <div className="flex items-start gap-3">
                                                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-blue-900">Automatic Notification</p>
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        When your payment provider creates new API keys, you'll receive an email notification 
                                                        and the credentials will appear here automatically.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Key Name</TableHead>
                                                <TableHead>Environment</TableHead>
                                                <TableHead>API Key</TableHead>
                                                <TableHead>API Secret</TableHead>
                                                <TableHead>Rate Limit</TableHead>
                                                <TableHead>Usage</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {apiKeys.map((key) => (
                                                <TableRow key={key.id}>
                                                    <TableCell className="font-medium">{key.key_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={key.environment === 'production' ? 'default' : 'secondary'}>
                                                            {key.environment}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded max-w-xs truncate">
                                                                {key.key_prefix}...
                                                            </code>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7"
                                                                onClick={() => copyToClipboard(key.api_key)}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded max-w-xs truncate">
                                                                {showSecrets[key.id] ? key.api_secret : maskSecret(key.api_secret)}
                                                            </code>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7"
                                                                onClick={() => toggleShowSecret(key.id)}
                                                            >
                                                                {showSecrets[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7"
                                                                onClick={() => copyToClipboard(key.api_secret)}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs">{key.rate_limit}/min</TableCell>
                                                    <TableCell className="text-xs">{(key.usage_count || 0).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge className={
                                                            key.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            key.status === 'revoked' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {key.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {format(new Date(key.created_date), 'MMM dd, yyyy')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Integration Guide */}
                        {apiKeys.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Quick Integration Guide</CardTitle>
                                </CardHeader>
                                <CardContent className="prose max-w-none">
                                    <h4>1. Authentication</h4>
                                    <p className="text-sm">Include your API key in the Authorization header:</p>
                                    <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
Authorization: Bearer {apiKeys[0]?.api_key}
                                    </pre>

                                    <h4 className="mt-4">2. Create a Payment</h4>
                                    <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
{`POST https://your-domain.com/api/unifiedAPIGateway
Content-Type: application/json
Authorization: Bearer ${apiKeys[0]?.api_key}

{
  "action": "create_payment",
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "pm_card_visa",
  "description": "Order #12345"
}`}
                                    </pre>

                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-900">Security Notice</p>
                                                <p className="text-xs text-amber-700 mt-1">
                                                    Never expose your API secret in client-side code. Always make API calls from your backend server.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}