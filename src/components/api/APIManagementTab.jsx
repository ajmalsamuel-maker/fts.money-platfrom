import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, DollarSign, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function APIManagementTab() {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingAPI, setEditingAPI] = useState(null);

    const { data: apis = [] } = useQuery({
        queryKey: ['api-definitions'],
        queryFn: () => base44.entities.APIDefinition.list()
    });

    const [apiForm, setApiForm] = useState({
        api_name: '',
        api_path: '',
        api_description: '',
        current_version: 'v1',
        authentication_required: true,
        default_rate_limit_per_minute: 1000,
        monetization_enabled: false,
        base_price_per_call: 0,
        graphql_enabled: false
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.APIDefinition.create({
            ...data,
            api_id: `API-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['api-definitions']);
            setShowDialog(false);
            resetForm();
            toast.success('API created');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.APIDefinition.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['api-definitions']);
            setShowDialog(false);
            setEditingAPI(null);
            resetForm();
            toast.success('API updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.APIDefinition.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['api-definitions']);
            toast.success('API deleted');
        }
    });

    const resetForm = () => {
        setApiForm({
            api_name: '',
            api_path: '',
            api_description: '',
            current_version: 'v1',
            authentication_required: true,
            default_rate_limit_per_minute: 1000,
            monetization_enabled: false,
            base_price_per_call: 0,
            graphql_enabled: false
        });
    };

    const handleEdit = (api) => {
        setEditingAPI(api);
        setApiForm({
            api_name: api.api_name,
            api_path: api.api_path,
            api_description: api.api_description || '',
            current_version: api.current_version,
            authentication_required: api.authentication_required,
            default_rate_limit_per_minute: api.default_rate_limit_per_minute,
            monetization_enabled: api.monetization_enabled || false,
            base_price_per_call: api.base_price_per_call || 0,
            graphql_enabled: api.graphql_enabled || false
        });
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingAPI) {
            updateMutation.mutate({ id: editingAPI.id, data: apiForm });
        } else {
            createMutation.mutate(apiForm);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">API Definitions</h3>
                    <p className="text-sm text-slate-600">Manage API schemas, endpoints, and monetization</p>
                </div>
                <Button onClick={() => { resetForm(); setEditingAPI(null); setShowDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New API
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {apis.map(api => (
                    <Card key={api.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{api.api_name}</CardTitle>
                                    <p className="text-xs text-slate-500 mt-1">{api.api_path}</p>
                                </div>
                                <Badge className={
                                    api.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                    api.status === 'deprecated' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-700'
                                }>
                                    {api.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Code className="h-4 w-4 text-slate-600" />
                                    <span>Version: {api.current_version}</span>
                                </div>
                                {api.monetization_enabled && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-emerald-600" />
                                        <span>${api.base_price_per_call}/call</span>
                                        <Badge variant="outline" className="text-xs">Monetized</Badge>
                                    </div>
                                )}
                                <div className="text-xs text-slate-600">
                                    Rate Limit: {api.default_rate_limit_per_minute}/min
                                </div>
                                <div className="text-xs text-slate-600">
                                    Total Calls: {api.total_calls || 0} | Revenue: ${api.total_revenue || 0}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(api)}>
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-red-600"
                                        onClick={() => {
                                            if (confirm('Delete this API?')) {
                                                deleteMutation.mutate(api.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {apis.length === 0 && (
                <div className="text-center py-12">
                    <Code className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No APIs defined yet</p>
                    <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First API
                    </Button>
                </div>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAPI ? 'Edit API' : 'Create API'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>API Name</Label>
                                <Input
                                    value={apiForm.api_name}
                                    onChange={(e) => setApiForm({...apiForm, api_name: e.target.value})}
                                    placeholder="Payment Processing API"
                                />
                            </div>
                            <div>
                                <Label>API Path</Label>
                                <Input
                                    value={apiForm.api_path}
                                    onChange={(e) => setApiForm({...apiForm, api_path: e.target.value})}
                                    placeholder="/v1/payments"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={apiForm.api_description}
                                onChange={(e) => setApiForm({...apiForm, api_description: e.target.value})}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Current Version</Label>
                                <Input
                                    value={apiForm.current_version}
                                    onChange={(e) => setApiForm({...apiForm, current_version: e.target.value})}
                                    placeholder="v1"
                                />
                            </div>
                            <div>
                                <Label>Rate Limit (per minute)</Label>
                                <Input
                                    type="number"
                                    value={apiForm.default_rate_limit_per_minute}
                                    onChange={(e) => setApiForm({...apiForm, default_rate_limit_per_minute: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div>
                                <Label>Authentication Required</Label>
                                <p className="text-xs text-slate-500">Require API keys or tokens</p>
                            </div>
                            <Switch 
                                checked={apiForm.authentication_required}
                                onCheckedChange={(v) => setApiForm({...apiForm, authentication_required: v})}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div>
                                <Label>Enable Monetization</Label>
                                <p className="text-xs text-slate-500">Charge per API call</p>
                            </div>
                            <Switch 
                                checked={apiForm.monetization_enabled}
                                onCheckedChange={(v) => setApiForm({...apiForm, monetization_enabled: v})}
                            />
                        </div>

                        {apiForm.monetization_enabled && (
                            <div>
                                <Label>Price Per Call ($)</Label>
                                <Input
                                    type="number"
                                    step="0.0001"
                                    value={apiForm.base_price_per_call}
                                    onChange={(e) => setApiForm({...apiForm, base_price_per_call: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div>
                                <Label>GraphQL Support</Label>
                                <p className="text-xs text-slate-500">Enable GraphQL federation</p>
                            </div>
                            <Switch 
                                checked={apiForm.graphql_enabled}
                                onCheckedChange={(v) => setApiForm({...apiForm, graphql_enabled: v})}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSubmit}>
                                {editingAPI ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}