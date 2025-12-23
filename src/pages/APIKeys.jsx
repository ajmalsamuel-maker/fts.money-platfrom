import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
    Key, Plus, Copy, Check, Trash2, Eye, EyeOff, AlertCircle
} from 'lucide-react';

export default function APIKeys() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);
    const [visibleKeys, setVisibleKeys] = useState({});
    const [userPspCode, setUserPspCode] = useState(null);
    const queryClient = useQueryClient();

    const [newKey, setNewKey] = useState({
        name: '',
        environment: 'production',
        permissions: ['read']
    });

    React.useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            setUserPspCode(session.psp_code);
        } else {
            window.location.href = '/PSPLogin';
        }
    }, []);

    const { data: apiKeys = [] } = useQuery({
        queryKey: ['api-keys', userPspCode],
        queryFn: async () => {
            const response = await base44.functions.invoke('pspData', {
                action: 'listAPIKeys',
                psp_code: userPspCode
            });
            return response.data.data || [];
        },
        enabled: !!userPspCode
    });

    const createKeyMutation = useMutation({
        mutationFn: async (data) => {
            const keyId = `key_${Date.now()}`;
            const secret = `sk_${data.environment}_${btoa(keyId + Date.now()).slice(0, 32)}`;
            
            const response = await base44.functions.invoke('pspData', {
                action: 'createAPIKey',
                psp_code: userPspCode,
                keyData: {
                    key_id: keyId,
                    name: data.name,
                    environment: data.environment,
                    key_prefix: secret.slice(0, 12),
                    key_secret: secret,
                    permissions: data.permissions,
                    status: 'active',
                    psp_code: userPspCode
                }
            });
            
            return { ...response.data.key, key_secret: secret };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            alert(`API Key created!\n\nKey: ${data.key_secret}\n\n⚠️ Save this key now - it won't be shown again!`);
            setShowCreateDialog(false);
            setNewKey({ name: '', environment: 'production', permissions: ['read'] });
        }
    });

    const deleteKeyMutation = useMutation({
        mutationFn: async (keyId) => {
            await base44.functions.invoke('pspData', {
                action: 'deleteAPIKey',
                psp_code: userPspCode,
                key_id: keyId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        }
    });

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleKeyVisibility = (id) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const maskKey = (key) => {
        if (!key) return '••••••••••••••••';
        return key.slice(0, 12) + '••••••••••••••••';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="APIKeys" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">API Keys</h1>
                            <p className="text-slate-500">Manage API keys for programmatic access</p>
                        </div>
                        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                            <Plus className="h-4 w-4" />Create API Key
                        </Button>
                    </div>

                    {apiKeys.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                                <p className="text-slate-500 mb-4">Create your first API key to start integrating</p>
                                <Button onClick={() => setShowCreateDialog(true)}>Create API Key</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {apiKeys.map((key) => (
                                <Card key={key.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{key.name}</h3>
                                                    <Badge variant="outline" className={key.environment === 'production' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                                                        {key.environment}
                                                    </Badge>
                                                    <Badge variant="outline">{key.status}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <code className="text-sm bg-slate-100 px-3 py-1 rounded font-mono">
                                                        {visibleKeys[key.id] ? key.key_secret : maskKey(key.key_prefix)}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleKeyVisibility(key.id)}
                                                    >
                                                        {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(key.key_secret || key.key_prefix, key.id)}
                                                    >
                                                        {copiedKey === key.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                <div className="text-sm text-slate-500 space-y-1">
                                                    <p>Permissions: {key.permissions?.join(', ')}</p>
                                                    <p>Created: {new Date(key.created_date).toLocaleDateString()}</p>
                                                    {key.last_used && <p>Last used: {new Date(key.last_used).toLocaleDateString()}</p>}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Delete this API key? This cannot be undone.')) {
                                                        deleteKeyMutation.mutate(key.key_id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create API Key</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Key Name *</Label>
                                    <Input
                                        value={newKey.name}
                                        onChange={(e) => setNewKey(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g., Production API"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Environment</Label>
                                    <Select value={newKey.environment} onValueChange={(v) => setNewKey(p => ({ ...p, environment: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="production">Production</SelectItem>
                                            <SelectItem value="sandbox">Sandbox</SelectItem>
                                            <SelectItem value="development">Development</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800">
                                        Save the API key immediately after creation - it will only be shown once for security reasons.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                <Button onClick={() => createKeyMutation.mutate(newKey)} disabled={!newKey.name || createKeyMutation.isPending}>
                                    Create Key
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}